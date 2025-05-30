<script setup>
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  class: { type: null, required: false },
  isArmor: { type: Boolean, default: true },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <div
    v-bind="delegatedProps"
    :class="cn(isArmor ? 'bg-items' : 'bg-items3', props.class)"
    :style="`background-position: ${props.x}px ${props.y}px;`"
  ></div>
</template>
