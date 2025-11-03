// services/ProjectService.ts
import { 
  DataAccessLayer 
} from '../db/database';
import type { 
  Project 
} from '../db/database';

export class ProjectService {
  static async getAll(): Promise<Project[]> {
    const result = await DataAccessLayer.getAllProjects();
    if (!result.success) {
      console.error('Error fetching projects:', result.error);
      throw new Error(result.error || 'Failed to fetch projects');
    }
    return result.data || [];
  }

  static async getById(id: number): Promise<Project | undefined> {
    const result = await DataAccessLayer.getProjectById(id);
    if (!result.success) {
      console.error(`Error fetching project with id ${id}:`, result.error);
      throw new Error(result.error || `Failed to fetch project with id ${id}`);
    }
    return result.data;
  }

  static async create(projectData: Omit<Project, 'id' | 'createdDate' | 'updatedDate'>): Promise<number> {
    const result = await DataAccessLayer.createProject(projectData);
    if (!result.success) {
      console.error('Error creating project:', result.error);
      throw new Error(result.error || 'Failed to create project');
    }
    return result.data || -1;
  }

  static async update(projectData: Project): Promise<void> {
    const result = await DataAccessLayer.updateProject(projectData);
    if (!result.success) {
      console.error('Error updating project:', result.error);
      throw new Error(result.error || 'Failed to update project');
    }
  }

  static async delete(id: number): Promise<void> {
    const result = await DataAccessLayer.deleteProject(id);
    if (!result.success) {
      console.error('Error deleting project:', result.error);
      throw new Error(result.error || 'Failed to delete project');
    }
  }
}