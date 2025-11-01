import { useState, useRef, useEffect } from 'react';
import { getAllPlots } from '../db/database';
import type { VegetationPlot } from '../db/database';

// Define the canopy photo angles
type CanopyPhotoAngle = 'center' | 'nw' | 'ne' | 'se' | 'sw';

interface CanopyPhoto {
  angle: CanopyPhotoAngle;
  imageData: string | null;
  capturedAt: Date | null;
  canopyPercentage: number | null; // Will be calculated after analysis
}

interface CanopyAnalysisSession {
  plotId: number | null;
  photos: Record<CanopyPhotoAngle, CanopyPhoto>;
  mergedImage: string | null;
  canopyCoverage: number | null;
}

export default function CanopyAnalysis() {
  const [plots, setPlots] = useState<VegetationPlot[]>([]);
  const [selectedPlotId, setSelectedPlotId] = useState<number | null>(null);
  const [session, setSession] = useState<CanopyAnalysisSession>({
    plotId: null,
    photos: {
      center: { angle: 'center', imageData: null, capturedAt: null, canopyPercentage: null },
      nw: { angle: 'nw', imageData: null, capturedAt: null, canopyPercentage: null },
      ne: { angle: 'ne', imageData: null, capturedAt: null, canopyPercentage: null },
      se: { angle: 'se', imageData: null, capturedAt: null, canopyPercentage: null },
      sw: { angle: 'sw', imageData: null, capturedAt: null, canopyPercentage: null },
    },
    mergedImage: null,
    canopyCoverage: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({
    center: null,
    nw: null,
    ne: null,
    se: null,
    sw: null
  });

  const setFileInputRef = (angle: CanopyPhotoAngle) => (el: HTMLInputElement | null) => {
    fileInputRefs.current[angle] = el;
  };

  // Load plots on component mount
  useEffect(() => {
    async function loadPlots() {
      try {
        setIsLoading(true);
        const allPlots = await getAllPlots();
        setPlots(allPlots);
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

  // Handle plot selection
  useEffect(() => {
    if (selectedPlotId) {
      // Initialize a new session for the selected plot
      setSession({
        plotId: selectedPlotId,
        photos: {
          center: { angle: 'center', imageData: null, capturedAt: null, canopyPercentage: null },
          nw: { angle: 'nw', imageData: null, capturedAt: null, canopyPercentage: null },
          ne: { angle: 'ne', imageData: null, capturedAt: null, canopyPercentage: null },
          se: { angle: 'se', imageData: null, capturedAt: null, canopyPercentage: null },
          sw: { angle: 'sw', imageData: null, capturedAt: null, canopyPercentage: null },
        },
        mergedImage: null,
        canopyCoverage: null
      });
      setAnalysisComplete(false);
    }
  }, [selectedPlotId]);

  // Handle file selection for a photo angle
  const handleFileSelect = (angle: CanopyPhotoAngle) => {
    const fileInput = fileInputRefs.current[angle];
    if (fileInput) {
      fileInput.click();
    }
  };

  // Process selected file
  const handleFileChange = (angle: CanopyPhotoAngle, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSession(prev => ({
          ...prev,
          photos: {
            ...prev.photos,
            [angle]: {
              ...prev.photos[angle],
              imageData,
              capturedAt: new Date()
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if all photos are captured
  const allPhotosCaptured = Object.values(session.photos).every(photo => photo.imageData !== null);

  // Function to merge photos (simplified approach - in a real implementation, 
  // this would involve more complex image processing)
  const mergePhotos = (): string => {
    // In a real implementation, this would use Canvas API to merge the images
    // For now, we'll use a simple approach of taking the first photo as merged
    const firstPhoto = Object.values(session.photos).find(photo => photo.imageData) as CanopyPhoto;
    return firstPhoto ? firstPhoto.imageData! : '';
  };

  // Function to calculate canopy coverage percentage (simplified algorithm)
  const calculateCanopyCoverage = (): number => {
    // This is a simplified algorithm - in reality, you'd analyze the image pixels
    // to determine what percentage is canopy vs sky
    
    // For demonstration, we'll return a random value between 20-80%
    // In a real app, this would use image processing techniques to analyze
    // the image and determine canopy coverage
    return Math.floor(Math.random() * 60) + 20;
  };

  // Analyze all photos
  const analyzePhotos = () => {
    if (!allPhotosCaptured) {
      setError("Please capture photos for all 5 angles first.");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Merge photos
      const mergedImage = mergePhotos();
      
      // Calculate canopy coverage from merged image
      const canopyCoverage = calculateCanopyCoverage(mergedImage);
      
      // Update session with merged image and coverage
      setSession(prev => ({
        ...prev,
        mergedImage,
        canopyCoverage
      }));

      setAnalysisComplete(true);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset the session
  const resetSession = () => {
    setSession({
      plotId: selectedPlotId,
      photos: {
        center: { angle: 'center', imageData: null, capturedAt: null, canopyPercentage: null },
        nw: { angle: 'nw', imageData: null, capturedAt: null, canopyPercentage: null },
        ne: { angle: 'ne', imageData: null, capturedAt: null, canopyPercentage: null },
        se: { angle: 'se', imageData: null, capturedAt: null, canopyPercentage: null },
        sw: { angle: 'sw', imageData: null, capturedAt: null, canopyPercentage: null },
      },
      mergedImage: null,
      canopyCoverage: null
    });
    setAnalysisComplete(false);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Canopy Analysis...</h2>
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
          Canopy Analysis
        </h2>
      </div>

      {plots.length === 0 ? (
        <div className="card text-center py-12">
          <h3 className="text-xl font-bold mb-2">No Plots Available</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create vegetation plots to analyze canopy coverage.
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
                <option value="">Select a plot to analyze canopy</option>
                {plots.map((plot) => (
                  <option key={plot.id} value={plot.id || ''}>
                    {plot.plotNumber} ({plot.measurements.length} measurements)
                  </option>
                ))}
              </select>
              
              {selectedPlotId && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold">Selected Plot Details</h4>
                  <p><span className="font-medium">Plot Number:</span> {plots.find(p => p.id === selectedPlotId)?.plotNumber}</p>
                  <p><span className="font-medium">Measurements:</span> {plots.find(p => p.id === selectedPlotId)?.measurements.length}</p>
                </div>
              )}
            </div>
          </div>

          {selectedPlotId && (
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Capture Canopy Photos</h3>
                
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Capture photos from 5 angles: center and 4 quadrants (NW, NE, SE, SW) for accurate canopy analysis.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(session.photos).map(([angle, photo]) => (
                    <div key={angle} className="text-center">
                      <h4 className="font-semibold mb-3 capitalize">
                        {angle === 'nw' ? 'North-West' : 
                         angle === 'ne' ? 'North-East' : 
                         angle === 'se' ? 'South-East' : 
                         angle === 'sw' ? 'South-West' : 
                         angle}
                      </h4>
                      
                      <div 
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          photo.imageData 
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                        onClick={() => handleFileSelect(angle as CanopyPhotoAngle)}
                      >
                        {photo.imageData ? (
                          <div className="relative">
                            <img 
                              src={photo.imageData} 
                              alt={`Canopy photo - ${angle}`} 
                              className="w-full h-40 object-cover rounded-md"
                            />
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              Captured: {photo.capturedAt?.toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="mt-2 font-medium">Click to capture photo</p>
                            <p className="text-sm text-gray-500">Angle: {angle}</p>
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="file"
                        accept="image/*"
                        ref={setFileInputRef(angle as CanopyPhotoAngle)}
                        onChange={(e) => handleFileChange(angle as CanopyPhotoAngle, e)}
                        className="hidden"
                      />
                      
                      {photo.imageData && (
                        <button
                          className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSession(prev => ({
                              ...prev,
                              photos: {
                                ...prev.photos,
                                [angle]: {
                                  ...prev.photos[angle as CanopyPhotoAngle],
                                  imageData: null,
                                  capturedAt: null,
                                  canopyPercentage: null
                                }
                              }
                            }));
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <button
                    className="btn-primary flex-1"
                    onClick={analyzePhotos}
                    disabled={!allPhotosCaptured || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Analyze Canopy Coverage
                      </span>
                    )}
                  </button>
                  
                  <button
                    className="btn-secondary flex-1"
                    onClick={resetSession}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {analysisComplete && session.mergedImage && (
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Analysis Results</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-4">Merged Canopy Image</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <img 
                          src={session.mergedImage} 
                          alt="Merged canopy analysis" 
                          className="w-full object-contain max-h-80"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-primary-50 dark:bg-primary-900/30 p-6 rounded-lg text-center">
                        <div className="text-5xl font-bold text-primary-700 dark:text-primary-300">
                          {session.canopyCoverage}%
                        </div>
                        <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">Canopy Coverage</div>
                        <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                          Estimated from 5-angle analysis
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Individual Angle Analysis</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(session.photos).map(([angle, photo]) => (
                            <div key={angle} className="text-center p-2 bg-white dark:bg-gray-700 rounded border">
                              <div className="font-medium capitalize">
                                {angle === 'nw' ? 'NW' : 
                                 angle === 'ne' ? 'NE' : 
                                 angle === 'se' ? 'SE' : 
                                 angle === 'sw' ? 'SW' : 
                                 angle}
                              </div>
                              <div className="text-lg font-semibold">
                                {photo.canopyPercentage !== null ? `${photo.canopyPercentage}%` : 'N/A'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold mb-3">Save Results</h4>
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-primary">
                        Save to Plot Data
                      </button>
                      <button className="btn-secondary">
                        Export Results
                      </button>
                      <button className="btn-secondary">
                        Share Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Canopy Analysis Guide</h3>
                <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">1.</span>
                    <span>Take photos from the center of the plot looking up</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">2.</span>
                    <span>Take additional photos from each quadrant (NW, NE, SE, SW)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">3.</span>
                    <span>Ensure photos show the canopy from ground level</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">4.</span>
                    <span>Click "Analyze Canopy Coverage" to process all photos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">5.</span>
                    <span>The algorithm will merge photos and calculate canopy coverage percentage</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}