<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Study Sessions
        </h2>
        <p class="text-gray-500">
          Log and track your study time
        </p>
      </div>

      <button
        class="bg-gray-900 text-white px-4 py-2 rounded-lg
               text-sm font-medium hover:bg-gray-800"
      >
        + Log Session
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200 flex justify-between">
        <h3 class="font-semibold text-gray-900">Recent Sessions</h3>
        <select class="border border-gray-300 rounded-lg px-3 py-1 text-sm">
          <option>All Courses</option>
        </select>
      </div>

      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Date</th>
            <th class="text-left px-4 py-3">Course</th>
            <th class="text-left px-4 py-3">Module</th>
            <th class="text-left px-4 py-3">Duration</th>
            <th class="text-left px-4 py-3">Mood</th>
            <th class="text-left px-4 py-3">Notes</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <tr v-for="row in rows" :key="row.date">
            <td class="px-4 py-3">{{ row.date }}</td>
            <td class="px-4 py-3">{{ row.course }}</td>
            <td class="px-4 py-3">{{ row.module }}</td>
            <td class="px-4 py-3">{{ row.duration }}</td>
            <td class="px-4 py-3">
              <MoodPill :mood="row.mood" />
            </td>
            <td class="px-4 py-3 text-gray-500">
              {{ row.notes }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import MoodPill from "@/components/ui/MoodPill.vue";

const rows = [
  {
    date: "20/12/2024",
    course: "React Fundamentals",
    module: "Getting Started with React",
    duration: "90 min",
    mood: "Good",
    notes: "Great introduction to React concepts.",
  },
  {
    date: "21/12/2024",
    course: "React Fundamentals",
    module: "JSX Syntax",
    duration: "120 min",
    mood: "Excellent",
    notes: "Feeling confident with JSX.",
  },
  {
    date: "23/12/2024",
    course: "Python for Data Science",
    module: "Python Basics",
    duration: "60 min",
    mood: "Neutral",
    notes: "Refresher session.",
  },
];
</script>
