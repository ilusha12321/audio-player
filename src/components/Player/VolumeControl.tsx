// Иконки динамика из библиотеки lucide-react.
import { Volume2, VolumeX } from 'lucide-react';
import './Player.css';

// Описываем данные и функции,
// которые компонент получает от Player.
interface Props {
  // Текущая громкость: от 0 до 1.
  volume: number;

  // Вызывается, когда пользователь меняет громкость.
  onChange: (value: number) => void;

  // Включает/выключает звук.
  onToggleMute: () => void;

  // Можно отключить управление.
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

      {/* Кнопка Mute / Unmute */}
      <button
        type="button"
        className="volume__icon-btn"
        onClick={onToggleMute}
        disabled={disabled}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
      >

        {/* Если громкость 0 — показываем выключенный динамик. */}
        {volume === 0 ? (
          <VolumeX
            size={20}
            strokeWidth={2}
          />
        ) : (
          <Volume2
            size={20}
            strokeWidth={2}
          />
        )}

      </button>


      {/* Ползунок изменения громкости */}
      <input
        className="volume__slider"
        type="range"

        // Значение громкости от 0 до 1.
        min={0}
        max={1}

        // Шаг изменения — 0.01.
        step={0.01}

        value={volume}
        disabled={disabled}

        // input возвращает строку, поэтому превращаем её в number.
        onChange={(e) =>
          onChange(Number(e.target.value))
        }

        aria-label="Volume"
      />

    </div>
  );
}