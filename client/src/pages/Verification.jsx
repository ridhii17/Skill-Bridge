import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { verificationApi } from '../api/app.api';
import { useState, useCallback } from 'react';
import {
  Loader2, CheckCircle2, Shield, Award, ExternalLink, Copy, Share2,
  Download, Sparkles, BadgeCheck, ArrowRight, Printer,
} from 'lucide-react';

const BADGE_CONFIG = {
  gold: {
    label: 'Gold',
    gradient: 'from-yellow-400 to-amber-500',
    ring: 'ring-yellow-300',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    border: 'border-yellow-200',
    text: 'text-yellow-700',
    icon: '\u{1F947}',
    stars: 3,
    description: 'Exceptional proficiency \u2014 Top performer',
  },
  silver: {
    label: 'Silver',
    gradient: 'from-gray-300 to-gray-400',
    ring: 'ring-gray-300',
    bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    icon: '\u{1F948}',
    stars: 2,
    description: 'Strong proficiency \u2014 Advanced level',
  },
  bronze: {
    label: 'Bronze',
    gradient: 'from-orange-300 to-orange-400',
    ring: 'ring-orange-300',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    icon: '\u{1F949}',
    stars: 1,
    description: 'Solid proficiency \u2014 Competent level',
  },
};

function getLevelLabel(score) {
  if (score >= 90) return 'Expert';
  if (score >= 75) return 'Advanced';
  if (score >= 60) return 'Intermediate';
  return 'Beginner';
}

function BadgeVisual({ v, badge, large = false }) {
  const size = large ? 'w-48 h-48' : 'w-32 h-32';
  const iconSize = large ? 'text-3xl' : 'text-xl';
  const labelSize = large ? 'text-xs' : 'text-xs';
  const scoreSize = large ? 'text-lg' : 'text-sm';

  return (
    <div className={`relative ${size} mx-auto`}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.gradient} opacity-20`} />
      <div className={`absolute inset-1 rounded-full bg-white ring-4 ${badge.ring}`} />
      <div className="absolute inset-3 rounded-full bg-white flex flex-col items-center justify-center border border-surface-100 shadow-inner">
        <span className={`${iconSize} mb-0.5`}>{badge.icon}</span>
        <span className={`${labelSize} font-bold uppercase tracking-wider ${badge.text}`}>{badge.label}</span>
        <span className={`${scoreSize} font-bold text-surface-900`}>{v.level}%</span>
      </div>
      {large && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < badge.stars ? 'opacity-100' : 'opacity-20'}`}>{'\u2605'}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PrintableBadge({ v, badge }) {
  return (
    <div id="printable-badge" className="hidden print:block">
      <div style={{ width: '350px', margin: '0 auto', padding: '40px', border: '3px solid #e2e8f0', borderRadius: '20px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: '#6366f1', marginBottom: '16px', fontWeight: 'bold' }}>
          Verified Competency
        </div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
          {v.skill}
        </div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4f46e5', margin: '16px 0' }}>
          {v.level}%
        </div>
        <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
          Level: {getLevelLabel(v.level)} {'\u00B7'} {badge.label} Badge
        </div>
        <div style={{ borderTop: '1px solid #e2e8f0', margin: '16px 0', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Candidate</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{v.candidateName}</div>
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '16px' }}>
          Verification ID: {v.verificationId}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
          Verified: {new Date(v.verifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
          SkillBridge AI {'\u00B7'} skillbridge.ai
        </div>
      </div>
    </div>
  );
}

export default function Verification() {
  const { verificationId } = useParams();
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['verification', verificationId],
    queryFn: () => verificationApi.getPublic(verificationId),
    enabled: !!verificationId,
  });

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    const text = `I earned a ${data?.data?.badge || ''} verified competency in ${data?.data?.skill || ''} (${data?.data?.level || 0}%) on SkillBridge AI!`;
    if (navigator.share) {
      navigator.share({ title: `Verified: ${data?.data?.skill}`, text, url });
    } else {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    }
  }, [data]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Verification Not Found</h1>
          <p className="text-surface-500 mb-6">This verification ID is invalid or has been revoked.</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            Go to SkillBridge AI <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const v = data.data;
  const badge = BADGE_CONFIG[v.badge] || BADGE_CONFIG.bronze;

  return (
    <div className="min-h-screen bg-surface-50">
      <PrintableBadge v={v} badge={badge} />

      {/* Header */}
      <div className="bg-white border-b border-surface-200 print:hidden">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-surface-900">Skill<span className="text-brand-600">Bridge</span> AI</span>
          </Link>
          <span className="text-xs text-surface-400">Verified Competency</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 print:p-0">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden print:shadow-none print:border-none">
          {/* Top Badge Section */}
          <div className={`${badge.bg} py-10 text-center print:py-6`}>
            <div className="flex items-center justify-center gap-1.5 mb-4">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Verified Competency</span>
            </div>
            <BadgeVisual v={v} badge={badge} large />
            <div className="mt-4 print:mt-2">
              <h1 className="text-2xl font-bold text-surface-900 print:text-xl">{v.skill}</h1>
              <p className="text-sm text-surface-500 mt-1">{getLevelLabel(v.level)} {'\u00B7'} {badge.label} Badge</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">Score</p>
                <p className="text-xl font-bold text-surface-900">{v.level}%</p>
              </div>
              <div className={`p-3 rounded-xl ${badge.bg} border ${badge.border}`}>
                <p className="text-xs uppercase tracking-wide mb-1 opacity-60">Badge</p>
                <p className="text-xl font-bold flex items-center gap-1">
                  <span>{badge.icon}</span> {badge.label}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">Candidate</p>
              <p className="font-semibold text-surface-900">{v.candidateName}</p>
            </div>

            <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
              <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">Assessment</p>
              <p className="text-sm text-surface-700">SkillBridge Competency Assessment</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">Verification ID</p>
                <p className="font-mono text-xs text-surface-700 break-all">{v.verificationId}</p>
              </div>
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                <p className="text-xs text-surface-400 uppercase tracking-wide mb-1">Verified Date</p>
                <p className="text-sm text-surface-700">
                  {new Date(v.verifiedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Badge Description */}
            <div className={`p-3 rounded-xl ${badge.bg} border ${badge.border}`}>
              <p className={`text-sm font-medium ${badge.text}`}>{badge.description}</p>
            </div>
          </div>

          {/* Actions - print hidden */}
          <div className="p-6 pt-0 space-y-3 print:hidden">
            <div className="flex gap-3">
              <button onClick={handleCopyLink} className="btn-secondary flex-1 text-sm">
                <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button onClick={handleShare} className="btn-secondary flex-1 text-sm">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePrint} className="btn-secondary flex-1 text-sm">
                <Printer className="w-4 h-4" /> Print Badge
              </button>
              <a
                href={'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(window.location.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Share on LinkedIn
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-0 border-t border-surface-100 print:pt-4">
            <p className="text-xs text-surface-400 text-center leading-relaxed">
              This verification confirms that <strong className="text-surface-600">{v.candidateName}</strong> achieved a{' '}
              <strong className="text-surface-600">{v.level}%</strong> proficiency in{' '}
              <strong className="text-surface-600">{v.skill}</strong> through a SkillBridge AI Competency Assessment.
            </p>
            <p className="text-xs text-surface-300 text-center mt-2">
              Verified by SkillBridge AI {'\u00B7'} This is not an external accreditation
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-700">Verification Status: Authentic</p>
            <p className="text-xs text-emerald-600">This record exists in the SkillBridge AI verification database.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center print:hidden">
          <Link to="/" className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1">
            Powered by SkillBridge AI <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
