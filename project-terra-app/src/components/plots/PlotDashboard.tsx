// components/plots/PlotDashboard.tsx
import React from 'react';

const PlotDashboard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Plot Dashboard</h2>
      <p className="text-gray-600 dark:text-gray-300">
        This is a placeholder for the plot dashboard. This section would show an overview
        of all plots, including metrics, visualizations, and quick management tools.
      </p>
    </div>
  );
};

export default PlotDashboard;