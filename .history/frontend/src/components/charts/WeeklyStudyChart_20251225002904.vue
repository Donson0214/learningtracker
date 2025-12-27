<template>
  <div class="bg-white border border-gray-200 rounded-xl p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-1">
      Weekly Study Hours
    </h3>
    <p class="text-sm text-gray-500 mb-4">
      Your study time over the past week
    </p>

    <canvas ref="canvas" height="120"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvas.value) return;

  new Chart(canvas.value, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          data: [1.4, 2.0, 1.0, 2.6, 1.4, 0, 0.5],
          backgroundColor: "#3B82F6", // blue-500
          borderRadius: 6,
          barThickness: 28,
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
          ticks: { color: "#6B7280" }, // gray-500
        },
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 0.65,
            color: "#6B7280",
          },
          grid: {
            color: "#E5E7EB", // gray-200
            borderDash: [4, 4],
          },
        },
      },
    },
  });
});
</script>
