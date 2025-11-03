// components/plots/VisualPlotLayout.tsx
import React from 'react';
import type { VegetationPlot, Quadrant, Subplot } from '../../db/database';

interface VisualPlotLayoutProps {
  plot: VegetationPlot;
  width?: number;
  height?: number;
  showQuadrants?: boolean;
  showSubplots?: boolean;
}

const VisualPlotLayout: React.FC<VisualPlotLayoutProps> = ({ plot }) => {
  if (!plot.dimensions) {
    return <div>No plot dimensions available</div>;
  }

  const { width, height } = plot.dimensions;
  
  // Calculate scale for visualization (max 400px width/height)
  const scale = Math.min(400 / Math.max(width, height), 1);
  const vizWidth = width * scale;
  const vizHeight = height * scale;

  // Function to render quadrants
  const renderQuadrant = (quadrant: Quadrant, x: number, y: number, width: number, height: number) => {
    const quadData = plot.quadrants?.find(q => q.quadrant === quadrant);
    const hasData = quadData && quadData.measurements.length > 0;
    
    return (
      <div
        key={quadrant}
        className={`absolute border ${hasData ? 'border-green-500 bg-green-100/30' : 'border-gray-300'}`}
        style={{
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          width: `${width * 100}%`,
          height: `${height * 100}%`,
        }}
      >
        <div className="absolute top-1 left-1 text-xs font-bold">{quadrant}</div>
        {hasData && (
          <div className="absolute bottom-1 right-1 text-xs">
            {quadData.measurements.length} meas.
          </div>
        )}
      </div>
    );
  };

  // Function to render subplots
  const renderSubplots = () => {
    if (!plot.subplots || plot.subplots.length === 0) return null;

    return plot.subplots.map((subplot, index) => {
      // Calculate position as percentage of plot dimensions
      const leftPercent = (subplot.positionX / width) * 100;
      const topPercent = (subplot.positionY / height) * 100;
      
      let widthPercent, heightPercent;
      if (subplot.shape === 'rectangular') {
        widthPercent = (subplot.width! / width) * 100;
        heightPercent = (subplot.height! / height) * 100;
      } else {
        // For circular subplots, use diameter as percentage of plot
        widthPercent = (subplot.radius! * 2 / width) * 100;
        heightPercent = (subplot.radius! * 2 / height) * 100;
      }

      const hasData = subplot.measurements.length > 0;

      return (
        <div
          key={subplot.id}
          className={`absolute border-2 ${
            hasData ? 'border-blue-500 bg-blue-100/30' : 'border-purple-300'
          } flex items-center justify-center`}
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
            borderRadius: subplot.shape === 'circular' ? '50%' : '0',
          }}
        >
          <div className="text-xs font-semibold text-center">
            <div>{subplot.name || `Subplot ${index + 1}`}</div>
            {hasData && (
              <div className="text-[8px]">{subplot.measurements.length} meas.</div>
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold">{plot.plotNumber}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {width}m × {height}m ({width * height}m²)
        </p>
      </div>

      <div className="relative border-2 border-gray-800 bg-amber-50/20" 
           style={{ width: `${vizWidth}px`, height: `${vizHeight}px` }}>
        {/* Plot border */}
        <div className="absolute inset-0 border-2 border-gray-800"></div>
        
        {/* Grid lines for quadrants */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400 transform -translate-x-1/2"></div>
        <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-400 transform -translate-y-1/2"></div>
        
        {/* Quadrants */}
        {renderQuadrant('NW', 0, 0, 0.5, 0.5)}
        {renderQuadrant('NE', 0.5, 0, 0.5, 0.5)}
        {renderQuadrant('SW', 0, 0.5, 0.5, 0.5)}
        {renderQuadrant('SE', 0.5, 0.5, 0.5, 0.5)}
        
        {/* Subplots */}
        {renderSubplots()}
        
        {/* Plot center marker */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <div>Measurements: {plot.measurements.length} (overall)</div>
        <div>Subplots: {plot.subplots?.length || 0}</div>
        <div>Quadrants: {plot.quadrants?.length || 0}/4</div>
      </div>
    </div>
  );
};

export default VisualPlotLayout;