import { useState, useEffect } from 'react';
import axios from 'axios';
import { Briefcase } from 'lucide-react';

const Taskers = () => {
  const [taskers, setTaskers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTaskers();
  }, []);

  const fetchTaskers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users?role=tasker` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTaskers(res.data.users);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleApprove = async (id, isApproved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/admin/tasker/${id}/approve`, { isApproved }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTaskers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
        <Briefcase className="text-brand-500" /> All Taskers
      </h1>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase font-bold text-slate-500">
                <th className="p-4 pl-6">Name</th>
                <th className="p-4">Service</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Rate (₹/hr)</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">Loading taskers...</td>
                </tr>
              ) : taskers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No taskers found.</td>
                </tr>
              ) : (
                taskers.map(tasker => (
                  <tr key={tasker._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">
                      <div>{tasker.name}</div>
                      <div className="text-xs font-normal text-slate-500">{tasker.email}</div>
                    </td>
                    <td className="p-4 font-medium text-brand-600">{Array.isArray(tasker.serviceType) ? tasker.serviceType.join(', ') : tasker.serviceType}</td>
                    <td className="p-4 text-slate-600">{tasker.experience} yrs</td>
                    <td className="p-4 text-slate-600">₹{tasker.pricePerHour}</td>
                    <td className="p-4">
                      {tasker.isApproved ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">APPROVED</span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">PENDING</span>
                      )}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex gap-2">
                        {!tasker.isApproved ? (
                          <button onClick={() => handleApprove(tasker._id, true)} className="px-3 py-1.5 bg-brand-500 text-white font-bold text-xs rounded-lg hover:bg-brand-600">Approve</button>
                        ) : (
                          <button onClick={() => handleApprove(tasker._id, false)} className="px-3 py-1.5 bg-rose-100 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-200">Revoke</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Taskers;
