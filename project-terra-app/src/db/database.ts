import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  Species,
  CanopyPhoto,
  Project,
  GroundCover,
  Disturbance,
  PlotMeasurement,
  PlotDimensions,
  Location,
  Quadrant,
  QuadrantData,
  Subplot,
  SubplotShape,
  VegetationPlot,
  SpeciesAreaPlot,
  BiodiversityAnalysis
} from '../types';

// Re-export types for components that import them directly
export type {
  Species,
  CanopyPhoto,
  Project,
  GroundCover,
  Disturbance,
  PlotMeasurement,
  PlotDimensions,
  Location,
  Quadrant,
  QuadrantData,
  Subplot,
  SubplotShape,
  VegetationPlot,
  SpeciesAreaPlot,
  BiodiversityAnalysis
};

// Database class
export class EcoFieldDatabase extends Dexie {
  species!: Table<Species>;
  vegetationPlots!: Table<VegetationPlot>;
  canopyPhotos!: Table<CanopyPhoto>;
  speciesAreaPlots!: Table<SpeciesAreaPlot>;
  biodiversityAnalysis!: Table<BiodiversityAnalysis>;
  projects!: Table<Project>;

  constructor() {
    super('EcoFieldDatabase');
    
    this.version(1).stores({
      species: '++id, name, scientificName, createdAt',
      vegetationPlots: '++id, plotNumber, date, createdAt',
      canopyPhotos: '++id, plotId, angle, timestamp',
      speciesAreaPlots: '++id, plotId, plotSize',
      biodiversityAnalysis: '++id, plotId, calculatedAt',
      projects: '++id, name, createdDate'
    });

    // Add subplots support in version 2
    this.version(2).stores({
      species: '++id, name, scientificName, createdAt',
      vegetationPlots: '++id, plotNumber, date, createdAt',
      canopyPhotos: '++id, plotId, angle, timestamp',
      speciesAreaPlots: '++id, plotId, plotSize',
      biodiversityAnalysis: '++id, plotId, calculatedAt',
      projects: '++id, name, createdDate'
    }).upgrade(trans => {
      // Migrate existing plots to include subplots if not present
      return trans.table('vegetationPlots').toCollection().modify(plot => {
        if (!plot.subplots) {
          plot.subplots = [];
        }
        if (!plot.quadrants) {
          plot.quadrants = [];
        }
        if (!plot.dimensions) {
          plot.dimensions = {
            width: 10,  // Default to 10x10m if not specified
            height: 10,
            area: 100,
            unit: 'm'
          };
        }
      });
    });
  }
}

// Create singleton instance
export const db = new EcoFieldDatabase();

// Generic API response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Data access layer with proper error handling
export class DataAccessLayer {
  // Species methods
  static async getAllSpecies(): Promise<ApiResponse<Species[]>> {
    try {
      const species = await db.species.toArray();
      return { success: true, data: species };
    } catch (error) {
      console.error('Error fetching species:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async searchSpecies(query: string): Promise<ApiResponse<Species[]>> {
    try {
      const lowerQuery = query.toLowerCase();
      const species = await db.species
        .filter(s => 
          s.name.toLowerCase().includes(lowerQuery) ||
          s.scientificName?.toLowerCase().includes(lowerQuery) ||
          s.commonNames?.some(name => name.toLowerCase().includes(lowerQuery))
        )
        .toArray();
      return { success: true, data: species };
    } catch (error) {
      console.error('Error searching species:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async addSpecies(speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<number>> {
    try {
      const now = new Date();
      const id = await db.species.add({
        ...speciesData,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, data: id };
    } catch (error) {
      console.error('Error adding species:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Vegetation plot methods
  static async getAllPlots(): Promise<ApiResponse<VegetationPlot[]>> {
    try {
      const plots = await db.vegetationPlots.toArray();
      const processedPlots = plots.map(plot => {
        // Ensure disturbance has all required boolean values
        plot.disturbance = {
          grazing: Boolean(plot.disturbance?.grazing),
          poaching: Boolean(plot.disturbance?.poaching),
          lopping: Boolean(plot.disturbance?.lopping),
          invasives: Boolean(plot.disturbance?.invasives),
          fire: Boolean(plot.disturbance?.fire)
        };
        
        // Ensure dimensions exist for backward compatibility
        if (!plot.dimensions) {
          plot.dimensions = {
            width: 10,  // Default to 10x10m if not specified
            height: 10,
            area: 100,
            unit: 'm'
          };
        }
        
        // Ensure quadrants array exists for backward compatibility
        if (!plot.quadrants) {
          plot.quadrants = [];
        }
        
        // Ensure subplots array exists for backward compatibility
        if (!plot.subplots) {
          plot.subplots = [];
        } else {
          // Ensure all subplots have required groundCover and disturbance fields
          plot.subplots = plot.subplots.map(subplot => ({
            ...subplot,
            groundCover: subplot.groundCover || { 
              shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 
            },
            disturbance: subplot.disturbance || { 
              grazing: false, poaching: false, lopping: false, invasives: false, fire: false 
            }
          }));
        }
        return plot;
      });
      return { success: true, data: processedPlots };
    } catch (error) {
      console.error('Error fetching plots:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async getPlotById(id: number): Promise<ApiResponse<VegetationPlot | undefined>> {
    try {
      const plot = await db.vegetationPlots.get(id);
      if (plot) {
        // Ensure disturbance has all required boolean values
        plot.disturbance = {
          grazing: Boolean(plot.disturbance?.grazing),
          poaching: Boolean(plot.disturbance?.poaching),
          lopping: Boolean(plot.disturbance?.lopping),
          invasives: Boolean(plot.disturbance?.invasives),
          fire: Boolean(plot.disturbance?.fire)
        };
        
        // Ensure dimensions exist for backward compatibility
        if (!plot.dimensions) {
          plot.dimensions = {
            width: 10,  // Default to 10x10m if not specified
            height: 10,
            area: 100,
            unit: 'm'
          };
        }
        
        // Ensure quadrants array exists for backward compatibility
        if (!plot.quadrants) {
          plot.quadrants = [];
        }
        
        // Ensure subplots array exists for backward compatibility
        if (!plot.subplots) {
          plot.subplots = [];
        } else {
          // Ensure all subplots have required groundCover and disturbance fields
          plot.subplots = plot.subplots.map(subplot => ({
            ...subplot,
            groundCover: subplot.groundCover || { 
              shrub: 0, herb: 0, grass: 0, bare: 0, rock: 0, litter: 0 
            },
            disturbance: subplot.disturbance || { 
              grazing: false, poaching: false, lopping: false, invasives: false, fire: false 
            }
          }));
        }
      }
      return { success: true, data: plot };
    } catch (error) {
      console.error(`Error fetching plot with id ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async saveVegetationPlot(plot: Omit<VegetationPlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<number>> {
    try {
      const now = new Date();
      const id = await db.vegetationPlots.add({
        ...plot,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, data: id };
    } catch (error) {
      console.error('Error saving plot:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async updateVegetationPlot(plot: VegetationPlot): Promise<ApiResponse<number>> {
    try {
      const now = new Date();
      const id = await db.vegetationPlots.put({
        ...plot,
        updatedAt: now,
      });
      return { success: true, data: id };
    } catch (error) {
      console.error('Error updating plot:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Project methods
  static async getAllProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await db.projects.toArray();
      return { success: true, data: projects };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async getProjectById(id: number): Promise<ApiResponse<Project | undefined>> {
    try {
      const project = await db.projects.get(id);
      return { success: true, data: project };
    } catch (error) {
      console.error(`Error fetching project with id ${id}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async createProject(project: Omit<Project, 'id' | 'createdDate' | 'updatedDate'>): Promise<ApiResponse<number>> {
    try {
      const now = new Date();
      const id = await db.projects.add({
        ...project,
        createdDate: now,
        updatedDate: now,
      });
      return { success: true, data: id };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async updateProject(project: Project): Promise<ApiResponse<void>> {
    try {
      const now = new Date();
      await db.projects.put({
        ...project,
        updatedDate: now,
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating project:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  static async deleteProject(id: number): Promise<ApiResponse<void>> {
    try {
      await db.projects.delete(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Utility methods
  static async populateDatabase(): Promise<ApiResponse<void>> {
    try {
      const speciesCount = await db.species.count();
      if (speciesCount === 0) {
        await db.species.bulkAdd([
          { name: 'Teak', scientificName: 'Tectona grandis', createdAt: new Date(), updatedAt: new Date() },
          { name: 'Rosewood', scientificName: 'Dalbergia latifolia', createdAt: new Date(), updatedAt: new Date() },
          { name: 'Sandalwood', scientificName: 'Santalum album', createdAt: new Date(), updatedAt: new Date() },
        ]);
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to populate database:", error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// Initialize database with default data
DataAccessLayer.populateDatabase().catch(err => {
  console.error("Failed to populate database:", err);
});

// Export individual helper functions for backwards compatibility 
// (in case any components still directly import these functions)
// These functions need to extract the data from the ApiResponse for compatibility
export const getAllSpecies = async () => {
  const result = await DataAccessLayer.getAllSpecies();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch species');
  }
  return result.data || [];
};
export const searchSpecies = async (query: string) => {
  const result = await DataAccessLayer.searchSpecies(query);
  if (!result.success) {
    throw new Error(result.error || 'Failed to search species');
  }
  return result.data || [];
};
export const addSpecies = async (speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>) => {
  const result = await DataAccessLayer.addSpecies(speciesData);
  if (!result.success) {
    throw new Error(result.error || 'Failed to add species');
  }
  return result.data || -1;
};
export const getAllPlots = async () => {
  const result = await DataAccessLayer.getAllPlots();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch plots');
  }
  return result.data || [];
};
export const getPlotById = async (id: number) => {
  const result = await DataAccessLayer.getPlotById(id);
  if (!result.success) {
    throw new Error(result.error || `Failed to fetch plot with id ${id}`);
  }
  return result.data;
};
export const saveVegetationPlot = async (plot: Omit<VegetationPlot, 'id' | 'createdAt' | 'updatedAt'>) => {
  const result = await DataAccessLayer.saveVegetationPlot(plot);
  if (!result.success) {
    throw new Error(result.error || 'Failed to save plot');
  }
  return result.data || -1;
};
export const updateVegetationPlot = async (plot: VegetationPlot) => {
  const result = await DataAccessLayer.updateVegetationPlot(plot);
  if (!result.success) {
    throw new Error(result.error || 'Failed to update plot');
  }
  return result.data || -1;
};
export const getAllProjects = async () => {
  const result = await DataAccessLayer.getAllProjects();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch projects');
  }
  return result.data || [];
};
export const getProjectById = async (id: number) => {
  const result = await DataAccessLayer.getProjectById(id);
  if (!result.success) {
    throw new Error(result.error || `Failed to fetch project with id ${id}`);
  }
  return result.data;
};
export const createProject = async (project: Omit<Project, 'id' | 'createdDate' | 'updatedDate'>) => {
  const result = await DataAccessLayer.createProject(project);
  if (!result.success) {
    throw new Error(result.error || 'Failed to create project');
  }
  return result.data || -1;
};
export const updateProject = async (project: Project) => {
  const result = await DataAccessLayer.updateProject(project);
  if (!result.success) {
    throw new Error(result.error || 'Failed to update project');
  }
  // Return void as expected by the original function
};
export const deleteProject = async (id: number) => {
  const result = await DataAccessLayer.deleteProject(id);
  if (!result.success) {
    throw new Error(result.error || 'Failed to delete project');
  }
  // Return void as expected by the original function
};

