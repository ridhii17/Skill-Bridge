import { useQuery, useMutation } from '@tanstack/react-query';
import { candidateApi, aiApi } from '../api/app.api';
import { useAuth } from '../context/AuthContext';
import { Loader2, Sparkles, Download, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Code, FileText } from 'lucide-react';

export default function ResumeBuilder() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: candidateApi.getProfile,
  });

  const improveMutation = useMutation({
    mutationFn: () => aiApi.askAssistant('Help me improve my resume summary and professional description. Provide a polished 2-3 sentence professional summary based on my skills and experience.'),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const profile = profileData?.data?.profile;
  const p = profile || {};
  const aiSummary = improveMutation.data?.data?.response;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Resume Builder</h1>
          <p className="text-surface-500 mt-1">Professional resume preview from your profile</p>
        </div>
        <button onClick={() => improveMutation.mutate()} disabled={improveMutation.isPending} className="btn-secondary">
          {improveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4" /> AI Improve Wording</>}
        </button>
      </div>

      {/* Resume Preview */}
      <div className="bg-white rounded-xl shadow-lg border border-surface-200 p-8 sm:p-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="border-b-2 border-surface-900 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-surface-900">{user?.name || 'Your Name'}</h1>
          {p.headline && <p className="text-lg text-surface-600 mt-1">{p.headline}</p>}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-surface-500">
            {user?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>}
            {p.preferredLocation && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {p.preferredLocation}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide border-b border-surface-200 pb-1 mb-3">Professional Summary</h2>
          <p className="text-sm text-surface-700 leading-relaxed">
            {aiSummary || p.bio || 'Complete your profile to generate a professional summary.'}
          </p>
          {aiSummary && (
            <p className="text-[10px] text-brand-600 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI-improved wording — based on your actual profile data
            </p>
          )}
        </section>

        {/* Education */}
        {p.education?.degree && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide border-b border-surface-200 pb-1 mb-3 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> Education
            </h2>
            <div className="text-sm">
              <p className="font-semibold text-surface-900">{p.education.degree}{p.education.branch ? ` in ${p.education.branch}` : ''}</p>
              {p.education.institution && <p className="text-surface-600">{p.education.institution}</p>}
              <div className="flex gap-4 text-surface-500 mt-1">
                {p.education.graduationYear && <span>Graduated {p.education.graduationYear}</span>}
                {p.education.gpa && <span>GPA: {p.education.gpa}</span>}
              </div>
            </div>
          </section>
        )}

        {/* Experience */}
        {p.experience?.years > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide border-b border-surface-200 pb-1 mb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Experience
            </h2>
            <div className="text-sm">
              <p className="font-semibold text-surface-900">{p.experience.years} years of experience</p>
              {p.experience.description && <p className="text-surface-600 mt-1">{p.experience.description}</p>}
            </div>
          </section>
        )}

        {/* Projects */}
        {p.projects?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide border-b border-surface-200 pb-1 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" /> Projects
            </h2>
            <div className="space-y-3">
              {p.projects.map((proj, i) => (
                <div key={i} className="text-sm">
                  <p className="font-semibold text-surface-900">{proj.name}</p>
                  {proj.description && <p className="text-surface-600">{proj.description}</p>}
                  {proj.url && <p className="text-brand-600 text-xs mt-0.5">{proj.url}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {p.declaredSkillLevels?.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-surface-900 uppercase tracking-wide border-b border-surface-200 pb-1 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5" /> Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {p.declaredSkillLevels
                .sort((a, b) => b.level - a.level)
                .map((ds, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-surface-100 text-surface-700 text-sm">
                    {ds.skill?.name || 'Skill'} <span className="text-surface-400">({ds.level}%)</span>
                  </span>
                ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!p.headline && !p.bio && !p.education?.degree && p.declaredSkillLevels?.length === 0 && (
          <div className="text-center py-8 text-surface-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-surface-300" />
            <p>Your profile is empty. Complete your profile to generate a resume.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-surface-200 text-center text-xs text-surface-400">
          Generated by SkillBridge AI • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
