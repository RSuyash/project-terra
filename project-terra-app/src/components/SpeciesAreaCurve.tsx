import { useState, useEffect } from 'react';
import { getAllPlots } from '../db/database';
import type { VegetationPlot } from '../db/database';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter, ScatterChart } from 'recharts';

interface PlotWithSpeciesCount extends Omit<VegetationPlot, 'measurements'> {
  measurements: Array<{
    speciesId: number;
    gbh?: number;
    dbh?: number;
    height?: number;
    heightAtFirstBranch?: number;
    canopyCover?: number;
  }>;
  uniqueSpeciesCount: number;
}

// Fixed nested plot sizes in square meters
const NESTED_PLOT_SIZES = [25, 100, 400, 1600]; // 5×5m, 10×10m, 20×20m, 40×40m
const NESTED_PLOT_LABELS = ['5×5m', '10×10m', '20×20m', '40×40m'];

export default function SpeciesAreaCurve() {
  const [plots, setPlots] = useState<PlotWithSpeciesCount[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [speciesAreaData, setSpeciesAreaData] = useState<Array<{ size: string; area: number; species: number; cumulativeSpecies: number }>>([]);
  const [curveParameters, setCurveParameters] = useState<{ c: number; z: number; rSquared: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to calculate species-area curve data for a plot
  const calculateSpeciesAreaData = (plot: VegetationPlot): Array<{ size: string; area: number; species: number; cumulativeSpecies: number }> => {
    if (!plot.measurements || plot.measurements.length === 0) {
      return [];
    }

    // Create unique species count for each nested plot size
    // In a real implementation, you'd have measurements specifically for each nested size
    // For now, we'll simulate by progressively counting unique species
    const allSpeciesIds = Array.from(new Set(plot.measurements.map(m => m.speciesId)));
    const uniqueSpeciesCount = allSpeciesIds.length;

    // Calculate cumulative species for each plot size
    // This is a simplified approach - in reality, nested plots would have different measurements
    const result = NESTED_PLOT_SIZES.map((area, index) => {
      // Calculate how many species we'd expect at this plot size
      // This is a simulation - in real implementation, you'd have actual nested measurements
      const speciesCount = Math.min(
        uniqueSpeciesCount,
        Math.max(1, Math.floor((index + 1) * uniqueSpeciesCount / NESTED_PLOT_SIZES.length))
      );

      return {
        size: NESTED_PLOT_LABELS[index],
        area: area,
        species: speciesCount,
        cumulativeSpecies: speciesCount // In nested plots, this would accumulate
      };
    });

    return result;
  };

  // Function to fit power law: S = c * A^z
  // Using linear regression on log-transformed data: log(S) = log(c) + z*log(A)
  const fitPowerLaw = (data: Array<{ area: number; species: number }>): { c: number; z: number; rSquared: number } => {
    if (data.length < 2) {
      return { c: 0, z: 0, rSquared: 0 };
    }

    // Filter out any zero values since we're doing log transformation
    const validData = data.filter(d => d.area > 0 && d.species > 0);
    if (validData.length < 2) {
      return { c: 0, z: 0, rSquared: 0 };
    }

    // Calculate log values
    const logAreas = validData.map(d => Math.log(d.area));
    const logSpecies = validData.map(d => Math.log(d.species));

    // Calculate means
    const meanLogArea = logAreas.reduce((a, b) => a + b, 0) / logAreas.length;
    const meanLogSpecies = logSpecies.reduce((a, b) => a + b, 0) / logSpecies.length;

    // Calculate slope (z) and intercept (log(c))
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < logAreas.length; i++) {
      numerator += (logAreas[i] - meanLogArea) * (logSpecies[i] - meanLogSpecies);
      denominator += Math.pow(logAreas[i] - meanLogArea, 2);
    }

    const z = denominator !== 0 ? numerator / denominator : 0;
    const logC = meanLogSpecies - z * meanLogArea;
    const c = Math.exp(logC);

    // Calculate R-squared
    let ssTot = 0;
    let ssRes = 0;
    const predictedLogSpecies = logAreas.map(logA => logC + z * logA);

    for (let i = 0; i < logSpecies.length; i++) {
      ssTot += Math.pow(logSpecies[i] - meanLogSpecies, 2);
      ssRes += Math.pow(logSpecies[i] - predictedLogSpecies[i], 2);
    }

    const rSquared = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;

    return { c: parseFloat(c.toFixed(4)), z: parseFloat(z.toFixed(4)), rSquared: parseFloat(rSquared.toFixed(4)) };
  };

  useEffect(() => {
    async function loadPlots() {
      try {
        setIsLoading(true);
        const allPlots = await getAllPlots();

        // Calculate unique species count for each plot
        const plotsWithCounts = allPlots.map(plot => ({
          ...plot,
          uniqueSpeciesCount: new Set(plot.measurements.map(m => m.speciesId)).size
        }));

        setPlots(plotsWithCounts);

        // If there are plots, select the first one by default
        if (plotsWithCounts.length > 0) {
          const firstPlot = plotsWithCounts[0];
          setSelectedPlotId(firstPlot.id || null);
        }
      } catch (err) {
        console.error("Failed to load plots:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading plots.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPlots();
  }, []);

  useEffect(() => {
    if (selectedPlotId) {
      const plot = plots.find(p => p.id === selectedPlotId);
      if (plot) {
        const areaData = calculateSpeciesAreaData(plot);
        setSpeciesAreaData(areaData);
        
        // Calculate curve parameters
        if (areaData.length > 0) {
          const parameters = fitPowerLaw(areaData);
          setCurveParameters(parameters);
        } else {
          setCurveParameters(null);
        }
      }
    }
  }, [selectedPlotId, plots]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Species-Area Data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-red-500">
        <h2 className="text-3xl font-bold">Error Loading Data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          Species-Area Curve Analysis
        </h2>
      </div>

      {plots.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Plots Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create vegetation plots to analyze species-area relationships.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Select Plot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                className="input-field"
                value={selectedPlotId || ''}
                onChange={(e) => setSelectedPlotId(e.target.value ? parseInt(e.target.value) : null)}
              >
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id || ''}>
                    {plot.plotNumber} ({plot.uniqueSpeciesCount} unique species, {plot.measurements.length} measurements)
                  </option>
                ))}
              </select>
              
              {selectedPlotId && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold">Selected Plot Details</h4>
                  <p><span className="font-medium">Plot Number:</span> {plots.find(p => p.id === selectedPlotId)?.plotNumber}</p>
                  <p><span className="font-medium">Total Measurements:</span> {plots.find(p => p.id === selectedPlotId)?.measurements.length}</p>
                  <p><span className="font-medium">Unique Species:</span> {selectedPlotId ? plots.find(p => p.id === selectedPlotId)?.uniqueSpeciesCount : 0}</p>
                </div>
              )}
            </div>
          </div>

          {selectedPlotId && speciesAreaData.length > 0 && (
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Curve Parameters</h3>
                
                {curveParameters ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                        {curveParameters.c}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">c parameter</div>
                    </div>
                    
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                        {curveParameters.z}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">z exponent</div>
                    </div>
                    
                    <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                      <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                        {curveParameters.rSquared}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">R² value</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    Insufficient data to calculate curve parameters.
                  </p>
                )}
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Species-Area Curve</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                      margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="area" 
                        name="Area" 
                        label={{ value: 'Area (m²)', position: 'insideBottom', offset: -10 }} 
                        scale="log"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="species" 
                        name="Species" 
                        label={{ value: 'Species Richness', angle: -90, position: 'insideLeft' }} 
                        scale="linear"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        formatter={(value, name) => [value, name === 'species' ? 'Species Richness' : 'Area (m²)']}
                        labelFormatter={(value) => `Area: ${value} m²`}
                      />
                      <Legend />
                      <Scatter name="Observed Data" data={speciesAreaData} fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Power Law Visualization</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={speciesAreaData}
                      margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="area" 
                        name="Area" 
                        label={{ value: 'Area (m²)', position: 'insideBottom', offset: -10 }} 
                        type="number"
                        scale="log"
                      />
                      <YAxis 
                        name="Species" 
                        label={{ value: 'Species Richness', angle: -90, position: 'insideLeft' }} 
                        type="number"
                        scale="linear"
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'species' ? 'Species Richness' : 'Area (m²)']}
                        labelFormatter={(value) => `Area: ${value} m²`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="species" 
                        name="Observed Species" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Data Table</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plot Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Area (m²)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Species Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cumulative Species</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {speciesAreaData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                            {row.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {row.area}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {row.species}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {row.cumulativeSpecies}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedPlotId && speciesAreaData.length === 0 && (
            <div className="card text-center py-8">
              <h3 className="text-xl font-bold mb-2">No Species-Area Data</h3>
              <p className="text-gray-600 dark:text-gray-400">
                The selected plot doesn't have sufficient data to generate a species-area curve.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}