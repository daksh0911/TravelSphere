// Web Audio API synthesized realistic paper tearing sound
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a realistic procedural paper tearing sound using filtered white noise
 */
export function playTearSound(volume = 0.28) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const duration = 0.22;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      // White noise with exponential envelope and randomized micro-crackle spikes
      const crackle = Math.random() > 0.88 ? 1.6 : 0.95;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 2.0) * crackle;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to simulate paper grain and friction
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + duration);
    filter.Q.value = 3.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch {
    /* ignore autoplay restrictions */
  }

  // Trigger mobile haptic vibration if supported
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([25, 30, 45]);
    }
  } catch {
    /* ignore */
  }
}
