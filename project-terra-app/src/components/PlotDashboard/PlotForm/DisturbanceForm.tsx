import type { Disturbance } from '../../../db/database';

interface DisturbanceFormProps {
  disturbance: Disturbance;
  onDisturbanceChange: (disturbance: Disturbance) => void;
}

const DisturbanceForm: React.FC<DisturbanceFormProps> = ({ disturbance, onDisturbanceChange }) => {
  const handleChange = (key: keyof Disturbance, value: boolean) => {
    onDisturbanceChange({
      ...disturbance,
      [key]: value
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Disturbance Indicators</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(disturbance).map(([key, value]) => (
          <label key={key} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(key as keyof Disturbance, e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DisturbanceForm;