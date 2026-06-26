import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Moon, Sun, Settings, LogOut, ChevronDown } from 'lucide-react';
import useThemeStore from '../../hooks/useThemeStore';
import useAuthStore from '../../hooks/useAuthStore';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const prettify = (seg) =>
  !seg ? 'Dashboard' : seg.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const Topbar = ({ toggleSidebar }) => {
  const { theme, toggle } = useThemeStore();
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const seg = pathname.split('/').filter(Boolean).pop();
  const title = seg === 'home' ? 'Dashboard' : prettify(seg);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 glass border-b border-line/70 sticky top-0 z-30">
      {/* Left: mobile menu + page context */}
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={toggleSidebar} aria-label="Toggle navigation"
          className="lg:hidden w-9 h-9 grid place-items-center rounded-[var(--radius-sm)] text-content-secondary hover:text-content hover:bg-overlay transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0 leading-tight">
          <h1 className="font-display text-base sm:text-lg font-semibold text-content truncate">{title}</h1>
          <p className="hidden sm:block text-xs text-content-secondary">{greeting()}, {user?.name?.split(' ')[0] || 'there'}</p>
        </div>
      </div>

      {/* Right: theme + profile menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button onClick={toggle} aria-label="Toggle theme"
          className="w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-line mx-1 hidden sm:block" />

        <div className="relative" ref={ref}>
          <button onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 hover:bg-overlay py-1 pl-1 pr-1.5 sm:pr-2.5 rounded-full transition-colors"
            aria-haspopup="menu" aria-expanded={menuOpen}>
            <span className="w-8 h-8 rounded-full grid place-items-center font-bold text-sm text-accent bg-[color:var(--accent-glow)] ring-1 ring-inset ring-accent/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            <span className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-content">{user?.name}</span>
              <span className="text-[10px] text-content-secondary uppercase tracking-wider">{user?.role}</span>
            </span>
            <ChevronDown className={`hidden md:block w-4 h-4 text-content-tertiary transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-56 glass-panel p-1.5 z-50 origin-top-right animate-[fade-up_0.18s_ease]">
              <div className="px-3 py-2.5 border-b border-line/60 mb-1">
                <div className="text-sm font-semibold text-content truncate">{user?.name}</div>
                <div className="text-xs text-content-secondary truncate">{user?.email}</div>
              </div>
              <Link to="/dashboard/settings" onClick={() => setMenuOpen(false)} role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-sm text-content hover:bg-overlay transition-colors">
                <Settings className="w-4 h-4 text-content-secondary" /> Settings
              </Link>
              <button onClick={() => { setMenuOpen(false); logout(); navigate('/login'); }} role="menuitem"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 transition-colors">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
