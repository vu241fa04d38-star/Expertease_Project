import { useState, useEffect } from 'react';

const LocationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const saveGpsLocation = (coords) => {
    sessionStorage.setItem('userLocation', JSON.stringify({
      lat: coords.latitude,
      lng: coords.longitude,
      source: 'gps',
      capturedAt: Date.now()
    }));
  };

  useEffect(() => {
    // Always try to get live location silently first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          saveGpsLocation(position.coords);
          setShowPrompt(false);
          // Dispatch a custom event so Layout topbar refreshes name
          window.dispatchEvent(new Event('locationUpdated'));
        },
        () => {
          // Silent fail: only show prompt if we have no stored location
          if (!sessionStorage.getItem('userLocation')) {
            setShowPrompt(true);
          }
        },
        { timeout: 5000, maximumAge: 60000 }
      );
    } else if (!sessionStorage.getItem('userLocation')) {
      setShowPrompt(true);
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          saveGpsLocation(position.coords);
          setShowPrompt(false);
          window.dispatchEvent(new Event('locationUpdated'));
        },
        () => {
          // Do not force a wrong fallback location (e.g., Hyderabad).
          // User can continue with manual address entry.
          sessionStorage.removeItem('userLocation');
          setShowPrompt(false);
          window.dispatchEvent(new Event('locationUpdated'));
        }
      );
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl mx-4">
        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          📍
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Enable Your Location</h2>
        <p className="text-slate-600 mb-8">
          ExpertEase needs your GPS location to show nearby service professionals and calculate accurate distances in real time.
        </p>
        <button 
          onClick={requestLocation}
          className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-brand-500/30"
        >
          Allow Location Access
        </button>
      </div>
    </div>
  );
};

export default LocationPrompt;
