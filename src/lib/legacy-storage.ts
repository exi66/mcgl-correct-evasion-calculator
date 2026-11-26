import { storageKey } from '@/lib/storage';

/**
 * Keys of the old Vue version (saved without the app prefix) → keys of `useStored`. The values were JSON already
 * (`true`, `0`, `{...}`), so they are moved as is; `useStored` validates them with its schema anyway.
 */
const LEGACY_KEYS: Record<string, string> = {
  isHunter: 'hunter',
  hasBuff: 'buff',
  itemsLvl: 'equipment',
  enemyEyeLevel: 'enemy-eye',
};

/** Moves settings saved by the old version to the new keys once. Call before the first render. */
export function migrateLegacyStorage(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage) {
  try {
    for (const [legacy, key] of Object.entries(LEGACY_KEYS)) {
      const value = storage.getItem(legacy);
      if (value === null) continue;
      if (storage.getItem(storageKey(key)) === null) storage.setItem(storageKey(key), value);
      storage.removeItem(legacy);
    }
  } catch {
    /* storage unavailable */
  }
}
