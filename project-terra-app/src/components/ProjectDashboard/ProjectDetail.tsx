import { useState } from 'react';
import type { Project } from '../../db/database';
import { updateProject, deleteProject } from '../../db/database';
import { getAllPlots } from '../../db/database';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ 
  project, 
  onBack, 
  onProjectUpdated,
  onProjectDeleted 
}) => {
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [plotIds, setPlotIds] = useState<number[]>(project.plotIds || []);
  const [availablePlots, setAvailablePlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // In a real implementation, you would fetch plot data here
  // For now, I'll use a mock implementation
  const loadAvailablePlots = async () => {
    try {
      setLoading(true);
      // Mock data - in real implementation, you'd fetch plots
      const plots = await getAllPlots();
      // Filter out plots already in this project
      const available = plots.filter(plot => !plotIds.includes(plot.id || 0));
      setAvailablePlots(available);
    } catch (error) {
      console.error('Failed to load plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateProject({
        ...project,
        name: projectName,
        description: projectDescription,
        plotIds: plotIds,
      });
      setIsEditing(false);
      onProjectUpdated();
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlot = (plotId: number) => {
    if (!plotIds.includes(plotId)) {
      setPlotIds([...plotIds, plotId]);
    }
  };

  const handleRemovePlot = (plotId: number) => {
    setPlotIds(plotIds.filter(id => id !== plotId));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(project.id!);
        onProjectDeleted();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isEditing ? (
              <input
                type="text"
                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xl font-bold"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            ) : (
              projectName
            )}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Created: {new Date(project.createdDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Updated: {new Date(project.updatedDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
          </button>
          <button
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={onBack}
            disabled={loading}
          >
            Back
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Description
        </label>
        {isEditing ? (
          <textarea
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={3}
          />
        ) : (
          <p className="text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
            {projectDescription || 'No description provided'}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Plots ({plotIds.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Project Plots</h4>
            <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-60 overflow-y-auto">
              {plotIds.length > 0 ? (
                plotIds.map(plotId => (
                  <div key={plotId} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded mb-1">
                    <span>Plot #{plotId}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemovePlot(plotId)}
                      disabled={!isEditing}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">No plots in this project</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Available Plots</h4>
            <div className="border border-gray-300 dark:border-gray-600 rounded p-3 max-h-60 overflow-y-auto">
              {availablePlots.length > 0 ? (
                availablePlots.map(plot => (
                  <div key={plot.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded mb-1">
                    <span>{plot.plotNumber}</span>
                    <button
                      className="text-green-500 hover:text-green-700"
                      onClick={() => handleAddPlot(plot.id!)}
                      disabled={!isEditing}
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">No plots available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;