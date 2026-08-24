import { useRef, useState } from 'react';
import './Player.css';

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

/** Drag & Drop + кнопка вибору файлу */
export function AudioUploader({ onFileSelect, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  // Лічильник, щоб dragleave не збивав підсвітку на дочірніх елементах
  const dragCounter = useRef(0);

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.includes('audio')) {
      alert('Виберіть аудіо файл');
      return;
    }
    onFileSelect(file);
  };

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
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current += 1;
        setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          dragCounter.current = 0;
          setIsDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setIsDragging(false);
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
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}