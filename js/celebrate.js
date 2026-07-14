// Zero-dependency confetti burst — small colored divs that fall with
// randomized trajectories, then remove themselves.

const COLORS = ['#7c5cff', '#ff5ca8', '#3ee6d0', '#ffd23f', '#3ddc84'];

export function fireConfetti(count = 60, maxDuration = 3.0) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const left = Math.random() * 100;
    const duration = 1.6 + Math.random() * (maxDuration - 1.6);
    const delay = Math.random() * 0.3;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    piece.style.left = `${left}vw`;
    piece.style.background = color;
    piece.style.animationDuration = `${duration}s`;
    piece.style.animationDelay = `${delay}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    frag.appendChild(piece);
    setTimeout(() => piece.remove(), (duration + delay) * 1000 + 200);
  }
  document.body.appendChild(frag);
}

/** A longer, three-wave confetti burst for finishing the whole game — spread
 * out and with a wider per-piece duration range so the celebration stays
 * visible for several seconds instead of flashing by in one glance. */
export function fireBigConfetti() {
  fireConfetti(120, 4.5);
  setTimeout(() => fireConfetti(90, 4.5), 700);
  setTimeout(() => fireConfetti(70, 4.5), 1500);
}

/** Shared AudioContext, created lazily. Reusing one context (instead of a
 * fresh one per call) means priming it once (see primeAudio) actually keeps
 * it running by the time sound is played later. */
let sharedCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!sharedCtx) sharedCtx = new Ctx();
  return sharedCtx;
}

/** Call this synchronously from a real user-gesture handler (e.g. a button's
 * click listener), before any `await`, so the browser's autoplay policy
 * treats the audio context as user-activated. If playApplause() only runs
 * later — after an async worker roundtrip and a multi-second replay
 * animation — that original activation can expire and the context is left
 * silently suspended (no error, just no sound). Priming here keeps it
 * running so audio actually plays when the celebration fires. */
export function primeAudio() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') ctx.resume();
  } catch (err) {
    console.warn('Could not prime audio context', err);
  }
}

/** Synthesized applause (no audio file needed): a wash of short filtered
 * noise bursts standing in for claps, topped with a short triumphant chime.
 * Fails silently if the browser blocks audio without a user gesture — the
 * click that triggers this counts as one, so it should normally play. */
export function playApplause() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const duration = 1.8;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    const clapCount = 45;
    for (let c = 0; c < clapCount; c++) {
      const start = Math.floor(Math.random() * (duration - 0.15) * ctx.sampleRate);
      const clapLen = Math.floor((0.02 + Math.random() * 0.03) * ctx.sampleRate);
      const gain = 0.4 + Math.random() * 0.6;
      for (let i = 0; i < clapLen && start + i < bufferSize; i++) {
        const envelope = Math.exp(-(i / clapLen) * 8);
        data[start + i] += (Math.random() * 2 - 1) * envelope * gain;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 0.7;
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6 - a little fanfare
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + 0.9 + i * 0.12;
      oGain.gain.setValueAtTime(0, startTime);
      oGain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      oGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(oGain);
      oGain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (err) {
    console.warn('Could not play applause sound', err);
  }
}
