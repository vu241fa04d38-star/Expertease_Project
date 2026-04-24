import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Navigation, MessageCircle, User } from 'lucide-react';
import TaskerRouteModal from '../../components/TaskerRouteModal';
import ChatModal from '../../components/ChatModal';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [navigateBooking, setNavigateBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Briefcase className="text-brand-500" /> Job Requests
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Briefcase size={20} className="text-slate-400" />
          <h2 className="font-bold text-slate-900">All Job Requests</h2>
        </div>
        <div className="p-6 flex-1 bg-slate-50">
          {requests.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <Briefcase size={64} className="opacity-20 text-slate-300" />
              <p className="font-medium text-lg">No job requests yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map(req => (
                <div key={req._id} className={`p-6 bg-white border rounded-2xl shadow-sm ${req.status === 'pending' ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{req.service}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium"><MapPin size={16} className="text-brand-500"/> {req.address}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'accepted' ? 'bg-brand-100 text-brand-700' :
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  {req.description && <p className="text-sm text-slate-600 mb-4 p-3 bg-slate-50 rounded-xl">{req.description}</p>}
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 mb-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Customer Details</p>
                    {req.customerId ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold">
                          {req.customerId.name?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{req.customerId.name}</p>
                          {req.customerId.phone && <p className="text-xs text-slate-500">{req.customerId.phone}</p>}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Customer information unavailable</p>
                    )}
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => updateStatus(req._id, 'accepted')} className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-brand-500/20">Accept Job</button>
                      <button onClick={() => updateStatus(req._id, 'cancelled')} className="flex-1 py-3 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold rounded-xl text-sm transition-all">Decline</button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => updateStatus(req._id, 'in-progress')} className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-500/20">Start Job</button>
                      <button onClick={() => setChatBooking(req)} className="w-12 h-12 flex items-center justify-center bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-md" title="Message Customer">
                        <MessageCircle size={18} />
                      </button>
                      <button onClick={() => setNavigateBooking(req)} className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-md" title="Navigate">
                        <Navigation size={18} />
                      </button>
                    </div>
                  )}
                  {req.status === 'in-progress' && (
                    <div className="flex gap-3 mt-6">
                      <button onClick={() => updateStatus(req._id, 'completed')} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20">Mark Completed</button>
                      <button onClick={() => setChatBooking(req)} className="w-12 h-12 flex items-center justify-center bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition-colors shadow-md" title="Message Customer">
                        <MessageCircle size={18} />
                      </button>
                      <button onClick={() => setNavigateBooking(req)} className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-md" title="Navigate">
                        <Navigation size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {navigateBooking && (
        <TaskerRouteModal booking={navigateBooking} onClose={() => setNavigateBooking(null)} />
      )}
      {chatBooking && (
        <ChatModal booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </div>
  );
};

export default Requests;
