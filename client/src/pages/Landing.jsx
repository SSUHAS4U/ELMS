import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Clock, UserCog, Moon, Sun, CalendarRange,
  BarChart3, Wallet, Users, Zap, CheckCircle2, Sparkles,
} from 'lucide-react';
import useThemeStore from '../hooks/useThemeStore';
import { HRArtifactScene, Logo } from '../components/ui';
import Button from '../components/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

const features = [
  { icon: CalendarRange, title: 'Smart Leave Workflow', desc: 'Apply, route and approve leave in real time. Balances, accruals and holidays calculated automatically.', span: 'md:col-span-2' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Native RBAC isolating Employee, HR and Admin flows — no third-party identity dependency.' },
  { icon: Clock, title: 'Swipe & Timesheets', desc: 'Track attendance, regularizations and average hours with precision.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Enterprise dashboards updating instantly over WebSockets.', span: 'md:col-span-2' },
];

const roles = [
  { icon: Users, label: 'Employees', points: ['Apply for leave in seconds', 'Track balances & payslips', 'View swipe & timesheet data'] },
  { icon: UserCog, label: 'HR Managers', points: ['One-click approvals', 'Team leave calendar', 'Holiday & policy control'] },
  { icon: ShieldCheck, label: 'Admins', points: ['Org & department setup', 'User management & RBAC', 'Full audit trail'] },
];

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useThemeStore();

  return (
    <div className="min-h-dvh bg-base text-content relative overflow-x-hidden font-sans">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-3.5 glass border-b border-line/60 flex justify-between items-center">
        <Logo size={32} wordmark />
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={toggle}
            className="w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors"
            aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Sign in <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[92vh] grid lg:grid-cols-2 items-center gap-8 pt-24 pb-16 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-2 py-1.5 px-3 mb-6 rounded-full border border-accent/40 bg-[color:var(--accent-glow)] text-accent text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> v2.0 · Production Ready
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6">
            Manage your team's<br />time off, <span className="text-gradient">seamlessly.</span>
          </h1>
          <p className="text-lg text-content-secondary mb-9 max-w-lg leading-relaxed">
            A meticulously crafted Employee Leave Management System — real-time requests, enforced RBAC, attendance tracking and beautiful enterprise analytics.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => navigate('/login')} className="group">
              Enter platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Book a demo</Button>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-content-secondary">
            {['Real-time approvals', 'OTP & SSO login', 'Audit-ready'].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {t}</span>
            ))}
          </div>
        </motion.div>

        {/* Animated artifact scene */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }}
          className="relative h-[420px] lg:h-[560px] rounded-[var(--radius-lg)] overflow-hidden border border-line glass-panel">
          <HRArtifactScene />
        </motion.div>
      </section>

      {/* Stats band */}
      <section className="px-6 sm:px-10 max-w-8xl mx-auto -mt-4 mb-8">
        <motion.div {...fadeUp(0)} className="glass-panel grid grid-cols-2 md:grid-cols-4 divide-x divide-line/60">
          {[['99.9%', 'Uptime SLA'], ['<200ms', 'Approval latency'], ['248+', 'Employees managed'], ['12k+', 'Leaves processed']].map(([v, l]) => (
            <div key={l} className="p-6 text-center">
              <div className="font-display text-3xl font-bold text-content tabular-nums">{v}</div>
              <div className="text-sm text-content-secondary mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features bento */}
      <section className="py-20 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3">
            <Zap className="w-3.5 h-3.5" /> Everything in one place
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for the whole organization</h2>
          <p className="text-content-secondary max-w-xl mx-auto">From a single leave request to company-wide compliance — handled in one calm workspace.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i * 0.08)}
              className={`glass-panel hover-lift p-7 ${f.span || ''}`}>
              <div className="w-12 h-12 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center mb-5 text-accent ring-1 ring-inset ring-accent/15">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2.5">{f.title}</h3>
              <p className="text-content-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.h2 {...fadeUp(0)} className="font-display text-3xl md:text-4xl font-bold tracking-tight text-center mb-12">One platform, three perspectives</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map((r, i) => (
            <motion.div key={r.label} {...fadeUp(i * 0.1)} className="glass-panel hover-lift p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15"><r.icon className="w-5 h-5" /></div>
                <h3 className="font-display text-lg font-bold">{r.label}</h3>
              </div>
              <ul className="space-y-3">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-content-secondary text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div {...fadeUp(0)} className="relative max-w-4xl mx-auto rounded-[var(--radius-lg)] overflow-hidden glass-panel bg-aurora bg-grid p-12 text-center">
          <Wallet className="w-10 h-10 text-accent mx-auto mb-5" />
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to streamline your people ops?</h2>
          <p className="text-content-secondary max-w-lg mx-auto mb-8">Sign in to your Obsidian ELMS workspace and bring clarity to leave, attendance and approvals.</p>
          <Button size="lg" onClick={() => navigate('/login')} className="group mx-auto">
            Get started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-10 px-6 sm:px-10 max-w-8xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo size={28} wordmark />
        <p className="text-sm text-content-secondary">© 2026 Obsidian ELMS · Built with precision.</p>
      </footer>
    </div>
  );
};

export default Landing;
