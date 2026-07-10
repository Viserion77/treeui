import { useEffect, useState } from 'react';
import type { TSize } from '@treeui/react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface DashboardConfig {
  theme: ThemeMode;
  accent: string;
  density: TSize;
}

const STORAGE_KEY = 'treeui-example-dashboard-react-config';

export const DEFAULTS: DashboardConfig = {
  theme: 'system',
  accent: '#2057d4',
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

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) {
    return null;
  }
  const value = Number.parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function apply(config: DashboardConfig) {
  const rootElement = document.documentElement;
  if (config.theme === 'system') {
    delete rootElement.dataset.treeTheme;
  } else {
    rootElement.dataset.treeTheme = config.theme;
  }

  const rgb = hexToRgb(config.accent);
  if (rgb) {
    const [r, g, b] = rgb;
    const hover = rgb.map((channel) => Math.round(channel * 0.8)).join(', ');
    rootElement.style.setProperty('--tree-color-brand-primary', config.accent);
    rootElement.style.setProperty('--tree-color-brand-hover', `rgb(${hover})`);
    rootElement.style.setProperty('--tree-color-brand-soft', `rgba(${r}, ${g}, ${b}, 0.14)`);
    rootElement.style.setProperty('--tree-color-focus-ring', `rgba(${r}, ${g}, ${b}, 0.32)`);
  }
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(load);

  useEffect(() => {
    apply(config);
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
