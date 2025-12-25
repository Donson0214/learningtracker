<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  }
);

const canPrev = computed(() => props.page > 1);
const canNext = computed(() => props.page < props.totalPages);

const rangeLabel = computed(() => {
  if (!props.total) {
    return "Showing 0 of 0";
  }
  const start = (props.page - 1) * props.pageSize + 1;
  const end = Math.min(props.total, props.page * props.pageSize);
  return `Showing ${start}-${end} of ${props.total}`;
});

const emit = defineEmits<{
  (event: "prev"): void;
  (event: "next"): void;
}>();
</script>

<template>
  <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
    <p class="text-xs text-gray-500">
      {{ rangeLabel }}
    </p>
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <button
        class="rounded-lg border border-gray-200 px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        :disabled="!canPrev || isLoading"
        @click="emit('prev')"
      >
        Prev
      </button>
      <span>
        Page {{ page }} of {{ totalPages }}
      </span>
      <button
        class="rounded-lg border border-gray-200 px-3 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        :disabled="!canNext || isLoading"
        @click="emit('next')"
      >
        Next
      </button>
    </div>
  </div>
</template>
