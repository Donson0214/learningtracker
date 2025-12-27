<template>
  <div class="h-64">
    <canvas ref="canvasRef" class="h-full w-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { onBeforeUnmount, onMounted, ref } from "vue";

Chart.register(
  CategoryScale,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  Filler
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chart: Chart | null = null;

onMounted(() => {
  if (!canvasRef.value) {
    return;
  }

  chart = new Chart(canvasRef.value, {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Hours focused",
          data: [2, 3, 4, 3.5, 5, 4, 3],
          borderColor: "rgba(52, 211, 153, 0.9)",
          backgroundColor: "rgba(52, 211, 153, 0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
          },
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
          },
        },
        y: {
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
          },
          ticks: {
            color: "rgba(226, 232, 240, 0.7)",
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "rgba(226, 232, 240, 0.8)",
          },
        },
      },
    },
  });
});

onBeforeUnmount(() => {
  chart?.destroy();
});
</script>
