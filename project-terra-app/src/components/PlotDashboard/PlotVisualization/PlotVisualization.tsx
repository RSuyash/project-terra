import type { VegetationPlot } from '../../../db/database';
import VisualPlotLayout from '../../VisualPlotLayout';

interface PlotVisualizationProps {
  plot: VegetationPlot;
}

const PlotVisualization: React.FC<PlotVisualizationProps> = ({ plot }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{plot.plotNumber}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <span className="font-medium">Dimensions:</span> {plot.dimensions.width}×{plot.dimensions.height}m
            </span>
            <span>
              <span className="font-medium">Area:</span> {plot.dimensions.area}m²
            </span>
            <span>
              <span className="font-medium">Habitat:</span> {plot.habitat || 'Not specified'}
            </span>
            <span>
              <span className="font-medium">Created:</span> {new Date(plot.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm">
            {plot.subplots?.length || 0} Subplots
          </div>
          <div className="inline-block ml-2 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-sm">
            {plot.quadrants?.length || 0} Quadrants
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Plot Layout</h3>
            <div className="flex justify-center">
              <VisualPlotLayout plot={plot} width={500} height={500} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Plot Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Observers:</span>
                <span className="text-gray-800 dark:text-white">{plot.observers.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="text-gray-800 dark:text-white">
                  {plot.location.latitude.toFixed(4)}, {plot.location.longitude.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Slope:</span>
                <span className="text-gray-800 dark:text-white">{plot.slope || 'N/A'}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Aspect:</span>
                <span className="text-gray-800 dark:text-white">{plot.aspect || 'N/A'}°</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Ground Cover</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shrub:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.shrub}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Herb:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.herb}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Grass:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.grass}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bare:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.bare}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rock:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.rock}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Litter:</span>
                <span className="text-gray-800 dark:text-white">{plot.groundCover.litter}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Disturbances</h3>
            <div className="space-y-1 text-sm">
              {Object.entries(plot.disturbance).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize text-gray-600 dark:text-gray-400">{key}:</span>
                  <span className={`font-medium ${value ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                    {value ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {plot.notes && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Notes</h3>
          <p className="text-gray-700 dark:text-gray-300">{plot.notes}</p>
        </div>
      )}
    </div>
  );
};

export default PlotVisualization;