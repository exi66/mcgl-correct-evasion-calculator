import { watch } from "vue";
import { createSharedComposable, usePreferredDark } from "@vueuse/core";

/**
 * Тема по системной настройке: переключает класс `dark` на <html>.
 * Класс переключается синхронно, чтобы computed, читающие CSS-переменные,
 * уже видели новые значения.
 */
export const useTheme = createSharedComposable(() => {
  const isDark = usePreferredDark();

  watch(
    isDark,
    (dark) => document.documentElement.classList.toggle("dark", dark),
    { immediate: true, flush: "sync" },
  );

  return { isDark };
});
