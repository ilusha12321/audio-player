import { useEffect, useRef } from 'react';
import Drawer from '../../visualization/Drawer';
import './Waveform.css';

// Props, которые Waveform получает от Player.
interface Props {
  // Аудиоданные для построения waveform.
  audioBuffer: AudioBuffer | null;

  // Текущее время проигрывания.
  currentTime?: number;

  // Функция перехода на нужное время.
  onSeek?: (seconds: number) => void;
}


export function Waveform({
  audioBuffer,
  currentTime = 0,
  onSeek,
}: Props) {

  // Ссылка на div, внутри которого Drawer создаст SVG.
  const containerRef = useRef<HTMLDivElement>(null);

  // Здесь хранится экземпляр Drawer.
  const drawerRef = useRef<Drawer | null>(null);


  // Создаём/пересоздаём waveform,
  // когда меняется AudioBuffer.
  useEffect(() => {

    // Пока нет аудио или HTML-элемента — ничего не делаем.
    if (!audioBuffer || !containerRef.current) return;


    // Удаляем старый Drawer перед созданием нового.
    drawerRef.current?.destroy();


    // Создаём Drawer и передаём ему:
    // 1. данные аудио
    // 2. HTML-контейнер
    const drawer = new Drawer(audioBuffer,  containerRef.current);


    // Передаём Drawer функцию seek.
    if (onSeek) {
      drawer.setOnSeek(onSeek);
    }


    // Drawer создаёт waveform через D3.
    drawer.generateWaveform();


    // Сохраняем Drawer в useRef.
    drawerRef.current = drawer;


    // Cleanup выполняется при удалении/пересоздании waveform.
    return () => {
      drawer.destroy();
      drawerRef.current = null;
    };

  }, [audioBuffer]);


  // Если onSeek изменился — обновляем callback в Drawer.
  useEffect(() => {
    if (drawerRef.current && onSeek) {
      drawerRef.current.setOnSeek(onSeek);
    }
  }, [onSeek]);


  // Когда меняется currentTime,
  // передвигаем курсор на waveform.
  useEffect(() => {
    drawerRef.current?.setCursorByTime(currentTime);
  }, [currentTime]);


  return (
    <div className="waveform">

      {/* Сюда Drawer вставит SVG с waveform. */}
      <div
        ref={containerRef}
        className="waveform__canvas"
      />

    </div>
  );
}