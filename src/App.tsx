import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EquipmentSlot } from '@/components/EquipmentSlot';
import { EvasionChart } from '@/components/EvasionChart';
import { SpriteIcon } from '@/components/SpriteIcon';
import { useDark } from '@/hooks/use-dark';
import { useEquipment } from '@/hooks/use-equipment';
import { useFormat } from '@/hooks/use-format';
import { cn } from '@/lib/utils';
import {
  WATCHING_EYE_NAME,
  WATCHING_EYE_URL,
  armorSlots,
  resourceKeys,
  resources,
  watchingEyeLevels,
} from '@/lib/resources';

const ROMAN = ['', 'I', 'II', 'III'];

function Section({ title, className, children }: { title: ReactNode; className?: string; children: ReactNode }) {
  return (
    <fieldset className={cn('min-w-0 border p-4', className)}>
      <legend className="px-2">{title}</legend>
      {children}
    </fieldset>
  );
}

export default function App() {
  const { t } = useTranslation();
  const { setTheme } = useTheme();
  const dark = useDark();
  const themeLabel = dark ? t('theme.light') : t('theme.dark');
  const format = useFormat();
  const calc = useEquipment();

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  const toggles = [
    { id: 'hunter', label: t('base.hunter'), checked: calc.isHunter, set: calc.setHunter },
    { id: 'buff', label: t('base.buff'), checked: calc.hasBuff, set: calc.setBuff },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center gap-4 border-b bg-card px-3 py-2">
        <h1 className="min-w-0 truncate font-medium">{t('app.title')}</h1>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={themeLabel}
            aria-label={themeLabel}
            onClick={() => setTheme(dark ? 'light' : 'dark')}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <main className="container mx-auto flex flex-col gap-2 p-2">
        <Section title={t('base.title')}>
          <div className="flex flex-wrap gap-6">
            {toggles.map((toggle) => (
              <div key={toggle.id} className="flex items-center gap-2">
                <Checkbox id={toggle.id} checked={toggle.checked} onCheckedChange={(v) => toggle.set(v)} />
                <Label htmlFor={toggle.id}>{toggle.label}</Label>
              </div>
            ))}
          </div>
        </Section>

        <Section title={t('enemy.title')}>
          <div className="flex flex-wrap items-center gap-2">
            <a
              id="enemy-eye-label"
              href={WATCHING_EYE_URL}
              target="_blank"
              rel="noopener"
              className="text-sm underline-offset-4 hover:underline"
            >
              {WATCHING_EYE_NAME}:
            </a>
            <ToggleGroup
              aria-labelledby="enemy-eye-label"
              variant="outline"
              size="sm"
              spacing={1}
              value={[String(calc.enemyEyeLevel)]}
              onValueChange={([value]) => {
                // Pressing the selected item again empties the group: the current level stays then.
                const eye = watchingEyeLevels.find((e) => String(e.level) === value);
                if (eye) calc.setEnemyEyeLevel(eye.level);
              }}
              className="flex-wrap"
            >
              {watchingEyeLevels.map((eye) => (
                <ToggleGroupItem
                  key={eye.level}
                  value={String(eye.level)}
                  className="aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  {eye.level === 0 ? t('enemy.none') : `${ROMAN[eye.level]} (+${eye.accuracy * 100}%)`}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </Section>

        <Section title={t('equipment.title')}>
          <div className="flex flex-col gap-2">
            {armorSlots.map((slot) => (
              <EquipmentSlot
                key={slot}
                icon={calc.armorItems[slot]}
                levels={calc.equipment[slot]}
                stats={calc.slotStats[slot]}
                onIncrease={(key) => calc.increaseLevel(slot, key)}
                onDecrease={(key) => calc.decreaseLevel(slot, key)}
              />
            ))}
          </div>
          <Button className="mt-2" size="sm" onClick={calc.resetEquipment}>
            {t('equipment.reset')}
          </Button>
        </Section>

        <div className="grid grid-cols-6 gap-2">
          <Section title={t('result.title')} className="col-span-6 lg:col-span-2">
            <div className="flex flex-col gap-1 text-sm">
              <span>{t('result.real', { value: format.exact(calc.realEvasion) })}</span>
              <span>{t('result.stats', { value: format.exact(Math.round(calc.statsEvasion)) })}</span>
              <span>{t('result.nextUpgrade')}</span>
              <div className="mt-1 flex flex-col gap-2">
                {resourceKeys.map((key) => (
                  <div key={key} className="flex flex-row items-center gap-2">
                    <div className="flex size-9 items-center justify-center border">
                      <SpriteIcon {...resources[key].icon} label={resources[key].name} />
                    </div>
                    <span>+{format.exact(calc.nextUpgradeGain[key])}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section title={t('chart.title')} className="col-span-6 lg:col-span-4">
            <EvasionChart current={calc.totalEvasion} modifiers={calc.modifiers} />
          </Section>
        </div>
      </main>
    </div>
  );
}
