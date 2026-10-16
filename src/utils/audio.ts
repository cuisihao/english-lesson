/**
 * Audio synthesis utility:
 * 1. Web Speech API for authentic English TTS pronunciation
 * 2. Web Audio API for typing click feedback & check-in chimes
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isSoundEnabled: boolean = true;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  public getSoundEnabled(): boolean {
    return this.isSoundEnabled;
  }

  /**
   * Crisp typewriter key click sound
   */
  public playKeyClick() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // AudioContext fallback
    }
  }

  /**
   * Soft error bump sound
   */
  public playErrorBump() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }
  }

  /**
   * Harmonious completion / punch-in chime
   */
  public playSuccessChime() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.07 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.4);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundEffectsManager();

/**
 * Speech Synthesis Helper (TTS)
 */
export interface TTSOptions {
  rate?: number; // 0.8, 1.0, 1.2
  pitch?: number;
  lang?: 'en-GB' | 'en-US';
  onEnd?: () => void;
}

export function speakEnglish(text: string, options: TTSOptions = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredLang = options.lang || 'en-GB';

    // Find best matching voice
    const matchedVoice = voices.find(v => v.lang.startsWith(preferredLang)) ||
      voices.find(v => v.lang.startsWith('en')) ||
      null;

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = preferredLang;

    if (options.onEnd) {
      utterance.onend = () => {
        options.onEnd?.();
      };
      utterance.onerror = () => {
        options.onEnd?.();
      };
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Speech synthesis error:', err);
    options.onEnd?.();
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
