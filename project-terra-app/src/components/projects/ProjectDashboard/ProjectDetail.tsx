// components/projects/ProjectDashboard/ProjectDetail.tsx
import React from 'react';

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onProjectUpdated, onProjectDeleted }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Project Details: {project?.name || 'Project'}
      </h2>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded">{project?.name || 'N/A'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <p className="bg-gray-100 dark:bg-gray-700 p-3 rounded">{project?.description || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          className="btn-primary"
          onClick={onProjectUpdated}
        >
          Edit Project
        </button>
        <button 
          className="btn-secondary"
          onClick={onProjectDeleted}
        >
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default ProjectDetail;