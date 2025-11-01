import type { PlotMeasurement } from '../db/database';

/**
 * Calculate species richness (S)
 * Simple count of unique species
 */
export function calculateSpeciesRichness(measurements: PlotMeasurement[]): number {
  const uniqueSpecies = new Set(measurements.map(m => m.speciesId));
  return uniqueSpecies.size;
}

/**
 * Calculate Shannon-Wiener Index (H')
 * H' = -Σ(pi × ln(pi))
 * where pi is the proportion of individuals belonging to species i
 */
export function calculateShannonWiener(measurements: PlotMeasurement[]): number {
  const speciesCounts = getSpeciesAbundance(measurements);
  const totalIndividuals = getTotalAbundance(measurements);
  
  if (totalIndividuals === 0) return 0;
  
  let shannon = 0;
  speciesCounts.forEach((count) => {
    const proportion = count / totalIndividuals;
    if (proportion > 0) {
      shannon -= proportion * Math.log(proportion);
    }
  });
  
  return shannon;
}

/**
 * Calculate Simpson's Index (D)
 * D = Σ(pi²)
 * where pi is the proportion of individuals belonging to species i
 */
export function calculateSimpsonIndex(measurements: PlotMeasurement[]): number {
  const speciesCounts = getSpeciesAbundance(measurements);
  const totalIndividuals = getTotalAbundance(measurements);
  
  if (totalIndividuals === 0) return 0;
  
  let simpson = 0;
  speciesCounts.forEach((count) => {
    const proportion = count / totalIndividuals;
    simpson += proportion * proportion;
  });
  
  return simpson;
}

/**
 * Calculate Simpson's Reciprocal Index (1/D or 1-D)
 * More intuitive: higher value = more diversity
 */
export function calculateSimpsonReciprocal(measurements: PlotMeasurement[]): number {
  const simpson = calculateSimpsonIndex(measurements);
  return simpson > 0 ? 1 - simpson : 0;
}

/**
 * Calculate Pielou's Evenness (J)
 * J = H' / ln(S)
 * where H' is Shannon-Wiener and S is species richness
 */
export function calculatePielouEvenness(measurements: PlotMeasurement[]): number {
  const shannon = calculateShannonWiener(measurements);
  const richness = calculateSpeciesRichness(measurements);
  
  if (richness <= 1) return 0;
  
  const maxShannon = Math.log(richness);
  return maxShannon > 0 ? shannon / maxShannon : 0;
}

/**
 * Calculate Menhinick's Index
 * DMn = S / √N
 * where S is species richness and N is total number of individuals
 */
export function calculateMenhinickIndex(measurements: PlotMeasurement[]): number {
  const richness = calculateSpeciesRichness(measurements);
  const totalIndividuals = getTotalAbundance(measurements);
  
  if (totalIndividuals === 0) return 0;
  
  return richness / Math.sqrt(totalIndividuals);
}

/**
 * Calculate Margalef's Index
 * DMg = (S - 1) / ln(N)
 * where S is species richness and N is total number of individuals
 */
export function calculateMargalefIndex(measurements: PlotMeasurement[]): number {
  const richness = calculateSpeciesRichness(measurements);
  const totalIndividuals = getTotalAbundance(measurements);
  
  if (totalIndividuals <= 1) return 0;
  
  return (richness - 1) / Math.log(totalIndividuals);
}

// Helper functions
function getSpeciesAbundance(measurements: PlotMeasurement[]): number[] {
  const counts = new Map<number, number>();
  
  measurements.forEach((measurement) => {
    const currentCount = counts.get(measurement.speciesId) || 0;
    counts.set(measurement.speciesId, currentCount + 1);
  });
  
  return Array.from(counts.values());
}

function getTotalAbundance(measurements: PlotMeasurement[]): number {
  return measurements.length;
}

/**
 * Calculate all biodiversity indices for a plot
 */
export interface BiodiversityIndices {
  speciesRichness: number;
  shannonWiener: number;
  simpsonIndex: number;
  simpsonReciprocal: number;
  pielouEvenness: number;
  menhinickIndex: number;
  margalefIndex: number;
}

export function calculateAllIndices(measurements: PlotMeasurement[]): BiodiversityIndices {
  return {
    speciesRichness: calculateSpeciesRichness(measurements),
    shannonWiener: calculateShannonWiener(measurements),
    simpsonIndex: calculateSimpsonIndex(measurements),
    simpsonReciprocal: calculateSimpsonReciprocal(measurements),
    pielouEvenness: calculatePielouEvenness(measurements),
    menhinickIndex: calculateMenhinickIndex(measurements),
    margalefIndex: calculateMargalefIndex(measurements),
  };
}

