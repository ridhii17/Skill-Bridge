import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateApi, skillApi } from '../api/app.api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Save, Plus, X } from 'lucide-react';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: candidateApi.getProfile,
  });

  const { data: skillsData } = useQuery({
    queryKey: ['skills'],
    queryFn: skillApi.list,
  });

  useEffect(() => {
    if (data?.data?.profile) {
      const p = data.data.profile;
      setForm({
        headline: p.headline || '',
        bio: p.bio || '',
        education: { degree: p.education?.degree || '', branch: p.education?.branch || '', institution: p.education?.institution || '', graduationYear: p.education?.graduationYear || '', gpa: p.education?.gpa || '' },
        experience: { years: p.experience?.years || 0, description: p.experience?.description || '' },
        projects: p.projects || [],
        careerGoal: p.careerGoal || '',
        preferredLocation: p.preferredLocation || '',
        preferredJobType: p.preferredJobType || '',
        expectedSalary: { min: p.expectedSalary?.min || '', max: p.expectedSalary?.max || '' },
        learningPreference: p.learningPreference || 'mixed',
        availableHoursPerWeek: p.availableHoursPerWeek || 10,
        declaredSkillLevels: (p.declaredSkillLevels || []).map((ds) => ({
          skill: ds.skill?._id || ds.skill,
          skillName: ds.skill?.name || 'Unknown',
          level: ds.level || 50,
        })),
        skills: (p.skills || []).map((s) => s._id || s),
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: candidateApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['dashboard']);
      refreshUser();
    },
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (field, value) => {
    setForm((prev) => ({ ...prev, education: { ...prev.education, [field]: value } }));
  };

  const handleExperienceChange = (field, value) => {
    setForm((prev) => ({ ...prev, experience: { ...prev.experience, [field]: value } }));
  };

  const handleProjectAdd = () => {
    setForm((prev) => ({ ...prev, projects: [...prev.projects, { name: '', description: '', url: '' }] }));
  };

  const handleProjectChange = (index, field, value) => {
    const updated = [...form.projects];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, projects: updated }));
  };

  const handleProjectRemove = (index) => {
    setForm((prev) => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const handleSkillLevelChange = (index, level) => {
    const updated = [...form.declaredSkillLevels];
    updated[index] = { ...updated[index], level: parseInt(level) || 0 };
    setForm((prev) => ({ ...prev, declaredSkillLevels: updated }));
  };

  const addSkillLevel = () => {
    if (!skillInput) return;
    const skill = skillsData?.data?.find((s) => s.name === skillInput);
    if (!skill) return;
    if (form.declaredSkillLevels.find((ds) => ds.skill === skill._id)) return;
    setForm((prev) => ({
      ...prev,
      declaredSkillLevels: [...prev.declaredSkillLevels, { skill: skill._id, skillName: skill.name, level: 50 }],
    }));
    setSkillInput('');
  };

  const removeSkillLevel = (index) => {
    setForm((prev) => ({ ...prev, declaredSkillLevels: prev.declaredSkillLevels.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    payload.education.graduationYear = payload.education.graduationYear ? parseInt(payload.education.graduationYear) : null;
    payload.education.gpa = payload.education.gpa ? parseFloat(payload.education.gpa) : null;
    payload.experience.years = parseInt(payload.experience.years) || 0;
    payload.availableHoursPerWeek = parseInt(payload.availableHoursPerWeek) || 10;
    payload.expectedSalary = {
      min: payload.expectedSalary.min ? parseInt(payload.expectedSalary.min) : undefined,
      max: payload.expectedSalary.max ? parseInt(payload.expectedSalary.max) : undefined,
    };
    payload.skills = payload.declaredSkillLevels.map((ds) => ds.skill);
    mutation.mutate(payload);
  };

  if (isLoading || !form) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const allSkills = skillsData?.data || [];
  const usedSkillIds = form.declaredSkillLevels.map((ds) => ds.skill);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Your Profile</h1>

      {mutation.isSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">Profile saved successfully!</div>
      )}
      {mutation.isError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{mutation.error?.message || 'Failed to save'}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Headline</label>
              <input value={form.headline} onChange={(e) => handleChange('headline', e.target.value)} className="input-field" placeholder="e.g. Full Stack Developer | React & Node.js" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} className="input-field" placeholder="Tell us about yourself..." />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Education</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Degree</label>
              <input value={form.education.degree} onChange={(e) => handleEducationChange('degree', e.target.value)} className="input-field" placeholder="B.Tech / BCA / B.Sc" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Branch / Major</label>
              <input value={form.education.branch} onChange={(e) => handleEducationChange('branch', e.target.value)} className="input-field" placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Institution</label>
              <input value={form.education.institution} onChange={(e) => handleEducationChange('institution', e.target.value)} className="input-field" placeholder="University name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Graduation Year</label>
              <input type="number" value={form.education.graduationYear} onChange={(e) => handleEducationChange('graduationYear', e.target.value)} className="input-field" placeholder="2025" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">GPA / Percentage</label>
              <input type="number" step="0.01" value={form.education.gpa} onChange={(e) => handleEducationChange('gpa', e.target.value)} className="input-field" placeholder="8.5" />
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Experience</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Years of Experience</label>
              <input type="number" min="0" value={form.experience.years} onChange={(e) => handleExperienceChange('years', e.target.value)} className="input-field w-32" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
              <textarea value={form.experience.description} onChange={(e) => handleExperienceChange('description', e.target.value)} rows={2} className="input-field" placeholder="Brief description of your experience" />
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Projects</h2>
            <button type="button" onClick={handleProjectAdd} className="btn-secondary text-sm py-1.5"><Plus className="w-4 h-4" /> Add</button>
          </div>
          {form.projects.length === 0 && <p className="text-sm text-surface-500">No projects added yet.</p>}
          <div className="space-y-3">
            {form.projects.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border border-surface-200 space-y-2">
                <div className="flex justify-between">
                  <input value={p.name} onChange={(e) => handleProjectChange(i, 'name', e.target.value)} className="input-field" placeholder="Project name" />
                  <button type="button" onClick={() => handleProjectRemove(i)} className="ml-2 text-red-400 hover:text-red-600"><X className="w-5 h-5" /></button>
                </div>
                <input value={p.description} onChange={(e) => handleProjectChange(i, 'description', e.target.value)} className="input-field text-sm" placeholder="Description" />
                <input value={p.url} onChange={(e) => handleProjectChange(i, 'url', e.target.value)} className="input-field text-sm" placeholder="URL (optional)" />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Skills & Self-Assessment</h2>
          <p className="text-sm text-surface-500 mb-4">Rate your proficiency in each skill (0-100%). This helps us analyze your competency gaps.</p>
          <div className="flex gap-2 mb-4">
            <select value={skillInput} onChange={(e) => setSkillInput(e.target.value)} className="input-field flex-1">
              <option value="">Select a skill...</option>
              {allSkills.filter((s) => !usedSkillIds.includes(s._id)).map((s) => (
                <option key={s._id} value={s.name}>{s.name} ({s.category})</option>
              ))}
            </select>
            <button type="button" onClick={addSkillLevel} className="btn-primary py-2.5" disabled={!skillInput}>Add</button>
          </div>
          <div className="space-y-3">
            {form.declaredSkillLevels.map((ds, i) => (
              <div key={ds.skill} className="flex items-center gap-3">
                <span className="text-sm font-medium text-surface-700 w-40 truncate">{ds.skillName}</span>
                <input type="range" min="0" max="100" value={ds.level} onChange={(e) => handleSkillLevelChange(i, e.target.value)} className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-600" />
                <span className="text-sm font-medium text-surface-900 w-10 text-right">{ds.level}%</span>
                <button type="button" onClick={() => removeSkillLevel(i)} className="text-surface-400 hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Preferred Location</label>
              <input value={form.preferredLocation} onChange={(e) => handleChange('preferredLocation', e.target.value)} className="input-field" placeholder="Bangalore / Remote" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Preferred Job Type</label>
              <select value={form.preferredJobType} onChange={(e) => handleChange('preferredJobType', e.target.value)} className="input-field">
                <option value="">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Expected Salary (Min ₹)</label>
              <input type="number" value={form.expectedSalary.min} onChange={(e) => handleChange('expectedSalary', { ...form.expectedSalary, min: e.target.value })} className="input-field" placeholder="400000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Expected Salary (Max ₹)</label>
              <input type="number" value={form.expectedSalary.max} onChange={(e) => handleChange('expectedSalary', { ...form.expectedSalary, max: e.target.value })} className="input-field" placeholder="800000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Learning Preference</label>
              <select value={form.learningPreference} onChange={(e) => handleChange('learningPreference', e.target.value)} className="input-field">
                <option value="mixed">Mixed</option>
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="hands_on">Hands-on</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Hours per week for learning</label>
              <input type="number" min="1" max="40" value={form.availableHoursPerWeek} onChange={(e) => handleChange('availableHoursPerWeek', e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full py-3">
          {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}
