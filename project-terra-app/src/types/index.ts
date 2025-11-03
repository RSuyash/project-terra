// types/index.ts

// Type definitions for the application
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

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Form state interfaces
export interface VegetationPlotFormState {
  plotNumber: string;
  habitat: string;
  observers: string;
  notes: string;
  groundCover: GroundCover;
  disturbance: Disturbance;
  location: Location | null;
  dimensions: {
    width: number;
    height: number;
    area: number;
  };
  quadrants: QuadrantData[];
  subplots: Subplot[];
  measurements: PlotMeasurement[];
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Search and filter interfaces
export interface SearchParams {
  query?: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
}

// UI component interfaces
export interface CardProps {
  title: string;
  description: string;
  link: string;
  linkText: string;
  icon: React.ReactNode;
}

export interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  description?: string;
}