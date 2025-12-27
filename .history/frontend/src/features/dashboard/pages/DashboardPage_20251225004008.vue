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

      <!-- Weekly chart -->
<WeeklyStudyChart class="mb-10" />

<!-- Course Progress -->
<div class="flex items-center justify-between mb-4">
  <h3 class="text-lg font-semibold text-gray-900">
    Course Progress
  </h3>

  <RouterLink
    to="/courses"
    class="text-sm text-gray-500 hover:text-gray-700"
  >
    View All
  </RouterLink>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
  <CourseProgressCard
    title="React Fundamentals"
    description="Master the fundamentals of React including components, hooks, and state management"
    :percent="35"
    :hours="12"
  />

  <CourseProgressCard
    title="Python for Data Science"
    description="Learn Python programming and essential data science libraries"
    :percent="15"
    :hours="18"
  />

  <CourseProgressCard
    title="UI/UX Design Principles"
    description="Explore user interface and user experience design best practices"
    :percent="0"
    :hours="10"
  />
</div>

<!-- Continue Learning CTA -->
<ContinueLearningCTA />

    </div>

    <!-- Next sections coming -->
  </div>
</template>

<script setup lang="ts">
import StatCard from "@/components/ui/StatCard.vue";
import WeeklyStudyChart from "@/components/charts/WeeklyStudyChart.vue";
import CourseProgressCard from "@/components/ui/CourseProgressCard.vue";
import ContinueLearningCTA from "@/components/ui/ContinueLearningCTA.vue";

import {
  ClockIcon,
  BookOpenIcon,
  FireIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/vue/24/outline";


</script>
