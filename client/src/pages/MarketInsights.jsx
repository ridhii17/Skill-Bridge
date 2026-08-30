import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { marketApi } from '../api/app.api';
import {
  Loader2, TrendingUp, MapPin, IndianRupee, Briefcase, BarChart3, AlertCircle,
  CheckCircle2, X, Target, ArrowRight, Sparkles, Zap, ChevronDown, ChevronUp,
  Globe, Clock, Users, Award,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1'];

const EMERGING_SKILLS = [
  { name: 'AI Integration', trend: 'Very High', growth: '+45%', note: 'LLM, prompt engineering, AI tooling' },
  { name: 'Cloud Computing', trend: 'High', growth: '+32%', note: 'AWS, Azure, GCP, serverless' },
  { name: 'Cybersecurity', trend: 'High', growth: '+28%', note: 'Threat detection, compliance' },
  { name: 'Data Engineering', trend: 'Medium-High', growth: '+25%', note: 'ETL pipelines, data lakes' },
  { name: 'System Design', trend: 'Medium-High', growth: '+22%', note: 'Distributed systems, scalability' },
];

function SkillDemandBar({ skills, maxCount }) {
  return (
    <div className="space-y-3">
      {skills.map((skill, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-sm font-medium text-surface-900 w-36 truncate">{skill.name}</span>
          <div className="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all ${
                skill.demandLevel === 'High' ? 'bg-brand-500' : skill.demandLevel === 'Medium' ? 'bg-amber-400' : 'bg-surface-300'
              }`}
              style={{ width: `${skill.percentage || (skill.count / (maxCount || 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-surface-600 w-20 text-right">
            {skill.percentage !== undefined ? `${skill.percentage}%` : `${skill.count} jobs`}
          </span>
          {skill.demandLevel && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              skill.demandLevel === 'High' ? 'bg-brand-50 text-brand-700' : skill.demandLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-surface-100 text-surface-500'
            }`}>
              {skill.demandLevel}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MarketInsights() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: insightsData, isLoading } = useQuery({
    queryKey: ['marketInsights'],
    queryFn: marketApi.insights,
  });

  const { data: candidateData, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidateMarketInsights'],
    queryFn: marketApi.candidateInsights,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const m = insightsData?.data || {};
  const c = candidateData?.data || {};

  const tabs = [
    { id: 'overview', label: 'Market Overview' },
    { id: 'candidate', label: 'Your Market Position' },
    { id: 'emerging', label: 'Emerging Skills' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Job Market Intelligence</h1>
        </div>
        <p className="text-surface-500">Understand what skills employers are looking for and how your profile compares.</p>
      </div>

      {/* Demo Banner */}
      {m.isDemo && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div>
            <span className="font-medium">Demo Dataset</span> — These statistics reflect our seeded demo job listings ({m.totalJobs || 0} jobs), not real-time market data.
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════ TAB: OVERVIEW ═══════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Briefcase className="w-5 h-5 text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{m.totalJobs || 0}</div>
              <p className="text-xs text-surface-500">Total Jobs</p>
            </div>
            <div className="card p-4 text-center">
              <Target className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{m.topSkills?.length || 0}</div>
              <p className="text-xs text-surface-500">Unique Skills</p>
            </div>
            <div className="card p-4 text-center">
              <MapPin className="w-5 h-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{m.locations?.length || 0}</div>
              <p className="text-xs text-surface-500">Locations</p>
            </div>
            <div className="card p-4 text-center">
              <Users className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{m.jobsByRole?.length || 0}</div>
              <p className="text-xs text-surface-500">Career Roles</p>
            </div>
          </div>

          {/* Most Demanded Skills */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Most In-Demand Skills
            </h2>
            <SkillDemandBar skills={m.topSkills || []} maxCount={m.topSkills?.[0]?.count || 1} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs by Role */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                Jobs by Career Role
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={m.jobsByRole || []} margin={{ bottom: 30 }}>
                  <XAxis dataKey="title" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {(m.jobsByRole || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Locations */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                Job Distribution by Location
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={m.locations || []}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                  >
                    {(m.locations || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Salary Insights */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-1 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-emerald-600" />
              Salary Insights by Role
            </h2>
            <p className="text-xs text-surface-400 mb-4">Based on available dataset · Clearly labeled demo data</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(m.salaryRanges || []).map((sr, i) => (
                <div key={i} className="p-4 rounded-xl border border-surface-100 hover:border-surface-200 transition-colors">
                  <p className="font-medium text-surface-900 text-sm">{sr.role}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-lg font-bold text-surface-900">
                      ₹{(sr.avgMin / 100000).toFixed(1)}–{(sr.avgMax / 100000).toFixed(1)}
                    </span>
                    <span className="text-xs text-surface-500">LPA</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                    <span>Min: ₹{(sr.min / 100000).toFixed(1)}L</span>
                    <span>Max: ₹{(sr.max / 100000).toFixed(1)}L</span>
                  </div>
                  <p className="text-[10px] text-surface-400 mt-2">{sr.jobCount} jobs in dataset</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Experience Distribution */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Experience Distribution
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={m.experienceDistribution || []}>
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Job Types */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Job Types
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={m.jobTypes || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, count }) => `${name}: ${count}`}>
                    {(m.jobTypes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* ═══════════ TAB: CANDIDATE POSITION ═══════════ */}
      {activeTab === 'candidate' && (
        <>
          {!c.hasProfile && c.hasProfile !== undefined ? (
            <div className="card p-12 text-center max-w-lg mx-auto">
              <Target className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-surface-900 mb-2">Complete Your Profile</h2>
              <p className="text-surface-500 mb-6">{c.message}</p>
              <Link to="/profile" className="btn-primary inline-flex items-center gap-2">
                Set Up Profile <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* Your Market Position */}
              {c.personalizedPosition && (
                <div className="card p-6 bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-100">
                  <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-600" />
                    Your Market Position
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-xl bg-white">
                      <p className="text-xs text-surface-500 mb-1">Target Role</p>
                      <p className="font-bold text-surface-900">{c.personalizedPosition.targetRole}</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white">
                      <p className="text-xs text-surface-500 mb-1">Profile Readiness</p>
                      <p className={`text-2xl font-bold ${c.personalizedPosition.profileReadiness >= 70 ? 'text-emerald-600' : c.personalizedPosition.profileReadiness >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                        {c.personalizedPosition.profileReadiness}%
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-white">
                      <p className="text-xs text-surface-500 mb-1">Market Skills Match</p>
                      <p className="text-2xl font-bold text-brand-600">
                        {c.candidateSkillCount || 0} skills
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-white">
                      <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Strong Market Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.personalizedPosition.strongMarketSkills?.length > 0 ? (
                          c.personalizedPosition.strongMarketSkills.map((s, i) => (
                            <span key={i} className="badge bg-emerald-50 text-emerald-700 text-xs">{s}</span>
                          ))
                        ) : (
                          <span className="text-xs text-surface-400">Take an assessment to identify your market skills</span>
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white">
                      <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-2">Market Gaps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.personalizedPosition.weakMarketSkills?.length > 0 ? (
                          c.personalizedPosition.weakMarketSkills.map((s, i) => (
                            <span key={i} className="badge bg-amber-50 text-amber-700 text-xs">{s}</span>
                          ))
                        ) : (
                          <span className="text-xs text-emerald-600">Your skills cover all top market demands</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {c.personalizedPosition.recommendedAction && (
                    <div className="p-3 rounded-xl bg-white border border-brand-100">
                      <p className="text-xs font-medium text-brand-600 mb-1">Recommended Action</p>
                      <p className="text-sm text-surface-700">{c.personalizedPosition.recommendedAction}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Market Gap Analysis for Target Career */}
              {c.marketGap && (
                <div className="card p-6">
                  <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-600" />
                    Market Gap Analysis — {c.marketGap.careerTitle}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="text-center p-3 rounded-lg bg-surface-50">
                      <div className="text-lg font-bold text-surface-900">{c.marketGap.totalCareerJobs}</div>
                      <p className="text-xs text-surface-500">Jobs for Role</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-surface-50">
                      <div className="text-lg font-bold text-emerald-600">{c.marketGap.matchedSkills}</div>
                      <p className="text-xs text-surface-500">Skills You Have</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-surface-50">
                      <div className="text-lg font-bold text-red-600">{c.marketGap.highDemandGaps}</div>
                      <p className="text-xs text-surface-500">High-Demand Gaps</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-surface-50">
                      <div className="text-lg font-bold text-brand-600">{c.marketGap.gapScore}%</div>
                      <p className="text-xs text-surface-500">Coverage</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(c.marketGap.demandedSkills || []).map((skill, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        skill.hasSkill ? 'bg-emerald-50/50 border-emerald-200' : skill.demandLevel === 'High' ? 'bg-red-50/50 border-red-200' : 'bg-white border-surface-100'
                      }`}>
                        {skill.hasSkill ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium text-surface-900 flex-1">{skill.name}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          skill.demandLevel === 'High' ? 'bg-brand-50 text-brand-700' : skill.demandLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-surface-100 text-surface-500'
                        }`}>
                          {skill.demandLevel} ({skill.demandPercentage}%)
                        </span>
                        {skill.hasSkill && skill.candidateScore > 0 && (
                          <span className="text-xs text-surface-500">Score: {skill.candidateScore}%</span>
                        )}
                        <span className={`text-xs font-medium ${skill.hasSkill ? 'text-emerald-600' : 'text-red-600'}`}>
                          {skill.hasSkill ? '✓ You have this' : '✗ Gap'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══════════ TAB: EMERGING SKILLS ═══════════ */}
      {activeTab === 'emerging' && (
        <>
          <div className="card p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <div>
              <span className="font-medium">Projected Skill Trend — Prototype</span> — This section uses transparent methodology based on industry reports and pattern analysis. It is not a real-time prediction engine.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EMERGING_SKILLS.map((skill, i) => (
              <div key={i} className="card p-5 hover:border-brand-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-surface-900">{skill.name}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    skill.trend === 'Very High' ? 'bg-red-50 text-red-700' : skill.trend === 'High' ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'
                  }`}>
                    {skill.trend}
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-emerald-600">{skill.growth}</span>
                  <span className="text-xs text-surface-500">projected growth</span>
                </div>
                <p className="text-sm text-surface-500">{skill.note}</p>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" />
              Methodology
            </h2>
            <div className="text-sm text-surface-600 space-y-2">
              <p>Trend projections are derived from:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Analysis of skill demand patterns in our job dataset</li>
                <li>Industry report benchmarks (NASSCOM, Gartner, LinkedIn Workforce Reports)</li>
                <li>Historical skill frequency analysis across job postings</li>
              </ul>
              <p className="text-xs text-surface-400 mt-2">Note: These are projected trends for prototype demonstration purposes. Actual market conditions may vary.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
