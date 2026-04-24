import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Star, Calendar, Clock, MapPin, AlignLeft, CheckCircle2, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BookingModal = ({ tasker, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service: Array.isArray(tasker.serviceType) ? (tasker.serviceType[0] || 'Mechanic') : (tasker.serviceType || 'Mechanic'),
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBookingId, setSuccessBookingId] = useState(null);

  // Fetch human-readable location to pre-fill address
  useEffect(() => {
    const locStr = sessionStorage.getItem('userLocation');
    if (locStr) {
      try {
        const { lat, lng } = JSON.parse(locStr);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.display_name) {
              setFormData(prev => ({ ...prev, address: data.display_name }));
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const serviceCharge = tasker.pricePerHour || 299;
  const platformFee = 29;
  const visitCharge = 24;
  const totalAmount = serviceCharge + platformFee + visitCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      let locationCoords = null;
      const locStr = sessionStorage.getItem('userLocation');
      if (locStr) {
        try { locationCoords = JSON.parse(locStr); } catch(e) {}
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/bookings` , {
        taskerId: tasker._id,
        service: formData.service,
        description: formData.description,
        address: formData.address,
        location: locationCoords,
        date: formData.date,
        time: formData.time,
        amount: totalAmount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccessBookingId(res.data.booking._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    }
    setLoading(false);
  };

  if (!tasker) return null;

  if (successBookingId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3">
              <CheckCircle2 size={48} className="drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Booking Confirmed!</h2>
            <p className="text-slate-500 font-medium mb-8">Your request has been sent to {tasker.name}</p>

            <div className="w-full bg-brand-50/50 border border-brand-100 rounded-2xl p-5 mb-8 text-left">
              <h3 className="text-xs font-black text-brand-600 uppercase tracking-wider mb-4">Booking Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Service</span>
                  <span className="text-slate-900 font-bold">{formData.service}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Date</span>
                  <span className="text-slate-900 font-bold">{new Date(formData.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tasker</span>
                  <span className="text-slate-900 font-bold">{tasker.name}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-brand-100/50">
                  <span className="text-slate-500 font-medium">Amount</span>
                  <span className="text-slate-900 font-black">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button 
                onClick={() => { onClose(); navigate(`/customer/track/${successBookingId}`); }} 
                className="flex-1 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-md shadow-brand-500/20 flex justify-center items-center gap-2"
              >
                <MapPin size={18} /> Track Tasker
              </button>
              <button 
                onClick={() => { onClose(); navigate('/customer/bookings'); }} 
                className="flex-1 py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-colors"
              >
                View Bookings
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Book {tasker.name}</h2>
            <p className="text-sm text-slate-500 font-medium">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType} Professional</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Tasker Mini Card */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-500 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-inner overflow-hidden">
                {tasker.profilePicture ? <img src={`${import.meta.env.VITE_API_URL}${tasker.profilePicture}`} className="w-full h-full object-cover" /> : tasker.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{tasker.name}</h3>
                <div className="flex items-center text-xs text-slate-500 font-medium mt-0.5">
                  <Star size={12} className="text-amber-500 fill-amber-500 mr-1" />
                  {tasker.rating || 'New'} • {tasker.experience} yrs exp
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-black text-slate-900 text-lg">₹{serviceCharge}<span className="text-sm text-slate-500 font-medium">/hr</span></div>
              <div className="text-xs text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full inline-block mt-1">~15 min ETA</div>
            </div>
          </div>

          <form id="booking-form" onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold text-center">{error}</div>}
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Service Type</label>
              <select name="service" value={formData.service} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 appearance-none">
                {Array.isArray(tasker.serviceType) ? tasker.serviceType.map(s => <option key={s} value={s}>{s}</option>) : <option value={tasker.serviceType}>{tasker.serviceType}</option>}
                <option value="General Inspection">General Inspection</option>
                <option value="Emergency Repair">Emergency Repair</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Calendar size={14} /> Preferred Date
                </label>
                <input type="date" name="date" required value={formData.date} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Clock size={14} /> Preferred Time
                </label>
                <input type="time" name="time" required value={formData.time} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <MapPin size={14} /> Service Address
              </label>
              <input type="text" name="address" required placeholder="Enter full address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900" />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <AlignLeft size={14} /> Problem Description
              </label>
              <textarea name="description" rows="3" placeholder="Briefly describe the issue..." value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 resize-none"></textarea>
            </div>

            {/* Bill Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Service Charge (1 hr)</span>
                <span>₹{serviceCharge}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 font-medium pb-3 border-b border-slate-200">
                <span>Visit Charge</span>
                <span>₹{visitCharge}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-black text-slate-900">Estimated Total</span>
                <span className="font-black text-slate-900 text-lg">₹{totalAmount}</span>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white shrink-0">
          <button 
            type="submit" 
            form="booking-form"
            disabled={loading}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-black text-lg rounded-xl transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Confirm Booking →'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default BookingModal;
