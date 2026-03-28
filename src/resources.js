export const resources = {
  bronze: {
    name: "Бронза",
    percent: 0.7,
    icon: {
      x: -352,
      y: -32,
      isArmor: false,
    },
  },
  wolfram: {
    name: "Вольфрам",
    percent: 1.1,
    icon: {
      x: -320,
      y: -32,
      isArmor: false,
    },
  },
  adamant: {
    name: "Адамантий",
    percent: 1.5,
    icon: {
      x: -384,
      y: -32,
      isArmor: false,
    },
  },
};

export const items = {
  hunter: {
    head: { x: -128, y: -288, isArmor: true },
    body: { x: -128, y: -288 - 32, isArmor: true },
    legs: { x: -128, y: -288 - 32 * 2, isArmor: true },
    feet: { x: -128, y: -288 - 32 * 3, isArmor: true },
  },
  default: {
    head: { x: -32, y: -288, isArmor: true },
    body: { x: -32, y: -288 - 32, isArmor: true },
    legs: { x: -32, y: -288 - 32 * 2, isArmor: true },
    feet: { x: -32, y: -288 - 32 * 3, isArmor: true },
  },
};

export const armorSlots = Object.keys(items.default);
