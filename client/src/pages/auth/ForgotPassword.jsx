import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulated — in production this would call an API
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-surface-900">
            Skill<span className="text-brand-600">Bridge</span>
          </span>
        </Link>

        {submitted ? (
          <div className="card p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 mb-2">Check your email</h1>
            <p className="text-surface-500 mb-6">
              If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
            </p>
            <Link to="/login" className="btn-primary w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <div className="card p-8">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
                <Mail className="w-7 h-7 text-brand-600" />
              </div>
              <h1 className="text-2xl font-bold text-surface-900">Forgot your password?</h1>
              <p className="text-surface-500 mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-surface-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-surface-500">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
