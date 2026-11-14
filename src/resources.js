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
