// Описываем props, которые получает компонент TrackInfo.
interface Props {
  // Имя выбранного аудиофайла.
  fileName: string;
}

/**
 * Отображает заголовок плеера
 * и название текущего аудиофайла.
 */
export function TrackInfo({ fileName }: Props) {
  return (
    <header className="player__header">

      {/* Название самого плеера */}
      <h2 className="player__title">
        Audio Player
      </h2>

      {/*
        Показываем имя файла.
        Если fileName пустой — показываем
        "No audio selected".
      */}
      <p
        className="player__filename"
        title={fileName || undefined}
      >
        {fileName || 'No audio selected'}
      </p>

    </header>
  );
}