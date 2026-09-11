/** Возможные состояния плеера */
export type PlayerStatus =
  | 'idle'      // файл ещё не выбран
  | 'loading'   // файл загружается
  | 'ready'     // файл загружен и готов
  | 'playing'   // воспроизводится
  | 'paused';   // поставлен на паузу


/** Что возвращает useAudioPlayer */
export interface AudioPlayerControls {

  // Текущее состояние плеера.
  status: PlayerStatus;

  // Можно ли показывать основной интерфейс плеера.
  isReady: boolean;

  // Сейчас играет или нет.
  isPlaying: boolean;

  // Общая длительность аудио в секундах.
  duration: number;

  // Текущее время проигрывания.
  currentTime: number;

  // Громкость от 0 до 1.
  volume: number;

  // Имя выбранного файла.
  fileName: string;


  // Загружает аудиофайл.
  loadFile: (file: File) => Promise<void>;

  // Запускает воспроизведение.
  play: () => Promise<void>;

  // Ставит аудио на паузу.
  pause: () => Promise<void>;

  // Останавливает аудио и возвращает время в 0.
  stop: () => Promise<void>;

  // Переходит на указанное время.
  seek: (time: number) => Promise<void>;

  // Изменяет громкость.
  setVolume: (value: number) => void;

  // Включает/выключает звук.
  toggleMute: () => void;

  // Возвращает интерфейс к выбору файла.
  resetToUploader: () => void;

  // Получает AudioBuffer для Waveform.
  getAudioBuffer: () => AudioBuffer | null;
}