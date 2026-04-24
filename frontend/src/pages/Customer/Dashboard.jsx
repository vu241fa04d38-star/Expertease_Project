import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Star } from 'lucide-react';
import BookingModal from '../../components/BookingModal';
import { serviceCategories, allCategories } from '../../config/services';

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
const userIcon = createIcon('#3b82f6', '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'); // home

const defaultCenter = { lat: 17.385, lng: 78.487 }; // Default to Hyderabad

// Component to recenter map when location changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView([center.lat, center.lng], zoom);
  return null;
}

const Dashboard = () => {
  const [allTaskers, setAllTaskers] = useState([]);
  const [location, setLocation] = useState(defaultCenter);
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingTasker, setBookingTasker] = useState(null);

  useEffect(() => {
    const loc = sessionStorage.getItem('userLocation');
    if (loc) {
      setLocation(JSON.parse(loc));
    }
  }, []);

  useEffect(() => {
    let isLatest = true;
    
    const fetchTaskers = async () => {
      try {
        console.log(`Fetching taskers for lat=${location.lat}, lng=${location.lng}`);
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/taskers/nearby?lat=${location.lat}&lng=${location.lng}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (isLatest && res.data.success) {
          console.log('Nearby Taskers Result:', res.data);
          setAllTaskers(res.data.taskers);
        }
      } catch (error) {
        if (isLatest) console.error(error);
      }
    };

    fetchTaskers();

    return () => {
      isLatest = false;
    };
  }, [location]);

  const handleBooking = async (tasker) => {
    setBookingTasker(tasker);
  };

  const filteredTaskers = allTaskers.filter(p => {
    const pName = p.name ? p.name.toLowerCase() : '';
    const pCity = p.city ? p.city.toLowerCase() : '';
    const filterLower = serviceFilter ? serviceFilter.toLowerCase() : '';
    const pServicesArray = Array.isArray(p.serviceType) ? p.serviceType.map(s => s.toLowerCase()) : (p.serviceType ? [p.serviceType.toLowerCase()] : []);
    
    let matchesFilter = true;
    if (serviceFilter && serviceCategories[serviceFilter]) {
      const catServices = serviceCategories[serviceFilter].map(s => s.toLowerCase());
      matchesFilter = pServicesArray.some(s => catServices.includes(s));
    } else if (serviceFilter) {
      matchesFilter = pServicesArray.some(s => s.includes(filterLower));
    }

    let matchesSearch = true;
    const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
    if (query) {
      const nameMatch = pName.includes(query);
      const cityMatch = pCity.includes(query);
      const serviceMatch = pServicesArray.some(s => s.includes(query));
      
      let categoryMatch = false;
      const matchedCategories = allCategories.filter(cat => cat.toLowerCase().includes(query));
      if (matchedCategories.length > 0) {
        const validServicesForCategories = matchedCategories.flatMap(cat => serviceCategories[cat]).map(s => s.toLowerCase());
        categoryMatch = pServicesArray.some(s => validServicesForCategories.includes(s));
      }

      matchesSearch = nameMatch || cityMatch || serviceMatch || categoryMatch;
    }
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search taskers or services..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 min-w-[200px]">
          <select
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[500px]">
          <MapContainer 
            center={[location.lat, location.lng]} 
            zoom={13} 
            className="w-full h-full rounded-xl z-0"
          >
            <ChangeView center={location} zoom={13} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            <Marker position={[location.lat, location.lng]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            
            {/* Tasker Markers */}
            {filteredTaskers.map(tasker => {
              if (!tasker.location || !tasker.location.coordinates) return null;
              let pLat = tasker.location.coordinates[1];
              let pLng = tasker.location.coordinates[0];
              
              if (pLat === location.lat && pLng === location.lng) {
                pLat += 0.002;
                pLng += 0.002;
              }
              
              return (
                <Marker
                  key={tasker._id}
                  position={[pLat, pLng]}
                  icon={taskerIcon}
                >
                  <Popup>
                    <div className="p-1 max-w-[200px]">
                      <h3 className="font-bold text-slate-900 m-0">{tasker.name}</h3>
                      <p className="text-sm text-brand-600 font-medium m-0 mb-2">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType}</p>
                      <p className="text-sm text-slate-600 m-0 mb-3">₹{tasker.pricePerHour} / hr</p>
                      <button onClick={() => handleBooking(tasker)} className="w-full py-1.5 bg-brand-500 text-white text-xs font-bold rounded hover:bg-brand-600 transition-colors cursor-pointer border-none">Book Now</button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-900">Nearby Taskers</h2>
            <p className="text-sm text-slate-500">{filteredTaskers.length} found near you</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {filteredTaskers.map(tasker => (
              <div key={tasker._id} className="p-4 border border-slate-100 rounded-xl hover:border-brand-300 hover:shadow-md transition-all cursor-pointer bg-white" onClick={() => {
                if(tasker.location && tasker.location.coordinates){
                  setLocation({ lat: tasker.location.coordinates[1], lng: tasker.location.coordinates[0] });
                }
              }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-900">{tasker.name}</h3>
                    <p className="text-xs font-medium text-brand-600">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType}</p>
                  </div>
                  <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-50 px-2 py-1 rounded">
                    <Star size={14} className="mr-1 fill-amber-500" /> 
                    {tasker.rating ? tasker.rating.toFixed(1) : 'New'}
                    {tasker.reviewsCount > 0 && <span className="text-slate-400 text-xs ml-1 font-medium">({tasker.reviewsCount})</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                  <div><span className="font-bold text-slate-900">₹{tasker.pricePerHour}</span>/hr</div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                  <div>{tasker.experience} yrs exp</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleBooking(tasker); }} className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-lg transition-colors shadow-md shadow-brand-500/20">
                   Book Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {bookingTasker && (
        <BookingModal 
          tasker={bookingTasker} 
          onClose={() => setBookingTasker(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
