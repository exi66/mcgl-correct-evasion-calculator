# mcgl-correct-evasion-calculator

Правильный калькулятор уклонения для [mcgl.ru](https://minecraft-galaxy.ru/ru/).

Сайт: https://exi66.github.io/mcgl-correct-evasion-calculator/

## Как считается уворот

Сначала суммируется уворот со всей брони. Одно улучшение даёт:

| Ресурс    | Прирост |
| --------- | ------- |
| Бронза    | 0,7%    |
| Вольфрам  | 1,1%    |
| Адамантий | 1,5%    |

Дальше:

```
base = max(0, броня / 100 + (вор ? 0.65 : 0))
capped = min(base, atan(11 · base) / (π / 2))   // софт-кап
buff = таблетка ? 0.25 : 0
уворот = 100 · (buff + (1 − buff) · capped)
```

В игре в статах показывается округлённое значение, поэтому калькулятор выводит
и точный уворот, и округлённый. Формула лежит в
[`src/lib/evasion.js`](src/lib/evasion.js) и покрыта тестами.

## Разработка

Нужен Node.js 20.19+ или 22.12+.

```sh
npm ci
npm run dev       # дев-сервер
npm run check     # линтер + проверка форматирования + тесты
npm run format    # отформатировать код
npm run build     # сборка в dist/
```

Пуш в `main` собирает проект и публикует его на GitHub Pages через Actions.
На PR запускаются только проверки и сборка.

## Структура

- `src/lib/evasion.js` — чистые функции расчёта (формула, уровни, точки графика).
- `src/composables/useEquipment.js` — состояние калькулятора, сохраняемое в localStorage.
- `src/composables/useTheme.js` — светлая/тёмная тема по системной настройке.
- `src/components/` — компоненты калькулятора; `src/components/ui/` — сгенерированы shadcn-vue.
- `src/resources.js` — ресурсы и координаты иконок в спрайтах.
