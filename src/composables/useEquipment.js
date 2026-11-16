import { computed } from "vue";
import { useLocalStorage } from "@vueuse/core";
import {
  armorSlots,
  items,
  resourceKeys,
  resources,
  watchingEyeLevels,
} from "@/resources";
import {
  calcRealEvasion,
  calcSlotStats,
  createEmptyLevels,
} from "@/lib/evasion";

const createEmptyEquipment = () =>
  Object.fromEntries(armorSlots.map((slot) => [slot, createEmptyLevels()]));

const toLevel = (value) => (Number.isInteger(value) && value > 0 ? value : 0);

/** Приводит сохранённые данные к актуальной схеме: лишнее отбрасывает, недостающее заполняет нулями. */
function normalizeEquipment(raw) {
  const equipment = createEmptyEquipment();
  if (!raw || typeof raw !== "object") return equipment;

  for (const slot of armorSlots) {
    for (const key of resourceKeys) {
      equipment[slot][key] = toLevel(raw[slot]?.[key]);
    }
  }
  return equipment;
}

const equipmentSerializer = {
  read: (raw) => {
    try {
      return normalizeEquipment(JSON.parse(raw));
    } catch {
      return createEmptyEquipment();
    }
  },
  write: (value) => JSON.stringify(value),
};

/** Состояние калькулятора, сохраняемое в localStorage, и всё, что из него считается. */
export function useEquipment() {
  const isHunter = useLocalStorage("isHunter", true);
  const hasBuff = useLocalStorage("hasBuff", true);
  const equipment = useLocalStorage("itemsLvl", createEmptyEquipment, {
    serializer: equipmentSerializer,
  });

  /** Уровень «Следящего ока» у противника, 0 — нет. */
  const enemyEyeLevel = useLocalStorage("enemyEyeLevel", 0);

  const enemyAccuracy = computed(
    () =>
      watchingEyeLevels.find((eye) => eye.level === enemyEyeLevel.value)
        ?.accuracy ?? 0,
  );

  /** Модификаторы самого персонажа: то, что видно в статах. */
  const ownModifiers = computed(() => ({
    isHunter: isHunter.value,
    hasBuff: hasBuff.value,
  }));

  /** Модификаторы с учётом противника: то, что работает в бою. */
  const modifiers = computed(() => ({
    ...ownModifiers.value,
    enemyAccuracy: enemyAccuracy.value,
  }));

  const armorItems = computed(() =>
    isHunter.value ? items.hunter : items.default,
  );

  const slotStats = computed(() =>
    Object.fromEntries(
      armorSlots.map((slot) => [slot, calcSlotStats(equipment.value[slot])]),
    ),
  );

  const totalEvasion = computed(() =>
    Object.values(slotStats.value).reduce((sum, s) => sum + s.evasion, 0),
  );

  /** Уворот в бою против выбранного противника. */
  const realEvasion = computed(() =>
    calcRealEvasion(totalEvasion.value, modifiers.value),
  );

  /** Уворот без учёта противника, как в статах персонажа. */
  const statsEvasion = computed(() =>
    calcRealEvasion(totalEvasion.value, ownModifiers.value),
  );

  /** Прирост реального уворота от ещё одного улучшения каждым ресурсом. */
  const nextUpgradeGain = computed(() =>
    Object.fromEntries(
      resourceKeys.map((key) => [
        key,
        calcRealEvasion(
          totalEvasion.value + resources[key].percent,
          modifiers.value,
        ) - realEvasion.value,
      ]),
    ),
  );

  const increaseLevel = (slot, key) => {
    equipment.value[slot][key]++;
  };

  const decreaseLevel = (slot, key) => {
    if (equipment.value[slot][key] > 0) equipment.value[slot][key]--;
  };

  const resetEquipment = () => {
    equipment.value = createEmptyEquipment();
  };

  return {
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
  };
}
