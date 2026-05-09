/**
 * Web Audio synthesizer for arcade SFX. No external assets required —
 * sounds are generated procedurally from oscillators + envelopes so the
 * page can ship without /public/sounds/* files.
 *
 * Public API mirrors the old HTML5 Audio version: `preload()` from a
 * user-gesture handler, `play(name)` from anywhere, `setMuted(boolean)`.
 */

export type SoundName = 'hit' | 'shoot' | 'gameover';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;

  /**
   * Construct the AudioContext. Must be invoked from a user-gesture handler
   * (e.g. a click) so the context starts in the `running` state on Chrome.
   */
  preload() {
    if (this.ctx || typeof window === 'undefined') return;
    const Ctor =
      window.AudioContext ?? (window as unknown as WebkitWindow).webkitAudioContext;
    if (!Ctor) return;
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 1;
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.masterGain = master;
    } catch {
      this.ctx = null;
      this.masterGain = null;
    }
  }

  play(name: SoundName) {
    if (this.muted) return;
    const ctx = this.ctx;
    const out = this.masterGain;
    if (!ctx || !out) return;

    // Some browsers auto-suspend after backgrounding; nudge it back.
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const t = ctx.currentTime;
    switch (name) {
      case 'shoot':
        synthShoot(ctx, out, t);
        return;
      case 'hit':
        synthPop(ctx, out, t);
        return;
      case 'gameover':
        synthGameOver(ctx, out, t);
        return;
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      const t = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(t);
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, t);
    }
  }

  isMuted() {
    return this.muted;
  }
}

// ---------------- synthesis helpers ----------------

/** Short downward "pew" — triangle wave swept 1100 → 380 Hz over 80 ms. */
function synthShoot(ctx: AudioContext, out: AudioNode, t: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(1100, t);
  osc.frequency.exponentialRampToValueAtTime(380, t + 0.08);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);

  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.1);
}

/** Bubble pop — quick upward chirp with mild pitch jitter for variety. */
function synthPop(ctx: AudioContext, out: AudioNode, t: number) {
  const base = 540 + Math.random() * 220; // 540–760 Hz
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(base * 0.55, t);
  osc.frequency.exponentialRampToValueAtTime(base * 1.7, t + 0.045);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.24, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);

  osc.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** Three descending triangle blips — 440 → 330 → 220 Hz at 180 ms steps. */
function synthGameOver(ctx: AudioContext, out: AudioNode, t: number) {
  const tones = [440, 330, 220];
  tones.forEach((freq, i) => {
    const t0 = t + i * 0.18;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t0);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);

    osc.connect(gain).connect(out);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  });
}
