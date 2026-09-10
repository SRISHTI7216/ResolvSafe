import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { User, UserRole } from '../types';

interface AuthScreenProps {
  onSuccess: (user?: User) => void;
  onBackToLanding: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  onBackToLanding,
  initialMode = 'login',
}) => {
  const { login, register, switchRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  React.useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!password) {
        setError('Please enter a password.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your confirm password field.');
        return;
      }
    } else {
      if (!email.trim() || !password) {
        setError('Please enter both your email and password.');
        return;
      }
    }

    setLoading(true);
    try {
      let authedUser: User | undefined;
      if (mode === 'login') {
        authedUser = await login(email, password);
      } else {
        authedUser = await register(name, email, password, phone, role);
      }
      onSuccess(authedUser);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (roleType: UserRole) => {
    setError(null);
    if (mode === 'register') {
      const demoNames: Record<UserRole, string> = {
        user: 'Jordan Lee',
        agent: 'Samantha Hayes',
        admin: 'Director Morgan',
      };
      const demoEmails: Record<UserRole, string> = {
        user: `jordan.${Date.now().toString().slice(-4)}@resolvsafe.internal`,
        agent: `samantha.${Date.now().toString().slice(-4)}@resolvsafe.internal`,
        admin: `morgan.${Date.now().toString().slice(-4)}@resolvsafe.internal`,
      };
      setName(demoNames[roleType]);
      setEmail(demoEmails[roleType]);
      setPhone('+1 (555) 432-8910');
      setPassword('Password123!');
      setConfirmPassword('Password123!');
      setRole(roleType);
    } else {
      switchRole(roleType).then((authedUser) => {
        onSuccess(authedUser);
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Deep Branding Banner (matching screenshot 3.png) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#00288e] p-12 text-white overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCG3zolwQCeYfwVGnJRdTx-WEUTqejoMLO-NN_kg2CxRib87IOcbHveV1Q25U8G2KFFfA9kQnaBOKr6IWiW9bmr5QN8cvxhEYV3cTDYIL2Sx4D053Xxey3LJcmd1jguST98Wxf4NFXJ5NseMhTKJehJMqtIpRzaN_11lAyS6xKXRAc13L74snrWjCnVbqw5fC2BoaQUOjdT8zChOWRdG9wK3Y-_f60X5HqKeoLYCMDZ3Mz_TnIR-fNf')`,
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#001859] via-[#00288e]/90 to-[#00288e]/95" />

        {/* Brand Top */}
        <div className="relative z-10">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs hover:bg-white/20 transition-all mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Portal</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#00288e] shadow-lg">
              <span className="material-symbols-outlined text-[28px]">shield</span>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight">ResolvSafe</span>
              <div className="text-xs font-medium text-blue-200">
                Enterprise Ethics & Governance
              </div>
            </div>
          </div>
        </div>

        {/* Center Quote */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 backdrop-blur-xs">
            Safe • Transparent • Confidential
          </div>

          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            "Your voice matters. We're here to ensure it's heard."
          </h2>

          <p className="text-sm leading-relaxed text-blue-100/90">
            Submit, track, and resolve enterprise concerns with bank-grade encryption, protected
            whistleblower confidentiality, and strict SLA compliance.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Full compliance with SOC2 Type II and ISO 27001</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Anonymous reporting option with cryptographic pseudonymity</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-blue-100">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Real-time communication with certified dispute resolution agents</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-400" />
            <span>Bank-Grade 256-Bit SSL Secured</span>
          </div>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          {/* Mobile Back button */}
          <div className="lg:hidden mb-2">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Portal</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              {mode === 'login'
                ? 'Enter your credentials to access your complaint queue and reports.'
                : 'Join ResolvSafe to submit and track organizational issues securely.'}
            </p>
          </div>

          {/* Tab Pill (Log In / Sign Up) */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#00288e] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                  >
                    <option value="user">Employee (Submit & Track Complaints)</option>
                    <option value="agent">Support Agent (Triage & Resolve)</option>
                    <option value="admin">System Administrator (Full Analytics)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-[#00288e] focus:outline-hidden focus:ring-2 focus:ring-[#00288e]/20"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-sm border-slate-300 text-[#00288e] focus:ring-[#00288e]"
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email.')}
                  className="font-medium text-[#00288e] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-[#00288e] py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#00288e]/90 hover:shadow-lg disabled:opacity-50 active:scale-[0.99]"
            >
              {loading ? (
                <span>Verifying Secure Session...</span>
              ) : mode === 'login' ? (
                <span>Sign In to ResolvSafe</span>
              ) : (
                <span>Sign Up / Create Account</span>
              )}
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 text-xs">
            <div className="font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span>
                {mode === 'login'
                  ? 'Instant Test Sign-in (1-Click)'
                  : 'Prefill Demo Sign-Up Details (1-Click)'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Password123!</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('user')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-bold text-blue-900 text-[11px]">
                  {mode === 'login' ? 'Employee' : 'Fill Employee'}
                </div>
                <div className="text-[10px] text-slate-500">Alex / Jordan</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('agent')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
              >
                <div className="font-bold text-emerald-900 text-[11px]">
                  {mode === 'login' ? 'Agent' : 'Fill Agent'}
                </div>
                <div className="text-[10px] text-slate-500">Marcus / Sam</div>
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('admin')}
                className="rounded-lg border border-slate-200 bg-white p-2 text-center hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="font-bold text-purple-900 text-[11px]">
                  {mode === 'login' ? 'Admin' : 'Fill Admin'}
                </div>
                <div className="text-[10px] text-slate-500">Morgan</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
