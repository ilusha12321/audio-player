import { useEffect, useRef } from 'react';
import Drawer from '../../visualization/Drawer';
import './Waveform.css';

interface Props {
  audioBuffer: AudioBuffer | null;
  currentTime?: number;
  onSeek?: (seconds: number) => void;
}

export function Waveform({
  audioBuffer,
  currentTime = 0,
  onSeek,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<Drawer | null>(null);

  useEffect(() => {
    if (!audioBuffer || !containerRef.current) return;

    drawerRef.current?.destroy();

    const drawer = new Drawer(audioBuffer, containerRef.current);
    if (onSeek) drawer.setOnSeek(onSeek);
    drawer.generateWaveform();
    drawerRef.current = drawer;

    return () => {
      drawer.destroy();
      drawerRef.current = null;
    };
  }, [audioBuffer]);

  useEffect(() => {
    if (drawerRef.current && onSeek) {
      drawerRef.current.setOnSeek(onSeek);
    }
  }, [onSeek]);

  useEffect(() => {
    drawerRef.current?.setCursorByTime(currentTime);
  }, [currentTime]);

  return (
    <div className="waveform">
      <div ref={containerRef} className="waveform__canvas" />
    </div>
  );
}