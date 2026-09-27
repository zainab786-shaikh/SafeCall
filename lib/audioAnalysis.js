const FRAME_SIZE = 2048;
const MAX_ANALYSIS_FRAMES = 180;
const MAX_AUDIO_SECONDS = 180;

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function estimatePitch(frame, sampleRate) {
  let mean = 0;
  for (let index = 0; index < frame.length; index += 1) mean += frame[index];
  mean /= frame.length;

  let energy = 0;
  for (let index = 0; index < frame.length; index += 1) {
    const centered = frame[index] - mean;
    energy += centered * centered;
  }
  if (energy / frame.length < 0.00002) return null;

  const minLag = Math.floor(sampleRate / 350);
  const maxLag = Math.min(Math.floor(sampleRate / 70), frame.length - 1);
  let bestLag = 0;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    for (let index = 0; index < frame.length - lag; index += 1) {
      correlation += (frame[index] - mean) * (frame[index + lag] - mean);
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestLag = lag;
    }
  }

  return bestLag && bestCorrelation / energy > 0.25 ? sampleRate / bestLag : null;
}

function calculateMfcc(frame, sampleRate) {
  const size = 512;
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  for (let index = 0; index < size; index += 1) {
    const sourceIndex = Math.floor(index * frame.length / size);
    const window = 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (size - 1));
    real[index] = frame[sourceIndex] * window;
  }

  for (let index = 1, reversed = 0; index < size; index += 1) {
    let bit = size >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (index < reversed) {
      [real[index], real[reversed]] = [real[reversed], real[index]];
    }
  }

  for (let length = 2; length <= size; length <<= 1) {
    const angle = -2 * Math.PI / length;
    const stepReal = Math.cos(angle);
    const stepImaginary = Math.sin(angle);
    for (let offset = 0; offset < size; offset += length) {
      let weightReal = 1;
      let weightImaginary = 0;
      for (let index = 0; index < length / 2; index += 1) {
        const even = offset + index;
        const odd = even + length / 2;
        const oddReal = real[odd] * weightReal - imaginary[odd] * weightImaginary;
        const oddImaginary = real[odd] * weightImaginary + imaginary[odd] * weightReal;
        real[odd] = real[even] - oddReal;
        imaginary[odd] = imaginary[even] - oddImaginary;
        real[even] += oddReal;
        imaginary[even] += oddImaginary;
        [weightReal, weightImaginary] = [
          weightReal * stepReal - weightImaginary * stepImaginary,
          weightReal * stepImaginary + weightImaginary * stepReal,
        ];
      }
    }
  }

  const power = new Float64Array(size / 2 + 1);
  for (let index = 0; index < power.length; index += 1) {
    power[index] = real[index] * real[index] + imaginary[index] * imaginary[index];
  }

  const hzToMel = (hz) => 2595 * Math.log10(1 + hz / 700);
  const melToHz = (mel) => 700 * (10 ** (mel / 2595) - 1);
  const lowMel = hzToMel(60);
  const highMel = hzToMel(Math.min(sampleRate / 2, 7600));
  const filters = 26;
  const points = Array.from({ length: filters + 2 }, (_, index) => {
    const mel = lowMel + (highMel - lowMel) * index / (filters + 1);
    return Math.floor((size + 1) * melToHz(mel) / sampleRate);
  });
  const logEnergies = Array.from({ length: filters }, (_, filter) => {
    const left = points[filter];
    const center = points[filter + 1];
    const right = points[filter + 2];
    let sum = 0;
    for (let index = left; index < center; index += 1) {
      sum += power[index] * (index - left) / Math.max(1, center - left);
    }
    for (let index = center; index < right; index += 1) {
      sum += power[index] * (right - index) / Math.max(1, right - center);
    }
    return Math.log(Math.max(sum, 1e-10));
  });

  return Array.from({ length: 13 }, (_, coefficient) => {
    let sum = 0;
    for (let filter = 0; filter < filters; filter += 1) {
      sum += logEnergies[filter] * Math.cos(Math.PI * coefficient * (filter + 0.5) / filters);
    }
    return Number(sum.toFixed(3));
  });
}

export async function analyzeAudioFile(file) {
  if (!file || (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|ogg|webm|aac)$/i.test(file.name))) {
    throw new Error('Choose a supported audio file.');
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio is not supported by this browser.');

  const context = new AudioContextClass({ sampleRate: 16000 });
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    if (decoded.duration > MAX_AUDIO_SECONDS) {
      throw new Error(`Audio must be ${MAX_AUDIO_SECONDS} seconds or shorter.`);
    }

    const sampleCount = decoded.length;
    const mono = new Float32Array(Math.max(sampleCount, FRAME_SIZE));
    for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
      const samples = decoded.getChannelData(channel);
      for (let index = 0; index < sampleCount; index += 1) mono[index] += samples[index] / decoded.numberOfChannels;
    }

    const frameCount = Math.max(1, Math.floor((sampleCount - FRAME_SIZE) / FRAME_SIZE) + 1);
    const analyzedCount = Math.min(frameCount, MAX_ANALYSIS_FRAMES);
    const frameStep = Math.max(1, Math.floor(frameCount / analyzedCount));
    const mfccStep = Math.max(frameStep, Math.floor(frameCount / 32));
    const rmsValues = [];
    const pitches = [];
    const mfccFrames = [];
    let silentFrames = 0;
    let longestSilenceFrames = 0;
    let silenceRun = 0;

    for (let frameNumber = 0; frameNumber < frameCount; frameNumber += 1) {
      const start = frameNumber * FRAME_SIZE;
      if (start + FRAME_SIZE > mono.length) break;
      const frame = mono.subarray(start, start + FRAME_SIZE);
      let sumSquares = 0;
      for (let index = 0; index < frame.length; index += 1) sumSquares += frame[index] * frame[index];
      rmsValues.push(Math.sqrt(sumSquares / frame.length));
    }

    const peakRms = Math.max(...rmsValues);
    if (peakRms < 0.001) throw new Error('No audible audio was detected in this file.');
    const silenceThreshold = Math.max(0.002, peakRms * 0.08);

    for (let frameNumber = 0; frameNumber < rmsValues.length; frameNumber += 1) {
      const start = frameNumber * FRAME_SIZE;
      const frame = mono.subarray(start, start + FRAME_SIZE);
      const rms = rmsValues[frameNumber];
      if (rms < silenceThreshold) {
        silentFrames += 1;
        silenceRun += 1;
        longestSilenceFrames = Math.max(longestSilenceFrames, silenceRun);
      } else {
        silenceRun = 0;
        if (frameNumber % frameStep === 0) {
          const pitch = estimatePitch(frame, decoded.sampleRate);
          if (pitch) pitches.push(pitch);
        }
        if (frameNumber % mfccStep === 0 && mfccFrames.length < 32) {
          mfccFrames.push(calculateMfcc(frame, decoded.sampleRate));
        }
      }
    }

    const activeRms = rmsValues.filter((value) => value >= silenceThreshold);
    const averageRms = activeRms.length
      ? activeRms.reduce((total, value) => total + value, 0) / activeRms.length
      : 0;
    const coefficients = Array.from({ length: 13 }, (_, index) => {
      const values = mfccFrames.map((frame) => frame[index]);
      return Number((values.reduce((total, value) => total + value, 0) / Math.max(1, values.length)).toFixed(3));
    });
    const pitchHz = median(pitches);

    return {
      durationSeconds: Number(decoded.duration.toFixed(1)),
      pitchHz: pitchHz ? Math.round(pitchHz) : null,
      energyDb: Number((20 * Math.log10(Math.max(averageRms, 1e-6))).toFixed(1)),
      silenceRatioPct: Math.round(silentFrames / Math.max(1, rmsValues.length) * 100),
      pauseDurationMs: Math.round(longestSilenceFrames * FRAME_SIZE / decoded.sampleRate * 1000),
      mfcc: coefficients,
      speechRateWpm: null,
      breathingRpm: null,
      transcriptSnippet: '',
      detectedKeywords: [],
      codeWordDetected: false,
      audioName: file.name,
      analysisNotes: ['Pitch estimate, energy, silence, pauses, and MFCCs analyzed locally.', 'Speech rate and breathing rate are not measured; phrase matching uses an optional transcript.'],
    };
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('Audio must') || error.message.startsWith('No audible'))) throw error;
    throw new Error('Could not decode this audio. Try a WAV, MP3, or browser-supported audio file.');
  } finally {
    await context.close();
  }
}