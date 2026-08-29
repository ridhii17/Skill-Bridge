import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-surface-900">
              Skill<span className="text-brand-600">Bridge</span>
            </span>
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-surface-900">Welcome back</h1>
            <p className="mt-2 text-surface-500">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-surface-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create one now
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-surface-900 items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center mb-8">
            <Sparkles className="w-7 h-7 text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Bridge the gap between where you are and where you want to be
          </h2>
          <p className="text-surface-400 text-lg leading-relaxed">
            SkillBridge AI analyzes your competencies, identifies skill gaps, and creates
            personalized learning paths to accelerate your career growth.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Competency Scoring', desc: 'Weighted skill assessment' },
              { label: 'Gap Analysis', desc: 'Target career comparison' },
              { label: 'AI Learning Paths', desc: 'Personalized roadmaps' },
              { label: 'Job Matching', desc: 'Intelligent career matching' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white font-medium text-sm">{item.label}</p>
                <p className="text-surface-400 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
