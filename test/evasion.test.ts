import { describe, expect, it } from 'vitest';
import { calcRealEvasion, calcSlotStats, createEmptyLevels, findSoftCap, reachableTotals } from '@/lib/evasion';

/** Эталон: формула в исходном виде, как она была в App.vue (без эльфа). */
function reference(total: number, { isHunter, hasBuff }: { isHunter: boolean; hasBuff: boolean }) {
  const base = Math.max(0, total / 100 + (isHunter ? 0.65 : 0));
  const buff = hasBuff ? 0.25 : 0;
  return (1000 * (buff + (1 - buff) * Math.min(base, Math.atan(base * 11) / (Math.PI / 2)))) / 10;
}

describe('calcRealEvasion', () => {
  it('без брони и модификаторов уворот 0', () => {
    expect(calcRealEvasion(0)).toBe(0);
  });

  it('таблетка даёт 25% даже без брони', () => {
    expect(calcRealEvasion(0, { hasBuff: true })).toBeCloseTo(25);
  });

  it('отрицательный уворот на броне не опускает результат ниже нуля', () => {
    expect(calcRealEvasion(-10)).toBe(0);
    expect(calcRealEvasion(-80, { isHunter: true })).toBe(0);
    expect(calcRealEvasion(-10, { hasBuff: true })).toBeCloseTo(25);
  });

  it('отрицательный уворот снижает бонус вора', () => {
    expect(calcRealEvasion(-10, { isHunter: true })).toBeCloseTo(55);
  });

  describe('точность противника (Следящее око)', () => {
    it('снижает базу относительно: 50% → 40% при 20%', () => {
      // База 0.5 и 0.4 ниже софт-капа, поэтому уворот равен базе.
      expect(calcRealEvasion(50)).toBeCloseTo(50);
      expect(calcRealEvasion(50, { enemyAccuracy: 0.2 })).toBeCloseTo(40);
    });

    it('применяется к базе до софт-капа, а не к итогу', () => {
      const base = (0.65 + 0.4) * (1 - 0.15);
      const expected = 100 * Math.min(base, Math.atan(base * 11) / (Math.PI / 2));
      expect(calcRealEvasion(40, { isHunter: true, enemyAccuracy: 0.15 })).toBeCloseTo(expected, 10);
    });

    it('не затрагивает таблетку', () => {
      expect(calcRealEvasion(0, { hasBuff: true, enemyAccuracy: 0.2 })).toBeCloseTo(25);
      expect(calcRealEvasion(20, { hasBuff: true, enemyAccuracy: 0.2 })).toBeCloseTo(25 + 0.75 * 16);
    });
  });

  it('инвентарь прибавляется к базе вне MAX', () => {
    expect(calcRealEvasion(10, { inventoryEvasion: 5 })).toBeCloseTo(calcRealEvasion(15));
    // Отрицательный сет обнуляется в MAX(раса, ...), инвентарь всё равно добавляется.
    expect(calcRealEvasion(-30, { inventoryEvasion: 5 })).toBeCloseTo(5);
  });

  it('дебафы умножают итог', () => {
    const full = calcRealEvasion(20, { isHunter: true, hasBuff: true });
    expect(calcRealEvasion(20, { isHunter: true, hasBuff: true, debuff: 0.5 })).toBeCloseTo(full / 2);
  });

  it('никогда не достигает 100%', () => {
    const max = calcRealEvasion(1000, { isHunter: true, hasBuff: true });
    expect(max).toBeLessThan(100);
    expect(max).toBeGreaterThan(99);
  });

  it('монотонно растёт', () => {
    let prev = -Infinity;
    for (let total = 0; total <= 200; total += 0.1) {
      const value = calcRealEvasion(total, { isHunter: true, hasBuff: true });
      expect(value).toBeGreaterThanOrEqual(prev);
      prev = value;
    }
  });

  it.each([
    [0, { isHunter: false, hasBuff: false }],
    [10, { isHunter: false, hasBuff: false }],
    [33.3, { isHunter: true, hasBuff: false }],
    [33.3, { isHunter: true, hasBuff: true }],
    [5, { isHunter: false, hasBuff: true }],
    [80, { isHunter: true, hasBuff: true }],
    [150, { isHunter: false, hasBuff: true }],
    [-10, { isHunter: false, hasBuff: false }],
    [-30, { isHunter: true, hasBuff: true }],
  ])('совпадает с исходной формулой: %s %o', (total, mods) => {
    expect(calcRealEvasion(total, mods)).toBeCloseTo(reference(total, mods), 10);
  });
});

describe('calcSlotStats', () => {
  it('пустой предмет', () => {
    expect(calcSlotStats(createEmptyLevels())).toEqual({ lvl: 0, evasion: 0 });
  });

  it('суммирует уровни и уворот', () => {
    const stats = calcSlotStats({ bronze: 2, wolfram: 1, adamant: 3 });
    expect(stats.lvl).toBe(6);
    expect(stats.evasion).toBeCloseTo(2 * 0.7 + 1.1 + 3 * 1.5);
  });

  it('отсутствующие ключи считаются нулём', () => {
    expect(calcSlotStats({ adamant: 1 })).toEqual({ lvl: 1, evasion: 1.5 });
  });
});

describe('reachableTotals', () => {
  it('содержит только достижимые суммы', () => {
    expect(reachableTotals([1.5], 5)).toEqual([0, 1.5, 3, 4.5]);
  });

  it('комбинирует шаги и не превышает лимит', () => {
    const totals = reachableTotals([0.7, 1.1], 2.5);
    expect(totals).toEqual([0, 0.7, 1.1, 1.4, 1.8, 2.1, 2.2, 2.5]);
  });

  it('совпадает с исходным алгоритмом графика', () => {
    const steps = [0.7, 1.1, 1.5];
    const limit = 100;
    const expected = new Set([0]);
    [...steps]
      .sort((a, b) => b - a)
      .forEach((step) => {
        Array.from(expected).forEach((x) => {
          let nextX = x;
          while (nextX + step <= limit) {
            nextX = Number((nextX + step).toFixed(1));
            expected.add(nextX);
          }
        });
      });

    expect(reachableTotals(steps, limit)).toEqual([...expected].sort((a, b) => a - b));
  });
});

describe('findSoftCap', () => {
  it('находит точку, где производная падает ниже порога', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1.05 },
      { x: 3, y: 1.06 },
    ];
    expect(findSoftCap(points)).toEqual({ x: 1, y: 1 });
  });

  it('возвращает null, если кривая не выполаживается', () => {
    expect(
      findSoftCap([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toBeNull();
  });
});
