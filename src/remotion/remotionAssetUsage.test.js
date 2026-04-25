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
  assert.match(source, /<Audio\b[^>]*src=\{staticFile\(['"]remotion\/betatrace-pulse\.wav['"]\)\}/s);
  assert.doesNotMatch(source, /<audio\b/);
});

test('ad composition includes LoggingScene after command center', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /function\s+LoggingScene\(/);
  assert.match(source, /<Sequence\s+from=\{180\}\s+durationInFrames=\{120\}>[\s\S]*<LoggingScene\s+\/>[\s\S]*<\/Sequence>/);
  assert.match(source, /Meals\.\s+Insulin\.\s+Glucose\./);
  assert.match(source, /Everything logged in seconds\./);
});

test('ad composition fills full 1260-frame timeline at 42fps', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  const sceneOrder = [
    ['300', '100', 'ICRPredictorScene', 'ICR Predictor'],
    ['400', '100', 'PatternAlertsScene', 'Pattern Alerts'],
    ['500', '100', 'AIChatbotScene', 'Ask Betatrace AI'],
    ['600', '100', 'NightscoutSyncScene', 'Nightscout Sync'],
    ['700', '100', 'A1CEstimatorScene', 'A1C Estimate'],
    ['800', '100', 'CorrectionFactorScene', 'Correction Factor'],
    ['900', '100', 'DexcomImportScene', 'Dexcom Import'],
    ['1000', '100', 'BrandStatementScene', 'Built for T1D decisions'],
    ['1100', '160', 'EndCardScene', 'Betatrace'],
  ];

  for (const [from, duration, component, copy] of sceneOrder) {
    assert.match(source, new RegExp(`function\\s+${component}\\(`));
    assert.match(source, new RegExp(`<Sequence\\s+from=\\{${from}\\}\\s+durationInFrames=\\{${duration}\\}>[\\s\\S]*<${component}\\s+\\/>[\\s\\S]*<\\/Sequence>`));
    assert.match(source, new RegExp(copy));
  }
});

test('Root composition is 42fps and 1260 frames', () => {
  const source = readCompositionSource('Root.jsx');

  assert.match(source, /fps=\{42\}/);
  assert.match(source, /durationInFrames=\{1260\}/);
});

test('EndCardScene includes GitHub and LinkedIn URLs', () => {
  const source = readCompositionSource('BetaTraceAd.jsx');

  assert.match(source, /github\.com\/Davey2Waveyy\/t1d/);
  assert.match(source, /linkedin\.com\/in\/david-cilliers/);
});
