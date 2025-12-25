<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/50"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button
            class="text-slate-400 transition hover:text-slate-200"
            type="button"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
        <div class="mt-4">
          <slot />
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();
</script>
