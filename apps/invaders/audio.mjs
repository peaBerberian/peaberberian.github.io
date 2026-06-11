export function createAudioEngine() {
  let audioCtx = null;
  let lastShootSoundTs = -Infinity;

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
    gain = 0.04,
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
    amp.gain.linearRampToValueAtTime(gain, start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playNoise(duration, gain = 0.03, delay = 0) {
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
    amp.gain.linearRampToValueAtTime(gain, start + 0.005);
    amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
    src.connect(amp);
    amp.connect(ctx.destination);
    src.start(start);
    src.stop(start + duration + 0.02);
  }

  function playSound(type) {
    switch (type) {
      case "shoot": {
        const now = performance.now();
        if (now - lastShootSoundTs < 80) {
          return;
        }
        lastShootSoundTs = now;
        const freq = 620 + Math.random() * 50;
        playTone(freq, 0.045, "triangle", 0.014, 0, freq * 0.85);
        break;
      }
      case "hit":
        playNoise(0.05, 0.025);
        playTone(180, 0.08, "sawtooth", 0.028, 0, 80);
        playTone(320, 0.05, "triangle", 0.018, 0.03, 220);
        break;
      case "powerup":
        playTone(440, 0.08, "sine", 0.026);
        playTone(660, 0.08, "sine", 0.026, 0.07);
        playTone(880, 0.12, "triangle", 0.022, 0.14);
        break;
      case "damage":
        playNoise(0.12, 0.035);
        playTone(150, 0.2, "sawtooth", 0.04, 0, 70);
        break;
      case "gameover":
        playTone(260, 0.12, "triangle", 0.032);
        playTone(190, 0.16, "triangle", 0.032, 0.12);
        playTone(120, 0.24, "triangle", 0.032, 0.28);
        break;
      case "wave":
        playTone(330, 0.07, "square", 0.022);
        playTone(495, 0.07, "square", 0.022, 0.07);
        playTone(660, 0.12, "triangle", 0.02, 0.14);
        break;
      case "boss":
        playTone(130, 0.12, "sawtooth", 0.03);
        playTone(196, 0.12, "square", 0.025, 0.09);
        playTone(260, 0.18, "triangle", 0.022, 0.18);
        break;
    }
  }

  return {
    ensureAudio,
    playSound,
  };
}
