// services/SpeciesService.ts
import { 
  DataAccessLayer 
} from '../db/database';
import type { 
  Species 
} from '../db/database';

export class SpeciesService {
  static async getAll(): Promise<Species[]> {
    const result = await DataAccessLayer.getAllSpecies();
    if (!result.success) {
      console.error('Error fetching species:', result.error);
      throw new Error(result.error || 'Failed to fetch species');
    }
    return result.data || [];
  }

  static async create(speciesData: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const result = await DataAccessLayer.addSpecies(speciesData);
    if (!result.success) {
      console.error('Error creating species:', result.error);
      throw new Error(result.error || 'Failed to create species');
    }
    return result.data || -1;
  }
}