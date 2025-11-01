import type { PlotDimensions } from '../../../db/database';

interface PlotDimensionsFormProps {
  dimensions: PlotDimensions;
  onDimensionsChange: (dimensions: PlotDimensions) => void;
}

const PlotDimensionsForm: React.FC<PlotDimensionsFormProps> = ({ dimensions, onDimensionsChange }) => {
  const handleDimensionChange = (newDimensions: Partial<PlotDimensions>) => {
    onDimensionsChange({
      ...dimensions,
      ...newDimensions,
      area: (newDimensions.width || dimensions.width) * (newDimensions.height || dimensions.height)
    });
  };

  const standardSizes = [
    { label: '5×5m (25m²)', width: 5, height: 5, area: 25 },
    { label: '10×10m (100m²)', width: 10, height: 10, area: 100 },
    { label: '20×20m (400m²)', width: 20, height: 20, area: 400 },
    { label: '30×30m (900m²)', width: 30, height: 30, area: 900 },
    { label: '40×40m (1600m²)', width: 40, height: 40, area: 1600 }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Plot Dimensions</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Standard Sizes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {standardSizes.map((size) => (
            <button
              key={size.label}
              type="button"
              className={`py-2 text-sm ${
                dimensions.width === size.width && dimensions.height === size.height
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
              } border rounded`}
              onClick={() => handleDimensionChange({ width: size.width, height: size.height, area: size.area })}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Width (m)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={dimensions.width}
            onChange={(e) => {
              const width = Math.max(1, Math.min(100, parseFloat(e.target.value) || 1));
              handleDimensionChange({ width, area: width * dimensions.height });
            }}
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Height (m)
          </label>
          <input
            type="number"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={dimensions.height}
            onChange={(e) => {
              const height = Math.max(1, Math.min(100, parseFloat(e.target.value) || 1));
              handleDimensionChange({ height, area: dimensions.width * height });
            }}
            min="1"
            max="100"
          />
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
        <div className="text-sm text-blue-700 dark:text-blue-300">Calculated Area</div>
        <div className="text-xl font-bold text-blue-800 dark:text-blue-200">{dimensions.area} m²</div>
      </div>
    </div>
  );
};

export default PlotDimensionsForm;