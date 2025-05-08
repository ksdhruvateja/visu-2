import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { ScatterPlotData } from '@/types';
import { formatCurrency, formatDate } from "@/lib/utils/data";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface SalaryPostingDateScatterProps {
  data: ScatterPlotData | undefined;
  isLoading: boolean;
}

export default function SalaryPostingDateScatter({ data, isLoading }: SalaryPostingDateScatterProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [groupByIndustry, setGroupByIndustry] = useState(false);

  useEffect(() => {
    if (isLoading || !data || !data.points.length) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 30, bottom: 50, left: 70 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom;

    // Create the SVG container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const dateValues = data.points.map(d => parseDate(d.date.split('T')[0])!);
    const salaryValues = data.points.map(d => d.salary);

    // Create the X scale (time)
    const x = d3.scaleTime()
      .domain(d3.extent(dateValues) as [Date, Date])
      .range([0, width]);

    // Create the Y scale (salary)
    const y = d3.scaleLinear()
      .domain([0, d3.max(salaryValues) as number * 1.1])
      .range([height, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X axis label
    g.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Posting Date');

    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Salary (USD)');

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Correlation Between Salary and Posting Date');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Create color scale for industries if grouping by industry
    const industries = [...new Set(data.points.map(d => d.industry))];
    const colorScale = d3.scaleOrdinal<string>()
      .domain(industries)
      .range(d3.schemeCategory10);

    // Add the scatter plot points
    g.selectAll('circle')
      .data(data.points)
      .enter()
      .append('circle')
      .attr('cx', d => x(parseDate(d.date.split('T')[0])!))
      .attr('cy', d => y(d.salary))
      .attr('r', 4)
      .attr('fill', d => groupByIndustry ? colorScale(d.industry) : 'steelblue')
      .attr('opacity', 0.7)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('r', 6)
          .attr('stroke', '#000')
          .attr('stroke-width', 1);
          
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-medium">${d.jobTitle}</div>
            <div>${d.companyName}</div>
            <div>Industry: ${d.industry}</div>
            <div>Salary: ${formatCurrency(d.salary)}</div>
            <div>Posted: ${formatDate(d.date)}</div>
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
          .attr('stroke', '#fff');
          
        tooltip.style('opacity', 0);
      });

    // Add trend line if enabled
    if (showTrendLine && data.trendLine.length === 2) {
      const trendX1 = parseDate(data.trendLine[0].date.split('T')[0])!;
      const trendY1 = data.trendLine[0].salary;
      const trendX2 = parseDate(data.trendLine[1].date.split('T')[0])!;
      const trendY2 = data.trendLine[1].salary;
      
      g.append('line')
        .attr('x1', x(trendX1))
        .attr('y1', y(trendY1))
        .attr('x2', x(trendX2))
        .attr('y2', y(trendY2))
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');
    }

    // Add legend if grouping by industry
    if (groupByIndustry) {
      const legend = g.append('g')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('text-anchor', 'start')
        .selectAll('g')
        .data(industries.slice(0, 10)) // Limit to top 10 for space
        .enter().append('g')
        .attr('transform', (d, i) => `translate(${width - 100},${i * 20})`);

      legend.append('rect')
        .attr('x', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => colorScale(d));

      legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.32em')
        .text(d => d);
    }

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, showTrendLine, groupByIndustry]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <Skeleton className="h-6 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-700" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Skeleton className="h-6 w-24 bg-gray-700" />
            <Skeleton className="h-6 w-28 bg-gray-700" />
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
  if (!data || !data.points || data.points.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 p-6 text-center">
        <div className="p-8">
          <span className="material-icons text-red-400 text-4xl mb-4">error_outline</span>
          <h3 className="text-white font-bold text-lg mb-2">No Data Available</h3>
          <p className="text-gray-400">Unable to load salary trend data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <span className="material-icons text-cyan-400 mr-2">scatter_plot</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Correlation Between Salary and Posting Date
          </span>
        </h2>
        <p className="text-sm text-gray-400">Scatter plot with trend line showing salary trends over time</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button 
            size="sm"
            variant="outline"
            className={`${
              showTrendLine
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setShowTrendLine(!showTrendLine)}
          >
            Show Trend Line
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className={`${
              groupByIndustry
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setGroupByIndustry(!groupByIndustry)}
          >
            Group by Industry
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
          <p>Hover over points to see job details.</p>
          <p>The trend line indicates the general salary direction over time.</p>
        </div>
      </div>
    </div>
  );
}
