import { useCallback, useEffect, useRef, useState } from 'react';
import SoundDriver from '../audio/SoundDriver';
import type { AudioPlayerControls, PlayerStatus } from '../types/audio';

export function useAudioPlayer(): AudioPlayerControls {
  const driverRef = useRef<SoundDriver | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [volume, setVolumeState] = useState(1);
  const previousVolumeRef = useRef(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    driverRef.current = new SoundDriver();
    return () => {
      void driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const loadFile = useCallback(async (file: File) => {
    if (!driverRef.current) return;

    await driverRef.current.pause(true);
    setStatus('loading');
    setFileName(file.name);

    try {
      const buffer = await driverRef.current.load(file);
      setDuration(buffer.duration);
      setCurrentTime(0);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setFileName('');
      setStatus('idle');
      throw err;
    }
  }, []);

  const play = useCallback(async () => {
    if (!driverRef.current) return;
    await driverRef.current.play();
    setStatus('playing');
  }, []);

  const pause = useCallback(async () => {
    if (!driverRef.current) return;
    await driverRef.current.pause();
    setCurrentTime(driverRef.current.currentTime);
    setStatus('paused');
  }, []);

  const stop = useCallback(async () => {
    if (!driverRef.current) return;
    await driverRef.current.pause(true);
    setCurrentTime(0);
    setStatus('ready');
  }, []);

  const seek = useCallback(async (time: number) => {
    if (!driverRef.current) return;
    await driverRef.current.seek(time);
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((value: number) => {
    const v = Math.max(0, Math.min(1, value));
    if (v > 0) previousVolumeRef.current = v;
    setVolumeState(v);
    driverRef.current?.setVolume(v);
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      previousVolumeRef.current = volume;
      setVolumeState(0);
      driverRef.current?.setVolume(0);
    } else {
      const restore = previousVolumeRef.current || 1;
      setVolumeState(restore);
      driverRef.current?.setVolume(restore);
    }
  }, [volume]);

  const resetToUploader = useCallback(async () => {
    if (!driverRef.current) return;
    await driverRef.current.pause(true);
    setCurrentTime(0);
    setDuration(0);
    setFileName('');
    setStatus('idle');
  }, []);

  const getAudioBuffer = useCallback((): AudioBuffer | null => {
    return driverRef.current?.getAudioBuffer() ?? null;
  }, []);

  useEffect(() => {
    if (status !== 'playing') return;

    let raf = 0;
    const tick = () => {
      if (driverRef.current) {
        const t = driverRef.current.currentTime;
        setCurrentTime(t);
        if (t >= driverRef.current.duration) {
          void driverRef.current.pause(true);
          setCurrentTime(0);
          setStatus('ready');
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status]);

  return {
    status,
    isReady: status === 'ready' || status === 'playing' || status === 'paused',
    isPlaying: status === 'playing',
    duration,
    currentTime,
    volume,
    fileName,
    loadFile,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    resetToUploader,
    getAudioBuffer,
  };
}