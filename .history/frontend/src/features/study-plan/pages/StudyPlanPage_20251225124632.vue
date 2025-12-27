<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          My Study Plan
        </h2>
        <p class="text-gray-500">
          AI-generated schedule to reach your goals
        </p>
      </div>

      <button
        class="border border-gray-300 rounded-lg
               px-4 py-2 text-sm font-medium
               hover:bg-gray-100 transition"
      >
        Regenerate Plan
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <PlanStatCard label="Total Tasks" value="5" />
      <PlanStatCard label="Completed" value="0" highlight />
      <PlanStatCard label="Target Date" value="15/02/2025" />
    </div>

    <!-- Weekly Plan -->
    <div class="bg-white border border-gray-200 rounded-xl">
      <div class="px-4 py-4 border-b border-gray-200">
        <h3 class="font-semibold text-gray-900">
          Week of 22/12/2024 – 28/12/2024
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          5 tasks scheduled
        </p>
      </div>

      <StudyPlanItem
        title="Getting Started with React – Components Basics"
        course="React Fundamentals"
        :duration="60"
        date="24/12/2024"
      />

      <StudyPlanItem
        title="React Hooks – useState Hook"
        course="React Fundamentals"
        :duration="50"
        date="25/12/2024"
      />

      <StudyPlanItem
        title="React Hooks – useEffect Hook"
        course="React Fundamentals"
        :duration="55"
        date="26/12/2024"
      />

      <StudyPlanItem
        title="Python Fundamentals – Control Flow"
        course="Python for Data Science"
        :duration="50"
        date="27/12/2024"
      />

      <StudyPlanItem
        title="React Hooks – Custom Hooks"
        course="React Fundamentals"
        :duration="70"
        date="28/12/2024"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import PlanStatCard from "@/components/ui/PlanStatCard.vue";
import StudyPlanItem from "@/components/ui/StudyPlanItem.vue";
</script>
