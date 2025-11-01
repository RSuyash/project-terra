import { useState, useRef, useEffect } from 'react';
import { getAllPlots, updateVegetationPlot, getPlotById } from '../../db/database';
import type { VegetationPlot, CanopyPhoto } from '../../db/database';

// Define the canopy photo angles
type CanopyPhotoAngle = 'center' | 'nw' | 'ne' | 'se' | 'sw';

interface CanopyPhotoWithAnalysis extends CanopyPhoto {
  angle: CanopyPhotoAngle;
  imageData: string | null;
  capturedAt: Date | null;
  canopyPercentage: number | null;
  maskImageData?: string; // Image with canopy mask overlay
}

interface CanopyAnalysisSession {
  plotId: number | null;
  photos: Record<CanopyPhotoAngle, CanopyPhotoWithAnalysis>;
  mergedImage: string | null;
  canopyCoverage: number | null;
  analysisResults?: {
    [angle: string]: {
      canopyPercentage: number;
      totalPixels: number;
      canopyPixels: number;
      maskImageData: string;
    }
  };
}

const CanopyAnalysisDashboard = () => {
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
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  
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
    const loadPlots = async () => {
      try {
        setIsLoading(true);
        const allPlots = await getAllPlots();
        setPlots(allPlots);
      } catch (err) {
        console.error("Failed to load plots:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred while loading plots.");
      } finally {
        setIsLoading(false);
      }
    };

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
      setActiveTab('upload');
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

  // Function to analyze canopy coverage (simplified algorithm)
  const analyzeCanopyCoverage = (imageData: string): Promise<{ canopyPercentage: number; maskImageData: string }> => {
    return new Promise((resolve) => {
      // Create an image element to load the image data
      const img = new Image();
      img.onload = () => {
        // Create a canvas to process the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({ canopyPercentage: 0, maskImageData: '' });
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data for analysis
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data, width, height } = imageDataObj;
        
        // Count pixels that are likely canopy (green tones)
        let canopyPixelCount = 0;
        const totalPixels = width * height;
        
        // Create mask canvas
        const maskCanvas = document.createElement('canvas');
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) {
          resolve({ canopyPercentage: 0, maskImageData: '' });
          return;
        }
        
        maskCanvas.width = width;
        maskCanvas.height = height;
        maskCtx.drawImage(img, 0, 0);
        
        // Apply a mask for canopy areas
        const maskData = maskCtx.getImageData(0, 0, width, height);
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Simple algorithm: identify green canopy pixels
          // This can be improved with more sophisticated color analysis
          if (g > r && g > b && g > 50) {
            canopyPixelCount++;
            // Mark in mask (green for canopy)
            maskData.data[i] = 0;     // R
            maskData.data[i + 1] = 255; // G
            maskData.data[i + 2] = 0;   // B
            maskData.data[i + 3] = 100; // A (transparency)
          }
        }
        
        // Put the mask data back
        maskCtx.putImageData(maskData, 0, 0);
        
        // Calculate canopy percentage
        const canopyPercentage = (canopyPixelCount / totalPixels) * 100;
        
        // Convert mask canvas to data URL
        const maskImageData = maskCanvas.toDataURL();
        
        resolve({ canopyPercentage, maskImageData });
      };
      img.src = imageData;
    });
  };

  // Analyze all photos
  const analyzePhotos = async () => {
    if (!allPhotosCaptured) {
      setError("Please capture photos for all 5 angles first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Analyze each photo and collect results
      const analysisResults: CanopyAnalysisSession['analysisResults'] = {};
      
      for (const [angle, photo] of Object.entries(session.photos) as [CanopyPhotoAngle, CanopyPhotoWithAnalysis][]) {
        if (photo.imageData) {
          const { canopyPercentage, maskImageData } = await analyzeCanopyCoverage(photo.imageData);
          
          // Update the photo with canopy percentage and mask
          setSession(prev => ({
            ...prev,
            photos: {
              ...prev.photos,
              [angle]: {
                ...prev.photos[angle],
                canopyPercentage,
                maskImageData
              }
            }
          }));
          
          analysisResults[angle] = {
            canopyPercentage,
            totalPixels: 0, // Placeholder - would calculate actual pixel counts
            canopyPixels: 0, // Placeholder
            maskImageData
          };
        }
      }
      
      // Calculate overall canopy coverage
      const canopyPercentages = Object.values(session.photos)
        .filter(photo => photo.canopyPercentage !== null)
        .map(photo => photo.canopyPercentage as number);
      
      const overallCanopyCoverage = canopyPercentages.length > 0
        ? canopyPercentages.reduce((sum, val) => sum + val, 0) / canopyPercentages.length
        : 0;
      
      // Update session with results
      setSession(prev => ({
        ...prev,
        canopyCoverage: overallCanopyCoverage,
        analysisResults
      }));
      
      setAnalysisComplete(true);
      setActiveTab('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save canopy analysis results to the plot
  const saveResultsToPlot = async () => {
    if (!session.plotId || !analysisComplete) return;
    
    try {
      const plot = await getPlotById(session.plotId);
      if (!plot) {
        setError("Plot not found");
        return;
      }
      
      // Update the plot with canopy analysis results
      // For now, we'll add the results to a new canopyAnalysis field
      // In a real implementation, this would be properly integrated into the plot schema
      const updatedPlot = {
        ...plot,
        canopyAnalysis: {
          ...plot.canopyAnalysis,
          results: session.analysisResults,
          overallCoverage: session.canopyCoverage,
          analyzedAt: new Date()
        }
      };
      
      await updateVegetationPlot(updatedPlot);
      alert("Canopy analysis results saved successfully!");
    } catch (err) {
      console.error("Failed to save results:", err);
      setError("Failed to save results: " + (err instanceof Error ? err.message : "Unknown error"));
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
      canopyCoverage: null,
      analysisResults: undefined
    });
    setAnalysisComplete(false);
    setActiveTab('upload');
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-center">
        <h2 className="text-3xl font-bold">Loading Canopy Analysis Dashboard...</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8 text-red-500">
        <h2 className="text-3xl font-bold">Error Loading Data</h2>
        <p>{error}</p>
        <button 
          className="btn-primary mt-4"
          onClick={() => {
            setError(null);
            setIsLoading(true);
            const loadPlots = async () => {
              try {
                setIsLoading(true);
                const allPlots = await getAllPlots();
                setPlots(allPlots);
              } catch (err) {
                console.error("Failed to load plots:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred while loading plots.");
              } finally {
                setIsLoading(false);
              }
            };
            loadPlots();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary-700 dark:text-primary-300">
          Canopy Analysis Dashboard
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
              {/* Tabs for upload vs. results */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'upload'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('upload')}
                >
                  Upload & Analyze
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    activeTab === 'results'
                      ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('results')}
                  disabled={!analysisComplete}
                >
                  Analysis Results
                </button>
              </div>

              {activeTab === 'upload' && (
                <div className="space-y-8">
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Upload Canopy Photos</h3>
                    
                    <p className="mb-6 text-gray-700 dark:text-gray-300">
                      Upload photos from 5 angles: center and 4 quadrants (NW, NE, SE, SW) for accurate canopy analysis.
                      Each photo should show the canopy from ground level looking up.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {Object.entries(session.photos).map(([angle, photo]) => (
                        <div key={angle} className="text-center">
                          <h4 className="font-semibold mb-3 capitalize">
                            {angle === 'nw' ? 'North-West' : 
                             angle === 'ne' ? 'North-East' : 
                             angle === 'se' ? 'South-East' : 
                             angle === 'sw' ? 'South-West' : 
                             angle.charAt(0).toUpperCase() + angle.slice(1)}
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
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                  <span className="text-white font-medium">Change Photo</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                  {photo.canopyPercentage !== null ? `${photo.canopyPercentage.toFixed(1)}% canopy` : 'Ready for analysis'}
                                </div>
                              </div>
                            ) : (
                              <div className="py-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="mt-2 font-medium">Upload photo</p>
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
                            <div className="flex justify-between mt-2">
                              <button
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                              <button
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                onClick={() => handleFileSelect(angle as CanopyPhotoAngle)}
                              >
                                Replace
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        className="btn-primary flex-1 min-w-[200px]"
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
                        className="btn-secondary flex-1 min-w-[200px]"
                        onClick={resetSession}
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Canopy Analysis Guide</h3>
                    <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">1.</span>
                        <span>Take photos from the center of the plot looking up at the canopy</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">2.</span>
                        <span>Take additional photos from each quadrant (NW, NE, SE, SW)</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">3.</span>
                        <span>Ensure photos show the canopy from ground level without obstructions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">4.</span>
                        <span>Upload all 5 photos then click "Analyze Canopy Coverage"</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-600 dark:text-primary-400 font-bold mr-2">5.</span>
                        <span>The algorithm will process each image and calculate canopy coverage percentage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'results' && analysisComplete && (
                <div className="space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
                      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Overall Canopy Coverage</h3>
                      {session.canopyCoverage !== null && (
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{session.canopyCoverage.toFixed(1)}%</p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Average across all angles
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
                      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Canopy Photos</h3>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(session.photos).length}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        5 angles analyzed
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-yellow-500">
                      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Analysis Date</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {new Date().toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last analyzed
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-purple-500">
                      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">Plot</h3>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {plots.find(p => p.id === selectedPlotId)?.plotNumber || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Analyzed for this plot
                      </p>
                    </div>
                  </div>

                  {/* Canopy Coverage by Angle */}
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Canopy Coverage by Angle</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                      {Object.entries(session.photos).map(([angle, photo]) => (
                        <div key={angle} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-semibold capitalize mb-2">
                            {angle === 'nw' ? 'NW' : 
                             angle === 'ne' ? 'NE' : 
                             angle === 'se' ? 'SE' : 
                             angle === 'sw' ? 'SW' : 
                             angle.charAt(0).toUpperCase() + angle.slice(1)}
                          </h4>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {photo.canopyPercentage !== null ? `${photo.canopyPercentage.toFixed(1)}%` : 'N/A'}
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${photo.canopyPercentage || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Results */}
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Analysis Results</h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Original Images with Masks */}
                      <div>
                        <h4 className="font-semibold mb-4">Canopy Analysis Visualization</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(session.photos).map(([angle, photo]) => (
                            <div key={angle} className="text-center">
                              <h5 className="font-medium capitalize mb-2">
                                {angle === 'nw' ? 'NW' : 
                                 angle === 'ne' ? 'NE' : 
                                 angle === 'se' ? 'SE' : 
                                 angle === 'sw' ? 'SW' : 
                                 angle}
                              </h5>
                              {photo.imageData && (
                                <div className="relative border rounded-lg overflow-hidden">
                                  <img 
                                    src={photo.imageData} 
                                    alt={`Original canopy - ${angle}`} 
                                    className="w-full h-32 object-cover"
                                  />
                                  {photo.maskImageData && (
                                    <>
                                      <img 
                                        src={photo.maskImageData} 
                                        alt={`Canopy mask - ${angle}`} 
                                        className="w-full h-32 object-cover absolute top-0 left-0 opacity-50"
                                      />
                                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                        {photo.canopyPercentage?.toFixed(1)}%
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tabulated Data */}
                      <div>
                        <h4 className="font-semibold mb-4">Detailed Analysis Data</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Angle</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Canopy Coverage (%)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                              {Object.entries(session.photos).map(([angle, photo]) => (
                                <tr key={angle}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {angle === 'nw' ? 'North-West' : 
                                     angle === 'ne' ? 'North-East' : 
                                     angle === 'se' ? 'South-East' : 
                                     angle === 'sw' ? 'South-West' : 
                                     angle}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {photo.canopyPercentage !== null ? `${photo.canopyPercentage.toFixed(1)}%` : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {photo.canopyPercentage !== null ? (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400">
                                        Analyzed
                                      </span>
                                    ) : (
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400">
                                        Pending
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  Average
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {session.canopyCoverage !== null ? `${session.canopyCoverage.toFixed(1)}%` : 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400">
                                    Overall
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Save & Export</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      <button 
                        className="btn-primary"
                        onClick={saveResultsToPlot}
                      >
                        Save to Plot Data
                      </button>
                      <button className="btn-secondary">
                        Export Analysis Report
                      </button>
                      <button className="btn-secondary">
                        Export Images
                      </button>
                      <button 
                        className="btn-secondary"
                        onClick={() => setActiveTab('upload')}
                      >
                        New Analysis
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CanopyAnalysisDashboard;