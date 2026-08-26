import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const remotionDir = dirname(fileURLToPath(import.meta.url));

function readCompositionSource(fileName) {
  return readFileSync(join(remotionDir, fileName), 'utf8');
}

test('ad composition does not use raw <img> or backgroundImage', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.doesNotMatch(source, /<img\b/);
  assert.doesNotMatch(source, /backgroundImage\s*:/);
});

test('ad composition uses Remotion Audio with staticFile for soundtrack', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /import\s+\{[^}]*\bAudio\b[^}]*\}\s+from\s+['"]@remotion\/media['"]/);
  assert.match(source, /<Audio\b[^>]*src=\{staticFile\(['"]remotion\/betatrace-pulse\.mp3['"]\)\}/s);
  assert.doesNotMatch(source, /<audio\b/);
});

test('ad composition includes Morning Logs after cold open', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /function\s+LoggingScene\(/);
  assert.match(source, /<Sequence\s+from=\{55\}\s+durationInFrames=\{95\}>[\s\S]*<LoggingScene\s+\/>[\s\S]*<\/Sequence>/);
  assert.match(source, /Morning Logs/);
  assert.match(source, /Meal, dose, glucose\./);
});

test('ad composition fills the approved day-in-life timeline with a longer closing sequence', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  const sceneOrder = [
    ['55', '95', 'LoggingScene', 'Morning Logs'],
    ['150', '100', 'ICRPredictorScene', 'Breakfast ICR'],
    ['250', '100', 'CorrectionFactorScene', 'Lunch Correction'],
    ['350', '110', 'AIChatbotScene', 'Ask Betatrace AI'],
    ['460', '120', 'PatternAlertsScene', 'Night Patterns'],
    ['580', '320', 'A1CEstimatorScene', 'A1C over time'],
  ];

  for (const [from, duration, component, copy] of sceneOrder) {
    assert.match(source, new RegExp(`function\\s+${component}\\(`));
    assert.match(source, new RegExp(`<Sequence\\s+from=\\{${from}\\}\\s+durationInFrames=\\{${duration}\\}>[\\s\\S]*<${component}\\s+\\/>[\\s\\S]*<\\/Sequence>`));
    assert.match(source, new RegExp(copy));
  }

  assert.doesNotMatch(source, /NightscoutSyncScene/);
  assert.doesNotMatch(source, /DexcomImportScene/);
  assert.doesNotMatch(source, /<EndCardScene\s+\/>/);
});

test('ad composition contains no provider-specific integration wording', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.doesNotMatch(source, /Nightscout/i);
  assert.doesNotMatch(source, /Dexcom/i);
  assert.doesNotMatch(source, /CGM/);
});

test('Root composition is 30fps and 900 frames', () => {
  const source = readCompositionSource('Root.jsx');

  assert.match(source, /fps=\{30\}/);
  assert.match(source, /durationInFrames=\{900\}/);
});

test('A1C closing sequence includes GitHub and LinkedIn URLs with a playful bounce', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /github\.com\/Davey2Waveyy\/t1d/);
  assert.match(source, /linkedin\.com\/in\/david-cilliers/);
  assert.match(source, /impactSquash/);
  assert.match(source, /ringToOrb/);
});

test('concept scenes use subtle bottom-center disclaimer', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /Concept demo - selected features shown as prototypes/);
  assert.match(source, /function\s+ConceptDisclaimer\(/);
});
