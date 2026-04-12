import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useThemeStore from './hooks/useThemeStore';
import useAuthStore from './hooks/useAuthStore';
import { Toaster } from 'sonner';

// Layout
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import useSocket from './hooks/useSocket';

// Pages — eagerly loaded (small files)
import Landing from './pages/Landing';
import Login from './pages/Login';

// Employee
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeLeaves from './pages/employee/Leaves';
import SwipeData from './pages/employee/SwipeData';
import Timesheet from './pages/employee/Timesheet';
import Payslip from './pages/employee/Payslip';
import Assets from './pages/employee/Assets';

// HR
import HRDashboard from './pages/hr/HRDashboard';
import Approvals from './pages/hr/Approvals';
import AllLeaves from './pages/hr/AllLeaves';
import HREmployees from './pages/hr/Employees';
import HRReports from './pages/hr/Reports';
import Holidays from './pages/hr/Holidays';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import Departments from './pages/admin/Departments';
import Organization from './pages/admin/Organization';
import AuditLog from './pages/admin/AuditLog';
import AdminReports from './pages/admin/Reports';

// Settings (Accessible by All)
import Settings from './pages/Settings';

// Role-aware redirect for /dashboard index
const DashboardRedirect = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'employee';
  return <Navigate to={`/dashboard/${role}/home`} replace />;
};

// Full-screen spinner
const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[color:var(--bg-base)]">
    <div className="w-8 h-8 border-4 border-[color:var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { theme } = useThemeStore();
  const { checkAuth, isAuthenticated, isCheckingAuth, user } = useAuthStore();

  useSocket(user?._id);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ⚠️ CRITICAL: Block ALL route rendering until auth check is complete.
  // This prevents the ProtectedRoute from redirecting to /login before
  // the cookie-based session has been verified by the server.
  if (isCheckingAuth) return <FullScreenLoader />;

  return (
    <BrowserRouter>
      <Toaster position="top-right" theme={theme} richColors />
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* PROTECTED ROUTES */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardRedirect />} />

            {/* EMPLOYEE */}
            <Route path="employee" element={<ProtectedRoute allowedRoles={['employee', 'admin', 'hr']} />}>
              <Route path="home"      element={<EmployeeDashboard />} />
              <Route path="leaves"    element={<EmployeeLeaves />} />
              <Route path="swipe"     element={<SwipeData />} />
              <Route path="timesheet" element={<Timesheet />} />
              <Route path="payslip"   element={<Payslip />} />
              <Route path="assets"    element={<Assets />} />
            </Route>

            {/* HR */}
            <Route path="hr" element={<ProtectedRoute allowedRoles={['hr', 'admin']} />}>
              <Route path="home"       element={<HRDashboard />} />
              <Route path="approvals"  element={<Approvals />} />
              <Route path="all-leaves" element={<AllLeaves />} />
              <Route path="employees"  element={<HREmployees />} />
              <Route path="reports"    element={<HRReports />} />
              <Route path="holidays"   element={<Holidays />} />
            </Route>

            {/* ADMIN */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="home"         element={<AdminDashboard />} />
              <Route path="users"        element={<UserManagement />} />
              <Route path="departments"  element={<Departments />} />
              <Route path="organization" element={<Organization />} />
              <Route path="audit-log"    element={<AuditLog />} />
              <Route path="reports"      element={<AdminReports />} />
            </Route>

            {/* SHARED */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
