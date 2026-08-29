import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { Loader2, TrendingUp, MapPin, IndianRupee, Briefcase, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function MarketInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ['marketInsights'],
    queryFn: () => api.get('/market/insights'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const m = data?.data || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Job Market Intelligence</h1>
        <p className="text-surface-500 mt-1">Database-based insights from {m.totalJobs || 0} job listings</p>
      </div>

      {m.isDemo && (
        <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Demo Dataset — These statistics reflect our seeded demo data, not real-world market statistics.
        </div>
      )}

      {/* Top Skills */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-600" /> Most In-Demand Skills</h2>
        <div className="space-y-3">
          {m.topSkills?.slice(0, 10).map((skill, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-medium text-surface-900 w-32">{skill.name}</span>
              <div className="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(skill.count / (m.topSkills?.[0]?.count || 1)) * 100}%` }} />
              </div>
              <span className="text-sm font-medium text-surface-600 w-8 text-right">{skill.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Jobs by Role */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-emerald-600" /> Jobs by Role</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={m.jobsByRole || []}>
              <XAxis dataKey="title" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Locations */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-amber-600" /> Job Locations</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={m.locations || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, count }) => `${name}: ${count}`}>
                {(m.locations || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary Ranges */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2"><IndianRupee className="w-5 h-5 text-emerald-600" /> Average Salary by Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(m.salaryRanges || []).map((sr, i) => (
            <div key={i} className="p-4 rounded-xl border border-surface-100">
              <p className="font-medium text-surface-900">{sr.role}</p>
              <p className="text-lg font-bold text-surface-900 mt-1">
                ₹{(sr.avgMin / 100000).toFixed(1)}–{(sr.avgMax / 100000).toFixed(1)} LPA
              </p>
              <p className="text-xs text-surface-500 mt-1">{sr.jobCount} jobs</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Distribution */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Experience Distribution</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={m.experienceDistribution || []}>
            <XAxis dataKey="range" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
