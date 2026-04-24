import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Briefcase, Star, Clock, CheckCircle, Edit2, TrendingUp, IndianRupee, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    earnings: 0,
    responseRate: 100,
    rating: user.rating || 0
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    // Calculate stats
    if (requests.length > 0) {
      const completed = requests.filter(r => r.status === 'completed');
      const totalJobs = completed.length;
      const earnings = completed.reduce((sum, req) => sum + (req.amount || 0), 0);
      
      const actionable = requests.filter(r => r.status !== 'pending');
      const accepted = actionable.filter(r => r.status === 'accepted' || r.status === 'in-progress' || r.status === 'completed');
      const responseRate = actionable.length > 0 ? Math.round((accepted.length / actionable.length) * 100) : 100;

      setStats({
        totalJobs,
        earnings,
        responseRate,
        rating: user.rating || 0
      });
    }
  }, [requests, user.rating]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.bookings);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAvailability = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/taskers/profile` , {
        isAvailable: !user.isAvailable
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Update user context manually to reflect instantly
        setUser({ ...user, isAvailable: !user.isAvailable });
        if (user.isAvailable) {
          // It was online, now it's offline
          setToastMessage('Offline');
          setTimeout(() => setToastMessage(''), 3000);
        } else {
          // It was offline, now it's online
          setToastMessage('Available');
          setTimeout(() => setToastMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to update availability', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-8 pb-10">
      
      {/* Status Toast */}
      {toastMessage && (
        <div className={`fixed top-20 right-8 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-5 ${toastMessage === 'Available' ? 'bg-emerald-600' : 'bg-slate-900'}`}>
          {toastMessage === 'Available' ? <CheckCircle size={18} className="text-emerald-100" /> : <AlertCircle size={18} className="text-brand-400" />}
          <span className="font-bold text-sm">You are now {toastMessage}</span>
        </div>
      )}

      {/* Account Pending Warning */}
      {!user.isApproved && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-full shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-1">Approval Pending</h3>
            <p className="text-amber-700">Your account is currently under review. You will not be visible to customers until approved.</p>
          </div>
        </div>
      )}

      {/* Massive Header Profile Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
        
        {/* Background Decoration */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
        <div className="absolute right-40 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-5xl font-black shadow-lg overflow-hidden border-4 border-slate-800">
              {user.profilePicture ? (
                <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                user.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div 
              className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 shadow-xl border-2 border-slate-900"
            >
              <Edit2 size={16} />
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{user.name}</h1>
            <p className="text-slate-400 text-lg mb-4">{Array.isArray(user.serviceType) ? user.serviceType.join(', ') : (user.serviceType || 'Tasker')} • {user.city || 'Anywhere'}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {user.isApproved ? (
                <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
                  <CheckCircle size={14} /> Verified
                </span>
              ) : (
                <span className="bg-rose-500/20 border border-rose-500/30 text-rose-400 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Not verified
                </span>
              )}
              <span className="bg-white/10 border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                ₹{user.pricePerHour || 0}/hr
              </span>
              <span className="bg-teal-500/20 border border-teal-500/30 text-teal-400 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
                <Star size={14} className="fill-teal-400" /> {user.rating || 'New'} avg
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center sm:items-end justify-center shrink-0">
          <button 
            onClick={toggleAvailability}
            disabled={!user.isApproved || isUpdating}
            className={`relative flex items-center p-1.5 w-32 h-12 rounded-full transition-all duration-300 ${
              !user.isApproved ? 'bg-slate-800 opacity-50 cursor-not-allowed' :
              user.isAvailable ? 'bg-brand-500 shadow-lg shadow-brand-500/30' : 'bg-slate-700'
            }`}
          >
            <div className={`w-9 h-9 bg-white rounded-full shadow-md transition-transform duration-300 ${user.isAvailable ? 'translate-x-20' : 'translate-x-0'}`}></div>
            <span className={`absolute font-bold text-sm transition-all duration-300 ${user.isAvailable ? 'left-4 text-white' : 'right-4 text-slate-400'}`}>
              {user.isAvailable ? 'Available' : 'Offline'}
            </span>
          </button>
          {!user.isApproved && <span className="text-xs text-amber-500 mt-2 font-medium">Pending Approval</span>}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Total Jobs</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2 relative z-10">{stats.totalJobs}</h3>
          <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 relative z-10"><TrendingUp size={12}/> {stats.totalJobs > 0 ? '+1' : '0'} this week</p>
        </div>
        
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <Star className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-amber-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Avg Rating</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2 relative z-10">{stats.rating > 0 ? stats.rating : 'N/A'}</h3>
          <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 relative z-10"><TrendingUp size={12}/> {stats.rating > 0 ? '+0.1' : '0'} vs last month</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <IndianRupee className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-emerald-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Earnings (Total)</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2 relative z-10">₹{stats.earnings.toLocaleString()}</h3>
          <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 relative z-10"><TrendingUp size={12}/> +12% vs last month</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
          <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-20 h-20 text-blue-50 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Response Rate</p>
          <h3 className="text-4xl font-black text-slate-900 mb-2 relative z-10">{stats.responseRate}%</h3>
          <p className="text-xs font-medium text-emerald-500 flex items-center gap-1 relative z-10"><TrendingUp size={12}/> +2% improvement</p>
        </div>
      </div>

      {/* Incoming Requests Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Incoming Requests</h2>
            <p className="text-slate-500 text-sm font-medium">{pendingRequests.length} pending requests</p>
          </div>
          <button onClick={() => navigate('/tasker/requests')} className="text-brand-500 font-bold text-sm hover:text-brand-600 transition-colors">
            View all →
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Briefcase size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No new requests</h3>
            <p className="text-slate-500">When customers book your service, they will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-white border-2 border-brand-100 rounded-3xl p-6 shadow-md shadow-brand-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-100 to-transparent opacity-50"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wide rounded-lg">New Request</span>
                  <span className="text-slate-400 text-xs font-bold">{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-1">{req.service}</h3>
                <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mb-6"><MapPin size={16} className="text-brand-500" /> {req.address}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mb-6">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">Estimated Earn</p>
                    <p className="font-black text-slate-900 text-lg">₹{req.amount || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">Time</p>
                    <p className="font-bold text-slate-900">{req.time}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => updateStatus(req._id, 'accepted')} className="flex-1 bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 transition-all active:scale-95">Accept</button>
                  <button onClick={() => updateStatus(req._id, 'cancelled')} className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-colors">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
