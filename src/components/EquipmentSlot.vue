<script setup>
import { resourceKeys, resources } from "@/resources";
import { percentIntl } from "@/lib/utils";
import SpriteIcon from "@/components/SpriteIcon.vue";
import ResourceCounter from "@/components/ResourceCounter.vue";

defineProps({
  icon: { type: Object, default: undefined },
  levels: { type: Object, required: true },
  stats: { type: Object, required: true },
});

defineEmits(["increase", "decrease"]);
</script>

<template>
  <div class="flex flex-row gap-2">
    <SpriteIcon v-if="icon" v-bind="icon" class="rounded border" />
    <div
      class="hidden h-8 w-16 items-center gap-2 rounded border px-2 text-sm md:flex"
      :class="{
        'text-blue-500': stats.lvl > 6 && stats.lvl <= 9,
        'text-red-600': stats.lvl > 9,
      }"
    >
      ур. {{ stats.lvl }}
    </div>
    <div
      class="hidden h-8 w-16 items-center justify-end gap-2 rounded border px-2 text-sm md:flex"
    >
      {{ percentIntl.format(stats.evasion) }}%
    </div>
    <ResourceCounter
      v-for="key in resourceKeys"
      :key="key"
      :resource="resources[key]"
      :count="levels[key]"
      @increase="$emit('increase', key)"
      @decrease="$emit('decrease', key)"
    />
  </div>
</template>
