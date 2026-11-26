import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ScaleOptions,
} from 'chart.js';
import annotationPlugin, { type AnnotationOptions } from 'chartjs-plugin-annotation';
import { useDark } from '@/hooks/use-dark';
import { useFormat } from '@/hooks/use-format';
import { calcRealEvasion, findSoftCap, reachableTotals, type Modifiers, type Point } from '@/lib/evasion';
import { resources } from '@/lib/resources';

ChartJS.register(LineElement, LinearScale, PointElement, Tooltip, annotationPlugin);

/** The X axis always goes up to at least 100%... */
const MIN_AXIS_MAX = 100;
/** ...and has no intermediate points past 200%, to keep the data set small. */
const HARD_MAX = 200;

const cssVar = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

interface Props {
  /** Total armor evasion, %. */
  current: number;
  modifiers: Modifiers;
}

/** Real evasion against total armor evasion, with the current point and the soft cap marked. */
export function EvasionChart({ current, modifiers }: Props) {
  const { t } = useTranslation();
  const format = useFormat();
  const dark = useDark();

  // CSS variables change with the `dark` class: re-read them when it changes.
  const colors = useMemo(
    () => ({
      dark,
      primary: cssVar('--primary'),
      primaryText: cssVar('--primary-foreground'),
      line: cssVar('--chart-2'),
      border: cssVar('--border'),
      muted: cssVar('--muted-foreground'),
      text: cssVar('--foreground'),
      popover: cssVar('--popover'),
      popoverText: cssVar('--popover-foreground'),
      font: getComputedStyle(document.body).fontFamily,
    }),
    [dark],
  );

  const axisMax = Math.round(Math.max(MIN_AXIS_MAX, current));

  const points = useMemo<Point[]>(() => {
    const steps = Object.values(resources).map((r) => r.percent);
    const totals = reachableTotals(steps, Math.min(axisMax, HARD_MAX));
    if (current > HARD_MAX) totals.push(Number(current.toFixed(1)));
    return totals.map((x) => ({ x, y: calcRealEvasion(x, modifiers) }));
  }, [axisMax, current, modifiers]);

  const currentIndex = useMemo(() => {
    let closest = -1;
    let minDiff = Infinity;
    points.forEach((point, index) => {
      const diff = Math.abs(point.x - current);
      if (diff < minDiff) {
        minDiff = diff;
        closest = index;
      }
    });
    return closest;
  }, [points, current]);

  const softCap = useMemo(() => findSoftCap(points), [points]);

  const data = useMemo<ChartData<'line', Point[]>>(() => {
    // The current point is bigger and easier to hover.
    const pick = (atCurrent: number, other: number) => points.map((_, i) => (i === currentIndex ? atCurrent : other));
    const color = colors.line;
    return {
      datasets: [
        {
          data: points,
          borderColor: color,
          borderWidth: 1,
          cubicInterpolationMode: 'monotone',
          pointRadius: pick(6, 0),
          pointHitRadius: pick(32, 10),
          pointHoverRadius: pick(8, 4),
          pointBackgroundColor: color,
          pointBorderColor: color,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: color,
          pointBorderWidth: 0,
        },
      ],
    };
  }, [points, currentIndex, colors]);

  const options = useMemo<ChartOptions<'line'>>(() => {
    const axis = (title: string, max: number): ScaleOptions<'linear'> =>
      ({
        type: 'linear',
        min: 0,
        max,
        grid: { color: colors.border },
        title: { display: true, text: title, font: { size: 12, family: colors.font }, color: colors.text },
        ticks: { color: colors.muted, font: { size: 11, family: colors.font }, callback: (value) => `${value}%` },
      }) as ScaleOptions<'linear'>;

    const annotations: Record<string, AnnotationOptions> = softCap
      ? {
          softCapLine: {
            type: 'line',
            xMin: softCap.x,
            xMax: softCap.x,
            borderColor: colors.primary,
            borderWidth: 1,
            borderDash: [6, 6],
            label: {
              display: true,
              content: t('chart.softCap', { x: format.fixed1(softCap.x), y: format.exact(softCap.y) }),
              position: 'start',
              backgroundColor: colors.primary,
              color: colors.primaryText,
              font: { size: 10, weight: 'normal', family: colors.font },
            },
          },
        }
      : {};

    return {
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: axis(t('chart.x'), axisMax), y: axis(t('chart.y'), 100) },
      plugins: {
        tooltip: {
          backgroundColor: colors.popover,
          titleColor: colors.popoverText,
          bodyColor: colors.popoverText,
          bodyFont: { family: colors.font, size: 12 },
          borderColor: colors.border,
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            title: () => '',
            label: ({ raw }) => {
              const p = raw as Point;
              return t('chart.point', { x: format.fixed1(p.x), y: format.exact(p.y) });
            },
          },
        },
        annotation: { annotations },
      },
    };
  }, [colors, softCap, axisMax, t, format]);

  return (
    <div className="relative h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
