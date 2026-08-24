class SoundDriver {
  private context: AudioContext;
  private gainNode: GainNode | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private bufferSource: AudioBufferSourceNode | null = null;

  private startedAt = 0;
  private pausedAt = 0;
  private isRunning = false;
  private volumeValue = 1;

  constructor() {
    this.context = new AudioContext();
  }

  async load(file: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    this.audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.pausedAt = 0;
    this.startedAt = 0;
    this.isRunning = false;
    return this.audioBuffer;
  }

  private ensureGain(): GainNode {
    if (!this.gainNode) {
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = this.volumeValue;
      this.gainNode.connect(this.context.destination);
    }
    return this.gainNode;
  }

  private stopSource(): void {
    if (!this.bufferSource) return;
    try {
      this.bufferSource.stop();
    } catch {
      // already stopped
    }
    this.bufferSource.disconnect();
    this.bufferSource = null;
  }

  async play(): Promise<void> {
    if (!this.audioBuffer || this.isRunning) return;

    const gain = this.ensureGain();
    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(gain);

    await this.context.resume();
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt = this.context.currentTime - this.pausedAt;
    this.pausedAt = 0;
    this.isRunning = true;
  }

  async pause(reset = false): Promise<void> {
    if (this.bufferSource) {
      const current = this.context.currentTime - this.startedAt;
      this.pausedAt = reset ? 0 : Math.max(0, current);
      this.stopSource();
    } else if (reset) {
      this.pausedAt = 0;
    }

    this.isRunning = false;
    await this.context.suspend();
  }

  async seek(time: number): Promise<void> {
    const clamped = Math.max(0, Math.min(time, this.duration));
    const wasPlaying = this.isRunning;

    if (wasPlaying) await this.pause();
    this.pausedAt = clamped;
    if (wasPlaying) await this.play();
  }

  setVolume(value: number): void {
    this.volumeValue = Math.max(0, Math.min(1, value));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volumeValue;
    }
  }

  get currentTime(): number {
    if (this.isRunning) {
      return this.context.currentTime - this.startedAt;
    }
    return this.pausedAt;
  }

  get duration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  get isPlaying(): boolean {
    return this.isRunning;
  }

  getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  async destroy(): Promise<void> {
    await this.pause(true);
    this.gainNode?.disconnect();
    this.gainNode = null;
    await this.context.close();
    this.audioBuffer = null;
  }
}

export default SoundDriver;