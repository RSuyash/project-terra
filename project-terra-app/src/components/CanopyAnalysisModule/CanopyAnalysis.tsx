// components/CanopyAnalysisModule/CanopyAnalysis.tsx
import React from 'react';
import { AppLayout } from '../layout/AppLayout';

const CanopyAnalysis: React.FC = () => {
  return (
    <AppLayout title="Canopy Analysis">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Canopy Analysis</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This module allows you to analyze canopy coverage from photos taken at different angles.
          You can capture center and quadrant photos to assess canopy density and coverage.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Capture Photos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Take photos from center and 4 quadrants to assess canopy coverage
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Analysis Results</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              View calculated canopy coverage percentages and density metrics
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CanopyAnalysis;