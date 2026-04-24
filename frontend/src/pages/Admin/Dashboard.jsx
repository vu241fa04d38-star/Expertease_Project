import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalCustomers: 0, totalTaskers: 0, pendingTaskers: 0, totalBookings: 0 });
  const [pendingTaskers, setPendingTaskersList] = useState([]);
  
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchStats();
    fetchPendingTaskers();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats` , { headers });
    if (res.data.success) setStats(res.data.stats);
  };

  const fetchPendingTaskers = async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=tasker` , { headers });
    if (res.data.success) {
      setPendingTaskersList(res.data.users.filter(u => !u.isApproved));
    }
  };

  const handleApprove = async (id, isApproved) => {
    await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/tasker/${id}/approve`, { isApproved }, { headers });
    fetchStats();
    fetchPendingTaskers();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Customers</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.totalCustomers}</h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl"><Users size={24}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Taskers</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.totalTaskers}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><UserCheck size={24}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm bg-rose-50/30">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-rose-500 uppercase">Pending Approvals</p>
              <h3 className="text-3xl font-black text-rose-600 mt-2">{stats.pendingTaskers}</h3>
            </div>
            <div className="p-3 bg-rose-100 text-rose-600 rounded-xl"><Users size={24}/></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase">Total Bookings</p>
              <h3 className="text-3xl font-black text-slate-900 mt-2">{stats.totalBookings}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase size={24}/></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Pending Tasker Approvals</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {pendingTaskers.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-medium">No pending approvals! 🎉</div>
          ) : (
            pendingTaskers.map(tasker => (
              <div key={tasker._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg">
                    {tasker.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{tasker.name}</h4>
                    <p className="text-sm text-slate-500">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType} • {tasker.city} • {tasker.experience} yrs exp</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => handleApprove(tasker._id, true)} className="px-4 py-2 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600">Approve</button>
                  <button onClick={() => handleApprove(tasker._id, false)} className="px-4 py-2 bg-rose-100 text-rose-600 font-bold rounded-lg hover:bg-rose-200">Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
