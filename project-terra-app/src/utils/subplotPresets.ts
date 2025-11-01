// Standard subplot configurations for common ecological sampling methods

export interface SubplotPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  generate: (plotWidth: number, plotHeight: number) => SubplotConfig[];
}

export interface SubplotConfig {
  id: string;
  name: string;
  shape: 'rectangular' | 'circular';
  width?: number;
  height?: number;
  radius?: number;
  positionX: number;
  positionY: number;
}

// Corner subplot preset (4 subplots at each corner)
export const cornerSubplotPreset: SubplotPreset = {
  id: 'corners',
  name: 'Corner Subplots',
  description: '1m×1m subplots at each corner of main plot',
  icon: '📐',
  generate: (plotWidth: number, plotHeight: number) => {
    const subplotSize = 1; // 1m×1m subplots
    const margin = 0.0; // 0.5m margin from plot edges
    
    return [
      {
        id: 'nw-corner',
        name: 'NW Corner',
        shape: 'rectangular',
        width: subplotSize,
        height: subplotSize,
        positionX: margin,
        positionY: margin
      },
      {
        id: 'ne-corner',
        name: 'NE Corner',
        shape: 'rectangular',
        width: subplotSize,
        height: subplotSize,
        positionX: plotWidth - subplotSize - margin,
        positionY: margin
      },
      {
        id: 'sw-corner',
        name: 'SW Corner',
        shape: 'rectangular',
        width: subplotSize,
        height: subplotSize,
        positionX: margin,
        positionY: plotHeight - subplotSize - margin
      },
      {
        id: 'se-corner',
        name: 'SE Corner',
        shape: 'rectangular',
        width: subplotSize,
        height: subplotSize,
        positionX: plotWidth - subplotSize - margin,
        positionY: plotHeight - subplotSize - margin
      }
    ];
  }
};

// Center subplot preset (single subplot in center)
export const centerSubplotPreset: SubplotPreset = {
  id: 'center',
  name: 'Center Subplot',
  description: 'Single 2m×2m subplot in plot center',
  icon: '⭕',
  generate: (plotWidth: number, plotHeight: number) => {
    const subplotSize = 2; // 2m×2m subplot
    
    return [
      {
        id: 'center',
        name: 'Center Plot',
        shape: 'rectangular',
        width: subplotSize,
        height: subplotSize,
        positionX: (plotWidth - subplotSize) / 2,
        positionY: (plotHeight - subplotSize) / 2
      }
    ];
  }
};

// Random distribution preset (randomly placed subplots)
export const randomSubplotPreset: SubplotPreset = {
  id: 'random',
  name: 'Random Distribution',
  description: '4 randomly distributed 1m×1m subplots',
  icon: '🎲',
  generate: (plotWidth: number, plotHeight: number) => {
    const subplotSize = 1;
    const margin = 1; // Minimum 1m margin from edges
    const subplots: SubplotConfig[] = [];
    
    // Generate 4 random subplots
    for (let i = 0; i < 4; i++) {
      // Generate random positions ensuring they don't overlap
      let validPosition = false;
      let attempts = 0;
      let positionX, positionY;
      
      while (!validPosition && attempts < 50) {
        positionX = margin + Math.random() * (plotWidth - subplotSize - margin * 2);
        positionY = margin + Math.random() * (plotHeight - subplotSize - margin * 2);
        
        // Check if this position overlaps with existing subplots
        validPosition = true;
        for (const subplot of subplots) {
          const overlap = !(
            positionX + subplotSize < subplot.positionX ||
            positionX > subplot.positionX + (subplot.width || 0) ||
            positionY + subplotSize < subplot.positionY ||
            positionY > subplot.positionY + (subplot.height || 0)
          );
          
          if (overlap) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      if (validPosition) {
        subplots.push({
          id: `random-${i + 1}`,
          name: `Random ${i + 1}`,
          shape: 'rectangular',
          width: subplotSize,
          height: subplotSize,
          positionX: positionX!,
          positionY: positionY!
        });
      }
    }
    
    return subplots;
  }
};

// Belt transect preset (along plot edges)
export const beltTransectPreset: SubplotPreset = {
  id: 'belt',
  name: 'Belt Transects',
  description: '1m wide transects along plot edges',
  icon: '〰️',
  generate: (plotWidth: number, plotHeight: number) => {
    const beltWidth = 1; // 1m wide belts
    
    return [
      {
        id: 'north-belt',
        name: 'North Belt',
        shape: 'rectangular',
        width: plotWidth,
        height: beltWidth,
        positionX: 0,
        positionY: 0
      },
      {
        id: 'south-belt',
        name: 'South Belt',
        shape: 'rectangular',
        width: plotWidth,
        height: beltWidth,
        positionX: 0,
        positionY: plotHeight - beltWidth
      }
    ];
  }
};

// Nested subplot preset (standard ecological hierarchy)
export const nestedSubplotPreset: SubplotPreset = {
  id: 'nested',
  name: 'Nested Subplots',
  description: 'Standard nested plot configuration (5×5, 2×2, 1×1m)',
  icon: '📐',
  generate: (plotWidth: number, plotHeight: number) => {
    // Center the nested plots
    const centerX = plotWidth / 2;
    const centerY = plotHeight / 2;
    
    return [
      {
        id: 'nested-5x5',
        name: '5×5m Plot',
        shape: 'rectangular',
        width: 5,
        height: 5,
        positionX: centerX - 2.5,
        positionY: centerY - 2.5
      },
      {
        id: 'nested-2x2',
        name: '2×2m Plot',
        shape: 'rectangular',
        width: 2,
        height: 2,
        positionX: centerX - 1,
        positionY: centerY - 1
      },
      {
        id: 'nested-1x1',
        name: '1×1m Plot',
        shape: 'rectangular',
        width: 1,
        height: 1,
        positionX: centerX - 0.5,
        positionY: centerY - 0.5
      }
    ];
  }
};

// Microplot preset (very small plots for seedlings/herbs)
export const microplotPreset: SubplotPreset = {
  id: 'micro',
  name: 'Microplots',
  description: 'Nine 0.5×0.5m microplots in 3×3 grid',
  icon: '🔬',
  generate: (plotWidth: number, plotHeight: number) => {
    const subplotSize = 0.5;
    const spacing = 1; // 1m spacing between subplot centers
    const gridCols = 3;
    const gridRows = 3;
    
    // Center the grid in the plot
    const totalWidth = (gridCols - 1) * spacing + subplotSize;
    const totalHeight = (gridRows - 1) * spacing + subplotSize;
    const startX = (plotWidth - totalWidth) / 2;
    const startY = (plotHeight - totalHeight) / 2;
    
    const subplots: SubplotConfig[] = [];
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        subplots.push({
          id: `micro-${row * gridCols + col + 1}`,
          name: `Micro ${row * gridCols + col + 1}`,
          shape: 'rectangular',
          width: subplotSize,
          height: subplotSize,
          positionX: startX + col * spacing,
          positionY: startY + row * spacing
        });
      }
    }
    
    return subplots;
  }
};

// All available presets
export const subplotPresets: SubplotPreset[] = [
  cornerSubplotPreset,
  centerSubplotPreset,
  randomSubplotPreset,
  beltTransectPreset,
  nestedSubplotPreset,
  microplotPreset
];

// Function to apply a preset to generate subplot configurations
export const applySubplotPreset = (
  presetId: string,
  plotWidth: number,
  plotHeight: number
): SubplotConfig[] => {
  const preset = subplotPresets.find(p => p.id === presetId);
  if (!preset) {
    throw new Error(`Preset with id '${presetId}' not found`);
  }
  
  return preset.generate(plotWidth, plotHeight);
};