<script setup>
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SpriteIcon from "@/components/SpriteIcon.vue";
import EquipmentSlot from "@/components/EquipmentSlot.vue";
import EvasionChart from "@/components/EvasionChart.vue";
import { useEquipment } from "@/composables/useEquipment";
import { useTheme } from "@/composables/useTheme";
import {
  armorSlots,
  resourceKeys,
  resources,
  watchingEyeLevels,
} from "@/resources";
import { intl } from "@/lib/utils";

useTheme();

const {
  isHunter,
  hasBuff,
  enemyEyeLevel,
  equipment,
  modifiers,
  armorItems,
  slotStats,
  totalEvasion,
  realEvasion,
  statsEvasion,
  nextUpgradeGain,
  increaseLevel,
  decreaseLevel,
  resetEquipment,
} = useEquipment();

const toggles = [
  { id: "isHunter", label: "Вор", model: isHunter },
  { id: "hasBuff", label: "Таблетка +25%", model: hasBuff },
];
</script>

<template>
  <div class="container mx-auto space-y-2 p-2">
    <fieldset class="rounded border p-4">
      <legend class="px-2">База</legend>
      <div class="flex flex-wrap gap-4">
        <div
          v-for="toggle in toggles"
          :key="toggle.id"
          class="flex items-center"
        >
          <Checkbox
            :id="toggle.id"
            v-model="toggle.model.value"
            class="cursor-pointer"
          />
          <Label :for="toggle.id" class="cursor-pointer px-2">
            {{ toggle.label }}
          </Label>
        </div>
      </div>
    </fieldset>

    <fieldset class="rounded border p-4">
      <legend class="px-2">Противник</legend>
      <div class="flex flex-wrap items-center gap-2">
        <a
          id="enemyEyeLabel"
          href="https://forum.minecraft-galaxy.ru/wiki/1560"
          target="_blank"
          rel="noopener"
          class="text-sm underline-offset-4 hover:underline"
        >
          Следящее око:
        </a>
        <div
          role="radiogroup"
          aria-labelledby="enemyEyeLabel"
          class="flex flex-wrap gap-1"
        >
          <Button
            v-for="eye in watchingEyeLevels"
            :key="eye.level"
            size="sm"
            role="radio"
            :aria-checked="enemyEyeLevel === eye.level"
            :variant="enemyEyeLevel === eye.level ? 'default' : 'outline'"
            @click="enemyEyeLevel = eye.level"
          >
            {{ eye.label }}
          </Button>
        </div>
      </div>
    </fieldset>

    <fieldset class="rounded border p-4">
      <legend class="px-2">Снаряжение</legend>
      <div class="flex flex-col gap-2">
        <EquipmentSlot
          v-for="slot in armorSlots"
          :key="slot"
          :icon="armorItems[slot]"
          :levels="equipment[slot]"
          :stats="slotStats[slot]"
          @increase="increaseLevel(slot, $event)"
          @decrease="decreaseLevel(slot, $event)"
        />
      </div>
      <Button class="mt-2" size="sm" @click="resetEquipment">Сбросить</Button>
    </fieldset>

    <div class="grid grid-cols-6 gap-4">
      <fieldset class="col-span-6 rounded border p-4 lg:col-span-2">
        <legend class="px-2">Расчет</legend>
        <div class="flex flex-col gap-1 text-sm">
          <span>Реальный уворот: {{ intl.format(realEvasion) }}%</span>
          <span>
            Уворот в статах: {{ intl.format(Math.round(statsEvasion)) }}%
          </span>
          <span>КПД следующего улучшения:</span>
          <div class="mt-1 flex flex-col gap-2">
            <div
              v-for="key in resourceKeys"
              :key="key"
              class="flex flex-row items-center gap-1"
            >
              <SpriteIcon
                v-bind="resources[key].icon"
                :label="resources[key].name"
                class="border"
              />
              +{{ intl.format(nextUpgradeGain[key]) }}%
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="col-span-6 rounded border p-4 lg:col-span-4">
        <legend class="px-2">График</legend>
        <EvasionChart :current="totalEvasion" :modifiers="modifiers" />
      </fieldset>
    </div>
  </div>
</template>
