import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../hooks/useAuthStore';
import useThemeStore from '../hooks/useThemeStore';
import { Mail, Lock, KeyRound, Loader2, ArrowRight, Moon, Sun, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Background3D from '../components/3d/Background3D';

const Login = () => {
  const [tab, setTab] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();
  const { loginWithPassword, sendOtp, loginWithOtp, loading, error } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
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
    if (success) {
      setOtpSent(true);
      setResendTimer(60);
      toast.success('OTP sent securely to your email!');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !email) return;
    const success = await sendOtp(email);
    if (success) {
      setResendTimer(60);
      toast.success('New OTP sent to your email!');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const success = await loginWithOtp(email, otp);
    if (success) navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[color:var(--bg-base)]">
      {/* LEFT: 3D Aesthetic Half */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center border-r border-[color:var(--border-subtle)] overflow-hidden">
        <Background3D />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--bg-base)]/80 to-transparent z-10" />
        <div className="z-20 p-12 text-left absolute bottom-12 left-0 right-0">
          <h1 className="text-4xl font-bold text-[color:var(--text-primary)] mb-4 tracking-tight">
            Obsidian <span className="text-[color:var(--accent-primary)]">ELMS</span>
          </h1>
          <p className="text-[color:var(--text-secondary)] max-w-md text-lg">
            Manage your team's schedule, track time off, and maintain operational flow seamlessly through an enterprise-grade platform.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 z-20 bg-[color:var(--bg-surface)] relative">
        {/* Theme toggle */}
        <button 
          onClick={toggle}
          className="absolute top-6 right-6 p-2 rounded-full border border-[color:var(--border-subtle)] hover:bg-[color:var(--bg-overlay)] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[color:var(--text-primary)] mb-2">Welcome back</h2>
            <p className="text-[color:var(--text-secondary)]">Please enter your details to sign in.</p>
          </div>

          {/* Custom Tabs */}
          <div className="flex p-1 bg-[color:var(--bg-overlay)] rounded-lg mb-6">
            <button
              onClick={() => setTab('password')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === 'password' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}`}
            >
              Password
            </button>
            <button
              onClick={() => setTab('otp')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${tab === 'otp' ? 'bg-[color:var(--bg-surface)] text-[color:var(--text-primary)] shadow-sm' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'}`}
            >
              OTP
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[color:var(--danger)]/10 text-[color:var(--danger)] text-sm p-3 rounded-md mb-6 border border-[color:var(--danger)]/20">
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {tab === 'password' ? (
              <motion.form key="password-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[color:var(--text-secondary)]" />
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-md focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)] transition-colors text-[color:var(--text-primary)]" placeholder="name@company.com or username" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-[color:var(--text-secondary)]" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-4 py-2 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-md focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)] transition-colors text-[color:var(--text-primary)]" placeholder="••••••••" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <a href="#" className="text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors">Forgot password?</a>
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-[color:var(--accent-primary)] text-black font-semibold hover:bg-[color:var(--accent-muted)] transition-colors">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log In'}
                </button>
              </motion.form>
            ) : (
              <motion.form key="otp-form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                <div className="text-center mb-6">
                  {otpSent && <div className="inline-flex items-center gap-2 px-3 py-1 bg-[color:var(--success)]/10 text-[color:var(--success)] text-xs font-semibold rounded-full mb-4"><CheckCircle2 className="w-3.5 h-3.5" /> Code Dispatched</div>}
                </div>
                
                <AnimatePresence mode="wait">
                  {!otpSent ? (
                    <motion.div key="email-stage" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                      <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-[color:var(--text-secondary)]" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] rounded-md focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-1 focus:ring-[color:var(--accent-primary)] text-[color:var(--text-primary)]" placeholder="name@company.com" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="otp-stage" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                      <label className="block text-sm font-medium text-[color:var(--text-secondary)] mb-1">One Time Password</label>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-3 h-5 w-5 text-[color:var(--text-secondary)]" />
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" className="w-full tracking-[0.5em] text-center pl-10 pr-4 py-3 bg-[color:var(--bg-base)] border-2 border-[color:var(--accent-primary)]/50 rounded-lg focus:outline-none focus:border-[color:var(--accent-primary)] focus:ring-2 focus:ring-[color:var(--accent-primary)]/20 transition-all text-[color:var(--text-primary)] text-xl font-bold shadow-[0_0_15px_rgba(0,255,135,0.05)]" placeholder="------" />
                      </div>
                      <p className="text-xs text-center text-[color:var(--text-secondary)] mt-3">Code sent to <span className="font-semibold text-[color:var(--text-primary)]">{email}</span></p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-[color:var(--bg-elevated)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] font-semibold hover:border-[color:var(--accent-primary)] hover:text-[color:var(--accent-primary)] transition-colors">
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (otpSent ? 'Verify Code' : 'Send Code')}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </button>

                {otpSent && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      disabled={loading || resendTimer > 0}
                      onClick={handleResendOtp}
                      className="text-sm font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive the code? Resend"}
                    </button>
                  </div>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Google OAuth Stub */}
          <div className="mt-8 pt-6 border-t border-[color:var(--border-subtle)]">
            <button 
              onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-md bg-[color:var(--bg-base)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] font-medium hover:bg-[color:var(--bg-overlay)] transition-colors group"
            >
              Google Workspace
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
