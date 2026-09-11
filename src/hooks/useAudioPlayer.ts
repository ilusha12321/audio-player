import {useCallback,useEffect,useRef,useState,} from 'react';

import SoundDriver from '../audio/SoundDriver';

import type {AudioPlayerControls, PlayerStatus,} from '../types/audio';

export function useAudioPlayer(): AudioPlayerControls {

  // Храним SoundDriver между перерендерами React.
  const driverRef = useRef<SoundDriver | null>(null);

  // Текущее состояние плеера.
  const [status, setStatus] = useState<PlayerStatus>('idle');

  // Громкость от 0 до 1.
  const [volume, setVolumeState] = useState(1);

  // Запоминаем громкость перед Mute.
  const previousVolumeRef = useRef(1);

  // Общая длительность аудио.
  const [duration, setDuration] = useState(0);

  // Текущее положение проигрывания.
  const [currentTime, setCurrentTime] = useState(0);

  // Имя выбранного файла.
  const [fileName, setFileName] = useState('');


  // Создаём SoundDriver при создании хука.
  useEffect(() => {
    driverRef.current = new SoundDriver();

    // При удалении компонента закрываем AudioContext.
    return () => {
      void driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);


  // Загружает аудиофайл в SoundDriver.
  const loadFile = useCallback(async (file: File) => {

    if (!driverRef.current) return;

    // Останавливаем предыдущее аудио.
    await driverRef.current.pause(true);

    setStatus('loading');
    setFileName(file.name);

    try {
      // SoundDriver читает файл и создаёт AudioBuffer.
      const buffer = await driverRef.current.load(file);

      setDuration(buffer.duration);
      setCurrentTime(0);
      setStatus('ready');

    } catch (err) {
      console.error(err);

      // Если загрузка не удалась — возвращаемся в idle.
      setFileName('');
      setStatus('idle');

      throw err;
    }
  }, []);


  // Запускает воспроизведение.
  const play = useCallback(async () => {
    if (!driverRef.current) return;

    await driverRef.current.play();
    setStatus('playing');
  }, []);


  // Ставит аудио на паузу.
  const pause = useCallback(async () => {
    if (!driverRef.current) return;

    await driverRef.current.pause();

    // Получаем точное время из SoundDriver.
    setCurrentTime(driverRef.current.currentTime);

    setStatus('paused');
  }, []);


  // Полностью останавливает аудио и возвращает время в 0.
  const stop = useCallback(async () => {
    if (!driverRef.current) return;

    await driverRef.current.pause(true);

    setCurrentTime(0);
    setStatus('ready');
  }, []);


  // Перемещает проигрывание на указанное время.
  const seek = useCallback(async (time: number) => {
    if (!driverRef.current) return;

    await driverRef.current.seek(time);

    setCurrentTime(time);
  }, []);


  // Изменяет громкость.
  const setVolume = useCallback((value: number) => {

    // Ограничиваем значение диапазоном 0–1.
    const v = Math.max(0, Math.min(1, value));

    // Запоминаем последнюю громкость перед Mute.
    if (v > 0) {
      previousVolumeRef.current = v;
    }

    setVolumeState(v);

    // Передаём громкость в SoundDriver.
    driverRef.current?.setVolume(v);
  }, []);


  // Включает или выключает звук.
  const toggleMute = useCallback(() => {

    if (volume > 0) {

      // Запоминаем текущую громкость и ставим 0.
      previousVolumeRef.current = volume;
      setVolumeState(0);
      driverRef.current?.setVolume(0);

    } else {

      // Возвращаем громкость, которая была до Mute.
      const restore = previousVolumeRef.current || 1;

      setVolumeState(restore);
      driverRef.current?.setVolume(restore);
    }

  }, [volume]);


  // Сбрасывает плеер обратно к выбору файла.
  const resetToUploader = useCallback(async () => {
    if (!driverRef.current) return;

    await driverRef.current.pause(true);

    setCurrentTime(0);
    setDuration(0);
    setFileName('');
    setStatus('idle');
  }, []);


  // Получаем AudioBuffer для Waveform.
  const getAudioBuffer = useCallback((): AudioBuffer | null => {
    return driverRef.current?.getAudioBuffer() ?? null;
  }, []);


  // Следим за currentTime во время проигрывания.
  useEffect(() => {

    if (status !== 'playing') return;

    let raf = 0;

    const tick = () => {

      if (driverRef.current) {

        // Берём текущее время из SoundDriver.
        const t = driverRef.current.currentTime;

        // Передаём его в React.
        setCurrentTime(t);


        // Если дошли до конца — останавливаем плеер.
        if (t >= driverRef.current.duration) {
          void driverRef.current.pause(true);

          setCurrentTime(0);
          setStatus('ready');

          return;
        }
      }

      // Следующее обновление через requestAnimationFrame.
      raf = requestAnimationFrame(tick);
    };


    raf = requestAnimationFrame(tick);

    // Останавливаем animation frame,
    // когда эффект перестаёт работать.
    return () => cancelAnimationFrame(raf);

  }, [status]);


  // Всё это становится доступно компоненту Player.
  return {
    status,

    // Готов к работе, если файл загружен.
    isReady:
      status === 'ready' ||
      status === 'playing' ||
      status === 'paused',

    isPlaying: status === 'playing',

    duration,
    currentTime,
    volume,
    fileName,

    // Функции управления плеером.
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