import { describe, expect, it } from 'vitest';
import { migrateLegacyStorage } from '@/lib/legacy-storage';
import { storageKey } from '@/lib/storage';

const memory = (init: Record<string, string>) => {
  const m = new Map(Object.entries(init));
  return {
    m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
};

describe('migrateLegacyStorage', () => {
  it('moves the old Vue keys to the prefixed ones', () => {
    const s = memory({ isHunter: 'false', itemsLvl: '{"head":{"bronze":1}}', enemyEyeLevel: '2' });
    migrateLegacyStorage(s);
    expect(Object.fromEntries(s.m)).toEqual({
      [storageKey('hunter')]: 'false',
      [storageKey('equipment')]: '{"head":{"bronze":1}}',
      [storageKey('enemy-eye')]: '2',
    });
  });

  it('does not overwrite values saved by the new version', () => {
    const s = memory({ hasBuff: 'false', [storageKey('buff')]: 'true' });
    migrateLegacyStorage(s);
    expect(Object.fromEntries(s.m)).toEqual({ [storageKey('buff')]: 'true' });
  });
});
