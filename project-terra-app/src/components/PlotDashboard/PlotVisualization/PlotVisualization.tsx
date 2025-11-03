// components/PlotDashboard/PlotVisualization/PlotVisualization.tsx
import React from 'react';

interface PlotVisualizationProps {
  plot: any;
  onCanopyAnalysis?: (plot: any) => void;
}

const PlotVisualization: React.FC<PlotVisualizationProps> = ({ plot, onCanopyAnalysis }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plot Visualization</h2>
      <p className="text-gray-600 dark:text-gray-300">
        This is a placeholder for the plot visualization. This section would show a visual representation of the plot.
      </p>
      
      {onCanopyAnalysis && (
        <div className="mt-4">
          <button 
            className="btn-primary"
            onClick={() => onCanopyAnalysis(plot)}
          >
            Perform Canopy Analysis
          </button>
        </div>
      )}
    </div>
  );
};

export default PlotVisualization;