/** Position of an icon in a sprite sheet (background-position, px). */
export interface SpriteRef {
  x: number;
  y: number;
  isArmor: boolean;
}

export type ResourceKey = 'bronze' | 'wolfram' | 'adamant';
export type ArmorSlot = 'head' | 'body' | 'legs' | 'feet';

export interface Resource {
  /** Game name (game data, not translated). */
  name: string;
  /** Evasion from one upgrade, %. */
  percent: number;
  icon: SpriteRef;
}

/** Armor upgrade resources: evasion per upgrade and sprite icon. */
export const resources: Record<ResourceKey, Resource> = {
  bronze: { name: 'Бронза', percent: 0.7, icon: { x: -352, y: -32, isArmor: false } },
  wolfram: { name: 'Вольфрам', percent: 1.1, icon: { x: -320, y: -32, isArmor: false } },
  adamant: { name: 'Адамантий', percent: 1.5, icon: { x: -384, y: -32, isArmor: false } },
};

export const resourceKeys = Object.keys(resources) as ResourceKey[];

/** Game name of the enemy ability (game data, not translated). */
export const WATCHING_EYE_NAME = 'Следящее око';
export const WATCHING_EYE_URL = 'https://forum.minecraft-galaxy.ru/wiki/1560';

/**
 * Enemy "Следящее око": lowers the target's base evasion by `accuracy`, relative to the original value.
 * Level 0 — the enemy does not have it.
 */
export const watchingEyeLevels = [
  { level: 0, accuracy: 0 },
  { level: 1, accuracy: 0.1 },
  { level: 2, accuracy: 0.15 },
  { level: 3, accuracy: 0.2 },
] as const;

const SPRITE_SIZE = 32;
const ARMOR_ROW_Y = -288;

const armorColumn = (x: number): Record<ArmorSlot, SpriteRef> => ({
  head: { x, y: ARMOR_ROW_Y, isArmor: true },
  body: { x, y: ARMOR_ROW_Y - SPRITE_SIZE, isArmor: true },
  legs: { x, y: ARMOR_ROW_Y - SPRITE_SIZE * 2, isArmor: true },
  feet: { x, y: ARMOR_ROW_Y - SPRITE_SIZE * 3, isArmor: true },
});

/** Armor icons: the thief set and the regular one. */
export const items = {
  hunter: armorColumn(-128),
  default: armorColumn(-32),
};

export const armorSlots = Object.keys(items.default) as ArmorSlot[];
