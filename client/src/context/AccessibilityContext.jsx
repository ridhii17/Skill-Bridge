import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AccessibilityContext = createContext(null);

const DEFAULT_SETTINGS = {
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
  screenReaderOptimized: false,
};

const STORAGE_KEY = 'skillbridge_accessibility';

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings);
  const [initialized, setInitialized] = useState(false);

  // Apply settings to document root
  useEffect(() => {
    const root = document.documentElement;

    // Text size
    root.classList.remove('text-normal', 'text-large', 'text-xlarge');
    root.classList.add(`text-${settings.textSize}`);

    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);

    // Reduced motion
    root.classList.toggle('reduced-motion', settings.reducedMotion);

    // Dyslexia font
    root.classList.toggle('dyslexia-font', settings.dyslexiaFont);

    // Screen reader optimization
    root.classList.toggle('sr-optimized', settings.screenReaderOptimized);

    // Save to localStorage
    saveSettings(settings);
    setInitialized(true);
  }, [settings]);

  // Sync from profile when loaded
  const syncFromProfile = useCallback((profileSettings) => {
    if (profileSettings) {
      setSettings((prev) => ({
        ...prev,
        textSize: profileSettings.textSize || prev.textSize,
        highContrast: profileSettings.highContrast ?? prev.highContrast,
        reducedMotion: profileSettings.reducedMotion ?? prev.reducedMotion,
        dyslexiaFont: profileSettings.dyslexiaFont ?? prev.dyslexiaFont,
        screenReaderOptimized: profileSettings.screenReaderOptimized ?? prev.screenReaderOptimized,
      }));
    }
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  const value = {
    settings,
    updateSetting,
    syncFromProfile,
    resetSettings,
    initialized,
    textSize: settings.textSize,
    highContrast: settings.highContrast,
    reducedMotion: settings.reducedMotion,
    dyslexiaFont: settings.dyslexiaFont,
    screenReaderOptimized: settings.screenReaderOptimized,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return context;
}
