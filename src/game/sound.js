class SoundManager {
  constructor() {
    this.enabled = true;
    this.audioContext = null;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
  }

  playTone(frequency, duration, type = "sine", volume = 0.3) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    );

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration,
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playGrab() {
    this.playTone(400, 0.1, "square", 0.2);
    setTimeout(() => this.playTone(600, 0.1, "square", 0.2), 50);
  }

  playRetract() {
    this.playTone(200, 0.05, "sawtooth", 0.1);
  }

  playGold() {
    this.playTone(800, 0.1, "sine", 0.3);
    setTimeout(() => this.playTone(1000, 0.15, "sine", 0.3), 100);
    setTimeout(() => this.playTone(1200, 0.2, "sine", 0.3), 200);
  }

  playDiamond() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(1000 + i * 200, 0.1, "sine", 0.2), i * 50);
    }
  }

  playBomb() {
    this.playTone(100, 0.3, "sawtooth", 0.4);
    setTimeout(() => this.playTone(80, 0.2, "sawtooth", 0.3), 100);
  }

  playLevelUp() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, "sine", 0.3), i * 150);
    });
  }

  playGameOver() {
    const notes = [400, 350, 300, 250];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.3, "sine", 0.3), i * 200);
    });
  }

  playClick() {
    this.playTone(600, 0.05, "square", 0.15);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const soundManager = new SoundManager();
