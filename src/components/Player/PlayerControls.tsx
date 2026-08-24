import { Play, Pause, Square } from 'lucide-react';
import './Player.css';

interface Props {
  isPlaying: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

/** Одна кнопка Play/Pause + окремий Stop */
export function PlayerControls({
  isPlaying,
  disabled,
  onPlay,
  onPause,
  onStop,
}: Props) {
  return (
    <div className="controls">
      <button
        type="button"
        className={`controls__btn ${
          isPlaying ? 'controls__btn--pause' : 'controls__btn--play'
        }`}
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={18} strokeWidth={2.5} />
        ) : (
          <Play size={18} strokeWidth={2.5} />
        )}
      </button>

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