import { cn } from '@/lib/utils';
import type { SpriteRef } from '@/lib/resources';

interface Props extends SpriteRef {
  /** Accessible name and tooltip; without it the icon is decorative. */
  label?: string;
  className?: string;
}

/** A 32×32 icon from the game's item sprite sheets. */
export function SpriteIcon({ x, y, isArmor, label, className }: Props) {
  return (
    <div
      className={cn('sprite', isArmor ? 'sprite-armor' : 'sprite-items', className)}
      style={{ backgroundPosition: `${x}px ${y}px` }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      title={label}
    />
  );
}
