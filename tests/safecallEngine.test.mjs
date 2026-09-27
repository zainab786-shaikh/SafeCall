import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const engineSource = await readFile(new URL('../lib/safecallEngine.js', import.meta.url), 'utf8');
const engine = await import(`data:text/javascript;base64,${Buffer.from(engineSource).toString('base64')}`);
const {
  DEFAULT_USER_BASELINE,
  PROTOTYPE_WEIGHTS,
  REAL_WORLD_SCENARIOS,
  evaluateSession,
} = engine;

test('prototype signal weights sum to one', () => {
  const total = Object.values(PROTOTYPE_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  assert.equal(Number(total.toFixed(3)), 1);
});

test('reference scenarios follow their specified categories', () => {
  const expectedLevels = [4, 2, 1, 4];
  REAL_WORLD_SCENARIOS.forEach((scenario, index) => {
    assert.equal(evaluateSession(scenario.sessionData).level, expectedLevels[index], scenario.id);
  });
});

test('a pitch anomaly with an unusual hour does not trigger a safety event alone', () => {
  const evaluation = evaluateSession({
    pitchHz: 265,
    energyDb: DEFAULT_USER_BASELINE.avgEnergyDb,
    speakingRateWpm: 135,
    breathingRpm: null,
    silenceRatioPct: DEFAULT_USER_BASELINE.silenceRatioPct,
    pauseDurationMs: DEFAULT_USER_BASELINE.avgPauseDurationMs,
    detectedKeywords: [],
    codeWordDetected: false,
    isOutsideRoutine: true,
    isOutsideSafeLocation: false,
    microTremorJitterPct: null,
  });

  assert.notEqual(evaluation.level, 4);
  assert.equal(evaluation.triggerSilentAlert, false);
});

test('unmeasured breathing remains neutral and is identified as unavailable', () => {
  const evaluation = evaluateSession({
    pitchHz: DEFAULT_USER_BASELINE.avgPitchHz,
    energyDb: DEFAULT_USER_BASELINE.avgEnergyDb,
    breathingRpm: null,
    silenceRatioPct: DEFAULT_USER_BASELINE.silenceRatioPct,
    pauseDurationMs: DEFAULT_USER_BASELINE.avgPauseDurationMs,
    detectedKeywords: [],
    codeWordDetected: false,
    isOutsideRoutine: false,
    isOutsideSafeLocation: false,
    locationChecked: false,
  });

  assert.equal(evaluation.signals.breathingAnomaly.value, 0);
  assert.equal(evaluation.signals.breathingAnomaly.detail, 'Not measured');
  assert.equal(evaluation.signals.locationAnomaly.value, 0);
  assert.equal(evaluation.signals.locationAnomaly.detail, 'Not checked');
  assert.equal(evaluation.signals.microTremorAnomaly.detail, 'Not measured');
  assert.equal(evaluation.level, 1);
});