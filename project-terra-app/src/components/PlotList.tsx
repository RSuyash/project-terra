import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlots } from '../db/database';
import type { VegetationPlot } from '../db/database';

// A simple icon component for demonstration purposes
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
  </svg>
);

export function PlotList() {
  const [plots, setPlots] = useState<VegetationPlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlots() {
      try {
        const allPlots = await getAllPlots();
        setPlots(allPlots);
      } catch (error) {
        console.error("Failed to fetch plots:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlots();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Loading Plots...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">Saved Plots</h2>
        <Link to="/vegetation-plot" className="btn-primary flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Plot
        </Link>
      </div>

      {plots.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Plots Found</h3>
          <p className="text-gray-600 dark:text-gray-400">Get started by creating a new vegetation plot.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plots.map((plot) => (
            <div key={plot.id} className="card flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold truncate">{plot.plotNumber}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {plot.habitat || 'No habitat specified'}
                </p>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {plot.location ? `${plot.location.latitude.toFixed(6)}, ${plot.location.longitude.toFixed(6)}` : 'No GPS data'}
                  {plot.location?.source && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded">
                      {plot.location.source}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  {plot.dimensions ? `${plot.dimensions.width}×${plot.dimensions.height}m (${plot.dimensions.area}m²)` : 'No size data'}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4">
                  <span>
                    <strong className="font-semibold">{plot.measurements.length}</strong> measurements
                  </span>
                  <span>
                    <strong className="font-semibold">{new Set(plot.measurements.map(m => m.speciesId)).size}</strong> species
                  </span>
                </div>
                {plot.quadrants && plot.quadrants.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Quadrants: </span>
                    {plot.quadrants.length}/4 with data
                    {plot.quadrants.map(quad => (
                      <span key={quad.quadrant} className="ml-2 px-1.5 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 rounded text-xs">
                        {quad.quadrant}: {quad.measurements.length}
                      </span>
                    ))}
                  </div>
                )}
                {plot.subplots && plot.subplots.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Subplots: </span>
                    {plot.subplots.length} with data
                    {plot.subplots.map(subplot => (
                      <span key={subplot.id} className="ml-2 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded text-xs">
                        {subplot.name || subplot.id.split('-')[1]}: {subplot.measurements.length}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-between items-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Created: {new Date(plot.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/plot/${plot.id}/edit`} className="btn-secondary flex items-center">
                  <EditIcon />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}