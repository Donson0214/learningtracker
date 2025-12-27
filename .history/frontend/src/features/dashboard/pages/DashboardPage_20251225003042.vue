<template>
  <div>
    <!-- Welcome -->
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      Welcome back, Sarah Johnson!
    </h2>
    <p class="text-gray-500 mb-6">
      Track your learning progress and stay on top of your goals.
    </p>

    

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Study Hours"
        value="5.8"
        sub="All time"
        :icon="ClockIcon"
      />

      <StatCard
        label="This Week"
        value="9.0h"
        sub="+15% from last week"
        :icon="ArrowTrendingUpIcon"
      />

      <StatCard
        label="Active Courses"
        value="2"
        sub="In progress"
        :icon="BookOpenIcon"
      />

      <StatCard
        label="Study Streak"
        value="5 days"
        sub="Keep it up!"
        :icon="FireIcon"
      />

      <WeeklyStudyChart class="mb-8" />

    </div>

    <!-- Next sections coming -->
  </div>
</template>

<script setup lang="ts">
import StatCard from "@/components/ui/StatCard.vue";
import WeeklyStudyChart from "@/components/charts/WeeklyStudyChart.vue";

import {
  ClockIcon,
  BookOpenIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";
</script>
