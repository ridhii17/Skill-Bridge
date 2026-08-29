import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { skillApi } from '../api/app.api';
import api from '../api/axios';
import { Loader2, TrendingUp, ArrowRight, BarChart3, AlertTriangle, Sparkles, Target } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function CareerSimulator() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [result, setResult] = useState(null);

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.list,
  });

  const simulationMutation = useMutation({
    mutationFn: (improvements) => api.post('/simulator/what-if', { skillImprovements: improvements }),
    onSuccess: (data) => setResult(data.data),
  });

  const allSkills = skillsData?.data || [];

  const handleSkillToggle = (skillId) => {
    setSelectedSkills((prev) => {
      const existing = prev.find((s) => s.skillId === skillId);
      if (existing) return prev.filter((s) => s.skillId !== skillId);
      return [...prev, { skillId, newLevel: 75 }];
    });
  };

  const handleLevelChange = (skillId, level) => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, newLevel: parseInt(level) } : s))
    );
  };

  const handleSimulate = () => {
    simulationMutation.mutate(selectedSkills);
  };

  if (skillsLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Career What-If Simulator</h1>
        <p className="text-surface-500 mt-1">Select skills to improve and see your projected career readiness</p>
      </div>

      {/* Skill Selector */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">What if I improved these skills?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allSkills.map((skill) => {
            const selected = selectedSkills.find((s) => s.skillId === skill._id);
            return (
              <div key={skill._id} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`} onClick={() => handleSkillToggle(skill._id)}>
                <p className={`text-sm font-medium ${selected ? 'text-brand-700' : 'text-surface-700'}`}>{skill.name}</p>
                <p className="text-xs text-surface-400">{skill.category}</p>
                {selected && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <label className="text-[10px] text-surface-500">Target: {selected.newLevel}%</label>
                    <input type="range" min="30" max="100" value={selected.newLevel} onChange={(e) => handleLevelChange(skill._id, e.target.value)} className="w-full h-1.5 mt-1 accent-brand-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={handleSimulate} disabled={selectedSkills.length === 0 || simulationMutation.isPending} className="btn-primary w-full py-3 mb-6">
        {simulationMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Run Simulation</>}
      </button>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {result.disclaimer}
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-surface-400" /> Current</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-surface-900">{result.current.matchPercentage}%</p>
                <p className="text-sm text-surface-500">Career Readiness</p>
              </div>
              <p className="text-sm text-surface-600">Skills ready: {result.current.skillsReady}</p>
              {result.current.criticalGaps?.length > 0 && <p className="text-sm text-red-600 mt-1">Critical gaps: {result.current.criticalGaps.join(', ')}</p>}
            </div>

            <div className="card p-6 ring-2 ring-brand-500">
              <h3 className="font-semibold text-brand-700 mb-3 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-600" /> Projected</h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-brand-600">{result.projected.matchPercentage}%</p>
                <p className="text-sm text-surface-500">Career Readiness</p>
              </div>
              <p className="text-sm text-surface-600">Skills ready: {result.projected.skillsReady}</p>
              {result.projected.criticalGaps?.length > 0 ? (
                <p className="text-sm text-amber-600 mt-1">Remaining gaps: {result.projected.criticalGaps.join(', ')}</p>
              ) : (
                <p className="text-sm text-emerald-600 mt-1">✓ No critical gaps remaining</p>
              )}
            </div>
          </div>

          {/* Improvement Summary */}
          <div className="card p-6 text-center">
            <p className="text-sm text-surface-500 mb-1">Projected Improvement</p>
            <p className={`text-3xl font-bold ${result.improvement > 0 ? 'text-emerald-600' : result.improvement < 0 ? 'text-red-600' : 'text-surface-600'}`}>
              {result.improvement > 0 ? '+' : ''}{result.improvement}%
            </p>
          </div>

          {/* Job Match Changes */}
          {result.jobChanges?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-surface-900 mb-4">Affected Job Matches</h3>
              <div className="space-y-3">
                {result.jobChanges.map((jc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 border border-surface-100">
                    <div>
                      <p className="font-medium text-surface-900">{jc.job.title}</p>
                      <p className="text-sm text-surface-500">{jc.job.company}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-surface-500">{jc.currentScore}%</span>
                      <ArrowRight className="w-4 h-4 text-surface-400" />
                      <span className="text-sm font-bold text-surface-900">{jc.projectedScore}%</span>
                      <span className={`badge ${jc.change > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {jc.change > 0 ? '+' : ''}{jc.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
