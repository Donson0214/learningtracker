<script setup lang="ts">
import {
  FaceSmileIcon,
  HandThumbUpIcon,
  FaceFrownIcon,
  FireIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{ mood: string }>();

const map: Record<
  string,
  { icon: typeof FaceSmileIcon; class: string; iconClass: string }
> = {
  Excellent: {
    icon: HandThumbUpIcon,
    class: "bg-green-50 text-green-700",
    iconClass: "bg-green-200 text-green-700",
  },
  Good: {
    icon: FaceSmileIcon,
    class: "bg-blue-50 text-blue-700",
    iconClass: "bg-blue-200 text-blue-700",
  },
  Neutral: {
    icon: FaceFrownIcon,
    class: "bg-gray-100 text-gray-700",
    iconClass: "bg-gray-200 text-gray-700",
  },
  Challenging: {
    icon: FireIcon,
    class: "bg-orange-50 text-orange-700",
    iconClass: "bg-orange-200 text-orange-700",
  },
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
    :class="map[mood].class"
  >
    <span
      class="h-4 w-4 rounded-full inline-flex items-center justify-center"
      :class="map[mood].iconClass"
    >
      <component :is="map[mood].icon" class="h-3 w-3" />
    </span>
    {{ mood }}
  </span>
</template>
