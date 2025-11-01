import { useState, useEffect } from 'react';
import type { PlotMeasurement, Species, QuadrantData, Quadrant } from '../../../db/database';
import { getAllSpecies } from '../../../db/database';

interface SpeciesMeasurementFormProps {
  measurements: PlotMeasurement[];
  onMeasurementsChange: (measurements: PlotMeasurement[]) => void;
  quadrants: QuadrantData[];
  onQuadrantsChange: (quadrants: QuadrantData[]) => void;
}

const SpeciesMeasurementForm: React.FC<SpeciesMeasurementFormProps> = ({ 
  measurements, 
  onMeasurementsChange, 
  quadrants,
  onQuadrantsChange
}) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [currentSpeciesId, setCurrentSpeciesId] = useState<number | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    gbh: '',
    dbh: '',
    height: '',
    heightAtFirstBranch: '',
    canopyCover: '',
  });
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | 'all' | null>(null);

  useEffect(() => {
    loadSpecies();
  }, []);

  const loadSpecies = async () => {
    try {
      const species = await getAllSpecies();
      setSpeciesList(species);
    } catch (error) {
      console.error('Failed to load species:', error);
    }
  };

  const addMeasurement = () => {
    if (!currentSpeciesId) {
      alert('Please select a species');
      return;
    }

    const measurement: PlotMeasurement = {
      speciesId: currentSpeciesId,
      ...(currentMeasurement.gbh && { gbh: parseFloat(currentMeasurement.gbh) }),
      ...(currentMeasurement.dbh && { dbh: parseFloat(currentMeasurement.dbh) }),
      ...(currentMeasurement.height && { height: parseFloat(currentMeasurement.height) }),
      ...(currentMeasurement.heightAtFirstBranch && { heightAtFirstBranch: parseFloat(currentMeasurement.heightAtFirstBranch) }),
      ...(currentMeasurement.canopyCover && { canopyCover: parseFloat(currentMeasurement.canopyCover) }),
    };

    if (selectedQuadrant && selectedQuadrant !== 'all') {
      // Add to specific quadrant
      const updatedQuadrants = [...quadrants];
      const quadrantIndex = updatedQuadrants.findIndex(q => q.quadrant === selectedQuadrant);
      
      if (quadrantIndex !== -1) {
        updatedQuadrants[quadrantIndex] = {
          ...updatedQuadrants[quadrantIndex],
          measurements: [...updatedQuadrants[quadrantIndex].measurements, measurement]
        };
      } else {
        // Create new quadrant if it doesn't exist
        updatedQuadrants.push({
          quadrant: selectedQuadrant,
          measurements: [measurement],
          groundCover: { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 },
          disturbance: { grazing: false, poaching: false, lopping: false, invasives: false, fire: false }
        });
      }
      
      onQuadrantsChange(updatedQuadrants);
    } else {
      // Add to overall plot
      onMeasurementsChange([...measurements, measurement]);
    }

    // Reset form
    setCurrentSpeciesId(null);
    setCurrentMeasurement({
      gbh: '',
      dbh: '',
      height: '',
      heightAtFirstBranch: '',
      canopyCover: '',
    });
  };

  const removeMeasurement = (index: number) => {
    onMeasurementsChange(measurements.filter((_, i) => i !== index));
  };

  const removeQuadrantMeasurement = (quadrant: Quadrant, index: number) => {
    const updatedQuadrants = [...quadrants];
    const quadrantIndex = updatedQuadrants.findIndex(q => q.quadrant === quadrant);
    
    if (quadrantIndex !== -1) {
      const updatedMeasurements = updatedQuadrants[quadrantIndex].measurements.filter((_, i) => i !== index);
      updatedQuadrants[quadrantIndex] = {
        ...updatedQuadrants[quadrantIndex],
        measurements: updatedMeasurements
      };
      
      // If no measurements left, remove the quadrant
      if (updatedMeasurements.length === 0) {
        updatedQuadrants.splice(quadrantIndex, 1);
      }
      
      onQuadrantsChange(updatedQuadrants);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Species Measurements</h3>
      
      <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Species *</label>
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={currentSpeciesId || ''}
            onChange={(e) => setCurrentSpeciesId(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Select species...</option>
            {speciesList.map((species) => (
              <option key={species.id} value={species.id}>
                {species.name} {species.scientificName && `(${species.scientificName})`}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">GBH (cm)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={currentMeasurement.gbh}
              onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, gbh: e.target.value })}
              placeholder="cm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">DBH (cm)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={currentMeasurement.dbh}
              onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, dbh: e.target.value })}
              placeholder="cm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Height (m)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={currentMeasurement.height}
              onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, height: e.target.value })}
              placeholder="m"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">1st Branch (m)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={currentMeasurement.heightAtFirstBranch}
              onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, heightAtFirstBranch: e.target.value })}
              placeholder="m"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Canopy (%)</label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              value={currentMeasurement.canopyCover}
              onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, canopyCover: e.target.value })}
              placeholder="%"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Assign to Quadrant</label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <button
              type="button"
              className={`py-2 text-sm ${
                selectedQuadrant === null
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
              } border rounded`}
              onClick={() => setSelectedQuadrant(null)}
            >
              Overall
            </button>
            {(['NW', 'NE', 'SW', 'SE'] as Quadrant[]).map((quad) => (
              <button
                type="button"
                key={quad}
                className={`py-2 text-sm ${
                  selectedQuadrant === quad
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                } border rounded`}
                onClick={() => setSelectedQuadrant(quad)}
              >
                {quad}
              </button>
            ))}
          </div>
        </div>
        
        <button 
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" 
          onClick={addMeasurement}
        >
          Add to {selectedQuadrant ? (selectedQuadrant === 'all' ? 'All Quadrants' : selectedQuadrant) : 'Overall Plot'}
        </button>
      </div>
      
      {/* Overall Plot Measurements */}
      {measurements.length > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-gray-800 dark:text-white">Overall Plot Measurements ({measurements.length})</h4>
          {measurements.map((measurement, index) => {
            const species = speciesList.find(s => s.id === measurement.speciesId);
            return (
              <div key={`overall-${index}`} className="bg-white dark:bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800 dark:text-white">{species?.name || 'Unknown'}</span>
                  <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                    {measurement.gbh && `GBH: ${measurement.gbh}cm `}
                    {measurement.dbh && `DBH: ${measurement.dbh}cm `}
                    {measurement.height && `H: ${measurement.height}m `}
                    {measurement.canopyCover && `C: ${measurement.canopyCover}%`}
                  </span>
                </div>
                <button
                  onClick={() => removeMeasurement(index)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Quadrant Measurements */}
      {quadrants.length > 0 && (
        <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-gray-800 dark:text-white">Quadrant-Specific Measurements</h4>
          {quadrants.map((quad, quadIndex) => (
            <div key={quad.quadrant} className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700/50">
              <h5 className="font-medium text-gray-800 dark:text-white mb-2">{quad.quadrant} Quadrant ({quad.measurements.length} measurements)</h5>
              <div className="space-y-2">
                {quad.measurements.length > 0 ? (
                  quad.measurements.map((measurement, measurementIndex) => {
                    const species = speciesList.find(s => s.id === measurement.speciesId);
                    return (
                      <div key={`quad-${quad.quadrant}-${measurementIndex}`} className="bg-gray-50 dark:bg-gray-600 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className="font-medium text-gray-800 dark:text-white">{species?.name || 'Unknown'}</span>
                          <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                            {measurement.gbh && `GBH: ${measurement.gbh}cm `}
                            {measurement.dbh && `DBH: ${measurement.dbh}cm `}
                            {measurement.height && `H: ${measurement.height}m `}
                            {measurement.canopyCover && `C: ${measurement.canopyCover}%`}
                          </span>
                        </div>
                        <button
                          onClick={() => removeQuadrantMeasurement(quad.quadrant, measurementIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No measurements</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeciesMeasurementForm;