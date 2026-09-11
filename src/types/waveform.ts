/** Настройки D3-графика */
export interface WaveformOptions {
  // Отступы графика от краёв.
  margin?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };

  // Высота графика.
  height?: number;

  // Ширина графика.
  width?: number;

  // Насколько широкими будут полоски waveform.
  padding?: number;
}