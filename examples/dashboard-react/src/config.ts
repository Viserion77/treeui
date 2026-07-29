import { useEffect, useState } from 'react';
import { accentCssVariables } from '@treeui/tokens';
import type { TSize } from '@treeui/react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface DashboardConfig {
  theme: ThemeMode;
  accent: string;
  density: TSize;
}

const STORAGE_KEY = 'treeui-example-dashboard-react-config';
const DARK_QUERY = '(prefers-color-scheme: dark)';

export const DEFAULTS: DashboardConfig = {
  theme: 'system',
  accent: '#0969da',
  density: 'md',
};

function load(): DashboardConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<DashboardConfig>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/**
 * The accent ramp is a design-system concern, so it comes from
 * `accentCssVariables` in @treeui/tokens rather than being derived here: it
 * walks the brand colour toward AA legibility on its own soft tint — darker in
 * light mode, lighter in dark mode — and emits `--tree-color-brand-contrast`
 * alongside the hover, soft, and focus-ring values. Because the walk is
 * mode-dependent, `system` is resolved against the OS before applying, and the
 * ramp is re-derived whenever the OS preference flips.
 */
function apply(config: DashboardConfig, systemDark: boolean) {
  const rootElement = document.documentElement;
  if (config.theme === 'system') {
    delete rootElement.dataset.treeTheme;
  } else {
    rootElement.dataset.treeTheme = config.theme;
  }

  const mode = config.theme === 'system' ? (systemDark ? 'dark' : 'light') : config.theme;

  try {
    for (const [name, value] of Object.entries(accentCssVariables(config.accent, mode))) {
      rootElement.style.setProperty(name, value);
    }
  } catch {
    // An accent restored from storage may not be a valid hex — leave the
    // active theme's own brand ramp in place rather than half-applying one.
  }
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(load);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    apply(config, systemDark);
  }, [config, systemDark]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Persisting preferences is best-effort (e.g. blocked storage).
    }
  }, [config]);

  const update = (patch: Partial<DashboardConfig>) =>
    setConfig((current) => ({ ...current, ...patch }));

  return { config, update, reset: () => setConfig(DEFAULTS) };
}
