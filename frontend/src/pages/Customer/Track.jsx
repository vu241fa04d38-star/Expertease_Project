import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, MapPin, Navigation, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ChatModal from '../../components/ChatModal';

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

const getTaskerCoordinates = (booking) => {
  const coords = booking?.taskerId?.location?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) return null;

  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  // [0,0] is default placeholder and not a real tasker GPS location.
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return null;

  return { lat, lng };
};

const Track = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState({ lat: 16.3067, lng: 80.4365 });
  const [booking, setBooking] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [routePath, setRoutePath] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const shouldShowRoute = ['pending', 'accepted', 'in-progress'].includes(booking?.status);
  const taskerCoords = getTaskerCoordinates(booking);

  useEffect(() => {
    const locStr = sessionStorage.getItem('userLocation');
    if (locStr) {
      try {
        const parsed = JSON.parse(locStr);
        if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lng)) {
          setLocation({ lat: Number(parsed.lat), lng: Number(parsed.lng) });
        }
      } catch {
        return;
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const found = res.data.bookings.find(b => b._id === id);
          if (found) {
            setBooking(found);
          }
        }
      } catch (err) {
        console.error('Failed to fetch booking details', err);
      }
    };

    fetchBooking();
    const interval = setInterval(fetchBooking, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!shouldShowRoute) {
      setRoutePath(null);
      setRouteInfo(null);
      return;
    }

    if (booking && taskerCoords) {
      const custLat = booking.location?.lat || location.lat;
      const custLng = booking.location?.lng || location.lng;
      let pLng = taskerCoords.lng;
      let pLat = taskerCoords.lat;
      
      if (pLat === custLat && pLng === custLng) {
        pLat += 0.002;
        pLng += 0.002;
      }
      
      fetch(`https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${custLng},${custLat}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const path = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRoutePath(path);
            setRouteInfo({
              distance: (route.distance / 1000).toFixed(1) + ' km',
              duration: Math.max(1, Math.round(route.duration / 60)) + ' min'
            });
          }
        })
        .catch(console.error);
    }
  }, [booking, location, shouldShowRoute, taskerCoords]);

  return (
    <div className="space-y-6">
      {showChat && booking && (
        <ChatModal booking={booking} onClose={() => setShowChat(false)} />
      )}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/customer/bookings')}
          className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Live Tracking</h1>
          <p className="text-sm text-slate-500 font-medium">Booking ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracking Sidebar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-6">
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100">
            <CheckCircle2 className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">
                {booking?.status === 'pending' ? 'Waiting for Tasker' :
                 booking?.status === 'accepted' ? 'Tasker Assigned' :
                 booking?.status === 'in-progress' ? 'Tasker Is Working' :
                 booking?.status === 'completed' ? 'Service Completed!' :
                 booking?.status === 'cancelled' ? 'Booking Cancelled' :
                 'Tracking Booking'}
              </h3>
              <p className="text-sm font-medium mt-1 opacity-90">
                {booking?.status === 'pending' ? 'Your request has been sent and is awaiting acceptance.' :
                 booking?.status === 'accepted' ? 'Tasker accepted your booking and is on the way.' :
                 booking?.status === 'in-progress' ? 'Tasker reached your location and started the service.' :
                 booking?.status === 'completed' ? 'Thank you for using ExpertEase.' :
                 booking?.status === 'cancelled' ? 'This booking was cancelled.' :
                 'Tracking is active.'}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Tracking Status</h4>
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-100">
              <div className={`relative ${['pending', 'accepted', 'in-progress', 'completed'].includes(booking?.status) ? '' : 'opacity-40'}`}>
                <div className={`absolute -left-6 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${['pending', 'accepted', 'in-progress', 'completed'].includes(booking?.status) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <h5 className="font-bold text-slate-900">Booking Confirmed</h5>
                <p className="text-xs font-medium text-slate-500">{booking ? new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}</p>
              </div>
              <div className={`relative ${['accepted', 'in-progress', 'completed'].includes(booking?.status) ? '' : 'opacity-40'}`}>
                <div className={`absolute -left-6 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${['accepted', 'in-progress', 'completed'].includes(booking?.status) ? 'bg-amber-500' : 'bg-slate-200'}`}></div>
                <h5 className="font-bold text-slate-900">Tasker Assigned</h5>
                <p className="text-xs font-medium text-slate-500">
                  {booking?.status === 'pending' ? 'Waiting for tasker to accept' : 'Tasker accepted your booking'}
                </p>
              </div>
              <div className={`relative ${['in-progress', 'completed'].includes(booking?.status) ? '' : 'opacity-40'}`}>
                <div className={`absolute -left-6 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${['in-progress', 'completed'].includes(booking?.status) ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
                <h5 className="font-bold text-slate-900">On the Way / Working</h5>
                <p className="text-xs font-medium text-slate-500">
                  {booking?.status === 'in-progress' ? 'Tasker is on site and working' :
                   booking?.status === 'completed' ? 'Work phase completed' :
                   'Waiting for tasker'}
                </p>
              </div>
              <div className={`relative ${['completed'].includes(booking?.status) ? '' : 'opacity-40'}`}>
                <div className={`absolute -left-6 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${['completed'].includes(booking?.status) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                <h5 className="font-bold text-slate-900">Completed</h5>
                <p className="text-xs font-medium text-slate-500">Service finished</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => setShowChat(true)}
              className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-500/20"
            >
              <MessageCircle size={18} /> Message Tasker
            </button>
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-2 bg-slate-100 rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[45vh] sm:min-h-[50vh] lg:min-h-[620px]">
          {booking ? (
            (() => {
              const custLat = booking.location?.lat || location.lat;
              const custLng = booking.location?.lng || location.lng;
              let pLat = taskerCoords?.lat;
              let pLng = taskerCoords?.lng;

              if (pLat && pLng && custLat === pLat && custLng === pLng) {
                pLat += 0.002;
                pLng += 0.002;
              }

              const centerLat = pLat ? (custLat + pLat) / 2 : custLat;
              const centerLng = pLng ? (custLng + pLng) / 2 : custLng;

              return (
                <MapContainer center={[centerLat, centerLng]} zoom={14} className="absolute inset-0 w-full h-full z-10">
                  <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[custLat, custLng]} icon={customerIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                  
                  {pLat && pLng && (
                    <>
                      <Marker position={[pLat, pLng]} icon={taskerIcon}>
                        <Popup>{booking.taskerId.name}'s Location</Popup>
                      </Marker>
                      {routePath && (
                        <Polyline 
                          positions={routePath} 
                          pathOptions={{
                            color: "#3b82f6", 
                            weight: 6,
                            opacity: 0.8,
                            lineCap: "round",
                            lineJoin: "round"
                          }}
                        />
                      )}
                    </>
                  )}
                </MapContainer>
              );
            })()
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">Loading map...</div>
          )}

          {booking && !taskerCoords && (
            <div className="absolute top-4 left-4 z-20 bg-amber-50 text-amber-800 px-4 py-2 rounded-xl border border-amber-200 font-semibold text-sm shadow">
              Waiting for tasker GPS location...
            </div>
          )}

          {shouldShowRoute && (
            <div className="absolute top-4 right-4 z-20 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 font-bold text-slate-700">
              <Navigation size={18} className="text-brand-500" /> Live Tracking Active
            </div>
          )}

          {routeInfo && shouldShowRoute && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 text-white px-4 sm:px-6 py-3 rounded-full shadow-lg border border-slate-700 flex items-center gap-3 sm:gap-4 font-bold shadow-brand-500/20 w-max max-w-[95%] pointer-events-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                Tasker is on the way
              </div>
              <div className="w-px h-4 bg-slate-700"></div>
              <span className="text-brand-400">{routeInfo.duration} ({routeInfo.distance})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Track;
