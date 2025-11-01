import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllSpecies, getPlotById, saveVegetationPlot, updateVegetationPlot } from '../db/database';
import type { PlotMeasurement, Species, Disturbance } from '../db/database';
import { GPSLocation } from './GPSLocation';

// Icons for buttons
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7.707 10.293a1 1 0 010-1.414l3-3a1 1 0 011.414 1.414L9.414 9H14a1 1 0 110 2H9.414l2.707 2.707a1 1 0 01-1.414 1.414l-3-3z" />
    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
  </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
);


export default function VegetationPlotForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plotId, setPlotId] = useState<number | null>(null);

  const [plotNumber, setPlotNumber] = useState('');
  const [habitat, setHabitat] = useState('');
  const [observers, setObservers] = useState('');
  const [notes, setNotes] = useState('');
  
  const [groundCover, setGroundCover] = useState({
    shrub: 0,
    herb: 0,
    grass: 0,
    bare: 0,
    rock: 0,
    litter: 0,
  });
  
  const [disturbance, setDisturbance] = useState<Disturbance>({
    grazing: false,
    poaching: false,
    lopping: false,
    invasives: false,
    fire: false,
  });
  
  const [location, setLocation] = useState<{latitude: number; longitude: number; accuracy?: number} | null>(null);
  
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [measurements, setMeasurements] = useState<PlotMeasurement[]>([]);
  
  const [currentSpeciesId, setCurrentSpeciesId] = useState<number | null>(null);
  const [currentMeasurement, setCurrentMeasurement] = useState({
    gbh: '',
    dbh: '',
    height: '',
    heightAtFirstBranch: '',
    canopyCover: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        await loadSpecies();
        if (id) {
          const plotId = parseInt(id, 10);
          setPlotId(plotId);
          const plot = await getPlotById(plotId);
          if (plot) {
            setPlotNumber(plot.plotNumber);
            setHabitat(plot.habitat || '');
            setObservers(plot.observers.join(', '));
            setNotes(plot.notes || '');
            setGroundCover(plot.groundCover);
            setDisturbance(plot.disturbance || {
              grazing: false,
              poaching: false,
              lopping: false,
              invasives: false,
              fire: false
            });
            setLocation(plot.location);
            setMeasurements(plot.measurements);
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);
  
  async function loadSpecies() {
    const allSpecies = await getAllSpecies();
    setSpeciesList(allSpecies);
  }
  
  function handleLocationChange(newLocation: { latitude: number; longitude: number; accuracy: number; }) {
    setLocation(newLocation);
  }

  function addMeasurement() {
    if (!currentSpeciesId) {
      alert('Please select a species');
      return;
    }
    
    const measurement: PlotMeasurement = {
      speciesId: currentSpeciesId,
      gbh: currentMeasurement.gbh ? parseFloat(currentMeasurement.gbh) : undefined,
      dbh: currentMeasurement.dbh ? parseFloat(currentMeasurement.dbh) : undefined,
      height: currentMeasurement.height ? parseFloat(currentMeasurement.height) : undefined,
      heightAtFirstBranch: currentMeasurement.heightAtFirstBranch ? parseFloat(currentMeasurement.heightAtFirstBranch) : undefined,
      canopyCover: currentMeasurement.canopyCover ? parseFloat(currentMeasurement.canopyCover) : undefined,
    };
    
    setMeasurements([...measurements, measurement]);
    setCurrentMeasurement({
      gbh: '',
      dbh: '',
      height: '',
      heightAtFirstBranch: '',
      canopyCover: '',
    });
    setCurrentSpeciesId(null);
  }
  
  function removeMeasurement(index: number) {
    setMeasurements(measurements.filter((_, i) => i !== index));
  }
  
  async function savePlot() {
    if (!plotNumber.trim()) {
      alert('Please enter a plot number');
      return;
    }
    
    if (!location) {
      alert('Please capture GPS location');
      return;
    }
    
    const plotData = {
      plotNumber,
      habitat,
      observers: observers.split(',').map(o => o.trim()).filter(o => o),
      notes,
      location,
      date: new Date(),
      groundCover,
      disturbance: {
        grazing: !!disturbance.grazing,
        poaching: !!disturbance.poaching,
        lopping: !!disturbance.lopping,
        invasives: !!disturbance.invasives,
        fire: !!disturbance.fire
      },
      measurements,
    };

    try {
      if (plotId) {
        // For update, we need the full VegetationPlot object
        const existingPlot = await getPlotById(plotId);
        if (existingPlot) {
          const plotForUpdate = {
            ...plotData,
            id: plotId,
            createdAt: existingPlot.createdAt, // Preserve original creation date
            updatedAt: new Date()
          };
          await updateVegetationPlot(plotForUpdate);
        } else {
          // If we can't find the existing plot, throw an error
          throw new Error("Could not find existing plot to update");
        }
        alert('Plot updated successfully!');
      } else {
        await saveVegetationPlot(plotData);
        alert('Plot saved successfully!');
      }
      navigate('/plots');
    } catch (err) {
        console.error("Failed to save plot:", err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred while saving the plot.");
        }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-red-500">
        <h2 className="text-3xl font-bold">An Error Occurred</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          {plotId ? 'Edit Vegetation Plot' : 'New Vegetation Plot'}
        </h2>
        <button className="btn-secondary" onClick={() => navigate('/plots')}>
          Cancel
        </button>
      </div>
      
      {/* Basic Information */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Plot Number *</label>
            <input
              type="text"
              className="input-field"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              placeholder="e.g., PLOT-001"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Habitat</label>
            <input
              type="text"
              className="input-field"
              value={habitat}
              onChange={(e) => setHabitat(e.target.value)}
              placeholder="e.g., Tropical forest, Grassland"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Observers</label>
            <input
              type="text"
              className="input-field"
              value={observers}
              onChange={(e) => setObservers(e.target.value)}
              placeholder="Comma-separated names"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations..."
            />
          </div>
        </div>
      </div>
      
      <GPSLocation onLocationChange={handleLocationChange} />
      
      {/* Ground Cover */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Ground Cover (%)</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(groundCover).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
              <input
                type="number"
                className="input-field"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setGroundCover({ ...groundCover, [key]: parseInt(e.target.value) || 0 })}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Disturbance */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Disturbance Indicators</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(disturbance).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => {
                  setDisturbance(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }) as { grazing: boolean; poaching: boolean; lopping: boolean; invasives: boolean; fire: boolean });
                }}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm capitalize">{key}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Species Measurements */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Species Measurements</h3>
        
        {/* Add Measurement Form */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Species *</label>
            <select
              className="input-field"
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
              <label className="block text-xs font-medium mb-1">GBH (cm)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={currentMeasurement.gbh}
                onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, gbh: e.target.value })}
                placeholder="cm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">DBH (cm)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={currentMeasurement.dbh}
                onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, dbh: e.target.value })}
                placeholder="cm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Height (m)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={currentMeasurement.height}
                onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, height: e.target.value })}
                placeholder="m"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">1st Branch (m)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={currentMeasurement.heightAtFirstBranch}
                onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, heightAtFirstBranch: e.target.value })}
                placeholder="m"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Canopy (%)</label>
              <input
                type="number"
                className="input-field text-sm"
                value={currentMeasurement.canopyCover}
                onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, canopyCover: e.target.value })}
                placeholder="%"
              />
            </div>
          </div>
          
          <button className="btn-primary w-full flex items-center justify-center" onClick={addMeasurement}>
            <PlusIcon />
            Add Measurement
          </button>
        </div>
        
        {/* Existing Measurements */}
        {measurements.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-bold">Added Measurements ({measurements.length})</h4>
            {measurements.map((measurement, index) => {
              const species = speciesList.find(s => s.id === measurement.speciesId);
              return (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{species?.name || 'Unknown'}</span>
                    <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                      {measurement.gbh && `GBH: ${measurement.gbh}cm `}
                      {measurement.dbh && `DBH: ${measurement.dbh}cm `}
                      {measurement.height && `H: ${measurement.height}m `}
                      {measurement.canopyCover && `C: ${measurement.canopyCover}%`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeMeasurement(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button className="btn-secondary flex-1" onClick={() => navigate('/plots')}>
          Cancel
        </button>
        <button className="btn-primary flex-1 flex items-center justify-center" onClick={savePlot}>
          <SaveIcon />
          {plotId ? 'Update Plot' : 'Save Plot'}
        </button>
      </div>
    </div>
  );
}
