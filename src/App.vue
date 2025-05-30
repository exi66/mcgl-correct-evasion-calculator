<script setup>
import { ref, computed, onMounted, onUpdated } from "vue";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Item } from "@/components/ui/item";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-vue-next";

const isHunter = ref(true);
const isElf = ref(false);
const hasBuff = ref(true);

const resources = {
  bronze: {
    name: "Бронза",
    percent: 0.7,
    x: -352,
    y: -32,
  },
  wolfram: {
    name: "Вольфрам",
    percent: 1.1,
    x: -320,
    y: -32,
  },
  adamant: {
    name: "Адамантий",
    percent: 1.5,
    x: -384,
    y: -32,
  },
};

const items = {
  hunter: {
    head: { x: -128, y: -288 },
    body: { x: -128, y: -288 - 32 },
    legs: { x: -128, y: -288 - 32 * 2 },
    feet: { x: -128, y: -288 - 32 * 3 },
  },
  default: {
    head: { x: -32, y: -288 },
    body: { x: -32, y: -288 - 32 },
    legs: { x: -32, y: -288 - 32 * 2 },
    feet: { x: -32, y: -288 - 32 * 3 },
  },
};

const currentItems = computed(() => {
  return isHunter.value ? items.hunter : items.default;
});

const itemsLvl = ref({
  head: {
    bronze: 0,
    wolfram: 0,
    adamant: 0,
  },
  body: {
    bronze: 0,
    wolfram: 0,
    adamant: 0,
  },
  legs: {
    bronze: 0,
    wolfram: 0,
    adamant: 0,
  },
  feet: {
    bronze: 0,
    wolfram: 0,
    adamant: 0,
  },
});

const headLvl = computed(() => {
  return (
    itemsLvl.value.head.bronze +
    itemsLvl.value.head.wolfram +
    itemsLvl.value.head.adamant
  );
});

const headEvasion = computed(() => {
  return (
    itemsLvl.value.head.bronze * resources.bronze.percent +
    itemsLvl.value.head.wolfram * resources.wolfram.percent +
    itemsLvl.value.head.adamant * resources.adamant.percent
  );
});

const bodyLvl = computed(() => {
  return (
    itemsLvl.value.body.bronze +
    itemsLvl.value.body.wolfram +
    itemsLvl.value.body.adamant
  );
});

const bodyEvasion = computed(() => {
  return (
    itemsLvl.value.body.bronze * resources.bronze.percent +
    itemsLvl.value.body.wolfram * resources.wolfram.percent +
    itemsLvl.value.body.adamant * resources.adamant.percent
  );
});

const legsLvl = computed(() => {
  return (
    itemsLvl.value.legs.bronze +
    itemsLvl.value.legs.wolfram +
    itemsLvl.value.legs.adamant
  );
});

const legsEvasion = computed(() => {
  return (
    itemsLvl.value.legs.bronze * resources.bronze.percent +
    itemsLvl.value.legs.wolfram * resources.wolfram.percent +
    itemsLvl.value.legs.adamant * resources.adamant.percent
  );
});

const feetLvl = computed(() => {
  return (
    itemsLvl.value.feet.bronze +
    itemsLvl.value.feet.wolfram +
    itemsLvl.value.feet.adamant
  );
});

const feetEvasion = computed(() => {
  return (
    itemsLvl.value.feet.bronze * resources.bronze.percent +
    itemsLvl.value.feet.wolfram * resources.wolfram.percent +
    itemsLvl.value.feet.adamant * resources.adamant.percent
  );
});

const getEvasion = (type) => {
  switch (type) {
    case "head":
      return headEvasion.value;
    case "body":
      return bodyEvasion.value;
    case "legs":
      return legsEvasion.value;
    case "feet":
      return feetEvasion.value;
    default:
      return 0;
  }
};

const getLvl = (type) => {
  switch (type) {
    case "head":
      return headLvl.value;
    case "body":
      return bodyLvl.value;
    case "legs":
      return legsLvl.value;
    case "feet":
      return feetLvl.value;
    default:
      return 0;
  }
};

const increaceItemLevel = (item, type) => {
  itemsLvl.value[item][type]++;
};

const decreaceItemLevel = (item, type) => {
  if (itemsLvl.value[item][type] > 0) {
    itemsLvl.value[item][type]--;
  }
};

const getTotalEvasion = computed(() => {
  return (
    headEvasion.value +
    bodyEvasion.value +
    legsEvasion.value +
    feetEvasion.value
  );
});

const getBase = computed(() =>
  Math.max(
    isElf.value ? 0.5 : 0,
    getTotalEvasion.value / 100 + (isHunter.value ? 0.65 : 0)
  )
);

const getNextBase = (type) =>
  Math.max(
    isElf.value ? 0.5 : 0,
    (getTotalEvasion.value + resources[type].percent) / 100 +
      (isHunter.value ? 0.65 : 0)
  );
const getAgility = computed(
  () =>
    (1000 *
      ((hasBuff.value ? 0.25 : 0) +
        (1 - (hasBuff.value ? 0.25 : 0)) *
          Math.min(
            getBase.value,
            Math.atan(getBase.value * 11) / (Math.PI / 2)
          ))) /
    10
);

const getNextAgility = (type) =>
  (1000 *
    ((hasBuff.value ? 0.25 : 0) +
      (1 - (hasBuff.value ? 0.25 : 0)) *
        Math.min(
          getNextBase(type),
          Math.atan(getNextBase(type) * 11) / (Math.PI / 2)
        ))) /
  10;

const intl = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const saveState = () => {
  localStorage.setItem("itemsLvl", JSON.stringify(itemsLvl.value));
  localStorage.setItem("isHunter", isHunter.value);
  localStorage.setItem("hasBuff", hasBuff.value);
};

const loadState = () => {
  const savedItemsLvl = localStorage.getItem("itemsLvl");
  if (savedItemsLvl) {
    itemsLvl.value = JSON.parse(savedItemsLvl);
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
  itemsLvl.value = {
    head: { bronze: 0, wolfram: 0, adamant: 0 },
    body: { bronze: 0, wolfram: 0, adamant: 0 },
    legs: { bronze: 0, wolfram: 0, adamant: 0 },
    feet: { bronze: 0, wolfram: 0, adamant: 0 },
  };
};

onMounted(() => {
  loadState();
});
onUpdated(() => {
  saveState();
});
</script>

<template>
  <div id="app" class="p-2 space-y-2">
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
          <div
            class="flex flex-row gap-2"
            v-for="item in ['head', 'body', 'legs', 'feet']"
          >
            <Item
              :x="currentItems[item].x"
              :y="currentItems[item].y"
              class="border rounded"
            />
            <div
              class="border rounded px-2 h-8 flex items-center gap-2 text-sm w-16"
              :class="{
                'text-blue-500': getLvl(item) > 6,
                'text-red-600': getLvl(item) > 9,
              }"
            >
              ур. {{ getLvl(item) }}
            </div>
            <div
              class="border rounded px-2 h-8 flex items-center gap-2 text-sm w-16"
            >
              {{ getEvasion(item).toFixed(2) }}%
            </div>
            <div class="flex flex-row gap-2">
              <div
                class="flex"
                v-for="type in ['bronze', 'wolfram', 'adamant']"
              >
                <Button
                  variant="outline"
                  size="icon"
                  @click="decreaceItemLevel(item, type)"
                  class="border-r-0 rounded-r-none"
                  ><Minus
                /></Button>
                <div class="relative h-8 w-8">
                  <Item
                    :x="resources[type].x"
                    :y="resources[type].y"
                    :is-armor="false"
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
                  ><Plus
                /></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Button @click="resetEquipement" class="mt-2" size="sm">Сбросить</Button>
    </fieldset>
    <fieldset class="border p-4 rounded">
      <legend class="px-2">Расчет</legend>
      <div class="flex flex-col gap-2">
        <span class="text-sm"
          >Реальный уворот: {{ intl.format(getAgility) }}%</span
        >
        <span class="text-sm"
          >Уворот в статах: {{ intl.format(Math.round(getAgility)) }}%</span
        >
        <div class="text-sm">
          Реальная эффективность следующего улучшения:
          <div class="flex flex-col gap-2 mt-1">
            <div
              v-for="type in ['bronze', 'wolfram', 'adamant']"
              class="flex flex-row gap-1"
            >
              <Item
                :x="resources[type].x"
                :y="resources[type].y"
                :is-armor="false"
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
  </div>
</template>
