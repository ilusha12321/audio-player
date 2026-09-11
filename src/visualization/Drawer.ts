import * as d3 from 'd3';
import type { WaveformOptions } from '../types/waveform';
import { formatTime } from '../utils/formatTime';

// Типы для D3-элементов SVG
type GSel = d3.Selection<SVGGElement, undefined, null, undefined>;
type TextSel = d3.Selection<SVGTextElement, undefined, null, undefined>;

class Drawer {
  // Аудиоданные и HTML-контейнер
  private buffer: AudioBuffer;
  private parent: HTMLElement;

  // Элементы курсора и подсказки времени
  private cursorGroup: GSel | null = null;
  private timeText: TextSel | null = null;
  private hoverGroup: GSel | null = null;
  private hoverText: TextSel | null = null;

  // Масштаб X и размеры графика
  private xScale: d3.ScaleLinear<number, number> | null = null;
  private margin = { top: 28, bottom: 28, left: 12, right: 12 };
  private width = 0;

  // Callback для перемещения по аудио
  private onSeek: ((seconds: number) => void) | null = null;

  constructor(buffer: AudioBuffer, parent: HTMLElement) {
    this.buffer = buffer;
    this.parent = parent;
  }

  // Сохраняем функцию seek из React
  setOnSeek(cb: (seconds: number) => void): void {
    this.onSeek = cb;
  }

  // Получаем и нормализуем данные для waveform
  private clearData(): number[] {
    const raw = this.buffer.getChannelData(0);
    const samples = Math.min(this.buffer.sampleRate, 2000);
    const blockSize = Math.floor(raw.length / samples);
    const result: number[] = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      const start = blockSize * i;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(raw[start + j] || 0);
      }
      result.push(sum / blockSize);
    }

    // Нормализуем значения относительно максимальной амплитуды
    const max = Math.max(...result) || 1;
    return result.map((n) => n / max);
  }

  // Создаём подписи времени под графиком
  private getTimeLabels(): string[] {
    const step = 30;
    const count = Math.ceil(this.buffer.duration / step);

    return Array.from({ length: count }, (_, i) => {
      const t = i * step;
      return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    });
  }

  // Переводим координату X в секунды аудио
  private xToSeconds(x: number): number {
    if (!this.xScale || !this.buffer) return 0;

    const [d0, d1] = this.xScale.domain();
    const progress = (this.xScale.invert(x) - d0) / (d1 - d0 || 1);

    return Math.max(0, Math.min(1, progress)) * this.buffer.duration;
  }

  // Не даём курсору выйти за границы графика
  private clampX(x: number): number {
    return Math.max( this.margin.left,Math.min(this.width - this.margin.right, x));
  }

  // Перемещаем курсор и сообщаем React новое время
  private seekFromX(x: number): void {
    const seconds = this.xToSeconds(this.clampX(x));
    this.setCursorByTime(seconds);
    this.onSeek?.(seconds);
  }

  // Основной метод построения waveform
  generateWaveform(options: WaveformOptions = {}): void {
    const {
      margin = { top: 28, bottom: 28, left: 12, right: 12 },
      height = this.parent.clientHeight,
      width = this.parent.clientWidth,
      padding = 0.55,
    } = options;

    this.margin = margin;
    this.width = width;

    // Получаем данные аудио
    const audioData = this.clearData();
    const domainExtent = d3.extent(audioData) as [number, number];

    // Настраиваем масштаб по X
    this.xScale = d3
      .scaleLinear()
      .domain([0, audioData.length - 1])
      .range([margin.left, width - margin.right]);

    // Настраиваем масштаб по Y
    const yScale = d3
      .scaleLinear()
      .domain(domainExtent)
      .range([0, (height - margin.top - margin.bottom) / 2]);

    // Очищаем старый график
    d3.select(this.parent).selectAll('*').remove();

    // Создаём SVG
    const svg = d3
      .create('svg')
      .attr('width', width)
      .attr('height', height)
      .style('display', 'block')
      .style('background', '#0f172a');

    // Прозрачная область для кликов и seek
    const hitArea = svg
      .append('rect')
      .attr('class', 'waveform-hit')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer');

    // Вертикальные линии сетки
    svg
      .append('g')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1)
      .selectAll('line')
      .data(this.xScale.ticks(8))
      .join('line')
      .attr('x1', (d) => this.xScale!(d))
      .attr('x2', (d) => this.xScale!(d))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom);

    // Рассчитываем ширину каждой полоски waveform
    const band = (width - margin.left - margin.right) / audioData.length;

    const bars = svg
      .append('g')
      .attr('transform', `translate(0, ${height / 2})`)
      .attr('pointer-events', 'none');

    // Рисуем waveform из прямоугольников
    bars
      .selectAll('rect')
      .data(audioData)
      .join('rect')
      .attr('fill', '#38bdf8')
      .attr('opacity', 0.9)
      .attr('width', Math.max(1.5, band * padding))
      .attr('height', (d) => Math.max(2, yScale(d) * 2))
      .attr('x', (_, i) => this.xScale!(i))
      .attr('y', (d) => -yScale(d))
      .attr('rx', 1.5);

    // Создаём подписи времени
    const labels = this.getTimeLabels();
    const bandScale = d3
      .scaleBand<string>()
      .domain(labels)
      .range([margin.left, width - margin.right]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom + 4})`)
      .attr('pointer-events', 'none')
      .call(d3.axisBottom(bandScale).tickSize(0))
      .call((sel) => sel.select('.domain').remove())
      .style('font-size', '11px')
      .style('color', '#64748b');

    // Группа для линии при наведении
    this.hoverGroup = svg
      .append('g')
      .attr('class', 'hover-preview')
      .style('display', 'none')
      .attr('pointer-events', 'none');

    this.hoverGroup
      .append('line')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3');

    // Время при наведении мыши
    this.hoverText = this.hoverGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', margin.top - 8)
      .attr('fill', '#cbd5e1')
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, sans-serif')
      .text('0:00');

    // Создаём основной курсор проигрывания
    this.cursorGroup = svg
      .append('g')
      .attr('class', 'cursor')
      .style('cursor', 'ew-resize');

    this.cursorGroup
      .append('line')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#f43f5e')
      .attr('stroke-width', 2);

    // Треугольник над курсором
    this.cursorGroup
      .append('path')
      .attr('d', d3.symbol().type(d3.symbolTriangle).size(64)())
      .attr('fill', '#f43f5e')
      .attr('transform', `translate(0, ${margin.top - 2}) rotate(180)`);

    // Текст текущего времени
    this.timeText = this.cursorGroup
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', margin.top - 14)
      .attr('fill', '#f43f5e')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'system-ui, sans-serif')
      .text('0:00');

    // Добавляем возможность перетаскивать курсор
    const dragBehavior = d3
      .drag<SVGGElement, undefined>()
      .on('start', (event) => {
        event.sourceEvent?.stopPropagation();
      })
      .on('drag', (event) => {
        this.seekFromX(event.x);
      });

    this.cursorGroup.call(dragBehavior);

    // Клик по waveform меняет позицию аудио
    hitArea.on('click', (event: MouseEvent) => {
      const [mx] = d3.pointer(event);
      this.seekFromX(mx);
    });

    // Показываем время при наведении
    hitArea
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event);
        const x = this.clampX(mx);

        this.hoverGroup
          ?.style('display', null)
          .attr('transform', `translate(${x}, 0)`);

        this.hoverText?.text(formatTime(this.xToSeconds(x)));
      })
      .on('mouseleave', () => {
        this.hoverGroup?.style('display', 'none');
      });

    // Добавляем SVG в HTML
    const node = svg.node();
    if (node) this.parent.appendChild(node);

    this.setCursorByTime(0);
  }

  // Обновляет положение курсора по текущему времени
  setCursorByTime(seconds: number): void {
    if (!this.cursorGroup || !this.xScale || !this.buffer) return;

    const duration = this.buffer.duration || 1;
    const progress = Math.max(0, Math.min(1, seconds / duration));
    const [d0, d1] = this.xScale.domain();
    const x = this.xScale(progress * (d1 - d0) + d0);

    this.cursorGroup.attr('transform', `translate(${x}, 0)`);
    this.timeText?.text(formatTime(seconds));
  }

  // Полностью очищает D3-график
  destroy(): void {
    d3.select(this.parent).selectAll('*').remove();
    this.cursorGroup = null;
    this.timeText = null;
    this.hoverGroup = null;
    this.hoverText = null;
    this.xScale = null;
    this.onSeek = null;
  }
}

export default Drawer;