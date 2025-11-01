import { useState } from 'react';
import type { Subplot, SubplotShape, PlotDimensions } from '../../../db/database';
import { subplotPresets, applySubplotPreset } from '../../../utils/subplotPresets';

interface SubplotFormProps {
  subplots: Subplot[];
  onSubplotsChange: (subplots: Subplot[]) => void;
  dimensions: PlotDimensions;
}

const SubplotForm: React.FC<SubplotFormProps> = ({ subplots, onSubplotsChange, dimensions }) => {
  const [currentSubplotName, setCurrentSubplotName] = useState('');
  const [currentSubplotShape, setCurrentSubplotShape] = useState<SubplotShape>('rectangular');
  const [currentSubplotWidth, setCurrentSubplotWidth] = useState<number>(1);
  const [currentSubplotHeight, setCurrentSubplotHeight] = useState<number>(1);
  const [currentSubplotRadius, setCurrentSubplotRadius] = useState<number>(1);
  const [currentSubplotX, setCurrentSubplotX] = useState<number>(0);
  const [currentSubplotY, setCurrentSubplotY] = useState<number>(0);

  const addSubplot = () => {
    if (!currentSubplotName.trim()) {
      alert('Please enter a subplot name');
      return;
    }

    const newSubplot: Subplot = {
      id: `subplot-${Date.now()}`,
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

    onSubplotsChange([...subplots, newSubplot]);
    
    // Reset form
    setCurrentSubplotName('');
    setCurrentSubplotWidth(1);
    setCurrentSubplotHeight(1);
    setCurrentSubplotRadius(1);
    setCurrentSubplotX(0);
    setCurrentSubplotY(0);
  };

  const removeSubplot = (subplotId: string) => {
    onSubplotsChange(subplots.filter(subplot => subplot.id !== subplotId));
  };

  const applyPreset = (presetId: string) => {
    const replaceMode = window.confirm(
      `This will ${
        subplots.length > 0 ? 'replace all existing subplots with ' : 'add '
      }preset subplots. Continue?`
    );
    
    if (!replaceMode) return;

    const presetSubplots = applySubplotPreset(presetId, dimensions.width, dimensions.height);
    
    const newSubplots = presetSubplots.map((config) => ({
      id: `preset-${presetId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      shape: config.shape,
      ...(config.shape === 'rectangular' 
        ? { width: config.width, height: config.height } 
        : { radius: config.radius }),
      positionX: config.positionX,
      positionY: config.positionY,
      measurements: [],
      groundCover: { shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 },
      disturbance: { grazing: false, poaching: false, lopping: false, invasives: false, fire: false }
    }));

    if (replaceMode && subplots.length > 0) {
      onSubplotsChange(newSubplots);
    } else {
      onSubplotsChange([...subplots, ...newSubplots]);
    }
  };

  const clearAllSubplots = () => {
    if (subplots.length > 0) {
      const confirmClear = window.confirm(
        `Are you sure you want to remove all ${subplots.length} subplot(s)?`
      );
      
      if (confirmClear) {
        onSubplotsChange([]);
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Subplot Management</h3>
      
      {/* Subplot Presets */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Standard Presets</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {subplotPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="py-2 text-sm bg-white dark:bg-gray-600 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-500"
              onClick={() => applyPreset(preset.id)}
            >
              <div className="font-medium">{preset.icon} {preset.name}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{preset.description}</div>
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <button
            type="button"
            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            onClick={clearAllSubplots}
          >
            Clear All Subplots
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {subplots.length} subplot(s) defined
          </span>
        </div>
      </div>
      
      {/* Add Subplot Form */}
      <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subplot Name</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={currentSubplotName}
            onChange={(e) => setCurrentSubplotName(e.target.value)}
            placeholder="e.g., Corner Herb Plot, Center Tree Plot"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Shape</label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={currentSubplotShape}
              onChange={(e) => setCurrentSubplotShape(e.target.value as SubplotShape)}
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Width (m)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0.1"
                  step="0.1"
                  value={currentSubplotWidth}
                  onChange={(e) => setCurrentSubplotWidth(parseFloat(e.target.value) || 1)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Height (m)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0.1"
                  step="0.1"
                  value={currentSubplotHeight}
                  onChange={(e) => setCurrentSubplotHeight(parseFloat(e.target.value) || 1)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Radius (m)</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0.1"
                step="0.1"
                value={currentSubplotRadius}
                onChange={(e) => setCurrentSubplotRadius(parseFloat(e.target.value) || 1)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Position (X, Y) in meters from NW corner
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                min="0"
                max={dimensions.width}
                step="0.1"
                value={currentSubplotX}
                onChange={(e) => setCurrentSubplotX(parseFloat(e.target.value) || 0)}
                placeholder="X"
              />
              <input
                type="number"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" 
          onClick={addSubplot}
        >
          Add Subplot
        </button>
      </div>
      
      {/* Existing Subplots */}
      {subplots.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300">Defined Subplots ({subplots.length})</h4>
          {subplots.map((subplot) => (
            <div key={subplot.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700/50">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white">{subplot.name || subplot.id}</h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {subplot.shape === 'rectangular' 
                      ? `${subplot.width}×${subplot.height}m rectangular subplot at (${subplot.positionX}, ${subplot.positionY})m`
                      : `Circular subplot with ${subplot.radius}m radius at (${subplot.positionX}, ${subplot.positionY})m`}
                  </div>
                </div>
                <button
                  onClick={() => removeSubplot(subplot.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center py-4">
          No subplots defined yet. Add a subplot or apply a preset to start collecting subplot-specific data.
        </p>
      )}
    </div>
  );
};

export default SubplotForm;