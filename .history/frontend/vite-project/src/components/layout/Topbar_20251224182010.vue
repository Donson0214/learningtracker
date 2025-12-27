<script setup lang="ts">
import { BellIcon } from "@heroicons/vue/24/outline"
</script>

<template>
  <div class="flex items-center justify-end h-16 px-6 gap-6">
    <!-- Notifications -->
    <div class="relative cursor-pointer">
      <BellIcon class="w-6 h-6 text-gray-600" />

      <!-- Badge -->
      <span
        class="absolute -top-1 -right-1 flex items-center justify-center
               w-4 h-4 text-[10px] font-semibold text-white
               bg-red-500 rounded-full"
      >
        2
      </span>
    </div>

    <!-- User -->
    <div class="flex items-center gap-3 cursor-pointer">
      <!-- Avatar -->
      <div
        class="w-9 h-9 rounded-full bg-blue-600
               flex items-center justify-center text-white font-medium"
      >
        S
      </div>

      <!-- Name -->
      <span class="text-sm font-medium text-gray-800">
        Sarah Johnson
      </span>
    </div>
  </div>
</template>
