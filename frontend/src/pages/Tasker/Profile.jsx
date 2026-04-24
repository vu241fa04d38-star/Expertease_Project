import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { User, Camera, Save } from 'lucide-react';
import { serviceCategories, allCategories } from '../../config/services';

const Profile = () => {
  const [selectedCategory, setSelectedCategory] = useState("Featured Tasks");
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    serviceType: Array.isArray(user.serviceType) ? user.serviceType : (user.serviceType ? [user.serviceType] : []),
    experience: user.experience || '',
    pricePerHour: user.pricePerHour || '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('serviceType', JSON.stringify(formData.serviceType));
      data.append('experience', formData.experience);
      data.append('pricePerHour', formData.pricePerHour);
      if (file) {
        data.append('profilePicture', file);
      }
      
      const locStr = sessionStorage.getItem('userLocation');
      if (locStr) {
        data.append('location', locStr);
      }

      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/taskers/profile` , data, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setUser(res.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      console.error("Profile update error:", error.response || error);
      setMessage(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <User className="text-brand-500" /> My Profile
      </h1>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {message && (
          <div className={`p-4 mb-6 rounded-xl font-medium text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="relative mb-4">
              <div className="w-24 h-24 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-3xl font-bold overflow-hidden shadow-inner">
                {file ? (
                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="Preview" />
                ) : user.profilePicture ? (
                  <img src={`${import.meta.env.VITE_API_URL}${user.profilePicture}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full cursor-pointer hover:bg-brand-600 transition-colors shadow-lg">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-sm text-slate-500 font-medium">Click the camera icon to upload a new profile picture</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Service Types</label>
              
              {/* Category Filter */}
              <select 
                className="w-full mb-3 px-4 py-2 border border-slate-300 rounded-xl focus:ring-brand-500 focus:border-brand-500 text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              {/* Sub-services Pills */}
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-white">
                {serviceCategories[selectedCategory]?.map(service => (
                  <button
                    key={service}
                    type="button"
                    onClick={() => {
                      const current = Array.isArray(formData.serviceType) ? formData.serviceType : [];
                      const newServices = current.includes(service) 
                        ? current.filter(s => s !== service)
                        : [...current, service];
                      setFormData({ ...formData, serviceType: newServices });
                    }}
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                      (Array.isArray(formData.serviceType) ? formData.serviceType : []).includes(service)
                        ? 'border-brand-500 bg-brand-50 text-brand-700' 
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {service}
                  </button>
                ))}
              </div>
              
              {Array.isArray(formData.serviceType) && formData.serviceType.length > 0 && (
                <div className="mt-3 text-xs text-brand-600 font-bold">
                  {formData.serviceType.length} service(s) selected
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Experience (Years)</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Price Per Hour (₹)</label>
              <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 transition-colors disabled:opacity-50 shadow-lg shadow-brand-500/30">
              <Save size={20} />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
