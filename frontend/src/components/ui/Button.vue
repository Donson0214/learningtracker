<template>
  <button :class="classes" :type="type" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    type: "button",
    disabled: false,
  }
);

const classes = computed(() => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60";
  const variants: Record<Variant, string> = {
    primary:
      "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20",
    outline:
      "border border-slate-700 text-slate-100 hover:border-emerald-400 hover:text-emerald-200",
    ghost: "text-slate-200 hover:bg-slate-800",
  };
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return [base, variants[props.variant], sizes[props.size]].join(" ");
});
</script>
