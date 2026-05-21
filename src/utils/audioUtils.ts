// All sounds generated procedurally via Web Audio API — no asset files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function ramp(param: AudioParam, start: number, end: number, duration: number, ac: AudioContext) {
  param.setValueAtTime(start, ac.currentTime);
  param.exponentialRampToValueAtTime(Math.max(end, 0.0001), ac.currentTime + duration);
}

/** Dull thud — brush hitting compacted sand */
export function playDig(): void {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ac.currentTime + 0.18);
    gain.gain.setValueAtTime(0.4, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.22);
    osc.start();
    osc.stop(ac.currentTime + 0.25);
  } catch { /* audio unavailable */ }
}

/** Soft hiss — empty layer of sand */
export function playMiss(): void {
  try {
    const ac = getCtx();
    const bufSize = ac.sampleRate * 0.25;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;

    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    const gain = ac.createGain();
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ac.destination);
    gain.gain.setValueAtTime(0.6, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.25);
    src.start();
    src.stop(ac.currentTime + 0.3);
  } catch { /* audio unavailable */ }
}

/** Metallic ring — fossil fragment uncovered */
export function playHit(): void {
  try {
    const ac = getCtx();
    [440, 660, 880].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = ac.currentTime + i * 0.03;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25 - i * 0.06, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  } catch { /* audio unavailable */ }
}

/** Deep resonant gong — full fossil revealed */
export function playSunk(): void {
  try {
    const ac = getCtx();
    // Low drone
    const drone = ac.createOscillator();
    const droneGain = ac.createGain();
    drone.type = 'sawtooth';
    drone.frequency.value = 80;
    droneGain.gain.setValueAtTime(0.3, ac.currentTime);
    droneGain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 1.2);
    drone.connect(droneGain);
    droneGain.connect(ac.destination);
    drone.start();
    drone.stop(ac.currentTime + 1.3);

    // Bell overtones
    [220, 330, 550, 880].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.05;
      gain.gain.setValueAtTime(0.2 - i * 0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 1.1);
    });
  } catch { /* audio unavailable */ }
}

/** Ancient pentatonic fanfare — victory */
export function playVictory(): void {
  try {
    const ac = getCtx();
    // D pentatonic major: D4, F#4, A4, B4, D5
    const notes = [293.66, 369.99, 440, 493.88, 587.33];
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.65);
    });
  } catch { /* audio unavailable */ }
}

/** Descending glissando — defeat */
export function playDefeat(): void {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 1.0);
    ramp(gain.gain, 0.3, 0.0001, 1.1, ac);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 1.2);
  } catch { /* audio unavailable */ }
}

/** Parchment rustle — move token used */
export function playMove(): void {
  try {
    const ac = getCtx();
    const bufSize = ac.sampleRate * 0.15;
    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
      const t = i / ac.sampleRate;
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-t * 12);
    }
    const src = ac.createBufferSource();
    src.buffer = buf;
    const gain = ac.createGain();
    gain.gain.value = 0.7;
    src.connect(gain);
    gain.connect(ac.destination);
    src.start();
  } catch { /* audio unavailable */ }
}
