// components/projects/ProjectDashboard/ProjectForm.tsx
import React from 'react';

interface ProjectFormProps {
  project?: any;
  onSave: () => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onCancel }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {project ? 'Edit Project' : 'Create New Project'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {project 
          ? 'Update the project details below.' 
          : 'Enter the new project details below.'}
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter project name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Enter project description"
          ></textarea>
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button 
          className="btn-primary flex-1"
          onClick={onSave}
        >
          Save Project
        </button>
        <button 
          className="btn-secondary flex-1"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProjectForm;