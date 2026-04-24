import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase, MapPin, Clock, Navigation, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Self-contained per-booking rating form ────────────────────────────────────
// Giving each booking card its own isolated state eliminates the stale-closure
// bug that was preventing Submit / Cancel from responding correctly.
const RatingForm = ({ bookingId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(bookingId, rating, review);
    } catch (err) {
      // Show the actual server error so we know exactly why it failed
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
      <p className="text-sm font-bold text-slate-900">Rate this Tasker</p>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}

      {/* Star selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none p-0.5"
          >
            <Star
              size={26}
              className={`transition-colors ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 hover:text-amber-300'}`}
            />
          </button>
        ))}
      </div>

      <textarea
        placeholder="Leave a review (optional)..."
        className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-brand-500 resize-none"
        rows="2"
        value={review}
        onChange={e => setReview(e.target.value)}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-white text-slate-600 font-bold border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ── Main Bookings page ────────────────────────────────────────────────────────
const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openRatingId, setOpenRatingId] = useState(null); // which booking has the form open
  const navigate = useNavigate();

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Called by RatingForm after user confirms — throws on error so form can show it
  const submitRating = async (bookingId, rating, review) => {
    const token = localStorage.getItem('token');
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/review`,
      { rating, review },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setOpenRatingId(null);
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Briefcase className="text-brand-500" /> My Bookings
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Clock size={20} className="text-slate-400" />
          <h2 className="font-bold text-slate-900">Booking History</h2>
        </div>

        <div className="p-6 flex-1 bg-slate-50">
          {loading ? (
            <div className="flex justify-center items-center h-full text-slate-500 font-medium py-20">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
              <Briefcase size={64} className="opacity-20 text-slate-300" />
              <p className="font-medium text-lg">You have no bookings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map(booking => (
                <div key={booking._id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-brand-300 transition-colors">

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{booking.service}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1 font-medium">
                        <MapPin size={16} className="text-brand-500" /> {booking.address}
                      </p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide uppercase ${
                      booking.status === 'pending'     ? 'bg-amber-100 text-amber-700'   :
                      booking.status === 'accepted'    ? 'bg-brand-100 text-brand-700'   :
                      booking.status === 'in-progress' ? 'bg-blue-100 text-blue-700'     :
                      booking.status === 'completed'   ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Tasker Info + Track button */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Tasker Details</p>
                      {booking.taskerId ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold overflow-hidden">
                            {booking.taskerId.profilePicture
                              ? <img src={`${import.meta.env.VITE_API_URL}${booking.taskerId.profilePicture}`} className="w-full h-full object-cover" alt="" />
                              : booking.taskerId.name?.charAt(0)
                            }
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{booking.taskerId.name}</p>
                            <p className="text-xs text-slate-500">{booking.taskerId.phone}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic">Tasker information unavailable</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/customer/track/${booking._id}`)}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl transition-colors border border-brand-200 shadow-sm shrink-0"
                    >
                      <Navigation size={18} /> Live Track
                    </button>
                  </div>

                  {/* Rating Section — only for completed bookings */}
                  {booking.status === 'completed' && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      {booking.rating ? (
                        // Already rated
                        <div>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Your Rating</p>
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={18} className={star <= booking.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'} />
                            ))}
                          </div>
                          {booking.review && <p className="text-sm text-slate-600 italic">"{booking.review}"</p>}
                        </div>
                      ) : openRatingId === booking._id ? (
                        // Isolated form component — no shared state bugs
                        <RatingForm
                          bookingId={booking._id}
                          onSubmit={submitRating}
                          onCancel={() => setOpenRatingId(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setOpenRatingId(booking._id)}
                          className="text-sm font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
                        >
                          <Star size={16} /> Rate Tasker
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookings;
