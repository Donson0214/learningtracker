<script setup lang="ts">
import { onBeforeUnmount, ref, computed, watch } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { ArrowTrendingUpIcon, TrophyIcon } from "@heroicons/vue/24/outline";
import { getChartTheme } from "@/shared/charts/theme";
import { useTheme } from "@/shared/theme/useTheme";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useAdminAnalyticsStore } from "./store";
import StateMessage from "@/components/ui/StateMessage.vue";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  PieController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const monthlyCanvas = ref<HTMLCanvasElement | null>(null);
const completionCanvas = ref<HTMLCanvasElement | null>(null);
const engagementCanvas = ref<HTMLCanvasElement | null>(null);
const paceCanvas = ref<HTMLCanvasElement | null>(null);
const charts: Chart[] = [];

const analyticsStore = useAdminAnalyticsStore();
const analytics = computed(() => analyticsStore.analytics);
const isLoading = computed(() => analyticsStore.isLoading);
const errorMessage = computed(() => analyticsStore.errorMessage);
const { theme } = useTheme();

const loadAnalytics = async () => {
  await analyticsStore.loadAnalytics();
};

const destroyCharts = () => {
  charts.forEach((chart) => chart.destroy());
  charts.length = 0;
};

const buildCharts = () => {
  destroyCharts();
  if (!analytics.value) return;
  const chartTheme = getChartTheme();

  if (monthlyCanvas.value) {
    charts.push(
      new Chart(monthlyCanvas.value, {
        type: "line",
        data: {
          labels: analytics.value.monthlyStudyMinutes.map((item) => item.label),
          datasets: [
            {
              data: analytics.value.monthlyStudyMinutes.map((item) =>
                Number((item.minutes / 60).toFixed(1))
              ),
              borderColor: "#2563EB",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              tension: 0.35,
              pointRadius: 3,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
            y: {
              beginAtZero: true,
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
          },
        },
      })
    );
  }

  if (completionCanvas.value) {
    charts.push(
      new Chart(completionCanvas.value, {
        type: "bar",
        data: {
          labels: analytics.value.completionRates.map((item) => item.title),
          datasets: [
            {
              data: analytics.value.completionRates.map(
                (item) => item.completionRate
              ),
              backgroundColor: "#10B981",
              borderRadius: 6,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
            y: {
              beginAtZero: true,
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
          },
        },
      })
    );
  }

  if (engagementCanvas.value) {
    charts.push(
      new Chart(engagementCanvas.value, {
        type: "pie",
        data: {
          labels: analytics.value.engagementLevels.map((item) => item.label),
          datasets: [
            {
              data: analytics.value.engagementLevels.map(
                (item) => item.count
              ),
              backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      })
    );
  }

  if (paceCanvas.value) {
    charts.push(
      new Chart(paceCanvas.value, {
        type: "bar",
        data: {
          labels: analytics.value.pace.map((item) => item.label),
          datasets: [
            {
              label: "Target",
              data: analytics.value.pace.map((item) =>
                Number((item.targetMinutes / 60).toFixed(1))
              ),
              backgroundColor: "#94A3B8",
              borderRadius: 6,
            },
            {
              label: "Actual",
              data: analytics.value.pace.map((item) =>
                Number((item.actualMinutes / 60).toFixed(1))
              ),
              backgroundColor: "#3B82F6",
              borderRadius: 6,
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
            y: {
              beginAtZero: true,
              grid: { color: chartTheme.grid },
              ticks: { color: chartTheme.text },
            },
          },
        },
      })
    );
  }
};

useAutoRefresh(loadAnalytics, { intervalMs: 60000 });
useRealtimeRefresh(
  ["analytics.changed", "studySessions.changed", "enrollments.changed"],
  loadAnalytics
);

watch(analytics, () => buildCharts());

watch(theme, () => buildCharts());

onBeforeUnmount(() => {
  destroyCharts();
});

const avgCompletionRate = computed(() => {
  const rates = analytics.value?.completionRates ?? [];
  if (!rates.length) return "0%";
  const avg =
    rates.reduce((sum, rate) => sum + rate.completionRate, 0) / rates.length;
  return `${Math.round(avg)}%`;
});

const engagementScore = computed(() => {
  const levels = analytics.value?.engagementLevels ?? [];
  const total = levels.reduce((sum, item) => sum + item.count, 0);
  if (!total) return "0.0/10";
  const weights: Record<string, number> = {
    High: 1,
    Moderate: 0.7,
    Low: 0.4,
    Inactive: 0,
  };
  const score =
    (levels.reduce(
      (sum, item) => sum + (weights[item.label] ?? 0) * item.count,
      0
    ) /
      total) *
    10;
  return `${score.toFixed(1)}/10`;
});

const totalStudyHours = computed(() => {
  const minutes = analytics.value?.totals.totalStudyMinutes ?? 0;
  return Math.round(minutes / 60);
});

const topLearners = computed(() => analytics.value?.topLearners ?? []);
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Analytics Dashboard
      </h2>
      <p class="text-gray-500">
        Comprehensive insights into learning performance
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Avg Completion Rate</p>
        <div class="flex items-center gap-2">
          <p class="text-2xl font-semibold text-gray-900">
            {{ avgCompletionRate }}
          </p>
          <span class="text-xs text-green-600 inline-flex items-center gap-1">
            <ArrowTrendingUpIcon class="h-3 w-3" />
            Live
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Across all courses</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Engagement Score</p>
        <div class="flex items-center gap-2">
          <p class="text-2xl font-semibold text-gray-900">
            {{ engagementScore }}
          </p>
          <span class="text-xs text-green-600 inline-flex items-center gap-1">
            <ArrowTrendingUpIcon class="h-3 w-3" />
            +0.2
          </span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Organization average</p>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">Total Study Hours</p>
        <div class="flex items-center gap-2">
          <p class="text-2xl font-semibold text-gray-900">
            {{ totalStudyHours }}
          </p>
          <TrophyIcon class="h-4 w-4 text-amber-500" />
        </div>
        <p class="text-xs text-gray-500 mt-1">Organization-wide</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">Monthly Study Hours</h3>
        <p class="text-sm text-gray-500 mb-4">
          Organization-wide study time trend
        </p>
        <div class="h-56">
          <canvas ref="monthlyCanvas" class="h-full w-full"></canvas>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">Course Completion Rates</h3>
        <p class="text-sm text-gray-500 mb-4">
          Progress across all courses
        </p>
        <div class="h-56">
          <canvas ref="completionCanvas" class="h-full w-full"></canvas>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">Learner Engagement Levels</h3>
        <p class="text-sm text-gray-500 mb-4">
          Distribution of activity levels
        </p>
        <div class="h-56 flex items-center justify-center">
          <canvas ref="engagementCanvas" class="h-full w-full"></canvas>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">Learning Pace</h3>
        <p class="text-sm text-gray-500 mb-4">
          Target vs actual study hours
        </p>
        <div class="h-56">
          <canvas ref="paceCanvas" class="h-full w-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Performers -->
    <div class="bg-white border border-gray-200 rounded-xl p-6">
      <h3 class="font-semibold text-gray-900 mb-1">Top Performing Learners</h3>
      <p class="text-sm text-gray-500 mb-4">Highest study hours this month</p>

      <StateMessage
        v-if="isLoading"
        variant="loading"
        title="Loading learners"
        message="Fetching performance data."
      />

      <StateMessage
        v-else-if="topLearners.length === 0"
        variant="empty"
        title="No learner activity yet"
        message="Learners will appear once sessions are logged."
      />

      <div v-else class="space-y-3">
        <div
          v-for="(learner, index) in topLearners"
          :key="learner.userId"
          class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="h-8 w-8 rounded-full bg-blue-600 text-white
                     flex items-center justify-center text-xs font-semibold"
            >
              #{{ index + 1 }}
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">{{ learner.name }}</p>
              <p class="text-xs text-gray-500">Active learner</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-gray-900">
              {{ (learner.minutes / 60).toFixed(1) }}h
            </p>
            <p class="text-xs text-gray-500">study time</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
