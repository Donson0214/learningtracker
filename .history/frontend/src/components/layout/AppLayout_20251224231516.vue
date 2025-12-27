<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <AppHeader />
    <div class="mx-auto flex max-w-6xl gap-6 px-4 pb-10 pt-6">
      <AppSidebar class="hidden md:block md:w-56" />
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "./AppHeader.vue";
import AppSidebar from "./AppSidebar.vue";
</script>
