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
