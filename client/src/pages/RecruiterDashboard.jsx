import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recruiterApi, skillApi } from '../api/app.api';
import {
  Loader2, Briefcase, Users, Plus, Search, Star, CheckCircle2, X,
  ChevronRight, Eye, Trash2, ArrowRight, BarChart3, Award, MapPin,
  IndianRupee, Clock, Filter, XCircle, MessageSquare, ExternalLink,
} from 'lucide-react';

const SHORTLIST_STATUS = {
  shortlisted: { label: 'Shortlisted', color: 'text-brand-700', bg: 'bg-brand-50' },
  contacted: { label: 'Contacted', color: 'text-amber-700', bg: 'bg-amber-50' },
  interviewing: { label: 'Interviewing', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  offered: { label: 'Offered', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-50' },
};

function CreateJobModal({ skills, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'full_time',
    salary: { min: '', max: '' }, experienceRequired: 0, educationRequired: '',
    requiredSkills: [],
  });

  const createMutation = useMutation({
    mutationFn: recruiterApi.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries(['recruiterJobs']);
      onSuccess();
    },
  });

  const addSkill = (skillId) => {
    if (!form.requiredSkills.find((s) => s.skill === skillId)) {
      setForm({ ...form, requiredSkills: [...form.requiredSkills, { skill: skillId, minimumScore: 50, importanceWeight: 1 }] });
    }
  };

  const removeSkill = (skillId) => {
    setForm({ ...form, requiredSkills: form.requiredSkills.filter((s) => s.skill !== skillId) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      salary: { min: Number(form.salary.min) || 0, max: Number(form.salary.max) || 0 },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900">Create Job Posting</h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-surface-700">Job Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field w-full mt-1" required placeholder="e.g., Full Stack Developer" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-surface-700">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field w-full mt-1" rows={3} required placeholder="Describe the role, responsibilities..." />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Location *</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field w-full mt-1" required placeholder="e.g., Bangalore" />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Job Type *</label>
              <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="input-field w-full mt-1">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Min Salary (₹)</label>
              <input type="number" value={form.salary.min} onChange={(e) => setForm({ ...form, salary: { ...form.salary, min: e.target.value } })} className="input-field w-full mt-1" placeholder="e.g., 500000" />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Max Salary (₹)</label>
              <input type="number" value={form.salary.max} onChange={(e) => setForm({ ...form, salary: { ...form.salary, max: e.target.value } })} className="input-field w-full mt-1" placeholder="e.g., 1200000" />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Experience (years)</label>
              <input type="number" value={form.experienceRequired} onChange={(e) => setForm({ ...form, experienceRequired: Number(e.target.value) })} className="input-field w-full mt-1" min="0" />
            </div>
            <div>
              <label className="text-sm font-medium text-surface-700">Education</label>
              <input value={form.educationRequired} onChange={(e) => setForm({ ...form, educationRequired: e.target.value })} className="input-field w-full mt-1" placeholder="e.g., B.Tech" />
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <label className="text-sm font-medium text-surface-700">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {form.requiredSkills.map((rs) => {
                const sk = skills.find((s) => s._id === rs.skill);
                return (
                  <span key={rs.skill} className="badge bg-brand-50 text-brand-700 flex items-center gap-1">
                    {sk?.name || 'Skill'}
                    <button type="button" onClick={() => removeSkill(rs.skill)} className="hover:text-red-600"><X className="w-3 h-3" /></button>
                  </span>
                );
              })}
            </div>
            <select onChange={(e) => { if (e.target.value) addSkill(e.target.value); e.target.value = ''; }} className="input-field w-full mt-2 text-sm">
              <option value="">+ Add a skill...</option>
              {skills.filter((s) => !form.requiredSkills.find((rs) => rs.skill === s._id)).map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CandidateMatchCard({ match, onShortlist }) {
  const [expanded, setExpanded] = useState(false);
  const score = match.match?.matchScore || 0;

  return (
    <div className="card p-5 hover:border-brand-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
            {match.candidate?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">{match.candidate?.name}</h3>
            <p className="text-xs text-surface-500">{match.profile?.experience || 0}yr exp · {match.profile?.education || 'N/A'}</p>
          </div>
        </div>
        <div className={`text-2xl font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
          {score}%
        </div>
      </div>

      {/* Verified Skills */}
      {match.verifiedSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Verified Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {match.verifiedSkills.map((vs, i) => (
              <span key={i} className="badge bg-emerald-50 text-emerald-700 text-xs">
                <CheckCircle2 className="w-3 h-3 inline mr-0.5" />{vs.skill} {vs.level}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matching Skills */}
      {match.matchingSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">Matching Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {match.matchingSkills.map((ms, i) => (
              <span key={i} className="badge bg-brand-50 text-brand-700 text-xs">{ms.name} {ms.score}%</span>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {match.missingSkills?.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">Skill Gaps</p>
          <div className="flex flex-wrap gap-1.5">
            {match.missingSkills.map((ms, i) => (
              <span key={i} className="badge bg-red-50 text-red-700 text-xs">{ms.name} (gap: {ms.gap})</span>
            ))}
          </div>
        </div>
      )}

      {/* Expand breakdown */}
      <button onClick={() => setExpanded(!expanded)} className="text-xs text-brand-600 hover:text-brand-700 mb-3 flex items-center gap-1">
        {expanded ? 'Hide' : 'Show'} Match Breakdown <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && match.match?.breakdown && (
        <div className="space-y-2 mb-3 p-3 bg-surface-50 rounded-lg">
          {Object.entries(match.match.breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-surface-600 capitalize">{key}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${val.score}%` }} />
                </div>
                <span className="font-medium text-surface-900 w-8 text-right">{val.score}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {match.isShortlisted ? (
          <span className="badge bg-emerald-50 text-emerald-700 text-xs"><CheckCircle2 className="w-3 h-3 inline mr-0.5" /> Shortlisted</span>
        ) : (
          <button onClick={() => onShortlist(match)} className="btn-primary text-xs py-1.5 flex items-center gap-1">
            <Star className="w-3.5 h-3.5" /> Shortlist
          </button>
        )}
        <button onClick={() => setExpanded(!expanded)} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> Details
        </button>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [candidateFilter, setCandidateFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: skillsData } = useQuery({ queryKey: ['skills'], queryFn: () => skillApi.list() });
  const skills = skillsData?.data || [];

  const { data: statsData } = useQuery({ queryKey: ['recruiterStats'], queryFn: recruiterApi.stats });
  const stats = statsData?.data || {};

  const { data: jobsData, isLoading: jobsLoading } = useQuery({ queryKey: ['recruiterJobs'], queryFn: recruiterApi.myJobs });
  const jobs = jobsData?.data || [];

  const { data: matchesData, isLoading: matchesLoading, refetch: refetchMatches } = useQuery({
    queryKey: ['jobMatches', selectedJob],
    queryFn: () => recruiterApi.jobMatches(selectedJob),
    enabled: !!selectedJob,
  });

  const { data: candidatesData } = useQuery({
    queryKey: ['recruiterCandidates', candidateFilter],
    queryFn: () => recruiterApi.candidates(candidateFilter ? { skill: candidateFilter } : {}),
  });

  const { data: shortlistsData } = useQuery({ queryKey: ['recruiterShortlists'], queryFn: recruiterApi.shortlists });

  const shortlistMutation = useMutation({
    mutationFn: recruiterApi.shortlist,
    onSuccess: () => {
      queryClient.invalidateQueries(['jobMatches']);
      queryClient.invalidateQueries(['recruiterShortlists']);
    },
  });

  const handleShortlist = (match) => {
    shortlistMutation.mutate({
      jobId: selectedJob,
      candidateId: match.candidate._id,
      matchScore: match.match?.matchScore || 0,
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'jobs', label: 'My Jobs', icon: Briefcase },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'shortlists', label: 'Shortlists', icon: Star },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-brand-600" />
            <h1 className="text-2xl font-bold text-surface-900">Recruiter Dashboard</h1>
          </div>
          <p className="text-surface-500">Manage jobs, find verified candidates, and build your team</p>
        </div>
        <button onClick={() => setShowCreateJob(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════ DASHBOARD TAB ═══════════ */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Briefcase className="w-5 h-5 text-brand-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{stats.activeJobs || 0}</div>
              <p className="text-xs text-surface-500">Active Jobs</p>
            </div>
            <div className="card p-4 text-center">
              <Star className="w-5 h-5 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{stats.totalShortlisted || 0}</div>
              <p className="text-xs text-surface-500">Shortlisted</p>
            </div>
            <div className="card p-4 text-center">
              <Users className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{stats.totalCandidates || 0}</div>
              <p className="text-xs text-surface-500">Total Candidates</p>
            </div>
            <div className="card p-4 text-center">
              <Award className="w-5 h-5 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-surface-900">{stats.verifiedCandidates || 0}</div>
              <p className="text-xs text-surface-500">Verified (60%+)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Jobs</h2>
              {jobs.length === 0 ? (
                <p className="text-sm text-surface-500">No jobs posted yet. Create your first job posting.</p>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 4).map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                      <div>
                        <p className="font-medium text-surface-900 text-sm">{job.title}</p>
                        <p className="text-xs text-surface-500">{job.location} · {job.shortlistCount || 0} shortlisted</p>
                      </div>
                      <button onClick={() => { setSelectedJob(job._id); setActiveTab('jobs'); }} className="text-brand-600 hover:text-brand-700">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Shortlists */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Shortlists</h2>
              {(!shortlistsData?.data || shortlistsData.data.length === 0) ? (
                <p className="text-sm text-surface-500">No candidates shortlisted yet.</p>
              ) : (
                <div className="space-y-3">
                  {shortlistsData.data.slice(0, 4).map((sl) => {
                    const statusCfg = SHORTLIST_STATUS[sl.status] || SHORTLIST_STATUS.shortlisted;
                    return (
                      <div key={sl._id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                        <div>
                          <p className="font-medium text-surface-900 text-sm">{sl.candidate?.name || 'Unknown'}</p>
                          <p className="text-xs text-surface-500">{sl.job?.title || 'Job'} · {sl.matchScore}% match</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════ JOBS TAB ═══════════ */}
      {activeTab === 'jobs' && (
        <>
          {selectedJob ? (
            <div>
              <button onClick={() => setSelectedJob(null)} className="text-sm text-brand-600 hover:text-brand-700 mb-4 flex items-center gap-1">
                ← Back to jobs
              </button>
              {matchesLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
              ) : matchesData?.data ? (
                <>
                  <div className="card p-5 mb-6">
                    <h2 className="text-lg font-semibold text-surface-900">{matchesData.data.job?.title}</h2>
                    <p className="text-sm text-surface-500">{matchesData.data.totalCandidates} candidates matched · Sorted by match score</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {matchesData.data.matches.map((match) => (
                      <CandidateMatchCard key={match.candidate?._id} match={match} onShortlist={handleShortlist} />
                    ))}
                  </div>
                  {matchesData.data.matches.length === 0 && (
                    <div className="card p-8 text-center">
                      <Users className="w-10 h-10 text-surface-300 mx-auto mb-3" />
                      <p className="text-surface-500">No candidates found for this job.</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : (
            <div>
              {jobsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
              ) : jobs.length === 0 ? (
                <div className="card p-12 text-center max-w-lg mx-auto">
                  <Briefcase className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-surface-900 mb-2">No Jobs Posted</h2>
                  <p className="text-surface-500 mb-6">Create your first job posting to start finding candidates.</p>
                  <button onClick={() => setShowCreateJob(true)} className="btn-primary inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Post New Job
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map((job) => (
                    <div key={job._id} className="card p-5 hover:border-brand-200 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-surface-900">{job.title}</h3>
                        <span className={`badge ${job.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-surface-100 text-surface-500'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-surface-500 mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                        <span>{job.jobType?.replace('_', ' ')}</span>
                        {job.experienceRequired > 0 && <span>{job.experienceRequired}yr exp</span>}
                      </div>
                      {job.salary?.min > 0 && (
                        <p className="text-sm text-surface-600 mb-3">
                          ₹{(job.salary.min / 100000).toFixed(1)}–{(job.salary.max / 100000).toFixed(1)} LPA
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(job.requiredSkills || []).slice(0, 5).map((rs, i) => (
                          <span key={i} className="badge bg-surface-100 text-surface-600 text-xs">{rs.skill?.name || 'Skill'}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedJob(job._id)} className="btn-primary text-xs py-1.5 flex items-center gap-1 flex-1">
                          <Users className="w-3.5 h-3.5" /> Find Matches
                        </button>
                        <button onClick={() => { setSelectedJob(job._id); }} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════ CANDIDATES TAB ═══════════ */}
      {activeTab === 'candidates' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-4 h-4 text-surface-400" />
            <input
              value={candidateFilter}
              onChange={(e) => setCandidateFilter(e.target.value)}
              className="input-field w-64 text-sm"
              placeholder="Filter by verified skill..."
            />
          </div>
          {candidatesData?.data?.candidates?.length === 0 ? (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">No candidates found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(candidatesData?.data?.candidates || []).map((c) => (
                <div key={c._id} className="card p-4 flex items-center gap-4 hover:border-brand-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                    {c.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-surface-900 text-sm">{c.name}</h3>
                      <span className="text-xs text-surface-400">{c.experience}yr · {c.education || 'N/A'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {c.verifiedSkills?.slice(0, 4).map((vs, i) => (
                        <span key={i} className="badge bg-emerald-50 text-emerald-700 text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />{vs.skill} {vs.level}%
                        </span>
                      ))}
                      {c.skills?.filter((s) => !c.verifiedSkills?.find((v) => v.skill === s.name)).slice(0, 3).map((s, i) => (
                        <span key={i} className="badge bg-surface-100 text-surface-500 text-[10px]">{s.name} {s.level}%</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${c.overallScore >= 70 ? 'text-emerald-600' : c.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {c.overallScore}%
                    </div>
                    <p className="text-[10px] text-surface-400">{c.verifiedSkillCount} verified</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════ SHORTLISTS TAB ═══════════ */}
      {activeTab === 'shortlists' && (
        <div>
          {(!shortlistsData?.data || shortlistsData.data.length === 0) ? (
            <div className="card p-12 text-center">
              <Star className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-surface-900 mb-2">No Shortlisted Candidates</h2>
              <p className="text-surface-500">Go to My Jobs, find matches, and shortlist candidates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shortlistsData.data.map((sl) => {
                const statusCfg = SHORTLIST_STATUS[sl.status] || SHORTLIST_STATUS.shortlisted;
                return (
                  <div key={sl._id} className="card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm flex-shrink-0">
                      {sl.candidate?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-900 text-sm">{sl.candidate?.name}</h3>
                      <p className="text-xs text-surface-500">{sl.job?.title || 'Job'} · {sl.matchScore}% match</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.bg} ${statusCfg.color}`}>{statusCfg.label}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {Object.keys(SHORTLIST_STATUS).filter((s) => s !== sl.status).slice(0, 2).map((newStatus) => (
                        <button key={newStatus} onClick={() => {
                          queryClient.setQueryData(['recruiterShortlists'], (old) => ({
                            ...old, data: (old?.data || []).map((s) => s._id === sl._id ? { ...s, status: newStatus } : s),
                          }));
                          recruiterApi.updateShortlist(sl._id, { status: newStatus });
                        }} className="text-[10px] text-surface-400 hover:text-brand-600 px-1">
                          → {SHORTLIST_STATUS[newStatus]?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateJob && (
        <CreateJobModal
          skills={skills}
          onClose={() => setShowCreateJob(false)}
          onSuccess={() => { setShowCreateJob(false); setActiveTab('jobs'); }}
        />
      )}
    </div>
  );
}
