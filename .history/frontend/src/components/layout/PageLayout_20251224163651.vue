<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar />
    <main class="flex-1 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>
