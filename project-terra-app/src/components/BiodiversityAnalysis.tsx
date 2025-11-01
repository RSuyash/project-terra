import { useState, useEffect } from 'react';
import { getAllPlots, getAllSpecies } from '../db/database';
import type { VegetationPlot, Species } from '../db/database';
import { calculateAllIndices } from '../utils/biodiversity';
import type { BiodiversityIndices } from '../utils/biodiversity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface PlotWithBiodiversity extends VegetationPlot {
  biodiversity?: BiodiversityIndices;
}

export default function BiodiversityAnalysis() {
  const [plots, setPlots] = useState<PlotWithBiodiversity[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [biodiversityData, setBiodiversityData] = useState<BiodiversityIndices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBiodiversityData() {
      try {
        setIsLoading(true);
        
        // Load both plots and species
        const [allPlots, allSpecies] = await Promise.all([
          getAllPlots(),
          getAllSpecies()
        ]);
        
        setSpeciesList(allSpecies);
        
        // Calculate biodiversity indices for each plot
        const plotsWithBiodiversity = allPlots.map(plot => {
          const biodiversity = calculateAllIndices(plot.measurements);
          return {
            ...plot,
            biodiversity
          };
        });
        
        setPlots(plotsWithBiodiversity);
        
        // If there are plots, select the first one by default
        if (plotsWithBiodiversity.length > 0) {
          const firstPlot = plotsWithBiodiversity[0];
          setSelectedPlotId(firstPlot.id || null);
          setBiodiversityData(firstPlot.biodiversity);
        }
      } catch (err) {
        console.error("Failed to load biodiversity data:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading data.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadBiodiversityData();
  }, []);

  useEffect(() => {
    if (selectedPlotId) {
      const plot = plots.find(p => p.id === selectedPlotId);
      if (plot) {
        setBiodiversityData(plot.biodiversity || null);
      }
    }
  }, [selectedPlotId, plots]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Biodiversity Data...</h2>
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

  const biodiversityChartData = biodiversityData ? [
    { name: 'Species Richness', value: biodiversityData.speciesRichness },
    { name: 'Shannon-Wiener', value: parseFloat(biodiversityData.shannonWiener.toFixed(3)) },
    { name: 'Simpson Index', value: parseFloat(biodiversityData.simpsonIndex.toFixed(3)) },
    { name: 'Simpson Reciprocal', value: parseFloat(biodiversityData.simpsonReciprocal.toFixed(3)) },
    { name: 'Pielou Evenness', value: parseFloat(biodiversityData.pielouEvenness.toFixed(3)) },
    { name: 'Menhinick Index', value: parseFloat(biodiversityData.menhinickIndex.toFixed(3)) },
    { name: 'Margalef Index', value: parseFloat(biodiversityData.margalefIndex.toFixed(3)) },
  ] : [];

  const speciesData = selectedPlotId ? (() => {
    const plot = plots.find(p => p.id === selectedPlotId);
    if (!plot) return [];
    
    // Create a mapping from species ID to name
    const speciesMap: Record<number, string> = {};
    speciesList.forEach(species => {
      if (species.id !== undefined) {
        speciesMap[species.id] = species.name;
      }
    });
    
    // Group measurements by species and count occurrences
    const speciesCounts: Record<string, number> = {};
    
    plot.measurements.forEach(measurement => {
      const speciesName = speciesMap[measurement.speciesId] || `Species ${measurement.speciesId}`;
      speciesCounts[speciesName] = (speciesCounts[speciesName] || 0) + 1;
    });
    
    return Object.entries(speciesCounts).map(([name, count]) => ({
      name,
      count
    }));
  })() : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          Biodiversity Analysis
        </h2>
      </div>

      {plots.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Plots Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create vegetation plots to analyze biodiversity metrics.
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
                    {plot.plotNumber} ({plot.measurements.length} measurements, {new Set(plot.measurements.map(m => m.speciesId)).size} species)
                  </option>
                ))}
              </select>
              
              {selectedPlotId && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold">Selected Plot Details</h4>
                  <p><span className="font-medium">Plot Number:</span> {plots.find(p => p.id === selectedPlotId)?.plotNumber}</p>
                  <p><span className="font-medium">Measurements:</span> {plots.find(p => p.id === selectedPlotId)?.measurements.length}</p>
                  <p><span className="font-medium">Species Count:</span> {selectedPlotId ? new Set(plots.find(p => p.id === selectedPlotId)?.measurements.map(m => m.speciesId)).size : 0}</p>
                </div>
              )}
            </div>
          </div>

          {biodiversityData && selectedPlotId && (
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Biodiversity Indices</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.speciesRichness}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Species Richness (S)</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.shannonWiener.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Shannon-Wiener (H')</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.simpsonIndex.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Simpson Index (D)</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.simpsonReciprocal.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Simpson Reciprocal (1-D)</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center md:col-span-2">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.pielouEvenness.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Pielou's Evenness (J)</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.menhinickIndex.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Menhinick Index</div>
                  </div>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {biodiversityData.margalefIndex.toFixed(3)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Margalef Index</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Biodiversity Indices Chart</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={biodiversityChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Index Value" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Species Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      {speciesData.length > 0 ? (
                        <PieChart>
                          <Pie
                            data={speciesData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => {
                              // TypeScript fix: explicitly type percent
                              const pct = percent as number;
                              return `${name} ${(pct * 100).toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {speciesData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Count']} />
                          <Legend />
                        </PieChart>
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                          No species data available for this plot
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">All Plots Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plot</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Species</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Richness</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shannon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Simpson</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Evenness</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {plots.map((plot) => (
                    <tr key={plot.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
                        {plot.plotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plot.biodiversity ? new Set(plot.measurements.map(m => m.speciesId)).size : 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plot.biodiversity?.speciesRichness || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plot.biodiversity ? plot.biodiversity.shannonWiener.toFixed(3) : '0.000'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plot.biodiversity ? plot.biodiversity.simpsonIndex.toFixed(3) : '0.000'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plot.biodiversity ? plot.biodiversity.pielouEvenness.toFixed(3) : '0.000'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}