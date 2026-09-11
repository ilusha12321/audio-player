import { useRef } from 'react';
import { FolderOpen } from 'lucide-react';

import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { AudioUploader } from './AudioUploader';
import { PlayerControls } from './PlayerControls';
import { VolumeControl } from './VolumeControl';
import { TrackInfo } from './TrackInfo';
import { Waveform } from '../Waveform/Waveform';
import { formatTime } from '../../utils/formatTime';

import './Player.css';

export default function Player() {

  // Получаем состояние и функции плеера из useAudioPlayer.
const {
  status,          // Текущее состояние плеера: idle, loading, ready, playing или paused.
  isReady,         // true, если аудио загружено и плеер готов к работе.
  isPlaying,       // true, если аудио сейчас воспроизводится.
  volume,          // Текущая громкость от 0 до 1.
  currentTime,     // Текущая позиция воспроизведения в секундах.
  duration,        // Общая длительность аудио в секундах.
  fileName,        // Название загруженного аудиофайла.
  loadFile,        // Загружает выбранный аудиофайл.
  play,            // Запускает воспроизведение.
  pause,           // Ставит воспроизведение на паузу.
  stop,            // Останавливает аудио и возвращает позицию в начало.
  seek,            // Перемещает воспроизведение на указанную секунду.
  setVolume,       // Устанавливает громкость.
  toggleMute,      // Включает или выключает звук.
  getAudioBuffer,  // Возвращает загруженный AudioBuffer.
} = useAudioPlayer();


  // Ссылка на скрытый input для выбора нового файла.
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Получаем аудиоданные для Waveform.
  const audioBuffer = getAudioBuffer();


  // Вызывается, когда пользователь выбирает новый файл.
  const handleNewFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) void loadFile(file);

    // Очищаем input, чтобы можно было выбрать тот же файл снова.
    e.target.value = '';
  };


  return (
    <div className="player">

      {/* Показывает название текущего файла. */}
      <TrackInfo fileName={fileName} />


      <div className="player__body">

        {/* Пока файл не загружен — показываем загрузчик. */}
        {(status === 'idle' || status === 'loading') && (
          <AudioUploader
            onFileSelect={loadFile}
            disabled={status === 'loading'}
          />
        )}


        {/* Показываем текст во время загрузки файла. */}
        {status === 'loading' && (
          <p className="player__loading">
            Loading...
          </p>
        )}


        {/* Когда аудио готово — показываем основной интерфейс плеера. */}
        {isReady && (
          <>

            {/* Визуализация аудио через Drawer + D3. */}
            <Waveform
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              onSeek={seek}
            />


            <div className="player__toolbar">

              {/* Текущее время / общая длительность. */}
              <div className="player__time">
                <span>
                  {formatTime(currentTime)}
                </span>

                <span className="player__time-sep">
                  /
                </span>

                <span>
                  {formatTime(duration)}
                </span>
              </div>


              {/* Кнопки Play / Pause / Stop. */}
              <PlayerControls
                isPlaying={isPlaying}
                onPlay={play}
                onPause={pause}
                onStop={stop}
              />


              {/* Управление громкостью и Mute. */}
              <VolumeControl
                volume={volume}
                onChange={setVolume}
                onToggleMute={toggleMute}
              />


              {/* Кнопка для выбора другого аудиофайла. */}
              <button
                type="button"
                className="player__reload-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Завантажити інший файл"
                title="Завантажити інший файл"
              >
                <FolderOpen
                  size={18}
                  strokeWidth={2}
                />
              </button>


              {/* Сам input скрыт, его открывает кнопка выше. */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                hidden
                onChange={handleNewFile}
              />

            </div>
          </>
        )}
      </div>
    </div>
  );
}