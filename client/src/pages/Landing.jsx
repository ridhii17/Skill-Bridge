import { useState, useEffect } from 'react';
import {
  Brain,
  BarChart3,
  Target,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Sparkles,
  Activity,
  RefreshCw,
} from 'lucide-react';
import api from '../api/axios';

function HealthBadge({ health }) {
  if (!health) return null;

  const isOk = health.status === 'ok';

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/50 backdrop-blur border border-surface-700/50">
      <span
        className={`w-2 h-2 rounded-full ${
          isOk ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
        }`}
      />
      <span className="text-sm text-surface-300 font-mono">
        {isOk ? 'System Operational' : 'System Error'}
      </span>
      {health.database && (
        <>
          <span className="text-surface-600">·</span>
          <span className="text-sm text-surface-400 font-mono">
            DB: {health.database.status}
          </span>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 border border-surface-100">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm text-surface-500">{label}</p>
        <p className="text-lg font-semibold text-surface-900">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-surface-200 hover:border-brand-200 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
        <Icon className="w-6 h-6 text-brand-600" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 leading-relaxed">{description}</p>
    </div>
  );
}

export default function Landing() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/health');
      setHealth(res.data);
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const steps = [
    { icon: Brain, label: 'Assess', desc: 'Diagnostic evaluation of your current competencies' },
    { icon: Target, label: 'Target', desc: 'Compare skills against target career requirements' },
    { icon: BarChart3, label: 'Analyze', desc: 'Identify gaps with weighted scoring algorithms' },
    { icon: BookOpen, label: 'Learn', desc: 'Personalized AI-generated learning roadmap' },
    { icon: Zap, label: 'Verify', desc: 'Skill verification through smart assessments' },
  ];

  return (
    <div className="min-h-screen">
      {/* ─── Navigation ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900">
              Skill<span className="text-brand-600">Bridge</span> AI
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-surface-500">
            <a href="#features" className="hover:text-surface-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-surface-900 transition-colors">How It Works</a>
            <a href="#system" className="hover:text-surface-900 transition-colors">System Status</a>
          </div>
          <button className="btn-primary text-sm">
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-8">
            <Shield className="w-3.5 h-3.5" />
            SIH1628 · Smart India Hackathon 2026
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-surface-950 tracking-tight leading-[1.1] mb-6">
            Smart Competency
            <br />
            <span className="text-brand-600">Diagnostic</span> &amp; Profile
            <br />
            Score Calculator
          </h1>

          <p className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Understand your competencies. Identify skill gaps. Get personalized learning paths.
            Verify your skills. Match with the right jobs — all powered by AI and intelligent algorithms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="btn-primary text-base px-8 py-3">
              Start Assessment <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary text-base px-8 py-3">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-surface-900 mb-3">
              Everything you need to bridge the skills gap
            </h2>
            <p className="text-surface-500 text-lg max-w-xl mx-auto">
              A comprehensive platform combining AI intelligence with deterministic algorithms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Analysis"
              description="Resume parsing, skill extraction, and career guidance through specialized AI agents."
            />
            <FeatureCard
              icon={BarChart3}
              title="Competency Scoring"
              description="Weighted scoring algorithms that track your growth across all skill dimensions."
            />
            <FeatureCard
              icon={Target}
              title="Gap Analysis"
              description="Compare your profile against any target career with precise gap identification."
            />
            <FeatureCard
              icon={BookOpen}
              title="Learning Roadmaps"
              description="Personalized, phase-based learning paths generated by AI based on your unique gaps."
            />
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-surface-900 mb-3">How SkillBridge AI works</h2>
            <p className="text-surface-500 text-lg">Five steps to career readiness</p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-4">
            {steps.map((step, i) => (
              <div key={step.label} className="flex-1 flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/25 group-hover:scale-105 transition-transform">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-surface-900 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-surface-900">{step.label}</h3>
                <p className="mt-1 text-sm text-surface-500 leading-relaxed px-2">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 w-8 h-px bg-surface-300" style={{ left: 'calc(50% + 32px)' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── System Status ──────────────────────────── */}
      <section id="system" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y border-surface-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-surface-900 mb-3">System Status</h2>
            <p className="text-surface-500">
              Live connection test between the React frontend and Express backend
            </p>
          </div>

          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-brand-600" />
                <span className="font-semibold text-surface-900">Backend Health Check</span>
              </div>
              <button
                onClick={fetchHealth}
                disabled={loading}
                className="btn-secondary text-sm py-1.5 px-3"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loading && !health && (
              <div className="space-y-3">
                <div className="h-4 skeleton w-3/4" />
                <div className="h-4 skeleton w-1/2" />
                <div className="h-4 skeleton w-2/3" />
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-red-700 font-medium">Connection Failed</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <p className="text-red-500 text-xs mt-2 font-mono">
                  Make sure the backend is running on port 5000
                </p>
              </div>
            )}

            {health && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Frontend ↔ Backend communication successful</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <StatCard
                    icon={Activity}
                    label="Server Status"
                    value={health.status === 'ok' ? 'Healthy' : 'Error'}
                    color="bg-emerald-500"
                  />
                  <StatCard
                    icon={Brain}
                    label="Database"
                    value={health.database?.status || 'Unknown'}
                    color="bg-brand-500"
                  />
                  <StatCard
                    icon={Shield}
                    label="Environment"
                    value={health.environment || 'N/A'}
                    color="bg-amber-500"
                  />
                  <StatCard
                    icon={Zap}
                    label="Uptime"
                    value={`${Math.floor(health.uptime || 0)}s`}
                    color="bg-sky-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
                  <p className="text-xs font-mono text-surface-500 break-all">
                    Timestamp: {health.timestamp}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────── */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-surface-100">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-surface-700">SkillBridge AI</span>
          </div>
          <p className="text-sm text-surface-400">
            SIH1628 · Smart India Hackathon 2026 · MERN Stack
          </p>
        </div>
      </footer>
    </div>
  );
}
