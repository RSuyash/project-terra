import { useState } from 'react';
import type { QuadrantData, Quadrant, GroundCover, Disturbance } from '../../../db/database';

interface QuadrantFormProps {
  quadrants: QuadrantData[];
  onQuadrantsChange: (quadrants: QuadrantData[]) => void;
}

const QuadrantForm: React.FC<QuadrantFormProps> = ({ quadrants, onQuadrantsChange }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null);
  
  const quadrantsList: Quadrant[] = ['NW', 'NE', 'SW', 'SE'];
  
  const selectedQuadrantData = selectedQuadrant 
    ? quadrants.find(q => q.quadrant === selectedQuadrant)
    : null;

  const handleQuadrantChange = (quadrant: Quadrant, field: keyof QuadrantData['groundCover'], value: number) => {
    const updatedQuadrants = [...quadrants];
    const index = updatedQuadrants.findIndex(q => q.quadrant === quadrant);
    
    if (index !== -1) {
      updatedQuadrants[index] = {
        ...updatedQuadrants[index],
        groundCover: {
          ...updatedQuadrants[index].groundCover,
          [field]: value
        }
      };
    } else {
      updatedQuadrants.push({
        quadrant,
        measurements: [],
        groundCover: {
          shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0
        } as GroundCover,
        disturbance: {
          grazing: false, poaching: false, lopping: false, invasives: false, fire: false
        } as Disturbance
      });
      updatedQuadrants[updatedQuadrants.length - 1].groundCover[field] = value;
    }
    
    onQuadrantsChange(updatedQuadrants);
  };

  const handleQuadrantDisturbanceChange = (quadrant: Quadrant, field: keyof QuadrantData['disturbance'], value: boolean) => {
    const updatedQuadrants = [...quadrants];
    const index = updatedQuadrants.findIndex(q => q.quadrant === quadrant);
    
    if (index !== -1) {
      updatedQuadrants[index] = {
        ...updatedQuadrants[index],
        disturbance: {
          ...updatedQuadrants[index].disturbance,
          [field]: value
        }
      };
    } else {
      updatedQuadrants.push({
        quadrant,
        measurements: [],
        groundCover: {
          shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0
        } as GroundCover,
        disturbance: {
          grazing: false, poaching: false, lopping: false, invasives: false, fire: false
        } as Disturbance
      });
      updatedQuadrants[updatedQuadrants.length - 1].disturbance[field] = value;
    }
    
    onQuadrantsChange(updatedQuadrants);
  };

  const removeQuadrant = (quadrant: Quadrant) => {
    onQuadrantsChange(quadrants.filter(q => q.quadrant !== quadrant));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Quadrant-Specific Data</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {quadrantsList.map((quad) => {
          const exists = quadrants.some(q => q.quadrant === quad);
          return (
            <button
              key={quad}
              type="button"
              className={`py-2 text-sm ${
                selectedQuadrant === quad
                  ? 'bg-blue-500 text-white border-blue-500'
                  : exists
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
              } border rounded`}
              onClick={() => setSelectedQuadrant(quad === selectedQuadrant ? null : quad)}
            >
              {quad}
            </button>
          );
        })}
      </div>
      
      {selectedQuadrant && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-800 dark:text-white">
              {selectedQuadrant} Quadrant Data
            </h4>
            <button
              type="button"
              className="text-red-500 hover:text-red-700 text-sm"
              onClick={() => removeQuadrant(selectedQuadrant)}
            >
              Remove
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(selectedQuadrantData?.groundCover || {
              shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0
            }).map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1 capitalize text-gray-700 dark:text-gray-300">
                  {key}
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) => handleQuadrantChange(selectedQuadrant, key as keyof QuadrantData['groundCover'], parseInt(e.target.value) || 0)}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Disturbance Indicators</h5>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(selectedQuadrantData?.disturbance || {
                grazing: false, poaching: false, lopping: false, invasives: false, fire: false
              }).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => handleQuadrantDisturbanceChange(selectedQuadrant, key as keyof QuadrantData['disturbance'], e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm capitalize text-gray-700 dark:text-gray-300">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {quadrants.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {quadrants.length} of 4 quadrants configured
        </div>
      )}
    </div>
  );
};

export default QuadrantForm;