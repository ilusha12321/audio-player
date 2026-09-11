// Отвечает за работу со звуком через Web Audio API.
class SoundDriver {
  // Главный объект Web Audio API.
  private context: AudioContext;

  // Управляет громкостью.
  private gainNode: GainNode | null = null;

  // Загруженное аудио.
  private audioBuffer: AudioBuffer | null = null;

  // Текущий источник воспроизведения.
  private bufferSource: AudioBufferSourceNode | null = null;

  // Время начала воспроизведения.
  private startedAt = 0;

  // Позиция после паузы.
  private pausedAt = 0;

  // Идёт ли воспроизведение.
  private isRunning = false;

  // Текущая громкость: 0–1.
  private volumeValue = 1;

  constructor() {
    // Создаём AudioContext.
    this.context = new AudioContext();
  }

  // Загружает файл и превращает его в AudioBuffer.
  async load(file: Blob): Promise<AudioBuffer> {
    // Получаем бинарные данные файла.
    const arrayBuffer = await file.arrayBuffer();

    // Декодируем аудио для Web Audio API.
    this.audioBuffer =
      await this.context.decodeAudioData(arrayBuffer);

    // Сбрасываем позицию и состояние.
    this.pausedAt = 0;
    this.startedAt = 0;
    this.isRunning = false;

    return this.audioBuffer;
  }

  // Создаёт GainNode для управления громкостью.
  private ensureGain(): GainNode {
    if (!this.gainNode) {
      this.gainNode = this.context.createGain();
      this.gainNode.gain.value = this.volumeValue;

      // GainNode → динамики.
      this.gainNode.connect(this.context.destination);
    }

    return this.gainNode;
  }

  // Останавливает текущий источник.
  private stopSource(): void {
    if (!this.bufferSource) return;

    try {
      this.bufferSource.stop();
    } catch {
      // Источник уже остановлен.
    }

    this.bufferSource.disconnect();
    this.bufferSource = null;
  }

  // Запускает или продолжает воспроизведение.
  async play(): Promise<void> {
    if (!this.audioBuffer || this.isRunning) return;

    const gain = this.ensureGain();

    // Создаём новый источник.
    this.bufferSource = this.context.createBufferSource();
    this.bufferSource.buffer = this.audioBuffer;
    this.bufferSource.connect(gain);

    // Возобновляем AudioContext.
    await this.context.resume();

    // Начинаем с сохранённой позиции.
    this.bufferSource.start(0, this.pausedAt);

    this.startedAt =
      this.context.currentTime - this.pausedAt;

    this.pausedAt = 0;
    this.isRunning = true;
  }

  // pause() — пауза, pause(true) — сброс в начало.
  async pause(reset = false): Promise<void> {
    if (this.bufferSource) {
      // Вычисляем текущую позицию.
      const current =
        this.context.currentTime - this.startedAt;

      this.pausedAt = reset
        ? 0
        : Math.max(0, current);

      this.stopSource();
    } else if (reset) {
      this.pausedAt = 0;
    }

    this.isRunning = false;
    await this.context.suspend();
  }

  // Переходит на указанную секунду.
  async seek(time: number): Promise<void> {
    // Ограничиваем время от 0 до duration.
    const clamped =
      Math.max(0, Math.min(time, this.duration));

    const wasPlaying = this.isRunning;

    if (wasPlaying) await this.pause();

    this.pausedAt = clamped;

    // Если играло — продолжаем играть.
    if (wasPlaying) await this.play();
  }

  // Устанавливает громкость от 0 до 1.
  setVolume(value: number): void {
    this.volumeValue =
      Math.max(0, Math.min(1, value));

    if (this.gainNode) {
      this.gainNode.gain.value =
        this.volumeValue;
    }
  }

  // Возвращает текущую позицию аудио.
  get currentTime(): number {
    if (this.isRunning) {
      return this.context.currentTime -
        this.startedAt;
    }

    return this.pausedAt;
  }

  // Возвращает длительность аудио.
  get duration(): number {
    return this.audioBuffer?.duration ?? 0;
  }

  // Возвращает состояние воспроизведения.
  get isPlaying(): boolean {
    return this.isRunning;
  }

  // Возвращает AudioBuffer для Waveform/D3.
  getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  // Полностью очищает ресурсы.
  async destroy(): Promise<void> {
    await this.pause(true);

    this.gainNode?.disconnect();
    this.gainNode = null;

    await this.context.close();

    this.audioBuffer = null;
  }
}

// Позволяет импортировать SoundDriver по умолчанию.
export default SoundDriver;