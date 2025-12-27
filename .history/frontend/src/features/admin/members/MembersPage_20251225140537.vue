<script setup lang="ts">
import {
  PlusIcon,
  UserCircleIcon,
} from "@heroicons/vue/24/outline";
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h2 class="text-2xl font-semibold text-gray-900 mb-1">
          Members
        </h2>
        <p class="text-gray-500">
          Manage organization members and roles
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
        Invite Member
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      <!-- Total -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Total Members
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          124
        </p>
      </div>

      <!-- Learners -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Learners
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          110
        </p>
      </div>

      <!-- Admins -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <p class="text-sm text-gray-500 mb-1">
          Admins
        </p>
        <p class="text-2xl font-semibold text-gray-900">
          14
        </p>
      </div>
    </div>

    <!-- Members Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="text-left px-4 py-3">Member</th>
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Role</th>
            <th class="text-left px-4 py-3">Courses</th>
            <th class="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>

        <tbody class="divide-y">
          <!-- Row 1 -->
          <tr>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <UserCircleIcon class="h-8 w-8 text-blue-600" />
                <span class="font-medium text-gray-900">
                  Sarah Johnson
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500">
              sarah@example.com
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-blue-100 text-blue-700
                       text-xs font-medium"
              >
                Learner
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              3
            </td>
            <td class="px-4 py-3 text-right">
              <button
                class="text-sm text-blue-600 hover:underline"
              >
                Assign Courses
              </button>
            </td>
          </tr>

          <!-- Row 2 -->
          <tr>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <UserCircleIcon class="h-8 w-8 text-green-600" />
                <span class="font-medium text-gray-900">
                  Michael Lee
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500">
              michael@example.com
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-purple-100 text-purple-700
                       text-xs font-medium"
              >
                Admin
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              —
            </td>
            <td class="px-4 py-3 text-right">
              <button
                class="text-sm text-blue-600 hover:underline"
              >
                Assign Courses
              </button>
            </td>
          </tr>

          <!-- Row 3 -->
          <tr>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <UserCircleIcon class="h-8 w-8 text-orange-600" />
                <span class="font-medium text-gray-900">
                  Anna Smith
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-500">
              anna@example.com
            </td>
            <td class="px-4 py-3">
              <span
                class="px-2 py-1 rounded-full
                       bg-blue-100 text-blue-700
                       text-xs font-medium"
              >
                Learner
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">
              2
            </td>
            <td class="px-4 py-3 text-right">
              <button
                class="text-sm text-blue-600 hover:underline"
              >
                Assign Courses
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
