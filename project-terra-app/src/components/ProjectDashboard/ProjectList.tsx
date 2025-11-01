import { useState, useEffect } from 'react';
import type { Project } from '../../db/database';
import { getAllProjects } from '../../db/database';

interface ProjectListProps {
  onProjectSelect: (project: Project) => void;
  selectedProjectId?: number;
}

const ProjectList: React.FC<ProjectListProps> = ({ onProjectSelect, selectedProjectId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectData = await getAllProjects();
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search projects..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div
              key={project.id}
              className={`p-3 rounded cursor-pointer transition-colors ${
                selectedProjectId === project.id
                  ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500'
                  : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => onProjectSelect(project)}
            >
              <h3 className="font-semibold text-gray-800 dark:text-white">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {project.description || 'No description'}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {project.plotIds.length} plots • Updated {new Date(project.updatedDate).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No projects found</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;