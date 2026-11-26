# mcgl-correct-evasion-calculator — notes for the agent

Static calculator of real evasion (with the soft cap) for Minecraft Galaxy (MCGL).
Repo: github.com/exi66/mcgl-correct-evasion-calculator, site: exi66.github.io/mcgl-correct-evasion-calculator.
Made from github.com/exi66/starter (Vite + React 19 + TS + Tailwind 4 + shadcn). User docs: `README.md` (Russian).

## Commands

```
pnpm dev | build | preview | test | typecheck | lint | format | format:check
```

Check every change with `pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build` (what CI runs);
for anything visual also look at it in the browser (Playwright).

## Rules

- **The formula** lives in `src/lib/evasion.ts` (pure functions, tested in `test/evasion.test.ts`); the README
  describes it for players — keep both in sync.
- **shadcn components are generated, never hand-written or edited.** Add them with
  `pnpm dlx shadcn@latest add <name>` (preset `b5KtPvff6`, style `base-sera`, Base UI primitives) into
  `src/components/ui/`. Own components live in `src/components/`.
- **Theme comes from the starter** (`@exi/theme`). Never edit the theme part of `src/index.css` (everything above the
  "project styles" comment); change it in the starter and reinstall with
  `pnpm dlx shadcn@latest add @exi/theme --overwrite`. Project CSS (sprites) goes below that comment.
- **Russian only.** UI strings still go through `t()` (`src/messages/ru.json`); `en.json` is an empty placeholder, so
  there is no language switch. Not translated at all: game data (resource names, "Следящее око").
- `src/lib/i18n.ts`, `src/lib/storage.ts`, `src/hooks/use-stored.ts` and `theme-provider.tsx` come from the starter —
  keep them identical to it.
- Settings: `useStored` → localStorage `mcgl-evasion:<key>` (`src/lib/app.ts`), validated with zod.
  `src/lib/legacy-storage.ts` moves the old Vue version's unprefixed keys (`isHunter`, `hasBuff`, `itemsLvl`,
  `enemyEyeLevel`) once on startup.
- The chart (chart.js) reads theme colors from CSS variables; `useDark()` re-renders it after the `dark` class changes.
- After `pnpm add`, check `pnpm-workspace.yaml` for `minimumReleaseAgeExclude` entries and remove them.
- Commit only when asked. CI (`.github/workflows/ci.yml`) runs on pushes/PRs to `main`; tags `v*` deploy to GitHub
  Pages (`.github/workflows/pages.yml`, runs CI first). Package manager: pnpm.
