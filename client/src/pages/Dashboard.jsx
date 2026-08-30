import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardApi, adaptiveApi } from '../api/app.api';
import {
  Loader2, Target, BarChart3, Briefcase, BookOpen, Map,
  TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, Zap, Brain,
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <div className="card-hover p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-sm text-surface-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
    </div>
  );
  return link ? <Link to={link} className="block">{content}</Link> : content;
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
  });

  const { data: nextActionData } = useQuery({
    queryKey: ['nextAction'],
    queryFn: adaptiveApi.nextAction,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="card p-8 text-center">
      <p className="text-red-600">Failed to load dashboard. Please try again.</p>
    </div>
  );

  const d = data?.data;
  if (!d) return null;

  const nextAction = nextActionData?.data;

  const radarData = (d.skillOverview || []).slice(0, 8).map((s) => ({
    skill: s.skill.length > 10 ? s.skill.slice(0, 10) + '…' : s.skill,
    score: s.score,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card p-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {d.user?.name?.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-brand-100">
          {d.careerGoal
            ? `Your career goal: ${d.careerGoal.title}`
            : 'Set your career goal to get personalized insights'}
        </p>
      </div>

      {/* Career Readiness Intelligence Card */}
      {d.gapAnalysis && (
        <Link to="/career-readiness" className="block">
          <div className="card p-5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-medium text-brand-100 uppercase tracking-wider">Career Readiness Intelligence</p>
                  <p className="text-2xl font-bold">{d.gapAnalysis.matchPercentage}%</p>
                </div>
              </div>
              <div className="flex-1 hidden sm:block">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-brand-100">Target:</span>
                  <span className="text-sm font-semibold">{d.careerGoal?.title || 'Not set'}</span>
                </div>
                <p className="text-xs text-brand-200">
                  {d.gapAnalysis.skillsReady}/{d.gapAnalysis.totalRequired} skills ready · 
                  {d.readinessLabel || 'Analysis pending'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium bg-white/20 px-4 py-2 rounded-lg">
                View Full Analysis <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Next Best Action */}
      {nextAction && nextAction.title && (
        <div className="card p-5 border-2 border-amber-200 bg-amber-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-100">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Your Next Best Action</p>
              <h3 className="text-lg font-bold text-surface-900">{nextAction.title}</h3>
              <p className="text-sm text-surface-600 mt-0.5">{nextAction.reason}</p>
            </div>
            <div>
              {nextAction.type === 'mini_assessment' && nextAction.skill && (
                <Link to="/learning-journey" className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-1">
                  <Brain className="w-4 h-4" /> Check Understanding
                </Link>
              )}
              {nextAction.type === 'learning' && (
                <Link to="/roadmap" className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-1">
                  Continue Learning <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {nextAction.type === 'path_generation' && (
                <Link to="/roadmap" className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-1">
                  Generate Path <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {nextAction.type === 'assessment' && (
                <Link to="/assessment" className="btn-primary text-sm whitespace-nowrap inline-flex items-center gap-1">
                  Take Assessment <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Career Goal" value={d.careerGoal?.title || 'Not set'} color="bg-brand-600" link="/career-explorer" />
        <StatCard icon={BarChart3} label="Overall Score" value={`${d.overallScore}%`} color="bg-emerald-600" link="/career-readiness" />
        <StatCard icon={Briefcase} label="Job Matches" value={d.jobMatches?.length || 0} color="bg-amber-600" link="/jobs" />
        <StatCard icon={BookOpen} label="Learning Progress" value={`${d.learningPath?.progress || 0}%`} color="bg-sky-600" link="/roadmap" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Readiness */}
        {d.gapAnalysis && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Career Readiness</h2>
              <Link to="/skills" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View Details →</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={d.gapAnalysis.matchPercentage >= 70 ? '#10b981' : d.gapAnalysis.matchPercentage >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray={`${d.gapAnalysis.matchPercentage * 2.64} 264`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-surface-900">{d.gapAnalysis.matchPercentage}%</span>
                </div>
              </div>
              <div>
                <p className={`badge ${d.readinessLevel === 'ready' ? 'badge-success' : d.readinessLevel === 'approaching' ? 'badge-warning' : 'badge-danger'}`}>
                  {d.readinessLabel}
                </p>
                <p className="text-sm text-surface-500 mt-1">{d.gapAnalysis.skillsReady}/{d.gapAnalysis.totalRequired} skills ready</p>
              </div>
            </div>
            {d.gapAnalysis.criticalGaps?.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Critical Gaps</span>
                </div>
                <p className="text-sm text-red-600">{d.gapAnalysis.criticalGaps.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Skill Radar */}
        {radarData.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">Skill Overview</h2>
              <Link to="/skills" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Analyze →</Link>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} />
                <Radar name="Score" dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Strengths */}
        {d.skillOverview?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Top Strengths</h2>
            <div className="space-y-3">
              {d.skillOverview.slice(0, 5).map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-surface-700 flex-1">{s.skill}</span>
                  <div className="w-24 h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.score}%` }} />
                  </div>
                  <span className="text-sm font-medium text-surface-900 w-10 text-right">{s.score}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Matches */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Recommended Jobs</h2>
            <Link to="/jobs" className="text-sm text-brand-600 hover:text-brand-700 font-medium">View All →</Link>
          </div>
          {d.jobMatches?.length > 0 ? (
            <div className="space-y-3">
              {d.jobMatches.map((jm, i) => (
                <Link key={i} to={`/jobs/${jm.job._id}`} className="block p-3 rounded-lg border border-surface-100 hover:border-surface-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-surface-900">{jm.job.title}</p>
                      <p className="text-sm text-surface-500">{jm.job.company} · {jm.job.location}</p>
                    </div>
                    <span className={`badge ${jm.match.matchScore >= 70 ? 'badge-success' : jm.match.matchScore >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                      {jm.match.matchScore}% match
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-surface-500">Complete your profile and take an assessment to see matches.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/career-explorer" className="card-hover p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-50"><Target className="w-6 h-6 text-brand-600" /></div>
          <div><p className="font-semibold text-surface-900">Set Career Goal</p><p className="text-sm text-surface-500">Choose your target career</p></div>
          <ArrowRight className="w-5 h-5 text-surface-400 ml-auto" />
        </Link>
        <Link to="/assessment" className="card-hover p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50"><BarChart3 className="w-6 h-6 text-emerald-600" /></div>
          <div><p className="font-semibold text-surface-900">Take Assessment</p><p className="text-sm text-surface-500">Test your competencies</p></div>
          <ArrowRight className="w-5 h-5 text-surface-400 ml-auto" />
        </Link>
        <Link to="/roadmap" className="card-hover p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50"><Map className="w-6 h-6 text-amber-600" /></div>
          <div><p className="font-semibold text-surface-900">Your Roadmap</p><p className="text-sm text-surface-500">Follow your learning path</p></div>
          <ArrowRight className="w-5 h-5 text-surface-400 ml-auto" />
        </Link>
      </div>
    </div>
  );
}
