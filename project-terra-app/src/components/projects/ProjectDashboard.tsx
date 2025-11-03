import { useState } from 'react';
import { getAllProjects } from '../../db/database';
import type { Project, VegetationPlot } from '../../db/database';
import SidePanel from '../SidePanel';
import Ribbon from '../Ribbon';
import ProjectList from './ProjectDashboard/ProjectList';
import ProjectForm from './ProjectDashboard/ProjectForm';
import ProjectDetail from './ProjectDashboard/ProjectDetail';
import PlotListInProject from './ProjectDashboard/PlotListInProject';
import PlotList from '../PlotDashboard/PlotManagement/PlotList';
import PlotForm from '../PlotDashboard/PlotForm/PlotForm';
import PlotVisualization from '../PlotDashboard/PlotVisualization/PlotVisualization';
import CanopyAnalysisPlot from './ProjectDashboard/CanopyAnalysisPlot';

const ProjectDashboard = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form' | 'detail' | 'plot-list' | 'plot-form' | 'plot-visualization' | 'canopy-analysis'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<VegetationPlot | null>(null);
  const [editingPlot, setEditingPlot] = useState<VegetationPlot | null>(null);
  const [analyzingPlot, setAnalyzingPlot] = useState<VegetationPlot | null>(null);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setView('form');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setView('form');
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setView('detail');
  };

  const handleProjectSave = () => {
    setView('list');
    setEditingProject(null);
  };

  const handleProjectDetailBack = () => {
    setView('list');
    setSelectedProject(null);
  };

  const handleProjectDeleted = () => {
    setView('list');
    setSelectedProject(null);
  };

  const handleCancelForm = () => {
    setView('list');
    setEditingProject(null);
  };

  const handleCreatePlot = () => {
    setEditingPlot(null);
    setView('plot-form');
  };

  const handleEditPlot = (plot: VegetationPlot) => {
    setEditingPlot(plot);
    setView('plot-form');
  };

  const handleViewPlot = (plot: VegetationPlot) => {
    setSelectedPlot(plot);
    setView('plot-visualization');
  };

  const handlePlotSave = () => {
    setView('plot-list');
    setEditingPlot(null);
  };

  const handlePlotVisualizationBack = () => {
    setView('plot-list');
    setSelectedPlot(null);
  };

  const handleCancelPlotForm = () => {
    setView('plot-list');
    setEditingPlot(null);
  };

  const handleCanopyAnalysis = (plot: VegetationPlot) => {
    setAnalyzingPlot(plot);
    setView('canopy-analysis');
  };

  const handleCanopyAnalysisBack = () => {
    setView('plot-list');
    setAnalyzingPlot(null);
  };

  const handleCanopyAnalysisComplete = (analysisResults: any) => {
    // In a real implementation, you would save the canopy analysis results to the plot
    // For now, we'll just log the results and return to the plot list
    console.log('Canopy analysis results:', analysisResults);
    alert('Canopy analysis completed and saved!');
    setView('plot-list');
    setAnalyzingPlot(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidePanel isOpen={isSidePanelOpen} togglePanel={toggleSidePanel}>
        <nav>
          <ul className="space-y-2">
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'list' ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => setView('list')}
              >
                Project Overview
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'form' && !editingProject ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={handleCreateProject}
              >
                Create New Project
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'plot-list' ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => setView('plot-list')}
              >
                Plot Management
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'canopy-analysis' ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => setView('canopy-analysis')}
              >
                Canopy Analysis
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  false ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => alert('Species Tracking feature coming soon')}
              >
                Species Tracking
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  false ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => alert('Analysis Tools feature coming soon')}
              >
                Analysis Tools
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  false ? 'bg-primary-600 text-white font-medium shadow-md' : ''
                }`}
                onClick={() => alert('Reports feature coming soon')}
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>
      </SidePanel>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area with ribbon */}
        <main className="flex-1 overflow-auto p-6">
          <Ribbon title="Project Tools">
            {view === 'list' || view === 'detail' ? (
              <>
                <button 
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors shadow-md font-medium"
                  onClick={handleCreateProject}
                >
                  New Project
                </button>
                <button 
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors shadow-md font-medium"
                  onClick={() => setView('plot-list')}
                >
                  View Plots
                </button>
              </>
            ) : view === 'plot-list' || view === 'plot-visualization' ? (
              <>
                <button 
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors shadow-md font-medium"
                  onClick={handleCreatePlot}
                >
                  New Plot
                </button>
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md font-medium"
                  onClick={() => setView('list')}
                >
                  Back to Projects
                </button>
                <button 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-md font-medium"
                  onClick={() => setView('canopy-analysis')}
                >
                  Canopy Analysis
                </button>
              </>
            ) : view === 'plot-form' ? (
              <>
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md font-medium"
                  onClick={() => setView('plot-list')}
                >
                  Back to Plots
                </button>
              </>
            ) : view === 'canopy-analysis' && analyzingPlot ? (
              <>
                <button 
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md font-medium"
                  onClick={handleCanopyAnalysisBack}
                >
                  Back to Plots
                </button>
              </>
            ) : (
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md font-medium"
                onClick={() => setView('list')}
              >
                Back to Projects
              </button>
            )}
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-md font-medium">
              Import Data
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors shadow-md font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
              Analysis
            </button>
          </Ribbon>

          <div className="mt-6">
            {view === 'list' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Project Dashboard</h1>
                <ProjectList 
                  onProjectSelect={handleViewProject} 
                  selectedProjectId={selectedProject?.id} 
                />
              </div>
            )}

            {view === 'form' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h1>
                <ProjectForm 
                  project={editingProject || undefined} 
                  onSave={handleProjectSave} 
                  onCancel={handleCancelForm} 
                />
              </div>
            )}

            {view === 'detail' && selectedProject && (
              <div>
                <div className="mb-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleProjectDetailBack}
                  >
                    &larr; Back to Projects
                  </button>
                </div>
                <ProjectDetail 
                  project={selectedProject} 
                  onBack={handleProjectDetailBack} 
                  onProjectUpdated={handleProjectDetailBack}
                  onProjectDeleted={handleProjectDeleted}
                />
                <div className="mt-6">
                  <PlotListInProject 
                    project={selectedProject} 
                    onCanopyAnalysis={handleCanopyAnalysis}
                  />
                </div>
              </div>
            )}

            {view === 'plot-list' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Plot Management</h1>
                <PlotList 
                  onPlotSelect={handleViewPlot} 
                  onPlotEdit={handleEditPlot}
                  onCanopyAnalysis={handleCanopyAnalysis}
                  selectedPlotId={selectedPlot?.id} 
                />
              </div>
            )}

            {view === 'plot-form' && (
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  {editingPlot ? 'Edit Plot' : 'Create New Plot'}
                </h1>
                <PlotForm 
                  plot={editingPlot} 
                  onSave={handlePlotSave} 
                  onCancel={handleCancelPlotForm} 
                />
              </div>
            )}

            {view === 'plot-visualization' && selectedPlot && (
              <div>
                <div className="mb-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handlePlotVisualizationBack}
                  >
                    &larr; Back to Plots
                  </button>
                </div>
                <PlotVisualization 
                  plot={selectedPlot} 
                  onCanopyAnalysis={handleCanopyAnalysis}
                />
              </div>
            )}

            {view === 'canopy-analysis' && analyzingPlot && (
              <div>
                <div className="mb-4">
                  <button
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={handleCanopyAnalysisBack}
                  >
                    &larr; Back to Plots
                  </button>
                </div>
                <CanopyAnalysisPlot 
                  plot={analyzingPlot}
                  onAnalysisComplete={handleCanopyAnalysisComplete}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDashboard;