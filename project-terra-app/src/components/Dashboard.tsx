import { useEffect, useState } from 'react';
import { getAllPlots, getAllSpecies, getAllProjects } from '../db/database';
import type { VegetationPlot, Species, Project } from '../db/database';

const Dashboard = () => {
  const [plots, setPlots] = useState<VegetationPlot[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [plotData, speciesData, projectData] = await Promise.all([
          getAllPlots(),
          getAllSpecies(),
          getAllProjects()
        ]);
        
        setPlots(plotData);
        setSpecies(speciesData);
        setProjects(projectData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate dashboard metrics
  const totalPlots = plots.length;
  const totalSpecies = species.length;
  const totalProjects = projects.length;
  const totalAreaSampled = plots.reduce((sum, plot) => sum + (plot.dimensions?.area || 0), 0);
  const plotsByHabitat = plots.reduce((acc, plot) => {
    const habitat = plot.habitat || 'Unknown';
    acc[habitat] = (acc[habitat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Project Terra Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your ecological fieldwork data and projects
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Plots Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Total Plots</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPlots}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {plots.filter(p => p.date && new Date(p.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} 
              {' '}added this week
            </p>
          </div>

          {/* Total Species Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Species Cataloged</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalSpecies}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">In {plots.length > 0 ? plots[0].plotNumber : 'plots'}</p>
          </div>

          {/* Total Projects Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Projects</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalProjects}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {projects.filter(p => p.updatedDate && new Date(p.updatedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} 
              {' '}active this week
            </p>
          </div>

          {/* Total Area Sampled Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-orange-500">
            <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Area Sampled</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalAreaSampled}m²</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Across {totalPlots} plots
            </p>
          </div>
        </div>

        {/* Charts and Plots Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plots by Habitat */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plots by Habitat</h3>
            <div className="space-y-3">
              {Object.entries(plotsByHabitat).map(([habitat, count]) => (
                <div key={habitat} className="flex items-center">
                  <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{habitat}</div>
                  <div className="flex-1 ml-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(count / totalPlots) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm font-medium text-gray-700 dark:text-gray-300">{count}</div>
                </div>
              ))}
              {Object.keys(plotsByHabitat).length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No habitat data available</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {plots
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((plot) => (
                  <div key={plot.id} className="flex items-start border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                        {plot.plotNumber.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{plot.plotNumber}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(plot.date).toLocaleDateString()} • {plot.dimensions.width}×{plot.dimensions.height}m
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plot.subplots?.length || 0} subplots • {plot.measurements.length} measurements
                      </p>
                    </div>
                  </div>
                ))}
              {plots.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/plots/new" 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
            >
              Create New Plot
            </a>
            <a 
              href="/plots" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
            >
              View All Plots
            </a>
            <a 
              href="/projects" 
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-105"
            >
              Manage Projects
            </a>
          </div>
        </div>

        {/* Data Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {plots.reduce((sum, plot) => sum + (plot.quadrants?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quadrants</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {plots.reduce((sum, plot) => sum + (plot.subplots?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subplots</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {plots.reduce((sum, plot) => sum + plot.measurements.length, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Measurements</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                {species.reduce((sum, spec) => sum + (spec.commonNames?.length || 0), 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Common Names</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;