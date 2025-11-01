import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getAllSpecies, getPlotById, saveVegetationPlot, updateVegetationPlot } from '../db/database';
import type { PlotMeasurement, Species, Disturbance, Location, PlotDimensions, QuadrantData, Quadrant, Subplot, SubplotShape, VegetationPlot } from '../db/database';
import { GPSLocation } from './GPSLocation';
import VisualPlotLayout from './VisualPlotLayout';
import PlotForm from './PlotDashboard/PlotForm/PlotForm';

const PlotDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plotId, setPlotId] = useState<number | undefined>(id ? parseInt(id, 10) : undefined);
  const [isEditing, setIsEditing] = useState(!!id); // If there's an ID, we're editing
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Get project ID if this plot is being created as part of a project
  const projectId = searchParams.get('projectId') ? parseInt(searchParams.get('projectId')!) : null;

  useEffect(() => {
    if (id) {
      setPlotId(parseInt(id, 10));
      setIsEditing(true);
    } else {
      setIsEditing(false);
      // Reset to new state when no ID is in URL
      setPlotId(undefined);
    }
    setIsInitialLoad(false);
  }, [id]);

  const handleSaveSuccess = () => {
    if (projectId) {
      // If this plot was created for a project, redirect back to the project
      navigate(`/project/${projectId}`);
    } else {
      // Otherwise, redirect back to the plots list
      navigate('/plots');
    }
  };

  const handleCancel = () => {
    if (projectId) {
      // If we were creating for a project, go back to the project
      navigate(`/project/${projectId}`);
    } else {
      // Otherwise, go back to plots list
      navigate('/plots');
    }
  };

  // If we're still loading the initial state, show a loading indicator
  if (isInitialLoad) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          {isEditing ? 'Edit Vegetation Plot' : 'Create New Vegetation Plot'}
        </h1>
        <button 
          className="btn-secondary flex items-center"
          onClick={handleCancel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to List
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <PlotForm 
          plot={plotId ? undefined : undefined} // We'll load the plot inside the PlotForm if editing
          onSave={handleSaveSuccess}
          onCancel={handleCancel}
        />
      </div>

      <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-6">
        <p>Project Terra - Comprehensive Vegetation Plot Management</p>
      </div>
    </div>
  );
};

export default PlotDashboard;