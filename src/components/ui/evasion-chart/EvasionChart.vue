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

const chartData = computed(() => {
  const chart1 = getCssVar("--chart-1");
  const chart2 = getCssVar("--chart-2");

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
  const pointBackgroundColors = points.map((_, index) =>
    index === closestIndex ? chart2 : chart1,
  );
  const pointBorderColors = points.map((_, index) =>
    index === closestIndex ? chart2 : chart1,
  );
  const pointBorderWidths = points.map((_, index) =>
    index === closestIndex ? 2 : 1,
  );
  const pointHoverBackgroundColors = pointBackgroundColors;
  const pointHoverBorderColors = pointBorderColors;

  return {
    datasets: [
      {
        label: "Кривая уворота",
        data: points,
        borderColor: chart1,
        borderWidth: 1,
        tension: 0.4,

        pointHitRadius: pointHitRadius,
        pointRadius: pointRadiuses,

        pointHoverRadius: pointHoverRadiuses,
        pointHoverBackgroundColor: pointHoverBackgroundColors,
        pointHoverBorderColor: pointHoverBorderColors,

        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: pointBorderColors,
        pointBorderWidth: pointBorderWidths,
      },
    ],
  };
});

const chartOptions = computed(() => {
  const chart3 = getCssVar("--chart-3");
  const textColor = getCssVar("--foreground");
  const mutedColor = getCssVar("--muted-foreground");
  const fontFamily = getCssVar("--font-sans");
  const border = getCssVar("--border");
  const popoverColor = getCssVar("--popover-foreground");

  return {
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear",
        grid: {
          color: border,
        },
        title: {
          display: true,
          text: "Общий уворот на броне (%)",
          font: { size: 12, family: fontFamily },
          color: textColor,
        },
        min: 0,
        max: Math.round(Math.max(MAX_TOTAL_EVASION, props.current)),
        ticks: {
          color: mutedColor,
          font: { size: 11, family: fontFamily },
          callback: (value) => `${value}%`,
        },
      },
      y: {
        type: "linear",
        grid: {
          color: border,
        },
        title: {
          display: true,
          text: "Реальный уворот (%)",
          font: { size: 12, family: fontFamily },
          color: textColor,
        },
        min: 0,
        max: 100,
        ticks: {
          color: mutedColor,
          font: { size: 11, family: fontFamily },
          callback: (value) => `${value}%`,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          font: { family: fontFamily, size: 12 },
          color: textColor,
        },
      },
      tooltip: {
        titleColor: popoverColor,
        bodyColor: popoverColor,
        bodyFont: { family: fontFamily, size: 12 },
        borderColor: border,
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
        annotations: {
          softCapLine: {
            type: "line",
            xMin: softCapPoint.value?.x,
            xMax: softCapPoint.value?.x,
            borderColor: chart3,
            borderWidth: 1,
            borderDash: [6, 6],
            label: {
              display: true,
              content: `Софт-кап ~${softCapPoint.value?.y.toFixed(2)}%`,
              position: "start",
              backgroundColor: chart3,
              color: "#fff",
              font: { size: 10, weight: "normal" },
            },
          },
        },
      },
    },
  };
});
</script>

<template>
  <div class="h-64 w-full relative">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
