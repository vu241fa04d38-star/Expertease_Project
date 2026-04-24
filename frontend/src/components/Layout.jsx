import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, MapPin, Search, Home, Users, Briefcase, Bell, Settings } from 'lucide-react';
import axios from 'axios';
import SettingsModal from './SettingsModal';
import Logo from './Logo';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [locationName, setLocationName] = useState('Detecting Location...');
  const [hasNotification, setHasNotification] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const bookings = res.data.bookings;
          if (user.role === 'tasker') {
            const pending = bookings.filter(b => b.status === 'pending').length;
            // Count unread messages from customers
            const unreadMsgs = bookings.reduce((acc, b) => {
              if (!b.messages) return acc;
              return acc + b.messages.filter(m => !m.isRead && m.senderId !== user._id).length;
            }, 0);
            const total = pending + unreadMsgs;
            setNotifCount(total);
            setHasNotification(total > 0);
          } else if (user.role === 'customer') {
            // Customer: show dot if there are unread messages from tasker on in-progress jobs
            const active = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress');
            const unreadMsgs = active.reduce((acc, b) => {
              if (!b.messages) return acc;
              return acc + b.messages.filter(m => !m.isRead && m.senderId !== user._id).length;
            }, 0);
            setNotifCount(unreadMsgs);
            setHasNotification(unreadMsgs > 0);
          }
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const resolveLocation = () => {
      const locStr = sessionStorage.getItem('userLocation');
      if (locStr) {
        try {
          const { lat, lng } = JSON.parse(locStr);
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.address) {
                const place = data.address.city || data.address.town || data.address.suburb || data.address.state || 'Location Found';
                setLocationName(place);
              } else {
                setLocationName('Location Found');
              }
            })
            .catch(() => setLocationName('Location Found'));
        } catch (e) {
          setLocationName('Invalid Location');
        }
      } else {
        setLocationName('Detecting...');
      }
    };

    resolveLocation();
    window.addEventListener('locationUpdated', resolveLocation);
    return () => window.removeEventListener('locationUpdated', resolveLocation);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    customer: [
      { path: '/customer', icon: <Home size={20} />, label: 'Dashboard' },
      { path: '/customer/find', icon: <Search size={20} />, label: 'Find Services' },
      { path: '/customer/bookings', icon: <Briefcase size={20} />, label: 'My Bookings' },
      { path: '/customer/profile', icon: <User size={20} />, label: 'My Profile' },
    ],
    tasker: [
      { path: '/tasker', icon: <Home size={20} />, label: 'Dashboard' },
      { path: '/tasker/requests', icon: <Briefcase size={20} />, label: 'Job Requests' },
      { path: '/tasker/profile', icon: <User size={20} />, label: 'My Profile' },
    ],
    admin: [
      { path: '/admin', icon: <Home size={20} />, label: 'Overview' },
      { path: '/admin/users', icon: <Users size={20} />, label: 'Customers' },
      { path: '/admin/taskers', icon: <Briefcase size={20} />, label: 'Taskers' },
    ]
  };

  if (!user) return <Outlet />;

  return (
    <>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <Logo size="md" theme="light" />
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          <div className="space-y-1 px-3">
            {navItems[user.role].map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-brand-50 text-brand-600 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 font-medium transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center space-x-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
            <MapPin size={16} className="text-brand-500" />
            <span className="max-w-[200px] truncate">{locationName}</span>
          </div>

          <div className="flex items-center space-x-3">
            
            {/* Settings Gear */}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
              title="Settings"
            >
              <Settings size={20} />
            </button>

            {/* Notification Bell */}
            {user.role !== 'admin' && (
              <button 
                onClick={() => navigate(`/${user.role}/notifications`)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 hover:bg-slate-100 rounded-full"
              >
                <Bell size={20} />
                {hasNotification && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>
            )}

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500 capitalize">{user.role === 'tasker' ? 'Tasker' : user.role}</div>
              </div>
              <button 
                onClick={() => navigate(`/${user.role}/profile`)}
                className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold shadow-md overflow-hidden border-2 border-white hover:border-brand-200 transition-colors cursor-pointer"
              >
                {user.profilePicture ? (
                  <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  user.name.charAt(0)
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>

    {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default Layout;
