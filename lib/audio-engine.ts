export class MorseAudioEngine {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private pitch: number = 700;
  private volume: number = 0.5;
  private isPlaying: boolean = false;

  constructor() {}

  private init() {
    if (this.audioCtx) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    this.audioCtx = new AudioContextClass();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audioCtx && this.gainNode && this.isPlaying) {
      this.gainNode.gain.linearRampToValueAtTime(
        this.volume,
        this.audioCtx.currentTime + 0.02,
      );
    }
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(200, Math.min(2000, pitch));
    if (this.oscillator && this.audioCtx) {
      this.oscillator.frequency.setValueAtTime(
        this.pitch,
        this.audioCtx.currentTime,
      );
    }
  }

  public async startTone() {
    this.init();

    if (!this.audioCtx || !this.gainNode) return;

    if (this.audioCtx.state === "suspended") {
      await this.audioCtx.resume();
    }

    if (this.isPlaying) return;

    try {
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = "sine";
      this.oscillator.frequency.setValueAtTime(
        this.pitch,
        this.audioCtx.currentTime,
      );
      this.oscillator.connect(this.gainNode);
      this.oscillator.start();

      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
      this.gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.007);

      this.isPlaying = true;
    } catch (err) {
      console.error("Failed to start Morse tone:", err);
    }
  }

  public stopTone() {
    if (!this.audioCtx || !this.gainNode || !this.isPlaying) return;

    try {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(0, now + 0.01);

      const currentOsc = this.oscillator;
      setTimeout(() => {
        try {
          if (currentOsc && this.audioCtx && this.audioCtx.state !== "closed") {
            currentOsc.stop();
            currentOsc.disconnect();
          }
        } catch {
          // ignore if already stopped
        }
      }, 20);

      this.oscillator = null;
      this.isPlaying = false;
    } catch (err) {
      console.error("Failed to stop Morse tone:", err);
    }
  }

  public cleanup() {
    this.stopTone();
    if (this.audioCtx) {
      this.audioCtx.close().catch(console.error);
      this.audioCtx = null;
      this.gainNode = null;
    }
  }
}
