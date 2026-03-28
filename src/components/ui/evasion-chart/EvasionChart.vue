<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import { resources } from "@/resources";
import { getCssVar } from "@/lib/utils";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import { intl, percentIntl } from "@/lib/utils";

const MAX_TOTAL_EVASION = 100;

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  annotationPlugin,
);

const props = defineProps({
  formula: {
    type: Function,
    required: true,
  },
  current: {
    type: Number,
    required: true,
  },
});

const chartColors = computed(() => {
  return {
    primary: getCssVar("--primary"),
    primaryText: getCssVar("--primary-foreground"),
    chart1: getCssVar("--chart-1"),
    chart2: getCssVar("--chart-2"),
    chart3: getCssVar("--chart-3"),
    border: getCssVar("--border"),
    muted: getCssVar("--muted-foreground"),
    text: getCssVar("--foreground"),
    popover: getCssVar("--popover"),
    popoverText: getCssVar("--popover-foreground"),
    font: getCssVar("--font-sans"),
  };
});

const softCapPoint = computed(() => {
  const threshold = 0.1;
  const data = chartData.value.datasets[0].data;

  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];

    const derivative = (next.y - current.y) / (next.x - current.x);

    if (derivative < threshold) {
      return current;
    }
  }
  return null;
});

const annotations = computed(() => {
  const point = softCapPoint.value;
  if (!point) return {};

  return {
    softCapLine: {
      type: "line",
      xMin: point.x,
      xMax: point.x,
      borderColor: chartColors.value.primary,
      borderWidth: 1,
      borderDash: [6, 6],
      label: {
        display: true,
        content: `Софт-кап: ${percentIntl.format(point.x)}% | ${intl.format(point.y)}%`,
        position: "start",
        backgroundColor: chartColors.value.primary,
        color: chartColors.value.primaryText,
        font: { size: 10, weight: "normal" },
      },
    },
  };
});

const chartData = computed(() => {
  const steps = Object.values(resources)
    .map((r) => r.percent)
    .sort((a, b) => b - a);

  const possibleX = new Set([0]);

  steps.forEach((step) => {
    Array.from(possibleX).forEach((x) => {
      let nextX = x;
      while (
        nextX + step <=
        Math.round(Math.max(MAX_TOTAL_EVASION, props.current))
      ) {
        nextX = Number((nextX + step).toFixed(1));
        possibleX.add(nextX);
      }
    });
  });

  const points = Array.from(possibleX)
    .sort((a, b) => a - b)
    .map((x) => ({ x, y: props.formula(x) }));

  let closestIndex = -1;
  let minDiff = Infinity;

  points.forEach((point, index) => {
    const diff = Math.abs(point.x - props.current);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = index;
    }
  });

  const pointHitRadius = points.map((_, index) =>
    index === closestIndex ? 32 : 10,
  );
  const pointRadiuses = points.map((_, index) =>
    index === closestIndex ? 6 : 0,
  );
  const pointHoverRadiuses = points.map((_, index) =>
    index === closestIndex ? 8 : 4,
  );

  return {
    datasets: [
      {
        label: "Кривая уворота",
        data: points,
        borderColor: chartColors.value.chart1,
        borderWidth: 1,
        tension: 0.4,

        pointHitRadius: pointHitRadius,
        pointRadius: pointRadiuses,

        pointHoverRadius: pointHoverRadiuses,
        pointHoverBackgroundColor: chartColors.value.chart1,
        pointHoverBorderColor: chartColors.value.chart1,

        pointBackgroundColor: chartColors.value.chart1,
        pointBorderColor: chartColors.value.chart1,
        pointBorderWidth: 0,
      },
    ],
  };
});

const chartOptions = computed(() => ({
  animation: false,
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "linear",
      grid: {
        color: chartColors.value.border,
      },
      title: {
        display: true,
        text: "Общий уворот на броне (%)",
        font: { size: 12, family: chartColors.value.font },
        color: chartColors.value.textColor,
      },
      min: 0,
      max: Math.round(Math.max(MAX_TOTAL_EVASION, props.current)),
      ticks: {
        color: chartColors.value.mutedColor,
        font: { size: 11, family: chartColors.value.font },
        callback: (value) => `${value}%`,
      },
    },
    y: {
      type: "linear",
      grid: {
        color: chartColors.value.border,
      },
      title: {
        display: true,
        text: "Реальный уворот (%)",
        font: { size: 12, family: chartColors.value.font },
        color: chartColors.value.textColor,
      },
      min: 0,
      max: 100,
      ticks: {
        color: chartColors.value.mutedColor,
        font: { size: 11, family: chartColors.value.font },
        callback: (value) => `${value}%`,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      labels: {
        font: { family: chartColors.value.font, size: 12 },
        color: chartColors.value.textColor,
      },
    },
    tooltip: {
      titleColor: chartColors.value.popoverColor,
      bodyColor: chartColors.value.popoverColor,
      bodyFont: { family: chartColors.value.font, size: 12 },
      borderColor: chartColors.value.border,
      padding: 10,
      callbacks: {
        title: () => "",
        label: (context) => {
          const point = context.raw;
          const lines = [
            `Сумма: ${percentIntl.format(point.x)}% | Реальный: ${intl.format(point.y)}%`,
          ];
          return lines;
        },
      },
    },
    annotation: {
      annotations: annotations.value,
    },
  },
}));
</script>

<template>
  <div class="h-64 w-full relative">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
