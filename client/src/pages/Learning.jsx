import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { learningApi, aiApi } from '../api/app.api';
import { Loader2, BookOpen, ExternalLink, Filter, Star, Clock, AlertTriangle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function Learning() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [levelFilter, setLevelFilter] = useState('');

  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ['learningRecommendations'],
    queryFn: learningApi.recommendations,
  });

  const { data: resourcesData, isLoading: resourcesLoading } = useQuery({
    queryKey: ['learningResources', levelFilter],
    queryFn: () => learningApi.resources(levelFilter ? { level: levelFilter } : {}),
  });

  const recommendations = recsData?.data || [];
  const resources = resourcesData?.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900">Learning Hub</h1>
        <p className="text-surface-500 mt-1">Personalized recommendations and learning resources</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab('recommendations')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'recommendations' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'}`}>
          For You
        </button>
        <button onClick={() => setActiveTab('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-white shadow-sm text-surface-900' : 'text-surface-500 hover:text-surface-700'}`}>
          All Resources
        </button>
      </div>

      {activeTab === 'recommendations' && (
        <div>
          {recsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : recommendations.length === 0 ? (
            <div className="card p-12 text-center">
              <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 mb-2">No personalized recommendations yet.</p>
              <p className="text-sm text-surface-400">Set a career goal and complete your profile to get recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-surface-400" />
            <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="input-field w-auto py-2 text-sm">
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          {resourcesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((r, i) => (
                <div key={r._id || i} className="card-hover p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-surface-900">{r.title}</h3>
                    {r.isDemo && <span className="badge bg-surface-100 text-surface-500 text-[10px]">DEMO</span>}
                  </div>
                  <p className="text-sm text-surface-500 mb-3">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="badge bg-brand-50 text-brand-700">{r.skill?.name || 'Skill'}</span>
                    <span className="badge bg-surface-100 text-surface-600">{r.level}</span>
                    <span className="badge bg-surface-100 text-surface-600">{r.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.duration}</span>
                    <span>{r.provider}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
