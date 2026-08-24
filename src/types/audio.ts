/** Стан плеєра для UI */
export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused';

/** Публічний API useAudioPlayer */
export interface AudioPlayerControls {
  status: PlayerStatus;
  isReady: boolean;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  /** Ім’я поточного файлу (file.name) або '' */
  fileName: string;
  loadFile: (file: File) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  /** Повернути UI до стану вибору файлу */
  resetToUploader: () => void;
  getAudioBuffer: () => AudioBuffer | null;
}