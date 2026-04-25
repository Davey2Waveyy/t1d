export const DEFAULT_SETTINGS = {
  timezone: 'America/New_York',
  glucoseUnit: 'mg/dL',
  darkMode: true,
  lowThreshold: '',
  highThreshold: '',
  targetGlucose: '',
};

export const DEFAULT_SESSION_SETTINGS = {
  enableAiInsights: false,
  geminiApiKey: '',
  nightscoutUrl: '',
  nightscoutToken: '',
};

const ALLOWED_SETTING_KEYS = new Set(Object.keys(DEFAULT_SETTINGS));
const ALLOWED_SESSION_SETTING_KEYS = new Set(Object.keys(DEFAULT_SESSION_SETTINGS));

export function sanitizeStoredSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_SETTINGS };
  }

  const safeSettings = { ...DEFAULT_SETTINGS };

  for (const [key, entryValue] of Object.entries(value)) {
    if (ALLOWED_SETTING_KEYS.has(key)) {
      safeSettings[key] = entryValue;
    }
  }

  return safeSettings;
}

export function sanitizeSessionSettings(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_SESSION_SETTINGS };
  }

  const safeSessionSettings = { ...DEFAULT_SESSION_SETTINGS };

  for (const [key, entryValue] of Object.entries(value)) {
    if (!ALLOWED_SESSION_SETTING_KEYS.has(key)) {
      continue;
    }

    if (key === 'enableAiInsights') {
      safeSessionSettings[key] = Boolean(entryValue);
      continue;
    }

    safeSessionSettings[key] = typeof entryValue === 'string' ? entryValue : '';
  }

  return safeSessionSettings;
}

export function mergeSettings(storedSettings, sessionSettings) {
  return {
    ...sanitizeStoredSettings(storedSettings),
    ...sanitizeSessionSettings(sessionSettings),
  };
}
