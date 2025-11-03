import { useState } from 'react';
import { getCurrentLocation } from '../../utils/geolocation';

// Extended interface to include source and altitude
interface EnhancedLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  source: 'auto' | 'manual';
}

interface GPSLocationProps {
  onLocationChange: (location: EnhancedLocation) => void;
}

export function GPSLocation({ onLocationChange }: GPSLocationProps) {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
  const [location, setLocation] = useState<EnhancedLocation | null>(null);
  const [capturingLocation, setCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  
  // Manual input states
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualAlt, setManualAlt] = useState('');

  async function captureLocation() {
    setCapturingLocation(true);
    setLocationError('');
    
    const result = await getCurrentLocation();
    
    if (result.error) {
      setLocationError(result.error);
      setLocation(null);
    } else {
      const newLocation: EnhancedLocation = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        altitude: result.altitude,
        source: 'auto'
      };
      setLocation(newLocation);
      onLocationChange(newLocation);
    }
    
    setCapturingLocation(false);
  }

  const validateCoordinates = (lat: string, lng: string): boolean => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return (
      !isNaN(latitude) && 
      !isNaN(longitude) && 
      latitude >= -90 && 
      latitude <= 90 && 
      longitude >= -180 && 
      longitude <= 180
    );
  };

  const handleManualSubmit = () => {
    if (!validateCoordinates(manualLat, manualLng)) {
      setLocationError('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }

    const newLocation: EnhancedLocation = {
      latitude: parseFloat(manualLat),
      longitude: parseFloat(manualLng),
      altitude: manualAlt ? parseFloat(manualAlt) : undefined,
      source: 'manual'
    };

    setLocation(newLocation);
    onLocationChange(newLocation);
    setLocationError('');
  };

  const handleClearLocation = () => {
    setLocation(null);
    setManualLat('');
    setManualLng('');
    setManualAlt('');
    setLocationError('');
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">GPS Location *</h3>
      
      {/* Tab selector */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'auto'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('auto')}
        >
          Auto Capture
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'manual'
              ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Input
        </button>
      </div>

      {location ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-800 dark:text-green-200 font-semibold mb-1">
                ✓ Location Captured ({location.source === 'auto' ? 'Auto' : 'Manual'})
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              {location.accuracy !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Accuracy: ±{location.accuracy.toFixed(0)}m
                </p>
              )}
              {location.altitude !== undefined && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Altitude: {location.altitude.toFixed(1)}m
                </p>
              )}
            </div>
            <button
              onClick={handleClearLocation}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
            >
              Clear
            </button>
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              className="btn-secondary text-sm"
              onClick={captureLocation}
              disabled={capturingLocation}
            >
              {capturingLocation ? 'Capturing...' : 'Re-capture'}
            </button>
            <button
              className="btn-secondary text-sm"
              onClick={() => setActiveTab('manual')}
            >
              Edit Manually
            </button>
          </div>
        </div>
      ) : (
        <>
          {activeTab === 'auto' ? (
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
                    Capturing GPS Location...
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
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude (°)</label>
                <input
                  type="text"
                  className="input-field"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="e.g., 12.345678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Longitude (°)</label>
                <input
                  type="text"
                  className="input-field"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="e.g., 78.901234"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Altitude (m) (Optional)</label>
                <input
                  type="text"
                  className="input-field"
                  value={manualAlt}
                  onChange={(e) => setManualAlt(e.target.value)}
                  placeholder="e.g., 150.5"
                />
              </div>
              
              {locationError && (
                <div className="text-red-600 dark:text-red-400 text-sm">
                  {locationError}
                </div>
              )}
              
              <button
                className="btn-primary w-full"
                onClick={handleManualSubmit}
              >
                Save Manual Coordinates
              </button>
              
              <button
                className="btn-secondary w-full"
                onClick={() => setActiveTab('auto')}
              >
                Switch to Auto Capture
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
