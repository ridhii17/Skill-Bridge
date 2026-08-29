import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Loader2, Users, Briefcase, BarChart3, BookOpen, FileCheck, Target, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5 text-white" /></div>
        <p className="text-sm text-surface-500">{label}</p>
      </div>
      <p className="text-2xl font-bold text-surface-900">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => api.get('/admin/users'),
    enabled: activeTab === 'users',
  });

  const { data: jobsData } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: () => api.get('/admin/jobs'),
    enabled: activeTab === 'jobs',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-20">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Access Denied</h1>
        <p className="text-surface-500">Admin access required</p>
      </div>
    );
  }

  if (statsLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const s = stats?.data || {};

  const roleData = [
    { name: 'Candidates', value: s.users?.candidates || 0 },
    { name: 'Mentors', value: Math.max(0, (s.users?.total || 0) - (s.users?.candidates || 0)) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Admin Dashboard</h1>
        <p className="text-surface-500">Platform management and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 p-1 rounded-xl w-fit flex-wrap">
        {['overview', 'users', 'jobs'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${activeTab === tab ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={s.users?.total || 0} color="bg-brand-600" />
            <StatCard icon={Briefcase} label="Active Jobs" value={s.jobs?.active || 0} color="bg-emerald-600" />
            <StatCard icon={FileCheck} label="Assessments Taken" value={s.attempts || 0} color="bg-amber-600" />
            <StatCard icon={BarChart3} label="Average Score" value={`${s.averageScore || 0}%`} color="bg-sky-600" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Target} label="Career Roles" value={s.careers || 0} color="bg-purple-600" />
            <StatCard icon={BookOpen} label="Learning Resources" value={s.resources || 0} color="bg-rose-600" />
            <StatCard icon={BarChart3} label="Skills Defined" value={s.skills || 0} color="bg-teal-600" />
            <StatCard icon={FileCheck} label="Assessments" value={s.assessments || 0} color="bg-indigo-600" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-4">Users by Role</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {roleData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-4">Platform Overview</h3>
              <div className="space-y-3">
                {[
                  { label: 'Skills Defined', value: s.skills || 0, max: 50 },
                  { label: 'Career Paths', value: s.careers || 0, max: 10 },
                  { label: 'Learning Resources', value: s.resources || 0, max: 30 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-surface-600">{item.label}</span>
                      <span className="font-medium text-surface-900">{item.value}</span>
                    </div>
                    <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (item.value / item.max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {(usersData?.data || []).map((u) => (
                  <tr key={u._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{u.name}</td>
                    <td className="px-4 py-3 text-surface-500">{u.email}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'mentor' ? 'badge-success' : 'badge-brand'}`}>{u.role}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Location</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-surface-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {(jobsData?.data || []).map((j) => (
                  <tr key={j._id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{j.title}</td>
                    <td className="px-4 py-3 text-surface-500">{j.company}</td>
                    <td className="px-4 py-3 text-surface-500">{j.location}</td>
                    <td className="px-4 py-3"><span className="badge bg-surface-100 text-surface-600">{j.jobType?.replace('_', ' ')}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${j.isActive ? 'badge-success' : 'badge-danger'}`}>{j.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
