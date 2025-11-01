import React from 'react';
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
  const padding = 20;
  const availableWidth = width - padding * 2;
  const availableHeight = height - padding * 2;
  
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
  
  // Quadrant information with Q1-Q4 labels
  const quadrants = [
    { id: 'NW', name: 'Q2', label: 'NW (Q2)', x: offsetX + displayWidth * 0.25, y: offsetY + displayHeight * 0.25 },
    { id: 'NE', name: 'Q1', label: 'NE (Q1)', x: offsetX + displayWidth * 0.75, y: offsetY + displayHeight * 0.25 },
    { id: 'SW', name: 'Q3', label: 'SW (Q3)', x: offsetX + displayWidth * 0.25, y: offsetY + displayHeight * 0.75 },
    { id: 'SE', name: 'Q4', label: 'SE (Q4)', x: offsetX + displayWidth * 0.75, y: offsetY + displayHeight * 0.75 }
  ];
  
  return (
    <div className="relative border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
      <div className="text-center mb-1">
        <h4 className="font-semibold text-sm">{plot.plotNumber}</h4>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {plot.dimensions.width}×{plot.dimensions.height}m
        </p>
      </div>
      
      <svg 
        width={width} 
        height={height} 
        className="border border-gray-200 dark:border-gray-700 rounded bg-white"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Main plot outline */}
        <rect
          x={offsetX}
          y={offsetY}
          width={displayWidth}
          height={displayHeight}
          fill="none"
          stroke="#3b82f6" // blue-500
          strokeWidth="2"
          strokeDasharray="4,2"
        />
        
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
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            
            {/* Horizontal line (NW/SW to NE/SE) */}
            <line
              x1={offsetX}
              y1={quadBoundaryY}
              x2={offsetX + displayWidth}
              y2={quadBoundaryY}
              stroke="#9ca3af" // gray-400
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            
            {/* Quadrant labels with Q1-Q4 numbering */}
            {quadrants.map((quad) => (
              <g key={quad.id}>
                {/* Q1-Q4 number label */}
                <text
                  x={quad.x}
                  y={quad.y - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#1e40af" // blue-800
                  fontSize="11"
                  fontWeight="bold"
                  className="cursor-pointer hover:fill-blue-600"
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
                  className="cursor-pointer hover:fill-blue-600"
                  onClick={() => onClickQuadrant?.(quad.id as any)}
                >
                  {quad.id}
                </text>
              </g>
            ))}
          </>
        )}
        
        {/* Subplots */}
        {showSubplots && plot.subplots && plot.subplots.map((subplot) => {
          let element;
          
          if (subplot.shape === 'rectangular' && subplot.width && subplot.height) {
            element = (
              <rect
                key={subplot.id}
                x={toDisplayX(subplot.positionX)}
                y={toDisplayY(subplot.positionY)}
                width={subplot.width * scale}
                height={subplot.height * scale}
                fill="rgba(167, 243, 208, 0.5)" // emerald-200 with alpha
                stroke="#10b981" // emerald-500
                strokeWidth="1"
                rx="2"
                className="cursor-pointer hover:stroke-blue-600 hover:fill-opacity-70"
                onClick={() => onClickSubplot?.(subplot.id)}
              />
            );
          } else if (subplot.shape === 'circular' && subplot.radius) {
            element = (
              <circle
                key={subplot.id}
                cx={toDisplayX(subplot.positionX + (subplot.radius || 0))}
                cy={toDisplayY(subplot.positionY + (subplot.radius || 0))}
                r={(subplot.radius || 0) * scale}
                fill="rgba(167, 243, 208, 0.5)" // emerald-200 with alpha
                stroke="#10b981" // emerald-500
                strokeWidth="1"
                className="cursor-pointer hover:stroke-blue-600 hover:fill-opacity-70"
                onClick={() => onClickSubplot?.(subplot.id)}
              />
            );
          } else {
            // If subplot doesn't have required dimensions, skip rendering
            return null;
          }
          
          return [
            element,
            // Subplot label
            <text
              key={`label-${subplot.id}`}
              x={toDisplayX(subplot.positionX + (subplot.width || subplot.radius || 0) / 2)}
              y={toDisplayY(subplot.positionY + (subplot.height || (subplot.radius ? (subplot.radius * 2) : 0)) / 2)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#065f46" // emerald-700
              fontSize="9"
              fontWeight="bold"
              className="cursor-pointer pointer-events-none"
            >
              {subplot.name ? subplot.name.substring(0, 8) : subplot.id.substring(0, 6)}
            </text>
          ];
        })}
        
        {/* Scale indicator */}
        <g transform={`translate(${padding}, ${height - padding - 20})`}>
          {/* Scale bar representing 1 meter */}
          <line x1="0" y1="0" x2={scale} y2="0" stroke="#374151" strokeWidth="2" />
          <text x={scale / 2} y="15" fontSize="10" fill="#374151" textAnchor="middle">1m</text>
        </g>
        
        {/* Legend */}
        <g transform={`translate(${width - 120}, ${padding})`}>
          <rect x="0" y="0" width="110" height="50" fill="white" stroke="#d1d5db" rx="4"/>
          <circle cx="10" cy="12" r="4" fill="rgba(167, 243, 208, 0.5)" stroke="#10b981"/>
          <text x="20" y="16" fontSize="10" fill="#374151">Subplot</text>
          <text x="10" y="30" fontSize="10" fill="#1e40af" fontWeight="bold">Q1-Q4</text>
          <text x="10" y="42" fontSize="9" fill="#4b5563">NW-SE</text>
        </g>
      </svg>
      
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
        <span>Q: {plot.quadrants?.length || 0}/4</span>
        <span>S: {plot.subplots?.length || 0}</span>
      </div>
    </div>
  );
};

export default VisualPlotLayout;