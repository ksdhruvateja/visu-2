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

  useEffect(() => {
    if (isLoading || !data || !data.jobTitles.length) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 50, right: 30, bottom: 30, left: 160 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom;

    // Create the SVG container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get the top job titles by salary median
    const jobTitlesByMedian = Object.entries(data.salaryRanges)
      .map(([title, range]) => ({
        title,
        median: d3.median(range.values) || 0,
        count: range.values.length
      }))
      .sort((a, b) => b.median - a.median);

    // Select job titles to display (top 10 if showTopTitles is true, or all if false)
    const displayedTitles = showTopTitles
      ? jobTitlesByMedian.slice(0, 10).map(item => item.title)
      : data.jobTitles;

    // Calculate overlap for each distribution
    const overlap = 0.7;
    const plotHeight = height / displayedTitles.length;
    
    // Find global min and max for x scale
    let globalMin = Infinity;
    let globalMax = -Infinity;
    
    displayedTitles.forEach(title => {
      const range = data.salaryRanges[title];
      globalMin = Math.min(globalMin, range.min);
      globalMax = Math.max(globalMax, range.max);
    });

    // Add some padding to the domain
    const padding = (globalMax - globalMin) * 0.05;

    // Create the X scale
    const x = d3.scaleLinear()
      .domain([globalMin - padding, globalMax + padding])
      .range([0, width]);

    // Create the Y scale (for positioning the ridges)
    const y = d3.scalePoint()
      .domain(displayedTitles)
      .range([0, height])
      .padding(0.5);

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => formatCurrency(+d)))
      .selectAll('text')
      .style('font-size', '12px');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('font-size', '12px');

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Salary Distribution by Job Title');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Create the area generator for the distributions
    const area = d3.area<number>()
      .x(d => x(d))
      .y0(0)
      .y1(d => -d * plotHeight * overlap);

    // Function to create kernel density estimation
    const kde = (kernel: (v: number) => number, thresholds: number[], data: number[]) => {
      return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d)) || 0]);
    };

    // Epanechnikov kernel function
    const epanechnikov = (bandwidth: number) => {
      return (x: number) => {
        return Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
      };
    };

    // Create distributions for each job title
    displayedTitles.forEach(title => {
      const values = data.salaryRanges[title].values;
      const yPosition = y(title) || 0;
      
      // Generate KDE
      const bandwidth = 10000; // Adjust bandwidth for smoothness
      const thresholds = x.ticks(100);
      const density = kde(epanechnikov(bandwidth), thresholds, values);
      
      // Scale the density to a reasonable height
      const maxDensity = d3.max(density, d => d[1]) || 1;
      const scaledDensity = density.map(d => [d[0], d[1] / maxDensity * 0.8]);
      
      // Create a path for the density
      const lineGenerator = d3.line()
        .x(d => x(d[0] as number))
        .y(d => yPosition - (d[1] as number) * plotHeight * overlap)
        .curve(d3.curveBasis);
      
      const areaGenerator = d3.area()
        .x(d => x(d[0] as number))
        .y0(yPosition)
        .y1(d => yPosition - (d[1] as number) * plotHeight * overlap)
        .curve(d3.curveBasis);
      
      // Add the area
      g.append('path')
        .datum(scaledDensity as [number, number][])
        .attr('fill', 'steelblue')
        .attr('fill-opacity', 0.7)
        .attr('stroke', 'none')
        .attr('d', areaGenerator)
        .on('mouseover', function() {
          // Highlight this distribution
          d3.select(this)
            .attr('fill-opacity', 0.9)
            .attr('stroke', 'black')
            .attr('stroke-width', 1);
          
          // Show tooltip with statistics
          const median = d3.median(values) || 0;
          const mean = d3.mean(values) || 0;
          const min = d3.min(values) || 0;
          const max = d3.max(values) || 0;
          
          tooltip
            .style('opacity', 1)
            .html(`
              <div class="font-medium">${title}</div>
              <div>Median: ${formatCurrency(median)}</div>
              <div>Mean: ${formatCurrency(mean)}</div>
              <div>Range: ${formatCurrency(min)} - ${formatCurrency(max)}</div>
              <div>Count: ${values.length} jobs</div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          // Restore original style
          d3.select(this)
            .attr('fill-opacity', 0.7)
            .attr('stroke', 'none');
          
          tooltip.style('opacity', 0);
        });
    });

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, showTopTitles]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <Skeleton className="h-6 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-700" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Skeleton className="h-6 w-20 bg-gray-700" />
            <Skeleton className="h-6 w-24 bg-gray-700" />
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
  if (!data || !data.jobTitles || data.jobTitles.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 p-6 text-center">
        <div className="p-8">
          <span className="material-icons text-red-400 text-4xl mb-4">error_outline</span>
          <h3 className="text-white font-bold text-lg mb-2">No Data Available</h3>
          <p className="text-gray-400">Unable to load salary distribution data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <span className="material-icons text-cyan-400 mr-2">trending_up</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Salary Range by Job Title
          </span>
        </h2>
        <p className="text-sm text-gray-400">Ridgeline plot showing salary distributions by job title</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button
            size="sm"
            variant="outline"
            className={`${
              !showTopTitles
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setShowTopTitles(false)}
          >
            All Titles
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${
              showTopTitles
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setShowTopTitles(true)}
          >
            Top 10 Titles
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
          <p>Hover over distributions to highlight and see detailed statistics.</p>
          <p>Drag to zoom into specific salary ranges.</p>
        </div>
      </div>
    </div>
  );
}
