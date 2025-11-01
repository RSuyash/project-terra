import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllSpecies, getPlotById, saveVegetationPlot, updateVegetationPlot } from '../db/database';
import type { PlotMeasurement, Species, Disturbance, Location, PlotDimensions, QuadrantData, Quadrant, Subplot, SubplotShape, VegetationPlot } from '../db/database';
import { GPSLocation } from './GPSLocation';
import VisualPlotLayout from './VisualPlotLayout';

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
  
  const [location, setLocation] = useState<Location | null>(null);
  
  const [dimensions, setDimensions] = useState({
    width: 10,
    height: 10,
    area: 100
  });
  
  const [quadrants, setQuadrants] = useState<QuadrantData[]>([]);
  const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | 'all' | null>(null); // null means overall plot
  
  const [subplots, setSubplots] = useState<Subplot[]>([]);
  const [currentSubplotName, setCurrentSubplotName] = useState('');
  const [currentSubplotShape, setCurrentSubplotShape] = useState<SubplotShape>('rectangular');
  const [currentSubplotWidth, setCurrentSubplotWidth] = useState<number>(1);
  const [currentSubplotHeight, setCurrentSubplotHeight] = useState<number>(1);
  const [currentSubplotRadius, setCurrentSubplotRadius] = useState<number>(1);
  const [currentSubplotX, setCurrentSubplotX] = useState<number>(0);
  const [currentSubplotY, setCurrentSubplotY] = useState<number>(0);
  
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
            setLocation({
              ...plot.location,
              source: plot.location.source || 'auto' // Default to 'auto' for existing plots
            });
            setDimensions({
              width: plot.dimensions.width,
              height: plot.dimensions.height,
              area: plot.dimensions.area
            });
            setQuadrants(plot.quadrants || []);
            setSubplots(plot.subplots || []);
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
  
  function handleLocationChange(newLocation: Location) {
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
  
  // Quadrant functions
  function addQuadrantMeasurement() {
    if (!currentSpeciesId) {
      alert('Please select a species');
      return;
    }
    
    // Create measurement object
    const measurement: PlotMeasurement = {
      speciesId: currentSpeciesId,
      gbh: currentMeasurement.gbh ? parseFloat(currentMeasurement.gbh) : undefined,
      dbh: currentMeasurement.dbh ? parseFloat(currentMeasurement.dbh) : undefined,
      height: currentMeasurement.height ? parseFloat(currentMeasurement.height) : undefined,
      heightAtFirstBranch: currentMeasurement.heightAtFirstBranch ? parseFloat(currentMeasurement.heightAtFirstBranch) : undefined,
      canopyCover: currentMeasurement.canopyCover ? parseFloat(currentMeasurement.canopyCover) : undefined,
    };
    
    if (selectedQuadrant === 'all') {
      // Add to all quadrants
      const updatedQuadrants = [...quadrants];
      for (const quad of ['NW', 'NE', 'SW', 'SE'] as Quadrant[]) {
        const existingQuadIndex = updatedQuadrants.findIndex(q => q.quadrant === quad);
        if (existingQuadIndex !== -1) {
          updatedQuadrants[existingQuadIndex].measurements.push(measurement);
        } else {
          updatedQuadrants.push({
            quadrant: quad,
            measurements: [measurement],
            groundCover: { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 },
            disturbance: { grazing: false, poaching: false, lopping: false, invasives: false, fire: false }
          });
        }
      }
      setQuadrants(updatedQuadrants);
    } else if (selectedQuadrant) {
      // Add to specific quadrant
      const quadIndex = quadrants.findIndex(q => q.quadrant === selectedQuadrant);
      if (quadIndex !== -1) {
        // Update existing quadrant
        const updatedQuadrants = [...quadrants];
        updatedQuadrants[quadIndex] = {
          ...updatedQuadrants[quadIndex],
          measurements: [...updatedQuadrants[quadIndex].measurements, measurement]
        };
        setQuadrants(updatedQuadrants);
      } else {
        // Add new quadrant
        setQuadrants([
          ...quadrants,
          {
            quadrant: selectedQuadrant,
            measurements: [measurement],
            groundCover: { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 },
            disturbance: { grazing: false, poaching: false, lopping: false, invasives: false, fire: false }
          }
        ]);
      }
    } else {
      // Add to overall plot
      setMeasurements([...measurements, measurement]);
    }
    
    // Reset the form
    setCurrentMeasurement({
      gbh: '',
      dbh: '',
      height: '',
      heightAtFirstBranch: '',
      canopyCover: '',
    });
    setCurrentSpeciesId(null);
  }
  
  function removeQuadrantMeasurement(quadrant: Quadrant, measurementIndex: number) {
    setQuadrants(prev => {
      return prev.map(q => {
        if (q.quadrant === quadrant) {
          return {
            ...q,
            measurements: q.measurements.filter((_, i) => i !== measurementIndex)
          };
        }
        return q;
      }).filter(q => q.measurements.length > 0); // Remove quadrant if no measurements left
    });
  }
  
  // Subplot functions
  function addSubplot() {
    if (!currentSubplotName.trim()) {
      alert('Please enter a subplot name');
      return;
    }
    
    const newSubplot: Subplot = {
      id: `subplot-${Date.now()}`, // Generate unique ID
      name: currentSubplotName,
      shape: currentSubplotShape,
      ...(currentSubplotShape === 'rectangular' 
        ? { width: currentSubplotWidth, height: currentSubplotHeight } 
        : { radius: currentSubplotRadius }),
      positionX: currentSubplotX,
      positionY: currentSubplotY,
      measurements: [],
      groundCover: { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 },
      disturbance: { grazing: false, poaching: false, lopping: false, invasives: false, fire: false }
    };
    
    setSubplots([...subplots, newSubplot]);
    
    // Reset form
    setCurrentSubplotName('');
    setCurrentSubplotWidth(1);
    setCurrentSubplotHeight(1);
    setCurrentSubplotRadius(1);
    setCurrentSubplotX(0);
    setCurrentSubplotY(0);
  }
  
  function removeSubplot(subplotId: string) {
    setSubplots(subplots.filter(subplot => subplot.id !== subplotId));
  }
  
  function addSubplotMeasurement(subplotId: string) {
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
    
    setSubplots(prev => 
      prev.map(subplot => 
        subplot.id === subplotId
          ? { ...subplot, measurements: [...subplot.measurements, measurement] }
          : subplot
      )
    );
    
    // Reset the measurement form
    setCurrentMeasurement({
      gbh: '',
      dbh: '',
      height: '',
      heightAtFirstBranch: '',
      canopyCover: '',
    });
    setCurrentSpeciesId(null);
  }
  
  function removeSubplotMeasurement(subplotId: string, measurementIndex: number) {
    setSubplots(prev => 
      prev.map(subplot => {
        if (subplot.id === subplotId) {
          const newMeasurements = [...subplot.measurements];
          newMeasurements.splice(measurementIndex, 1);
          return {
            ...subplot,
            measurements: newMeasurements
          };
        }
        return subplot;
      })
    );
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
      location: location!, // Use the full Location object
      dimensions: {
        width: dimensions.width,
        height: dimensions.height,
        area: dimensions.area,
        unit: 'm'
      },
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
      quadrants,
      subplots,
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
      
      {/* Plot Size */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Plot Size</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Standard Sizes</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '5×5m (25m²)', width: 5, height: 5, area: 25 },
                { label: '10×10m (100m²)', width: 10, height: 10, area: 100 },
                { label: '20×20m (400m²)', width: 20, height: 20, area: 400 },
                { label: '30×30m (900m²)', width: 30, height: 30, area: 900 },
                { label: '40×40m (1600m²)', width: 40, height: 40, area: 1600 }
              ].map((size) => (
                <button
                  key={size.label}
                  type="button"
                  className={`btn-secondary py-2 text-sm ${
                    dimensions.width === size.width && dimensions.height === size.height
                      ? 'bg-primary-600 text-white border-primary-600'
                      : ''
                  }`}
                  onClick={() => setDimensions({ width: size.width, height: size.height, area: size.area })}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Custom Size</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1">Width (m)</label>
                <input
                  type="number"
                  className="input-field text-sm"
                  min="1"
                  max="100"
                  value={dimensions.width}
                  onChange={(e) => {
                    const width = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                    setDimensions({
                      width,
                      height: dimensions.height,
                      area: width * dimensions.height
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Height (m)</label>
                <input
                  type="number"
                  className="input-field text-sm"
                  min="1"
                  max="100"
                  value={dimensions.height}
                  onChange={(e) => {
                    const height = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                    setDimensions({
                      width: dimensions.width,
                      height,
                      area: dimensions.width * height
                    });
                  }}
                />
              </div>
            </div>
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">Calculated Area</div>
              <div className="text-lg font-bold">{dimensions.area} m²</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Visual Plot Layout */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Plot Layout Visualization</h3>
        <div className="flex justify-center">
          <VisualPlotLayout 
            plot={{
              id: plotId ?? undefined,
              plotNumber,
              location: location || { latitude: 0, longitude: 0, accuracy: 0, source: 'manual' },
              dimensions,
              date: new Date(),
              observers: observers.split(',').map(o => o.trim()).filter(o => o),
              habitat,
              notes,
              groundCover,
              disturbance,
              measurements,
              quadrants,
              subplots,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as VegetationPlot}
          />
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
      
      {/* Quadrant-Specific Data */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Quadrant-Specific Data</h3>
        
        <div className="space-y-4">
          {(['NW', 'NE', 'SW', 'SE'] as Quadrant[]).map((quad) => {
            const quadData = quadrants.find(q => q.quadrant === quad);
            const quadGroundCover = quadData ? quadData.groundCover : { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 };
            const quadDisturbance = quadData ? quadData.disturbance : { grazing: false, poaching: false, lopping: false, invasives: false, fire: false };
            
            return (
              <div key={quad} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3 text-lg">{quad} Quadrant</h4>
                
                <div className="mb-4">
                  <h5 className="font-medium mb-2">Ground Cover (%)</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(quadGroundCover).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
                        <input
                          type="number"
                          className="input-field"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            setQuadrants(prev => {
                              const quadIndex = prev.findIndex(q => q.quadrant === quad);
                              if (quadIndex !== -1) {
                                const updatedQuadrants = [...prev];
                                updatedQuadrants[quadIndex] = {
                                  ...updatedQuadrants[quadIndex],
                                  groundCover: {
                                    ...updatedQuadrants[quadIndex].groundCover,
                                    [key]: newValue
                                  }
                                };
                                return updatedQuadrants;
                              } else {
                                // Create new quadrant if it doesn't exist
                                return [
                                  ...prev,
                                  {
                                    quadrant: quad,
                                    measurements: [],
                                    groundCover: {
                                      shrub: key === 'shrub' ? newValue : quadGroundCover.shrub,
                                      herb: key === 'herb' ? newValue : quadGroundCover.herb,
                                      grass: key === 'grass' ? newValue : quadGroundCover.grass,
                                      bare: key === 'bare' ? newValue : quadGroundCover.bare,
                                      rock: key === 'rock' ? newValue : quadGroundCover.rock,
                                      litter: key === 'litter' ? newValue : quadGroundCover.litter
                                    },
                                    disturbance: quadDisturbance
                                  }
                                ];
                              }
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h5 className="font-medium mb-2">Disturbance Indicators</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(quadDisturbance).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!value}
                          onChange={(e) => {
                            setQuadrants(prev => {
                              const quadIndex = prev.findIndex(q => q.quadrant === quad);
                              if (quadIndex !== -1) {
                                const updatedQuadrants = [...prev];
                                updatedQuadrants[quadIndex] = {
                                  ...updatedQuadrants[quadIndex],
                                  disturbance: {
                                    ...updatedQuadrants[quadIndex].disturbance,
                                    [key]: e.target.checked
                                  }
                                };
                                return updatedQuadrants;
                              } else {
                                // Create new quadrant if it doesn't exist
                                return [
                                  ...prev,
                                  {
                                    quadrant: quad,
                                    measurements: [],
                                    groundCover: quadGroundCover,
                                    disturbance: {
                                      grazing: key === 'grazing' ? e.target.checked : quadDisturbance.grazing,
                                      poaching: key === 'poaching' ? e.target.checked : quadDisturbance.poaching,
                                      lopping: key === 'lopping' ? e.target.checked : quadDisturbance.lopping,
                                      invasives: key === 'invasives' ? e.target.checked : quadDisturbance.invasives,
                                      fire: key === 'fire' ? e.target.checked : quadDisturbance.fire
                                    }
                                  }
                                ];
                              }
                            });
                          }}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm capitalize">{key}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Subplot Management */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Subplot Management</h3>
        
        {/* Add Subplot Form */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subplot Name</label>
              <input
                type="text"
                className="input-field"
                value={currentSubplotName}
                onChange={(e) => setCurrentSubplotName(e.target.value)}
                placeholder="e.g., Corner Herb Plot, Center Tree Plot"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Shape</label>
              <select
                className="input-field"
                value={currentSubplotShape}
                onChange={(e) => setCurrentSubplotShape(e.target as SubplotShape)}
              >
                <option value="rectangular">Rectangular</option>
                <option value="circular">Circular</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentSubplotShape === 'rectangular' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Width (m)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0.1"
                    step="0.1"
                    value={currentSubplotWidth}
                    onChange={(e) => setCurrentSubplotWidth(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Height (m)</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0.1"
                    step="0.1"
                    value={currentSubplotHeight}
                    onChange={(e) => setCurrentSubplotHeight(parseFloat(e.target.value) || 1)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Radius (m)</label>
                <input
                  type="number"
                  className="input-field"
                  min="0.1"
                  step="0.1"
                  value={currentSubplotRadius}
                  onChange={(e) => setCurrentSubplotRadius(parseFloat(e.target.value) || 1)}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Position (X, Y) in meters from NW corner</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  className="input-field flex-1"
                  min="0"
                  max={dimensions.width}
                  step="0.1"
                  value={currentSubplotX}
                  onChange={(e) => setCurrentSubplotX(parseFloat(e.target.value) || 0)}
                  placeholder="X"
                />
                <input
                  type="number"
                  className="input-field flex-1"
                  min="0"
                  max={dimensions.height}
                  step="0.1"
                  value={currentSubplotY}
                  onChange={(e) => setCurrentSubplotY(parseFloat(e.target.value) || 0)}
                  placeholder="Y"
                />
              </div>
            </div>
          </div>
          
          <button 
            className="btn-primary w-full" 
            onClick={addSubplot}
          >
            Add Subplot
          </button>
        </div>
        
        {/* Existing Subplots */}
        {subplots.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Defined Subplots ({subplots.length})</h4>
            {subplots.map((subplot) => (
              <div key={subplot.id} className="border rounded-lg p-4 bg-gray-100 dark:bg-gray-700/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-semibold">{subplot.name || subplot.id}</h5>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {subplot.shape === 'rectangular' 
                        ? `${subplot.width}×${subplot.height}m rectangular subplot at (${subplot.positionX}, ${subplot.positionY})m`
                        : `Circular subplot with ${subplot.radius}m radius at (${subplot.positionX}, ${subplot.positionY})m`}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subplot.measurements.length} measurements
                    </div>
                  </div>
                  <button
                    onClick={() => removeSubplot(subplot.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                  >
                    Remove
                  </button>
                </div>
                
                {/* Add measurement to this subplot */}
                <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                  <h6 className="font-medium mb-2">Add Measurement</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Species</label>
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
                    
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">GBH (cm)</label>
                          <input
                            type="number"
                            className="input-field text-sm"
                            value={currentMeasurement.gbh}
                            onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, gbh: e.target.value })}
                            placeholder="cm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1">DBH (cm)</label>
                          <input
                            type="number"
                            className="input-field text-sm"
                            value={currentMeasurement.dbh}
                            onChange={(e) => setCurrentMeasurement({ ...currentMeasurement, dbh: e.target.value })}
                            placeholder="cm"
                          />
                        </div>
                      </div>
                      
                      <button
                        className="btn-primary w-full"
                        onClick={() => addSubplotMeasurement(subplot.id)}
                      >
                        Add to {subplot.name || 'Subplot'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Subplot measurements */}
                  {subplot.measurements.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h6 className="font-medium text-sm">Measurements ({subplot.measurements.length})</h6>
                      {subplot.measurements.map((measurement, index) => {
                        const species = speciesList.find(s => s.id === measurement.speciesId);
                        return (
                          <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{species?.name || 'Unknown'}</span>
                              <span className="ml-2 text-gray-600 dark:text-gray-400">
                                {measurement.gbh && `GBH: ${measurement.gbh}cm `}
                                {measurement.dbh && `DBH: ${measurement.dbh}cm `}
                                {measurement.height && `H: ${measurement.height}m `}
                              </span>
                            </div>
                            <button
                              onClick={() => removeSubplotMeasurement(subplot.id, index)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No subplots defined yet. Add a subplot to start collecting subplot-specific data.
          </p>
        )}
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
          
          <div>
            <label className="block text-sm font-medium mb-2">Assign to Quadrant</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <button
                type="button"
                className={`btn-secondary py-2 text-sm ${
                  selectedQuadrant === null
                    ? 'bg-primary-600 text-white border-primary-600'
                    : ''
                }`}
                onClick={() => setSelectedQuadrant(null)}
              >
                Overall
              </button>
              {(['NW', 'NE', 'SW', 'SE'] as Quadrant[]).map((quad) => (
                <button
                  type="button"
                  key={quad}
                  className={`btn-secondary py-2 text-sm ${
                    selectedQuadrant === quad
                      ? 'bg-primary-600 text-white border-primary-600'
                      : ''
                  }`}
                  onClick={() => setSelectedQuadrant(quad)}
                >
                  {quad}
                </button>
              ))}
              <button
                type="button"
                className={`btn-secondary py-2 text-sm ${
                  selectedQuadrant === 'all'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : ''
                }`}
                onClick={() => setSelectedQuadrant('all')}
              >
                All
              </button>
            </div>
          </div>
          
          <button className="btn-primary w-full flex items-center justify-center" onClick={addQuadrantMeasurement}>
            <PlusIcon />
            Add to {selectedQuadrant ? (selectedQuadrant === 'all' ? 'All Quadrants' : selectedQuadrant) : 'Overall Plot'}
          </button>
        </div>
        
        {/* Overall Plot Measurements */}
        {measurements.length > 0 && (
          <div className="mt-6 space-y-2">
            <h4 className="font-bold">Overall Plot Measurements ({measurements.length})</h4>
            {measurements.map((measurement, index) => {
              const species = speciesList.find(s => s.id === measurement.speciesId);
              return (
                <div key={`overall-${index}`} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center">
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
                    onClick={() => {
                      const newMeasurements = [...measurements];
                      newMeasurements.splice(index, 1);
                      setMeasurements(newMeasurements);
                    }}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold"
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
            <h4 className="font-bold">Quadrant-Specific Measurements</h4>
            {quadrants.map((quad, quadIndex) => (
              <div key={quad.quadrant} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/30">
                <h5 className="font-semibold mb-2">{quad.quadrant} Quadrant ({quad.measurements.length} measurements)</h5>
                <div className="space-y-2">
                  {quad.measurements.map((measurement, measurementIndex) => {
                    const species = speciesList.find(s => s.id === measurement.speciesId);
                    return (
                      <div key={`quad-${quad.quadrant}-${measurementIndex}`} className="bg-white dark:bg-gray-700 p-2 rounded flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{species?.name || 'Unknown'}</span>
                          <span className="text-xs ml-2 text-gray-600 dark:text-gray-300">
                            {measurement.gbh && `GBH: ${measurement.gbh}cm `}
                            {measurement.dbh && `DBH: ${measurement.dbh}cm `}
                            {measurement.height && `H: ${measurement.height}m `}
                            {measurement.canopyCover && `C: ${measurement.canopyCover}%`}
                          </span>
                        </div>
                        <button
                          onClick={() => removeQuadrantMeasurement(quad.quadrant, measurementIndex)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
