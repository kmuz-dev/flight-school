/** Procedural, gesture-started audio with collision and finish cues above ambience. */
export class HallwayFlightAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private wind: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private flutter: OscillatorNode | null = null;
  private flutterGain: GainNode | null = null;
  private muted = false;

  async start(): Promise<void> {
    try {
      if (this.context) {
        if (this.context.state === "suspended") await this.context.resume();
        return;
      }
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const master = context.createGain();
      master.gain.value = this.muted ? 0 : 0.32;
      master.connect(context.destination);

      const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
      const noise = context.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 720;
      filter.Q.value = 0.55;
      const wind = context.createGain();
      wind.gain.value = 0.025;
      noise.connect(filter).connect(wind).connect(master);
      noise.start();

      const flutter = context.createOscillator();
      flutter.type = "triangle";
      flutter.frequency.value = 18;
      const flutterGain = context.createGain();
      flutterGain.gain.value = 0.012;
      flutter.connect(flutterGain).connect(master);
      flutter.start();

      this.context = context;
      this.master = master;
      this.wind = wind;
      this.windFilter = filter;
      this.flutter = flutter;
      this.flutterGain = flutterGain;
    } catch {
      this.dispose();
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.32, this.context.currentTime, 0.02);
    }
  }

  setPaused(paused: boolean): void {
    const context = this.context;
    if (!context || context.state === "closed") return;
    if (paused && context.state === "running") void context.suspend().catch(() => undefined);
    if (!paused && context.state === "suspended") void context.resume().catch(() => undefined);
  }

  setFlight(speedRatio: number): void {
    if (!this.context || !this.wind || !this.windFilter || !this.flutter || !this.flutterGain) return;
    const ratio = Number.isFinite(speedRatio) ? Math.max(0, Math.min(1.2, speedRatio)) : 0;
    const now = this.context.currentTime;
    this.wind.gain.setTargetAtTime(0.018 + ratio * 0.04, now, 0.08);
    this.windFilter.frequency.setTargetAtTime(560 + ratio * 620, now, 0.1);
    this.flutter.frequency.setTargetAtTime(14 + ratio * 13, now, 0.1);
    this.flutterGain.gain.setTargetAtTime(0.008 + ratio * 0.012, now, 0.1);
  }

  gust(): void {
    this.tone(520, 0.16, 0.11, 160);
    this.tone(780, 0.2, 0.06, 90, 0.055);
  }

  closePass(chain: number): void {
    const safeChain = Number.isFinite(chain) ? chain : 1;
    const semitones = Math.min(12, Math.max(0, safeChain - 1) * 2);
    this.tone(420 * 2 ** (semitones / 12), 0.12, 0.07, 25);
  }

  collision(): void {
    this.noise(0.2, 0.15, 180);
    this.tone(130, 0.28, 0.11, -70);
  }

  finish(): void {
    [0, 4, 7, 12].forEach((semitone, index) => {
      this.tone(392 * 2 ** (semitone / 12), 0.38, 0.08, 18, index * 0.08);
    });
  }

  dispose(): void {
    const context = this.context;
    this.context = null;
    this.master = null;
    this.wind = null;
    this.windFilter = null;
    this.flutter = null;
    this.flutterGain = null;
    if (context && context.state !== "closed") void context.close().catch(() => undefined);
  }

  private tone(
    frequency: number,
    duration: number,
    gain: number,
    sweep: number,
    delay = 0,
  ): void {
    const context = this.context;
    const master = this.master;
    if (!context || !master || context.state === "closed") return;
    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency * (0.96 + Math.random() * 0.08), start);
    oscillator.frequency.linearRampToValueAtTime(Math.max(40, frequency + sweep), start + duration);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(envelope).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private noise(duration: number, gain: number, frequency: number): void {
    const context = this.context;
    const master = this.master;
    if (!context || !master || context.state === "closed") return;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = frequency;
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(gain, context.currentTime);
    envelope.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    source.connect(filter).connect(envelope).connect(master);
    source.start();
  }
}
