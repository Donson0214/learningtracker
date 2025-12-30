<script setup lang="ts">
import { onBeforeUnmount, ref, watch, computed } from "vue";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";
import { getChartTheme } from "@/shared/charts/theme";
import { useTheme } from "@/shared/theme/useTheme";
import { useAutoRefresh } from "@/shared/composables/useAutoRefresh";
import { useRealtimeRefresh } from "@/shared/realtime/useRealtimeRefresh";
import { useAdminAnalyticsStore } from "@/features/admin/analytics/store";
import StateMessage from "@/components/ui/StateMessage.vue";
import NoOrganizationState from "@/components/ui/NoOrganizationState.vue";
import { useAuthStore } from "@/features/auth/store";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const enrollmentCanvas = ref<HTMLCanvasElement | null>(null);
const hoursCanvas = ref<HTMLCanvasElement | null>(null);
const charts: Chart[] = [];

const analyticsStore = useAdminAnalyticsStore();
const auth = useAuthStore();
const analytics = computed(() => analyticsStore.analytics);
const isLoading = computed(() => analyticsStore.isLoading);
const errorMessage = computed(() => analyticsStore.errorMessage);
const { theme } = useTheme();
const hasActiveOrganization = computed(
  () => Boolean(auth.user?.organization?.isActive)
);

const loadAnalytics = async () => {
  if (!hasActiveOrganization.value) {
    analyticsStore.clear();
    return;
  }
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

  if (enrollmentCanvas.value) {
    charts.push(
      new Chart(enrollmentCanvas.value, {
        type: "line",
        data: {
          labels: analytics.value.enrollmentTrend.map((item) => item.label),
          datasets: [
            {
              data: analytics.value.enrollmentTrend.map((item) => item.count),
              borderColor: "#2563EB",
              backgroundColor: "rgba(37, 99, 235, 0.15)",
              tension: 0.4,
              fill: false,
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

  if (hoursCanvas.value) {
    charts.push(
      new Chart(hoursCanvas.value, {
        type: "bar",
        data: {
          labels: analytics.value.studyMinutesByCourse.map((item) => item.title),
          datasets: [
            {
              data: analytics.value.studyMinutesByCourse.map((item) =>
                Number((item.minutes / 60).toFixed(1))
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

const totalStudyHours = computed(() => {
  const minutes = analytics.value?.totals.totalStudyMinutes ?? 0;
  return `${(minutes / 60).toFixed(1)}h`;
});

const avgHoursPerLearner = computed(() => {
  const minutes =
    analytics.value?.totals.avgStudyMinutesPerLearner ?? 0;
  return `${(minutes / 60).toFixed(1)}h`;
});

const topLearners = computed(() =>
  analytics.value?.topLearners ?? []
);
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Admin Dashboard
      </h2>
      <p class="text-gray-500">
        Organization overview and analytics
      </p>
    </div>

    <StateMessage
      v-if="errorMessage && hasActiveOrganization"
      class="mb-4"
      variant="error"
      title="Something went wrong"
      :message="errorMessage"
    />

    <NoOrganizationState
      v-if="!hasActiveOrganization"
      class="mb-6"
    />

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Learners</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.totalLearners ?? 0 }}
            </p>
            <p class="text-xs text-green-600 mt-1 inline-flex items-center gap-1">
              <ArrowTrendingUpIcon class="h-3 w-3" />
              Enrollments last 4 weeks
            </p>
          </div>
          <UsersIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Active Courses</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ analytics?.totals.totalCourses ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Across all modules</p>
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
            <p class="text-xs text-gray-500 mt-1">Organization-wide</p>
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
            <p class="text-xs text-green-600 mt-1 inline-flex items-center gap-1">
              <ArrowTrendingUpIcon class="h-3 w-3" />
              Active trend
            </p>
          </div>
          <ArrowTrendingUpIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Learner Enrollment Trend
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          New learners over the past 4 weeks
        </p>
        <div class="h-64">
          <canvas ref="enrollmentCanvas" class="h-full w-full"></canvas>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Study Hours by Course
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Total hours logged per course
        </p>
        <div class="h-64">
          <canvas ref="hoursCanvas" class="h-full w-full"></canvas>
        </div>
      </div>
    </div>

    <!-- Top Active Learners -->
    <div class="bg-white border border-gray-200 rounded-xl p-6">
      <h3 class="font-semibold text-gray-900 mb-1">
        Top Active Learners
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Learners with the most study hours this month
      </p>

      <StateMessage
        v-if="isLoading"
        variant="loading"
        title="Loading learners"
        message="Fetching active learner stats."
      />

      <StateMessage
        v-else-if="topLearners.length === 0"
        variant="empty"
        title="No learner activity yet"
        message="Learners will appear once study sessions are logged."
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
              <p class="text-sm font-medium text-gray-900">
                {{ learner.name }}
              </p>
              <p class="text-xs text-gray-500">Active learner</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium text-gray-900">
              {{ (learner.minutes / 60).toFixed(1) }}h
            </p>
            <p class="text-xs text-gray-500">study time</p>
          </div>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>
