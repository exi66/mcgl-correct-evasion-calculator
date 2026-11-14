<script setup>
import { computed } from "vue";

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  isArmor: { type: Boolean, default: false },
  label: { type: String, default: undefined },
});

const style = computed(() => ({
  backgroundPosition: `${props.x}px ${props.y}px`,
}));
</script>

<template>
  <div
    class="sprite"
    :class="isArmor ? 'sprite-armor' : 'sprite-items'"
    :style="style"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :title="label"
  />
</template>
