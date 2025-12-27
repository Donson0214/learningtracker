<script setup lang="ts">
import {
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-gray-900 mb-1">
        Organization
      </h2>
      <p class="text-gray-500">
        Manage your organization settings and details
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <!-- Members -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Members</p>
            <p class="text-2xl font-semibold text-gray-900">124</p>
          </div>
          <UsersIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <!-- Courses -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Courses</p>
            <p class="text-2xl font-semibold text-gray-900">8</p>
          </div>
          <BookOpenIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>

      <!-- Created Date -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-500 mb-1">Created</p>
            <p class="text-2xl font-semibold text-gray-900">
              Jan 15, 2024
            </p>
          </div>
          <CalendarIcon class="h-6 w-6 text-gray-400" />
        </div>
      </div>
    </div>

    <!-- Organization Details -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-8">
      <h3 class="font-semibold text-gray-900 mb-4">
        Organization Details
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name -->
        <div>
          <label class="text-sm text-gray-600 mb-1 block">
            Organization Name
          </label>
          <div class="relative">
            <BuildingOfficeIcon
              class="h-5 w-5 absolute left-3 top-2.5 text-gray-400"
            />
            <input
              class="w-full pl-10 pr-3 py-2
                     border border-gray-300 rounded-lg
                     bg-gray-50"
              value="Tech Academy"
            />
          </div>
        </div>

        <!-- Slug -->
        <div>
          <label class="text-sm text-gray-600 mb-1 block">
            Organization Slug
          </label>
          <input
            class="w-full px-3 py-2
                   border border-gray-300 rounded-lg
                   bg-gray-50"
            value="tech-academy"
          />
        </div>
      </div>

      <!-- Status -->
      <div class="mt-6 flex items-center justify-between">
        <div>
          <p class="font-medium text-gray-900">
            Organization Status
          </p>
          <p class="text-sm text-gray-500">
            Disable to prevent learner access
          </p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" class="sr-only peer" checked />
          <div
            class="w-11 h-6 bg-gray-200 rounded-full peer
                   peer-checked:bg-blue-600
                   after:content-['']
                   after:absolute after:top-0.5 after:left-[2px]
                   after:bg-white after:h-5 after:w-5
                   after:rounded-full after:transition-all
                   peer-checked:after:translate-x-full"
          ></div>
        </label>
      </div>

      <!-- Save -->
      <div class="mt-6">
        <button
          class="bg-gray-900 text-white
                 px-4 py-2 rounded-lg
                 text-sm font-medium hover:bg-gray-800"
        >
          Save Changes
        </button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="bg-white border border-red-200 rounded-xl p-6">
      <h3 class="font-semibold text-red-600 mb-2">
        Danger Zone
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Deleting your organization is permanent and cannot be undone.
      </p>

      <button
        class="flex items-center gap-2
               border border-red-300 text-red-600
               px-4 py-2 rounded-lg
               text-sm font-medium hover:bg-red-50"
      >
        <TrashIcon class="h-4 w-4" />
        Delete Organization
      </button>
    </div>
  </div>
</template>
