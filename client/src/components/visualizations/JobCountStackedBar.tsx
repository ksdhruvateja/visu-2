import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { StackedBarData } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

interface JobCountStackedBarProps {
  data: StackedBarData;
  isLoading: boolean;
}

export default function JobCountStackedBar({ data, isLoading }: JobCountStackedBarProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [activeEmploymentType, setActiveEmploymentType] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !data || !data.industries.length) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 120, bottom: 90, left: 60 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom;

    // Create the SVG container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort industries by total count
    const industriesByTotal = data.industries.map(industry => ({
      industry,
      total: data.employmentTypes.reduce((sum, type) => sum + data.data[industry][type], 0)
    })).sort((a, b) => b.total - a.total);

    const sortedIndustries = industriesByTotal.map(d => d.industry);

    // Create the X scale
    const x = d3.scaleBand()
      .domain(sortedIndustries)
      .range([0, width])
      .padding(0.3);

    // Prepare the stacked data
    const stackedData = d3.stack<string>()
      .keys(data.employmentTypes)
      .value((industry, type) => data.data[industry][type])
      (sortedIndustries);

    // Find the maximum total count
    const maxTotal = d3.max(industriesByTotal, d => d.total) || 0;

    // Create the Y scale
    const y = d3.scaleLinear()
      .domain([0, maxTotal * 1.1])
      .range([height, 0]);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
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
      .text('Job Count by Industry and Employment Type');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Employment type colors
    const typeColors: Record<string, string> = {
      'Full-time': '#4f46e5',
      'Part-time': '#10b981',
      'Contract': '#f59e0b',
      'Temporary': '#ef4444',
      'Internship': '#8b5cf6'
    };

    // Draw the stacked bars
    stackedData.forEach((layer, i) => {
      const employmentType = data.employmentTypes[i];
      const color = typeColors[employmentType] || d3.schemeCategory10[i % 10];
      
      const isActive = activeEmploymentType === null || activeEmploymentType === employmentType;
      
      g.selectAll(`rect.${employmentType.toLowerCase().replace('-', '')}`)
        .data(layer)
        .enter()
        .append('rect')
        .attr('class', `${employmentType.toLowerCase().replace('-', '')}`)
        .attr('x', d => x(d.data)!)
        .attr('y', d => isActive ? y(d[1]) : y(d[0]))
        .attr('height', d => isActive ? y(d[0]) - y(d[1]) : 0)
        .attr('width', x.bandwidth())
        .attr('fill', color)
        .attr('opacity', isActive ? 0.8 : 0.3)
        .attr('stroke', isActive ? 'white' : 'none')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const count = d[1] - d[0];
          const industry = d.data;
          
          d3.select(this)
            .attr('opacity', 1)
            .attr('stroke', 'black');
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div class="font-medium">${industry}</div>
              <div>${employmentType}: ${count} jobs</div>
              <div>Click to filter by employment type</div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('opacity', isActive ? 0.8 : 0.3)
            .attr('stroke', isActive ? 'white' : 'none');
          
          tooltip.style('opacity', 0);
        })
        .on('click', function() {
          setActiveEmploymentType(activeEmploymentType === employmentType ? null : employmentType);
        });
    });

    // Add legend
    const legend = g.append('g')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 10)
      .attr('text-anchor', 'start')
      .selectAll('g')
      .data(data.employmentTypes)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${width + 10},${i * 20})`)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        setActiveEmploymentType(activeEmploymentType === d ? null : d);
      });

    legend.append('rect')
      .attr('x', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => typeColors[d] || d3.schemeCategory10[data.employmentTypes.indexOf(d) % 10])
      .attr('opacity', d => activeEmploymentType === null || activeEmploymentType === d ? 0.8 : 0.3);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 7.5)
      .attr('dy', '0.32em')
      .text(d => d);

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, activeEmploymentType]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2 mt-2" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-64 sm:h-80 w-full" />
          <div className="mt-4">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5 mt-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="material-icons text-primary mr-2">stacked_bar_chart</span>
          Job Count by Industry and Employment Type
        </h2>
        <p className="text-sm text-gray-500">Stacked bar chart displaying job counts across industries</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <button 
            className={`text-xs ${activeEmploymentType === null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} py-1 px-2 rounded hover:bg-gray-200 transition`}
            onClick={() => setActiveEmploymentType(null)}
          >
            All Types
          </button>
          <button 
            className={`text-xs ${activeEmploymentType !== null ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} py-1 px-2 rounded hover:bg-gray-200 transition`}
            onClick={() => setActiveEmploymentType(activeEmploymentType === null ? 'Full-time' : activeEmploymentType)}
          >
            By Employment Type
          </button>
        </div>
        <div className="relative">
          <svg 
            ref={svgRef} 
            className="h-64 sm:h-80 w-full border border-gray-200 rounded-lg bg-gray-50"
          ></svg>
          <div 
            ref={tooltipRef}
            className="absolute opacity-0 bg-white p-2 rounded shadow-lg border border-gray-200 text-sm pointer-events-none z-10"
          ></div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          <p>Click on bar segments to filter by employment type.</p>
          <p>Hover over segments to see detailed job counts.</p>
        </div>
      </div>
    </div>
  );
}
