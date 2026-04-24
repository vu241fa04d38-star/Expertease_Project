import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Search, MapPin, RefreshCw, Star, Navigation2 } from 'lucide-react';
import axios from 'axios';
import BookingModal from '../../components/BookingModal';
import TaskerMapModal from '../../components/TaskerMapModal';
import { serviceCategories, allCategories } from '../../config/services';

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return d.toFixed(1); // Distance in km
}

const Overview = () => {
  const { user } = useContext(AuthContext);
  const [taskers, setTaskers] = useState([]);
  const [locationName, setLocationName] = useState('Detecting...');
  const [userLoc, setUserLoc] = useState(null);
  const [bookingTasker, setBookingTasker] = useState(null);
  const [mapTasker, setMapTasker] = useState(null);
  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLocationAndTaskers = async () => {
    const locStr = sessionStorage.getItem('userLocation');
    if (locStr) {
      try {
        const coords = JSON.parse(locStr);
        setUserLoc(coords);
        
        // Reverse Geocode for banner
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setLocationName(data.display_name);
            } else {
              setLocationName('Location Found');
            }
          })
          .catch(() => setLocationName('Location Found'));

        // Fetch Taskers
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/taskers/nearby?lat=${coords.lat}&lng=${coords.lng}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Nearby API Response:', res.data);
        if (res.data.success) {
          setTaskers(res.data.taskers);
        } else {
          console.error('Nearby API failed:', res.data);
          setTaskers([]);
        }
      } catch (e) {
        console.error('Nearby API Error:', e);
        setTaskers([]);
      }
    } else {
      setLocationName('Location Not Set');
    }
  };

  useEffect(() => {
    fetchLocationAndTaskers();
    window.addEventListener('locationUpdated', fetchLocationAndTaskers);
    return () => window.removeEventListener('locationUpdated', fetchLocationAndTaskers);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Filter Logic
  const filteredTaskers = taskers.filter(p => {
    const pName = p.name ? p.name.toLowerCase() : '';
    const pCity = p.city ? p.city.toLowerCase() : '';
    const filterLower = activeFilter ? activeFilter.toLowerCase() : '';
    const pServicesArray = Array.isArray(p.serviceType) ? p.serviceType.map(s => s.toLowerCase()) : (p.serviceType ? [p.serviceType.toLowerCase()] : []);
    
    let matchesFilter = true;
    if (activeFilter && serviceCategories[activeFilter]) {
      const catServices = serviceCategories[activeFilter].map(s => s.toLowerCase());
      matchesFilter = pServicesArray.some(s => catServices.includes(s));
    } else if (activeFilter) {
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
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900">{getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'} 👋</h1>
        <p className="text-slate-500 font-medium mt-1">What service do you need today?</p>
      </div>

      {/* Location Banner */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">Your Current Location</p>
            <p className="text-white font-bold max-w-full truncate">{locationName}</p>
            <p className="text-xs text-slate-500 font-medium mt-1 font-mono">
              {userLoc ? `${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}` : 'Waiting for GPS...'}
            </p>
          </div>
        </div>
        <button onClick={fetchLocationAndTaskers} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-700 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-brand-500" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search by service (e.g. plumber, mechanic) or area..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium text-slate-900"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-6 rounded-full transition-colors text-sm">
              Search
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-3 custom-scrollbar">
          <button 
            onClick={() => setActiveFilter('')}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm border transition-colors ${!activeFilter ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            All
          </button>
          {allCategories.map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f === activeFilter ? '' : f)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm border transition-colors ${activeFilter === f ? 'bg-brand-50 border-brand-200 text-brand-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Taskers List */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Nearby Taskers</h2>
            <p className="text-sm text-slate-500 font-medium">Sorted by distance from you</p>
          </div>
          <button className="text-brand-600 font-bold text-sm hover:text-brand-700">View all →</button>
        </div>

        {filteredTaskers.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-sm">
            <Search size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No taskers found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaskers.map(tasker => {
              
              // Calculate dynamic distance and ETA based on actual coordinates
              let distanceStr = '-';
              let etaStr = '-';
              if (userLoc && tasker.location?.coordinates?.length >= 2) {
                const dist = calculateDistance(userLoc.lat, userLoc.lng, tasker.location.coordinates[1], tasker.location.coordinates[0]);
                if (dist) {
                  distanceStr = `${dist}km`;
                  etaStr = `~${Math.max(2, Math.round(dist * 10))}m`; // roughly 10 mins per km in city
                }
              }

              const pName = tasker.name || 'Unknown';
              const colorClasses = ['bg-emerald-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-rose-500'];
              const colorClass = colorClasses[pName.length % colorClasses.length];

              return (
                <div key={tasker._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                  
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <div className={`w-12 h-12 ${colorClass} text-white rounded-xl flex items-center justify-center font-black text-lg shadow-inner overflow-hidden shrink-0`}>
                        {tasker.profilePicture ? <img src={`${import.meta.env.VITE_API_URL}${tasker.profilePicture}`} className="w-full h-full object-cover" /> : pName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-lg leading-tight truncate max-w-[140px]">{pName}</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : (tasker.serviceType || 'Service')}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900">₹{tasker.pricePerHour}<span className="text-xs font-medium text-slate-500">/hr</span></div>
                      <div className="text-xs font-medium text-slate-400">{tasker.experience} yrs exp</div>
                    </div>
                  </div>

                  {/* Skills/Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Available
                    </span>
                    {Array.isArray(tasker.serviceType) ? tasker.serviceType.map(s => <span key={s} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{s}</span>) : (tasker.serviceType && <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{tasker.serviceType}</span>)}
                    {typeof tasker.skills === 'string' && tasker.skills.split(',').slice(0, 2).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{skill.trim()}</span>
                    ))}
                  </div>

                  <div className="mt-auto">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-0.5 font-black text-amber-500">
                          {tasker.rating ? tasker.rating.toFixed(1) : 'New'}<Star size={12} className="fill-amber-500 -mt-0.5" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Reviews {tasker.reviewsCount > 0 ? `(${tasker.reviewsCount})` : ''}</div>
                      </div>
                      <div className="text-center border-x border-slate-200">
                        <div className="font-black text-slate-900">{distanceStr}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Distance</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-slate-900">{etaStr}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">ETA</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setBookingTasker(tasker)}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm shadow-brand-500/20 text-sm"
                      >
                        Book Now
                      </button>
                      <button 
                        onClick={() => setMapTasker(tasker)}
                        className="w-10 h-10 flex items-center justify-center border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {bookingTasker && (
        <BookingModal tasker={bookingTasker} onClose={() => setBookingTasker(null)} />
      )}

      {mapTasker && (
        <TaskerMapModal tasker={mapTasker} onClose={() => setMapTasker(null)} />
      )}
    </div>
  );
};

export default Overview;
