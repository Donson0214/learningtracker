<script setup lang="ts">
import { onBeforeUnmount, ref, watch, computed } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BuildingOffice2Icon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";
import { getChartTheme } from "@/shared/charts/theme";
import { useTheme } from "@/shared/theme/useTheme";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useSystemAnalyticsStore } from "@/features/system-admin/analytics/store";
import StateMessage from "@/components/ui/StateMessage.vue";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const monthlyCanvas = ref<HTMLCanvasElement | null>(null);
const orgCanvas = ref<HTMLCanvasElement | null>(null);
const statusCanvas = ref<HTMLCanvasElement | null>(null);
const charts: Chart[] = [];

const analyticsStore = useSystemAnalyticsStore();
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

  if (orgCanvas.value) {
    const topOrgs = analytics.value.studyMinutesByOrganization.slice(0, 8);
    charts.push(
      new Chart(orgCanvas.value, {
        type: "bar",
        data: {
          labels: topOrgs.map((item) => item.name),
          datasets: [
            {
              data: topOrgs.map((item) =>
                Number((item.minutes / 60).toFixed(1))
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

  if (statusCanvas.value) {
    charts.push(
      new Chart(statusCanvas.value, {
        type: "doughnut",
        data: {
          labels: analytics.value.statusBreakdown.map((item) => item.label),
          datasets: [
            {
              data: analytics.value.statusBreakdown.map((item) => item.count),
              backgroundColor: ["#22C55E", "#F97316"],
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
};

useAutoRefresh(loadAnalytics, { intervalMs: 60000 });
useRealtimeRefresh(["system.analytics.changed"], loadAnalytics);

watch(analytics, () => buildCharts());
watch(theme, () => buildCharts());

onBeforeUnmount(() => {
  destroyCharts();
});

const totalStudyHours = computed(() => {
  const minutes = analytics.value?.totals.totalStudyMinutes ?? 0;
  return `${Math.round(minutes / 60)}h`;
});

const avgHoursPerLearner = computed(() => {
  const minutes =
    analytics.value?.totals.avgStudyMinutesPerLearner ?? 0;
  return `${(minutes / 60).toFixed(1)}h`;
});
</script>

<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        System Admin Dashboard
      </h2>
      <p class="text-gray-500">
        Global visibility across organizations
      </p>
    </div>

    <StateMessage
      v-if="errorMessage"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <StateMessage
      v-else-if="isLoading && !analytics"
      class="mb-4"
      variant="loading"
      title="Loading analytics"
      message="Fetching system performance data."
    />

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Organizations</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.totalOrganizations ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">All tenants</p>
          </div>
          <BuildingOffice2Icon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Active Organizations</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.activeOrganizations ?? 0 }}
            </p>
            <p class="text-xs text-green-600 mt-1 inline-flex items-center gap-1">
              <ArrowTrendingUpIcon class="h-3 w-3" />
              Live status
            </p>
          </div>
          <ArrowTrendingUpIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Learners</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.totalLearners ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Across all organizations</p>
          </div>
          <UsersIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Courses</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.totalCourses ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">System-wide catalog</p>
          </div>
          <BookOpenIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Study Hours</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ totalStudyHours }}
            </p>
            <p class="text-xs text-gray-500 mt-1">All organizations</p>
          </div>
          <ClockIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Avg Hours/Learner</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ avgHoursPerLearner }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Per learner</p>
          </div>
          <ClockIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Monthly Study Hours
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Study time across all organizations
        </p>
        <div class="h-60">
          <canvas ref="monthlyCanvas" class="h-full w-full"></canvas>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Study Hours by Organization
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Top organizations in the last 6 months
        </p>
        <div class="h-60">
          <canvas ref="orgCanvas" class="h-full w-full"></canvas>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Organization Status
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Active vs inactive tenants
        </p>
        <div class="h-56 flex items-center justify-center">
          <canvas ref="statusCanvas" class="h-full w-full"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>
