<template>
  <div>
    <!-- Header -->
    <h2 class="text-2xl font-semibold text-gray-900 mb-1">
      My Courses
    </h2>
    <p class="text-gray-500 mb-8">
      Browse and track your learning journey
    </p>

    <!-- Courses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CourseCard
        title="React Fundamentals"
        description="Master the fundamentals of React including components, hooks, and state management"
        :percent="35"
        :hours="12"
        cta="Continue"
      />

      <CourseCard
        title="Python for Data Science"
        description="Learn Python programming and essential data science libraries"
        :percent="15"
        :hours="18"
        cta="Continue"
      />

      <CourseCard
        title="UI/UX Design Principles"
        description="Explore user interface and user experience design best practices"
        :percent="0"
        :hours="10"
        cta="Start Course"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CourseCard from "@/components/ui/CourseCard.vue";
</script>
