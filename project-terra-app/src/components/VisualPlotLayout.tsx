import React, { useEffect } from 'react';
import type { VegetationPlot } from '../db/database';

interface VisualPlotLayoutProps {
  plot: VegetationPlot;
  width?: number;
  height?: number;
  showQuadrants?: boolean;
  showSubplots?: boolean;
  onClickQuadrant?: (quadrant: 'NW' | 'NE' | 'SW' | 'SE') => void;
  onClickSubplot?: (subplotId: string) => void;
}

const VisualPlotLayout: React.FC<VisualPlotLayoutProps> = ({
  plot,
  width = 400,
  height = 400,
  showQuadrants = true,
  showSubplots = true,
  onClickQuadrant,
  onClickSubplot
}) => {
  // Calculate padding for labels and borders
  // Increased bottom padding to accommodate scale and legend
  const padding = 25;
  const legendHeight = 80; // Space for scale indicator and legend below the plot
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2 - legendHeight; // Account for scale and legend
  
  // Calculate scaling factors based on plot dimensions
  const scaleX = availableWidth / plot.dimensions.width;
  const scaleY = availableHeight / plot.dimensions.height;
  const scale = Math.min(scaleX, scaleY); // Use the smaller scale to fit within bounds
  
  // Calculate actual display dimensions
  const displayWidth = plot.dimensions.width * scale;
  const displayHeight = plot.dimensions.height * scale;
  
  // Calculate offset to center the plot within the padded area
  const offsetX = padding + (availableWidth - displayWidth) / 2;
  const offsetY = padding + (availableHeight - displayHeight) / 2;
  
  // Define quadrant boundaries
  const quadBoundaryX = offsetX + (displayWidth / 2);
  const quadBoundaryY = offsetY + (displayHeight / 2);
  
  // Function to convert real-world coordinates to display coordinates
  const toDisplayX = (realX: number) => offsetX + (realX * scale);
  const toDisplayY = (realY: number) => offsetY + (realY * scale);
  
  // Quadrant information with Q1-Q4 labels - positioned inside quadrants
  const quadrants = [
    { id: 'NW', name: 'Q2', label: 'NW (Q2)', x: offsetX + displayWidth * 0.25, y: offsetY + displayHeight * 0.25 },
    { id: 'NE', name: 'Q1', label: 'NE (Q1)', x: offsetX + displayWidth * 0.75, y: offsetY + displayHeight * 0.25 },
    { id: 'SW', name: 'Q3', label: 'SW (Q3)', x: offsetX + displayWidth * 0.25, y: offsetY + displayHeight * 0.75 },
    { id: 'SE', name: 'Q4', label: 'SE (Q4)', x: offsetX + displayWidth * 0.75, y: offsetY + displayHeight * 0.75 }
  ];
  
  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 shadow-sm">
      <div className="text-center mb-2">
        <h4 className="font-bold text-base text-gray-800 dark:text-gray-200">{plot.plotNumber}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {plot.dimensions.width}×{plot.dimensions.height}m ({plot.dimensions.area}m²)
        </p>
      </div>
      
      <svg 
        width={width} 
        height={height} 
        className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white shadow-inner"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Main plot outline with better styling */}
        <rect
          x={offsetX}
          y={offsetY}
          width={displayWidth}
          height={displayHeight}
          fill="url(#plotGradient)"
          stroke="#3b82f6" // blue-500
          strokeWidth="2"
          strokeDasharray="0"
          rx="4"
        />
        
        {/* Gradient definition for plot */}
        <defs>
          <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <filter id="subplotShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#00000020" />
          </filter>
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#ffffffaa" />
          </filter>
        </defs>
        
        {/* Quadrant divisions */}
        {showQuadrants && (
          <>
            {/* Vertical line (NW/NE to SW/SE) */}
            <line
              x1={quadBoundaryX}
              y1={offsetY}
              x2={quadBoundaryX}
              y2={offsetY + displayHeight}
              stroke="#9ca3af" // gray-400
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            
            {/* Horizontal line (NW/SW to NE/SE) */}
            <line
              x1={offsetX}
              y1={quadBoundaryY}
              x2={offsetX + displayWidth}
              y2={quadBoundaryY}
              stroke="#9ca3af" // gray-400
              strokeWidth="1.5"
              strokeDasharray="5,5"
            />
            
            {/* Quadrant labels with Q1-Q4 numbering - positioned inside quadrants */}
            {quadrants.map((quad) => {
              // Get quadrant data if available
              const quadData = plot.quadrants?.find(q => q.quadrant === quad.id);
              const tooltipText = quadData 
                ? `${quad.id} Quadrant\nMeasurements: ${quadData.measurements.length}\nGround Cover: ${Object.values(quadData.groundCover).reduce((a, b) => a + b, 0)}%\nDisturbances: ${Object.entries(quadData.disturbance).filter(([_, v]) => v).length}`
                : `${quad.id} Quadrant\nNo data yet`;
                
              return (
                <g key={quad.id} filter="url(#textShadow)">
                  {/* Add invisible hover area for tooltip */}
                  <rect
                    x={quad.id === 'NW' || quad.id === 'SW' ? offsetX : quadBoundaryX}
                    y={quad.id === 'NW' || quad.id === 'NE' ? offsetY : quadBoundaryY}
                    width={quad.id === 'NW' || quad.id === 'SW' ? displayWidth / 2 : displayWidth / 2}
                    height={quad.id === 'NW' || quad.id === 'NE' ? displayHeight / 2 : displayHeight / 2}
                    fill="none"
                    className="pointer-events-auto"
                    data-tooltip={tooltipText}
                  />
                  {/* Q1-Q4 number label */}
                  <text
                    x={quad.x}
                    y={quad.y - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#1e40af" // blue-800
                    fontSize="11"
                    fontWeight="bold"
                    className="cursor-pointer hover:fill-blue-700 transition-colors"
                    onClick={() => onClickQuadrant?.(quad.id as any)}
                  >
                    {quad.name}
                  </text>
                  {/* Direction label (NW, NE, etc.) */}
                  <text
                    x={quad.x}
                    y={quad.y + 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#4b5563" // gray-600
                    fontSize="9"
                    fontWeight="normal"
                    className="cursor-pointer hover:fill-blue-700 transition-colors"
                    onClick={() => onClickQuadrant?.(quad.id as any)}
                  >
                    {quad.id}
                  </text>
                </g>
              );
            })}
          </>
        )}
        
        {/* Subplots */}
        {showSubplots && plot.subplots && plot.subplots.map((subplot) => {
          // Create tooltip content for the subplot
          const tooltipText = 
            `Subplot: ${subplot.name || 'Unnamed'}\n` +
            `Shape: ${subplot.shape}\n` +
            (subplot.shape === 'rectangular' 
              ? `Size: ${subplot.width}m × ${subplot.height}m\n` 
              : `Radius: ${subplot.radius}m\n`) +
            `Position: (${subplot.positionX}m, ${subplot.positionY}m)\n` +
            `Measurements: ${subplot.measurements.length}\n` +
            `Ground Cover: ${Object.values(subplot.groundCover).reduce((a, b) => a + b, 0)}%\n` +
            `Disturbances: ${Object.entries(subplot.disturbance).filter(([_, v]) => v).length}`;
          
          let element;
          
          if (subplot.shape === 'rectangular' && subplot.width && subplot.height) {
            element = (
              <g key={subplot.id} filter="url(#subplotShadow)" className="relative">
                <rect
                  x={toDisplayX(subplot.positionX)}
                  y={toDisplayY(subplot.positionY)}
                  width={subplot.width * scale}
                  height={subplot.height * scale}
                  fill="url(#subplotGradient)"
                  stroke="#10b981" // emerald-500
                  strokeWidth="1.5"
                  rx="3"
                  className="cursor-pointer hover:stroke-blue-600 hover:opacity-90 transition-all"
                  onClick={() => onClickSubplot?.(subplot.id)}
                  data-tooltip={tooltipText}
                />
                <rect
                  x={toDisplayX(subplot.positionX)}
                  y={toDisplayY(subplot.positionY)}
                  width={subplot.width * scale}
                  height={subplot.height * scale}
                  fill="none"
                  stroke="#ffffff80"
                  strokeWidth="1"
                  rx="3"
                />
              </g>
            );
          } else if (subplot.shape === 'circular' && subplot.radius) {
            element = (
              <g key={subplot.id} filter="url(#subplotShadow)" className="relative">
                <circle
                  cx={toDisplayX(subplot.positionX + (subplot.radius || 0))}
                  cy={toDisplayY(subplot.positionY + (subplot.radius || 0))}
                  r={(subplot.radius || 0) * scale}
                  fill="url(#subplotGradient)"
                  stroke="#10b981" // emerald-500
                  strokeWidth="1.5"
                  className="cursor-pointer hover:stroke-blue-600 hover:opacity-90 transition-all"
                  onClick={() => onClickSubplot?.(subplot.id)}
                  data-tooltip={tooltipText}
                />
                <circle
                  cx={toDisplayX(subplot.positionX + (subplot.radius || 0))}
                  cy={toDisplayY(subplot.positionY + (subplot.radius || 0))}
                  r={(subplot.radius || 0) * scale}
                  fill="none"
                  stroke="#ffffff80"
                  strokeWidth="1"
                />
              </g>
            );
          } else {
            // If subplot doesn't have required dimensions, skip rendering
            return null;
          }
          
          // Calculate center position for label
          const labelX = toDisplayX(subplot.positionX + (subplot.width || (subplot.radius ? subplot.radius * 2 : 0)) / 2);
          const labelY = toDisplayY(subplot.positionY + (subplot.height || (subplot.radius ? subplot.radius * 2 : 0)) / 2);
          
          // Define a more compact label for different subplot types
          let displayLabel = '';
          if (subplot.name) {
            if (subplot.name.includes('Corner')) {
              // For corner subplots, extract the direction (NW, NE, SW, SE)
              const direction = subplot.name.split(' ')[0]; // e.g. "NW Corner" -> "NW"
              displayLabel = direction.substring(0, 2);
            } else if (subplot.name.includes('Micro')) {
              // For microplots, just show a number or "M"
              const numberMatch = subplot.name.match(/\d+/);
              displayLabel = numberMatch ? `M${numberMatch[0]}` : 'M';
            } else if (subplot.name.includes('Belt')) {
              // For belt transects, use first letter
              displayLabel = 'B';
            } else {
              // For other subplots, truncate to 4 characters
              displayLabel = subplot.name.length > 4 ? 
                `${subplot.name.substring(0, 3)}.` : 
                subplot.name;
            }
          } else {
            // Fallback to first 4 characters of ID
            displayLabel = subplot.id.substring(0, 4);
          }
          
          return [
            element,
            // Subplot label - smaller, more compact
            <g key={`label-${subplot.id}`} filter="url(#textShadow)">
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#065f46" // emerald-700
                fontSize="8"
                fontWeight="bold"
                className="cursor-pointer pointer-events-none"
              >
                {displayLabel}
              </text>
            </g>
          ];
        })}
        
        {/* Scale indicator with better styling - positioned below the plot area */}
        <g transform={`translate(${offsetX}, ${offsetY + displayHeight + 5})`}>
          {/* Scale bar representing 1 meter */}
          <rect x="0" y="0" width={scale} height="5" fill="#9ca3af" rx="2" />
          <text x={scale / 2} y="15" fontSize="10" fill="#374151" textAnchor="middle">1m</text>
        </g>
        
        {/* Legend positioned below the scale indicator */}
        <g transform={`translate(${offsetX}, ${offsetY + displayHeight + 25})`}>
          <rect x="0" y="0" width="120" height="60" fill="white" stroke="#d1d5db" rx="6" className="opacity-90" />
          <rect x="10" y="15" width="10" height="10" fill="url(#subplotGradient)" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="25" y="23" fontSize="10" fill="#374151">Subplot</text>
          <text x="10" y="38" fontSize="10" fill="#1e40af" fontWeight="bold">Q1-Q4</text>
          <text x="10" y="50" fontSize="9" fill="#4b5563">NW-SE</text>
        </g>
      </svg>
      
      <div className="mt-2 text-xs text-gray-700 dark:text-gray-300 flex justify-between bg-gray-100 dark:bg-gray-700/50 rounded px-2 py-1">
        <span>Q: {plot.quadrants?.length || 0}/4</span>
        <span>S: {plot.subplots?.length || 0}</span>
        <span>A: {plot.dimensions.area}m²</span>
      </div>
    </div>
  );
};

  // Add tooltip functionality when component mounts
  useEffect(() => {
    const showTooltip = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const tooltipText = target.getAttribute('data-tooltip');
      
      if (tooltipText) {
        // Remove any existing tooltip
        const existingTooltip = document.getElementById('visual-plot-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.id = 'visual-plot-tooltip';
        tooltip.style.cssText = `
          position: fixed;
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-family: sans-serif;
          pointer-events: none;
          z-index: 1000;
          white-space: pre;
          max-width: 250px;
          word-wrap: break-word;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        tooltip.textContent = tooltipText;
        
        // Position tooltip near cursor
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY - 10}px`;
        
        document.body.appendChild(tooltip);
      }
    };

    const hideTooltip = () => {
      const tooltip = document.getElementById('visual-plot-tooltip');
      if (tooltip) tooltip.remove();
    };

    const container = document.querySelector(`[data-plot-number="${plot.plotNumber}"]`);
    const elements = container ? container.querySelectorAll('[data-tooltip]') : 
      document.querySelectorAll('[data-tooltip]');

    elements.forEach(el => {
      el.addEventListener('mouseenter', showTooltip as any);
      el.addEventListener('mouseleave', hideTooltip);
    });

    // Clean up event listeners
    return () => {
      elements.forEach(el => {
        el.removeEventListener('mouseenter', showTooltip as any);
        el.removeEventListener('mouseleave', hideTooltip);
      });
      hideTooltip(); // Remove tooltip if component unmounts
    };
  }, [plot]);

  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 shadow-sm" data-plot-number={plot.plotNumber}>