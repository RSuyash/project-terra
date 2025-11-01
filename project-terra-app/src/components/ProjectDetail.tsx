import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllPlots } from '../db/database';
import type { VegetationPlot } from '../db/database';
import { calculateAllIndices } from '../utils/biodiversity';
import type { BiodiversityIndices } from '../utils/biodiversity';

interface Project {
  id: number;
  name: string;
  description: string;
  plotIds: number[];
  createdDate: Date;
  updatedDate: Date;
}

interface PlotWithBiodiversity extends Omit<VegetationPlot, 'biodiversity'> {
  biodiversity?: BiodiversityIndices;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plots, setPlots] = useState<PlotWithBiodiversity[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [showAddPlotForm, setShowAddPlotForm] = useState(false);
  const [addPlotMode, setAddPlotMode] = useState<'new' | 'existing' | null>(null);
  const [selectedExistingPlotIds, setSelectedExistingPlotIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects and plots
  useEffect(() => {
    async function loadProjectsAndPlots() {
      try {
        setIsLoading(true);
        
        const allPlots = await getAllPlots();
        
        // Calculate biodiversity for each plot
        const plotsWithBiodiversity = allPlots.map(plot => ({
          ...plot,
          biodiversity: calculateAllIndices(plot.measurements)
        }));
        
        setPlots(plotsWithBiodiversity);
        
        // For now, create a default project from existing plots
        // In a real app, you'd have a separate projects store
        if (allPlots.length > 0) {
          const mockProject: Project = {
            id: 1,
            name: 'Default Project',
            description: 'All plots in the system',
            plotIds: allPlots.map(plot => plot.id!).filter(id => id !== undefined) as number[],
            createdDate: new Date(Math.min(...allPlots.map(p => p.createdAt.getTime()))),
            updatedDate: new Date(Math.max(...allPlots.map(p => p.updatedAt.getTime()))),
          };
          setProjects([mockProject]);
          
          // Set current project based on URL param
          const project = mockProject.id === Number(id) ? mockProject : null;
          setCurrentProject(project);
        } else {
          // Create an empty project if no plots exist yet
          const emptyProject: Project = {
            id: 1,
            name: 'My First Project',
            description: 'A new research project',
            plotIds: [],
            createdDate: new Date(),
            updatedDate: new Date(),
          };
          setProjects([emptyProject]);
          
          // Set current project based on URL param
          const project = emptyProject.id === Number(id) ? emptyProject : null;
          setCurrentProject(project);
        }
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

    if (id) {
      loadProjectsAndPlots();
    }
  }, [id]);

  // Update current project when projects change
  useEffect(() => {
    if (projects.length > 0 && id) {
      const project = projects.find(p => p.id === Number(id)) || null;
      setCurrentProject(project);
    }
  }, [projects, id]);

  const handleAddPlotToProject = async () => {
    if (!currentProject) return;
    
    if (addPlotMode === 'new') {
      // Create a new plot and add it to the project
      // This will redirect to the plot form with project context
      alert('Creating a new plot for this project. Redirecting to plot form...');
      // In a real app, you might pass the project ID as a query parameter
      setShowAddPlotForm(false);
      setAddPlotMode(null);
      setSelectedExistingPlotIds([]);
    } else if (addPlotMode === 'existing' && selectedExistingPlotIds.length > 0) {
      // In a real app, you would update the projects in the database
      // For now, let's update the local state
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === currentProject.id
            ? { 
                ...project, 
                plotIds: [...new Set([...project.plotIds, ...selectedExistingPlotIds])], // Avoid duplicates
                updatedDate: new Date()
              }
            : project
        )
      );
      
      // Update current project state
      setCurrentProject(prev => 
        prev ? {
          ...prev, 
          plotIds: [...new Set([...prev.plotIds, ...selectedExistingPlotIds])],
          updatedDate: new Date()
        } : null
      );
      
      setShowAddPlotForm(false);
      setAddPlotMode(null);
      setSelectedExistingPlotIds([]);
    }
  };

  const removePlotFromProject = (plotId: number) => {
    if (!currentProject) return;
    
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === currentProject.id
          ? { 
              ...project, 
              plotIds: project.plotIds.filter(id => id !== plotId),
              updatedDate: new Date()
            }
          : project
      )
    );
    
    // Update current project state
    setCurrentProject(prev => 
      prev ? {
        ...prev, 
        plotIds: prev.plotIds.filter(id => id !== plotId),
        updatedDate: new Date()
      } : null
    );
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
        <p className="text-gray-600 dark:text-gray-400">The project with ID {id} does not exist.</p>
        <Link to="/projects" className="btn-primary inline-block">Go to Projects</Link>
      </div>
    );
  }

  const stats = getProjectStats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
            {currentProject.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Project ID: {currentProject.id} | Created: {currentProject.createdDate.toLocaleDateString()}
          </p>
        </div>
        <Link to="/projects" className="btn-secondary">
          ← Back to Projects
        </Link>
      </div>

      {currentProject.description && (
        <div className="card">
          <p className="text-gray-700 dark:text-gray-300">{currentProject.description}</p>
        </div>
      )}

      {/* Project Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
              {stats.totalPlots}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Plots</div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {stats.totalMeasurements}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Measurements</div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {stats.uniqueSpecies}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unique Species</div>
          </div>
          
          <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {stats.avgSpeciesRichness}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Richness</div>
          </div>
        </div>
      )}

      {/* Project Plots */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Project Plots</h3>
          <button 
            className="btn-primary flex items-center"
            onClick={() => {
              setShowAddPlotForm(true);
              setAddPlotMode(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Plot
          </button>
        </div>
        
        {currentProject.plotIds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No plots added to this project yet</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowAddPlotForm(true);
                setAddPlotMode('new');
              }}
            >
              Create Your First Plot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plots
              .filter(plot => currentProject.plotIds.includes(plot.id!))
              .map(plot => (
                <div key={plot.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{plot.plotNumber}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {plot.measurements.length} measurements, {new Set(plot.measurements.map(m => m.speciesId)).size} species
                    </p>
                    {plot.biodiversity && (
                      <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">
                        Richness: {plot.biodiversity.speciesRichness}, 
                        Shannon: {plot.biodiversity.shannonWiener.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Link 
                      to={`/plot/${plot.id}/edit`} 
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Edit plot"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </Link>
                    <button 
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => removePlotFromProject(plot.id!)}
                      title="Remove from project"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Add Plot to Project Form */}
      {showAddPlotForm && (
        <div className="card fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Add Plot to Project</h3>
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => {
                    setShowAddPlotForm(false);
                    setAddPlotMode(null);
                    setSelectedExistingPlotIds([]);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
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
        </div>
      )}

      {/* Project Tools */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Project Tools</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            to={`/biodiversity`} 
            className="flex flex-col items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19M4.879 4.879L9.879 9.879M12 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
              </svg>
            </div>
            <span className="font-semibold text-center">Biodiversity</span>
          </Link>
          
          <Link 
            to={`/species-area`} 
            className="flex flex-col items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-semibold text-center">Species-Area</span>
          </Link>
          
          <Link 
            to={`/export`} 
            className="flex flex-col items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="font-semibold text-center">Export</span>
          </Link>
          
          <Link 
            to={`/canopy`} 
            className="flex flex-col items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <div className="bg-primary-100 dark:bg-primary-900/50 p-2 rounded-full mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="font-semibold text-center">Canopy</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;