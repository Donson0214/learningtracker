<template>
  <aside class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <p class="text-xs font-semibold uppercase tracking-widest text-slate-500">
      Navigation
    </p>
    <nav class="mt-4 space-y-1 text-sm">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="block rounded-lg px-3 py-2 transition"
        v-slot="{ isActive }"
      >
        <span
          :class="[
            'block rounded-lg px-3 py-2',
            isActive
              ? 'bg-emerald-500/15 text-emerald-200'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100',
          ]"
        >
          {{ item.label }}
        </span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

const items = [
  { label: "Dashboard", to: "/" },
  { label: "Courses", to: "/courses" },
  { label: "Study Plan", to: "/study-plan" },
  { label: "Sessions", to: "/study-sessions" },
  { label: "Profile", to: "/profile" },
];
</script>
