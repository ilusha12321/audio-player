import { Volume2, VolumeX } from 'lucide-react';
import './Player.css';

interface Props {
  volume: number;
  onChange: (value: number) => void;
  onToggleMute: () => void;
  disabled?: boolean;
}

export function VolumeControl({
  volume,
  onChange,
  onToggleMute,
  disabled,
}: Props) {
  return (
    <div className="volume">
      <button
        type="button"
        className="volume__icon-btn"
        onClick={onToggleMute}
        disabled={disabled}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >
        {volume === 0 ? (
          <VolumeX size={20} strokeWidth={2} />
        ) : (
          <Volume2 size={20} strokeWidth={2} />
        )}
      </button>
      <input
        className="volume__slider"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Volume"
      />
    </div>
  );
}