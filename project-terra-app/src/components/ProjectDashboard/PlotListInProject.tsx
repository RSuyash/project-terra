import type { Project } from '../../db/database';
import { getAllPlots } from '../../db/database';
import { useState, useEffect } from 'react';

interface PlotListInProjectProps {
  project: Project;
}

const PlotListInProject: React.FC<PlotListInProjectProps> = ({ project }) => {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlots();
  }, [project.plotIds]);

  const loadPlots = async () => {
    try {
      setLoading(true);
      const allPlots = await getAllPlots();
      // Filter plots that are in this project
      const projectPlots = allPlots.filter(plot => 
        project.plotIds.includes(plot.id!)
      );
      setPlots(projectPlots);
    } catch (err) {
      console.error('Failed to load project plots:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plots');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300">
          Error loading plots: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Plots in Project ({plots.length})
      </h3>
      
      {plots.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plot Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dimensions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subplots</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {plots.map(plot => (
                <tr key={plot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {plot.plotNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {plot.dimensions.width}×{plot.dimensions.height}m
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(plot.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {plot.subplots?.length || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <a 
                      href={`/plot/${plot.id}/edit`} 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No plots associated with this project</p>
          <p className="text-sm mt-2">Add plots from the project detail view</p>
        </div>
      )}
    </div>
  );
};

export default PlotListInProject;