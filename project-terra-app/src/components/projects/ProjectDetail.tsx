import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllPlots, getProjectById, updateProject } from '../../db/database';
import type { VegetationPlot, Project } from '../../db/database';
import { calculateAllIndices } from '../../utils/biodiversity';
import type { BiodiversityIndices } from '../../utils/biodiversity';

interface PlotWithBiodiversity extends Omit<VegetationPlot, 'biodiversity'> {
  biodiversity?: BiodiversityIndices;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plots, setPlots] = useState<PlotWithBiodiversity[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showAddPlotForm, setShowAddPlotForm] = useState(false);
  const [showAddPlotMode, setShowAddPlotMode] = useState<'new' | 'existing' | null>(null); // Mode for adding plots
  const [selectedExistingPlotIds, setSelectedExistingPlotIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjectAndPlots() {
      try {
        setIsLoading(true);
        
        // Load both plots and the specific project from the database
        const [allPlots, project] = await Promise.all([
          getAllPlots(),
          getProjectById(parseInt(id || '0'))
        ]);
        
        // Calculate biodiversity for each plot
        const plotsWithBiodiversity = allPlots.map(plot => ({
          ...plot,
          biodiversity: calculateAllIndices(plot.measurements)
        }));
        
        setPlots(plotsWithBiodiversity);
        setCurrentProject(project || null);
      } catch (err) {
        console.error("Failed to load project and plots:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading project data.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProjectAndPlots();
  }, [id]);

  const handleAddPlotToProject = async () => {
    if (!currentProject) return;
    
    if (showAddPlotMode === 'new') {
      // Create a new plot and add it to the project
      // This will redirect to the plot form with project context
      // For now, we'll just close the form
      alert('Creating a new plot for this project. Redirecting to plot form...');
      // In a real app, you might pass the project ID as a query parameter
      setShowAddPlotForm(false);
      setShowAddPlotMode(null);
      setSelectedExistingPlotIds([]);
    } else if (showAddPlotMode === 'existing' && selectedExistingPlotIds.length > 0) {
      // Add existing plots to the project
      const updatedProject = {
        ...currentProject,
        plotIds: [...new Set([...currentProject.plotIds, ...selectedExistingPlotIds])] // Avoid duplicates
      };
      
      await updateProject(updatedProject);
      setCurrentProject(updatedProject);
      setShowAddPlotForm(false);
      setShowAddPlotMode(null);
      setSelectedExistingPlotIds([]);
    }
  };

  const removePlotFromProject = async (plotId: number) => {
    if (!currentProject) return;
    
    const updatedProject = {
      ...currentProject,
      plotIds: currentProject.plotIds.filter(id => id !== plotId)
    };
    
    await updateProject(updatedProject);
    setCurrentProject(updatedProject);
  };

  const getProjectStats = () => {
    if (!currentProject) return null;
    
    const projectPlots = plots.filter(plot => currentProject.plotIds.includes(plot.id!));
    const totalPlots = projectPlots.length;
    const totalMeasurements = projectPlots.reduce((sum, plot) => sum + plot.measurements.length, 0);
    const uniqueSpecies = new Set(projectPlots.flatMap(plot => plot.measurements.map(m => m.speciesId))).size;
    
    // Calculate average biodiversity indices for the project
    if (projectPlots.length === 0) {
      return {
        totalPlots,
        totalMeasurements,
        uniqueSpecies,
        avgSpeciesRichness: 0,
        avgShannonWiener: 0,
        avgSimpsonIndex: 0,
      };
    }
    
    const avgSpeciesRichness = projectPlots.reduce((sum, plot) => 
      sum + (plot.biodiversity?.speciesRichness || 0), 0) / totalPlots;
    const avgShannonWiener = projectPlots.reduce((sum, plot) => 
      sum + (plot.biodiversity?.shannonWiener || 0), 0) / totalPlots;
    const avgSimpsonIndex = projectPlots.reduce((sum, plot) => 
      sum + (plot.biodiversity?.simpsonIndex || 0), 0) / totalPlots;
    
    return {
      totalPlots,
      totalMeasurements,
      uniqueSpecies,
      avgSpeciesRichness: parseFloat(avgSpeciesRichness.toFixed(3)),
      avgShannonWiener: parseFloat(avgShannonWiener.toFixed(3)),
      avgSimpsonIndex: parseFloat(avgSimpsonIndex.toFixed(3)),
    };
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Project...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-red-500">
        <h2 className="text-3xl font-bold">Error Loading Project</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Project Not Found</h2>
        <p>The requested project could not be found.</p>
        <button className="btn-primary" onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const stats = getProjectStats();
  const projectPlots = plots.filter(plot => currentProject.plotIds.includes(plot.id!));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          {currentProject.name}
        </h2>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/projects')}
        >
          Back to Projects
        </button>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Project Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {currentProject.description || 'No description provided'}
            </p>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Created:</span> {new Date(currentProject.createdDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Last Updated:</span> {new Date(currentProject.updatedDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                  {stats.totalPlots}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Plots</div>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                  {stats.uniqueSpecies}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Unique Species</div>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                  {stats.totalMeasurements}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Measurements</div>
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                  {stats.avgSpeciesRichness}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Richness</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Plot to Project Form */}
      {showAddPlotForm && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Add Plot to Project</h3>
          
          <div className="space-y-4">
            {!showAddPlotMode ? (
              // Choose mode: new plot or existing plot
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  How would you like to add a plot to this project?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="btn-primary p-4 text-center"
                    onClick={() => setShowAddPlotMode('new')}
                  >
                    <div className="font-semibold">Create New Plot</div>
                    <div className="text-sm opacity-80">Start a new vegetation survey</div>
                  </button>
                  
                  <button
                    className="btn-secondary p-4 text-center"
                    onClick={() => setShowAddPlotMode('existing')}
                  >
                    <div className="font-semibold">Add Existing Plot</div>
                    <div className="text-sm opacity-80">Select from saved plots</div>
                  </button>
                </div>
              </div>
            ) : showAddPlotMode === 'new' ? (
              // Create new plot option
              <div className="space-y-4">
                <h4 className="font-semibold">Create New Plot for Project</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This will take you to the plot creation form where the plot will be automatically associated with this project.
                </p>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    className="btn-primary flex-1"
                    onClick={() => {
                      // Here you might pass the project ID as a parameter
                      setShowAddPlotForm(false);
                      setShowAddPlotMode(null);
                      navigate(`/vegetation-plot?projectId=${currentProject.id}`);
                    }}
                  >
                    Create New Plot
                  </button>
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setShowAddPlotForm(false);
                      setShowAddPlotMode(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Add existing plots
              <div className="space-y-4">
                <h4 className="font-semibold">Select Existing Plots</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Select the plots to add to this project (hold Ctrl/Cmd to select multiple)
                </p>
                
                {/* Filter plots that are not already in this project */}
                {plots.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No plots available. Create plots first.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                    {/* Check if there are plots not in this project */}
                    {plots.filter(plot => !currentProject.plotIds.includes(plot.id!)).length === 0 ? (
                      <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                        All plots are already in this project.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {plots
                          .filter(plot => !currentProject.plotIds.includes(plot.id!))
                          .map(plot => (
                          <label key={plot.id} className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedExistingPlotIds.includes(plot.id!)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedExistingPlotIds(prev => 
                                    [...prev, plot.id!]
                                  );
                                } else {
                                  setSelectedExistingPlotIds(prev => 
                                    prev.filter(id => id !== plot.id!)
                                  );
                                }
                              }}
                              className="mt-1 w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{plot.plotNumber}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {plot.measurements.length} measurements, {new Set(plot.measurements.map(m => m.speciesId)).size} species
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    className="btn-primary flex-1"
                    onClick={handleAddPlotToProject}
                    disabled={selectedExistingPlotIds.length === 0}
                  >
                    Add Selected Plots
                  </button>
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setShowAddPlotForm(false);
                      setShowAddPlotMode(null);
                      setSelectedExistingPlotIds([]);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Plots List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold border-b border-gray-200 dark:border-gray-700 pb-2">Project Plots ({projectPlots.length})</h3>
          <button 
            className="btn-primary text-sm"
            onClick={() => setShowAddPlotForm(true)}
          >
            Add Plot to Project
          </button>
        </div>
        
        {projectPlots.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No plots added to this project yet.</p>
            <button 
              className="btn-primary mt-4"
              onClick={() => setShowAddPlotForm(true)}
            >
              Add Your First Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectPlots.map(plot => (
              <div key={plot.id} className="card flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold truncate">{plot.plotNumber}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {plot.habitat || 'No habitat specified'}
                  </p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4 mb-2">
                    <span>
                      <strong className="font-semibold">{plot.measurements.length}</strong> measurements
                    </span>
                    <span>
                      <strong className="font-semibold">{new Set(plot.measurements.map(m => m.speciesId)).size}</strong> species
                    </span>
                  </div>
                  {plot.biodiversity && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Richness:</span>
                        <span className="font-medium">{plot.biodiversity.speciesRichness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shannon-Wiener:</span>
                        <span className="font-medium">{plot.biodiversity.shannonWiener.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Simpson Index:</span>
                        <span className="font-medium">{plot.biodiversity.simpsonIndex.toFixed(3)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(plot.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold"
                    onClick={() => removePlotFromProject(plot.id!)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;