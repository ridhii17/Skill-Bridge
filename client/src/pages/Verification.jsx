import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { verificationApi } from '../api/app.api';
import { Loader2, CheckCircle2, Shield, Award } from 'lucide-react';

const BADGE_CONFIG = {
  gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🥇' },
  silver: { label: 'Silver', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: '🥈' },
  bronze: { label: 'Bronze', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: '🥉' },
};

export default function Verification() {
  const { verificationId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ['verification', verificationId],
    queryFn: () => verificationApi.getPublic(verificationId),
    enabled: !!verificationId,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Verification Not Found</h1>
          <p className="text-surface-500">This verification ID is invalid or has been revoked.</p>
        </div>
      </div>
    );
  }

  const v = data.data;
  const badge = BADGE_CONFIG[v.badge] || BADGE_CONFIG.bronze;

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-xl font-bold text-surface-900 mb-1">Skill Verified</h1>
        <p className="text-surface-500 text-sm mb-6">Verified by SkillBridge AI</p>

        <div className="space-y-4 text-left">
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400 uppercase tracking-wide">Skill</p>
            <p className="text-lg font-semibold text-surface-900">{v.skill}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-xs text-surface-400">Level</p>
              <p className="text-xl font-bold text-surface-900">{v.level}%</p>
            </div>
            <div className={`p-3 rounded-xl border ${badge.color}`}>
              <p className="text-xs opacity-70">Badge</p>
              <p className="text-xl font-bold">{badge.icon} {badge.label}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400">Candidate</p>
            <p className="font-medium text-surface-900">{v.candidateName}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400">Verification ID</p>
            <p className="font-mono text-sm text-surface-700">{v.verificationId}</p>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
            <p className="text-xs text-surface-400">Verified On</p>
            <p className="text-sm text-surface-700">{new Date(v.verifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-surface-200 text-xs text-surface-400">
          This verification confirms the candidate achieved a {v.level}% proficiency in {v.skill} through a SkillBridge AI assessment.
        </div>
      </div>
    </div>
  );
}
