import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { RidgelineData } from '@/types';
import { formatCurrency } from "@/lib/utils/data";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface SalaryJobTitleRidgelineProps {
  data: RidgelineData | undefined;
  isLoading: boolean;
}

export default function SalaryJobTitleRidgeline({ data, isLoading }: SalaryJobTitleRidgelineProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [showTopTitles, setShowTopTitles] = useState(true);
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  useEffect(() => {
    if (isLoading || !data || !data.jobTitles.length) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins - increased left margin for y-axis labels
    const margin = { top: 20, right: 20, bottom: 60, left: 120 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom;

    // Create the SVG container with a dark gradient background for futuristic look
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get the top job titles by salary median
    const jobTitlesByMedian = Object.entries(data.salaryRanges)
      .map(([title, range]) => ({
        title,
        median: d3.median(range.values) || 0,
        count: range.values.length,
        min: d3.min(range.values) || 0,
        max: d3.max(range.values) || 0,
        q1: d3.quantile(range.values.sort((a, b) => a - b), 0.25) || 0,
        q3: d3.quantile(range.values.sort((a, b) => a - b), 0.75) || 0,
      }))
      .sort((a, b) => b.median - a.median);

    // Select job titles to display (top 10 if showTopTitles is true, or max 20 for "All")
    const displayedTitles = showTopTitles
      ? jobTitlesByMedian.slice(0, 10) // Top 10 highest paying positions
      : jobTitlesByMedian.slice(0, Math.min(20, jobTitlesByMedian.length)); // Cap at 20 titles for readability

    // Find global min and max for x scale
    let globalMin = d3.min(displayedTitles, d => d.min) || 0;
    let globalMax = d3.max(displayedTitles, d => d.max) || 100000;

    // Add some padding to the domain
    const padding = (globalMax - globalMin) * 0.05;

    // Create the X scale (horizontal bar positions)
    const x = d3.scaleLinear()
      .domain([globalMin - padding, globalMax + padding])
      .range([0, width]);

    // Create the Y scale (vertical positions)
    const y = d3.scaleBand()
      .domain(displayedTitles.map(d => d.title))
      .range([0, height])
      .padding(0.3);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
      .attr('transform', 'translate(-10,5)rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '10px')
      .style('fill', '#e2e8f0');
    
    // Style the axis lines
    g.selectAll('.x-axis path, .x-axis line')
      .style('stroke', '#4b5563');

    // Add Y axis with more distinct job title styling and improved visibility
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .attr('x', -10) // Move labels to the left to ensure visibility
      .style('fill', (d) => {
        // Create unique colors for each job title
        const jobColors = {
          'Data Scientist': '#38bdf8',
          'Software Engineer': '#a78bfa',
          'Product Manager': '#f87171',
          'UX Designer': '#4ade80',
          'Marketing Analyst': '#fb923c',
          'Financial Analyst': '#facc15',
          'Business Analyst': '#34d399',
          'DevOps Engineer': '#f472b6',
          'Sales Manager': '#60a5fa',
          'HR Manager': '#c084fc'
        };
        return jobColors[d as string] || '#e2e8f0';
      });
    
    // Style the axis lines
    g.selectAll('.y-axis path, .y-axis line')
      .style('stroke', '#4b5563');

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f0f9ff')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Salary Distribution by Job Title');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Function to generate gradient color based on salary
    const getGradientColor = (salary: number) => {
      const colorScale = d3.scaleLinear<string>()
        .domain([globalMin, globalMax])
        .range(['#0ea5e9', '#8b5cf6']);
      return colorScale(salary);
    };

    // Create a group for each job title
    const jobGroups = g.selectAll('.job-group')
      .data(displayedTitles)
      .enter()
      .append('g')
      .attr('class', 'job-group')
      .attr('transform', d => `translate(0,${y(d.title)!})`);

    // Add the main bar (min to max)
    jobGroups.append('rect')
      .attr('x', d => x(d.min))
      .attr('y', d => y.bandwidth() / 3)
      .attr('width', d => x(d.max) - x(d.min))
      .attr('height', y.bandwidth() / 3)
      .attr('fill', '#334155')
      .attr('rx', 2);

    // Add the IQR box (Q1 to Q3)
    jobGroups.append('rect')
      .attr('x', d => x(d.q1))
      .attr('y', d => y.bandwidth() / 4)
      .attr('width', d => x(d.q3) - x(d.q1))
      .attr('height', y.bandwidth() / 2)
      .attr('fill', d => {
        // Create a linear gradient for the IQR box
        const gradientId = `gradient-${d.title.replace(/\s+/g, '-').toLowerCase()}`;
        const gradient = svg.append('defs')
          .append('linearGradient')
          .attr('id', gradientId)
          .attr('x1', '0%')
          .attr('x2', '100%')
          .attr('y1', '0%')
          .attr('y2', '0%');
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', '#0ea5e9');
        
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', '#8b5cf6');
        
        return `url(#${gradientId})`;
      })
      .attr('rx', 2)
      .attr('opacity', 0.8)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

    // Add the median line
    jobGroups.append('line')
      .attr('x1', d => x(d.median))
      .attr('x2', d => x(d.median))
      .attr('y1', d => 0)
      .attr('y2', d => y.bandwidth())
      .attr('stroke', '#f0f9ff')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '3,2');

    // Add a glow effect to the median line
    jobGroups.append('line')
      .attr('x1', d => x(d.median))
      .attr('x2', d => x(d.median))
      .attr('y1', d => y.bandwidth() / 4)
      .attr('y2', d => y.bandwidth() * 3/4)
      .attr('stroke', '#f0f9ff')
      .attr('stroke-width', 4)
      .attr('opacity', 0.2)
      .style('filter', 'blur(4px)');

    // Add interactive overlay
    jobGroups.append('rect')
      .attr('x', d => x(d.min))
      .attr('y', 0)
      .attr('width', d => x(d.max) - x(d.min))
      .attr('height', y.bandwidth())
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight this job title
        d3.select(this.parentNode)
          .select('rect:nth-child(2)')
          .attr('opacity', 1)
          .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))');
        
        // Show tooltip with statistics
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-medium text-lg">${d.title}</div>
            <div class="mt-1 text-cyan-300">Median: ${formatCurrency(d.median)}</div>
            <div>Q1-Q3: ${formatCurrency(d.q1)} - ${formatCurrency(d.q3)}</div>
            <div>Range: ${formatCurrency(d.min)} - ${formatCurrency(d.max)}</div>
            <div class="mt-1 text-xs text-gray-300">Based on ${d.count} job postings</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', function() {
        // Restore original style
        d3.select(this.parentNode)
          .select('rect:nth-child(2)')
          .attr('opacity', 0.8)
          .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');
        
        tooltip.style('opacity', 0);
      });

    // Add labels for min, median, and max
    jobGroups.append('text')
      .attr('x', d => x(d.min) - 5)
      .attr('y', y.bandwidth() / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '8px')
      .text(d => formatCurrency(d.min));
    
    jobGroups.append('text')
      .attr('x', d => x(d.max) + 5)
      .attr('y', y.bandwidth() / 2)
      .attr('text-anchor', 'start')
      .attr('alignment-baseline', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '8px')
      .text(d => formatCurrency(d.max));

    // Add circles for job count indicators
    jobGroups.append('circle')
      .attr('cx', width + 15)
      .attr('cy', y.bandwidth() / 2)
      .attr('r', d => Math.min(Math.max(3, Math.sqrt(d.count) / 2), 8))
      .attr('fill', '#0ea5e9')
      .attr('opacity', 0.8)
      .attr('stroke', '#0c4a6e')
      .attr('stroke-width', 1);

    // Legend for job count indicator
    g.append('text')
      .attr('x', width + 15)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text('Circle size = Job count');

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, showTopTitles, redrawTrigger]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 h-full flex flex-col">
        <div className="p-2 border-b border-gray-700 flex items-center justify-between">
          <Skeleton className="h-5 w-1/3 bg-gray-700" />
          <div className="flex items-center space-x-1">
            <Skeleton className="h-5 w-14 bg-gray-700" />
          </div>
        </div>
        <div className="p-2 flex-grow">
          <Skeleton className="h-full w-full bg-gray-700/50 rounded" />
        </div>
      </div>
    );
  }

  // Handle the case when data is undefined
  if (!data || !data.jobTitles || data.jobTitles.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 h-full flex flex-col">
        <div className="p-2 border-b border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400">Salary by Job Title</h3>
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-4">
            <div className="text-red-400 text-sm mb-1">No Data Available</div>
            <p className="text-gray-500 text-xs">Try adjusting your filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow overflow-hidden border border-gray-700 h-full flex flex-col">
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Salary by Job Title
        </h3>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className={`h-6 px-2 py-0 text-xs ${!showTopTitles ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
            onClick={() => {
              setShowTopTitles(false);
              setRedrawTrigger(prev => prev + 1);
            }}
          >
            More
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={`h-6 px-2 py-0 text-xs ${showTopTitles ? 'bg-blue-900/30 text-blue-400' : 'text-gray-400'}`}
            onClick={() => {
              setShowTopTitles(true);
              setRedrawTrigger(prev => prev + 1);
            }}
          >
            Top 10
          </Button>
        </div>
      </div>
      <div className="p-2 flex-grow flex flex-col">
        <div className="relative flex-grow">
          <svg 
            ref={svgRef} 
            width="100%" 
            height="100%" 
            className="bg-gray-800/30 rounded"
          ></svg>
          <div 
            ref={tooltipRef}
            className="absolute opacity-0 bg-gray-900 p-2 rounded shadow-xl border border-gray-700 text-xs pointer-events-none z-10 text-white"
          ></div>
        </div>
      </div>
    </div>
  );
}
