import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import RequireRole from '../components/RequireRole';
import Spinner from '../components/common/Spinner'; // Make sure to import Spinner

// Public pages
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import PublicReports from '../pages/public/PublicReports';
import RegisterAdmin from '../pages/public/RegisterAdmin';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageEvents from '../pages/admin/ManageEvents';
import ManageTasks from '../pages/admin/ManageTasks';

// Sub-admin pages
import SubAdminDashboard from '../pages/subadmin/SubAdminDashboard';
import MyEvents from '../pages/subadmin/MyEvents';
import DelegateTasks from '../pages/subadmin/DelegateTasks';
import ReviewSubmissions from '../pages/subadmin/ReviewSubmissions';

// Volunteer pages
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard';
import MyTasks from '../pages/volunteer/MyTasks';
import SubmitTask from '../pages/volunteer/SubmitTask';

import NotFound from '../pages/NotFound';

function DashboardRedirect() {
  const { user, loading } = useAuth(); // Added loading state

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  
  const routes = {
    admin: '/admin/dashboard',
    'sub-admin': '/subadmin/dashboard',
    volunteer: '/volunteer/dashboard',
  };
  
  return <Navigate to={routes[user.role] || '/'} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reports" element={<PublicReports />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/register-admin" element={<RegisterAdmin />} />

          {/* Admin routes (Only Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/tasks" element={<ManageTasks />} />
            </Route>
          </Route>

          {/* Sub-admin routes (Admin & Sub-Admin can access) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sub-admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/subadmin/dashboard" element={<SubAdminDashboard />} />
              <Route path="/subadmin/events" element={<MyEvents />} />
              <Route path="/subadmin/tasks" element={<DelegateTasks />} />
              <Route path="/subadmin/submissions" element={<ReviewSubmissions />} />
            </Route>
          </Route>

          {/* Volunteer routes (Admin, Sub-Admin, and Volunteer can access) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'sub-admin', 'volunteer']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
              <Route path="/volunteer/tasks" element={<MyTasks />} />
              <Route path="/volunteer/submit/:taskId" element={<SubmitTask />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}