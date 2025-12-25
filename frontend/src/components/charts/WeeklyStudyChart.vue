<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-1">
      Weekly Study Hours
    </h3>
    <p class="text-sm text-gray-500 mb-4">
      Your study time over the past week
    </p>

    <div class="h-56 md:h-64">
      <canvas ref="canvas" class="block h-full w-full"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { getChartTheme } from "@/shared/charts/theme";
import { useTheme } from "@/shared/theme/useTheme";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

const props = withDefaults(
  defineProps<{
    labels?: string[];
    values?: number[];
  }>(),
  {
    labels: () => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: () => [1.4, 2.0, 1.0, 2.6, 1.4, 0, 0.5],
  }
);

const canvas = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;
const { theme } = useTheme();

const buildChart = () => {
  if (!canvas.value) return;

  if (chart) chart.destroy();
  const chartTheme = getChartTheme();
  chart = new Chart(canvas.value, {
    type: "bar",
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          backgroundColor: "#3B82F6",
          borderRadius: 6,
          categoryPercentage: 0.85,
          barPercentage: 0.9,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: chartTheme.text },
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 0.65,
            color: chartTheme.text,
          },
          grid: {
            color: chartTheme.grid,
            borderDash: [4, 4],
          },
        },
      },
    },
  });
};

onMounted(() => {
  buildChart();
});

watch(
  () => [props.labels, props.values],
  () => {
    buildChart();
  },
  { deep: true }
);

watch(theme, () => {
  buildChart();
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script>
