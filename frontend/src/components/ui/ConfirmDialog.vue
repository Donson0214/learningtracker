<script setup lang="ts">
import { computed } from "vue";
import Modal from "./Modal.vue";

type Tone = "danger" | "primary";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: Tone;
    confirming?: boolean;
  }>(),
  {
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    tone: "danger",
    confirming: false,
  }
);

const emit = defineEmits<{
  (event: "close"): void;
  (event: "confirm"): void;
}>();

const confirmClasses = computed(() => {
  if (props.tone === "primary") {
    return "bg-gray-900 text-white hover:bg-gray-800";
  }
  return "bg-rose-600 text-white hover:bg-rose-700";
});
</script>

<template>
  <Modal :open="open" :title="title" @close="emit('close')">
    <p class="text-sm text-slate-300">
      {{ message }}
    </p>
    <div class="mt-6 flex items-center justify-end gap-3">
      <button
        type="button"
        class="text-sm text-slate-300 hover:text-slate-100"
        @click="emit('close')"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-60"
        :class="confirmClasses"
        :disabled="confirming"
        @click="emit('confirm')"
      >
        {{ confirming ? "Working..." : confirmLabel }}
      </button>
    </div>
  </Modal>
</template>
