import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Clock, UserCog, Moon, Sun, CalendarRange,
  BarChart3, Wallet, Users, Zap, CheckCircle2, Sparkles, Plane, CalendarCheck,
  TrendingUp, FileText, Send, Star, Quote,
} from 'lucide-react';
import useThemeStore from '../hooks/useThemeStore';
import { Logo } from '../components/ui';
import Button from '../components/ui/Button';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
});

/* ---------------- Animated hero preview ---------------- */
const FloatChip = ({ icon: Icon, label, sub, tone = 'accent', className, delay = 0 }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'warning' ? 'var(--warning)' : tone === 'info' ? 'var(--info)' : 'var(--accent-primary)';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute glass-panel px-3.5 py-2.5 flex items-center gap-2.5 z-20 ${className}`}
    >
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut' }} className="contents">
        <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-semibold text-content whitespace-nowrap">{label}</span>
          <span className="block text-[10px] text-content-secondary whitespace-nowrap">{sub}</span>
        </span>
      </motion.div>
    </motion.div>
  );
};

const HeroPreview = () => {
  const bars = [42, 58, 35, 70, 52, 84, 64];
  return (
    <div className="relative w-full">
      {/* glow */}
      <div className="pointer-events-none absolute -inset-8 rounded-[3rem] blur-3xl opacity-60" style={{ background: 'radial-gradient(60% 60% at 60% 30%, var(--accent-glow), transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative glass-panel bg-grid p-5 sm:p-6"
      >
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-glow animate-pulse" />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-content-tertiary font-semibold">Live workspace</div>
              <div className="font-display text-lg font-bold text-content">Team overview</div>
            </div>
          </div>
          <span className="pill pill-approved"><TrendingUp className="w-3 h-3" /> +4.2%</span>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[['248', 'Employees'], ['96%', 'Present'], ['14', 'Pending']].map(([v, l], i) => (
            <motion.div key={l} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              className="rounded-[var(--radius-sm)] bg-base/60 border border-line p-3 text-center">
              <div className="font-display text-xl font-bold text-content tabular-nums">{v}</div>
              <div className="text-[11px] text-content-secondary">{l}</div>
            </motion.div>
          ))}
        </div>

        {/* mini chart */}
        <div className="rounded-[var(--radius-sm)] bg-base/60 border border-line p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-content">Leave trend</span>
            <span className="text-[11px] text-content-tertiary">Last 7 days</span>
          </div>
          <div className="flex items-end gap-2 h-20">
            {bars.map((h, i) => (
              <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-md" style={{ background: i === 5 ? 'linear-gradient(var(--accent-bright), var(--accent-primary))' : 'var(--bg-overlay)' }} />
            ))}
          </div>
        </div>

        {/* approval row */}
        <div className="rounded-[var(--radius-sm)] bg-base/60 border border-line p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent text-xs font-bold">A</div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-content">Annual Leave</div>
                <div className="text-[11px] text-content-secondary">3 days · Apr 12–14</div>
              </div>
            </div>
            <span className="pill pill-approved"><CheckCircle2 className="w-3 h-3" /> Approved</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-overlay overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent-bright), var(--accent-primary))' }}
              initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.6, delay: 1.1, ease: 'easeInOut' }} />
          </div>
        </div>
      </motion.div>

      {/* floating chips */}
      <FloatChip icon={CalendarCheck} label="14 days left" sub="Leave balance" tone="accent" delay={0.7} className="-left-4 sm:-left-10 top-8" />
      <FloatChip icon={Wallet} label="Payslip ready" sub="March 2026" tone="info" delay={1.0} className="-right-3 sm:-right-8 top-24" />
      <FloatChip icon={Plane} label="6 on leave" sub="This week" tone="warning" delay={1.3} className="-left-3 sm:-left-8 bottom-10" />
    </div>
  );
};

/* ---------------- Data ---------------- */
const features = [
  { icon: CalendarRange, title: 'Smart Leave Workflow', desc: 'Apply, route and approve leave in real time. Balances, accruals and holidays calculated automatically.', span: 'md:col-span-2' },
  { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Native RBAC isolating Employee, HR and Admin flows — no third-party identity dependency.' },
  { icon: Clock, title: 'Swipe & Timesheets', desc: 'Track attendance, regularizations and average hours with precision.' },
  { icon: BarChart3, title: 'Live Analytics', desc: 'Enterprise dashboards updating instantly over WebSockets — leave trends, attendance, headcount.', span: 'md:col-span-2' },
];

const steps = [
  { icon: Send, title: 'Apply', desc: 'Employees request leave in seconds — half-days, multi-day, with live balance preview.' },
  { icon: CheckCircle2, title: 'Approve', desc: 'Managers get notified instantly and approve in one click, with email + in-app updates.' },
  { icon: BarChart3, title: 'Analyze', desc: 'HR and Admins see real-time dashboards, reports and a full audit trail.' },
];

const roles = [
  { icon: Users, label: 'Employees', points: ['Apply for leave in seconds', 'Track balances & payslips', 'View swipe & timesheet data'] },
  { icon: UserCog, label: 'HR Managers', points: ['One-click approvals', 'Team leave calendar', 'Holiday & policy control'] },
  { icon: ShieldCheck, label: 'Admins', points: ['Org & department setup', 'User management & RBAC', 'Full audit trail'] },
];

/* ---------------- Page ---------------- */
const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggle } = useThemeStore();
  const navLinks = [['Features', '#features'], ['How it works', '#how'], ['Roles', '#roles']];

  return (
    <div className="min-h-dvh bg-base text-content relative overflow-x-hidden font-sans">
      {/* Cohesive ambient backdrop — spans the whole page, fades softly (no hard edges or side gaps) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{
        background: `
          radial-gradient(1000px 560px at 12% 130px, var(--aurora-1), transparent 70%),
          radial-gradient(820px 480px at 90% 40px, var(--aurora-3), transparent 70%),
          radial-gradient(1200px 760px at 50% 94%, var(--aurora-2), transparent 75%)`,
      }} />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 px-4 sm:px-8 py-3 glass border-b border-line/60 flex justify-between items-center">
        <a href="#top" className="shrink-0"><Logo size={32} wordmark /></a>
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} className="px-3 py-2 text-sm font-medium text-content-secondary hover:text-content rounded-[var(--radius-sm)] hover:bg-overlay transition-colors">{label}</a>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={toggle} aria-label="Toggle theme"
            className="w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Sign in <ArrowRight className="w-4 h-4" /></Button>
        </div>
      </nav>

      {/* Hero — sits over the cohesive page backdrop */}
      <section id="top" className="relative pt-28 sm:pt-32 pb-16">
        <div className="px-6 sm:px-10 max-w-8xl mx-auto grid lg:grid-cols-2 items-center gap-12 lg:gap-8">
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
              <Button size="lg" onClick={() => navigate('/login')} className="group">Enter platform <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>Book a demo</Button>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-content-secondary">
              {['Real-time approvals', 'OTP & SSO login', 'Audit-ready'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {t}</span>
              ))}
            </div>
          </motion.div>

          <div className="relative lg:pl-6">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="px-6 sm:px-10 max-w-8xl mx-auto -mt-2 mb-12">
        <motion.div {...fadeUp(0)} className="glass-panel grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-line/60">
          {[['99.9%', 'Uptime SLA'], ['<200ms', 'Approval latency'], ['248+', 'Employees managed'], ['12k+', 'Leaves processed']].map(([v, l]) => (
            <div key={l} className="p-6 text-center">
              <div className="font-display text-3xl font-bold text-gradient tabular-nums">{v}</div>
              <div className="text-sm text-content-secondary mt-1">{l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 py-20 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3"><Zap className="w-3.5 h-3.5" /> Everything in one place</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for the whole organization</h2>
          <p className="text-content-secondary max-w-xl mx-auto text-lg">From a single leave request to company-wide compliance — handled in one calm workspace.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={f.title} {...fadeUp(i * 0.08)} className={`group glass-panel hover-lift p-7 relative overflow-hidden ${f.span || ''}`}>
              <div className="pointer-events-none absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" style={{ background: 'var(--accent-glow)' }} />
              <div className="w-12 h-12 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center mb-5 text-accent ring-1 ring-inset ring-accent/15"><f.icon className="w-6 h-6" /></div>
              <h3 className="font-display text-xl font-bold mb-2.5">{f.title}</h3>
              <p className="text-content-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-24 py-20 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3"><Send className="w-3.5 h-3.5" /> How it works</div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Three steps, zero friction</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5 relative">
          {steps.map((s, i) => (
            <motion.div key={s.title} {...fadeUp(i * 0.12)} className="glass-panel hover-lift p-7 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15"><s.icon className="w-5 h-5" /></div>
                <span className="font-display text-4xl font-bold text-line">0{i + 1}</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-content-secondary leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="scroll-mt-24 py-16 px-6 sm:px-10 max-w-8xl mx-auto">
        <motion.h2 {...fadeUp(0)} className="font-display text-3xl md:text-5xl font-bold tracking-tight text-center mb-12">One platform, three perspectives</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map((r, i) => (
            <motion.div key={r.label} {...fadeUp(i * 0.1)} className="glass-panel hover-lift p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15"><r.icon className="w-5 h-5" /></div>
                <h3 className="font-display text-lg font-bold">{r.label}</h3>
              </div>
              <ul className="space-y-3">
                {r.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-content-secondary text-sm"><CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" /> {p}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial / social proof */}
      <section className="py-16 px-6 sm:px-10 max-w-5xl mx-auto">
        <motion.div {...fadeUp(0)} className="glass-panel bg-aurora p-10 sm:p-14 text-center relative overflow-hidden">
          <Quote className="w-10 h-10 text-accent mx-auto mb-5 opacity-80" />
          <p className="font-display text-2xl sm:text-3xl font-semibold leading-snug max-w-3xl mx-auto mb-6">
            “We replaced three spreadsheets and a chat channel with one calm workspace. Approvals went from days to <span className="text-gradient">seconds.</span>”
          </p>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-accent fill-[var(--accent-primary)]" />)}
          </div>
          <p className="text-sm text-content-secondary">People Operations Lead · 250-person engineering org</p>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div {...fadeUp(0)} className="relative max-w-4xl mx-auto rounded-[var(--radius-lg)] overflow-hidden glass-panel bg-aurora bg-grid p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--accent-glow)] grid place-items-center text-accent ring-1 ring-inset ring-accent/15 mx-auto mb-5"><Wallet className="w-6 h-6" /></div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to streamline your people ops?</h2>
          <p className="text-content-secondary max-w-lg mx-auto mb-8">Sign in to your Obsidian ELMS workspace and bring clarity to leave, attendance and approvals.</p>
          <Button size="lg" onClick={() => navigate('/login')} className="group mx-auto">Get started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-8xl mx-auto px-6 sm:px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Logo size={30} wordmark />
            <p className="text-sm text-content-secondary mt-3 max-w-xs">People operations, beautifully orchestrated.</p>
          </div>
          {[
            ['Product', ['Features', 'How it works', 'Roles', 'Sign in']],
            ['Company', ['About', 'Careers', 'Contact']],
            ['Legal', ['Privacy', 'Terms', 'Security']],
          ].map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-content mb-3 text-sm">{title}</h4>
              <ul className="space-y-2">
                {items.map((it) => <li key={it}><a href="#top" className="text-sm text-content-secondary hover:text-accent transition-colors">{it}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line/60">
          <div className="max-w-8xl mx-auto px-6 sm:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-content-secondary">
            <span>© 2026 Obsidian ELMS · Built with precision.</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-accent" /> Enterprise-grade security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
