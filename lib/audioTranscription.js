const MODEL_ID = 'Xenova/whisper-tiny.en';
let transcriberPromise;

function toMono16k(decoded) {
  const mono = new Float32Array(decoded.length);
  for (let channel = 0; channel < decoded.numberOfChannels; channel += 1) {
    const samples = decoded.getChannelData(channel);
    for (let index = 0; index < samples.length; index += 1) {
      mono[index] += samples[index] / decoded.numberOfChannels;
    }
  }

  if (decoded.sampleRate === 16000) return mono;

  const outputLength = Math.max(1, Math.round(decoded.duration * 16000));
  const resampled = new Float32Array(outputLength);
  const sourceStep = decoded.sampleRate / 16000;
  for (let index = 0; index < outputLength; index += 1) {
    const sourcePosition = index * sourceStep;
    const left = Math.floor(sourcePosition);
    const right = Math.min(left + 1, mono.length - 1);
    const fraction = sourcePosition - left;
    resampled[index] = mono[left] * (1 - fraction) + mono[right] * fraction;
  }
  return resampled;
}

async function getTranscriber(onProgress) {
  if (!transcriberPromise) {
    transcriberPromise = import('@huggingface/transformers').then(({ env, pipeline }) => {
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      return pipeline('automatic-speech-recognition', MODEL_ID, {
        dtype: 'q8',
        device: 'wasm',
        progress_callback: onProgress,
      });
    });
  }
  return transcriberPromise;
}

export async function transcribeAudioFile(file, onProgress) {
  if (typeof window === 'undefined') throw new Error('Audio transcription is only available in the browser.');
  if (!file) throw new Error('Choose an audio file first.');

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio is not supported by this browser.');

  const context = new AudioContextClass();
  try {
    const decoded = await context.decodeAudioData(await file.arrayBuffer());
    const transcriber = await getTranscriber(onProgress);
    const result = await transcriber(toMono16k(decoded), {
      chunk_length_s: 30,
      stride_length_s: 5,
    });
    return typeof result === 'string' ? result.trim() : (result.text || '').trim();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unsupported')) throw error;
    throw new Error('Could not transcribe this audio. You can enter a transcript manually.');
  } finally {
    await context.close();
  }
}
