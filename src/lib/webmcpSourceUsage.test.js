import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const libDir = dirname(fileURLToPath(import.meta.url));

function readSource(fileName) {
  return readFileSync(join(libDir, fileName), 'utf8');
}

test('webmcp.js never imports or references Supabase', () => {
  const source = readSource('webmcp.js');

  assert.doesNotMatch(source, /supabase/i);
});

test('webmcp.js registers exactly three tools and no dose-calculation or recommendation tool', () => {
  const source = readSource('webmcp.js');

  const nameMatches = [...source.matchAll(/name:\s*'([a-z_]+)'/g)].map((match) => match[1]);

  assert.deepEqual(nameMatches, ['get_demo_state', 'log_demo_entry', 'reset_demo_data']);
  assert.doesNotMatch(source, /recommend_dose|calculate_dose|correction_factor|dose_recommendation/i);
});

test('get_demo_state never returns dosing, correction, A1C, or active-insulin estimates', () => {
  const source = readSource('webmcp.js');

  // Isolate just the execute() body - not the tool's own description prose,
  // which legitimately names these terms to explain what it will NOT do.
  const start = source.indexOf('async execute(_input, options) {');
  const end = source.indexOf('// log_demo_entry - mutating');
  assert.ok(start !== -1 && end !== -1 && start < end, 'could not isolate get_demo_state execute()');
  const executeSource = source.slice(start, end);

  assert.doesNotMatch(executeSource, /estimatedA1C/);
  assert.doesNotMatch(executeSource, /activeInsulin/);
  assert.doesNotMatch(executeSource, /recommend/i);
  assert.doesNotMatch(executeSource, /correction/i);
});
