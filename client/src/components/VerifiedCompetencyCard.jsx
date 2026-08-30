import { useState } from 'react';
import { Award, Download, Share2, ExternalLink, Copy, Check, Shield, Star } from 'lucide-react';

const levelColors = {
  beginner: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },
  intermediate: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-500' },
  advanced: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-500' },
  expert: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-500' },
};

function getLevel(score) {
  if (score >= 90) return 'expert';
  if (score >= 70) return 'advanced';
  if (score >= 50) return 'intermediate';
  return 'beginner';
}

export default function VerifiedCompetencyCard({ verification, compact = false }) {
  const [copied, setCopied] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const level = verification.level || getLevel(verification.score);
  const colors = levelColors[level] || levelColors.intermediate;
  const verificationUrl = `${window.location.origin}/verify/${verification.verificationId}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = verificationUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinkedIn = () => {
    const text = encodeURIComponent(
      `I've verified my ${verification.skill?.name || 'skill'} competency on SkillBridge AI! 🎯\n\n` +
      `Score: ${verification.score}% | Level: ${level.charAt(0).toUpperCase() + level.slice(1)}\n` +
      `Verification: ${verificationUrl}`
    );
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}&summary=${text}`, '_blank');
  };

  const downloadBadge = () => {
    // Create a canvas-based badge for download
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);

    // Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 380);

    // Header bar
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(10, 10, 580, 60);

    // Header text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SkillBridge AI — Verified Competency', 300, 48);

    // Skill name
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.fillText(verification.skill?.name || 'Skill', 300, 120);

    // Score
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.fillText(`${verification.score}%`, 300, 200);

    // Level
    ctx.fillStyle = '#4b5563';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(`Level: ${level.charAt(0).toUpperCase() + level.slice(1)}`, 300, 240);

    // Verification ID
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px monospace';
    ctx.fillText(`Verification: ${verification.verificationId}`, 300, 290);

    // Date
    ctx.fillText(`Verified: ${new Date(verification.verifiedAt || verification.createdAt).toLocaleDateString()}`, 300, 315);

    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText('This verification is issued by SkillBridge AI based on competency assessment.', 300, 360);

    // Download
    const link = document.createElement('a');
    link.download = `skillbridge-${(verification.skill?.name || 'skill').toLowerCase().replace(/\s+/g, '-')}-verified.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${colors.bg} ${colors.border} border`}>
        <Shield className={`w-3.5 h-3.5 ${colors.text}`} />
        <span className={`text-sm font-medium ${colors.text}`}>{verification.skill?.name || 'Skill'}</span>
        <span className={`text-xs font-semibold ${colors.text}`}>{verification.score}%</span>
        <span className="text-[10px] text-gray-400">✓ Verified</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Badge Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">Verified Competency</span>
          </div>
          <Shield className="w-5 h-5 opacity-80" />
        </div>
        <h3 className="text-xl font-bold mt-2">{verification.skill?.name || 'Skill'}</h3>
      </div>

      {/* Badge Body */}
      <div className="p-6">
        <div className="text-center mb-4">
          {/* Score Circle */}
          <div className="relative inline-flex items-center justify-center w-28 h-28 mb-3">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="52" fill="none"
                stroke={verification.score >= 80 ? '#6366f1' : verification.score >= 60 ? '#10b981' : '#f59e0b'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(verification.score / 100) * 327} 327`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{verification.score}%</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
            <Star className="w-3.5 h-3.5" />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Assessment</span>
            <span className="font-medium text-gray-900">SkillBridge Competency Assessment</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Verification ID</span>
            <span className="font-mono text-xs text-gray-700">{verification.verificationId}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Verified Date</span>
            <span className="text-gray-700">
              {new Date(verification.verifiedAt || verification.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={downloadBadge}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download Badge
          </button>
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button
            onClick={shareLinkedIn}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <a
          href={`/verify/${verification.verificationId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View Public Verification Page
        </a>
      </div>
    </div>
  );
}
