<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const lineCanvas = ref<HTMLCanvasElement | null>(null);
const barCanvas = ref<HTMLCanvasElement | null>(null);
const pieCanvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (lineCanvas.value) {
    new Chart(lineCanvas.value, {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Study Hours",
            data: [120, 180, 260, 310, 400, 480],
            borderColor: "#2563EB",
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
      },
    });
  }

  if (barCanvas.value) {
    new Chart(barCanvas.value, {
      type: "bar",
      data: {
        labels: [
          "React",
          "Python",
          "UI/UX",
          "Node.js",
          "Data Science",
        ],
        datasets: [
          {
            data: [75, 62, 48, 55, 40],
            backgroundColor: "#2563EB",
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: 100 },
        },
      },
    });
  }

  if (pieCanvas.value) {
    new Chart(pieCanvas.value, {
      type: "pie",
      data: {
        labels: ["Highly Engaged", "Moderate", "Low"],
        datasets: [
          {
            data: [45, 35, 20],
            backgroundColor: [
              "#2563EB",
              "#60A5FA",
              "#DBEAFE",
            ],
          },
        ],
      },
      options: {
        plugins: { legend: { position: "bottom" } },
      },
    });
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Analytics
      </h2>
      <p class="text-gray-500">
        Insights into learning performance and engagement
      </p>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Avg Completion Rate
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          58%
        </p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Engagement Score
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          72
        </p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Certificates Earned
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          38
        </p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Active Learners
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          96
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Line Chart -->
      <div
        class="bg-white border border-gray-200 rounded-xl p-6
               xl:col-span-2"
      >
        <h3 class="font-semibold text-gray-900 mb-1">
          Monthly Study Hours
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Total hours studied per month
        </p>
        <canvas ref="lineCanvas" height="120"></canvas>
      </div>

      <!-- Pie Chart -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Engagement Levels
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Learner engagement distribution
        </p>
        <canvas ref="pieCanvas"></canvas>
      </div>
    </div>

    <!-- Bar Chart -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mt-6">
      <h3 class="font-semibold text-gray-900 mb-1">
        Completion Rate per Course
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Percentage of completed content
      </p>
      <canvas ref="barCanvas" height="120"></canvas>
    </div>
  </div>
</template>
