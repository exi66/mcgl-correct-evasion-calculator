<script setup>
import { Minus, Plus } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import SpriteIcon from "@/components/SpriteIcon.vue";

defineProps({
  resource: { type: Object, required: true },
  count: { type: Number, required: true },
});

defineEmits(["increase", "decrease"]);
</script>

<template>
  <div class="flex">
    <Button
      variant="outline"
      size="icon"
      class="rounded-r-none border-r-0"
      :aria-label="`Убрать ${resource.name}`"
      :disabled="count === 0"
      @click="$emit('decrease')"
    >
      <Minus />
    </Button>
    <div class="relative size-8">
      <SpriteIcon
        v-bind="resource.icon"
        :label="resource.name"
        class="border"
      />
      <span
        class="absolute inset-0 flex items-center justify-center font-semibold text-white select-none [text-shadow:0_0_2px_#000,1px_1px_0_#000]"
        aria-live="polite"
      >
        {{ count }}
      </span>
    </div>
    <Button
      variant="outline"
      size="icon"
      class="rounded-l-none border-l-0"
      :aria-label="`Добавить ${resource.name}`"
      @click="$emit('increase')"
    >
      <Plus />
    </Button>
  </div>
</template>
