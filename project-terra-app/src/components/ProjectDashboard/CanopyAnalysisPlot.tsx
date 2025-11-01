import { useState, useRef } from 'react';
import type { VegetationPlot } from '../../db/database';

// Define the canopy photo angles
type CanopyPhotoAngle = 'center' | 'nw' | 'ne' | 'se' | 'sw';

interface CanopyPhoto {
  angle: CanopyPhotoAngle;
  imageData: string | null;
  capturedAt: Date | null;
  canopyPercentage: number | null;
  maskImageData?: string; // Image with canopy mask overlay
}

interface CanopyAnalysisPlotProps {
  plot: VegetationPlot;
  onAnalysisComplete: (analysisResults: any) => void;
}

const CanopyAnalysisPlot = ({ plot, onAnalysisComplete }: CanopyAnalysisPlotProps) => {
  const [photos, setPhotos] = useState<Record<CanopyPhotoAngle, CanopyPhoto>>({
    center: { angle: 'center', imageData: null, capturedAt: null, canopyPercentage: null },
    nw: { angle: 'nw', imageData: null, capturedAt: null, canopyPercentage: null },
    ne: { angle: 'ne', imageData: null, capturedAt: null, canopyPercentage: null },
    se: { angle: 'se', imageData: null, capturedAt: null, canopyPercentage: null },
    sw: { angle: 'sw', imageData: null, capturedAt: null, canopyPercentage: null },
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
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
        setPhotos(prev => ({
          ...prev,
          [angle]: {
            ...prev[angle],
            imageData,
            capturedAt: new Date()
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if all photos are captured
  const allPhotosCaptured = Object.values(photos).every(photo => photo.imageData !== null);

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
        let totalPixels = width * height;
        
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
      const updatedPhotos = { ...photos };
      
      for (const [angle, photo] of Object.entries(photos) as [CanopyPhotoAngle, CanopyPhoto][]) {
        if (photo.imageData) {
          const { canopyPercentage, maskImageData } = await analyzeCanopyCoverage(photo.imageData);
          
          // Update the photo with canopy percentage and mask
          updatedPhotos[angle] = {
            ...photo,
            canopyPercentage,
            maskImageData
          };
        }
      }
      
      setPhotos(updatedPhotos);
      
      // Calculate overall canopy coverage
      const canopyPercentages = Object.values(updatedPhotos)
        .filter(photo => photo.canopyPercentage !== null)
        .map(photo => photo.canopyPercentage as number);
      
      const overallCanopyCoverage = canopyPercentages.length > 0
        ? canopyPercentages.reduce((sum, val) => sum + val, 0) / canopyPercentages.length
        : 0;
      
      // Prepare analysis results
      const analysisResults = {
        photos: updatedPhotos,
        overallCoverage: overallCanopyCoverage,
        analyzedAt: new Date()
      };
      
      setAnalysisComplete(true);
      onAnalysisComplete(analysisResults);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Reset the session
  const resetSession = () => {
    setPhotos({
      center: { angle: 'center', imageData: null, capturedAt: null, canopyPercentage: null },
      nw: { angle: 'nw', imageData: null, capturedAt: null, canopyPercentage: null },
      ne: { angle: 'ne', imageData: null, capturedAt: null, canopyPercentage: null },
      se: { angle: 'se', imageData: null, capturedAt: null, canopyPercentage: null },
      sw: { angle: 'sw', imageData: null, capturedAt: null, canopyPercentage: null },
    });
    setAnalysisComplete(false);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Canopy Analysis for Plot: {plot.plotNumber}</h3>
        
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          Upload canopy photos from 5 angles: center and 4 quadrants (NW, NE, SE, SW) for accurate canopy analysis.
          Each photo should show the canopy from ground level looking up.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(photos).map(([angle, photo]) => (
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
                      setPhotos(prev => ({
                        ...prev,
                        [angle]: {
                          ...prev[angle as CanopyPhotoAngle],
                          imageData: null,
                          capturedAt: null,
                          canopyPercentage: null
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
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Results Section - Only show if analysis is complete */}
      {analysisComplete && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-4">Summary</h4>
              <div className="bg-primary-50 dark:bg-primary-900/30 p-6 rounded-lg text-center">
                <div className="text-5xl font-bold text-primary-700 dark:text-primary-300">
                  {photos.center.canopyPercentage !== null ? photos.center.canopyPercentage.toFixed(1) : '0.0'}%
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 mt-2">Average Canopy Coverage</div>
                <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Across all {Object.values(photos).filter(p => p.canopyPercentage !== null).length} angles
                </div>
              </div>
            </div>
            
            {/* Canopy Coverage by Angle */}
            <div>
              <h4 className="font-semibold mb-4">Coverage by Angle</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(photos).map(([angle, photo]) => (
                  <div key={angle} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                    <div className="font-medium capitalize">
                      {angle === 'nw' ? 'NW' : 
                       angle === 'ne' ? 'NE' : 
                       angle === 'se' ? 'SE' : 
                       angle === 'sw' ? 'SW' : 
                       angle}
                    </div>
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                      {photo.canopyPercentage !== null ? `${photo.canopyPercentage.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Visual Results */}
          <div className="mt-6">
            <h4 className="font-semibold mb-4">Visual Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(photos).map(([angle, photo]) => (
                <div key={angle} className="text-center">
                  <h5 className="font-medium capitalize mb-2">
                    {angle === 'nw' ? 'NW' : 
                     angle === 'ne' ? 'NE' : 
                     angle === 'se' ? 'SE' : 
                     angle === 'sw' ? 'SW' : 
                     angle}
                  </h5>
                  {photo.imageData && photo.maskImageData && (
                    <div className="relative border rounded-lg overflow-hidden">
                      <img 
                        src={photo.imageData} 
                        alt={`Original canopy - ${angle}`} 
                        className="w-full h-32 object-cover"
                      />
                      <img 
                        src={photo.maskImageData} 
                        alt={`Canopy mask - ${angle}`} 
                        className="w-full h-32 object-cover absolute top-0 left-0 opacity-50"
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {photo.canopyPercentage?.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanopyAnalysisPlot;