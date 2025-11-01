import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPlots, getAllProjects, createProject, updateProject } from '../db/database';
import type { VegetationPlot, Project } from '../db/database';
import { calculateAllIndices } from '../utils/biodiversity';
import type { BiodiversityIndices } from '../utils/biodiversity';



interface PlotWithBiodiversity extends Omit<VegetationPlot, 'biodiversity'> {
  biodiversity?: BiodiversityIndices;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [plots, setPlots] = useState<PlotWithBiodiversity[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddPlotForm, setShowAddPlotForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    plotIds: [] as number[],
  });
  const [addPlotMode, setAddPlotMode] = useState<'new' | 'existing' | null>(null); // Mode for adding plots
  const [selectedExistingPlotIds, setSelectedExistingPlotIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjectsAndPlots() {
      try {
        setIsLoading(true);
        
        // Load both plots and projects from the database
        const [allPlots, allProjects] = await Promise.all([
          getAllPlots(),
          getAllProjects()
        ]);
        
        // Calculate biodiversity for each plot
        const plotsWithBiodiversity = allPlots.map(plot => ({
          ...plot,
          biodiversity: calculateAllIndices(plot.measurements)
        }));
        
        setPlots(plotsWithBiodiversity);
        setProjects(allProjects);
      } catch (err) {
        console.error("Failed to load projects and plots:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading data.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadProjectsAndPlots();
  }, []);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    try {
      // Create a new project in the database
      await createProject({
        name: newProject.name,
        description: newProject.description,
        plotIds: newProject.plotIds,
      });

      // Fetch all projects again to update the list
      const allProjects = await getAllProjects();
      setProjects(allProjects);
      
      setNewProject({ name: '', description: '', plotIds: [] });
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create project:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
    }
  };

  const handleAddPlotToProject = async () => {
    if (!selectedProjectId) return;
    
    if (addPlotMode === 'new') {
      // Create a new plot and add it to the project
      // This will redirect to the plot form with project context
      // For now, we'll just close the form
      alert('Creating a new plot for this project. Redirecting to plot form...');
      // In a real app, you might pass the project ID as a query parameter
      setShowAddPlotForm(false);
      setAddPlotMode(null);
      setSelectedExistingPlotIds([]);
    } else if (addPlotMode === 'existing' && selectedExistingPlotIds.length > 0) {
      try {
        // Get the project to update
        const projectToUpdate = projects.find(p => p.id === selectedProjectId);
        if (!projectToUpdate) return;
        
        // Update the project with new plot IDs
        const updatedProject = {
          ...projectToUpdate,
          plotIds: [...new Set([...projectToUpdate.plotIds, ...selectedExistingPlotIds])], // Avoid duplicates
          updatedDate: new Date()
        };
        
        // Update in database
        await updateProject(updatedProject);
        
        // Refresh projects list
        const allProjects = await getAllProjects();
        setProjects(allProjects);
        
        setShowAddPlotForm(false);
        setAddPlotMode(null);
        setSelectedExistingPlotIds([]);
      } catch (err) {
        console.error("Failed to add plot to project:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to add plot to project");
        }
      }
    }
  };

  const removePlotFromProject = async (projectId: number | undefined, plotId: number) => {
    if (projectId === undefined) return;
    
    try {
      // Get the project to update
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) return;
      
      // Update the project with filtered plot IDs
      const updatedProject = {
        ...projectToUpdate,
        plotIds: projectToUpdate.plotIds.filter(id => id !== plotId),
        updatedDate: new Date()
      };
      
      // Update in database
      await updateProject(updatedProject);
      
      // Refresh projects list
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (err) {
      console.error("Failed to remove plot from project:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to remove plot from project");
      }
    }
  };

  const getProjectStats = (projectId: number) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return null;
    
    const projectPlots = plots.filter(plot => project.plotIds.includes(plot.id!));
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
        <h2 className="text-3xl font-bold">Loading Projects...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-red-500">
        <h2 className="text-3xl font-bold">Error Loading Projects</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          Field Research Projects
        </h2>
        <button 
          className="btn-primary flex items-center"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {showCreateForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Create New Project</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Project Name *</label>
              <input
                type="text"
                className="input-field"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                placeholder="e.g., Forest Diversity Study Q4"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                className="input-field"
                rows={3}
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                placeholder="Brief description of the project..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Plots</label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select the plots to include in this project (hold Ctrl/Cmd to select multiple)
              </p>
              
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                {plots.length === 0 ? (
                  <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No plots available. Create plots first.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plots.map(plot => (
                      <label key={plot.id} className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProject.plotIds.includes(plot.id!)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewProject(prev => ({
                                ...prev,
                                plotIds: [...prev.plotIds, plot.id!]
                              }));
                            } else {
                              setNewProject(prev => ({
                                ...prev,
                                plotIds: prev.plotIds.filter(id => id !== plot.id!)
                              }));
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
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                className="btn-primary flex-1"
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
              >
                Create Project
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewProject({ name: '', description: '', plotIds: [] });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Plot to Project Form */}
      {showAddPlotForm && selectedProjectId && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Add Plot to Project</h3>
          
          <div className="space-y-4">
            {!addPlotMode ? (
              // Choose mode: new plot or existing plot
              <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  How would you like to add a plot to this project?
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className="btn-primary p-4 text-center"
                    onClick={() => setAddPlotMode('new')}
                  >
                    <div className="font-semibold">Create New Plot</div>
                    <div className="text-sm opacity-80">Start a new vegetation survey</div>
                  </button>
                  
                  <button
                    className="btn-secondary p-4 text-center"
                    onClick={() => setAddPlotMode('existing')}
                  >
                    <div className="font-semibold">Add Existing Plot</div>
                    <div className="text-sm opacity-80">Select from saved plots</div>
                  </button>
                </div>
              </div>
            ) : addPlotMode === 'new' ? (
              // Create new plot option
              <div className="space-y-4">
                <h4 className="font-semibold">Create New Plot for Project</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  This will take you to the plot creation form where the plot will be automatically associated with this project.
                </p>
                
                <div className="flex gap-3 pt-2">
                  <Link 
                    to={`/vegetation-plot`} 
                    className="btn-primary flex-1"
                    onClick={() => {
                      // Here you might pass the project ID as a parameter
                      setShowAddPlotForm(false);
                      setAddPlotMode(null);
                    }}
                  >
                    Create New Plot
                  </Link>
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => {
                      setShowAddPlotForm(false);
                      setAddPlotMode(null);
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
                    {plots.filter(plot => !projects.find(p => p.id === selectedProjectId)?.plotIds.includes(plot.id!)).length === 0 ? (
                      <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                        All plots are already in this project.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {plots
                          .filter(plot => !projects.find(p => p.id === selectedProjectId)?.plotIds.includes(plot.id!))
                          .map(plot => (
                          <label key={plot.id} className="flex items-start space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedExistingPlotIds.includes(plot.id!)}
                              onChange={() => {
                                setSelectedExistingPlotIds(prev => 
                                  prev.includes(plot.id!) 
                                    ? prev.filter(id => id !== plot.id!) 
                                    : [...prev, plot.id!]
                                );
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
                      setAddPlotMode(null);
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

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Projects Created</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first project to group related vegetation plots together.
          </p>
          <button 
            className="btn-primary inline-flex items-center"
            onClick={() => setShowCreateForm(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            if (project.id === undefined) return null; // Skip projects without an ID
            const stats = getProjectStats(project.id);
            return (
              <div key={project.id} className="card flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <Link to={`/project/${project.id}`} className="hover:underline">
                    <h3 className="text-xl font-bold truncate">{project.name}</h3>
                  </Link>
                  <span className="text-xs bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                    {project.plotIds.length} plots
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4 flex-grow">
                  {project.description || 'No description provided'}
                </p>
                
                {stats && (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="text-gray-500 dark:text-gray-400">Total Plots</div>
                        <div className="font-semibold">{stats.totalPlots}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="text-gray-500 dark:text-gray-400">Measurements</div>
                        <div className="font-semibold">{stats.totalMeasurements}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="text-gray-500 dark:text-gray-400">Species</div>
                        <div className="font-semibold">{stats.uniqueSpecies}</div>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        <div className="text-gray-500 dark:text-gray-400">Avg Richness</div>
                        <div className="font-semibold">{stats.avgSpeciesRichness}</div>
                      </div>
                    </div>
                    
                    {/* Show plots in this project */}
                    <div className="mt-3">
                      <div className="text-sm font-semibold mb-1">Plots in Project:</div>
                      {project.plotIds.length === 0 ? (
                        <div className="text-xs text-gray-500 dark:text-gray-400 italic">No plots added yet</div>
                      ) : (
                        <div className="max-h-32 overflow-y-auto">
                          {plots
                            .filter(plot => project.plotIds.includes(plot.id!))
                            .map(plot => (
                              <div key={plot.id} className="flex justify-between items-center text-xs bg-gray-50 dark:bg-gray-700 p-1.5 rounded mt-1">
                                <span className="truncate">{plot.plotNumber}</span>
                                <button 
                                  className="text-red-500 hover:text-red-700 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (project.id !== undefined) {
                                      removePlotFromProject(project.id, plot.id!);
                                    }
                                  }}
                                  title="Remove from project"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-auto pt-4 space-y-3">
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    Created: {project.createdDate.toLocaleDateString()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to={`/biodiversity`} 
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      Biodiversity
                    </Link>
                    <Link 
                      to={`/species-area`} 
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      Species-Area
                    </Link>
                    <Link 
                      to={`/export`} 
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      Export
                    </Link>
                    <Link 
                      to={`/canopy`} 
                      className="btn-secondary text-xs py-2 text-center"
                    >
                      Canopy
                    </Link>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      className="btn-primary w-full text-xs py-2"
                      onClick={() => {
                        if (project.id !== undefined) {
                          setSelectedProjectId(project.id);
                          setShowAddPlotForm(true);
                          setAddPlotMode(null);
                        }
                      }}
                    >
                      Add Plot to Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Access Section */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Quick Access to All Tools</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link 
            to="/vegetation-plot" 
            className="flex flex-col items-center justify-center p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
            <span className="font-semibold text-center">Vegetation Plotting</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Create and manage vegetation survey plots</span>
          </Link>
          
          <Link 
            to="/plots" 
            className="flex flex-col items-center justify-center p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <span className="font-semibold text-center">View Saved Plots</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">View, edit, or delete your saved vegetation plots</span>
          </Link>
          
          <Link 
            to="/biodiversity" 
            className="flex flex-col items-center justify-center p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19M4.879 4.879L9.879 9.879M12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
              </svg>
            </div>
            <span className="font-semibold text-center">Biodiversity Analysis</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Calculate diversity indices</span>
          </Link>
          
          <Link 
            to="/species-area" 
            className="flex flex-col items-center justify-center p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-semibold text-center">Species-Area Curve</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Generate species-area relationships</span>
          </Link>
          
          <Link 
            to="/canopy" 
            className="flex flex-col items-center justify-center p-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="font-semibold text-center">Canopy Analysis</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">Analyze canopy photos</span>
          </Link>
        </div>
      </div>

      {/* Export Section */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Project Export</h3>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/export" 
            className="btn-primary flex-1 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export All Project Data to CSV
          </Link>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-2">Data Export Options:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Export all plots in the project</li>
            <li>Include biodiversity calculations</li>
            <li>Export species-area curve data</li>
            <li>Export canopy analysis results</li>
            <li>Compatible with Google Sheets, Excel, and analysis software</li>
          </ul>
        </div>
      </div>
    </div>
  );
}