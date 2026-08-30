import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adaptiveApi } from '../api/app.api';
import {
  Loader2, Zap, Target, BookOpen, CheckCircle2, AlertTriangle,
  ArrowRight, BarChart3, Brain, Trophy, Clock, RefreshCw,
  ChevronRight, Play, Award, TrendingUp, AlertCircle, Sparkles,
} from 'lucide-react';

const STATUS_UI = {
  mastered: { label: 'Mastered', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500', icon: Trophy },
  developing: { label: 'Developing', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500', icon: TrendingUp },
  needs_reinforcement: { label: 'Needs Reinforcement', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500', icon: RefreshCw },
  in_progress: { label: 'In Progress', color: 'text-brand-700', bg: 'bg-brand-50', border: 'border-brand-200', bar: 'bg-brand-500', icon: Play },
  not_started: { label: 'Not Started', color: 'text-surface-500', bg: 'bg-surface-50', border: 'border-surface-200', bar: 'bg-surface-400', icon: Target },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500', icon: CheckCircle2 },
};

function MiniAssessmentModal({ skillId, skillName, onClose, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['miniAssessment', skillId],
    queryFn: () => adaptiveApi.miniAssessment(skillId),
  });

  const submitMutation = useMutation({
    mutationFn: (data) => adaptiveApi.submitMiniAssessment(skillId, data),
    onSuccess: (result) => {
      setSubmitted(true);
      onComplete(result.data);
    },
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-center text-surface-500 mt-3">Loading mini assessment...</p>
        </div>
      </div>
    );
  }

  const ma = data?.data?.miniAssessment;
  if (!ma) return null;

  const questions = ma.questions || [];
  const question = questions[currentQ];
  const totalQ = questions.length;

  if (submitted) {
    const result = submitMutation.data?.data;
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            result?.status === 'mastered' ? 'bg-emerald-100' : result?.status === 'developing' ? 'bg-amber-100' : 'bg-red-100'
          }`}>
            {result?.status === 'mastered' ? <Trophy className="w-8 h-8 text-emerald-600" /> :
             result?.status === 'developing' ? <TrendingUp className="w-8 h-8 text-amber-600" /> :
             <RefreshCw className="w-8 h-8 text-red-600" />}
          </div>
          <h3 className="text-xl font-bold text-surface-900 mb-2">{result?.statusLabel}</h3>
          <div className="text-4xl font-bold text-surface-900 mb-2">{result?.score}%</div>
          {result?.previousScore !== null && result?.previousScore !== undefined && (
            <p className="text-sm text-surface-500 mb-1">
              Previous: {result.previousScore}% · Improvement: <span className={result.improvement > 0 ? 'text-emerald-600' : 'text-red-600'}>{result.improvement > 0 ? '+' : ''}{result.improvement}pts</span>
            </p>
          )}
          <p className="text-sm text-surface-600 mt-3 mb-4">{result?.adaptation?.message}</p>
          {result?.adaptation?.insertedItems > 0 && (
            <p className="text-xs text-brand-600 mb-4">Reinforcement items added to your roadmap</p>
          )}
          <div className="flex items-center justify-center gap-4 text-xs text-surface-400 mb-6">
            <span>✓ {result?.correctAnswers}/{result?.totalQuestions} correct</span>
            <span>·</span>
            <span>Attempt #{result?.attemptNumber}</span>
          </div>
          <button onClick={onClose} className="btn-primary w-full">Continue</button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = { selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQ < totalQ - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleSubmit = () => {
    const validAnswers = answers.filter(a => a !== undefined);
    if (validAnswers.length < totalQ) {
      // Fill unanswered with option 0
      for (let i = 0; i < totalQ; i++) {
        if (!answers[i]) answers[i] = { selectedOption: 0 };
      }
    }
    submitMutation.mutate({ answers: answers.map(a => a || { selectedOption: 0 }), miniAssessmentId: ma._id });
  };

  const answeredCount = answers.filter(a => a !== undefined).length;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-surface-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-surface-900">{ma.title}</h3>
            <button onClick={onClose} className="text-surface-400 hover:text-surface-600 text-sm">✕</button>
          </div>
          <div className="flex items-center gap-3 text-xs text-surface-500">
            <span>Question {currentQ + 1} of {totalQ}</span>
            <span>·</span>
            <span>{answeredCount}/{totalQ} answered</span>
          </div>
          <div className="mt-3 h-1.5 bg-surface-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-surface-100 text-surface-600">{question.difficulty}</span>
            <span className="badge bg-brand-50 text-brand-700">{skillName}</span>
          </div>
          <p className="text-surface-900 font-medium mb-4">{question.questionText}</p>
          <div className="space-y-2">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  answers[currentQ]?.selectedOption === i
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    answers[currentQ]?.selectedOption === i ? 'border-brand-500 bg-brand-500' : 'border-surface-300'
                  }`}>
                    {answers[currentQ]?.selectedOption === i && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-surface-700">{opt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-5 border-t border-surface-100 flex items-center justify-between">
          <button onClick={handlePrev} disabled={currentQ === 0} className="btn-secondary text-sm disabled:opacity-50">
            Previous
          </button>
          {currentQ < totalQ - 1 ? (
            <button onClick={handleNext} disabled={answers[currentQ] === undefined} className="btn-primary text-sm disabled:opacity-50">
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQ || submitMutation.isPending}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SkillProgressCard({ skill, onAssess }) {
  const config = STATUS_UI[skill.status] || STATUS_UI.not_started;
  const StatusIcon = config.icon;
  const progressWidth = Math.min(100, skill.progress || 0);

  return (
    <div className={`card p-5 border ${config.border}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
          <h3 className="font-semibold text-surface-900">{skill.skillName}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-surface-500">Progress</span>
          <span className="font-medium text-surface-900">{skill.current}% / {skill.target}%</span>
        </div>
        <div className="h-2.5 bg-surface-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${progressWidth}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-surface-500 mb-3">
        <span>Initial: <strong>{skill.initial}%</strong></span>
        <span>Gap: <strong className={skill.gap > 0 ? 'text-red-600' : 'text-emerald-600'}>{skill.gap > 0 ? skill.gap : 0}</strong></span>
        {skill.improvement !== 0 && (
          <span>Change: <strong className={skill.improvement > 0 ? 'text-emerald-600' : 'text-red-600'}>{skill.improvement > 0 ? '+' : ''}{skill.improvement}</strong></span>
        )}
        {skill.reinforcedCount > 0 && (
          <span className="text-surface-400">Reinforced: {skill.reinforcedCount}×</span>
        )}
      </div>

      {skill.status !== 'mastered' && (
        <button onClick={() => onAssess(skill.skillId, skill.skillName)} className="btn-secondary text-xs w-full">
          <Brain className="w-3.5 h-3.5 inline mr-1" /> Check Understanding
        </button>
      )}
    </div>
  );
}

export default function LearningJourney() {
  const [assessmentModal, setAssessmentModal] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adaptiveDashboard'],
    queryFn: adaptiveApi.dashboard,
  });

  const handleAssessComplete = () => {
    queryClient.invalidateQueries(['adaptiveDashboard']);
    queryClient.invalidateQueries(['career-readiness']);
    queryClient.invalidateQueries(['dashboard']);
    setAssessmentModal(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  const d = data?.data;
  if (!d) return null;

  const stats = d.stats || {};
  const nextAction = d.nextAction || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Learning Journey</h1>
        </div>
        <p className="text-surface-500">Your closed-loop adaptive learning path</p>
      </div>

      {/* Next Best Action */}
      <div className="card p-6 bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-brand-100 uppercase tracking-wider mb-1">Your Next Best Action</p>
            <h2 className="text-xl font-bold">{nextAction.title || 'Get Started'}</h2>
            <p className="text-sm text-brand-100 mt-1">{nextAction.reason}</p>
            {nextAction.currentScore !== undefined && nextAction.targetScore !== undefined && (
              <div className="flex items-center gap-4 mt-2 text-xs text-brand-200">
                <span>Current: {nextAction.currentScore}%</span>
                <span>Target: {nextAction.targetScore}%</span>
                <span>Gap: {nextAction.gap || 0}pts</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {nextAction.type === 'mini_assessment' && nextAction.skill && (
              <button
                onClick={() => setAssessmentModal({ skillId: nextAction.skill, skillName: nextAction.skillName })}
                className="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
              >
                Take Assessment
              </button>
            )}
            {nextAction.type === 'learning' && nextAction.itemId && (
              <Link to="/roadmap" className="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors inline-flex items-center gap-1">
                Continue <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {nextAction.type === 'path_generation' && (
              <Link to="/roadmap" className="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors inline-flex items-center gap-1">
                Generate Path <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {nextAction.type === 'assessment' && (
              <Link to="/assessment" className="bg-white text-brand-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors inline-flex items-center gap-1">
                Take Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-surface-900">{stats.totalSkills || 0}</div>
          <p className="text-xs text-surface-500 mt-1">Total Skills</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.masteredSkills || 0}</div>
          <p className="text-xs text-surface-500 mt-1">Mastered</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.developingSkills || 0}</div>
          <p className="text-xs text-surface-500 mt-1">Developing</p>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.needsReinforcement || 0}</div>
          <p className="text-xs text-surface-500 mt-1">Needs Work</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-surface-500" />
            Skill Progress
          </h2>
          {d.skillProgress && d.skillProgress.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {d.skillProgress.map((skill, i) => (
                <SkillProgressCard
                  key={i}
                  skill={skill}
                  onAssess={(id, name) => setAssessmentModal({ skillId: id, skillName: name })}
                />
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-10 h-10 text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500 mb-4">No learning path yet</p>
              <Link to="/roadmap" className="btn-primary text-sm inline-flex items-center gap-2">
                Generate Learning Path <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Readiness History */}
          {d.readinessHistory && d.readinessHistory.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" />
                Readiness Progress
              </h3>
              <div className="space-y-2">
                {d.readinessHistory.slice(-5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 capitalize">{h.triggeredBy}</span>
                    <span className={`font-bold ${h.score >= 70 ? 'text-emerald-600' : h.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {h.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Mini Assessments */}
          {d.recentAttempts && d.recentAttempts.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-600" />
                Recent Assessments
              </h3>
              <div className="space-y-2">
                {d.recentAttempts.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-50">
                    <div>
                      <p className="text-xs font-medium text-surface-700">{a.skillName}</p>
                      <p className="text-[10px] text-surface-400">#{a.attemptNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        a.status === 'mastered' ? 'text-emerald-600' : a.status === 'developing' ? 'text-amber-600' : 'text-red-600'
                      }`}>{a.score}%</span>
                      {a.improvement !== 0 && (
                        <p className={`text-[10px] ${a.improvement > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {a.improvement > 0 ? '+' : ''}{a.improvement}pts
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Loop Diagram */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-surface-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              How It Works
            </h3>
            <div className="space-y-2">
              {['Learn', 'Practice', 'Mini Assessment', 'Analyze', 'Adapt'].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-surface-600">{step}</span>
                  {i < 4 && <ChevronRight className="w-3 h-3 text-surface-300 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mini Assessment Modal */}
      {assessmentModal && (
        <MiniAssessmentModal
          skillId={assessmentModal.skillId}
          skillName={assessmentModal.skillName}
          onClose={() => setAssessmentModal(null)}
          onComplete={handleAssessComplete}
        />
      )}
    </div>
  );
}
