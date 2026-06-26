import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useThemeStore from './hooks/useThemeStore';
import useAuthStore from './hooks/useAuthStore';
import { Toaster } from 'sonner';

// Layout — small, always needed
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/layout/ProtectedRoute';
import useSocket from './hooks/useSocket';

// Public pages — small, eagerly loaded for instant first paint
import Landing from './pages/Landing';
import Login from './pages/Login';

// Employee — lazy loaded, only fetched when navigated to
const EmployeeDashboard = lazy(() => import('./pages/employee/EmployeeDashboard'));
const EmployeeLeaves    = lazy(() => import('./pages/employee/Leaves'));
const SwipeData         = lazy(() => import('./pages/employee/SwipeData'));
const Timesheet         = lazy(() => import('./pages/employee/Timesheet'));
const Payslip           = lazy(() => import('./pages/employee/Payslip'));
const Assets            = lazy(() => import('./pages/employee/Assets'));

// HR — lazy loaded
const HRDashboard  = lazy(() => import('./pages/hr/HRDashboard'));
const Approvals    = lazy(() => import('./pages/hr/Approvals'));
const AllLeaves    = lazy(() => import('./pages/hr/AllLeaves'));
const HREmployees  = lazy(() => import('./pages/hr/Employees'));
const HRReports    = lazy(() => import('./pages/hr/Reports'));
const Holidays     = lazy(() => import('./pages/hr/Holidays'));

// Admin — lazy loaded
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement  = lazy(() => import('./pages/admin/UserManagement'));
const Departments     = lazy(() => import('./pages/admin/Departments'));
const Organization    = lazy(() => import('./pages/admin/Organization'));
const AuditLog        = lazy(() => import('./pages/admin/AuditLog'));
const AdminReports    = lazy(() => import('./pages/admin/Reports'));

// Settings — lazy loaded
const Settings = lazy(() => import('./pages/Settings'));

// Role-aware redirect for /dashboard index
const DashboardRedirect = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'employee';
  return <Navigate to={`/dashboard/${role}/home`} replace />;
};

// Full-screen branded loader
const FullScreenLoader = () => (
  <div className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-base bg-aurora">
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl blur-xl opacity-60" style={{ background: 'var(--accent-glow)' }} />
      <div className="relative w-12 h-12 rounded-2xl grid place-items-center"
           style={{ background: 'linear-gradient(145deg, var(--accent-bright), var(--accent-muted))', boxShadow: '0 8px 24px -8px var(--accent-glow)' }}>
        <div className="w-5 h-5 border-2 border-[color:var(--accent-contrast)] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
    <span className="text-sm text-content-secondary font-medium tracking-wide">Loading Obsidian ELMS…</span>
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
      <Suspense fallback={<FullScreenLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
