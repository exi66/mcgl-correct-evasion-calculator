/** Ресурсы для улучшения брони: прирост уворота за одно улучшение и иконка в спрайте. */
export const resources = {
  bronze: {
    name: "Бронза",
    percent: 0.7,
    icon: { x: -352, y: -32, isArmor: false },
  },
  wolfram: {
    name: "Вольфрам",
    percent: 1.1,
    icon: { x: -320, y: -32, isArmor: false },
  },
  adamant: {
    name: "Адамантий",
    percent: 1.5,
    icon: { x: -384, y: -32, isArmor: false },
  },
};

export const resourceKeys = Object.keys(resources);

/**
 * «Следящее око» у противника: снижает базовый уворот цели на `accuracy`
 * относительно исходного значения. https://forum.minecraft-galaxy.ru/wiki/1560
 */
export const watchingEyeLevels = [
  { level: 0, label: "Нет", accuracy: 0 },
  { level: 1, label: "I (+10%)", accuracy: 0.1 },
  { level: 2, label: "II (+15%)", accuracy: 0.15 },
  { level: 3, label: "III (+20%)", accuracy: 0.2 },
];

const SPRITE_SIZE = 32;
const ARMOR_ROW_Y = -288;

const armorColumn = (x) => ({
  head: { x, y: ARMOR_ROW_Y, isArmor: true },
  body: { x, y: ARMOR_ROW_Y - SPRITE_SIZE, isArmor: true },
  legs: { x, y: ARMOR_ROW_Y - SPRITE_SIZE * 2, isArmor: true },
  feet: { x, y: ARMOR_ROW_Y - SPRITE_SIZE * 3, isArmor: true },
});

/** Иконки брони: воровской комплект и обычный. */
export const items = {
  hunter: armorColumn(-128),
  default: armorColumn(-32),
};

export const armorSlots = Object.keys(items.default);
