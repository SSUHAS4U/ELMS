import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../../hooks/useAuthStore';
import { 
  LayoutDashboard, CalendarRange, Clock, 
  FileText, LogOut, ChevronLeft, ChevronRight, 
  Wallet, MonitorDot, Users, FileBarChart, Settings, CheckSquare, ListTodo
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'employee':
        return [
          { name: 'Dashboard', path: '/dashboard/employee/home', icon: LayoutDashboard },
          { name: 'Leaves', path: '/dashboard/employee/leaves', icon: CalendarRange },
          { name: 'Swipe Data', path: '/dashboard/employee/swipe', icon: Clock },
          { name: 'Timesheet', path: '/dashboard/employee/timesheet', icon: FileText },
          { name: 'Payslip', path: '/dashboard/employee/payslip', icon: Wallet },
          { name: 'Assets', path: '/dashboard/employee/assets', icon: MonitorDot },
        ];
      case 'hr':
        return [
          { name: 'Dashboard',  path: '/dashboard/hr/home',       icon: LayoutDashboard },
          { name: 'Approvals',  path: '/dashboard/hr/approvals',  icon: CheckSquare },
          { name: 'All Leaves', path: '/dashboard/hr/all-leaves', icon: ListTodo },
          { name: 'Employees',  path: '/dashboard/hr/employees',  icon: Users },
          { name: 'Holidays',   path: '/dashboard/hr/holidays',   icon: CalendarRange },
          { name: 'Reports',    path: '/dashboard/hr/reports',    icon: FileBarChart },
        ];
      case 'admin':
        return [
          { name: 'Dashboard',    path: '/dashboard/admin/home',         icon: LayoutDashboard },
          { name: 'Users',        path: '/dashboard/admin/users',        icon: Users },
          { name: 'Departments',  path: '/dashboard/admin/departments',  icon: MonitorDot },
          { name: 'Organization', path: '/dashboard/admin/organization', icon: Settings },
          { name: 'Audit Log',    path: '/dashboard/admin/audit-log',    icon: FileText },
          { name: 'Reports',      path: '/dashboard/admin/reports',      icon: FileBarChart },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <motion.div 
      animate={{ width: isCollapsed ? '72px' : '260px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full bg-[color:var(--sidebar-bg)] border-r border-[color:var(--sidebar-border)] flex flex-col z-40 overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[color:var(--sidebar-border)]">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
          <div className="min-w-[32px] h-8 rounded bg-[color:var(--sidebar-brand)] shadow-sm"></div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-tight text-[color:var(--sidebar-brand-text)]"
              >
                Obsidian Engine
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Button Inside Sidebar (Desktop) */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="text-[color:var(--sidebar-text)] hover:text-[color:var(--text-primary)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all whitespace-nowrap overflow-hidden group
              ${isActive 
                ? 'bg-[color:var(--sidebar-active-bg)] text-[color:var(--sidebar-text-active)] font-semibold' 
                : 'text-[color:var(--sidebar-text)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--text-primary)]'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  {item.name}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </div>

      {/* Collapse Bottom Button (when collapsed) */}
      {isCollapsed && (
        <div className="p-4 flex justify-center border-t border-[color:var(--sidebar-border)]">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="text-[color:var(--sidebar-text)] hover:text-[color:var(--text-primary)] bg-[color:var(--sidebar-hover)] p-2 rounded-md transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Settings Navigation */}
      <div className="px-3 pb-3">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) => 
            `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all whitespace-nowrap overflow-hidden group
            ${isActive 
              ? 'bg-[color:var(--sidebar-active-bg)] text-[color:var(--sidebar-text-active)] font-semibold border border-[color:var(--accent-primary)]/20' 
              : 'text-[color:var(--sidebar-text)] hover:bg-[color:var(--sidebar-hover)] hover:text-[color:var(--text-primary)]'}`
          }
        >
          <Settings className={`w-5 h-5 flex-shrink-0 ${location.pathname?.includes('settings') ? 'text-[color:var(--accent-primary)]' : ''}`} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[color:var(--sidebar-border)]">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-all`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[color:var(--sidebar-user-bg)] border border-[color:var(--sidebar-user-border)] flex items-center justify-center text-[color:var(--text-primary)] font-bold flex-shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden">
                <span className="text-sm font-semibold text-[color:var(--text-primary)] whitespace-nowrap text-ellipsis">{user?.name}</span>
                <span className="text-xs text-[color:var(--sidebar-text-active)] uppercase tracking-wider">{user?.role}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button onClick={logout} className="text-[color:var(--sidebar-text)] hover:text-[color:var(--danger)] p-2 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
