import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { jobApi, aiApi } from '../api/app.api';
import { Loader2, MapPin, Briefcase, IndianRupee, CheckCircle2, XCircle, ArrowRight, Filter, Sparkles } from 'lucide-react';

function JobList() {
  const [filter, setFilter] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: jobApi.myMatches,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  let jobs = data?.data || [];

  // Sort: matched jobs first, then by match score
  jobs.sort((a, b) => (b.match?.matchScore || 0) - (a.match?.matchScore || 0));

  if (filter) {
    jobs = jobs.filter((jm) => jm.job.jobType === filter);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Jobs</h1>
          <p className="text-surface-500 mt-1">{jobs.length} opportunities available</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-surface-400" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto py-2 text-sm">
            <option value="">All Types</option>
            <option value="full_time">Full Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((jm, i) => (
          <Link key={jm.job._id || i} to={`/jobs/${jm.job._id}`} className="card-hover p-5 block">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-surface-900">{jm.job.title}</h3>
                  {jm.job.isDemo && <span className="badge bg-surface-100 text-surface-500 text-[10px]">DEMO</span>}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500">
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {jm.job.company}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {jm.job.location}</span>
                  {jm.job.salary?.min && <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> ₹{(jm.job.salary.min / 100000).toFixed(0)}–{(jm.job.salary.max / 100000).toFixed(0)} LPA</span>}
                  <span className="badge bg-surface-100 text-surface-600">{jm.job.jobType?.replace('_', ' ')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {jm.match?.matchingSkills?.slice(0, 4).map((ms, j) => (
                    <span key={j} className="badge badge-success text-[10px]">✓ {ms.skillId}</span>
                  ))}
                  {jm.match?.missingSkills?.slice(0, 3).map((ms, j) => (
                    <span key={j} className="badge badge-warning text-[10px]">⚠ {ms.skillId}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {jm.match?.matchScore > 0 && (
                  <div className={`text-center px-4 py-2 rounded-xl ${jm.match.matchScore >= 70 ? 'bg-emerald-50' : jm.match.matchScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}`}>
                    <p className={`text-2xl font-bold ${jm.match.matchScore >= 70 ? 'text-emerald-600' : jm.match.matchScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{jm.match.matchScore}%</p>
                    <p className="text-[10px] text-surface-500">match</p>
                  </div>
                )}
                <ArrowRight className="w-5 h-5 text-surface-400" />
              </div>
            </div>
          </Link>
        ))}
        {jobs.length === 0 && (
          <div className="card p-12 text-center">
            <Briefcase className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <p className="text-surface-500">No jobs found. Complete your profile to see matches.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function JobDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.get(id),
  });

  const { data: matchData } = useQuery({
    queryKey: ['jobMatches'],
    queryFn: jobApi.myMatches,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const job = data?.data;
  if (!job) return <div className="card p-8 text-center"><p>Job not found</p></div>;

  const match = matchData?.data?.find((jm) => jm.job._id === id)?.match;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/jobs" className="text-sm text-brand-600 hover:text-brand-700 mb-4 inline-block">← Back to Jobs</Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-surface-500 mt-2">
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              <span className="badge bg-surface-100 text-surface-600">{job.jobType?.replace('_', ' ')}</span>
            </div>
          </div>
          {match && (
            <div className={`text-center px-5 py-3 rounded-xl ${match.matchScore >= 70 ? 'bg-emerald-50' : match.matchScore >= 40 ? 'bg-amber-50' : 'bg-red-50'}`}>
              <p className={`text-3xl font-bold ${match.matchScore >= 70 ? 'text-emerald-600' : match.matchScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{match.matchScore}%</p>
              <p className="text-xs text-surface-500">match</p>
            </div>
          )}
        </div>

        {job.salary?.min && (
          <p className="text-sm text-surface-600 mb-4">💰 ₹{(job.salary.min / 100000).toFixed(0)}–{(job.salary.max / 100000).toFixed(0)} LPA</p>
        )}

        <p className="text-surface-700 leading-relaxed mb-4">{job.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-surface-500">
          {job.experienceRequired > 0 && <span>Experience: {job.experienceRequired}+ years</span>}
          {job.educationRequired && <span>Education: {job.educationRequired}</span>}
        </div>
      </div>

      {/* Required Skills */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Required Skills</h2>
        <div className="space-y-3">
          {job.requiredSkills?.map((rs, i) => {
            const matched = match?.matchingSkills?.some((ms) => ms.skillId === (rs.skill?._id || rs.skill));
            return (
              <div key={i} className="flex items-center gap-3">
                {matched ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-amber-500" />}
                <span className="text-sm font-medium text-surface-700">{rs.skill?.name || 'Skill'}</span>
                <span className="text-xs text-surface-400">min {rs.minimumScore}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Breakdown */}
      {match?.breakdown && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Match Analysis</h2>
          <div className="space-y-3">
            {Object.entries(match.breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-sm text-surface-500 w-28 capitalize">{key}</span>
                <div className="flex-1 h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${val.score >= 70 ? 'bg-emerald-500' : val.score >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${val.score}%` }} />
                </div>
                <span className="text-sm font-medium w-10 text-right">{val.score}%</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-surface-500 mt-4">{match.breakdown.skills?.details}</p>
        </div>
      )}

      {/* AI Explanation */}
      <AIJobExplanation jobId={id} />

      {job.isDemo && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          ⚠ This is a demo listing for demonstration purposes. It is not a real job vacancy.
        </div>
      )}
    </div>
  );
}

function AIJobExplanation({ jobId }) {
  const [showAI, setShowAI] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const mutation = useMutation({
    mutationFn: () => aiApi.explainJob(jobId),
    onSuccess: (data) => setExplanation(data.data),
  });

  const handleExplain = () => {
    setShowAI(true);
    if (!explanation) mutation.mutate();
  };

  if (!showAI) {
    return (
      <button onClick={handleExplain} className="btn-secondary w-full mb-6 justify-center">
        <Sparkles className="w-4 h-4" /> Get AI Job Analysis
      </button>
    );
  }

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-600" />
        <h2 className="text-lg font-semibold text-surface-900">AI Job Analysis</h2>
      </div>

      {mutation.isPending && (
        <div className="flex items-center gap-2 text-surface-500 py-4">
          <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your match...
        </div>
      )}

      {mutation.isError && (
        <p className="text-sm text-red-600">Failed to load analysis. Please try again.</p>
      )}

      {explanation && (
        <div className="space-y-4">
          {explanation.source && (
            <p className="text-xs text-surface-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {explanation.source}
              {explanation.isAIGenerated === false && ' — AI unavailable, using deterministic analysis'}
            </p>
          )}
          <p className="text-sm text-surface-700 leading-relaxed">{explanation.explanation}</p>
          {explanation.strongPoints?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Strong Points</p>
              <ul className="text-sm text-surface-600 space-y-1">
                {explanation.strongPoints.map((p, i) => <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{p}</li>)}
              </ul>
            </div>
          )}
          {explanation.improvementAreas?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Areas to Improve</p>
              <ul className="text-sm text-surface-600 space-y-1">
                {explanation.improvementAreas.map((a, i) => <li key={i} className="flex items-start gap-2"><XCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />{a}</li>)}
              </ul>
            </div>
          )}
          {explanation.actionableAdvice && (
            <div className="p-3 rounded-lg bg-brand-50 border border-brand-200">
              <p className="text-sm text-brand-700 font-medium">💡 {explanation.actionableAdvice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  const { id } = useParams();
  if (id) return <JobDetail />;
  return <JobList />;
}
