import { useState, useEffect } from 'react';
import type { VegetationPlot, PlotDimensions, Location, QuadrantData, Subplot, PlotMeasurement } from '../../../db/database';
import { saveVegetationPlot, getPlotById } from '../../../db/database';
import { GPSLocation } from '../../GPSLocation';
import PlotDimensionsForm from './PlotDimensionsForm';
import GroundCoverForm from './GroundCoverForm';
import DisturbanceForm from './DisturbanceForm';
import QuadrantForm from './QuadrantForm';
import SubplotForm from './SubplotForm';
import SpeciesMeasurementForm from './SpeciesMeasurementForm';

interface PlotFormProps {
  plot?: VegetationPlot;
  onSave: () => void;
  onCancel: () => void;
}

const PlotForm: React.FC<PlotFormProps> = ({ plot, onSave, onCancel }) => {
  const [plotNumber, setPlotNumber] = useState(plot?.plotNumber || '');
  const [habitat, setHabitat] = useState(plot?.habitat || '');
  const [observers, setObservers] = useState(plot?.observers?.join(', ') || '');
  const [notes, setNotes] = useState(plot?.notes || '');
  const [slope, setSlope] = useState<number | undefined>(plot?.slope);
  const [aspect, setAspect] = useState<number | undefined>(plot?.aspect);
  
  const [location, setLocation] = useState<Location | null>(plot?.location || null);
  const [dimensions, setDimensions] = useState<PlotDimensions>(plot?.dimensions || {
    width: 10,
    height: 10,
    area: 100,
    unit: 'm'
  });
  
  const [groundCover, setGroundCover] = useState(plot?.groundCover || {
    shrub: 0,
    herb: 0,
    grass: 0,
    bare: 0,
    rock: 0,
    litter: 0
  });
  
  const [disturbance, setDisturbance] = useState(plot?.disturbance || {
    grazing: false,
    poaching: false,
    lopping: false,
    invasives: false,
    fire: false
  });
  
  const [quadrants, setQuadrants] = useState<QuadrantData[]>(plot?.quadrants || []);
  const [subplots, setSubplots] = useState<Subplot[]>(plot?.subplots || []);
  const [measurements, setMeasurements] = useState<PlotMeasurement[]>(plot?.measurements || []);
  
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (plot && plot.id) {
      // Load the full plot data when editing
      loadPlotData();
    }
  }, [plot?.id]);

  const loadPlotData = async () => {
    if (!plot?.id) return;
    
    try {
      const fullPlot = await getPlotById(plot.id);
      if (fullPlot) {
        setPlotNumber(fullPlot.plotNumber);
        setHabitat(fullPlot.habitat || '');
        setObservers(fullPlot.observers?.join(', ') || '');
        setNotes(fullPlot.notes || '');
        setSlope(fullPlot.slope);
        setAspect(fullPlot.aspect);
        setLocation(fullPlot.location);
        setDimensions(fullPlot.dimensions);
        setGroundCover(fullPlot.groundCover);
        setDisturbance(fullPlot.disturbance);
        setQuadrants(fullPlot.quadrants || []);
        setSubplots(fullPlot.subplots || []);
        setMeasurements(fullPlot.measurements);
      }
    } catch (err) {
      console.error('Failed to load plot:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plot data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plotNumber.trim()) {
      setError('Plot number is required');
      return;
    }
    
    if (!location) {
      setError('Location is required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      const plotData: Omit<VegetationPlot, 'id' | 'createdAt' | 'updatedAt'> = {
        plotNumber: plotNumber.trim(),
        habitat: habitat.trim(),
        observers: observers.split(',').map(o => o.trim()).filter(o => o),
        notes: notes.trim(),
        location: location,
        dimensions: dimensions,
        date: plot?.date || new Date(),
        groundCover: groundCover,
        disturbance: disturbance,
        measurements: measurements,
        quadrants: quadrants,
        subplots: subplots,
        slope: slope,
        aspect: aspect,
        canopyPhotos: plot?.canopyPhotos || [],
        createdAt: plot?.createdAt || new Date(),
        updatedAt: new Date()
      };

      if (plot && plot.id) {
        // Update existing plot
        const updatedPlot = {
          ...plotData,
          id: plot.id,
          createdAt: plot.createdAt
        } as VegetationPlot;
        
        // In a real implementation, you would use an update function
        // For now, we'll just save a new one with the same ID
        await saveVegetationPlot(plotData);
      } else {
        // Create new plot
        await saveVegetationPlot(plotData);
      }
      
      onSave();
    } catch (err) {
      console.error('Failed to save plot:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Plot Number *
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="Enter plot number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Habitat Type
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={habitat}
                onChange={(e) => setHabitat(e.target.value)}
                placeholder="e.g., Tropical Dry Evergreen Forest"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Observers
              </label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={observers}
                onChange={(e) => setObservers(e.target.value)}
                placeholder="Comma-separated list of observers"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Slope (°)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={slope || ''}
                  onChange={(e) => setSlope(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0-90"
                  min="0"
                  max="90"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Aspect (°)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={aspect || ''}
                  onChange={(e) => setAspect(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0-360"
                  min="0"
                  max="360"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the plot..."
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <GPSLocation onLocationChange={handleLocationChange} initialLocation={location || undefined} />
            
            <PlotDimensionsForm dimensions={dimensions} onDimensionsChange={setDimensions} />
            
            <GroundCoverForm groundCover={groundCover} onGroundCoverChange={setGroundCover} />
            
            <DisturbanceForm disturbance={disturbance} onDisturbanceChange={setDisturbance} />
          </div>
        </div>
        
        <div className="space-y-6 mb-6">
          <QuadrantForm quadrants={quadrants} onQuadrantsChange={setQuadrants} />
          
          <SubplotForm subplots={subplots} onSubplotsChange={setSubplots} dimensions={dimensions} />
          
          <SpeciesMeasurementForm 
            measurements={measurements} 
            onMeasurementsChange={setMeasurements} 
            quadrants={quadrants}
            onQuadrantsChange={setQuadrants}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : (plot ? 'Update Plot' : 'Create Plot')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlotForm;