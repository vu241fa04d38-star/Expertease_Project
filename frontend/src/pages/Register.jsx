import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { serviceCategories, allCategories } from '../config/services';
import Logo from '../components/Logo';

const Register = () => {
  const [selectedCategory, setSelectedCategory] = useState("Featured Tasks");
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'customer', phone: '', city: '', serviceType: [], experience: '', pricePerHour: ''
  });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData);
      if (res.data.success) {
        const user = await login(formData.email, formData.password);
        if (user.role === 'tasker') navigate('/tasker');
        else navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <div className="flex justify-center mb-4">
            <Logo size="lg" theme="light" />
          </div>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Or{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 transition-colors">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-rose-500 text-sm text-center font-medium bg-rose-50 py-2 rounded-lg">{error}</div>}
          
          <div className="flex gap-4 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.role === 'customer' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData({...formData, role: 'customer'})}
            >
              👤 Customer
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.role === 'tasker' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setFormData({...formData, role: 'tasker'})}
            >
              🔧 Tasker
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input name="name" type="text" required onChange={handleChange} className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input name="phone" type="text" required onChange={handleChange} className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input name="email" type="email" required onChange={handleChange} className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input name="password" type="password" required onChange={handleChange} className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
          </div>

          {formData.role === 'tasker' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">What services do you offer?</label>
                
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Experience (Yrs)</label>
                <input name="experience" type="number" onChange={handleChange} className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price / Hr (₹)</label>
                <input name="pricePerHour" type="number" onChange={handleChange} className="block w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm" />
              </div>
            </div>
          )}

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
