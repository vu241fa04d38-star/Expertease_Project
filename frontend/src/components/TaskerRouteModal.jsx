import { X, Navigation, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Setup leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const customerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2950/2950657.png', // Generic red marker
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38]
});

const TaskerRouteModal = ({ booking, onClose }) => {
  const [taskerLoc, setTaskerLoc] = useState(null);
  const [destCoords, setDestCoords] = useState(
    booking?.location?.lat && booking?.location?.lng 
      ? { lat: booking.location.lat, lng: booking.location.lng } 
      : null
  );
  const [loadingGeocode, setLoadingGeocode] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    const locStr = sessionStorage.getItem('userLocation');
    if (locStr) {
      try { setTaskerLoc(JSON.parse(locStr)); } catch(e) {}
    }

    // Forward geocode if missing GPS
    if (booking && (!booking.location?.lat || !booking.location?.lng)) {
      setLoadingGeocode(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(booking.address)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            setDestCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
          }
        })
        .finally(() => setLoadingGeocode(false));
    }
  }, [booking]);

  // Fetch Shortest Path using Dijkstra (OSRM API)
  useEffect(() => {
    if (taskerLoc && destCoords) {
      setLoadingRoute(true);
      fetch(`https://router.project-osrm.org/route/v1/driving/${taskerLoc.lng},${taskerLoc.lat};${destCoords.lng},${destCoords.lat}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // GeoJSON returns [lon, lat], Polyline needs [lat, lon]
            const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePath(path);
            
            // Distance is in meters, duration in seconds
            setRouteInfo({
              distance: (route.distance / 1000).toFixed(1) + ' km',
              duration: Math.max(1, Math.round(route.duration / 60)) + ' min'
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoadingRoute(false));
    }
  }, [taskerLoc, destCoords]);

  if (!booking) return null;

  const destLat = destCoords?.lat;
  const destLng = destCoords?.lng;

  const centerLat = (taskerLoc && destLat) ? (taskerLoc.lat + destLat) / 2 : (destLat || taskerLoc?.lat || 16.3067);
  const centerLng = (taskerLoc && destLng) ? (taskerLoc.lng + destLng) / 2 : (destLng || taskerLoc?.lng || 80.4365);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center">
              <Navigation size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Navigate to Customer</h2>
              <p className="text-xs font-medium text-slate-500 max-w-[250px] truncate sm:max-w-md">{booking.address}</p>
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
          {loadingGeocode ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
              <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-bold text-slate-900">Locating Address...</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mt-2">Converting text address to GPS coordinates.</p>
            </div>
          ) : (!destLat || !destLng) ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-20">
              <MapPin size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No GPS Data Available</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mt-2">
                This booking was created without exact GPS coordinates. Please navigate using the text address: <br/>
                <strong className="text-slate-800 mt-2 block">{booking.address}</strong>
              </p>
            </div>
          ) : (
            <MapContainer center={[centerLat, centerLng]} zoom={13} className="w-full h-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Customer Marker */}
              <Marker position={[destLat, destLng]} icon={customerIcon}>
                <Popup>
                  <div className="font-bold">Customer Destination</div>
                  <div className="text-xs text-slate-500">{booking.address}</div>
                </Popup>
              </Marker>

              {/* Tasker Marker */}
              {taskerLoc && (
                <>
                  <Marker position={[taskerLoc.lat, taskerLoc.lng]}>
                    <Popup>Your Current Location</Popup>
                  </Marker>
                  
                  {/* Route Line */}
                  {routePath ? (
                    <Polyline 
                      key="routed-path"
                      positions={routePath} 
                      pathOptions={{
                        color: "#3b82f6", // solid blue
                        weight: 6,
                        opacity: 0.8,
                        lineCap: "round",
                        lineJoin: "round"
                      }}
                    />
                  ) : (
                    <Polyline 
                      key="straight-path"
                      positions={[
                        [taskerLoc.lat, taskerLoc.lng],
                        [destLat, destLng]
                      ]} 
                      pathOptions={{
                        color: "#94a3b8", // gray
                        dashArray: "10, 10",
                        weight: 4,
                        opacity: 0.5
                      }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          )}

          {destLat && destLng && taskerLoc && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg border border-slate-700 flex items-center gap-4 font-bold shadow-brand-500/20">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${loadingRoute ? 'bg-amber-400' : 'bg-brand-500 animate-pulse'}`}></span>
                {loadingRoute ? 'Calculating Route...' : 'Live Navigation'}
              </div>
              {routeInfo.distance && (
                <>
                  <div className="w-px h-4 bg-slate-700"></div>
                  <span className="text-brand-400">{routeInfo.duration} ({routeInfo.distance})</span>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaskerRouteModal;
