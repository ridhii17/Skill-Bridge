import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { careerProgressApi } from '../api/app.api';
import {
  Loader2, TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Target,
  BookOpen, Briefcase, Clock, Zap, Award, Shield, Brain, Sparkles,
  ChevronRight, ArrowUpRight, ArrowDownRight, Minus, GitBranch,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  Area, AreaChart, BarChart, Bar,
} from 'recharts';

const TYPE_ICONS = {
  assessment: { icon: Brain, color: 'text-brand-600', bg: 'bg-brand-100', label: 'Assessment' },
  mini_assessment: { icon: Target, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Practice' },
  verification: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Verified' },
  readiness_update: { icon: TrendingUp, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Readiness Update' },
};

function TimelineEvent({ event, isLast }) {
  const config = TYPE_ICONS[event.type] || TYPE_ICONS.assessment;
  const Icon = config.icon;

  return (
    <div className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-surface-200 my-1" />}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isLast ? '' : 'pb-6'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-medium ${config.color} uppercase tracking-wider`}>{config.label}</span>
          <span className="text-xs text-surface-400">
            {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {event.type === 'assessment' && (
          <div className="p-3 rounded-xl bg-white border border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900">{event.title}</p>
                <p className="text-xs text-surface-500 mt-0.5">{event.details}</p>
              </div>
              <div className={`text-2xl font-bold ${event.score >= 70 ? 'text-emerald-600' : event.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {event.score}%
              </div>
            </div>
          </div>
        )}

        {event.type === 'mini_assessment' && (
          <div className="p-3 rounded-xl bg-white border border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900">{event.skillName}</p>
                <p className="text-xs text-surface-500 mt-0.5">{event.details}</p>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${event.score >= 80 ? 'text-emerald-600' : event.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {event.score}%
                </span>
                {event.improvement !== 0 && (
                  <p className={`text-xs font-medium flex items-center gap-0.5 justify-end ${event.improvement > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {event.improvement > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {event.improvement > 0 ? '+' : ''}{event.improvement}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {event.type === 'verification' && (
          <div className="p-3 rounded-xl bg-white border border-surface-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-medium text-surface-900">{event.skillName} — Verified</p>
                  <p className="text-xs text-surface-500 mt-0.5">Badge: {event.badge || 'Bronze'}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-emerald-600">{event.score}%</span>
            </div>
          </div>
        )}

        {event.type === 'readiness_update' && (
          <div className="p-3 rounded-xl bg-white border border-surface-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-surface-900">Readiness Snapshot</p>
                <p className="text-xs text-surface-500 mt-0.5">Triggered by: {event.triggeredBy || 'assessment'}</p>
              </div>
              <span className={`text-lg font-bold ${event.score >= 70 ? 'text-emerald-600' : event.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {event.score}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BeforeAfterCard({ before, after, improvement }) {
  if (!before || !after) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <GitBranch className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-surface-900">Before vs After</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Before */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
          <p className="text-xs font-medium text-surface-400 uppercase tracking-wider mb-3">Before</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-surface-500">Readiness</p>
              <p className="text-2xl font-bold text-surface-600">{before.readinessScore}%</p>
            </div>
            <div>
              <p className="text-xs text-surface-500">Critical Gaps</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(before.criticalGaps || []).slice(0, 3).map((g, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{g}</span>
                ))}
                {(!before.criticalGaps || before.criticalGaps.length === 0) && (
                  <span className="text-xs text-surface-400">None</span>
                )}
              </div>
            </div>
            {before.jobCount !== undefined && (
              <div>
                <p className="text-xs text-surface-500">Job Matches</p>
                <p className="text-lg font-bold text-surface-600">{before.jobCount}</p>
              </div>
            )}
          </div>
        </div>

        {/* After */}
        <div className="p-4 rounded-xl bg-brand-50 border border-brand-100">
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-3">After</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-brand-500">Readiness</p>
              <p className="text-2xl font-bold text-brand-700">{after.readinessScore}%</p>
            </div>
            <div>
              <p className="text-xs text-brand-500">Critical Gaps</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(after.criticalGaps || []).slice(0, 3).map((g, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">{g}</span>
                ))}
                {(!after.criticalGaps || after.criticalGaps.length === 0) && (
                  <span className="text-xs text-emerald-600 font-medium">None — great!</span>
                )}
              </div>
            </div>
            {after.jobCount !== undefined && (
              <div>
                <p className="text-xs text-brand-500">Job Matches</p>
                <p className="text-lg font-bold text-brand-700">{after.jobCount}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Improvement Summary */}
      {improvement && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-brand-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-surface-900">Your Improvement</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${improvement.readinessPoints >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {improvement.readinessPoints >= 0 ? '+' : ''}{improvement.readinessPoints}
              </p>
              <p className="text-xs text-surface-500">Readiness Points</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${improvement.jobMatches >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {improvement.jobMatches >= 0 ? '+' : ''}{improvement.jobMatches}
              </p>
              <p className="text-xs text-surface-500">Job Matches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600">{improvement.skillsImproved}</p>
              <p className="text-xs text-surface-500">Skills Improved</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${improvement.criticalGapsReduced >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {improvement.criticalGapsReduced >= 0 ? '-' : '+'}{Math.abs(improvement.criticalGapsReduced)}
              </p>
              <p className="text-xs text-surface-500">Critical Gaps Closed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WhatChangedCard({ skillImprovements }) {
  if (!skillImprovements || skillImprovements.length === 0) return null;

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-5 h-5 text-amber-600" />
        <h2 className="text-lg font-semibold text-surface-900">What Changed</h2>
      </div>
      <div className="space-y-3">
        {skillImprovements.map((si, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-50">
            <div className="flex-1">
              <p className="font-medium text-surface-900">{si.skillName}</p>
              <p className="text-xs text-surface-500 mt-0.5">
                {si.attempts} practice{si.attempts > 1 ? 's' : ''} · Status: {si.status?.replace('_', ' ')}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm text-surface-500">{si.initialScore}%</span>
                <ArrowRight className="w-3 h-3 text-surface-400" />
                <span className="text-sm font-bold text-surface-900">{si.currentScore}%</span>
              </div>
              <p className={`text-xs font-medium mt-0.5 ${si.improvement > 0 ? 'text-emerald-600' : si.improvement < 0 ? 'text-red-600' : 'text-surface-400'}`}>
                {si.improvement > 0 ? '+' : ''}{si.improvement} points
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CareerProgress() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['career-progress'],
    queryFn: careerProgressApi.get,
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
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Unable to Load Career Progress</h2>
        <p className="text-surface-500">Please try again later.</p>
      </div>
    );
  }

  const d = data?.data;

  if (!d?.hasData) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <TrendingUp className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">Start Your Career Journey</h2>
        <p className="text-surface-500 mb-6">{d?.message || 'Complete your profile and take an assessment to see your career progress loop.'}</p>
        <div className="flex gap-3 justify-center">
          <Link to="/profile" className="btn-primary">Complete Profile</Link>
          <Link to="/career-explorer" className="btn-secondary">Select Career</Link>
        </div>
      </div>
    );
  }

  const { currentReadiness, timeline, timelineStats, before, after, improvement, skillImprovements, nextBestAction, learningStats, chartData, jobImpact } = d;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Career Readiness Loop</h1>
        </div>
        <p className="text-surface-500">
          Your career readiness is not a static score — it evolves as you learn, practice, and improve.
        </p>
      </div>

      {/* Current Readiness Summary */}
      <div className="card p-6 bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-3xl font-bold">{currentReadiness.score}%</span>
            </div>
            <div>
              <p className="text-xs font-medium text-brand-100 uppercase tracking-wider">Current Readiness</p>
              <p className="text-lg font-semibold">{currentReadiness.label}</p>
              <p className="text-sm text-brand-200">Target: {currentReadiness.targetCareer}</p>
            </div>
          </div>
          <div className="flex-1 hidden sm:block">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{timelineStats.totalAssessments}</p>
                <p className="text-xs text-brand-200">Assessments</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{timelineStats.totalMiniAssessments}</p>
                <p className="text-xs text-brand-200">Practice Tests</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{timelineStats.totalVerifications}</p>
                <p className="text-xs text-brand-200">Verifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Before vs After */}
      {before && after && (
        <BeforeAfterCard before={before} after={after} improvement={improvement} />
      )}

      {/* What Changed */}
      {skillImprovements.length > 0 && (
        <WhatChangedCard skillImprovements={skillImprovements} />
      )}

      {/* Readiness Progress Chart */}
      {chartData.length > 1 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-surface-900">Readiness Progress</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                formatter={(value) => [`${value}%`, 'Readiness']}
              />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" fill="url(#progressGrad)" strokeWidth={2.5} dot={{ r: 4, fill: '#4f46e5' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Job Impact */}
      {jobImpact && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-surface-900">Job Match Impact</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-600">{jobImpact.currentMatchCount}</span>
                <span className="text-sm text-surface-500">of {jobImpact.totalJobs} jobs match your profile</span>
              </div>
              <p className="text-sm text-surface-500 mt-2">
                {jobImpact.currentMatchCount >= 10 ? 'Strong coverage — many opportunities match your skills.' :
                  jobImpact.currentMatchCount >= 5 ? 'Good coverage — several roles match your profile.' :
                    'Build more skills to unlock more job matches.'}
              </p>
            </div>
            <Link to="/jobs" className="btn-primary text-sm inline-flex items-center gap-2 whitespace-nowrap">
              View Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-surface-500" />
            <h2 className="text-lg font-semibold text-surface-900">Your Journey Timeline</h2>
          </div>
          {timeline.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {timeline.map((event, i) => (
                <TimelineEvent key={i} event={event} isLast={i === timeline.length - 1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-sm text-surface-500 mb-4">No journey events yet.</p>
              <Link to="/assessment" className="btn-primary text-sm inline-flex items-center gap-2">
                Start Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Next Best Action */}
          {nextBestAction && (
            <div className="card p-6 border-2 border-amber-200 bg-amber-50/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Next Best Action</p>
                  <h3 className="text-lg font-bold text-surface-900">Improve {nextBestAction.skillName}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-surface-600">
                    <span>Current: <strong>{nextBestAction.currentScore}%</strong></span>
                    <span>Required: <strong>{nextBestAction.requiredScore}%</strong></span>
                    <span className="text-red-600 font-bold">Gap: {nextBestAction.gap} points</span>
                  </div>
                </div>
                <Link to="/learning-journey" className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-1">
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Learning Stats */}
          {learningStats && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-sky-600" />
                <h2 className="text-lg font-semibold text-surface-900">Learning Progress</h2>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${learningStats.progress}%` }} />
                </div>
                <span className="text-sm font-bold text-surface-900">{learningStats.progress}%</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 rounded-lg bg-surface-50">
                  <p className="text-lg font-bold text-surface-900">{learningStats.totalItems}</p>
                  <p className="text-xs text-surface-500">Total</p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-600">{learningStats.completed}</p>
                  <p className="text-xs text-surface-500">Done</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50">
                  <p className="text-lg font-bold text-amber-600">{learningStats.inProgress}</p>
                  <p className="text-xs text-surface-500">Active</p>
                </div>
              </div>
              <Link to="/roadmap" className="mt-4 btn-secondary text-sm w-full inline-flex items-center justify-center gap-2">
                View Roadmap <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Top Strengths */}
          {currentReadiness.topStrengths?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Strengths
              </h2>
              <div className="flex flex-wrap gap-2">
                {currentReadiness.topStrengths.map((s, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-5">The Career Readiness Loop</h2>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {[
            { label: 'Assess', color: 'bg-brand-100 text-brand-700', icon: Brain },
            { label: 'Identify Gaps', color: 'bg-red-50 text-red-700', icon: Target },
            { label: 'Learn', color: 'bg-sky-50 text-sky-700', icon: BookOpen },
            { label: 'Practice', color: 'bg-amber-50 text-amber-700', icon: Zap },
            { label: 'Verify', color: 'bg-emerald-50 text-emerald-700', icon: Shield },
            { label: 'Improve', color: 'bg-brand-50 text-brand-700', icon: TrendingUp },
            { label: 'Better Matches', color: 'bg-emerald-100 text-emerald-700', icon: Briefcase },
          ].map((step, i, arr) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${step.color} font-medium text-sm`}>
                  <Icon className="w-4 h-4" />
                  {step.label}
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-surface-300 hidden sm:block" />}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-surface-400 mt-4">
          This cycle continuously improves your career readiness as you engage with the platform.
        </p>
      </div>
    </div>
  );
}
