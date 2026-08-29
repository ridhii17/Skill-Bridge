import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningApi } from '../api/app.api';
import { Loader2, Map, CheckCircle2, Circle, Clock, PlayCircle, Sparkles, ArrowRight } from 'lucide-react';

const STATUS_CONFIG = {
  not_started: { icon: Circle, color: 'text-surface-400', bg: 'bg-surface-100', label: 'Not Started' },
  in_progress: { icon: PlayCircle, color: 'text-brand-600', bg: 'bg-brand-50', label: 'In Progress' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
};

export default function Roadmap() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['learningPath'],
    queryFn: learningApi.getMyPath,
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, status }) => learningApi.updateItemStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['learningPath']);
      queryClient.invalidateQueries(['dashboard']);
    },
  });

  const generateMutation = useMutation({
    mutationFn: learningApi.generatePath,
    onSuccess: () => {
      queryClient.invalidateQueries(['learningPath']);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const path = data?.data;

  if (!path) {
    return (
      <div className="card p-12 text-center max-w-lg mx-auto">
        <Map className="w-12 h-12 text-surface-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-surface-900 mb-2">No Learning Path Yet</h2>
        <p className="text-surface-500 mb-6">Set a career goal and add skills to your profile to generate a personalized roadmap.</p>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn-primary"
        >
          {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Generate Roadmap</>}
        </button>
        {generateMutation.isError && <p className="text-sm text-red-600 mt-3">{generateMutation.error?.message || 'Failed to generate'}</p>}
      </div>
    );
  }

  // Group items by week
  const weeks = {};
  (path.items || []).forEach((item) => {
    const week = item.weekNumber || 1;
    if (!weeks[week]) weeks[week] = [];
    weeks[week].push(item);
  });

  const completedCount = (path.items || []).filter((i) => i.status === 'completed').length;
  const totalCount = (path.items || []).length;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Career Roadmap</h1>
        <p className="text-surface-500 mt-1">
          {path.careerRole?.title ? `Learning path for ${path.careerRole.title}` : 'Your personalized learning plan'}
        </p>
      </div>

      {/* Progress */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-surface-900">Overall Progress</h2>
          <span className="text-sm text-surface-500">{completedCount}/{totalCount} completed</span>
        </div>
        <div className="h-3 bg-surface-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${path.progress}%` }} />
        </div>
        <p className="text-sm text-surface-500 mt-2">{path.progress}% complete · {path.totalWeeks} weeks</p>
      </div>

      {/* Weekly Roadmap */}
      <div className="space-y-6">
        {Object.entries(weeks).sort(([a], [b]) => a - b).map(([weekNum, items]) => (
          <div key={weekNum}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                {weekNum}
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Week {weekNum}</h3>
                <p className="text-xs text-surface-500">{items.length} item{items.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="ml-5 pl-5 border-l-2 border-surface-200 space-y-3">
              {items.map((item) => {
                const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_started;
                const StatusIcon = config.icon;
                const nextStatus = item.status === 'not_started' ? 'in_progress' : item.status === 'in_progress' ? 'completed' : 'completed';

                return (
                  <div key={item._id} className={`p-4 rounded-xl border transition-colors ${
                    item.status === 'completed' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-surface-200 hover:border-surface-300'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`w-5 h-5 ${config.color}`} />
                          <h4 className="font-medium text-surface-900">{item.skillName || 'Learning Item'}</h4>
                          {item.resourceTitle && <span className="text-xs text-surface-400">· {item.resourceTitle}</span>}
                        </div>
                        {item.learningGoal && <p className="text-sm text-surface-500 ml-7">{item.learningGoal}</p>}
                        <div className="flex items-center gap-3 mt-2 ml-7 text-xs text-surface-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.estimatedHours}h</span>
                          <span className={`badge ${config.bg} ${config.color}`}>{config.label}</span>
                        </div>
                      </div>
                      {item.status !== 'completed' && (
                        <button
                          onClick={() => updateMutation.mutate({ itemId: item._id, status: nextStatus })}
                          disabled={updateMutation.isPending}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          {item.status === 'not_started' ? 'Start' : 'Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Regenerate */}
      <div className="mt-8 text-center">
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="btn-secondary"
        >
          <Sparkles className="w-4 h-4" /> Regenerate Roadmap
        </button>
      </div>
    </div>
  );
}
