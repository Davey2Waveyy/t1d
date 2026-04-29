import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  DEFAULT_SESSION_SETTINGS,
  mergeSettings,
  sanitizeSessionSettings,
  sanitizeStoredSettings,
} from '../lib/publishConfig';

const SettingsContext = createContext({});
const SETTINGS_STORAGE_KEY = 'betatrace_settings';

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const { user, isGuest } = useAuth();
  const [storedSettings, setStoredSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!saved) {
      return sanitizeStoredSettings(null);
    }

    try {
      return sanitizeStoredSettings(JSON.parse(saved));
    } catch {
      return sanitizeStoredSettings(null);
    }
  });
  const [sessionSettings, setSessionSettings] = useState(() => sanitizeSessionSettings(null));

  const settings = useMemo(
    () => mergeSettings(storedSettings, sessionSettings),
    [storedSettings, sessionSettings],
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('light-theme', settings.darkMode === false);
    root.classList.toggle('dark-theme', settings.darkMode !== false);
    root.classList.toggle('dark', settings.darkMode !== false);
    root.style.colorScheme = settings.darkMode === false ? 'light' : 'dark';
  }, [settings.darkMode]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(storedSettings));
  }, [storedSettings]);

  const updateSettings = (newSettings) => {
    setStoredSettings((prev) => sanitizeStoredSettings({ ...prev, ...newSettings }));
    setSessionSettings((prev) => sanitizeSessionSettings({ ...prev, ...newSettings }));
  };

  const updateSessionSettings = (newSettings) => {
    setSessionSettings((prev) => sanitizeSessionSettings({ ...prev, ...newSettings }));
  };

  const clearSessionSettings = () => {
    setSessionSettings({ ...DEFAULT_SESSION_SETTINGS });
  };

  useEffect(() => {
    if (!user || isGuest) {
      setSessionSettings((prev) => {
        const sanitized = sanitizeSessionSettings(prev);
        const hasSessionValues = Object.values(sanitized).some(Boolean);

        return hasSessionValues ? { ...DEFAULT_SESSION_SETTINGS } : sanitized;
      });
    }
  }, [isGuest, user]);

  /**
   * Formats a date string into a localized time string based on the user's selected timezone.
   */
  const formatTime = (date, options = {}) => {
    if (!date) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: settings.timezone,
        hour: '2-digit',
        minute: '2-digit',
        ...options
      }).format(new Date(date));
    } catch (e) {
      console.error('Time formatting error:', e);
      return new Date(date).toLocaleTimeString();
    }
  };

  /**
   * Returns the current local time ISO string offset to the user's timezone
   * for datetime-local input default values.
   */
  const getLocalDatetimeValue = () => {
    const now = new Date();
    // Use Intl to get the current time in the selected timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: settings.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(now);
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
    
    return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
  };

  const value = {
    settings,
    updateSettings,
    updateSessionSettings,
    clearSessionSettings,
    formatTime,
    getLocalDatetimeValue
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
