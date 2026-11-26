import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { SpriteIcon } from '@/components/SpriteIcon';
import type { Resource } from '@/lib/resources';

interface Props {
  resource: Resource;
  count: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

/** − [icon with count] + for one resource on one item. */
export function ResourceCounter({ resource, count, onIncrease, onDecrease }: Props) {
  const { t } = useTranslation();
  const remove = t('equipment.remove', { name: resource.name });
  const add = t('equipment.add', { name: resource.name });

  return (
    <div className="flex">
      <Button
        variant="outline"
        size="icon-sm"
        className="border-r-0"
        title={remove}
        aria-label={remove}
        disabled={count === 0}
        onClick={onDecrease}
      >
        <Minus />
      </Button>
      <div className="relative flex size-9 items-center justify-center border">
        <SpriteIcon {...resource.icon} label={resource.name} />
        <span
          className="absolute inset-0 flex items-center justify-center font-semibold text-white select-none [text-shadow:0_0_2px_#000,1px_1px_0_#000]"
          aria-live="polite"
        >
          {count}
        </span>
      </div>
      <Button variant="outline" size="icon-sm" className="border-l-0" title={add} aria-label={add} onClick={onIncrease}>
        <Plus />
      </Button>
    </div>
  );
}
