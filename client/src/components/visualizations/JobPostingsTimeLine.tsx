import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { TimeLineData } from '@/types';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface JobPostingsTimeLineProps {
  data: TimeLineData | undefined;
  isLoading: boolean;
}

export default function JobPostingsTimeLine({ data, isLoading }: JobPostingsTimeLineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const brushRef = useRef<SVGGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [timeInterval, setTimeInterval] = useState<'Monthly' | 'Weekly' | 'Quarterly'>('Monthly');
  const [visibleExperienceLevels, setVisibleExperienceLevels] = useState<string[]>([]);
  const [brushExtent, setBrushExtent] = useState<[Date, Date] | null>(null);

  // Set visible experience levels when data changes
  useEffect(() => {
    if (!isLoading && data && data.experienceLevels && data.experienceLevels.length > 0) {
      setVisibleExperienceLevels(data.experienceLevels);
    }
  }, [data, isLoading]);

  // Effect for aggregating data by the selected time interval
  const getAggregatedData = () => {
    if (!data || !data.timePoints || !data.experienceLevels) return null;
    
    // Parse dates
    const timePoints = data.timePoints.map(date => date);
    
    // If we need to re-aggregate for weekly or quarterly, we would do it here
    // For this implementation, we'll keep the existing monthly aggregation
    
    return {
      timePoints,
      experienceLevels: data.experienceLevels,
      data: data.data
    };
  };

  const aggregatedData = getAggregatedData();

  useEffect(() => {
    if (isLoading || !aggregatedData) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 120, bottom: 70, left: 60 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom - 50; // Extra space for brush

    // Create the SVG container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = (dateString: string) => {
      // Assume format is YYYY-MM
      const [year, month] = dateString.split('-').map(Number);
      return new Date(year, month - 1);
    };
    
    // Create X scale
    const timePoints = aggregatedData.timePoints.map(parseDate);
    const x = d3.scaleTime()
      .domain(d3.extent(timePoints) as [Date, Date])
      .range([0, width]);
    
    // Apply brush extent if set
    if (brushExtent) {
      x.domain(brushExtent);
    }

    // Find the maximum count for Y scale
    let maxCount = 0;
    aggregatedData.experienceLevels.forEach(level => {
      aggregatedData.timePoints.forEach(time => {
        const count = aggregatedData.data[level][time] || 0;
        maxCount = Math.max(maxCount, count);
      });
    });

    // Create Y scale
    const y = d3.scaleLinear()
      .domain([0, maxCount * 1.1])
      .range([height, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => format(d as Date, 'MMM yyyy')))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5));

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Job Postings Over Time by Experience Level');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Experience level colors with futuristic palette
    const levelColors: Record<string, string> = {
      'Entry-level': '#3B82F6',
      'Mid-level': '#06B6D4',
      'Senior-level': '#10B981',
      'Executive': '#8B5CF6',
      'Internship': '#F97316'
    };

    // Draw lines for each experience level
    aggregatedData.experienceLevels.forEach(level => {
      if (!visibleExperienceLevels.includes(level)) return;
      
      // Create the data points for this line
      const lineData = aggregatedData.timePoints.map(time => ({
        time,
        count: aggregatedData.data[level][time] || 0,
        level // Store the level with each data point
      }));
      
      // Create a custom line generator for this specific level
      const linePath = d3.line<{time: string, count: number, level: string}>()
        .x(d => x(parseDate(d.time)))
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);
      
      // Draw the line
      g.append('path')
        .datum(lineData)
        .attr('fill', 'none')
        .attr('stroke', levelColors[level] || d3.schemeCategory10[aggregatedData.experienceLevels.indexOf(level) % 10])
        .attr('stroke-width', 2.5)
        .style('filter', 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))')
        .attr('d', linePath);
      
      // Add dots for each data point
      g.selectAll(`dot-${level.replace(/\s+/g, '-')}`)
        .data(lineData)
        .enter()
        .append('circle')
        .attr('cx', d => x(parseDate(d.time)))
        .attr('cy', d => y(d.count))
        .attr('r', 4)
        .attr('fill', levelColors[level] || d3.schemeCategory10[aggregatedData.experienceLevels.indexOf(level) % 10])
        .attr('stroke', '#2d3748')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('r', 6)
            .attr('stroke', '#fff')
            .style('filter', 'drop-shadow(0px 0px 6px rgba(255,255,255,0.5))');
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div class="font-medium">${d.level}</div>
              <div>${format(parseDate(d.time), 'MMMM yyyy')}</div>
              <div>Job Count: ${d.count}</div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('r', 4)
            .attr('stroke', '#2d3748')
            .style('filter', 'none');
          
          tooltip.style('opacity', 0);
        });
    });

    // Add legend
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(aggregatedData.experienceLevels)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${width + 10},${i * 20})`)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        const isCurrentlyVisible = visibleExperienceLevels.includes(d);
        if (isCurrentlyVisible && visibleExperienceLevels.length > 1) {
          setVisibleExperienceLevels(visibleExperienceLevels.filter(l => l !== d));
        } else if (!isCurrentlyVisible) {
          setVisibleExperienceLevels([...visibleExperienceLevels, d]);
        }
      });

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('fill', d => levelColors[d] || d3.schemeCategory10[aggregatedData.experienceLevels.indexOf(d) % 10])
      .attr('opacity', d => visibleExperienceLevels.includes(d) ? 1 : 0.3);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 7.5)
      .attr('dy', '0.32em')
      .style('fill', '#e2e8f0')
      .text(d => d);

    // Add brush component for zooming
    const brushHeight = 40;
    const brushArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top + height + 30})`);

    // Create a copy of the X scale for the brush
    const xBrush = d3.scaleTime()
      .domain(d3.extent(timePoints) as [Date, Date])
      .range([0, width]);

    // Create an area generator for the brush background
    const brushAreaGenerator = d3.area<string>()
      .x(d => xBrush(parseDate(d)))
      .y0(brushHeight)
      .y1(d => {
        // Sum counts across all experience levels for this time point
        let total = 0;
        aggregatedData.experienceLevels.forEach(lvl => {
          total += aggregatedData.data[lvl][d] || 0;
        });
        return brushHeight - (total / maxCount) * brushHeight;
      })
      .curve(d3.curveMonotoneX);

    // Add the area
    brushArea.append('path')
      .datum(aggregatedData.timePoints)
      .attr('fill', 'rgba(56, 189, 248, 0.3)')
      .attr('stroke', 'rgba(56, 189, 248, 0.6)')
      .attr('stroke-width', 1)
      .attr('d', brushAreaGenerator);

    // Add X axis for brush
    brushArea.append('g')
      .attr('transform', `translate(0,${brushHeight})`)
      .call(d3.axisBottom(xBrush).tickSize(0).tickFormat(() => ''));

    // Create the brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, brushHeight]])
      .on('end', (event) => {
        if (!event.selection) {
          // If the brush is cleared, reset to the full domain
          setBrushExtent(null);
          return;
        }
        
        // Convert brush selection from pixels to dates
        const [x0, x1] = event.selection as [number, number];
        const newDomain = [xBrush.invert(x0), xBrush.invert(x1)] as [Date, Date];
        
        // Update the brush extent
        setBrushExtent(newDomain);
      });

    // Add the brush to the SVG
    const brushG = brushArea.append('g')
      .attr('class', 'brush')
      .call(brush);
    
    // If there's an existing brush extent, set the brush to that position
    if (brushExtent) {
      brushG.call(brush.move, [xBrush(brushExtent[0]), xBrush(brushExtent[1])]);
    }

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, visibleExperienceLevels, timeInterval, brushExtent, aggregatedData]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <Skeleton className="h-6 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-700" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Skeleton className="h-6 w-16 bg-gray-700" />
            <Skeleton className="h-6 w-16 bg-gray-700" />
            <Skeleton className="h-6 w-20 bg-gray-700" />
          </div>
          <Skeleton className="h-64 sm:h-80 w-full bg-gray-700" />
          <div className="mt-4">
            <Skeleton className="h-3 w-full bg-gray-700" />
            <Skeleton className="h-3 w-4/5 mt-2 bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  // Handle the case when data is undefined
  if (!data || !data.experienceLevels || !data.timePoints) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 p-6 text-center">
        <div className="p-8">
          <span className="material-icons text-red-400 text-4xl mb-4">error_outline</span>
          <h3 className="text-white font-bold text-lg mb-2">No Data Available</h3>
          <p className="text-gray-400">Unable to load timeline data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <span className="material-icons text-cyan-400 mr-2">timeline</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Job Postings Over Time
          </span>
        </h2>
        <p className="text-sm text-gray-400">Multi-line chart tracking job posting trends by experience level</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button
            size="sm"
            variant="outline"
            className={`${
              timeInterval === 'Weekly'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setTimeInterval('Weekly')}
          >
            Weekly
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${
              timeInterval === 'Monthly'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setTimeInterval('Monthly')}
          >
            Monthly
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${
              timeInterval === 'Quarterly'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setTimeInterval('Quarterly')}
          >
            Quarterly
          </Button>
        </div>
        <div className="relative">
          <svg 
            ref={svgRef} 
            className="h-64 sm:h-80 w-full border border-gray-700 rounded-lg bg-gray-800"
          ></svg>
          <div 
            ref={tooltipRef}
            className="absolute opacity-0 bg-gray-900 p-3 rounded shadow-xl border border-gray-700 text-sm pointer-events-none z-10 text-white"
          ></div>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          <p>Use the brush tool below the chart to zoom into specific time periods.</p>
          <p>Click on legend items to toggle experience level visibility.</p>
        </div>
      </div>
    </div>
  );
}
