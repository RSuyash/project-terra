import { useState, useEffect } from 'react';
import type { VegetationPlot } from '../../../db/database';
import { getAllPlots } from '../../../db/database';

interface PlotListProps {
  onPlotSelect: (plot: VegetationPlot) => void;
  onPlotEdit: (plot: VegetationPlot) => void;
  onCanopyAnalysis?: (plot: VegetationPlot) => void;
  selectedPlotId?: number;
}

const PlotList: React.FC<PlotListProps> = ({ onPlotSelect, onPlotEdit, onCanopyAnalysis, selectedPlotId }) => {
  const [plots, setPlots] = useState<VegetationPlot[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlots();
  }, []);

  const loadPlots = async () => {
    try {
      const plotData = await getAllPlots();
      setPlots(plotData);
    } catch (error) {
      console.error('Failed to load plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlots = plots.filter(plot =>
    plot.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.habitat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plot.observers.some(observer => 
      observer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search plots..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {filteredPlots.length > 0 ? (
          filteredPlots.map(plot => (
            <div
              key={plot.id}
              className={`p-3 rounded-lg transition-colors ${
                selectedPlotId === plot.id
                  ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-grow cursor-pointer"
                  onClick={() => onPlotSelect(plot)}
                >
                  <div className="flex items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-white mr-3">{plot.plotNumber}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full">
                      {plot.dimensions.width}×{plot.dimensions.height}m
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {plot.habitat || 'No habitat specified'}
                  </p>
                  <div className="flex text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{plot.subplots?.length || 0} subplots</span>
                    <span className="mx-2">•</span>
                    <span>{plot.quadrants?.length || 0} quadrants</span>
                    <span className="mx-2">•</span>
                    <span>{plot.measurements.length} measurements</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(plot.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => onPlotEdit(plot)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                    onClick={() => onPlotSelect(plot)}
                  >
                    View
                  </button>
                  {onCanopyAnalysis ? (
                    <button
                      className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() => onCanopyAnalysis(plot)}
                    >
                      Canopy
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No plots found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlotList;