<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Item } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-vue-next";
import { EvasionChart } from "@/components/ui/evasion-chart";
import { resources, items, armorSlots } from "@/resources";
import { intl, percentIntl } from "@/lib/utils";

const isHunter = ref(true);
const isElf = ref(false);
const hasBuff = ref(true);

const currentItems = computed(() => {
  return isHunter.value ? items.hunter : items.default;
});

const createEmptyLvl = () => {
  const obj = {};
  Object.keys(resources).forEach((key) => {
    obj[key] = 0;
  });
  return obj;
};

const itemsLvl = ref(
  armorSlots.reduce((acc, slot) => {
    acc[slot] = createEmptyLvl();
    return acc;
  }, {}),
);

const itemStats = computed(() => {
  const stats = {};
  const resourceKeys = Object.keys(resources);

  armorSlots.forEach((slot) => {
    const levels = itemsLvl.value[slot];

    let totalLvl = 0;
    let totalEvasion = 0;

    resourceKeys.forEach((key) => {
      const count = levels[key] || 0;
      totalLvl += count;
      totalEvasion += count * resources[key].percent;
    });

    stats[slot] = {
      lvl: totalLvl,
      evasion: totalEvasion,
    };
  });

  return stats;
});

const getEvasion = (type) => itemStats.value[type].evasion;
const getLvl = (type) => itemStats.value[type].lvl;

const increaceItemLevel = (item, type) => {
  itemsLvl.value[item][type]++;
};

const decreaceItemLevel = (item, type) => {
  if (itemsLvl.value[item][type] > 0) {
    itemsLvl.value[item][type]--;
  }
};

const getTotalEvasion = computed(() => {
  return Object.values(itemStats.value).reduce(
    (sum, item) => sum + item.evasion,
    0,
  );
});

const calculateAgilityFromTotal = (totalEvasionValue) => {
  const base = Math.max(
    isElf.value ? 0.5 : 0,
    totalEvasionValue / 100 + (isHunter.value ? 0.65 : 0),
  );
  const buff = hasBuff.value ? 0.25 : 0;

  return (
    (1000 *
      (buff +
        (1 - buff) * Math.min(base, Math.atan(base * 11) / (Math.PI / 2)))) /
    10
  );
};

const getAgility = computed(() =>
  calculateAgilityFromTotal(getTotalEvasion.value),
);

const getNextAgility = (type) =>
  calculateAgilityFromTotal(getTotalEvasion.value + resources[type].percent);

const saveState = () => {
  localStorage.setItem("itemsLvl", JSON.stringify(itemsLvl.value));
  localStorage.setItem("isHunter", isHunter.value);
  localStorage.setItem("hasBuff", hasBuff.value);
};

const loadState = () => {
  const savedItemsLvl = localStorage.getItem("itemsLvl");
  if (savedItemsLvl) {
    const parsed = JSON.parse(savedItemsLvl);

    armorSlots.forEach((slot) => {
      if (parsed[slot]) {
        itemsLvl.value[slot] = { ...createEmptyLvl(), ...parsed[slot] };
      }
    });
  }
  const savedIsHunter = localStorage.getItem("isHunter");
  if (savedIsHunter !== null) {
    isHunter.value = JSON.parse(savedIsHunter);
  }
  const savedHasBuff = localStorage.getItem("hasBuff");
  if (savedHasBuff !== null) {
    hasBuff.value = JSON.parse(savedHasBuff);
  }
};

const resetEquipement = () => {
  itemsLvl.value = armorSlots.reduce((acc, slot) => {
    acc[slot] = createEmptyLvl();
    return acc;
  }, {});
};

watch(
  [itemsLvl, isHunter, hasBuff],
  () => {
    saveState();
  },
  { deep: true },
);

onMounted(() => {
  loadState();
});
</script>

<template>
  <div class="p-2 space-y-2 container mx-auto">
    <fieldset class="border p-4 rounded">
      <legend class="px-2">База</legend>
      <div class="flex gap-4">
        <div class="flex items-center">
          <Checkbox id="isHunter" v-model="isHunter" class="cursor-pointer" />
          <Label for="isHunter" class="cursor-pointer px-2">Вор</Label>
        </div>
        <div class="flex items-center">
          <Checkbox id="hasBuff" v-model="hasBuff" class="cursor-pointer" />
          <Label for="hasBuff" class="cursor-pointer px-2">Таблетка +25%</Label>
        </div>
      </div>
    </fieldset>
    <fieldset class="border p-4 rounded">
      <legend class="px-2">Снаряжение</legend>
      <div class="flex gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2" v-for="item in armorSlots">
            <Item
              v-if="currentItems[item]"
              v-bind="currentItems[item]"
              class="border rounded"
            />
            <div
              class="border rounded px-2 h-8 items-center gap-2 text-sm w-16 hidden md:flex"
              :class="{
                'text-blue-500': getLvl(item) > 6,
                'text-red-600': getLvl(item) > 9,
              }"
            >
              ур. {{ getLvl(item) }}
            </div>
            <div
              class="border rounded px-2 h-8 items-center justify-end gap-2 text-sm w-16 hidden md:flex"
            >
              {{ percentIntl.format(getEvasion(item)) }}%
            </div>
            <div class="flex" v-for="type in Object.keys(resources)">
              <Button
                variant="outline"
                size="icon"
                @click="decreaceItemLevel(item, type)"
                class="border-r-0 rounded-r-none"
              >
                <Minus />
              </Button>
              <div class="relative h-8 w-8">
                <Item
                  v-if="resources[type]?.icon"
                  v-bind="resources[type].icon"
                  class="border"
                />
                <span
                  class="absolute top-0 left-0 w-full h-full flex items-center justify-center select-none"
                  >{{ itemsLvl[item][type] }}</span
                >
              </div>
              <Button
                variant="outline"
                size="icon"
                @click="increaceItemLevel(item, type)"
                class="border-l-0 rounded-l-none"
              >
                <Plus />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Button @click="resetEquipement" class="mt-2" size="sm">Сбросить</Button>
    </fieldset>
    <div class="grid grid-cols-6 gap-4">
      <fieldset class="border p-4 rounded col-span-6 lg:col-span-2">
        <legend class="px-2">Расчет</legend>
        <div class="flex flex-col gap-1">
          <span class="text-sm">
            <span>Реальный уворот:</span> {{ intl.format(getAgility) }}%
          </span>
          <span class="text-sm">
            <span>Уворот в статах:</span>
            {{ intl.format(Math.round(getAgility)) }}%
          </span>
          <div class="text-sm">
            <span>КПД следующего улучшения:</span>
            <div class="flex flex-col gap-2 mt-1">
              <div
                v-for="type in Object.keys(resources)"
                class="flex flex-row gap-1"
              >
                <Item
                  v-if="resources[type]?.icon"
                  v-bind="resources[type].icon"
                  class="border"
                />
                <div class="flex items-center">
                  {{ intl.format(getNextAgility(type) - getAgility) }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset class="border p-4 rounded col-span-6 lg:col-span-4">
        <legend class="px-2">График</legend>
        <EvasionChart
          class="col-span-4"
          :formula="calculateAgilityFromTotal"
          :current="getTotalEvasion"
        />
      </fieldset>
    </div>
  </div>
</template>
