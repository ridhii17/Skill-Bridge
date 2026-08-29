import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { careerApi, candidateApi } from '../api/app.api';
import { Loader2, CheckCircle2, AlertTriangle, Target, ArrowRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';

const STATUS_CONFIG = {
  ready: { label: 'Ready', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
  developing: { label: 'Developing', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', icon: Target },
  needs_improvement: { label: 'Needs Improvement', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', icon: AlertTriangle },
  critical_gap: { label: 'Critical Gap', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', icon: AlertTriangle },
};

export default function Skills() {
  const { data: gapData, isLoading: gapLoading } = useQuery({
    queryKey: ['gapAnalysis'],
    queryFn: careerApi.gapAnalysis,
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: candidateApi.getProfile,
  });

  if (gapLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const gap = gapData?.data?.gapAnalysis;
  const careerTitle = gapData?.data?.career?.title;
  const readinessLevel = gapData?.data?.readinessLevel;
  const readinessLabel = gapData?.data?.readinessLabel;

  if (!gap) {
    return (
      <div className="card p-12 text-center">
        <Target className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">No Analysis Available</h2>
        <p className="text-surface-500 mb-6">Complete your profile, set a career goal, and add skills to see your gap analysis.</p>
        <Link to="/career-explorer" className="btn-primary">Set Career Goal <ArrowRight className="w-4 h-4" /></Link>
      </div>
    );
  }

  const radarData = gap.gaps?.map((g) => ({
    skill: g.skillName.length > 12 ? g.skillName.slice(0, 12) + '…' : g.skillName,
    current: g.currentScore,
    required: g.requiredScore,
    fullMark: 100,
  })) || [];

  const barData = gap.gaps?.filter((g) => g.gap > 0).map((g) => ({
    name: g.skillName.length > 15 ? g.skillName.slice(0, 15) + '…' : g.skillName,
    gap: g.gap,
    priority: g.priority,
    status: g.status,
  })).slice(0, 8) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Skill Analysis</h1>
        <p className="text-surface-500 mt-1">
          {careerTitle ? `Gap analysis for ${careerTitle}` : 'Set a career goal to see gap analysis'}
        </p>
      </div>

      {/* Readiness Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={gap.matchPercentage >= 70 ? '#10b981' : gap.matchPercentage >= 40 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeDasharray={`${gap.matchPercentage * 3.27} 327`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-surface-900">{gap.matchPercentage}%</span>
              <span className="text-xs text-surface-500">match</span>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-surface-900">Career Readiness: {readinessLabel}</h2>
            <p className="text-surface-500 mt-1">{gap.skillsReady} of {gap.totalRequired} required skills ready</p>
            <div className="flex gap-2 mt-3">
              <Link to="/career-explorer" className="btn-secondary text-sm py-1.5">Change Career</Link>
              <Link to="/learning" className="btn-primary text-sm py-1.5">Start Learning</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Radar Chart */}
        {radarData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Current vs Required</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#64748b' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Radar name="Current" dataKey="current" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                <Radar name="Required" dataKey="required" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeDasharray="5 5" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Priority Gaps Bar Chart */}
        {barData.length > 0 && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 mb-4">Priority Gaps</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="gap" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.status === 'critical_gap' ? '#ef4444' : entry.status === 'needs_improvement' ? '#f97316' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Detailed Gap List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 mb-4">Detailed Analysis</h3>
        <div className="space-y-3">
          {gap.gaps?.map((g, i) => {
            const config = STATUS_CONFIG[g.status] || STATUS_CONFIG.developing;
            const StatusIcon = config.icon;
            return (
              <div key={i} className="p-4 rounded-xl border border-surface-100 hover:border-surface-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${config.text}`} />
                    <span className="font-medium text-surface-900">{g.skillName}</span>
                  </div>
                  <span className={`badge ${config.bg} ${config.text}`}>{config.label}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-surface-500">
                  <span>Current: <strong className="text-surface-700">{g.currentScore}%</strong></span>
                  <span>Required: <strong className="text-surface-700">{g.requiredScore}%</strong></span>
                  <span>Gap: <strong className={g.gap > 0 ? 'text-red-600' : 'text-emerald-600'}>{g.gap > 0 ? `+${g.gap}` : g.gap}%</strong></span>
                  <span>Priority: <strong className="text-surface-700">{g.priority}</strong></span>
                </div>
                <div className="mt-2 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-surface-300 rounded-full" style={{ width: `${g.requiredScore}%` }}>
                    <div className={`h-full ${g.currentScore >= g.requiredScore ? 'bg-emerald-500' : 'bg-brand-500'} rounded-full`} style={{ width: `${(g.currentScore / g.requiredScore) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
