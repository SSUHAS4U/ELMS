import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import useThemeStore from '../hooks/useThemeStore';
import { Mail, Lock, KeyRound, ArrowRight, Moon, Sun, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { HRArtifactScene, Logo } from '../components/ui';
import Button from '../components/ui/Button';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const success = await loginWithPassword(email, password);
    if (success) navigate('/dashboard');
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    const success = await sendOtp(email);
    if (success) { setOtpSent(true); setResendTimer(60); toast.success('Secure code sent to your email'); }
  };
  const handleResendOtp = async () => {
    if (resendTimer > 0 || !email) return;
    const success = await sendOtp(email);
    if (success) { setResendTimer(60); toast.success('New code sent'); }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const success = await loginWithOtp(email, otp);
    if (success) navigate('/dashboard');
  };

  const inputBase =
    'w-full h-11 pl-10 pr-4 bg-base border border-line rounded-[var(--radius-sm)] text-content placeholder:text-content-tertiary ' +
    'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

  return (
    <div className="flex min-h-dvh bg-base text-content overflow-hidden">
      {/* LEFT — animated HR artifact scene */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center border-r border-line overflow-hidden">
        <HRArtifactScene />
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/30 to-transparent z-10 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
          className="z-20 absolute bottom-12 left-12 right-12"
        >
          <Logo size={40} wordmark className="mb-5" />
          <h1 className="font-display text-4xl font-bold tracking-tight leading-tight mb-3">
            People operations,<br /><span className="text-gradient">beautifully orchestrated.</span>
          </h1>
          <p className="text-content-secondary max-w-md text-[15px] leading-relaxed">
            Track leave, approvals, attendance and payroll across your whole organization — in one calm, real-time workspace.
          </p>
          <div className="flex items-center gap-2 mt-5 text-xs text-content-secondary">
            <ShieldCheck className="w-4 h-4 text-accent" /> Enterprise-grade security · OTP &amp; SSO ready
          </div>
        </motion.div>
      </div>

      {/* RIGHT — auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-8 relative bg-surface bg-aurora">
        <button
          onClick={toggle}
          className="absolute top-6 right-6 w-10 h-10 grid place-items-center rounded-full border border-line hover:bg-overlay text-content-secondary hover:text-content transition-colors z-10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          <div className="lg:hidden mb-8 flex justify-center"><Logo size={40} wordmark /></div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-tight mb-1.5">Welcome back</h2>
            <p className="text-content-secondary text-sm">Sign in to your Obsidian ELMS workspace.</p>
          </div>

          {/* Tabs */}
          <div className="relative flex p-1 bg-overlay rounded-[var(--radius-sm)] mb-6">
            {['password', 'otp'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative flex-1 py-2 text-sm font-medium rounded-[calc(var(--radius-sm)-2px)] transition-colors z-10 ${tab === t ? 'text-content' : 'text-content-secondary hover:text-content'}`}
              >
                {tab === t && (
                  <motion.span layoutId="login-tab" className="absolute inset-0 bg-surface rounded-[calc(var(--radius-sm)-2px)] shadow-sm -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
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
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" className={inputBase} placeholder="name@company.com" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-content-secondary">Password</label>
                    <a href="#" className="text-xs text-content-tertiary hover:text-accent transition-colors">Forgot?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={inputBase + ' pr-16'} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-content-tertiary hover:text-accent">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <Button type="submit" loading={loading} size="lg" className="w-full">Log in <ArrowRight className="w-4 h-4" /></Button>
              </motion.form>
            ) : (
              <motion.form key="otp" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.div key="email" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                      <label className="block text-sm font-medium text-content-secondary mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-tertiary" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputBase} placeholder="name@company.com" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="code" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-[color:var(--success)]/10 text-[color:var(--success)] text-xs font-semibold rounded-full mb-3">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Code dispatched
                      </div>
                      <label className="block text-sm font-medium text-content-secondary mb-1.5">One-time password</label>
                      <input type="text" inputMode="numeric" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} required maxLength={6} autoComplete="one-time-code"
                        className="w-full tracking-[0.5em] text-center py-3.5 bg-base border-2 border-accent/40 rounded-[var(--radius)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 text-content text-xl font-bold shadow-glow" placeholder="------" />
                      <p className="text-xs text-center text-content-secondary mt-3">Sent to <span className="font-semibold text-content">{email}</span></p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button type="submit" loading={loading} size="lg" variant={otpSent ? 'primary' : 'secondary'} className="w-full">
                  {otpSent ? 'Verify code' : 'Send code'} <ArrowRight className="w-4 h-4" />
                </Button>
                {otpSent && (
                  <div className="text-center">
                    <button type="button" disabled={loading || resendTimer > 0} onClick={handleResendOtp}
                      className="text-sm font-medium text-content-secondary hover:text-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Didn't get it? Resend"}
                    </button>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          <div className="my-7 flex items-center gap-3 text-content-tertiary">
            <span className="h-px flex-1 bg-line" /><span className="text-xs">or continue with</span><span className="h-px flex-1 bg-line" />
          </div>

          <button
            onClick={() => (window.location.href = `${API_BASE}/auth/google`)}
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-[var(--radius-sm)] bg-base border border-line text-content font-medium hover:border-accent/40 hover:bg-overlay transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Google Workspace
          </button>

          <p className="text-center text-xs text-content-tertiary mt-8">
            Protected by OTP &amp; encrypted sessions · © 2026 Obsidian ELMS
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
