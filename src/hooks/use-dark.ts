import { useSyncExternalStore } from 'react';

const isDark = () => document.documentElement.classList.contains('dark');

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/**
 * Whether the `dark` class is on <html> right now. Follows the class itself, not the ThemeProvider state: the class
 * is set in an effect, so code reading CSS variables (the chart) must re-render after it changes.
 */
export function useDark() {
  return useSyncExternalStore(subscribe, isDark);
}
