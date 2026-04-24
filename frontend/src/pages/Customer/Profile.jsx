import { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Camera, User, Phone, Mail, MapPin, Save, CheckCircle, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';

const CustomerProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: '', phone: '', city: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [previewImg, setPreviewImg] = useState(null);
  const [removePicture, setRemovePicture] = useState(false);
  const fileRef = useRef();

  // Always fetch fresh user data from DB on mount so phone/city are pre-filled
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me` , {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          const u = res.data.user;
          setUser(prev => ({ ...prev, ...u }));
          setForm({
            name: u.name || '',
            phone: u.phone || '',
            city: u.city || '',
          });
          if (u.profilePicture) {
            setPreviewImg(`${import.meta.env.VITE_API_URL}${u.profilePicture}`);
          } else {
            setPreviewImg(null);
          }
          setRemovePicture(false);
        }
      } catch (err) {
        // Fallback to context values if fetch fails
        setForm({
          name: user?.name || '',
          phone: user?.phone || '',
          city: user?.city || '',
        });
        if (user?.profilePicture) {
          setPreviewImg(`${import.meta.env.VITE_API_URL}${user.profilePicture}`);
        } else {
          setPreviewImg(null);
        }
        setRemovePicture(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
      setRemovePicture(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewImg(null);
    setRemovePicture(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const hasFile = fileRef.current?.files[0];
      const shouldRemovePicture = removePicture && !hasFile;
      let res;

      if (hasFile) {
        // Send as multipart when there's a profile picture to upload
        const data = new FormData();
        data.append('name', form.name);
        data.append('phone', form.phone);
        data.append('city', form.city);
        data.append('profilePicture', hasFile);
        res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/me` , data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Send as JSON when only updating text fields
        res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/me` ,
          { name: form.name, phone: form.phone, city: form.city, removeProfilePicture: shouldRemovePicture },
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
      }

      if (res.data.success) {
        const updated = res.data.user;
        setUser(prev => ({ ...prev, ...updated }));
        setForm({
          name: updated.name || '',
          phone: updated.phone || '',
          city: updated.city || '',
        });
        if (updated.profilePicture) {
          setPreviewImg(`${import.meta.env.VITE_API_URL}${updated.profilePicture}`);
        } else {
          setPreviewImg(null);
        }
        setRemovePicture(false);
        if (fileRef.current) fileRef.current.value = '';
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save profile', err);
      setError('Failed to save. Please ensure the backend is running and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900">My Profile</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your personal information</p>
      </div>

      {/* Profile Picture Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-brand-500 flex items-center justify-center text-white text-4xl font-black overflow-hidden shadow-lg border-4 border-white ring-2 ring-brand-100">
            {previewImg ? (
              <img src={previewImg} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              form.name?.charAt(0)?.toUpperCase() || 'U'
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-9 h-9 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-colors"
          >
            <Camera size={16} />
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        {previewImg && (
          <button
            type="button"
            onClick={handleRemoveImage}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            <Trash2 size={14} /> Remove Photo
          </button>
        )}
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900">{form.name || user?.name}</h2>
          <p className="text-slate-400 text-sm font-medium capitalize">{user?.role}</p>
          {form.phone && <p className="text-brand-500 text-sm font-bold mt-1">{form.phone}</p>}
          {form.city && (
            <p className="text-slate-500 text-sm font-medium flex items-center justify-center gap-1 mt-0.5">
              <MapPin size={12} />{form.city}
            </p>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <h3 className="font-black text-slate-900 text-lg">Personal Information</h3>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                placeholder="Your full name"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 font-medium cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">Email cannot be changed after registration.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">City</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                placeholder="Your city"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
            saved
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20 active:scale-[0.98]'
          }`}
        >
          {saving ? (
            <><Loader2 size={20} className="animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle size={20} /> Changes Saved!</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomerProfile;
