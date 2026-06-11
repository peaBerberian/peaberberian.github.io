export function createAudioEngine() {
  let audioCtx = null;

  function ensureAudio() {
    if (audioCtx === null) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        return null;
      }
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(
    freq,
    duration,
    type = "square",
    gain = 0.035,
    delay = 0,
    endFreq = freq,
  ) {
    const ctx = ensureAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
    }
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain, start + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playNoise(duration, gain = 0.025, delay = 0) {
    const ctx = ensureAudio();
    if (!ctx) {
      return;
    }
    const start = ctx.currentTime + delay;
    const samples = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, samples, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    const amp = ctx.createGain();
    src.buffer = buffer;
    amp.gain.setValueAtTime(0, start);
    amp.gain.linearRampToValueAtTime(gain, start + 0.004);
    amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
    src.connect(amp);
    amp.connect(ctx.destination);
    src.start(start);
    src.stop(start + duration + 0.02);
  }

  function playSound(type) {
    switch (type) {
      case "start":
        playTone(330, 0.05, "triangle", 0.02);
        playTone(660, 0.08, "triangle", 0.018, 0.05);
        break;
      case "paddle":
        playTone(520 + Math.random() * 80, 0.045, "square", 0.025);
        break;
      case "wall":
        playTone(260, 0.035, "triangle", 0.018, 0, 190);
        break;
      case "score":
        playNoise(0.08, 0.018);
        playTone(180, 0.12, "sawtooth", 0.026, 0, 90);
        playTone(360, 0.08, "triangle", 0.018, 0.08);
        break;
    }
  }

  return {
    ensureAudio,
    playSound,
  };
}
