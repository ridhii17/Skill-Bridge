import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiApi } from '../api/app.api';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle, Sparkles, X, ArrowRight } from 'lucide-react';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const mutation = useMutation({
    mutationFn: (formData) => aiApi.analyzeResume(formData),
  });

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type === 'application/pdf') setFile(dropped);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    mutation.mutate(formData);
  };

  const result = mutation.data?.data;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Resume Analyzer</h1>
        <p className="text-surface-500 mt-1">Upload your resume to extract skills and get insights</p>
      </div>

      {/* Upload Area */}
      <div
        className={`card p-8 border-2 border-dashed transition-colors mb-6 ${
          dragOver ? 'border-brand-500 bg-brand-50' : file ? 'border-emerald-300 bg-emerald-50/30' : 'border-surface-200 hover:border-surface-300'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-surface-900">{file.name}</p>
              <p className="text-sm text-surface-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => { setFile(null); mutation.reset(); }} className="text-surface-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-700 font-medium">Drop your PDF resume here</p>
            <p className="text-sm text-surface-400 mt-1">or click to browse • PDF only • Max 5MB</p>
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>
        )}
      </div>

      <button onClick={handleUpload} disabled={!file || mutation.isPending} className="btn-primary w-full py-3 mb-8">
        {mutation.isPending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Resume...</>
        ) : (
          <><Sparkles className="w-5 h-5" /> Analyze Resume</>
        )}
      </button>

      {/* Error */}
      {mutation.isError && (
        <div className="card p-5 mb-6 border-red-200 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{mutation.error?.message || 'Analysis failed'}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Source indicator */}
          <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${result.isAIGenerated ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
            <Sparkles className="w-4 h-4" />
            <span>{result.source}</span>
            {result.fallback && <span className="ml-auto text-xs opacity-70">AI service unavailable — using fallback</span>}
          </div>

          {/* Detected Skills */}
          {result.analysis?.matchedSkills?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Detected Skills
              </h2>
              <p className="text-xs text-surface-400 mb-3">Source: Extracted from Resume</p>
              <div className="flex flex-wrap gap-2">
                {result.analysis.matchedSkills.map((s, i) => (
                  <span key={i} className="badge badge-success">{s.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Unmatched Skills */}
          {result.analysis?.unmatchedSkills?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Other Skills Found</h2>
              <p className="text-xs text-surface-400 mb-3">Source: Extracted from Resume (not in our database)</p>
              <div className="flex flex-wrap gap-2">
                {result.analysis.unmatchedSkills.map((s, i) => (
                  <span key={i} className="badge bg-surface-100 text-surface-600">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {result.analysis?.education && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Education</h2>
              <p className="text-xs text-surface-400 mb-2">Source: Extracted from Resume</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {result.analysis.education.degree && <div><span className="text-surface-500">Degree:</span> <span className="font-medium">{result.analysis.education.degree}</span></div>}
                {result.analysis.education.branch && <div><span className="text-surface-500">Branch:</span> <span className="font-medium">{result.analysis.education.branch}</span></div>}
                {result.analysis.education.institution && <div><span className="text-surface-500">Institution:</span> <span className="font-medium">{result.analysis.education.institution}</span></div>}
                {result.analysis.education.graduationYear && <div><span className="text-surface-500">Year:</span> <span className="font-medium">{result.analysis.education.graduationYear}</span></div>}
              </div>
            </div>
          )}

          {/* Experience */}
          {result.analysis?.experience && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Experience</h2>
              <p className="text-xs text-surface-400 mb-2">Source: Extracted from Resume</p>
              {result.analysis.experience.years && <p className="text-sm text-surface-700 mb-2">{result.analysis.experience.years} years of experience</p>}
              {result.analysis.experience.roles?.length > 0 && (
                <div className="space-y-2">
                  {result.analysis.experience.roles.map((r, i) => (
                    <div key={i} className="text-sm"><span className="font-medium">{r.title}</span> at {r.company} <span className="text-surface-400">({r.duration})</span></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects */}
          {result.analysis?.projects?.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Projects</h2>
              <div className="space-y-2">
                {result.analysis.projects.map((p, i) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-50 border border-surface-100">
                    <p className="font-medium text-surface-900">{p.name}</p>
                    <p className="text-sm text-surface-500">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {result.analysis?.summary && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-3">Professional Summary</h2>
              <p className="text-sm text-surface-700 leading-relaxed">{result.analysis.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
