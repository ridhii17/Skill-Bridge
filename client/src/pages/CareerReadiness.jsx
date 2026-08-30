import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { careerReadinessApi } from '../api/app.api';
import {
  Loader2, Target, TrendingUp, ArrowRight, CheckCircle2, AlertTriangle,
  BarChart3, BookOpen, Briefcase, GraduationCap, MapPin, Sparkles, Zap,
  Clock, ChevronRight, Lightbulb, Award, Shield,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';

const LEVEL_CONFIG = {
  foundation: { label: 'Foundation', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: '#ef4444', gradient: 'from-red-500 to-red-600' },
  developing: { label: 'Developing', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', ring: '#f97316', gradient: 'from-orange-500 to-orange-600' },
  career_building: { label: 'Career Building', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
  career_ready: { label: 'Career Ready', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
  highly_ready: { label: 'Highly Ready', color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-200', ring: '#4f46e5', gradient: 'from-brand-500 to-brand-600' },
};

const STATUS_CONFIG = {
  ready: { label: 'Ready', color: 'text-emerald-700', bg: 'bg-emerald-50', bar: 'bg-emerald-500', icon: CheckCircle2 },
  developing: { label: 'Developing', color: 'text-amber-700', bg: 'bg-amber-50', bar: 'bg-amber-500', icon: Target },
  needs_improvement: { label: 'Needs Improvement', color: 'text-orange-700', bg: 'bg-orange-50', bar: 'bg-orange-500', icon: AlertTriangle },
  critical_gap: { label: 'Critical Gap', color: 'text-red-700', bg: 'bg-red-50', bar: 'bg-red-500', icon: AlertTriangle },
};

const CATEGORY_ICONS = {
  'Technical Competency': BarChart3,
  'Assessment Performance': FileCheckIcon,
  'Skill Alignment': Target,
  'Experience': Briefcase,
  'Education': GraduationCap,
  'Career Fit': MapPin,
};

function FileCheckIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function ScoreRing({ score, size = 160, strokeWidth = 10, levelConfig }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={levelConfig?.ring || '#4f46e5'}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-surface-900">{score}</span>
        <span className="text-sm text-surface-500">/ 100</span>
      </div>
    </div>
  );
}

function BreakdownBar({ item, maxScore = 100 }) {
  const Icon = CATEGORY_ICONS[item.category] || BarChart3;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700">{item.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-surface-900">{item.score}</span>
          <span className="text-xs text-surface-400">× {Math.round(item.weight * 100)}%</span>
        </div>
      </div>
      <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${item.score}%`,
            backgroundColor: item.score >= 75 ? '#10b981' : item.score >= 50 ? '#f59e0b' : item.score >= 30 ? '#f97316' : '#ef4444',
          }}
        />
      </div>
      {item.explanation && (
        <p className="text-xs text-surface-500 leading-relaxed">{item.explanation}</p>
      )}
    </div>
  );
}

export default function CareerReadiness() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['career-readiness'],
    queryFn: careerReadinessApi.get,
  });

  const { data: historyData } = useQuery({
    queryKey: ['career-readiness-history'],
    queryFn: () => careerReadinessApi.history({ limit: 20 }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Unable to Load Readiness</h2>
        <p className="text-surface-500">Please try again later.</p>
      </div>
    );
  }

  const d = data?.data;

  // No profile
  if (!d?.hasProfile && d?.hasProfile !== undefined) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <Target className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Complete Your Profile</h2>
        <p className="text-surface-500 mb-6">{d.message}</p>
        <Link to="/profile" className="btn-primary">Set Up Profile <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  // No career target
  if (d?.hasTargetCareer === false) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <Target className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Select a Career Goal</h2>
        <p className="text-surface-500 mb-6">{d.message}</p>
        <Link to="/career-explorer" className="btn-primary">Explore Careers <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  const levelConfig = LEVEL_CONFIG[d.readinessLevel] || LEVEL_CONFIG.developing;
  const history = historyData?.data || d.history || [];

  // Prepare chart data
  const chartData = [...history].reverse().map((h, i) => ({
    name: h.triggeredBy === 'assessment' ? `Test ${i + 1}` : h.triggeredBy === 'reassessment' ? `Re-test ${i + 1}` : `Snapshot ${i + 1}`,
    score: h.overallScore,
    date: new Date(h.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Career Readiness Intelligence</h1>
        </div>
        <p className="text-surface-500">
          {d.targetCareerTitle ? `Analysis for ${d.targetCareerTitle}` : 'Set a career goal for personalized analysis'}
        </p>
      </div>

      {/* Overall Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Ring */}
        <div className="card p-6 flex flex-col items-center">
          <p className="text-sm font-medium text-surface-500 mb-4 uppercase tracking-wider">Overall Readiness</p>
          <ScoreRing score={d.overallScore} levelConfig={levelConfig} />
          <div className={`mt-4 px-4 py-2 rounded-full ${levelConfig.bg} ${levelConfig.border} border`}>
            <span className={`text-sm font-bold ${levelConfig.color}`}>{levelConfig.label}</span>
          </div>
          <p className="text-xs text-surface-500 text-center mt-3 max-w-[200px]">{d.readinessDescription}</p>
          <div className="mt-4 text-center">
            <p className="text-xs text-surface-400">Target: <span className="font-medium text-surface-600">{d.targetCareerTitle}</span></p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 mb-5">Score Breakdown</h2>
          <div className="space-y-5">
            {d.breakdown?.map((item) => (
              <BreakdownBar key={item.category} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Why Section */}
      <div className="card p-6 bg-gradient-to-br from-brand-50 to-indigo-50 border-brand-100">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-brand-100">
            <Lightbulb className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 mb-1">Why is your score {d.overallScore}?</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              {d.overallScore >= 75
                ? `You're well on your way to becoming a ${d.targetCareerTitle}. Your technical skills are strong and aligned with the role requirements. Focus on your weaker areas to reach the highest readiness level.`
                : d.overallScore >= 50
                  ? `You're building solid foundations for ${d.targetCareerTitle}. Your ${d.topStrengths?.length > 0 ? d.topStrengths.slice(0, 2).join(' and ') + ' skills are strengths' : 'skills are developing'}. ${d.criticalGaps?.length > 0 ? `Prioritize improving ${d.criticalGaps[0]} for maximum impact.` : 'Continue building your skill set.'}`
                  : d.overallScore >= 30
                    ? `You're in the early stages of your ${d.targetCareerTitle} journey. Focus on building the fundamentals, especially ${d.criticalGaps?.length > 0 ? d.criticalGaps.slice(0, 2).join(' and ') : 'core skills'}. Take assessments to measure your progress.`
                    : `Start by building core skills for ${d.targetCareerTitle}. Set up your profile, take an assessment, and follow the learning roadmap to improve your readiness.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Target Comparison */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-600" />
            Target Role Comparison
          </h2>
          <div className="space-y-3">
            {d.skillComparisons?.slice(0, 10).map((sc, i) => {
              const config = STATUS_CONFIG[sc.status] || STATUS_CONFIG.developing;
              const StatusIcon = config.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 transition-colors">
                  <StatusIcon className={`w-4 h-4 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-surface-700 truncate">{sc.skillName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-surface-500">
                      <span>You: <strong className="text-surface-700">{sc.currentScore}%</strong></span>
                      <span>→</span>
                      <span>Required: <strong className="text-surface-700">{sc.requiredScore}%</strong></span>
                      {sc.gap > 0 && <span className="text-red-500">Gap: {sc.gap}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths + Critical Gaps */}
        <div className="space-y-6">
          {/* Top Strengths */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Top Strengths
            </h2>
            {d.topStrengths?.length > 0 ? (
              <div className="space-y-2">
                {d.topStrengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-emerald-700">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-surface-500">Complete an assessment to identify your strengths.</p>
            )}
          </div>

          {/* Critical Gaps */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Critical Skill Gaps
            </h2>
            {d.criticalGaps?.length > 0 ? (
              <div className="space-y-2">
                {d.criticalGaps.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-red-700">{s}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="text-sm text-emerald-700 font-medium">No critical gaps — great job!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highest Impact Skill */}
      {d.highestImpactSkill && (
        <div className="card p-6 border-2 border-brand-200 bg-brand-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-100">
              <Zap className="w-6 h-6 text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Your Highest-Impact Next Skill</p>
              <h3 className="text-xl font-bold text-surface-900">{d.highestImpactSkill.skillName}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-surface-600">
                <span>Current: <strong>{d.highestImpactSkill.currentScore}%</strong></span>
                <span>Required: <strong>{d.highestImpactSkill.requiredScore}%</strong></span>
                <span className="text-red-600 font-bold">Gap: {d.highestImpactSkill.gap} points</span>
              </div>
              <p className="text-xs text-surface-500 mt-1">
                Importance: {d.highestImpactSkill.importance >= 4 ? 'Very High' : d.highestImpactSkill.importance >= 3 ? 'High' : d.highestImpactSkill.importance >= 2 ? 'Medium' : 'Standard'}
              </p>
            </div>
            <Link to="/learning" className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <BookOpen className="w-4 h-4" />
              Build This Skill
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Readiness History Chart */}
        {chartData.length > 1 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-surface-500" />
              Career Readiness History
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="url(#colorScore)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
              <span>Snapshots: {history.length}</span>
              <span>·</span>
              <span>Latest: {history[0] ? new Date(history[0].createdAt).toLocaleDateString('en-IN') : '—'}</span>
            </div>
          </div>
        )}

        {/* Latest Assessment */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-surface-500" />
            Latest Assessment
          </h2>
          {d.latestAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50">
                <div>
                  <p className="text-sm font-medium text-surface-700">{d.latestAssessment.assessmentTitle}</p>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {new Date(d.latestAssessment.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className={`text-2xl font-bold ${d.latestAssessment.score >= 70 ? 'text-emerald-600' : d.latestAssessment.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                  {d.latestAssessment.score}%
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-600">
                <Award className="w-4 h-4 text-surface-400" />
                <span>Total assessments completed: <strong>{d.assessmentCount}</strong></span>
              </div>
              <Link to="/assessment" className="btn-secondary text-sm inline-flex items-center gap-2">
                Retake Assessment <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-sm text-surface-500 mb-4">No assessments completed yet.</p>
              <Link to="/assessment" className="btn-primary text-sm inline-flex items-center gap-2">
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Next Action */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Recommended Next Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {d.overallScore < 50 && (
            <Link to="/learning" className="p-4 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
              <BookOpen className="w-6 h-6 text-brand-600 mb-2" />
              <p className="text-sm font-semibold text-surface-900">Start Learning</p>
              <p className="text-xs text-surface-500 mt-1">Build foundational skills for your career</p>
            </Link>
          )}
          {d.overallScore >= 50 && d.overallScore < 75 && (
            <Link to="/roadmap" className="p-4 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
              <MapPin className="w-6 h-6 text-brand-600 mb-2" />
              <p className="text-sm font-semibold text-surface-900">Follow Roadmap</p>
              <p className="text-xs text-surface-500 mt-1">Complete your personalized learning path</p>
            </Link>
          )}
          {d.overallScore >= 75 && (
            <Link to="/jobs" className="p-4 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
              <Briefcase className="w-6 h-6 text-brand-600 mb-2" />
              <p className="text-sm font-semibold text-surface-900">Explore Jobs</p>
              <p className="text-xs text-surface-500 mt-1">You're ready for career opportunities</p>
            </Link>
          )}
          <Link to="/assessment" className="p-4 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
            <BarChart3 className="w-6 h-6 text-brand-600 mb-2" />
            <p className="text-sm font-semibold text-surface-900">Take Assessment</p>
            <p className="text-xs text-surface-500 mt-1">Measure and improve your competency</p>
          </Link>
          <Link to="/simulator" className="p-4 rounded-xl border border-surface-100 hover:border-brand-200 hover:bg-brand-50/50 transition-all">
            <Zap className="w-6 h-6 text-brand-600 mb-2" />
            <p className="text-sm font-semibold text-surface-900">Try Simulator</p>
            <p className="text-xs text-surface-500 mt-1">See how improving skills impacts readiness</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
