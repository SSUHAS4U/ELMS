import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
import { Logo } from '../ui';
import {
  LayoutDashboard, CalendarRange, Clock, FileText, LogOut, ChevronLeft, ChevronRight,
  Wallet, MonitorDot, Users, FileBarChart, Settings, CheckSquare, ListTodo,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed, onMobileClose }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navByRole = {
    employee: [
      { name: 'Dashboard', path: '/dashboard/employee/home', icon: LayoutDashboard },
      { name: 'Leaves', path: '/dashboard/employee/leaves', icon: CalendarRange },
      { name: 'Swipe Data', path: '/dashboard/employee/swipe', icon: Clock },
      { name: 'Timesheet', path: '/dashboard/employee/timesheet', icon: FileText },
      { name: 'Payslip', path: '/dashboard/employee/payslip', icon: Wallet },
      { name: 'Assets', path: '/dashboard/employee/assets', icon: MonitorDot },
    ],
    hr: [
      { name: 'Dashboard', path: '/dashboard/hr/home', icon: LayoutDashboard },
      { name: 'Approvals', path: '/dashboard/hr/approvals', icon: CheckSquare },
      { name: 'All Leaves', path: '/dashboard/hr/all-leaves', icon: ListTodo },
      { name: 'Employees', path: '/dashboard/hr/employees', icon: Users },
      { name: 'Holidays', path: '/dashboard/hr/holidays', icon: CalendarRange },
      { name: 'Reports', path: '/dashboard/hr/reports', icon: FileBarChart },
    ],
    admin: [
      { name: 'Dashboard', path: '/dashboard/admin/home', icon: LayoutDashboard },
      { name: 'Users', path: '/dashboard/admin/users', icon: Users },
      { name: 'Departments', path: '/dashboard/admin/departments', icon: MonitorDot },
      { name: 'Organization', path: '/dashboard/admin/organization', icon: Settings },
      { name: 'Audit Log', path: '/dashboard/admin/audit-log', icon: FileText },
      { name: 'Reports', path: '/dashboard/admin/reports', icon: FileBarChart },
    ],
  };
  const navItems = navByRole[user?.role] || [];

  const NavItem = ({ item, settings = false }) => (
    <NavLink
      to={item.path}
      onClick={onMobileClose}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 h-11 rounded-[var(--radius-sm)] transition-colors whitespace-nowrap overflow-hidden group
        ${isActive
          ? 'text-[color:var(--sidebar-text-active)] font-semibold'
          : 'text-[color:var(--sidebar-text)] hover:bg-[color:var(--sidebar-hover)] hover:text-content'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span layoutId="sidebar-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className="absolute inset-0 rounded-[var(--radius-sm)] bg-[color:var(--sidebar-active-bg)] ring-1 ring-inset ring-accent/20 -z-0" />
          )}
          {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent shadow-glow z-10" />}
          <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                className="text-sm relative z-10">{item.name}</motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );

  return (
    <motion.div
      animate={{ width: isCollapsed ? 76 : 264 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full bg-[color:var(--sidebar-bg)] border-r border-[color:var(--sidebar-border)] flex flex-col overflow-hidden"
    >
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[color:var(--sidebar-border)]">
        {isCollapsed ? <Logo size={32} /> : <Logo size={32} wordmark />}
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="text-[color:var(--sidebar-text)] hover:text-content transition-colors" aria-label="Collapse sidebar">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {!isCollapsed && <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-content-tertiary">Menu</p>}
        {navItems.map((item) => <NavItem key={item.name} item={item} />)}
      </nav>

      {isCollapsed && (
        <div className="p-3 flex justify-center border-t border-[color:var(--sidebar-border)]">
          <button onClick={() => setIsCollapsed(false)} className="w-10 h-10 grid place-items-center text-[color:var(--sidebar-text)] hover:text-content bg-[color:var(--sidebar-hover)] rounded-[var(--radius-sm)] transition-colors" aria-label="Expand sidebar">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="px-3 pb-2">
        <NavItem item={{ name: 'Settings', path: '/dashboard/settings', icon: Settings }} />
      </div>

      {/* User footer */}
      <div className="p-3 border-t border-[color:var(--sidebar-border)]">
        <div className={`flex items-center gap-3 p-2 rounded-[var(--radius-sm)] bg-[color:var(--sidebar-user-bg)] border border-[color:var(--sidebar-user-border)] ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[color:var(--accent-glow)] ring-1 ring-inset ring-accent/20 flex items-center justify-center text-accent font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden leading-tight">
                <span className="text-sm font-semibold text-content truncate">{user?.name}</span>
                <span className="text-[10px] text-[color:var(--sidebar-text-active)] uppercase tracking-wider">{user?.role}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={logout} className="text-[color:var(--sidebar-text)] hover:text-[color:var(--danger)] p-2 rounded-lg hover:bg-[color:var(--danger)]/10 transition-colors" aria-label="Log out">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
