import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SETTINGS,
  DEFAULT_SESSION_SETTINGS,
  mergeSettings,
  sanitizeSessionSettings,
  sanitizeStoredSettings,
} from './publishConfig.js';

test('sanitizeStoredSettings removes sensitive client-side integration secrets', () => {
  const sanitized = sanitizeStoredSettings({
    timezone: 'Europe/London',
    glucoseUnit: 'mmol/L',
    darkMode: false,
    targetGlucose: '6.2',
    lowThreshold: '4.1',
    highThreshold: '9.8',
    geminiApiKey: 'AIza-secret',
    enableAiInsights: true,
  });

  assert.deepEqual(sanitized, {
    ...DEFAULT_SETTINGS,
    timezone: 'Europe/London',
    glucoseUnit: 'mmol/L',
    darkMode: false,
    targetGlucose: '6.2',
    lowThreshold: '4.1',
    highThreshold: '9.8',
  });
});

test('sanitizeStoredSettings falls back to safe defaults for invalid payloads', () => {
  assert.deepEqual(sanitizeStoredSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeStoredSettings('bad-value'), DEFAULT_SETTINGS);
});

test('sanitizeSessionSettings keeps sensitive integration values in session scope only', () => {
  const sanitized = sanitizeSessionSettings({
    timezone: 'Europe/London',
    enableAiInsights: true,
    geminiApiKey: 'AIza-secret',
  });

  assert.deepEqual(sanitized, {
    ...DEFAULT_SESSION_SETTINGS,
    enableAiInsights: true,
    geminiApiKey: 'AIza-secret',
  });
});

test('mergeSettings combines persisted preferences with session credentials', () => {
  const settings = mergeSettings(
    {
      timezone: 'Europe/London',
      glucoseUnit: 'mmol/L',
      darkMode: false,
    },
    {
      enableAiInsights: true,
      geminiApiKey: 'AIza-secret',
    }
  );

  assert.deepEqual(settings, {
    ...DEFAULT_SETTINGS,
    timezone: 'Europe/London',
    glucoseUnit: 'mmol/L',
    darkMode: false,
    ...DEFAULT_SESSION_SETTINGS,
    enableAiInsights: true,
    geminiApiKey: 'AIza-secret',
  });
});
