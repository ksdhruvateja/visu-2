import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatCurrency } from "@/lib/utils/data";
import { Badge } from '@/components/ui/badge';

// Enhanced world map data structure with industry and position details
interface WorldMapData {
  regions: {
    [key: string]: {
      jobCount: number;
      avgSalary: number;
      growthRate: number;
      topIndustries: { name: string; count: number; salary: number }[];
      topPositions: { title: string; count: number; salary: number }[];
    }
  };
  maxJobCount: number;
  maxSalary: number;
  maxGrowthRate: number;
}

interface GeographicMapChartProps {
  isLoading: boolean;
}

export default function GeographicMapChart({ isLoading }: GeographicMapChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const [dataType, setDataType] = useState<'jobCount' | 'avgSalary' | 'growthRate'>('jobCount');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showIndustryDetails, setShowIndustryDetails] = useState<boolean>(true);
  
  // Enhanced data with industry and position breakdown
  const [mapData, setMapData] = useState<WorldMapData>({
    regions: {
      "North America": { 
        jobCount: 3500, 
        avgSalary: 85000, 
        growthRate: 5.2,
        topIndustries: [
          { name: "Technology", count: 1200, salary: 105000 },
          { name: "Healthcare", count: 850, salary: 78000 },
          { name: "Finance", count: 720, salary: 92000 },
          { name: "Manufacturing", count: 430, salary: 65000 },
          { name: "Retail", count: 300, salary: 52000 }
        ],
        topPositions: [
          { title: "Software Engineer", count: 580, salary: 110000 },
          { title: "Data Scientist", count: 320, salary: 120000 },
          { title: "Product Manager", count: 280, salary: 115000 },
          { title: "Healthcare Specialist", count: 240, salary: 82000 },
          { title: "Financial Analyst", count: 210, salary: 90000 }
        ]
      },
      "South America": { 
        jobCount: 1800, 
        avgSalary: 52000, 
        growthRate: 3.8,
        topIndustries: [
          { name: "Agriculture", count: 580, salary: 48000 },
          { name: "Mining", count: 420, salary: 61000 },
          { name: "Technology", count: 340, salary: 72000 },
          { name: "Tourism", count: 260, salary: 41000 },
          { name: "Manufacturing", count: 200, salary: 45000 }
        ],
        topPositions: [
          { title: "Agricultural Specialist", count: 320, salary: 51000 },
          { title: "Mining Engineer", count: 240, salary: 68000 },
          { title: "Software Developer", count: 190, salary: 75000 },
          { title: "Tourism Coordinator", count: 150, salary: 43000 },
          { title: "Manufacturing Technician", count: 120, salary: 48000 }
        ]
      },
      "Europe": { 
        jobCount: 4200, 
        avgSalary: 70000, 
        growthRate: 4.1,
        topIndustries: [
          { name: "Technology", count: 1100, salary: 85000 },
          { name: "Finance", count: 980, salary: 88000 },
          { name: "Healthcare", count: 720, salary: 72000 },
          { name: "Manufacturing", count: 680, salary: 62000 },
          { name: "Education", count: 720, salary: 58000 }
        ],
        topPositions: [
          { title: "Software Developer", count: 680, salary: 87000 },
          { title: "Financial Advisor", count: 420, salary: 92000 },
          { title: "Research Scientist", count: 380, salary: 78000 },
          { title: "Engineering Manager", count: 340, salary: 95000 },
          { title: "Data Analyst", count: 320, salary: 75000 }
        ]
      },
      "Africa": { 
        jobCount: 1200, 
        avgSalary: 45000, 
        growthRate: 7.5,
        topIndustries: [
          { name: "Mining", count: 380, salary: 52000 },
          { name: "Agriculture", count: 320, salary: 38000 },
          { name: "Technology", count: 180, salary: 65000 },
          { name: "Healthcare", count: 160, salary: 48000 },
          { name: "Education", count: 160, salary: 42000 }
        ],
        topPositions: [
          { title: "Mining Specialist", count: 220, salary: 56000 },
          { title: "Agricultural Manager", count: 180, salary: 42000 },
          { title: "Software Engineer", count: 120, salary: 68000 },
          { title: "Healthcare Worker", count: 110, salary: 50000 },
          { title: "Teacher", count: 100, salary: 44000 }
        ]
      },
      "Asia": { 
        jobCount: 5000, 
        avgSalary: 60000, 
        growthRate: 8.3,
        topIndustries: [
          { name: "Technology", count: 1800, salary: 75000 },
          { name: "Manufacturing", count: 1500, salary: 48000 },
          { name: "Finance", count: 800, salary: 70000 },
          { name: "Healthcare", count: 500, salary: 58000 },
          { name: "Education", count: 400, salary: 52000 }
        ],
        topPositions: [
          { title: "Software Engineer", count: 1200, salary: 78000 },
          { title: "Manufacturing Specialist", count: 900, salary: 50000 },
          { title: "Financial Analyst", count: 500, salary: 72000 },
          { title: "Product Manager", count: 350, salary: 85000 },
          { title: "Data Scientist", count: 320, salary: 80000 }
        ]
      },
      "Australia": { 
        jobCount: 980, 
        avgSalary: 78000, 
        growthRate: 2.9,
        topIndustries: [
          { name: "Technology", count: 320, salary: 95000 },
          { name: "Mining", count: 220, salary: 110000 },
          { name: "Healthcare", count: 180, salary: 75000 },
          { name: "Finance", count: 150, salary: 85000 },
          { name: "Tourism", count: 110, salary: 62000 }
        ],
        topPositions: [
          { title: "Software Engineer", count: 180, salary: 98000 },
          { title: "Mining Engineer", count: 150, salary: 115000 },
          { title: "Healthcare Specialist", count: 120, salary: 80000 },
          { title: "Financial Analyst", count: 110, salary: 88000 },
          { title: "Data Scientist", count: 90, salary: 102000 }
        ]
      }
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
    
    // Calculate hex grid parameters
    const hexRadius = width / 16;
    const hexHeight = hexRadius * Math.sqrt(3);
    const hexWidth = hexRadius * 2;
    const hexVerticalSpacing = hexHeight;
    const hexHorizontalSpacing = hexWidth * 0.75;
    
    // Coordinates for placing our regions in a hex grid
    const hexPositions = [
      { name: "North America", row: 1, col: 3 },
      { name: "South America", row: 3, col: 4 },
      { name: "Europe", row: 1, col: 6 },
      { name: "Africa", row: 2, col: 7 },
      { name: "Asia", row: 2, col: 9 },
      { name: "Australia", row: 4, col: 11 }
    ];
    
    // Create the background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'url(#grid-gradient)')
      .attr('rx', 8);
    
    // Create radial gradients for the background
    const defs = svg.append('defs');
    
    // Background grid gradient
    const gridGradient = defs.append('linearGradient')
      .attr('id', 'grid-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
      
    gridGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0f172a');
      
    gridGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1e293b');
    
    // Add glowing connections between regions
    const connectionGroup = svg.append('g')
      .attr('class', 'connections');

    // Define connections between regions
    const connections = [
      { source: "North America", target: "Europe" },
      { source: "North America", target: "South America" },
      { source: "Europe", target: "Asia" },
      { source: "Europe", target: "Africa" },
      { source: "Asia", target: "Australia" },
      { source: "South America", target: "Africa" }
    ];
    
    // Create gradients for connections
    connections.forEach((connection, i) => {
      const gradientId = `connection-gradient-${i}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse');
        
      const sourcePosition = hexPositions.find(p => p.name === connection.source);
      const targetPosition = hexPositions.find(p => p.name === connection.target);
      
      if (sourcePosition && targetPosition) {
        const sourceX = sourcePosition.col * hexHorizontalSpacing;
        const sourceY = sourcePosition.row * hexVerticalSpacing + (sourcePosition.col % 2 === 0 ? 0 : hexHeight / 2);
        const targetX = targetPosition.col * hexHorizontalSpacing;
        const targetY = targetPosition.row * hexVerticalSpacing + (targetPosition.col % 2 === 0 ? 0 : hexHeight / 2);
        
        gradient.attr('x1', sourceX)
          .attr('y1', sourceY)
          .attr('x2', targetX)
          .attr('y2', targetY);
          
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', dataType === 'avgSalary' ? '#059669' : 
                             dataType === 'growthRate' ? '#d97706' : '#0284c7')
          .attr('stop-opacity', 0.7);
          
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', dataType === 'avgSalary' ? '#059669' : 
                             dataType === 'growthRate' ? '#d97706' : '#0284c7')
          .attr('stop-opacity', 0.1);
          
        // Draw the connection line
        connectionGroup.append('line')
          .attr('x1', sourceX)
          .attr('y1', sourceY)
          .attr('x2', targetX)
          .attr('y2', targetY)
          .attr('stroke', `url(#${gradientId})`)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.6);
      }
    });
    
    // Add a subtle grid pattern
    const gridSize = 30;
    const grid = svg.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.2);
      
    // Horizontal grid lines
    for (let y = 0; y < height; y += gridSize) {
      grid.append('line')
        .attr('x1', 0)
        .attr('y1', y)
        .attr('x2', width)
        .attr('y2', y)
        .attr('stroke', 'rgba(100, 116, 139, 0.5)')
        .attr('stroke-width', 0.5);
    }
    
    // Vertical grid lines
    for (let x = 0; x < width; x += gridSize) {
      grid.append('line')
        .attr('x1', x)
        .attr('y1', 0)
        .attr('x2', x)
        .attr('y2', height)
        .attr('stroke', 'rgba(100, 116, 139, 0.5)')
        .attr('stroke-width', 0.5);
    }
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current);
    
    // Function to create a hexagon path
    const hexagonPath = (radius: number) => {
      const angles = d3.range(6).map(i => [
        radius * Math.cos(i * 2 * Math.PI / 6),
        radius * Math.sin(i * 2 * Math.PI / 6)
      ]);
      
      return d3.line()
        .x(d => d[0])
        .y(d => d[1])
        (angles) + 'Z';
    };
    
    // Create color scale based on selected data type
    let colorScale;
    
    if (dataType === 'avgSalary') {
      colorScale = d3.scaleSequential()
        .domain([mapData.maxSalary * 0.3, mapData.maxSalary])
        .interpolator(d3.interpolate('#064e3b', '#10b981'));
    } else if (dataType === 'growthRate') {
      colorScale = d3.scaleSequential()
        .domain([0, mapData.maxGrowthRate])
        .interpolator(d3.interpolate('#78350f', '#f59e0b'));
    } else {
      colorScale = d3.scaleSequential()
        .domain([0, mapData.maxJobCount])
        .interpolator(d3.interpolate('#0c4a6e', '#0ea5e9'));
    }
    
    // Draw the hexagons for each region
    hexPositions.forEach(position => {
      const regionName = position.name;
      const regionData = mapData.regions[regionName];
      
      // Calculate the center position
      const centerX = position.col * hexHorizontalSpacing;
      const centerY = position.row * hexVerticalSpacing + (position.col % 2 === 0 ? 0 : hexHeight / 2);
      
      // Get value based on data type
      let value, normalizedValue;
      switch(dataType) {
        case 'avgSalary':
          value = regionData.avgSalary;
          normalizedValue = regionData.avgSalary / mapData.maxSalary;
          break;
        case 'growthRate':
          value = regionData.growthRate;
          normalizedValue = regionData.growthRate / mapData.maxGrowthRate;
          break;
        default:
          value = regionData.jobCount;
          normalizedValue = regionData.jobCount / mapData.maxJobCount;
      }
      
      // Create gradient for hexagon
      const hexGradientId = `hex-gradient-${regionName.replace(/\s+/g, '')}`;
      const hexGradient = defs.append('radialGradient')
        .attr('id', hexGradientId)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '70%')
        .attr('fx', '50%')
        .attr('fy', '50%');
        
      hexGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colorScale(value))
        .attr('stop-opacity', 0.9);
        
      hexGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colorScale(value))
        .attr('stop-opacity', 0.5);
      
      // Create glow effect
      const glowId = `glow-${regionName.replace(/\s+/g, '')}`;
      const glow = defs.append('filter')
        .attr('id', glowId)
        .attr('width', '300%')
        .attr('height', '300%')
        .attr('x', '-50%')
        .attr('y', '-50%');
        
      glow.append('feGaussianBlur')
        .attr('stdDeviation', '5')
        .attr('result', 'blur');
        
      glow.append('feComposite')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'blur')
        .attr('operator', 'over');
      
      // Draw background glow hexagon
      svg.append('path')
        .attr('d', hexagonPath(hexRadius * 1.2))
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('fill', colorScale(value))
        .attr('opacity', 0.2)
        .attr('filter', `url(#${glowId})`);
      
      // Draw hexagon
      const hexagon = svg.append('path')
        .attr('d', hexagonPath(hexRadius))
        .attr('transform', `translate(${centerX}, ${centerY})`)
        .attr('fill', `url(#${hexGradientId})`)
        .attr('stroke', selectedRegion === regionName ? '#fff' : colorScale(value))
        .attr('stroke-width', selectedRegion === regionName ? 3 : 1.5)
        .attr('stroke-opacity', 0.8)
        .style('cursor', 'pointer')
        .style('transition', 'all 0.3s ease');
      
      // Add interaction
      hexagon.on('mouseover', function() {
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 1);
          
        // Format value based on data type
        let displayValue;
        if (dataType === 'avgSalary') {
          displayValue = formatCurrency(value);
        } else if (dataType === 'growthRate') {
          displayValue = `${value}%`;
        } else {
          displayValue = value.toLocaleString();
        }
        
        // Update tooltip content
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="font-medium text-lg">${regionName}</div>
            <div class="text-sm text-gray-300 mb-1">Region</div>
            <div class="${dataType === 'avgSalary' ? 'text-emerald-400' : 
                       dataType === 'growthRate' ? 'text-amber-400' : 
                       'text-cyan-400'} font-bold text-xl">
              ${displayValue}
            </div>
            <div class="text-gray-300 mt-1 text-sm">
              ${dataType === 'avgSalary' ? 'Average Salary' : 
                dataType === 'growthRate' ? 'Growth Rate' : 
                'Total Jobs'}
            </div>
            <div class="text-gray-400 mt-3 text-xs">Click for details</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', function() {
        if (regionName !== selectedRegion) {
          d3.select(this)
            .attr('stroke', colorScale(value))
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0.8);
        }
        
        tooltip.style('opacity', 0);
      })
      .on('click', function() {
        setSelectedRegion(regionName === selectedRegion ? null : regionName);
      });
      
      // Add region label
      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY - 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)')
        .text(regionName);
      
      // Add value label
      svg.append('text')
        .attr('x', centerX)
        .attr('y', centerY + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .style('text-shadow', '0 1px 3px rgba(0,0,0,0.8)')
        .text(dataType === 'avgSalary' ? formatCurrency(value) : 
             dataType === 'growthRate' ? `${value}%` : 
             value.toLocaleString());
      
      // Add a pulse animation for the selected region
      if (regionName === selectedRegion) {
        const pulseCircle = svg.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', hexRadius)
          .attr('fill', 'none')
          .attr('stroke', '#fff')
          .attr('stroke-width', 2)
          .attr('opacity', 0.6);
          
        pulseCircle.append('animate')
          .attr('attributeName', 'r')
          .attr('from', hexRadius)
          .attr('to', hexRadius * 1.3)
          .attr('dur', '1.5s')
          .attr('repeatCount', 'indefinite');
          
        pulseCircle.append('animate')
          .attr('attributeName', 'opacity')
          .attr('from', 0.6)
          .attr('to', 0)
          .attr('dur', '1.5s')
          .attr('repeatCount', 'indefinite');
      }
    });
    
    // Add legend
    const legendWidth = 180;
    const legendHeight = 15;
    const legendX = width - legendWidth - 20;
    const legendY = height - 40;
    
    // Legend gradient
    const legendGradId = `legend-gradient-${dataType}`;
    const legendGradient = defs.append('linearGradient')
      .attr('id', legendGradId)
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
      
    if (dataType === 'avgSalary') {
      legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#064e3b');
        
      legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#10b981');
    } else if (dataType === 'growthRate') {
      legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#78350f');
        
      legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#f59e0b');
    } else {
      legendGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#0c4a6e');
        
      legendGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#0ea5e9');
    }
    
    // Legend background
    svg.append('rect')
      .attr('x', legendX - 10)
      .attr('y', legendY - 20)
      .attr('width', legendWidth + 20)
      .attr('height', 50)
      .attr('fill', '#1e293b')
      .attr('opacity', 0.7)
      .attr('rx', 5);
    
    // Legend bar
    svg.append('rect')
      .attr('x', legendX)
      .attr('y', legendY)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('fill', `url(#${legendGradId})`)
      .attr('rx', 3);
    
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
      .attr('x', legendX)
      .attr('y', legendY - 5)
      .attr('text-anchor', 'start')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '12px')
      .text(legendTitle);
    
    // Legend min value
    svg.append('text')
      .attr('x', legendX)
      .attr('y', legendY + legendHeight + 15)
      .attr('text-anchor', 'start')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text(dataType === 'avgSalary' ? formatCurrency(mapData.maxSalary * 0.3) : 
           dataType === 'growthRate' ? '0%' : 
           '0');
    
    // Legend max value
    svg.append('text')
      .attr('x', legendX + legendWidth)
      .attr('y', legendY + legendHeight + 15)
      .attr('text-anchor', 'end')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text(dataType === 'avgSalary' ? formatCurrency(mapData.maxSalary) : 
           dataType === 'growthRate' ? `${mapData.maxGrowthRate}%` : 
           mapData.maxJobCount.toLocaleString());
    
  }, [isLoading, dataType, mapData, selectedRegion]);
  
  // Effect to update the details panel when a region is selected
  useEffect(() => {
    if (!detailsRef.current || !selectedRegion) return;
    
    const detailsPanel = d3.select(detailsRef.current);
    const regionData = mapData.regions[selectedRegion];
    
    if (!regionData) return;
    
    // Clear existing content
    detailsPanel.html('');
    
    // Add region header
    detailsPanel.append('div')
      .attr('class', 'flex justify-between items-center mb-4')
      .html(`
        <div>
          <h3 class="text-lg font-bold text-white">${selectedRegion}</h3>
          <p class="text-gray-400 text-sm">Regional Job Market Analysis</p>
        </div>
        <button class="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700">
          <span class="material-icons text-lg" id="close-details">close</span>
        </button>
      `);
    
    // Add event listener to close button
    document.getElementById('close-details')?.addEventListener('click', () => {
      setSelectedRegion(null);
    });
    
    // Add stats overview
    detailsPanel.append('div')
      .attr('class', 'grid grid-cols-3 gap-2 mb-4')
      .html(`
        <div class="bg-gray-800 rounded p-2 text-center">
          <div class="text-cyan-400 font-semibold">${regionData.jobCount.toLocaleString()}</div>
          <div class="text-gray-400 text-xs">Jobs</div>
        </div>
        <div class="bg-gray-800 rounded p-2 text-center">
          <div class="text-emerald-400 font-semibold">${formatCurrency(regionData.avgSalary)}</div>
          <div class="text-gray-400 text-xs">Avg Salary</div>
        </div>
        <div class="bg-gray-800 rounded p-2 text-center">
          <div class="text-amber-400 font-semibold">${regionData.growthRate}%</div>
          <div class="text-gray-400 text-xs">Growth</div>
        </div>
      `);
    
    // Add toggle buttons
    detailsPanel.append('div')
      .attr('class', 'flex space-x-2 mb-4')
      .html(`
        <button id="industries-toggle" class="flex-1 py-1 px-2 text-sm rounded ${showIndustryDetails ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
          Top Industries
        </button>
        <button id="positions-toggle" class="flex-1 py-1 px-2 text-sm rounded ${!showIndustryDetails ? 'bg-blue-900/50 text-blue-400 border border-blue-700' : 'bg-gray-800 text-gray-400 border border-gray-700'}">
          Top Positions
        </button>
      `);
    
    // Add event listeners to toggle buttons
    document.getElementById('industries-toggle')?.addEventListener('click', () => {
      setShowIndustryDetails(true);
    });
    
    document.getElementById('positions-toggle')?.addEventListener('click', () => {
      setShowIndustryDetails(false);
    });
    
    // Show either industries or positions breakdown
    if (showIndustryDetails) {
      // Add industries breakdown
      const industriesDiv = detailsPanel.append('div')
        .attr('class', 'space-y-3');
      
      industriesDiv.append('h4')
        .attr('class', 'text-sm font-semibold text-white')
        .html('Top Industries');
      
      // Create bars for each industry
      regionData.topIndustries.forEach(industry => {
        const maxCount = Math.max(...regionData.topIndustries.map(i => i.count));
        const percentage = (industry.count / maxCount) * 100;
        
        const industryBar = industriesDiv.append('div')
          .attr('class', 'space-y-1');
          
        industryBar.append('div')
          .attr('class', 'flex justify-between text-xs')
          .html(`
            <span class="text-white">${industry.name}</span>
            <span class="text-gray-400">${industry.count.toLocaleString()} jobs</span>
          `);
          
        industryBar.append('div')
          .attr('class', 'h-2 bg-gray-700 rounded overflow-hidden')
          .append('div')
          .attr('class', `h-full rounded ${dataType === 'avgSalary' ? 'bg-emerald-500' : dataType === 'growthRate' ? 'bg-amber-500' : 'bg-blue-500'}`)
          .style('width', `${percentage}%`);
          
        industryBar.append('div')
          .attr('class', 'flex justify-between text-xs')
          .html(`
            <span class="text-gray-400">Avg Salary</span>
            <span class="text-emerald-400">${formatCurrency(industry.salary)}</span>
          `);
      });
    } else {
      // Add positions breakdown
      const positionsDiv = detailsPanel.append('div')
        .attr('class', 'space-y-3');
      
      positionsDiv.append('h4')
        .attr('class', 'text-sm font-semibold text-white')
        .html('Top Positions');
      
      // Create list for each position
      regionData.topPositions.forEach((position, index) => {
        positionsDiv.append('div')
          .attr('class', 'bg-gray-800 rounded p-2')
          .html(`
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="text-lg font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-white'} mr-2">
                  ${index + 1}
                </div>
                <div>
                  <div class="text-sm text-white">${position.title}</div>
                  <div class="text-xs text-gray-400">${position.count.toLocaleString()} openings</div>
                </div>
              </div>
              <div class="text-emerald-400 text-sm font-semibold">
                ${formatCurrency(position.salary)}
              </div>
            </div>
          `);
      });
    }
    
  }, [selectedRegion, showIndustryDetails, mapData, dataType]);
  
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
            } hover:bg-blue-800/30 hover:text-blue-300 transition-all duration-200`}
            onClick={() => setDataType('jobCount')}
          >
            Job Count
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              dataType === 'avgSalary'
                ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-emerald-800/30 hover:text-emerald-300 transition-all duration-200`}
            onClick={() => setDataType('avgSalary')}
          >
            Average Salary
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`${
              dataType === 'growthRate'
                ? 'bg-amber-900/50 text-amber-400 border-amber-700'
                : 'bg-gray-800/50 text-gray-400 border-gray-700'
            } hover:bg-amber-800/30 hover:text-amber-300 transition-all duration-200`}
            onClick={() => setDataType('growthRate')}
          >
            Job Growth
          </Button>
        </div>
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-${selectedRegion ? 2 : 3}`}>
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
          
          {selectedRegion && (
            <div 
              ref={detailsRef}
              className="bg-gray-900/90 backdrop-blur-sm rounded-lg border border-gray-700 p-4 h-80 sm:h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
            >
              {/* Details content will be populated in useEffect */}
            </div>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-400">
          <p>Hover over regions to see statistics. Click on a region to view detailed industry and position breakdowns.</p>
        </div>
        
        {selectedRegion && (
          <div className="mt-4 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <h3 className="text-sm font-medium text-white mb-2">Trending in {selectedRegion}</h3>
            <div className="flex flex-wrap gap-2">
              {mapData.regions[selectedRegion].topIndustries.slice(0, 3).map(industry => (
                <Badge key={industry.name} variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700">
                  {industry.name}
                </Badge>
              ))}
              {mapData.regions[selectedRegion].topPositions.slice(0, 2).map(position => (
                <Badge key={position.title} variant="outline" className="bg-emerald-900/30 text-emerald-300 border-emerald-700">
                  {position.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}