import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppShell = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    // ✅ h-screen + overflow-hidden: viewport-locked shell — sidebar can NEVER scroll away
    <div className="flex h-screen overflow-hidden bg-[color:var(--bg-base)] font-sans">
      
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation — full height, never scrolls */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex-shrink-0
      `}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed}
          onMobileClose={() => setIsMobileOpen(false)}
        />
      </div>

      {/* Main Content Pane — fills remaining width */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar 
          isCollapsed={isSidebarCollapsed} 
          toggleSidebar={() => {
            // On mobile: toggle the drawer. On desktop: collapse the sidebar.
            if (window.innerWidth < 1024) {
              setIsMobileOpen(!isMobileOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }} 
        />
        
        {/* ✅ Only THIS div scrolls, not the whole page */}
        <main className="flex-1 overflow-y-auto p-6 bg-[color:var(--bg-base)]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppShell;
