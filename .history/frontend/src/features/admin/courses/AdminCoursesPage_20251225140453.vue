<script setup lang="ts">
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Courses
        </h2>
        <p class="text-gray-500">
          Manage courses and learning content
        </p>
      </div>

      <button
        class="flex items-center gap-2
               bg-gray-900 text-white
               px-4 py-2 rounded-lg
               text-sm font-medium
               hover:bg-gray-800"
      >
        <PlusIcon class="h-4 w-4" />
        Add Course
      </button>
    </div>

    <!-- Courses Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Course</th>
            <th class="text-left px-4 py-3">Description</th>
            <th class="text-left px-4 py-3">Duration</th>
            <th class="text-left px-4 py-3">Modules</th>
            <th class="text-left px-4 py-3">Status</th>
            <th class="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <!-- Row 1 -->
          <tr>
            <td class="px-4 py-3 font-medium text-gray-900">
              React Fundamentals
            </td>
            <td class="px-4 py-3 text-gray-500">
              Master the basics of React
            </td>
            <td class="px-4 py-3 text-gray-500">
              12h
            </td>
            <td class="px-4 py-3 text-gray-500">
              8
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-green-100 text-green-700
                       text-xs font-medium"
              >
                Active
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-3">
                <PencilSquareIcon
                  class="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                />
                <TrashIcon
                  class="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer"
                />
              </div>
            </td>
          </tr>

          <!-- Row 2 -->
          <tr>
            <td class="px-4 py-3 font-medium text-gray-900">
              Python for Data Science
            </td>
            <td class="px-4 py-3 text-gray-500">
              Learn Python and data analysis
            </td>
            <td class="px-4 py-3 text-gray-500">
              18h
            </td>
            <td class="px-4 py-3 text-gray-500">
              10
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-green-100 text-green-700
                       text-xs font-medium"
              >
                Active
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-3">
                <PencilSquareIcon
                  class="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                />
                <TrashIcon
                  class="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer"
                />
              </div>
            </td>
          </tr>

          <!-- Row 3 -->
          <tr>
            <td class="px-4 py-3 font-medium text-gray-900">
              UI/UX Design Principles
            </td>
            <td class="px-4 py-3 text-gray-500">
              Learn modern UI/UX best practices
            </td>
            <td class="px-4 py-3 text-gray-500">
              10h
            </td>
            <td class="px-4 py-3 text-gray-500">
              6
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-gray-100 text-gray-700
                       text-xs font-medium"
              >
                Draft
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex justify-end gap-3">
                <PencilSquareIcon
                  class="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer"
                />
                <TrashIcon
                  class="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
