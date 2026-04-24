import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './pages/Admin/Users';
import AdminTaskers from './pages/Admin/Taskers';
import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerOverview from './pages/Customer/Overview';
import CustomerBookings from './pages/Customer/Bookings';
import CustomerTrack from './pages/Customer/Track';
import CustomerProfile from './pages/Customer/Profile';
import TaskerDashboard from './pages/Tasker/Dashboard';
import TaskerRequests from './pages/Tasker/Requests';
import TaskerProfile from './pages/Tasker/Profile';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import About from './pages/About';
import LocationPrompt from './components/LocationPrompt';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return (
    <>
      {user.role !== 'admin' && <LocationPrompt />}
      {children}
    </>
  );
};

const DefaultRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'tasker') return <Navigate to="/tasker" />;
  return <Navigate to="/customer" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<DefaultRedirect />} />
            
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="admin/taskers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTaskers />
              </ProtectedRoute>
            } />
            
            <Route path="customer" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerOverview />
              </ProtectedRoute>
            } />
            <Route path="customer/find" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="customer/bookings" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerBookings />
              </ProtectedRoute>
            } />
            <Route path="customer/track/:id" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerTrack />
              </ProtectedRoute>
            } />
            <Route path="customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } />
            <Route path="customer/notifications" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Notifications />
              </ProtectedRoute>
            } />
            
            <Route path="tasker" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <TaskerDashboard />
              </ProtectedRoute>
            } />
            <Route path="tasker/requests" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <TaskerRequests />
              </ProtectedRoute>
            } />
            <Route path="tasker/profile" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <TaskerProfile />
              </ProtectedRoute>
            } />
            <Route path="tasker/notifications" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="customer/help" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="customer/about" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <About />
              </ProtectedRoute>
            } />
            <Route path="tasker/help" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="tasker/about" element={
              <ProtectedRoute allowedRoles={['tasker']}>
                <About />
              </ProtectedRoute>
            } />
            <Route path="admin/help" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Help />
              </ProtectedRoute>
            } />
            <Route path="admin/about" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <About />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
