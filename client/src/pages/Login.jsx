import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import useThemeStore from '../hooks/useThemeStore';
import {
  Mail, Lock, ArrowRight, Moon, Sun, CheckCircle2, ShieldCheck, AlertCircle,
  CalendarCheck, Users, Clock, Plane, TrendingUp, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../components/ui';
import Button from '../components/ui/Button';

/* ---------- Left showcase pieces ---------- */
const FloatChip = ({ icon: Icon, label, sub, tone = 'accent', className, delay = 0 }) => {
  const color = tone === 'success' ? 'var(--success)' : tone === 'warning' ? 'var(--warning)' : tone === 'info' ? 'var(--info)' : 'var(--accent-primary)';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute glass-panel px-3.5 py-2.5 flex items-center gap-2.5 ${className}`}
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

const Showcase = () => (
  <div className="relative w-full h-full overflow-hidden">
    {/* layered gradient mesh background */}
    <div className="absolute inset-0" style={{
      background: `
        radial-gradient(40% 50% at 15% 18%, var(--aurora-1) 0%, transparent 60%),
        radial-gradient(36% 44% at 88% 12%, var(--aurora-3) 0%, transparent 60%),
        radial-gradient(50% 55% at 78% 92%, var(--aurora-2) 0%, transparent 62%),
        linear-gradient(160deg, var(--bg-elevated), var(--bg-base) 70%)`,
    }} />
    <div className="absolute inset-0 bg-grid opacity-70" />

    {/* content */}
    <div className="relative z-10 h-full flex flex-col justify-between p-12">
      {/* top: brand */}
      <div className="flex items-center justify-between">
        <Logo size={38} wordmark />
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/30 bg-[color:var(--accent-glow)] text-accent text-[11px] font-semibold">
          <Sparkles className="w-3 h-3" /> v2.0
        </span>
      </div>

      {/* center: dashboard preview mockup */}
      <div className="relative my-8 flex-1 grid place-items-center">
        <motion.div
          initial={{ opacity: 0, y: 24, rotateX: 8 }} animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel w-[20rem] max-w-full p-5 shadow-glass"
          style={{ perspective: 800 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-content-tertiary font-semibold">Today</div>
              <div className="font-display text-lg font-bold text-content">Team overview</div>
            </div>
            <span className="pill pill-approved"><TrendingUp className="w-3 h-3" /> +4%</span>
          </div>

          {/* mini stat tiles */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[['96%', 'Present'], ['6', 'On leave'], ['3', 'Pending']].map(([v, l]) => (
              <div key={l} className="rounded-[var(--radius-sm)] bg-base/60 border border-line p-2.5 text-center">
                <div className="font-display text-base font-bold text-content tabular-nums">{v}</div>
                <div className="text-[10px] text-content-secondary">{l}</div>
              </div>
            ))}
          </div>

          {/* approval row */}
          <div className="rounded-[var(--radius-sm)] bg-base/60 border border-line p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[color:var(--accent-glow)] grid place-items-center text-accent text-xs font-bold">A</div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-content">Annual Leave</div>
                  <div className="text-[10px] text-content-secondary">3 days · Apr 12–14</div>
                </div>
              </div>
              <span className="pill pill-approved"><CheckCircle2 className="w-3 h-3" /> Approved</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-overlay overflow-hidden">
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, var(--accent-bright), var(--accent-primary))' }}
                initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.6, delay: 1, ease: 'easeInOut' }} />
            </div>
          </div>
        </motion.div>

        {/* floating chips around the mockup */}
        <FloatChip icon={CalendarCheck} label="14 days left" sub="Leave balance" tone="accent" delay={0.5} className="left-0 top-2" />
        <FloatChip icon={Users} label="248 employees" sub="Active today" tone="info" delay={0.8} className="right-0 top-10" />
        <FloatChip icon={Clock} label="On time" sub="Swipe 09:02" tone="success" delay={1.1} className="left-2 bottom-4" />
        <FloatChip icon={Plane} label="6 on leave" sub="This week" tone="warning" delay={1.4} className="right-2 bottom-0" />
      </div>

      {/* bottom: headline */}
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight leading-[1.1] mb-3">
          People operations,<br /><span className="text-gradient">beautifully orchestrated.</span>
        </h1>
        <p className="text-content-secondary max-w-md text-[15px] leading-relaxed mb-5">
          Track leave, approvals, attendance and payroll across your whole organization — in one calm, real-time workspace.
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-content-secondary">
          {['Real-time approvals', 'OTP & SSO login', 'Audit-ready'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {t}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Page ---------- */
const Login = () => {
  const [tab, setTab] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const { loginWithPassword, sendOtp, loginWithOtp, loading, error } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePasswordLogin = async (e) => { e.preventDefault(); if (await loginWithPassword(email, password)) navigate('/dashboard'); };
  const handleSendOtp = async (e) => {
    e.preventDefault(); if (!email) return;
    if (await sendOtp(email)) { setOtpSent(true); setResendTimer(60); toast.success('Secure code sent to your email'); }
  };
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !email) return;
    if (await sendOtp(email)) { setResendTimer(60); toast.success('New code sent'); }
  };
  const handleVerifyOtp = async (e) => { e.preventDefault(); if (await loginWithOtp(email, otp)) navigate('/dashboard'); };

  const inputBase = 'w-full h-12 pl-11 pr-4 bg-base border border-line rounded-[var(--radius)] text-content placeholder:text-content-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

  return (
    <div className="flex min-h-dvh bg-base text-content overflow-hidden">
      {/* LEFT — rich showcase */}
      <div className="hidden lg:block lg:w-[52%] relative border-r border-line">
        <Showcase />
      </div>

      {/* RIGHT — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative bg-surface">
        {/* subtle ambient glow on form side */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-50" style={{ background: 'var(--accent-glow)' }} />

        <button onClick={toggle} aria-label="Toggle theme"
          className="absolute top-6 right-6 w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors z-10">
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[24rem] relative z-10">
          <div className="lg:hidden mb-8 flex justify-center"><Logo size={40} wordmark /></div>

          <div className="mb-7">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-4 rounded-full bg-[color:var(--accent-glow)] text-accent text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure sign-in
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-1.5">Welcome back</h2>
            <p className="text-content-secondary">Sign in to your Obsidian ELMS workspace.</p>
          </div>

          {/* Tabs */}
          <div className="relative flex p-1 bg-overlay rounded-[var(--radius)] mb-6">
            {['password', 'otp'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`relative flex-1 py-2.5 text-sm font-semibold rounded-[calc(var(--radius)-3px)] transition-colors z-10 ${tab === t ? 'text-content' : 'text-content-secondary hover:text-content'}`}>
                {tab === t && <motion.span layoutId="login-tab" className="absolute inset-0 bg-surface rounded-[calc(var(--radius)-3px)] shadow-sm -z-10" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                {t === 'password' ? 'Password' : 'Email OTP'}
              </button>
            ))}
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 bg-[color:var(--danger)]/10 text-[color:var(--danger)] text-sm p-3 rounded-[var(--radius-sm)] mb-5 border border-[color:var(--danger)]/20">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'password' ? (
              <motion.form key="pw" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-content-secondary mb-1.5">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className={inputBase} placeholder="name@company.com" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-content-secondary">Password</label>
                    <a href="#" className="text-xs text-content-tertiary hover:text-accent transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={inputBase + ' pr-16'} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-content-tertiary hover:text-accent">{showPw ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
                <Button type="submit" loading={loading} size="lg" className="w-full mt-1">Log in <ArrowRight className="w-4 h-4" /></Button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.div key="email" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                      <label className="block text-sm font-medium text-content-secondary mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputBase} placeholder="name@company.com" />
                      </div>
                      <p className="text-xs text-content-tertiary mt-2">We'll email you a 6-digit one-time code.</p>
                    </motion.div>
                  ) : (
                    <motion.div key="code" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[color:var(--success)]/10 text-[color:var(--success)] text-xs font-semibold rounded-full mb-3"><CheckCircle2 className="w-3.5 h-3.5" /> Code dispatched</div>
                      <label className="block text-sm font-medium text-content-secondary mb-1.5">One-time password</label>
                      <input type="text" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required maxLength={6} autoComplete="one-time-code"
                        className="w-full tracking-[0.5em] text-center py-3.5 bg-base border-2 border-accent/40 rounded-[var(--radius)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-content text-xl font-bold shadow-glow" placeholder="------" />
                      <p className="text-xs text-center text-content-secondary mt-3">Sent to <span className="font-semibold text-content">{email}</span></p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button type="submit" loading={loading} size="lg" className="w-full">{otpSent ? 'Verify code' : 'Send code'} <ArrowRight className="w-4 h-4" /></Button>
                {otpSent && (
                  <div className="text-center">
                    <button type="button" disabled={loading || resendTimer > 0} onClick={handleResendOtp} className="text-sm font-medium text-content-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't get it? Resend"}
                    </button>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* trust strip — replaces the removed Google button */}
          <div className="mt-7 pt-6 border-t border-line grid grid-cols-3 gap-3 text-center">
            {[[ShieldCheck, 'Encrypted'], [Lock, 'OTP secured'], [CheckCircle2, 'RBAC']].map(([Icon, label]) => (
              <div key={label} className="flex flex-col items-center gap-1.5">
                <span className="w-9 h-9 rounded-[var(--radius-sm)] grid place-items-center bg-overlay text-accent"><Icon className="w-4 h-4" /></span>
                <span className="text-[11px] text-content-secondary">{label}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-content-tertiary mt-7">
            Need access? Contact your administrator · © 2026 Obsidian ELMS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
