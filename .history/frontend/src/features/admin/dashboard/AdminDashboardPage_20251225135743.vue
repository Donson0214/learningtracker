<script setup lang="ts">
import {
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/vue/24/outline";
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Admin Dashboard
      </h2>
      <p class="text-gray-500">
        Overview of your organization’s learning activity
      </p>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <!-- Total Learners -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Learners</p>
            <p class="text-2xl font-semibold text-gray-900">124</p>
          </div>
          <UsersIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <!-- Active Courses -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Active Courses</p>
            <p class="text-2xl font-semibold text-gray-900">8</p>
          </div>
          <BookOpenIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <!-- Total Study Hours -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Total Study Hours</p>
            <p class="text-2xl font-semibold text-gray-900">1,245</p>
          </div>
          <ClockIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <!-- Avg Hours / Learner -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">
              Avg Hours / Learner
            </p>
            <p class="text-2xl font-semibold text-gray-900">
              10.0
            </p>
          </div>
          <ChartBarIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Charts + Top Learners -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Enrollment Trend (Chart Placeholder) -->
      <div
        class="bg-white border border-gray-200 rounded-xl p-6
               xl:col-span-2"
      >
        <h3 class="font-semibold text-gray-900 mb-1">
          Enrollment Trend
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Learner enrollment over time
        </p>

        <!-- Chart placeholder -->
        <div
          class="h-64 flex items-center justify-center
                 text-gray-400 border border-dashed rounded-lg"
        >
          Line Chart (Coming Next)
        </div>
      </div>

      <!-- Top Active Learners -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h3 class="font-semibold text-gray-900 mb-1">
          Top Active Learners
        </h3>
        <p class="text-sm text-gray-500 mb-4">
          Most engaged this week
        </p>

        <ul class="space-y-4">
          <li class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-full bg-blue-600
                       text-white flex items-center justify-center
                       text-sm font-medium"
              >
                S
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Sarah Johnson
                </p>
                <p class="text-xs text-gray-500">
                  12.5 hours
                </p>
              </div>
            </div>
          </li>

          <li class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-full bg-green-600
                       text-white flex items-center justify-center
                       text-sm font-medium"
              >
                M
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Michael Lee
                </p>
                <p class="text-xs text-gray-500">
                  10.8 hours
                </p>
              </div>
            </div>
          </li>

          <li class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div
                class="h-9 w-9 rounded-full bg-purple-600
                       text-white flex items-center justify-center
                       text-sm font-medium"
              >
                A
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">
                  Anna Smith
                </p>
                <p class="text-xs text-gray-500">
                  9.4 hours
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
