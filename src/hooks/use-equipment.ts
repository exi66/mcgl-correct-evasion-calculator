import { useCallback, useMemo } from 'react';
import { z } from 'zod';
import { useStored } from '@/hooks/use-stored';
import { calcRealEvasion, calcSlotStats, createEmptyLevels, type Levels, type Modifiers } from '@/lib/evasion';
import { armorSlots, items, resourceKeys, resources, watchingEyeLevels } from '@/lib/resources';
import type { ArmorSlot, ResourceKey } from '@/lib/resources';

export type Equipment = Record<ArmorSlot, Levels>;

const createEmptyEquipment = () =>
  Object.fromEntries(armorSlots.map((slot) => [slot, createEmptyLevels()])) as Equipment;

// Saved data outlives code changes: unknown keys are dropped, missing or broken levels become 0.
const level = z.int().nonnegative().catch(0);
const levels = z.object({ bronze: level, wolfram: level, adamant: level }).catch(createEmptyLevels);
const EQUIPMENT = z
  .object({ head: levels, body: levels, legs: levels, feet: levels })
  .catch(createEmptyEquipment) satisfies z.ZodType<Equipment>;
const EYE_LEVEL = z.union(watchingEyeLevels.map((eye) => z.literal(eye.level)));
type EyeLevel = (typeof watchingEyeLevels)[number]['level'];

/** Calculator state saved in localStorage, and everything computed from it. */
export function useEquipment() {
  const [isHunter, setHunter] = useStored('hunter', true, { schema: z.boolean() });
  const [hasBuff, setBuff] = useStored('buff', true, { schema: z.boolean() });
  const [equipment, setEquipment] = useStored<Equipment>('equipment', createEmptyEquipment(), { schema: EQUIPMENT });
  /** Enemy "Следящее око" level, 0 — none. */
  const [enemyEyeLevel, setEnemyEyeLevel] = useStored<EyeLevel>('enemy-eye', 0, { schema: EYE_LEVEL });

  const enemyAccuracy = watchingEyeLevels.find((eye) => eye.level === enemyEyeLevel)?.accuracy ?? 0;

  /** The character's own modifiers: what the stats show. */
  const ownModifiers = useMemo<Modifiers>(() => ({ isHunter, hasBuff }), [isHunter, hasBuff]);
  /** Modifiers with the enemy: what works in a fight. */
  const modifiers = useMemo<Modifiers>(() => ({ ...ownModifiers, enemyAccuracy }), [ownModifiers, enemyAccuracy]);

  const derived = useMemo(() => {
    const slotStats = Object.fromEntries(armorSlots.map((slot) => [slot, calcSlotStats(equipment[slot])])) as Record<
      ArmorSlot,
      ReturnType<typeof calcSlotStats>
    >;
    const totalEvasion = Object.values(slotStats).reduce((sum, s) => sum + s.evasion, 0);
    /** Evasion in a fight against the chosen enemy. */
    const realEvasion = calcRealEvasion(totalEvasion, modifiers);
    /** Evasion without the enemy, as in the character's stats. */
    const statsEvasion = calcRealEvasion(totalEvasion, ownModifiers);
    /** Real evasion gained from one more upgrade with each resource. */
    const nextUpgradeGain = Object.fromEntries(
      resourceKeys.map((key) => [key, calcRealEvasion(totalEvasion + resources[key].percent, modifiers) - realEvasion]),
    ) as Record<ResourceKey, number>;
    return { slotStats, totalEvasion, realEvasion, statsEvasion, nextUpgradeGain };
  }, [equipment, modifiers, ownModifiers]);

  const changeLevel = useCallback(
    (slot: ArmorSlot, key: ResourceKey, delta: number) =>
      setEquipment((prev) => ({
        ...prev,
        [slot]: { ...prev[slot], [key]: Math.max(0, prev[slot][key] + delta) },
      })),
    [setEquipment],
  );

  return {
    isHunter,
    setHunter,
    hasBuff,
    setBuff,
    enemyEyeLevel,
    setEnemyEyeLevel,
    equipment,
    modifiers,
    armorItems: isHunter ? items.hunter : items.default,
    ...derived,
    increaseLevel: (slot: ArmorSlot, key: ResourceKey) => changeLevel(slot, key, 1),
    decreaseLevel: (slot: ArmorSlot, key: ResourceKey) => changeLevel(slot, key, -1),
    resetEquipment: () => setEquipment(createEmptyEquipment()),
  };
}
