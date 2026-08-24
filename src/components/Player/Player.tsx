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
  const {
    status,
    isReady,
    isPlaying,
    volume,
    currentTime,
    duration,
    fileName,
    loadFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    getAudioBuffer,
  } = useAudioPlayer();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioBuffer = getAudioBuffer();

  const handleNewFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void loadFile(file);
    e.target.value = '';
  };

  return (
    <div className="player">
      <TrackInfo fileName={fileName} />

      <div className="player__body">
        {(status === 'idle' || status === 'loading') && (
          <AudioUploader
            onFileSelect={loadFile}
            disabled={status === 'loading'}
          />
        )}

        {status === 'loading' && (
          <p className="player__loading">Loading...</p>
        )}

        {isReady && (
          <>
            <Waveform
              audioBuffer={audioBuffer}
              currentTime={currentTime}
              onSeek={seek}
            />

            <div className="player__toolbar">
              <div className="player__time">
                <span>{formatTime(currentTime)}</span>
                <span className="player__time-sep">/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <PlayerControls
                isPlaying={isPlaying}
                onPlay={play}
                onPause={pause}
                onStop={stop}
              />

              <VolumeControl
                volume={volume}
                onChange={setVolume}
                onToggleMute={toggleMute}
              />

              <button
                type="button"
                className="player__reload-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Завантажити інший файл"
                title="Завантажити інший файл"
              >
                <FolderOpen size={18} strokeWidth={2} />
              </button>

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