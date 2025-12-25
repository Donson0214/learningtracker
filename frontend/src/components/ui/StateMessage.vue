<script setup lang="ts">
import { computed } from "vue";
import {
  ArrowPathIcon,
  InboxIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";

type Variant = "loading" | "empty" | "error";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    title: string;
    message?: string;
  }>(),
  {
    variant: "empty",
    message: "",
  }
);

const icon = computed(() => {
  if (props.variant === "loading") return ArrowPathIcon;
  if (props.variant === "error") return ExclamationTriangleIcon;
  return InboxIcon;
});

const iconClass = computed(() => {
  if (props.variant === "loading") return "text-sky-500";
  if (props.variant === "error") return "text-rose-500";
  return "text-gray-400";
});

const wrapperRole = computed(() =>
  props.variant === "error" ? "alert" : "status"
);
</script>

<template>
  <div
    :role="wrapperRole"
    class="rounded-xl border border-gray-200 bg-white px-6 py-5 text-center"
  >
    <div
      class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
    >
      <component
        :is="icon"
        class="h-5 w-5"
        :class="[iconClass, props.variant === 'loading' ? 'animate-spin' : '']"
      />
    </div>
    <h4 class="text-sm font-semibold text-gray-900">
      {{ title }}
    </h4>
    <p v-if="message" class="mt-1 text-xs text-gray-500">
      {{ message }}
    </p>
    <div v-if="$slots.action" class="mt-4 flex justify-center">
      <slot name="action" />
    </div>
  </div>
</template>
