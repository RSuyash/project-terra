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

export interface PlotDimensions {
  width: number;
  height: number;
  area: number;
  unit: 'm' | 'ft' | 'cm';
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  source?: 'auto' | 'manual';
}

export type Quadrant = 'NW' | 'NE' | 'SW' | 'SE';

export interface QuadrantData {
  quadrant: Quadrant;
  measurements: PlotMeasurement[];
  groundCover: GroundCover;
  disturbance: Disturbance;
  canopyCover?: number; // Canopy cover percentage for this quadrant
}

export type SubplotShape = 'rectangular' | 'circular';

export interface Subplot {
  id: string; // Unique identifier for the subplot
  name?: string; // Optional name for the subplot
  shape: SubplotShape;
  // For rectangular subplots
  width?: number; // in meters
  height?: number; // in meters
  // For circular subplots
  radius?: number; // in meters
  // Position within the main plot (in meters from NW corner)
  positionX: number; // Distance from left edge of main plot
  positionY: number; // Distance from top edge of main plot
  measurements: PlotMeasurement[]; // Subplot-specific measurements
  groundCover: GroundCover; // Subplot-specific ground cover (required)
  disturbance: Disturbance; // Subplot-specific disturbance (required)
}

export interface PlotDimensions {
  width: number; // in meters
  height: number; // in meters
  area: number; // in square meters (width * height)
  unit: 'm'; // for future expansion to other units
}

export interface VegetationPlot {
  id?: number;
  plotNumber: string;
  location: Location;
  dimensions: PlotDimensions; // New field for plot size
  date: Date;
  observers: string[];
  habitat?: string;
  slope?: number;
  aspect?: number;
  notes?: string;
  groundCover: GroundCover; // Overall plot ground cover
  disturbance: Disturbance; // Overall plot disturbance
  measurements: PlotMeasurement[]; // Overall plot measurements
  quadrants?: QuadrantData[]; // Quadrant-specific data
  subplots?: Subplot[]; // Subplot-specific data
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

