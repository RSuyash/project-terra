import { useState } from 'react';
import { getCurrentLocation } from '../utils/geolocation';

interface GPSLocationProps {
  onLocationChange: (location: { latitude: number; longitude: number; accuracy: number }) => void;
}

export function GPSLocation({ onLocationChange }: GPSLocationProps) {
  const [location, setLocation] = useState<{latitude: number; longitude: number; accuracy: number} | null>(null);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  async function captureLocation() {
    setCapturingLocation(true);
    setLocationError('');
    
    const result = await getCurrentLocation();
    
    if (result.error) {
      setLocationError(result.error);
      setLocation(null);
    } else {
      const newLocation = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
      };
      setLocation(newLocation);
      onLocationChange(newLocation);
    }
    
    setCapturingLocation(false);
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">GPS Location *</h3>
      
      {location ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold mb-2">
            ✓ Location Captured
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Accuracy: ±{location.accuracy.toFixed(0)}m
          </p>
          <button
            className="btn-secondary mt-4"
            onClick={captureLocation}
            disabled={capturingLocation}
          >
            {capturingLocation ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Capturing...
              </span>
            ) : (
              'Re-capture Location'
            )}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <button
            className="btn-primary w-full"
            onClick={captureLocation}
            disabled={capturingLocation}
          >
            {capturingLocation ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Capturing...
              </span>
            ) : (
              'Capture GPS Location'
            )}
          </button>
          {locationError && (
            <div className="mt-4 text-red-600 dark:text-red-400 text-sm">
              <p className="font-bold">Error:</p>
              <p>{locationError}</p>
              {locationError.includes('User denied') && (
                <p className="mt-2 text-xs text-gray-500">Please enable location permissions in your browser settings and try again.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
