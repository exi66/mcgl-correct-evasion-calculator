import { useTranslation } from 'react-i18next';
import { ResourceCounter } from '@/components/ResourceCounter';
import { SpriteIcon } from '@/components/SpriteIcon';
import { useFormat } from '@/hooks/use-format';
import type { Levels } from '@/lib/evasion';
import { resourceKeys, resources, type ResourceKey, type SpriteRef } from '@/lib/resources';
import { cn } from '@/lib/utils';

interface Props {
  icon: SpriteRef;
  levels: Levels;
  stats: { lvl: number; evasion: number };
  onIncrease: (key: ResourceKey) => void;
  onDecrease: (key: ResourceKey) => void;
}

/** One armor item: icon, level, evasion and a counter per resource. */
export function EquipmentSlot({ icon, levels, stats, onIncrease, onDecrease }: Props) {
  const { t } = useTranslation();
  const format = useFormat();

  return (
    <div className="flex flex-row flex-wrap gap-2">
      <div className="flex size-9 items-center justify-center border">
        <SpriteIcon {...icon} />
      </div>
      <div
        className={cn(
          'hidden h-9 w-18 items-center border px-2 text-sm md:flex',
          stats.lvl > 6 && stats.lvl <= 9 && 'text-blue-500',
          stats.lvl > 9 && 'text-red-600',
        )}
      >
        {t('equipment.level', { level: stats.lvl })}
      </div>
      <div className="hidden h-9 w-18 items-center justify-end border px-2 text-sm md:flex">
        {format.fixed1(stats.evasion)}%
      </div>
      {resourceKeys.map((key) => (
        <ResourceCounter
          key={key}
          resource={resources[key]}
          count={levels[key]}
          onIncrease={() => onIncrease(key)}
          onDecrease={() => onDecrease(key)}
        />
      ))}
    </div>
  );
}
