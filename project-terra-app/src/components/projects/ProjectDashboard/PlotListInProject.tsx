// components/projects/ProjectDashboard/PlotListInProject.tsx
import React from 'react';

interface PlotListInProjectProps {
  project: any;
  onCanopyAnalysis?: (plot: any) => void;
}

const PlotListInProject: React.FC<PlotListInProjectProps> = ({ project, onCanopyAnalysis }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plots in Project</h2>
      <p className="text-gray-600 dark:text-gray-300">
        This is a placeholder for the plots within the project. This section would show all plots associated with this project.
      </p>
    </div>
  );
};

export default PlotListInProject;