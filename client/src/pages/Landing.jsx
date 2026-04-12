import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, UserCog, Moon, Sun } from 'lucide-react';
import useThemeStore from '../hooks/useThemeStore';
import Background3D from '../components/3d/Background3D';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-[color:var(--bg-base)] relative overflow-x-hidden font-sans">
      {/* Navbar Minimal */}
      <nav className="fixed top-0 w-full z-50 px-8 py-4 backdrop-blur-md border-b border-[color:var(--border-subtle)]/50 flex justify-between items-center bg-[color:var(--bg-base)]/80">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[color:var(--accent-primary)]"></div>
          <span className="font-bold text-xl tracking-tight text-[color:var(--text-primary)]">Obsidian ELMS</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggle}
            className="p-2 rounded-full border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-overlay)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded font-medium text-sm border border-[color:var(--accent-primary)] text-[color:var(--text-primary)] hover:bg-[color:var(--accent-primary)]/10 transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6">
        <div className="absolute inset-0 z-0">
          <Background3D />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-base)] to-transparent pointer-events-none"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center max-w-3xl"
        >
          <span className="inline-block py-1 px-3 mb-6 rounded-full border border-[color:var(--accent-primary)]/50 bg-[color:var(--accent-glow)] text-[color:var(--accent-primary)] text-sm font-medium tracking-wide">
            v2.0 Production Ready
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[color:var(--text-primary)] mb-8 tracking-tighter leading-tight">
            Manage your team's time <br className="hidden md:block"/> 
            <span className="text-[color:var(--accent-primary)] font-black">seamlessly.</span>
          </h1>
          <p className="text-lg text-[color:var(--text-secondary)] mb-10 max-w-xl mx-auto">
            A meticulously crafted Employee Leave Management System offering real-time requests, strictly enforced RBAC, and beautiful enterprise analytics.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="group px-8 py-3 rounded text-white bg-[color:var(--accent-primary)] font-bold text-lg hover:bg-[color:var(--accent-muted)] transition-all flex justify-center items-center gap-2 mx-auto"
          >
            Enter Platform <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10 bg-[color:var(--bg-base)]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[color:var(--text-primary)] mb-4">Built for Enterprise</h2>
          <p className="text-[color:var(--text-secondary)] max-w-xl mx-auto">Everything your organization needs to manage employee time off, attendance, and compliance in one platform.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: ShieldCheck, title: "Role-Based Access", desc: "Native MongoDB auth restricting flows to Employees, HR, and Admin hierarchies reliably without third-party dependence." },
            { icon: Clock, title: "Swipe & Timesheets", desc: "Monitor regularizations, missing swipe cards, and average working hours with real precision." },
            { icon: UserCog, title: "Automated Routing", desc: "Leaves are dynamically routed to specific HR managers with instant Socket.io approvals." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="p-8 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] hover:border-[color:var(--accent-primary)]/50 transition-colors shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-[color:var(--accent-glow)] flex items-center justify-center mb-6 text-[color:var(--accent-primary)]">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-[color:var(--text-primary)] mb-3">{feature.title}</h3>
              <p className="text-[color:var(--text-secondary)] leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[color:var(--border-subtle)] py-8 px-6 text-center bg-[color:var(--bg-surface)]">
        <p className="text-sm text-[color:var(--text-secondary)]">© 2026 Obsidian ELMS. Built with precision.</p>
      </footer>
    </div>
  );
};

export default Landing;
