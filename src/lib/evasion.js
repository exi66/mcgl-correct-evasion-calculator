import { resourceKeys, resources } from "@/resources";

/** Бонус к базе у вора (65%). */
export const HUNTER_BONUS = 0.65;
/** Бонус расы. Эльфа не учитываем, поэтому 0. */
const RACE_BASE = 0;
/** Таблетка: +25% к итоговому увороту. */
export const BUFF_BONUS = 0.25;
/** Крутизна кривой софт-капа. */
const SOFT_CAP_STEEPNESS = 11;

/**
 * Реальный уворот (в процентах) по суммарному увороту на броне (в процентах).
 *
 * Формула из игры:
 *   база    = MAX(<раса>, <вор> + <сет>) + <инвентарь>
 *   agility = (<бафы> + (1 − <бафы>) · MIN(база, ATAN(база · 11) / (π/2))) · <дебафы>
 *
 * Точность противника (например, «Следящее око») снижает базу цели
 * относительно исходного значения: при 20% база 0.5 становится 0.4.
 *
 * @param {number} armorEvasion суммарный уворот на броне (сет), %
 * @param {object} [modifiers]
 * @param {boolean} [modifiers.isHunter] вор
 * @param {boolean} [modifiers.hasBuff] таблетка
 * @param {number} [modifiers.inventoryEvasion] уворот от предметов в инвентаре, %
 * @param {number} [modifiers.debuff] множитель дебафов (1 — дебафов нет)
 * @param {number} [modifiers.enemyAccuracy] точность противника, доля (0.2 = 20%)
 * @returns {number} реальный уворот, %
 */
export function calcRealEvasion(
  armorEvasion,
  {
    isHunter = false,
    hasBuff = false,
    inventoryEvasion = 0,
    debuff = 1,
    enemyAccuracy = 0,
  } = {},
) {
  const ownBase =
    Math.max(RACE_BASE, (isHunter ? HUNTER_BONUS : 0) + armorEvasion / 100) +
    inventoryEvasion / 100;
  // База не уходит ниже нуля: иначе atan ниже даст ещё более отрицательное значение.
  const base = Math.max(0, ownBase * (1 - enemyAccuracy));
  const softCapped = Math.min(
    base,
    Math.atan(base * SOFT_CAP_STEEPNESS) / (Math.PI / 2),
  );
  const buff = hasBuff ? BUFF_BONUS : 0;

  return 100 * (buff + (1 - buff) * softCapped) * debuff;
}

/** Пустые уровни улучшений одного предмета: `{ bronze: 0, wolfram: 0, ... }`. */
export function createEmptyLevels() {
  return Object.fromEntries(resourceKeys.map((key) => [key, 0]));
}

/**
 * Уровень предмета и уворот, который он даёт.
 *
 * @param {Record<string, number>} levels количество улучшений каждым ресурсом
 * @returns {{ lvl: number, evasion: number }}
 */
export function calcSlotStats(levels) {
  let lvl = 0;
  let evasion = 0;

  for (const key of resourceKeys) {
    const count = levels[key] ?? 0;
    lvl += count;
    evasion += count * resources[key].percent;
  }

  return { lvl, evasion };
}

/**
 * Все суммы уворота, которых можно достичь комбинацией шагов, не превышая `limit`.
 * Значения округлены до 0.1 и отсортированы по возрастанию.
 *
 * @param {number[]} steps прирост уворота от одного улучшения каждым ресурсом
 * @param {number} limit
 * @returns {number[]}
 */
export function reachableTotals(steps, limit) {
  const totals = new Set([0]);
  const add = (a, b) => Number((a + b).toFixed(1));

  for (const step of [...steps].sort((a, b) => b - a)) {
    for (const start of [...totals]) {
      for (let x = add(start, step); x <= limit; x = add(x, step)) {
        totals.add(x);
      }
    }
  }

  return [...totals].sort((a, b) => a - b);
}

/**
 * Первая точка, после которой производная кривой падает ниже `threshold`.
 *
 * @param {{ x: number, y: number }[]} points отсортированы по x
 * @param {number} [threshold]
 * @returns {{ x: number, y: number } | null}
 */
export function findSoftCap(points, threshold = 0.1) {
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const derivative = (next.y - current.y) / (next.x - current.x);

    if (derivative < threshold) return current;
  }
  return null;
}
