import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from "@/lib/utils/data";

// Simple world map data structure (simplified for demonstration)
interface WorldMapData {
  regions: {
    [key: string]: {
      jobCount: number;
      avgSalary: number;
      growthRate: number;
    }
  };
  maxJobCount: number;
  maxSalary: number;
  maxGrowthRate: number;
}

interface GeographicMapChartProps {
  isLoading: boolean;
}

// Simple map coordinates (very simplified world regions)
const regions = [
  { name: "North America", cx: 200, cy: 150, r: 50 },
  { name: "South America", cx: 250, cy: 300, r: 40 },
  { name: "Europe", cx: 450, cy: 150, r: 45 },
  { name: "Africa", cx: 450, cy: 250, r: 45 },
  { name: "Asia", cx: 650, cy: 200, r: 60 },
  { name: "Australia", cx: 750, cy: 350, r: 35 }
];

export default function GeographicMapChart({ isLoading }: GeographicMapChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dataType, setDataType] = useState<'jobCount' | 'avgSalary' | 'growthRate'>('jobCount');
  
  // Simulated data (this would come from an API in a real app)
  const [mapData, setMapData] = useState<WorldMapData>({
    regions: {
      "North America": { jobCount: 3500, avgSalary: 85000, growthRate: 5.2 },
      "South America": { jobCount: 1800, avgSalary: 52000, growthRate: 3.8 },
      "Europe": { jobCount: 4200, avgSalary: 70000, growthRate: 4.1 },
      "Africa": { jobCount: 1200, avgSalary: 45000, growthRate: 7.5 },
      "Asia": { jobCount: 5000, avgSalary: 60000, growthRate: 8.3 },
      "Australia": { jobCount: 980, avgSalary: 78000, growthRate: 2.9 }
    },
    maxJobCount: 5000,
    maxSalary: 85000,
    maxGrowthRate: 8.3
  });

  useEffect(() => {
    if (isLoading) return;
    
    // Clear any existing visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    
    // Define dimensions
    const width = svgRef.current!.clientWidth;
    const height = svgRef.current!.clientHeight;
    
    // Create the background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#1a202c')
      .attr('rx', 8);
    
    // Add a subtle grid pattern
    const gridSize = 20;
    const grid = svg.append('g')
      .attr('class', 'grid');
      
    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      grid.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', 'rgba(45, 55, 72, 0.3)')
        .attr('stroke-width', 0.5);
    }
    
    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      grid.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', 'rgba(45, 55, 72, 0.3)')
        .attr('stroke-width', 0.5);
    }
    
    // Create color scale based on data type
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 1])
      .range(['rgba(56, 189, 248, 0.2)', 'rgba(56, 189, 248, 0.9)']);
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);
    
    // Draw regions (simplified world map)
    regions.forEach(region => {
      const regionData = mapData.regions[region.name];
      
      // Normalize the value based on the selected data type
      let normalizedValue: number;
      let displayValue: string;
      
      switch(dataType) {
        case 'avgSalary':
          normalizedValue = regionData.avgSalary / mapData.maxSalary;
          displayValue = formatCurrency(regionData.avgSalary);
          break;
        case 'growthRate':
          normalizedValue = regionData.growthRate / mapData.maxGrowthRate;
          displayValue = `${regionData.growthRate}%`;
          break;
        case 'jobCount':
        default:
          normalizedValue = regionData.jobCount / mapData.maxJobCount;
          displayValue = regionData.jobCount.toLocaleString();
      }
      
      // Add region
      svg.append('circle')
        .attr('cx', region.cx)
        .attr('cy', region.cy)
        .attr('r', region.r)
        .attr('fill', colorScale(normalizedValue))
        .attr('stroke', 'rgba(56, 189, 248, 0.8)')
        .attr('stroke-width', 1.5)
        .style('filter', 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))')
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .style('filter', 'drop-shadow(0px 6px 8px rgba(0,0,0,0.5))');
            
          let tooltipContent = `
            <div class="font-medium text-white">${region.name}</div>
          `;
          
          if (dataType === 'jobCount') {
            tooltipContent += `
              <div class="text-cyan-300">Jobs: ${regionData.jobCount.toLocaleString()}</div>
            `;
          } else if (dataType === 'avgSalary') {
            tooltipContent += `
              <div class="text-cyan-300">Avg Salary: ${formatCurrency(regionData.avgSalary)}</div>
            `;
          } else {
            tooltipContent += `
              <div class="text-cyan-300">Growth: ${regionData.growthRate}%</div>
            `;
          }
          
          tooltip
            .style('opacity', 1)
            .html(tooltipContent);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 20}px`);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', 'rgba(56, 189, 248, 0.8)')
            .attr('stroke-width', 1.5)
            .style('filter', 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))');
            
          tooltip.style('opacity', 0);
        });
      
      // Add region label
      svg.append('text')
        .attr('x', region.cx)
        .attr('y', region.cy)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.8)')
        .text(region.name);
      
      // Add data value
      svg.append('text')
        .attr('x', region.cx)
        .attr('y', region.cy + 15)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'rgba(255,255,255,0.8)')
        .attr('font-size', '10px')
        .style('text-shadow', '0px 1px 3px rgba(0,0,0,0.8)')
        .text(displayValue);
    });
    
    // Add legend
    const legendWidth = 120;
    const legendHeight = 20;
    const legendX = width - legendWidth - 20;
    const legendY = height - 60;
    
    // Create gradient for legend
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'legendGradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
      
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', 'rgba(56, 189, 248, 0.2)');
      
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', 'rgba(56, 189, 248, 0.9)');
    
    // Legend rectangle
    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', 'url(#legendGradient)')
      .attr('rx', 4)
      .attr('stroke', 'rgba(255,255,255,0.3)')
      .attr('stroke-width', 0.5);
    
    // Legend labels
    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY - 5)
      .attr('text-anchor', 'start')
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '10px')
      .text('Low');
      
    svg.append('text')
      .attr('x', legendX + legendWidth)
      .attr('y', legendY - 5)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(255,255,255,0.7)')
      .attr('font-size', '10px')
      .text('High');
    
    // Legend title
    let legendTitle: string;
    switch(dataType) {
      case 'avgSalary':
        legendTitle = 'Average Salary';
        break;
      case 'growthRate':
        legendTitle = 'Job Growth Rate';
        break;
      case 'jobCount':
      default:
        legendTitle = 'Job Count';
    }
    
    svg.append('text')
      .attr('x', legendX + legendWidth / 2)
      .attr('y', legendY + legendHeight + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255,255,255,0.9)')
      .attr('font-size', '12px')
      .text(legendTitle);
  }, [isLoading, dataType, mapData]);
  
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 col-span-1 lg:col-span-2">
        <div className="p-4 border-b border-gray-700">
          <Skeleton className="h-6 w-3/4 bg-gray-700" />
          <Skeleton className="h-4 w-1/2 mt-2 bg-gray-700" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-end mb-4 space-x-2">
            <Skeleton className="h-6 w-20 bg-gray-700" />
            <Skeleton className="h-6 w-20 bg-gray-700" />
            <Skeleton className="h-6 w-20 bg-gray-700" />
          </div>
          <Skeleton className="h-80 sm:h-96 w-full bg-gray-700" />
          <div className="mt-4">
            <Skeleton className="h-3 w-full bg-gray-700" />
            <Skeleton className="h-3 w-4/5 mt-2 bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700 col-span-1 lg:col-span-2">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center text-white">
          <span className="material-icons text-cyan-400 mr-2">public</span>
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            Geographic Job Distribution
          </span>
        </h2>
        <p className="text-sm text-gray-400">
          Interactive map visualization of global job market data
        </p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-end mb-4 space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={`${
              dataType === 'jobCount'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800 hover:text-blue-300`}
            onClick={() => setDataType('jobCount')}
          >
            Job Count
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              dataType === 'avgSalary'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800 hover:text-blue-300`}
            onClick={() => setDataType('avgSalary')}
          >
            Average Salary
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              dataType === 'growthRate'
                ? 'bg-blue-900/50 text-blue-400 border-blue-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-blue-800 hover:text-blue-300`}
            onClick={() => setDataType('growthRate')}
          >
            Job Growth
          </Button>
        </div>
        <div className="relative">
          <svg 
            ref={svgRef} 
            className="h-80 sm:h-96 w-full border border-gray-700 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
          ></svg>
          <div 
            ref={tooltipRef}
            className="absolute opacity-0 bg-gray-900 p-3 rounded shadow-xl border border-gray-700 text-sm pointer-events-none z-10"
          ></div>
        </div>
        <div className="mt-4 text-xs text-gray-400">
          <p>Hover over regions to see detailed statistics.</p>
          <p>Use the buttons above to toggle between different data types.</p>
        </div>
      </div>
    </div>
  );
}