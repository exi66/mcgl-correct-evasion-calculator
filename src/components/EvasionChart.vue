<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { resources } from "@/resources";
import { calcRealEvasion, findSoftCap, reachableTotals } from "@/lib/evasion";
import { getCssVar, intl, percentIntl } from "@/lib/utils";
import { useTheme } from "@/composables/useTheme";

/** Ось X показывает минимум до 100%... */
const MIN_AXIS_MAX = 100;
/** ...и не строит промежуточные точки дальше 200%, чтобы не раздувать набор. */
const HARD_MAX = 200;

ChartJS.register(
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  annotationPlugin,
);

const props = defineProps({
  /** Суммарный уворот на броне, %. */
  current: { type: Number, required: true },
  /** Модификаторы для calcRealEvasion. */
  modifiers: { type: Object, required: true },
});

const { isDark } = useTheme();

const colors = computed(() => {
  // Зависимость от темы: CSS-переменные меняются вместе с классом `dark`.
  void isDark.value;
  return {
    primary: getCssVar("--primary"),
    primaryText: getCssVar("--primary-foreground"),
    line: getCssVar("--chart-1"),
    border: getCssVar("--border"),
    muted: getCssVar("--muted-foreground"),
    text: getCssVar("--foreground"),
    popover: getCssVar("--popover"),
    popoverText: getCssVar("--popover-foreground"),
    font: getCssVar("--font-sans"),
  };
});

const axisMax = computed(() =>
  Math.round(Math.max(MIN_AXIS_MAX, props.current)),
);

const points = computed(() => {
  const steps = Object.values(resources).map((r) => r.percent);
  const totals = reachableTotals(steps, Math.min(axisMax.value, HARD_MAX));

  if (props.current > HARD_MAX) totals.push(Number(props.current.toFixed(1)));

  return totals.map((x) => ({ x, y: calcRealEvasion(x, props.modifiers) }));
});

const currentIndex = computed(() => {
  let closest = -1;
  let minDiff = Infinity;
  points.value.forEach((point, index) => {
    const diff = Math.abs(point.x - props.current);
    if (diff < minDiff) {
      minDiff = diff;
      closest = index;
    }
  });
  return closest;
});

const softCap = computed(() => findSoftCap(points.value));

const chartData = computed(() => {
  // Текущая точка крупнее и проще попадает под курсор.
  const pick = (current, other) =>
    points.value.map((_, i) => (i === currentIndex.value ? current : other));
  const color = colors.value.line;

  return {
    datasets: [
      {
        label: "Кривая уворота",
        data: points.value,
        borderColor: color,
        borderWidth: 1,
        cubicInterpolationMode: "monotone",
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
});

const annotations = computed(() => {
  const point = softCap.value;
  if (!point) return {};

  return {
    softCapLine: {
      type: "line",
      xMin: point.x,
      xMax: point.x,
      borderColor: colors.value.primary,
      borderWidth: 1,
      borderDash: [6, 6],
      label: {
        display: true,
        content: `Софт-кап: ${percentIntl.format(point.x)}% | ${intl.format(point.y)}%`,
        position: "start",
        backgroundColor: colors.value.primary,
        color: colors.value.primaryText,
        font: { size: 10, weight: "normal" },
      },
    },
  };
});

const axis = (title, max) => {
  const { border, font, muted, text } = colors.value;
  return {
    type: "linear",
    min: 0,
    max,
    grid: { color: border },
    title: {
      display: true,
      text: title,
      font: { size: 12, family: font },
      color: text,
    },
    ticks: {
      color: muted,
      font: { size: 11, family: font },
      callback: (value) => `${value}%`,
    },
  };
};

const chartOptions = computed(() => ({
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: axis("Общий уворот на броне (%)", axisMax.value),
    y: axis("Реальный уворот (%)", 100),
  },
  plugins: {
    tooltip: {
      backgroundColor: colors.value.popover,
      titleColor: colors.value.popoverText,
      bodyColor: colors.value.popoverText,
      bodyFont: { family: colors.value.font, size: 12 },
      borderColor: colors.value.border,
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        title: () => "",
        label: ({ raw }) =>
          `Сумма: ${percentIntl.format(raw.x)}% | Реальный: ${intl.format(raw.y)}%`,
      },
    },
    annotation: { annotations: annotations.value },
  },
}));
</script>

<template>
  <div class="relative h-64 w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
