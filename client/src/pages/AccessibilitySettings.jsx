import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAccessibility } from '../context/AccessibilityContext';
import { candidateApi } from '../api/app.api';
import {
  Accessibility, Type, Eye, Zap, BookOpen, Monitor, Save, Loader2,
  RotateCcw, Volume2, MousePointer, FileText, Hand,
} from 'lucide-react';

function Toggle({ enabled, onChange, label, description, id }) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-surface-50 border border-surface-100">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-surface-900 cursor-pointer">{label}</label>
        {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
          enabled ? 'bg-brand-600' : 'bg-surface-300'
        }`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

function RadioGroup({ options, value, onChange, name }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`p-3 rounded-xl border-2 text-center transition-all ${
            value === opt.value
              ? 'border-brand-500 bg-brand-50'
              : 'border-surface-200 bg-white hover:border-surface-300'
          }`}
          role="radio"
          aria-checked={value === opt.value}
        >
          <opt.icon className={`w-5 h-5 mx-auto mb-1 ${value === opt.value ? 'text-brand-600' : 'text-surface-400'}`} />
          <p className={`text-sm font-medium ${value === opt.value ? 'text-brand-700' : 'text-surface-700'}`}>{opt.label}</p>
          {opt.description && <p className="text-[10px] text-surface-400 mt-0.5">{opt.description}</p>}
        </button>
      ))}
    </div>
  );
}

const TEXT_SIZE_OPTIONS = [
  { value: 'normal', label: 'Normal', icon: Type, description: 'Default' },
  { value: 'large', label: 'Large', icon: Type, description: '16px base' },
  { value: 'xlarge', label: 'Extra Large', icon: Type, description: '18px base' },
];

const LEARNING_SUPPORT_OPTIONS = [
  { value: 'visual', label: 'Visual', icon: Eye, description: 'Charts, diagrams' },
  { value: 'audio', label: 'Audio', icon: Volume2, description: 'Lectures, podcasts' },
  { value: 'text', label: 'Text', icon: FileText, description: 'Articles, docs' },
  { value: 'hands_on', label: 'Hands-on', icon: Hand, description: 'Projects, labs' },
  { value: 'simplified', label: 'Simplified', icon: BookOpen, description: 'Plain language' },
];

export default function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings, syncFromProfile } = useAccessibility();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: candidateApi.getProfile,
  });

  const mutation = useMutation({
    mutationFn: (payload) => candidateApi.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
    },
  });



  const profile = data?.data?.profile;
  const learningSupport = profile?.learningSupportPreference || 'visual';
  const [localLearningSupport, setLocalLearningSupport] = useState(learningSupport);
  const [profileSynced, setProfileSynced] = useState(false);

  // Sync from profile once
  if (profile?.accessibilitySettings && !profileSynced) {
    syncFromProfile(profile.accessibilitySettings);
    setProfileSynced(true);
  }

  const handleSave = () => {
    mutation.mutate({
      accessibilitySettings: {
        textSize: settings.textSize,
        highContrast: settings.highContrast,
        reducedMotion: settings.reducedMotion,
        dyslexiaFont: settings.dyslexiaFont,
        screenReaderOptimized: settings.screenReaderOptimized,
      },
      learningSupportPreference: localLearningSupport,
    });
  };

  const handleLearningSupport = (value) => {
    setLocalLearningSupport(value);
    mutation.mutate({ learningSupportPreference: value });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Accessibility className="w-5 h-5 text-brand-600" />
          <h1 className="text-2xl font-bold text-surface-900">Accessibility Settings</h1>
        </div>
        <p className="text-surface-500">Customize your learning and assessment experience</p>
      </div>

      {/* Notice */}
      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
        These settings help customize your experience. This is an accessibility and learning-preference system — not a medical assessment.
      </div>

      {/* Text Size */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Type className="w-5 h-5 text-brand-600" /> Text Size
        </h2>
        <RadioGroup
          options={TEXT_SIZE_OPTIONS}
          value={settings.textSize}
          onChange={(v) => updateSetting('textSize', v)}
          name="textSize"
        />
      </div>

      {/* Visual Settings */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-brand-600" /> Visual Settings
        </h2>
        <div className="space-y-3">
          <Toggle
            id="high-contrast"
            enabled={settings.highContrast}
            onChange={(v) => updateSetting('highContrast', v)}
            label="High Contrast"
            description="Increases color contrast for better visibility"
          />
          <Toggle
            id="dyslexia-font"
            enabled={settings.dyslexiaFont}
            onChange={(v) => updateSetting('dyslexiaFont', v)}
            label="Dyslexia-Friendly Font"
            description="Uses OpenDyslexic font for easier reading"
          />
        </div>
      </div>

      {/* Motion & Navigation */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-600" /> Motion & Navigation
        </h2>
        <div className="space-y-3">
          <Toggle
            id="reduced-motion"
            enabled={settings.reducedMotion}
            onChange={(v) => updateSetting('reducedMotion', v)}
            label="Reduced Motion"
            description="Minimizes animations and transitions"
          />
          <Toggle
            id="screen-reader"
            enabled={settings.screenReaderOptimized}
            onChange={(v) => updateSetting('screenReaderOptimized', v)}
            label="Screen Reader Optimization"
            description="Enhances ARIA labels and focus management"
          />
        </div>
      </div>

      {/* Learning Support */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-600" /> Learning Support Preference
        </h2>
        <p className="text-sm text-surface-500 mb-4">Choose how you prefer to learn. We'll prioritize resources matching your preference.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LEARNING_SUPPORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => handleLearningSupport(opt.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  learningSupport === opt.value
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-surface-200 bg-white hover:border-surface-300'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${learningSupport === opt.value ? 'text-brand-600' : 'text-surface-400'}`} />
                <p className={`text-xs font-medium ${learningSupport === opt.value ? 'text-brand-700' : 'text-surface-700'}`}>{opt.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 mb-3">Preview</h2>
        <div className="space-y-2 text-sm text-surface-600">
          <p>Text size: <strong className="capitalize">{settings.textSize}</strong></p>
          <p>High contrast: <strong>{settings.highContrast ? 'On' : 'Off'}</strong></p>
          <p>Reduced motion: <strong>{settings.reducedMotion ? 'On' : 'Off'}</strong></p>
          <p>Dyslexia font: <strong>{settings.dyslexiaFont ? 'On' : 'Off'}</strong></p>
          <p>Screen reader: <strong>{settings.screenReaderOptimized ? 'On' : 'Off'}</strong></p>
          <p>Learning preference: <strong className="capitalize">{learningSupport?.replace('_', ' ')}</strong></p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={handleSave} disabled={mutation.isPending} className="btn-primary flex-1">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save to Profile</>}
        </button>
        <button onClick={resetSettings} className="btn-secondary">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {mutation.isSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          Settings saved successfully!
        </div>
      )}
    </div>
  );
}
