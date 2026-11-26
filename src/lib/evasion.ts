import { resourceKeys, resources, type ResourceKey } from '@/lib/resources';

/** Thief bonus to the base (65%). */
export const HUNTER_BONUS = 0.65;
/** Race bonus. Elves are not counted, so 0. */
const RACE_BASE = 0;
/** Pill: +25% to the final evasion. */
export const BUFF_BONUS = 0.25;
/** Steepness of the soft-cap curve. */
const SOFT_CAP_STEEPNESS = 11;

export interface Modifiers {
  /** Thief. */
  isHunter?: boolean;
  /** Pill. */
  hasBuff?: boolean;
  /** Evasion from inventory items, %. */
  inventoryEvasion?: number;
  /** Debuff multiplier (1 — no debuffs). */
  debuff?: number;
  /** Enemy accuracy, fraction (0.2 = 20%). */
  enemyAccuracy?: number;
}

export type Levels = Record<ResourceKey, number>;

export interface Point {
  x: number;
  y: number;
}

/**
 * Real evasion (%) from the total armor evasion (%).
 *
 * Game formula:
 *   base    = MAX(<race>, <thief> + <set>) + <inventory>
 *   agility = (<buffs> + (1 − <buffs>) · MIN(base, ATAN(base · 11) / (π/2))) · <debuffs>
 *
 * Enemy accuracy (e.g. "Следящее око") lowers the target's base relative to the original value: at 20% a base of
 * 0.5 becomes 0.4.
 */
export function calcRealEvasion(
  armorEvasion: number,
  { isHunter = false, hasBuff = false, inventoryEvasion = 0, debuff = 1, enemyAccuracy = 0 }: Modifiers = {},
): number {
  const ownBase = Math.max(RACE_BASE, (isHunter ? HUNTER_BONUS : 0) + armorEvasion / 100) + inventoryEvasion / 100;
  // The base never goes below zero: atan below would make a negative value even more negative.
  const base = Math.max(0, ownBase * (1 - enemyAccuracy));
  const softCapped = Math.min(base, Math.atan(base * SOFT_CAP_STEEPNESS) / (Math.PI / 2));
  const buff = hasBuff ? BUFF_BONUS : 0;

  return 100 * (buff + (1 - buff) * softCapped) * debuff;
}

/** Empty upgrade levels of one item: `{ bronze: 0, wolfram: 0, ... }`. */
export function createEmptyLevels(): Levels {
  return Object.fromEntries(resourceKeys.map((key) => [key, 0])) as Levels;
}

/** Item level and the evasion it gives. Missing keys count as zero. */
export function calcSlotStats(levels: Partial<Levels>): { lvl: number; evasion: number } {
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
 * Every evasion total reachable by combining `steps` without exceeding `limit`. Values are rounded to 0.1 and
 * sorted ascending.
 */
export function reachableTotals(steps: number[], limit: number): number[] {
  const totals = new Set([0]);
  const add = (a: number, b: number) => Number((a + b).toFixed(1));

  for (const step of [...steps].sort((a, b) => b - a)) {
    for (const start of [...totals]) {
      for (let x = add(start, step); x <= limit; x = add(x, step)) {
        totals.add(x);
      }
    }
  }

  return [...totals].sort((a, b) => a - b);
}

/** The first point after which the curve's derivative drops below `threshold`. `points` are sorted by x. */
export function findSoftCap(points: Point[], threshold = 0.1): Point | null {
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const derivative = (next.y - current.y) / (next.x - current.x);

    if (derivative < threshold) return current;
  }
  return null;
}
