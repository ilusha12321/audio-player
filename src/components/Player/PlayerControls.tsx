// Иконки из lucide-react.
import { Play, Pause, Square } from 'lucide-react';
import './Player.css';

// Props приходят из Player.
interface Props {
  // true → показываем Pause, false → Play.
  isPlaying: boolean;

  // Блокирует кнопки.
  disabled?: boolean;

  // Функции управления плеером.
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

/** Кнопки Play/Pause и Stop */
export function PlayerControls({
  isPlaying,
  disabled,
  onPlay,
  onPause,
  onStop,
}: Props) {
  return (
    <div className="controls">

      {/* Одна кнопка переключается между Play и Pause. */}
      <button
        type="button"
        className={`controls__btn ${
          isPlaying
            ? 'controls__btn--pause'
            : 'controls__btn--play'
        }`}
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {/* Иконка зависит от состояния плеера. */}
        {isPlaying ? (
          <Pause size={18} strokeWidth={2.5} />
        ) : (
          <Play size={18} strokeWidth={2.5} />
        )}
      </button>

      {/* Stop всегда вызывает onStop. */}
      <button
        type="button"
        className="controls__btn controls__btn--stop"
        onClick={onStop}
        disabled={disabled}
        aria-label="Stop"
      >
        <Square size={16} strokeWidth={2.5} />
      </button>

    </div>
  );
}