<script setup lang="ts">
import { BellIcon, UserCircleIcon } from "@heroicons/vue/24/outline";
</script>

<template>
  <header
    class="h-16 bg-white border-b border-gray-200
           flex items-center justify-between
           px-6"
  >
    <!-- Page Title -->
    <h1 class="text-lg font-semibold text-gray-900">
      Admin Dashboard
    </h1>

    <!-- Right Actions -->
    <div class="flex items-center gap-5">
      <!-- Notifications -->
      <div class="relative cursor-pointer">
        <BellIcon class="h-6 w-6 text-gray-600" />
        <!-- Unread dot -->
        <span
          class="absolute -top-1 -right-1
                 h-2.5 w-2.5
                 bg-red-500 rounded-full"
        ></span>
      </div>

      <!-- User -->
      <div class="flex items-center gap-2">
        <UserCircleIcon class="h-8 w-8 text-blue-600" />
        <span class="text-sm font-medium text-gray-900">
          Admin User
        </span>
      </div>
    </div>
  </header>
</template>
