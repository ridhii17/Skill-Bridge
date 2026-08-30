import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { assessmentApi, careerApi } from '../api/app.api';
import { useAccessibility } from '../context/AccessibilityContext';
import { Loader2, Clock, ChevronRight, ChevronLeft, CheckCircle2, XCircle, Award, BarChart3, ArrowRight, Accessibility } from 'lucide-react';

// ─── ASSESSMENT LIST ──────────────────────────────────
function AssessmentList() {
  const [searchParams] = useSearchParams();
  const careerRoleId = searchParams.get('career');

  const { data, isLoading } = useQuery({
    queryKey: ['assessments', careerRoleId],
    queryFn: () => assessmentApi.list(careerRoleId ? { careerRoleId } : {}),
  });

  const { data: careers } = useQuery({ queryKey: ['careers'], queryFn: careerApi.list });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const assessments = data?.data || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900">Competency Assessments</h1>
        <p className="text-surface-500 mt-1">Test your skills and track your growth</p>
      </div>
      {assessments.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">No assessments available yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assessments.map((a) => (
            <div key={a._id} className="card-hover p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-surface-900">{a.title}</h3>
                <p className="text-sm text-surface-500 mt-1">{a.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-surface-400">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {a.timeLimitMinutes} min</span>
                  <span>Passing: {a.passingScore}%</span>
                  {a.careerRole && <span className="badge badge-brand">{a.careerRole.title}</span>}
                </div>
              </div>
              <a href={`/assessment/${a._id}`} className="btn-primary">
                Start <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TAKE ASSESSMENT ──────────────────────────────────
function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reducedMotion, screenReaderOptimized, textSize } = useAccessibility();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [startedAt] = useState(new Date().toISOString());
  const questionRef = useRef(null);
  const simplifiedMode = textSize === 'xlarge';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const optionIndex = parseInt(e.key) - 1;
        if (optionIndex < (questions[currentIndex]?.options?.length || 0)) {
          handleSelect(optionIndex);
        }
      } else if (e.key === 'Escape') {
        navigate('/assessment');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length]);

  // Focus question on change
  useEffect(() => {
    if (questionRef.current) {
      questionRef.current.focus();
    }
  }, [currentIndex]);

  const { data, isLoading } = useQuery({
    queryKey: ['assessment', id],
    queryFn: () => assessmentApi.get(id),
  });

  const submitMutation = useMutation({
    mutationFn: (payload) => assessmentApi.submit(id, payload),
    onSuccess: (res) => {
      navigate(`/assessment/${id}/result/${res.data.attemptId}`);
    },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const assessment = data?.data;
  if (!assessment) return <div className="card p-8 text-center"><p>Assessment not found</p></div>;

  const questions = assessment.questions || [];
  if (questions.length === 0) return <div className="card p-8 text-center"><p>No questions in this assessment</p></div>;

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question._id]: optionIndex }));
  };

  const handleSubmit = () => {
    const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));
    submitMutation.mutate({ answers: answerArray, startedAt });
  };

  const difficultyColor = {
    beginner: 'badge-success',
    intermediate: 'badge-warning',
    advanced: 'badge-danger',
  };

  const questionTextClass = simplifiedMode ? 'text-xl' : 'text-lg';
  const optionPadding = simplifiedMode ? 'p-5' : 'p-4';

  return (
    <div className="max-w-3xl mx-auto" role="main" aria-label="Assessment">
      {/* Accessibility mode indicator */}
      {simplifiedMode && (
        <div className="mb-4 p-2 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-xs flex items-center gap-2">
          <Accessibility className="w-3.5 h-3.5" /> Simplified Assessment Mode — one question at a time, larger text, keyboard navigation (1-4 to select, ←→ to navigate)
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-surface-900">{assessment.title}</h2>
          <span className="text-sm text-surface-500" aria-live="polite">{answeredCount}/{questions.length} answered</span>
        </div>
        <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-sm text-surface-500">
          <span aria-live="polite">Question {currentIndex + 1} of {questions.length}</span>
          <span className={`badge ${difficultyColor[question.difficulty]}`}>{question.difficulty}</span>
        </div>
      </div>

      <div className="card p-6 mb-6" ref={questionRef} tabIndex={-1} aria-label={`Question ${currentIndex + 1}`}>        {question.skill && (
          <div className="mb-3">
            <span className="badge bg-brand-50 text-brand-700">{question.skill?.name || 'Skill'}</span>
          </div>
        )}
        <p className={`${questionTextClass} text-surface-900 font-medium mb-6`}>{question.questionText}</p>
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              role="radio"
              aria-checked={answers[question._id] === i}
              aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
              className={`w-full text-left ${optionPadding} rounded-xl border-2 transition-all ${
                answers[question._id] === i
                  ? 'border-brand-500 bg-brand-50 text-brand-900'
                  : 'border-surface-200 hover:border-surface-300 text-surface-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                  answers[question._id] === i ? 'border-brand-500 bg-brand-500 text-white' : 'border-surface-300'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="btn-secondary"
        >
          <ChevronLeft className="w-5 h-5" /> Previous
        </button>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentIndex ? 'bg-brand-600' : answers[questions[i]._id] !== undefined ? 'bg-emerald-400' : 'bg-surface-200'
              }`}
            />
          ))}
        </div>
        {currentIndex < questions.length - 1 ? (
          <button onClick={() => setCurrentIndex((i) => i + 1)} className="btn-primary">
            Next <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || answeredCount < questions.length}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
          >
            {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit All <CheckCircle2 className="w-5 h-5" /></>}
          </button>
        )}
      </div>
      {answeredCount < questions.length && currentIndex === questions.length - 1 && (
        <p className="text-sm text-amber-600 text-center mt-3">⚠ You have {questions.length - answeredCount} unanswered questions</p>
      )}
    </div>
  );
}

// ─── RESULT PAGE ──────────────────────────────────────
function AssessmentResult() {
  const { id, attemptId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['assessmentResult', id, attemptId],
    queryFn: () => assessmentApi.getResult(id, attemptId),
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>;

  const attempt = data?.data;
  if (!attempt) return <div className="card p-8 text-center"><p>Result not found</p></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-8 text-center mb-6">
        <Award className="w-16 h-16 text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-2">Assessment Complete!</h1>
        <p className="text-surface-500">{attempt.assessment?.title}</p>
      </div>

      {/* Score */}
      <div className="card p-6 mb-6 text-center">
        <p className="text-sm text-surface-500 mb-2">Your Score</p>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={attempt.score >= 70 ? '#10b981' : attempt.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="10" strokeDasharray={`${attempt.score * 3.27} 327`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-surface-900">{attempt.score}%</span>
          </div>
        </div>
        <p className="text-surface-500 mt-3">{attempt.correctAnswers}/{attempt.totalQuestions} correct</p>
        <p className="text-sm text-surface-400 mt-1">Attempt #{attempt.attemptNumber}</p>
      </div>

      {/* Skill Breakdown */}
      {attempt.skillScores?.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Skill Breakdown</h2>
          <div className="space-y-3">
            {attempt.skillScores.map((ss, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium text-surface-700 w-36">{ss.skillName}</span>
                <div className="flex-1 h-3 bg-surface-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${ss.score >= 70 ? 'bg-emerald-500' : ss.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${ss.score}%` }} />
                </div>
                <span className="text-sm font-medium w-12 text-right">{ss.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {attempt.strengths?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Strengths</h3>
            <ul className="space-y-1.5">
              {attempt.strengths.map((s, i) => <li key={i} className="text-sm text-surface-600">✓ {s}</li>)}
            </ul>
          </div>
        )}
        {attempt.weaknesses?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2"><XCircle className="w-5 h-5" /> Areas to Improve</h3>
            <ul className="space-y-1.5">
              {attempt.weaknesses.map((w, i) => <li key={i} className="text-sm text-surface-600">△ {w}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/skills')} className="btn-primary">View Skill Analysis <BarChart3 className="w-4 h-4" /></button>
        <button onClick={() => navigate('/assessment')} className="btn-secondary">Back to Assessments</button>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────
export default function AssessmentPage() {
  const { id, attemptId } = useParams();

  if (attemptId) return <AssessmentResult />;
  if (id) return <TakeAssessment />;
  return <AssessmentList />;
}
