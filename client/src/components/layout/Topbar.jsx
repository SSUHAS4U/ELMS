import { Menu, Search, Bell, Moon, Sun } from 'lucide-react';
import useThemeStore from '../../hooks/useThemeStore';
import useAuthStore from '../../hooks/useAuthStore';

const Topbar = ({ toggleSidebar }) => {
  const { theme, toggle } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 glass border-b border-line/70 sticky top-0 z-30">
      {/* Left: mobile toggle + search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary hover:text-content hover:bg-overlay transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="max-w-md w-full hidden md:block">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary group-focus-within:text-accent transition-colors" />
            <input
              type="text"
              placeholder="Search people, leaves, reports…"
              className="w-full h-10 bg-base/70 border border-line text-content text-sm rounded-[var(--radius-sm)] pl-10 pr-16 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all placeholder:text-content-tertiary"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 text-[10px] font-mono text-content-tertiary border border-line rounded px-1.5 py-0.5">⌘K</kbd>
          </div>
        </div>
      </div>

      {/* Right: actions + profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button className="relative w-10 h-10 grid place-items-center text-content-secondary hover:bg-overlay hover:text-content rounded-full transition-colors" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-[color:var(--danger)] rounded-full ring-2 ring-[color:var(--bg-surface)]" />
        </button>

        <button
          onClick={toggle}
          className="w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-line mx-1 hidden sm:block" />

        <button className="flex items-center gap-2.5 hover:bg-overlay p-1 pr-2.5 rounded-full transition-colors">
          <div className="w-8 h-8 rounded-full grid place-items-center font-bold text-sm text-accent bg-[color:var(--accent-glow)] ring-1 ring-inset ring-accent/20">
            {user?.name?.charAt(0)?.toUpperCase() || 'E'}
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-xs font-semibold text-content">{user?.name}</span>
            <span className="text-[10px] text-content-secondary uppercase tracking-wider">{user?.role}</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
