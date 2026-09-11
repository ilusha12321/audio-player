/** Форматує секунди у формат m:ss */
export function formatTime(seconds: number): string {
  // Если значение некорректное или отрицательное — ставим 0
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

  // Убираем дробную часть секунд
  const total = Math.floor(seconds);

  // Получаем количество минут
  const m = Math.floor(total / 60);

  // Получаем оставшиеся секунды
  const s = total % 60;

  // Форматируем, например: 65 → "1:05"
  return `${m}:${String(s).padStart(2, '0')}`;
}