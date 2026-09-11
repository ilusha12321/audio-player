import { useRef, useState } from 'react';
import './Player.css';

// Props, которые приходят из Player.
interface Props {
  // Передаём выбранный файл обратно в Player.
  onFileSelect: (file: File) => void;

  // Запрещает выбор файла во время загрузки.
  disabled?: boolean;
}

/** Drag & Drop + выбор аудиофайла */
export function AudioUploader({ onFileSelect, disabled }: Props) {

  // Состояние подсветки области Drag & Drop.
  const [isDragging, setIsDragging] = useState(false);

  // Счётчик входов/выходов курсора при Drag & Drop.
  // Изменение ref не вызывает ререндер.
  const dragCounter = useRef(0);

  // Общая обработка файла для Drag & Drop и input.
  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.includes('audio')) {
      alert('Виберіть аудіо файл');
      return;
    }

    // Передаём файл в Player → loadFile().
    onFileSelect(file);
  };

  // Формируем CSS-классы в зависимости от состояния.
  const cls = [
    'uploader',
    isDragging ? 'uploader--dragging' : '',
    disabled ? 'uploader--disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cls}

      // Пользователь начал перетаскивать файл над областью.
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current += 1;
        setIsDragging(true);
      }}

      // Разрешаем выполнить Drop.
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}

      // Пользователь покинул область.
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current -= 1;

        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDragging(false);
        }
      }}

      // Пользователь отпустил файл.
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        dragCounter.current = 0;
        setIsDragging(false);

        // Берём первый файл и отправляем на проверку.
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="uploader__icon" aria-hidden>
        🎵
      </div>

      <p className="uploader__text">
        {disabled
          ? 'Завантаження...'
          : isDragging
            ? 'Відпустіть файл...'
            : 'Перетягніть аудіо або виберіть файл'}
      </p>

      <label className="uploader__btn">
        Вибрати файл

        <input
          type="file"
          accept="audio/*"
          hidden
          disabled={disabled}

          // Вызывается после выбора файла.
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}