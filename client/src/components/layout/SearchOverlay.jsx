import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Briefcase, Target, BookOpen, Layers, ArrowRight } from 'lucide-react';
import { skillApi, careerApi, jobApi } from '../../api/app.api';

const searchCategories = [
  { key: 'skills', label: 'Skills', icon: Layers, path: '/skills' },
  { key: 'careers', label: 'Careers', icon: Target, path: '/career-explorer' },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, path: '/jobs' },
];

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { data: skillsData } = useQuery({ queryKey: ['search-skills'], queryFn: skillApi.list, enabled: open });
  const { data: careersData } = useQuery({ queryKey: ['search-careers'], queryFn: careerApi.list, enabled: open });
  const { data: jobsData } = useQuery({ queryKey: ['search-jobs'], queryFn: jobApi.list, enabled: open });

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const q = query.toLowerCase().trim();

  const results = { skills: [], careers: [], jobs: [] };

  if (q.length >= 1) {
    (skillsData?.data || []).forEach((s) => {
      if (s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)) {
        results.skills.push(s);
      }
    });
    (careersData?.data || []).forEach((c) => {
      if (c.title?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)) {
        results.careers.push(c);
      }
    });
    (jobsData?.data || []).forEach((j) => {
      if (j.title?.toLowerCase().includes(q) || j.company?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q)) {
        results.jobs.push(j);
      }
    });
  }

  const totalResults = results.skills.length + results.careers.length + results.jobs.length;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative max-w-2xl mx-auto mt-20 px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-surface-100">
            <Search className="w-5 h-5 text-surface-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills, careers, jobs..."
              className="flex-1 text-base text-surface-900 placeholder:text-surface-400 outline-none bg-transparent"
            />
            <button onClick={onClose} className="p-1 rounded-md hover:bg-surface-100 text-surface-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {q.length < 1 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-surface-400">Type to search skills, careers, and jobs</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {searchCategories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleNavigate(cat.path)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-50 border border-surface-200 text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
                    >
                      <cat.icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q.length >= 1 && totalResults === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-surface-500">No results found for "{query}"</p>
              </div>
            )}

            {/* Skills */}
            {results.skills.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">Skills</p>
                {results.skills.slice(0, 5).map((skill) => (
                  <button
                    key={skill._id}
                    onClick={() => handleNavigate('/skills')}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-surface-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <Layers className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{skill.name}</p>
                      <p className="text-xs text-surface-400 capitalize">{skill.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Careers */}
            {results.careers.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">Careers</p>
                {results.careers.slice(0, 5).map((career) => (
                  <button
                    key={career._id}
                    onClick={() => handleNavigate('/career-explorer')}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-surface-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{career.title}</p>
                      <p className="text-xs text-surface-400 truncate">{career.description?.substring(0, 60)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Jobs */}
            {results.jobs.length > 0 && (
              <div className="px-3 py-2">
                <p className="px-2 py-1 text-xs font-medium text-surface-400 uppercase tracking-wider">Jobs</p>
                {results.jobs.slice(0, 5).map((job) => (
                  <button
                    key={job._id}
                    onClick={() => handleNavigate(`/jobs/${job._id}`)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-left hover:bg-surface-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{job.title}</p>
                      <p className="text-xs text-surface-400">{job.company} · {job.location}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-surface-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 flex items-center justify-between">
            <p className="text-xs text-surface-400">
              {q.length >= 1 ? `${totalResults} result${totalResults !== 1 ? 's' : ''}` : 'Type to search'}
            </p>
            <div className="flex items-center gap-1 text-xs text-surface-400">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-surface-200 font-mono text-[10px]">ESC</kbd>
              <span>to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
