import { useState } from 'react';
import SidePanel from './SidePanel';
import Ribbon from './Ribbon';
import ProjectList from './ProjectDashboard/ProjectList';
import ProjectForm from './ProjectDashboard/ProjectForm';
import ProjectDetail from './ProjectDashboard/ProjectDetail';
import PlotListInProject from './ProjectDashboard/PlotListInProject';
import type { Project } from '../db/database';

const ProjectDashboard = () => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SidePanel isOpen={isSidePanelOpen} togglePanel={toggleSidePanel}>
        <nav>
          <ul className="space-y-2">
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'list' ? 'bg-blue-100 dark:bg-blue-900/50 font-medium' : ''
                }`}
                onClick={() => setView('list')}
              >
                Project Overview
              </button>
            </li>
            <li>
              <button 
                className={`block w-full text-left py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white ${
                  view === 'form' && !editingProject ? 'bg-blue-100 dark:bg-blue-900/50 font-medium' : ''
                }`}
                onClick={handleCreateProject}
              >
                Create New Project
              </button>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Plot Management
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Species Tracking
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Analysis Tools
              </a>
            </li>
            <li>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-white">
                Reports
              </a>
            </li>
          </ul>
        </nav>
      </SidePanel>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main content area with ribbon */}
        <main className="flex-1 overflow-auto p-6">
          <Ribbon title="Project Tools">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              onClick={handleCreateProject}
            >
              New Project
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
              Import Data
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors">
              Analysis
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
              Settings
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
                  <PlotListInProject project={selectedProject} />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDashboard;