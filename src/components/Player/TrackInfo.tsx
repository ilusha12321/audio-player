interface Props {
  fileName: string;
}

/** Заголовок плеєра + назва файлу */
export function TrackInfo({ fileName }: Props) {
  return (
    <header className="player__header">
      <h2 className="player__title">Audio Player</h2>
      <p className="player__filename" title={fileName || undefined}>
        {fileName || 'No audio selected'}
      </p>
    </header>
  );
}