import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { careerApi, candidateApi } from '../api/app.api';
import { Loader2, Target, CheckCircle2, ArrowRight, Briefcase } from 'lucide-react';
import { Layers, Monitor, Server, BarChart3, Brain, Shield } from 'lucide-react';

const iconMap = { Layers, Monitor, Server, BarChart3, Brain, Shield };

export default function CareerExplorer() {
  const queryClient = useQueryClient();

  const { data: careers, isLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: careerApi.list,
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: candidateApi.getProfile,
  });

  const currentCareerId = profileData?.data?.profile?.targetCareer?._id;

  const setTargetMutation = useMutation({
    mutationFn: (careerId) => careerApi.setTarget(careerId),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const careersList = careers?.data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Career Explorer</h1>
        <p className="text-surface-500 mt-1">Browse career paths and set your target goal</p>
      </div>

      {currentCareerId && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-emerald-700">
            Your current goal: <strong>{careersList.find((c) => c._id === currentCareerId)?.title}</strong>
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {careersList.map((career) => {
          const Icon = iconMap[career.icon] || Briefcase;
          const isSelected = career._id === currentCareerId;
          return (
            <div key={career._id} className={`card-hover p-6 flex flex-col ${isSelected ? 'ring-2 ring-brand-500 border-brand-300' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-brand-100' : 'bg-surface-100'}`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-brand-600' : 'text-surface-600'}`} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900">{career.title}</h3>
              </div>
              <p className="text-sm text-surface-500 mb-4 flex-1">{career.description}</p>
              {career.averageSalary && <p className="text-sm font-medium text-surface-600 mb-3">💰 {career.averageSalary}</p>}
              <div className="mb-4">
                <p className="text-xs font-medium text-surface-400 uppercase tracking-wide mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {career.requiredSkills?.slice(0, 6).map((rs, i) => (
                    <span key={i} className="badge bg-surface-100 text-surface-600">{rs.skill?.name || 'Skill'}</span>
                  ))}
                  {career.requiredSkills?.length > 6 && <span className="badge bg-surface-100 text-surface-500">+{career.requiredSkills.length - 6} more</span>}
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                {isSelected ? (
                  <span className="btn-primary flex-1 justify-center opacity-70 cursor-default">
                    <CheckCircle2 className="w-4 h-4" /> Current Goal
                  </span>
                ) : (
                  <button
                    onClick={() => setTargetMutation.mutate(career._id)}
                    disabled={setTargetMutation.isPending}
                    className="btn-primary flex-1 justify-center"
                  >
                    <Target className="w-4 h-4" /> Set as Goal
                  </button>
                )}
                <Link to={`/assessment?career=${career._id}`} className="btn-secondary flex-1 justify-center text-sm">
                  Assess <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
