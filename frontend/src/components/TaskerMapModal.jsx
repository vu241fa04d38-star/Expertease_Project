import { X, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import axios from 'axios';

const createIcon = (color, svgPath) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; justify-content: center; align-items: center; color: white;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
           </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const taskerIcon = createIcon('#10b981', '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'); // wrench
const customerIcon = createIcon('#3b82f6', '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'); // home

const TaskerMapModal = ({ tasker, onClose }) => {
  const [userLoc, setUserLoc] = useState(null);
  const [route, setRoute] = useState([]);

  useEffect(() => {
    const locStr = sessionStorage.getItem('userLocation');
    if (locStr) {
      try { setUserLoc(JSON.parse(locStr)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (userLoc && tasker?.location?.coordinates) {
      const fetchRoute = async () => {
        try {
          const taskerLat = tasker.location.coordinates[1];
          const taskerLng = tasker.location.coordinates[0];
          const custLat = userLoc.lat;
          const custLng = userLoc.lng;

          const url = `https://router.project-osrm.org/route/v1/driving/${custLng},${custLat};${taskerLng},${taskerLat}?overview=full&geometries=geojson`;
          const response = await axios.get(url);
          
          if (response.data.routes && response.data.routes.length > 0) {
            const coords = response.data.routes[0].geometry.coordinates;
            // OSRM returns [lng, lat], Leaflet needs [lat, lng]
            const flippedCoords = coords.map(coord => [coord[1], coord[0]]);
            setRoute(flippedCoords);
          }
        } catch (error) {
          console.error("Error fetching road route:", error);
          // Fallback will be used automatically as route state remains empty
        }
      };
      fetchRoute();
    }
  }, [userLoc, tasker]);

  if (!tasker || !tasker.location?.coordinates) return null;

  const taskerLat = tasker.location.coordinates[1];
  const taskerLng = tasker.location.coordinates[0];

  let custLat = userLoc?.lat;
  let custLng = userLoc?.lng;

  // Add tiny offset if they are at the exact same location so both markers are visible
  if (custLat === taskerLat && custLng === taskerLng) {
    custLat -= 0.002;
    custLng -= 0.002;
  }

  // Calculate center between user and tasker if userLoc exists
  const centerLat = userLoc ? (custLat + taskerLat) / 2 : taskerLat;
  const centerLng = userLoc ? (custLng + taskerLng) / 2 : taskerLng;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-[70vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
              <Navigation size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{tasker.name}'s Location</h2>
              <p className="text-xs font-medium text-slate-500">Live distance from you</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative w-full h-full bg-slate-100 z-0">
          <MapContainer center={[centerLat, centerLng]} zoom={13} className="w-full h-full">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Tasker Marker */}
            <Marker position={[taskerLat, taskerLng]} icon={taskerIcon}>
              <Popup>
                <div className="font-bold">{tasker.name}</div>
                <div className="text-xs text-slate-500">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType}</div>
              </Popup>
            </Marker>

            {/* User Marker */}
            {userLoc && (
              <>
                <Marker position={[custLat, custLng]} icon={customerIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {/* Route Line */}
                <Polyline 
                  positions={route.length > 0 ? route : [[custLat, custLng], [taskerLat, taskerLng]]} 
                  color="#10b981" 
                  dashArray={route.length > 0 ? "" : "10, 10"} 
                  weight={5} 
                  opacity={0.8}
                />
              </>
            )}
          </MapContainer>
        </div>

      </div>
    </div>
  );
};

export default TaskerMapModal;
