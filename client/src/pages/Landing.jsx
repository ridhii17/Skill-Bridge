import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain, BarChart3, Target, BookOpen, ArrowRight, CheckCircle2, Zap,
  Shield, Sparkles, Briefcase, MapPin, Bot, MessageSquare, IndianRupee,
  TrendingUp, Star, Users, ChevronRight, IndianRupeeIcon, Search, Map as MapIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SearchOverlay from '../components/layout/SearchOverlay';

/* ─── Feature Card ─────────────────────────────── */
function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-surface-200 hover:border-brand-200 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
        <Icon className="w-6 h-6 text-brand-600" />
      </div>
      <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
      <p className="text-surface-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

/* ─── Dashboard Mockup (Right Hero Visual) ─────── */
function DashboardMockup() {
  const skills = [
    { name: 'JavaScript', score: 85, color: 'bg-emerald-500' },
    { name: 'React', score: 80, color: 'bg-brand-500' },
    { name: 'Node.js', score: 70, color: 'bg-amber-500' },
    { name: 'MongoDB', score: 65, color: 'bg-sky-500' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-brand-600/10 border border-surface-200 overflow-hidden">
      {/* Header bar */}
      <div className="px-5 py-3 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-surface-500">Career Intelligence</span>
        </div>
        <span className="text-xs text-surface-400">Demo Preview</span>
      </div>

      <div className="p-5 space-y-5">
        {/* Career Readiness */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-surface-400 mb-1">Career Readiness</p>
            <p className="text-3xl font-bold text-surface-900">78<span className="text-lg text-surface-400">%</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Approaching Ready</p>
          </div>
          <div className="w-20 h-20 relative">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeWidth="3" strokeDasharray="78, 100" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-600" />
            </div>
          </div>
        </div>

        {/* Top Skills */}
        <div>
          <p className="text-xs text-surface-400 mb-2.5">Top Skills</p>
          <div className="space-y-2">
            {skills.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-xs text-surface-600 w-16">{s.name}</span>
                <div className="flex-1 h-1.5 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.score}%` }} />
                </div>
                <span className="text-xs font-medium text-surface-700 w-8 text-right">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
            <p className="text-[10px] text-emerald-600 font-medium">Strengths</p>
            <p className="text-sm font-bold text-emerald-700">5 Skills</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-[10px] text-amber-600 font-medium">Gaps</p>
            <p className="text-sm font-bold text-amber-700">2 Skills</p>
          </div>
        </div>

        {/* Recommended job */}
        <div className="p-3 rounded-lg bg-surface-50 border border-surface-100">
          <p className="text-[10px] text-surface-400 font-medium mb-1">Top Job Match</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-surface-900">Full Stack Developer</p>
              <p className="text-[10px] text-surface-400">InnovateTech · Hyderabad</p>
            </div>
            <span className="text-sm font-bold text-emerald-600">91%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Job Card Preview ──────────────────────────── */
function JobCardPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-6 max-w-md mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-surface-400 mb-1">Job Match Analysis</p>
          <h4 className="text-lg font-bold text-surface-900">Junior Full Stack Developer</h4>
          <p className="text-sm text-surface-500 mt-0.5">TechStart Solutions · Bangalore</p>
        </div>
        <div className="text-center px-3 py-2 rounded-xl bg-emerald-50">
          <p className="text-2xl font-bold text-emerald-600">87%</p>
          <p className="text-[10px] text-surface-500">match</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-emerald-700 mb-1.5">Strong Matches</p>
          <div className="flex flex-wrap gap-1.5">
            {['React', 'JavaScript', 'MongoDB'].map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs">
                <CheckCircle2 className="w-3 h-3" /> {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-amber-700 mb-1.5">Skill Gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {['Node.js', 'System Design'].map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                <Zap className="w-3 h-3" /> {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-surface-100">
        <button className="w-full btn-primary text-sm justify-center">
          View Match Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── AI Chat Preview ───────────────────────────── */
function AIChatPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden max-w-md mx-auto">
      <div className="px-4 py-3 bg-brand-600 flex items-center gap-2">
        <Bot className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">AI Career Assistant</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-surface-200 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-surface-500" />
          </div>
          <div className="bg-surface-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
            <p className="text-sm text-surface-700">What should I learn next?</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="bg-brand-50 border border-brand-100 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[85%]">
            <p className="text-sm text-surface-700 leading-relaxed">
              Based on your competency profile and <strong>Full Stack Developer</strong> target, <strong>Node.js</strong> and <strong>System Design</strong> are your highest-priority gaps. I recommend starting with Node.js APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
/* ─── Landing Page ────────────────────────────────── */
/* ═══════════════════════════════════════════════════ */
export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const steps = [
    { icon: Brain, label: 'Assess', desc: 'Diagnostic evaluation of your current competencies', num: '01' },
    { icon: Target, label: 'Target', desc: 'Choose your desired career path', num: '02' },
    { icon: BarChart3, label: 'Analyze', desc: 'Identify skill gaps with weighted scoring', num: '03' },
    { icon: BookOpen, label: 'Learn', desc: 'Follow personalized learning recommendations', num: '04' },
    { icon: Shield, label: 'Verify', desc: 'Validate improved competencies through assessments', num: '05' },
    { icon: Briefcase, label: 'Match', desc: 'Discover suitable job opportunities', num: '06' },
  ];

  const features = [
    { icon: Brain, title: 'AI-Powered Analysis', description: 'Resume analysis, skill extraction, and career guidance through specialized AI agents that understand your profile.' },
    { icon: BarChart3, title: 'Competency Scoring', description: 'Weighted scoring algorithms measure your skills across multiple dimensions through structured assessments.' },
    { icon: Target, title: 'Skill Gap Analysis', description: 'Compare your current competency against target career requirements with precise gap identification and prioritization.' },
    { icon: BookOpen, title: 'Personalized Learning', description: 'AI-generated learning roadmaps tailored to your specific skill gaps, learning style, and available time.' },
    { icon: Briefcase, title: 'Intelligent Job Matching', description: 'Match with jobs using 5-factor weighted analysis: skills, competency, experience, education, and preferences.' },
    { icon: Shield, title: 'Skill Verification', description: 'Earn verified skill badges through assessments. Share your verified competency with employers.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar onSearchOpen={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ─── Hero ──────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-medium mb-6">
                <Shield className="w-3.5 h-3.5" />
                SIH1628 · Smart India Hackathon 2026
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-surface-950 tracking-tight leading-[1.1] mb-6">
                Know Your Skills.
                <br />
                <span className="text-brand-600">Discover</span> Your Career.
                <br />
                Build Your Future.
              </h1>

              <p className="text-lg text-surface-500 leading-relaxed mb-8 max-w-xl">
                Assess your real competencies, identify career skill gaps, build a personalized learning path, verify your skills, and discover better job opportunities — powered by AI and intelligent algorithms.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link
                  to={isAuthenticated ? '/assessment' : '/register'}
                  className="btn-primary text-base px-8 py-3"
                >
                  Start Your Assessment <ArrowRight className="w-5 h-5" />
                </Link>
                <a href="#features" className="btn-secondary text-base px-8 py-3">
                  Explore Features
                </a>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-surface-100">
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  AI + Deterministic Algorithms
                </div>
                <div className="flex items-center gap-2 text-sm text-surface-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  MERN Stack
                </div>
                <div className="hidden sm:flex items-center gap-2 text-sm text-surface-500">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  JavaScript Only
                </div>
              </div>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 border-y border-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
              Everything you need to bridge the skills gap
            </h2>
            <p className="text-surface-500 text-lg max-w-2xl mx-auto">
              A comprehensive platform combining AI intelligence with deterministic algorithms to map your career readiness.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
              From assessment to career readiness
            </h2>
            <p className="text-surface-500 text-lg">Six steps to your dream career</p>
          </div>

          {/* Horizontal timeline — desktop */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-8 left-0 right-0 h-px bg-surface-200" />

              <div className="grid grid-cols-6 gap-4">
                {steps.map((step) => (
                  <div key={step.num} className="relative flex flex-col items-center text-center group">
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-surface-200 group-hover:border-brand-400 group-hover:shadow-lg group-hover:shadow-brand-600/10 flex items-center justify-center transition-all duration-300">
                      <step.icon className="w-7 h-7 text-surface-500 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <span className="mt-3 text-xs font-bold text-brand-600">{step.num}</span>
                    <h3 className="mt-1 font-semibold text-surface-900 text-sm">{step.label}</h3>
                    <p className="mt-1 text-xs text-surface-500 leading-relaxed px-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical timeline — mobile */}
          <div className="md:hidden space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  {i < steps.length - 1 && <div className="w-px h-6 bg-surface-200 mt-2" />}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-bold text-brand-600">{step.num}</p>
                  <h3 className="font-semibold text-surface-900">{step.label}</h3>
                  <p className="text-sm text-surface-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Career Readiness ──────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-50 border-y border-surface-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Career Readiness</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
                From a score to a career plan
              </h2>
              <p className="text-surface-500 text-lg mb-8 leading-relaxed">
                SkillBridge AI transforms your competency assessment into a clear, actionable career roadmap — identifying exactly what to learn and in what order.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Competency Assessment</p>
                    <p className="text-xs text-surface-500">Measure skills across all dimensions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Gap Analysis</p>
                    <p className="text-xs text-surface-500">Identify priority skill gaps for your target career</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <MapIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Personalized Roadmap</p>
                    <p className="text-xs text-surface-500">Week-by-week learning plan with resources</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-surface-900">Track Progress</p>
                    <p className="text-xs text-surface-500">Monitor your improvement over time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual — Conceptual Readiness */}
            <div className="bg-white rounded-2xl shadow-xl border border-surface-200 p-6">
              <p className="text-xs text-surface-400 mb-4">Product Example — Skill Gap Analysis</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-surface-900">62%</p>
                  <p className="text-xs text-surface-400 mt-1">Current Readiness</p>
                </div>
                <ArrowRight className="w-6 h-6 text-brand-400" />
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand-600">95%</p>
                  <p className="text-xs text-surface-400 mt-1">After Roadmap</p>
                </div>
              </div>
              <div className="space-y-2.5 mb-6">
                {[
                  { name: 'System Design', status: 'Critical Gap', color: 'text-red-600 bg-red-50' },
                  { name: 'DSA', status: 'Needs Improvement', color: 'text-amber-600 bg-amber-50' },
                  { name: 'Node.js', status: 'Developing', color: 'text-sky-600 bg-sky-50' },
                ].map((g) => (
                  <div key={g.name} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-surface-100">
                    <span className="text-sm font-medium text-surface-700">{g.name}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${g.color}`}>{g.status}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
                <p className="text-xs font-semibold text-brand-700 mb-2">Personalized Roadmap</p>
                <div className="space-y-1.5">
                  {['Week 1: Node.js APIs', 'Week 2: REST APIs', 'Week 3: DSA', 'Week 4: System Design'].map((w) => (
                    <div key={w} className="flex items-center gap-2 text-xs text-brand-600">
                      <ChevronRight className="w-3 h-3" /> {w}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Job Matching ──────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <JobCardPreview />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">Job Matching</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
                Don't just find jobs.<br />Know why you match.
              </h2>
              <p className="text-surface-500 text-lg mb-8 leading-relaxed">
                Our 5-factor weighted matching engine analyzes your skills, competency scores, experience, education, and preferences against every job listing.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Skills Match', weight: '45%', desc: 'Compare required skills against your competency scores' },
                  { label: 'Competency Score', weight: '15%', desc: 'Assessment results factored into match quality' },
                  { label: 'Experience Fit', weight: '20%', desc: 'Experience level compared to job requirements' },
                  { label: 'Education & Preferences', weight: '20%', desc: 'Education level and job type preferences' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded mt-0.5">{item.weight}</span>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{item.label}</p>
                      <p className="text-xs text-surface-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI Section ────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-surface-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-brand-400 uppercase tracking-wider mb-3">AI Intelligence</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Your AI Career Intelligence
              </h2>
              <p className="text-surface-300 text-lg mb-8 leading-relaxed">
                SkillBridge AI uses specialized AI services to understand your career context and provide personalized guidance — while deterministic algorithms handle all numerical calculations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Brain, label: 'Resume Analysis', desc: 'Extract skills from your resume' },
                  { icon: Target, label: 'Career Guidance', desc: 'Personalized career recommendations' },
                  { icon: BookOpen, label: 'Learning Recommendations', desc: 'Why each resource helps you' },
                  { icon: MapIcon, label: 'Roadmap Generation', desc: 'AI-powered learning plans' },
                  { icon: Briefcase, label: 'Job Match Explanation', desc: 'Why jobs match your profile' },
                  { icon: Bot, label: 'Career Assistant', desc: 'Ask questions about your career' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/50 border border-surface-700/50">
                    <div className="w-9 h-9 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-surface-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <AIChatPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Adaptive Loop ──────────────────────────── */}
      <section id="loop" className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-brand-600 uppercase tracking-wider mb-2">Adaptive Intelligence</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
              Your career readiness is not a static score.
            </h2>
            <p className="text-lg text-surface-500 max-w-2xl mx-auto">
              SkillBridge AI continuously evaluates your progress and adapts your learning path as competencies improve.
            </p>
          </div>

          {/* Flow visualization */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-12">
            {[
              { label: 'Assess', icon: Brain, color: 'bg-brand-100 text-brand-700 border-brand-200' },
              { label: 'Identify Gaps', icon: Target, color: 'bg-red-50 text-red-700 border-red-200' },
              { label: 'Learn', icon: BookOpen, color: 'bg-sky-50 text-sky-700 border-sky-200' },
              { label: 'Verify', icon: Shield, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { label: 'Reassess', icon: BarChart3, color: 'bg-amber-50 text-amber-700 border-amber-200' },
              { label: 'Improve', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              { label: 'Match', icon: Briefcase, color: 'bg-brand-50 text-brand-700 border-brand-200' },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4">
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-medium text-sm ${step.color}`}>
                  <step.icon className="w-4 h-4" />
                  {step.label}
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-surface-300 hidden sm:block" />
                )}
              </div>
            ))}
          </div>

          {/* Example scenario */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-surface-200 p-6 sm:p-8 shadow-sm">
            <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-4">Product Example — Readiness Loop</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-xl bg-surface-50">
                <p className="text-xs text-surface-500 mb-1">Initial Assessment</p>
                <p className="text-3xl font-bold text-amber-600">62%</p>
                <p className="text-xs text-surface-400 mt-1">System Design, DSA gaps</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-brand-50">
                <p className="text-xs text-brand-500 mb-1">After Learning + Practice</p>
                <p className="text-3xl font-bold text-brand-600">71%</p>
                <p className="text-xs text-brand-400 mt-1">+9 points improvement</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-50">
                <p className="text-xs text-emerald-500 mb-1">New Job Matches</p>
                <p className="text-3xl font-bold text-emerald-600">17</p>
                <p className="text-xs text-emerald-400 mt-1">from 8 original matches</p>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-700">Next Best Action: Improve System Design (gap: 28 points)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 mb-4">
            Ready to bridge your skill gap?
          </h2>
          <p className="text-lg text-surface-500 mb-8 max-w-xl mx-auto">
            Turn your current skills into a clear, personalized path toward your career goal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? '/assessment' : '/register'}
              className="btn-primary text-base px-8 py-3"
            >
              Start Assessment <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/career-explorer" className="btn-secondary text-base px-8 py-3">
              Explore Careers
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
