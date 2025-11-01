import { useState, useEffect } from 'react';
import { getAllPlots, getAllSpecies } from '../db/database';
import type { VegetationPlot, Species } from '../db/database';
import Papa from 'papaparse';

interface ExportOptions {
  includeMeasurements: boolean;
  includeBiodiversity: boolean;
  includeLocation: boolean;
  includeDisturbance: boolean;
  includeGroundCover: boolean;
}

export default function CSVExport() {
  const [plots, setPlots] = useState<VegetationPlot[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeMeasurements: true,
    includeBiodiversity: false, // This would require calculating indices
    includeLocation: true,
    includeDisturbance: true,
    includeGroundCover: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadExportData() {
      try {
        setIsLoading(true);
        
        // Load both plots and species to have complete data for export
        const [allPlots, allSpecies] = await Promise.all([
          getAllPlots(),
          getAllSpecies()
        ]);
        
        setPlots(allPlots);
        setSpeciesList(allSpecies);
      } catch (err) {
        console.error("Failed to load data for export:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while loading data for export.");
        }
      } finally {
        setIsLoading(false);
      }
    }
    
    loadExportData();
  }, []);

  // Function to get species name by ID
  const getSpeciesName = (speciesId: number): string => {
    const species = speciesList.find(s => s.id === speciesId);
    return species ? species.name : `Species ${speciesId}`;
  };

  // Function to export all plots as CSV
  const exportAllPlots = () => {
    setIsExporting(true);

    try {
      // Prepare header row
      let headers = [
        'plotNumber',
        'date',
        'observers',
        'habitat',
        'notes'
      ];

      if (exportOptions.includeLocation) {
        headers = headers.concat(['latitude', 'longitude', 'accuracy']);
      }

      if (exportOptions.includeGroundCover) {
        headers = headers.concat(['shrubCover', 'herbCover', 'grassCover', 'bareCover', 'rockCover', 'litterCover']);
      }

      if (exportOptions.includeDisturbance) {
        headers = headers.concat(['grazing', 'poaching', 'lopping', 'invasives', 'fire']);
      }

      // If including measurements, we'll have one row per measurement
      if (exportOptions.includeMeasurements) {
        headers = headers.concat(['speciesName', 'scientificName', 'gbh', 'dbh', 'height', 'heightAtFirstBranch', 'canopyCover']);
      }

      // Prepare data rows
      const rows = [];
      for (const plot of plots) {
        if (exportOptions.includeMeasurements && plot.measurements.length > 0) {
          // One row per measurement
          for (const measurement of plot.measurements) {
            const species = speciesList.find(s => s.id === measurement.speciesId);
            
            const row: any = {
              plotNumber: plot.plotNumber,
              date: plot.date?.toISOString().split('T')[0] || '',
              observers: plot.observers.join('; '),
              habitat: plot.habitat || '',
              notes: plot.notes || ''
            };

            if (exportOptions.includeLocation) {
              row.latitude = plot.location?.latitude || '';
              row.longitude = plot.location?.longitude || '';
              row.accuracy = plot.location?.accuracy || '';
            }

            if (exportOptions.includeGroundCover) {
              row.shrubCover = plot.groundCover?.shrub || '';
              row.herbCover = plot.groundCover?.herb || '';
              row.grassCover = plot.groundCover?.grass || '';
              row.bareCover = plot.groundCover?.bare || '';
              row.rockCover = plot.groundCover?.rock || '';
              row.litterCover = plot.groundCover?.litter || '';
            }

            if (exportOptions.includeDisturbance) {
              row.grazing = plot.disturbance?.grazing ? 'Yes' : 'No';
              row.poaching = plot.disturbance?.poaching ? 'Yes' : 'No';
              row.lopping = plot.disturbance?.lopping ? 'Yes' : 'No';
              row.invasives = plot.disturbance?.invasives ? 'Yes' : 'No';
              row.fire = plot.disturbance?.fire ? 'Yes' : 'No';
            }

            // Add measurement-specific fields
            row.speciesName = getSpeciesName(measurement.speciesId);
            row.scientificName = species?.scientificName || '';
            row.gbh = measurement.gbh || '';
            row.dbh = measurement.dbh || '';
            row.height = measurement.height || '';
            row.heightAtFirstBranch = measurement.heightAtFirstBranch || '';
            row.canopyCover = measurement.canopyCover || '';

            rows.push(row);
          }
        } else {
          // One row per plot
          const row: any = {
            plotNumber: plot.plotNumber,
            date: plot.date?.toISOString().split('T')[0] || '',
            observers: plot.observers.join('; '),
            habitat: plot.habitat || '',
            notes: plot.notes || ''
          };

          if (exportOptions.includeLocation) {
            row.latitude = plot.location?.latitude || '';
            row.longitude = plot.location?.longitude || '';
            row.accuracy = plot.location?.accuracy || '';
          }

          if (exportOptions.includeGroundCover) {
            row.shrubCover = plot.groundCover?.shrub || '';
            row.herbCover = plot.groundCover?.herb || '';
            row.grassCover = plot.groundCover?.grass || '';
            row.bareCover = plot.groundCover?.bare || '';
            row.rockCover = plot.groundCover?.rock || '';
            row.litterCover = plot.groundCover?.litter || '';
          }

          if (exportOptions.includeDisturbance) {
            row.grazing = plot.disturbance?.grazing ? 'Yes' : 'No';
            row.poaching = plot.disturbance?.poaching ? 'Yes' : 'No';
            row.lopping = plot.disturbance?.lopping ? 'Yes' : 'No';
            row.invasives = plot.disturbance?.invasives ? 'Yes' : 'No';
            row.fire = plot.disturbance?.fire ? 'Yes' : 'No';
          }

          // Add empty measurement fields if not including measurements
          if (exportOptions.includeMeasurements) {
            row.speciesName = '';
            row.scientificName = '';
            row.gbh = '';
            row.dbh = '';
            row.height = '';
            row.heightAtFirstBranch = '';
            row.canopyCover = '';
          }

          rows.push(row);
        }
      }

      // Generate CSV
      const csv = Papa.unparse({
        fields: headers,
        data: rows
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `project-terra-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Exported ${plots.length} plots to CSV successfully!`);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  // Function to export a single plot as CSV
  const exportSinglePlot = (plotId: number) => {
    setIsExporting(true);

    try {
      const plot = plots.find(p => p.id === plotId);
      if (!plot) {
        setError("Plot not found");
        setIsExporting(false);
        return;
      }

      // Prepare header row
      let headers = [
        'plotNumber',
        'date',
        'observers',
        'habitat',
        'notes'
      ];

      if (exportOptions.includeLocation) {
        headers = headers.concat(['latitude', 'longitude', 'accuracy']);
      }

      if (exportOptions.includeGroundCover) {
        headers = headers.concat(['shrubCover', 'herbCover', 'grassCover', 'bareCover', 'rockCover', 'litterCover']);
      }

      if (exportOptions.includeDisturbance) {
        headers = headers.concat(['grazing', 'poaching', 'lopping', 'invasives', 'fire']);
      }

      if (exportOptions.includeMeasurements) {
        headers = headers.concat(['speciesName', 'scientificName', 'gbh', 'dbh', 'height', 'heightAtFirstBranch', 'canopyCover']);
      }

      // Prepare data rows
      const rows = [];
      if (exportOptions.includeMeasurements && plot.measurements.length > 0) {
        // One row per measurement
        for (const measurement of plot.measurements) {
          const species = speciesList.find(s => s.id === measurement.speciesId);
          
          const row: any = {
            plotNumber: plot.plotNumber,
            date: plot.date?.toISOString().split('T')[0] || '',
            observers: plot.observers.join('; '),
            habitat: plot.habitat || '',
            notes: plot.notes || ''
          };

          if (exportOptions.includeLocation) {
            row.latitude = plot.location?.latitude || '';
            row.longitude = plot.location?.longitude || '';
            row.accuracy = plot.location?.accuracy || '';
          }

          if (exportOptions.includeGroundCover) {
            row.shrubCover = plot.groundCover?.shrub || '';
            row.herbCover = plot.groundCover?.herb || '';
            row.grassCover = plot.groundCover?.grass || '';
            row.bareCover = plot.groundCover?.bare || '';
            row.rockCover = plot.groundCover?.rock || '';
            row.litterCover = plot.groundCover?.litter || '';
          }

          if (exportOptions.includeDisturbance) {
            row.grazing = plot.disturbance?.grazing ? 'Yes' : 'No';
            row.poaching = plot.disturbance?.poaching ? 'Yes' : 'No';
            row.lopping = plot.disturbance?.lopping ? 'Yes' : 'No';
            row.invasives = plot.disturbance?.invasives ? 'Yes' : 'No';
            row.fire = plot.disturbance?.fire ? 'Yes' : 'No';
          }

          // Add measurement-specific fields
          row.speciesName = getSpeciesName(measurement.speciesId);
          row.scientificName = species?.scientificName || '';
          row.gbh = measurement.gbh || '';
          row.dbh = measurement.dbh || '';
          row.height = measurement.height || '';
          row.heightAtFirstBranch = measurement.heightAtFirstBranch || '';
          row.canopyCover = measurement.canopyCover || '';

          rows.push(row);
        }
      } else {
        // Single row for the plot
        const row: any = {
          plotNumber: plot.plotNumber,
          date: plot.date?.toISOString().split('T')[0] || '',
          observers: plot.observers.join('; '),
          habitat: plot.habitat || '',
          notes: plot.notes || ''
        };

        if (exportOptions.includeLocation) {
          row.latitude = plot.location?.latitude || '';
          row.longitude = plot.location?.longitude || '';
          row.accuracy = plot.location?.accuracy || '';
        }

        if (exportOptions.includeGroundCover) {
          row.shrubCover = plot.groundCover?.shrub || '';
          row.herbCover = plot.groundCover?.herb || '';
          row.grassCover = plot.groundCover?.grass || '';
          row.bareCover = plot.groundCover?.bare || '';
          row.rockCover = plot.groundCover?.rock || '';
          row.litterCover = plot.groundCover?.litter || '';
        }

        if (exportOptions.includeDisturbance) {
          row.grazing = plot.disturbance?.grazing ? 'Yes' : 'No';
          row.poaching = plot.disturbance?.poaching ? 'Yes' : 'No';
          row.lopping = plot.disturbance?.lopping ? 'Yes' : 'No';
          row.invasives = plot.disturbance?.invasives ? 'Yes' : 'No';
          row.fire = plot.disturbance?.fire ? 'Yes' : 'No';
        }

        // Add empty measurement fields if not including measurements
        if (exportOptions.includeMeasurements) {
          row.speciesName = '';
          row.scientificName = '';
          row.gbh = '';
          row.dbh = '';
          row.height = '';
          row.heightAtFirstBranch = '';
          row.canopyCover = '';
        }

        rows.push(row);
      }

      // Generate CSV
      const csv = Papa.unparse({
        fields: headers,
        data: rows
      });

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `plot-${plot.plotNumber}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`Exported plot ${plot.plotNumber} to CSV successfully!`);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Export Data...</h2>
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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          CSV Export
        </h2>
      </div>

      {plots.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Plots Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create vegetation plots to export data.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Export Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMeasurements}
                  onChange={(e) => setExportOptions({...exportOptions, includeMeasurements: e.target.checked})}
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include individual measurements (creates one row per measurement)</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeLocation}
                  onChange={(e) => setExportOptions({...exportOptions, includeLocation: e.target.checked})}
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include location data (GPS coordinates)</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeGroundCover}
                  onChange={(e) => setExportOptions({...exportOptions, includeGroundCover: e.target.checked})}
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include ground cover data</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportOptions.includeDisturbance}
                  onChange={(e) => setExportOptions({...exportOptions, includeDisturbance: e.target.checked})}
                  className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                />
                <span>Include disturbance indicators</span>
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="btn-primary flex-1 flex items-center justify-center"
                onClick={exportAllPlots}
                disabled={isExporting}
              >
                {isExporting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export All Plots to CSV
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Export Individual Plots</h3>
            
            <div className="space-y-3">
              {plots.map((plot) => (
                <div key={plot.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div>
                    <div className="font-semibold">{plot.plotNumber}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(plot.date).toLocaleDateString()} • {plot.measurements.length} measurements • {new Set(plot.measurements.map(m => m.speciesId)).size} species
                    </div>
                  </div>
                  <button
                    className="btn-secondary text-sm"
                    onClick={() => exportSinglePlot(plot.id!)}
                    disabled={isExporting}
                  >
                    Export
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Export Information</h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                <span>CSV files are compatible with Google Sheets, Excel, and other spreadsheet applications</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                <span>When including measurements, each row represents one species measurement</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                <span>GPS coordinates and other location data are included based on your export options</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
                <span>Use the exported data for further analysis in R, Python, or other tools</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}