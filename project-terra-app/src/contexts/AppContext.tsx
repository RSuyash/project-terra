import React, { createContext, useContext, useReducer } from 'react';
import type { 
  VegetationPlot, 
  Species, 
  Project, 
  BiodiversityAnalysis,
  SpeciesAreaPlot,
  CanopyPhoto 
} from '../db/database';

interface AppState {
  plots: VegetationPlot[];
  species: Species[];
  projects: Project[];
  analyses: BiodiversityAnalysis[];
  speciesAreaPlots: SpeciesAreaPlot[];
  canopyPhotos: CanopyPhoto[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PLOTS'; payload: VegetationPlot[] }
  | { type: 'ADD_PLOT'; payload: VegetationPlot }
  | { type: 'UPDATE_PLOT'; payload: VegetationPlot }
  | { type: 'DELETE_PLOT'; payload: number }
  | { type: 'SET_SPECIES'; payload: Species[] }
  | { type: 'ADD_SPECIES'; payload: Species }
  | { type: 'UPDATE_SPECIES'; payload: Species }
  | { type: 'DELETE_SPECIES'; payload: number }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: number };

const initialState: AppState = {
  plots: [],
  species: [],
  projects: [],
  analyses: [],
  speciesAreaPlots: [],
  canopyPhotos: [],
  loading: false,
  error: null,
};

const AppReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PLOTS':
      return { ...state, plots: action.payload, loading: false };
    case 'ADD_PLOT':
      return { 
        ...state, 
        plots: [...state.plots, action.payload],
        loading: false 
      };
    case 'UPDATE_PLOT':
      return {
        ...state,
        plots: state.plots.map(plot => 
          plot.id === action.payload.id ? action.payload : plot
        ),
        loading: false
      };
    case 'DELETE_PLOT':
      return {
        ...state,
        plots: state.plots.filter(plot => plot.id !== action.payload),
        loading: false
      };
    case 'SET_SPECIES':
      return { ...state, species: action.payload, loading: false };
    case 'ADD_SPECIES':
      return { 
        ...state, 
        species: [...state.species, action.payload],
        loading: false 
      };
    case 'UPDATE_SPECIES':
      return {
        ...state,
        species: state.species.map(spec => 
          spec.id === action.payload.id ? action.payload : spec
        ),
        loading: false
      };
    case 'DELETE_SPECIES':
      return {
        ...state,
        species: state.species.filter(spec => spec.id !== action.payload),
        loading: false
      };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [...state.projects, action.payload],
        loading: false 
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        ),
        loading: false
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload),
        loading: false
      };
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  const refreshData = async () => {
    // This would be implemented to fetch fresh data
    console.log('Refreshing app data...');
  };

  return (
    <AppContext.Provider value={{ ...state, dispatch, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};