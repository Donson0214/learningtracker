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
    colspan: number;
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
</script>

<template>
  <tr>
    <td :colspan="colspan" class="px-4 py-6">
      <div class="flex items-center justify-center gap-3">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
        >
          <component
            :is="icon"
            class="h-4 w-4"
            :class="[iconClass, props.variant === 'loading' ? 'animate-spin' : '']"
          />
        </div>
        <div class="text-left">
          <p class="text-sm font-semibold text-gray-900">
            {{ title }}
          </p>
          <p v-if="message" class="text-xs text-gray-500">
            {{ message }}
          </p>
        </div>
      </div>
    </td>
  </tr>
</template>
