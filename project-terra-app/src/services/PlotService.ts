// services/PlotService.ts
import { 
  DataAccessLayer 
} from '../db/database';
import type { 
  VegetationPlot 
} from '../db/database';

export class PlotService {
  static async getAll(): Promise<VegetationPlot[]> {
    const result = await DataAccessLayer.getAllPlots();
    if (!result.success) {
      console.error('Error fetching plots:', result.error);
      throw new Error(result.error || 'Failed to fetch plots');
    }
    return result.data || [];
  }

  static async getById(id: number): Promise<VegetationPlot | undefined> {
    const result = await DataAccessLayer.getPlotById(id);
    if (!result.success) {
      console.error(`Error fetching plot with id ${id}:`, result.error);
      throw new Error(result.error || `Failed to fetch plot with id ${id}`);
    }
    return result.data;
  }

  static async create(plotData: Omit<VegetationPlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const result = await DataAccessLayer.saveVegetationPlot(plotData);
    if (!result.success) {
      console.error('Error creating plot:', result.error);
      throw new Error(result.error || 'Failed to create plot');
    }
    return result.data || -1;
  }

  static async update(plotData: VegetationPlot): Promise<number> {
    const result = await DataAccessLayer.updateVegetationPlot(plotData);
    if (!result.success) {
      console.error('Error updating plot:', result.error);
      throw new Error(result.error || 'Failed to update plot');
    }
    return result.data || -1;
  }

  static async delete(id: number): Promise<void> {
    // This would be implemented with delete functionality
    // Currently the database doesn't have delete functionality
    console.warn('Delete functionality not implemented in database layer');
  }
}