import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  User, Briefcase, GraduationCap, Users,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'candidate', label: 'Candidate', desc: 'I want to improve my skills', icon: GraduationCap },
  { value: 'mentor', label: 'Mentor', desc: 'I want to guide others', icon: Users },
  { value: 'recruiter', label: 'Recruiter', desc: 'I want to find talent', icon: Briefcase },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
  });
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

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = form;
      await register(submitData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
            <h1 className="text-3xl font-bold text-surface-900">Create your account</h1>
            <p className="mt-2 text-surface-500">
              Start your journey to career readiness
            </p>
          </div>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-surface-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-11 pr-11"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-surface-400">
                Must contain uppercase, lowercase, and a number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="Re-enter your password"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2.5">
                I am a...
              </label>
              <div className="grid grid-cols-3 gap-3">
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon;
                  const isSelected = form.role === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, role: role.value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all duration-150 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 shadow-sm'
                          : 'border-surface-200 bg-white hover:border-surface-300'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mx-auto mb-1.5 ${
                          isSelected ? 'text-brand-600' : 'text-surface-400'
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          isSelected ? 'text-brand-700' : 'text-surface-700'
                        }`}
                      >
                        {role.label}
                      </p>
                      <p className="text-[10px] text-surface-400 mt-0.5 leading-tight">
                        {role.desc}
                      </p>
                    </button>
                  );
                })}
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
                  Create Account <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-brand-600 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your career growth journey starts here
          </h2>
          <p className="text-brand-100 text-lg leading-relaxed">
            Join thousands of professionals who are using SkillBridge AI to
            understand their competencies, close skill gaps, and land their dream jobs.
          </p>
          <div className="mt-10 flex justify-center gap-8">
            <div>
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-brand-200 text-sm mt-1">Competencies</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">10</p>
              <p className="text-brand-200 text-sm mt-1">Career Paths</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">AI</p>
              <p className="text-brand-200 text-sm mt-1">Powered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
