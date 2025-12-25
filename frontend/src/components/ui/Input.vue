<template>
  <input
    :value="modelValue"
    :type="type"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-60"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
type InputValue = string | number | null;

const props = withDefaults(
  defineProps<{
    modelValue?: InputValue;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    modelValue: "",
    type: "text",
    placeholder: "",
    disabled: false,
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: InputValue): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", props.type === "number" ? Number(target.value) : target.value);
};
</script>
