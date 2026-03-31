import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext({});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('betatrace_settings');
    return saved ? JSON.parse(saved) : {
      timezone: 'America/New_York',
      glucoseUnit: 'mg/dL',
      darkMode: true,
    };
  });

  useEffect(() => {
    localStorage.setItem('betatrace_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

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
    formatTime,
    getLocalDatetimeValue
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
