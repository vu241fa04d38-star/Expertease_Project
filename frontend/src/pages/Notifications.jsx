import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bell, MessageCircle, Briefcase, MapPin, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatModal from '../components/ChatModal';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatBooking, setChatBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.success) {
        const bookings = res.data.bookings;
        let notifs = [];

        bookings.forEach(b => {
          // 1. Pending Bookings (for taskers)
          if (user.role === 'tasker' && b.status === 'pending') {
            notifs.push({
              id: `req-${b._id}`,
              type: 'request',
              title: 'New Service Request',
              message: `${b.customerId?.name || 'A customer'} requested: ${b.service}`,
              location: b.address,
              time: b.createdAt,
              bookingId: b._id,
              action: () => navigate('/tasker/requests')
            });
          }

          // 2. Recent Messages (for both)
          if (b.messages && b.messages.length > 0) {
            const fromOther = b.messages.filter(m => {
              const sId = m.senderId?._id || m.senderId;
              return sId !== user._id;
            });
            
            if (fromOther.length > 0) {
              const latestMsg = fromOther[fromOther.length - 1];
              const senderName = user.role === 'tasker' ? (b.customerId?.name || 'Customer') : (b.taskerId?.name || 'Tasker');
              notifs.push({
                id: `msg-${b._id}-${latestMsg._id || Date.now()}`,
                type: 'message',
                title: `Message from ${senderName}`,
                message: latestMsg.text,
                service: b.service,
                time: latestMsg.createdAt,
                bookingId: b._id,
                isUnread: !latestMsg.isRead,
                action: () => setChatBooking(b)
              });
            }
          }
        });

        // Sort by newest
        notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
        setNotifications(notifs);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Bell className="text-brand-500" /> Notifications
      </h1>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-slate-400" />
            <h2 className="font-bold text-slate-900">Recent Updates</h2>
          </div>
          {notifications.length > 0 && (
            <span className="bg-brand-100 text-brand-700 py-1 px-3 rounded-full text-xs font-black">
              {notifications.length} New
            </span>
          )}
        </div>

        <div className="flex-1 p-0">
          {loading ? (
            <div className="flex justify-center items-center h-full py-20 text-slate-400 font-medium">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Bell size={32} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-500 text-lg">You're all caught up!</p>
              <p className="text-sm text-slate-400">No new messages or requests right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={notif.action}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer flex gap-4 group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    notif.type === 'request' ? 'bg-amber-100 text-amber-600' : 'bg-brand-100 text-brand-600'
                  }`}>
                    {notif.type === 'request' ? <Briefcase size={20} /> : <MessageCircle size={20} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-black text-slate-900 truncate flex items-center gap-2">
                        {notif.title}
                        {notif.isUnread && <span className="w-2 h-2 rounded-full bg-brand-500"></span>}
                      </h4>
                      <span className="text-xs font-bold text-slate-400 shrink-0 ml-4">{getTimeAgo(notif.time)}</span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-2 truncate">{notif.message}</p>
                    
                    {notif.location && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <MapPin size={14} className="text-slate-400" />
                        <span className="truncate">{notif.location}</span>
                      </div>
                    )}
                    {notif.service && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Briefcase size={14} className="text-slate-400" />
                        <span className="truncate">Regarding: {notif.service}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center justify-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-brand-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {chatBooking && (
        <ChatModal booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </div>
  );
};

export default Notifications;
