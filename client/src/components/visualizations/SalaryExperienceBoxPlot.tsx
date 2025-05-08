import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { BoxPlotData, JobListing } from '@/types';
import { formatCurrency } from "@/lib/utils/data";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface SalaryExperienceBoxPlotProps {
  data: BoxPlotData | undefined;
  isLoading: boolean;
}

export default function SalaryExperienceBoxPlot({ data, isLoading }: SalaryExperienceBoxPlotProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [activeFilter, setActiveFilter] = useState<'Outliers' | 'Quartiles' | 'Median'>('Outliers');

  useEffect(() => {
    if (isLoading || !data || !data.experienceLevels.length) return;

    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Set up dimensions and margins
    const margin = { top: 30, right: 30, bottom: 70, left: 60 };
    const width = svgRef.current!.clientWidth - margin.left - margin.right;
    const height = svgRef.current!.clientHeight - margin.top - margin.bottom;

    // Create the SVG container
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create the X scale
    const x = d3.scaleBand()
      .domain(data.experienceLevels)
      .range([0, width])
      .paddingInner(0.3)
      .paddingOuter(0.2);

    // Find min and max salary across all experience levels
    let minSalary = Infinity;
    let maxSalary = -Infinity;

    data.experienceLevels.forEach(level => {
      const stats = data.salaries[level];
      minSalary = Math.min(minSalary, stats.min);
      maxSalary = Math.max(maxSalary, stats.max);
      
      // Also check outliers
      stats.outliers.forEach(outlier => {
        minSalary = Math.min(minSalary, outlier.value);
        maxSalary = Math.max(maxSalary, outlier.value);
      });
    });

    // Add a 10% padding to the min and max
    const yPadding = (maxSalary - minSalary) * 0.1;
    
    // Create the Y scale
    const y = d3.scaleLinear()
      .domain([minSalary - yPadding, maxSalary + yPadding])
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
      .call(d3.axisLeft(y).tickFormat(d => formatCurrency(+d)));

    // Add title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Salary Distribution by Experience Level');

    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);

    // Draw the boxplots
    data.experienceLevels.forEach(level => {
      const stats = data.salaries[level];
      const boxWidth = x.bandwidth();
      const boxX = x(level)!;
      
      // Draw the box
      g.append('rect')
        .attr('x', boxX)
        .attr('y', y(stats.q3))
        .attr('width', boxWidth)
        .attr('height', y(stats.q1) - y(stats.q3))
        .attr('stroke', 'black')
        .attr('fill', '#69b3a2')
        .attr('fill-opacity', 0.3)
        .attr('stroke-width', 1)
        .on('mouseover', function() {
          tooltip
            .style('opacity', 1)
            .html(`
              <div class="font-medium">${level}</div>
              <div>Median: ${formatCurrency(stats.median)}</div>
              <div>Q1-Q3: ${formatCurrency(stats.q1)} - ${formatCurrency(stats.q3)}</div>
              <div>Range: ${formatCurrency(stats.min)} - ${formatCurrency(stats.max)}</div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          tooltip.style('opacity', 0);
        });
      
      // Draw the median line
      g.append('line')
        .attr('x1', boxX)
        .attr('x2', boxX + boxWidth)
        .attr('y1', y(stats.median))
        .attr('y2', y(stats.median))
        .attr('stroke', 'black')
        .attr('stroke-width', 2)
        .style('opacity', activeFilter === 'Median' || activeFilter === 'Quartiles' ? 1 : 0.5);
      
      // Draw the whiskers and outliers only if showing outliers or quartiles
      if (activeFilter === 'Outliers' || activeFilter === 'Quartiles') {
        // Draw the min whisker
        g.append('line')
          .attr('x1', boxX + boxWidth / 2)
          .attr('x2', boxX + boxWidth / 2)
          .attr('y1', y(stats.q1))
          .attr('y2', y(stats.min))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
        
        g.append('line')
          .attr('x1', boxX + boxWidth * 0.25)
          .attr('x2', boxX + boxWidth * 0.75)
          .attr('y1', y(stats.min))
          .attr('y2', y(stats.min))
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
        
        // Draw the max whisker
        g.append('line')
          .attr('x1', boxX + boxWidth / 2)
          .attr('x2', boxX + boxWidth / 2)
          .attr('y1', y(stats.q3))
          .attr('y2', y(stats.max))
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');
        
        g.append('line')
          .attr('x1', boxX + boxWidth * 0.25)
          .attr('x2', boxX + boxWidth * 0.75)
          .attr('y1', y(stats.max))
          .attr('y2', y(stats.max))
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
      }
      
      // Draw the outliers
      if (activeFilter === 'Outliers') {
        stats.outliers.forEach(outlier => {
          g.append('circle')
            .attr('cx', boxX + boxWidth / 2 + (Math.random() - 0.5) * boxWidth * 0.8)
            .attr('cy', y(outlier.value))
            .attr('r', 4)
            .attr('fill', 'red')
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .style('cursor', 'pointer')
            .on('mouseover', function() {
              tooltip
                .style('opacity', 1)
                .html(`
                  <div class="font-medium">${outlier.jobTitle}</div>
                  <div>${outlier.companyName}</div>
                  <div class="font-bold">${formatCurrency(outlier.value)}</div>
                  <div class="text-sm text-gray-600">(Click for details)</div>
                `);
            })
            .on('mousemove', function(event) {
              tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`);
            })
            .on('mouseout', function() {
              tooltip.style('opacity', 0);
            })
            .on('click', function() {
              // Show job details modal (could be implemented)
              console.log('Job details for:', outlier.id);
            });
        });
      }
    });

    // Add responsive resize handler
    const handleResize = () => {
      // This would normally redraw the chart on resize
      // For simplicity, we'll just reload the component
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, isLoading, activeFilter]);

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
            <Skeleton className="h-6 w-20 bg-gray-700" />
            <Skeleton className="h-6 w-16 bg-gray-700" />
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
  if (!data || !data.experienceLevels || data.experienceLevels.length === 0) {
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
          <span className="material-icons text-cyan-400 mr-2">bar_chart</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Salary vs. Experience Level
          </span>
        </h2>
        <p className="text-sm text-gray-400">Box plot showing salary distributions by experience level</p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button 
            size="sm"
            variant="outline"
            className={`${
              activeFilter === 'Median'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setActiveFilter('Median')}
          >
            Median
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className={`${
              activeFilter === 'Quartiles'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setActiveFilter('Quartiles')}
          >
            Quartiles
          </Button>
          <Button 
            size="sm"
            variant="outline"
            className={`${
              activeFilter === 'Outliers'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setActiveFilter('Outliers')}
          >
            Outliers
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
          <p>Hover over boxes to see detailed salary information for each experience level.</p>
          <p>Click on outliers to view specific job details.</p>
        </div>
      </div>
    </div>
  );
}
