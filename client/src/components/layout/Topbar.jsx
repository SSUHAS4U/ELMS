import { Menu, Search, Bell, Moon, Sun, User as UserIcon } from 'lucide-react';
import useThemeStore from '../../hooks/useThemeStore';
import useAuthStore from '../../hooks/useAuthStore';

const Topbar = ({ toggleSidebar, isCollapsed }) => {
  const { theme, toggle } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[color:var(--bg-surface)] border-b border-[color:var(--border-subtle)] sticky top-0 z-30 transition-colors">
      
      {/* Left side: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="max-w-md w-full hidden md:block">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[color:var(--text-secondary)] group-focus-within:text-[color:var(--accent-primary)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything... (Cmd + K)" 
              className="w-full bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)] transition-all placeholder:text-[color:var(--text-secondary)]" 
            />
          </div>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* Alerts Bell */}
        <button className="relative p-2 text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-overlay)] hover:text-[color:var(--text-primary)] rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[color:var(--danger)] rounded-full border-2 border-[color:var(--bg-surface)] animate-pulse"></span>
        </button>

        {/* Theme Toggle Pill */}
        <button 
          onClick={toggle}
          className="flex items-center justify-center p-2 rounded-full border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-overlay)] text-[color:var(--text-secondary)] transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Spacer */}
        <div className="w-[1px] h-6 bg-[color:var(--border-subtle)]"></div>

        {/* User Menu Trigger stub */}
        <button className="flex items-center gap-2 hover:bg-[color:var(--bg-overlay)] p-1.5 rounded-lg transition-colors">
           <div className="w-8 h-8 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] flex items-center justify-center text-[color:var(--accent-primary)] font-bold shadow-sm">
             {user?.name?.charAt(0) || 'E'}
           </div>
           <div className="hidden md:flex flex-col text-left">
             <span className="text-xs font-semibold text-[color:var(--text-primary)] -mb-1">{user?.name}</span>
             <span className="text-[10px] text-[color:var(--text-secondary)] uppercase">{user?.role}</span>
           </div>
        </button>
      </div>

    </header>
  );
};

export default Topbar;
