import type { GroundCover } from '../../../db/database';

interface GroundCoverFormProps {
  groundCover: GroundCover;
  onGroundCoverChange: (groundCover: GroundCover) => void;
}

const GroundCoverForm: React.FC<GroundCoverFormProps> = ({ groundCover, onGroundCoverChange }) => {
  const handleChange = (key: keyof GroundCover, value: number) => {
    onGroundCoverChange({
      ...groundCover,
      [key]: Math.max(0, Math.min(100, value))
    });
  };

  // Calculate total to show user
  const total = Object.values(groundCover).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Ground Cover (%)</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(groundCover).map(([key, value]) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-2 capitalize text-gray-700 dark:text-gray-300">
              {key}
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              min="0"
              max="100"
              value={value}
              onChange={(e) => handleChange(key as keyof GroundCover, parseInt(e.target.value) || 0)}
            />
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-600 rounded flex justify-between items-center">
        <span className="text-sm text-gray-700 dark:text-gray-300">Total:</span>
        <span className={`text-sm font-bold ${total > 100 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
          {total}%
        </span>
      </div>
      
      {total > 100 && (
        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300 text-sm">
          Total ground cover exceeds 100%. Please adjust values.
        </div>
      )}
    </div>
  );
};

export default GroundCoverForm;