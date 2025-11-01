import Dexie from 'dexie';
import type { Table } from 'dexie';

// Type definitions
export interface Species {
  id?: number;
  name: string;
  scientificName?: string;
  family?: string;
  commonNames?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanopyPhoto {
  id?: number;
  plotId: number;
  angle: 'center' | 'nw' | 'ne' | 'se' | 'sw';
  imageData: string; // Base64 encoded
  timestamp: Date;
}

export interface Project {
  id?: number;
  name: string;
  description?: string;
  plotIds: number[];
  createdDate: Date;
  updatedDate: Date;
}

export interface GroundCover {
  shrub: number;
  herb: number;
  grass: number;
  bare: number;
  rock: number;
  litter: number;
}

export interface Disturbance {
  grazing: boolean;
  poaching: boolean;
  lopping: boolean;
  invasives: boolean;
  fire: boolean;
}

export interface PlotMeasurement {
  speciesId: number;
  gbh?: number; // Girth at Breast Height (cm)
  dbh?: number; // Diameter at Breast Height (cm)
  height?: number; // Total height (m)
  heightAtFirstBranch?: number; // Height to first branch (m)
  canopyCover?: number; // Canopy cover percentage
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  source?: 'auto' | 'manual';
}

export interface VegetationPlot {
  id?: number;
  plotNumber: string;
  location: Location;
  date: Date;
  observers: string[];
  habitat?: string;
  slope?: number;
  aspect?: number;
  notes?: string;
  groundCover: GroundCover;
  disturbance: Disturbance;
  measurements: PlotMeasurement[];
  canopyPhotos?: number[]; // References to CanopyPhoto IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface SpeciesAreaPlot {
  id?: number;
  plotSize: number; // in m² (25, 100, 400, 1600)
  species: string[]; // Cumulative unique species list
  plotId: number; // Parent vegetation plot ID
}

export interface BiodiversityAnalysis {
  id?: number;
  plotId: number;
  speciesRichness: number;
  shannonWiener: number;
  simpsonIndex: number;
  simpsonReciprocal: number; // 1-D
  pielouEvenness: number;
  calculatedAt: Date;
}

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
  }
}

// Create singleton instance
export const db = new EcoFieldDatabase();

// Helper functions
export async function getAllSpecies(): Promise<Species[]> {
  return await db.species.toArray();
}

export async function searchSpecies(query: string): Promise<Species[]> {
  const lowerQuery = query.toLowerCase();
  return await db.species
    .filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.scientificName?.toLowerCase().includes(lowerQuery) ||
      s.commonNames?.some(name => name.toLowerCase().includes(lowerQuery))
    )
    .toArray();
}

export async function addSpecies(species: Omit<Species, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  return await db.species.add({
    ...species,
    createdAt: now,
    updatedAt: now,
  });
}

export async function saveVegetationPlot(plot: Omit<VegetationPlot, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  return await db.vegetationPlots.add({
    ...plot,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getAllPlots(): Promise<VegetationPlot[]> {
  const plots = await db.vegetationPlots.toArray();
  return plots.map(plot => {
    // Ensure disturbance has all required boolean values
    plot.disturbance = {
      grazing: !!plot.disturbance?.grazing,
      poaching: !!plot.disturbance?.poaching,
      lopping: !!plot.disturbance?.lopping,
      invasives: !!plot.disturbance?.invasives,
      fire: !!plot.disturbance?.fire
    };
    return plot;
  });
}

export async function getPlotById(id: number): Promise<VegetationPlot | undefined> {
  const plot = await db.vegetationPlots.get(id);
  if (plot) {
    // Ensure disturbance has all required boolean values
    plot.disturbance = {
      grazing: !!plot.disturbance?.grazing,
      poaching: !!plot.disturbance?.poaching,
      lopping: !!plot.disturbance?.lopping,
      invasives: !!plot.disturbance?.invasives,
      fire: !!plot.disturbance?.fire
    };
  }
  return plot;
}

export async function updateVegetationPlot(plot: VegetationPlot): Promise<number> {
  const now = new Date();
  return await db.vegetationPlots.put({
    ...plot,
    updatedAt: now,
  });
}

export async function populate() {
  const speciesCount = await db.species.count();
  if (speciesCount === 0) {
    await db.species.bulkAdd([
      { name: 'Teak', scientificName: 'Tectona grandis', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Rosewood', scientificName: 'Dalbergia latifolia', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sandalwood', scientificName: 'Santalum album', createdAt: new Date(), updatedAt: new Date() },
    ]);
  }
}

// Project helper functions
export async function getAllProjects(): Promise<Project[]> {
  return await db.projects.toArray();
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  return await db.projects.get(id);
}

export async function createProject(project: Omit<Project, 'id' | 'createdDate' | 'updatedDate'>): Promise<number> {
  const now = new Date();
  return await db.projects.add({
    ...project,
    createdDate: now,
    updatedDate: now,
  });
}

export async function updateProject(project: Project): Promise<void> {
  const now = new Date();
  await db.projects.put({
    ...project,
    updatedDate: now,
  });
}

export async function deleteProject(id: number): Promise<void> {
  await db.projects.delete(id);
}

populate().catch(err => {
  console.error("Failed to populate database:", err);
});

