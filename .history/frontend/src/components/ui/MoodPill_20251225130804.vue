<script setup lang="ts">
import {
  FaceSmileIcon,
  HandThumbUpIcon,
  FaceNeutralIcon,
  FireIcon,
} from "@heroicons/vue/24/solid";

const props = defineProps<{ mood: string }>();

const map: any = {
  Excellent: {
    icon: HandThumbUpIcon,
    class: "bg-green-100 text-green-700",
  },
  Good: {
    icon: FaceSmileIcon,
    class: "bg-blue-100 text-blue-700",
  },
  Neutral: {
    icon: FaceNeutralIcon,
    class: "bg-gray-100 text-gray-700",
  },
  Challenging: {
    icon: FireIcon,
    class: "bg-orange-100 text-orange-700",
  },
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
    :class="map[mood].class"
  >
    <component :is="map[mood].icon" class="h-3 w-3" />
    {{ mood }}
  </span>
</template>
