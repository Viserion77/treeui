import { reactive, watch } from 'vue';
import type { TCardVariant, TSize } from '@treeui/vue';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface DashboardConfig {
  theme: ThemeMode;
  accent: string;
  density: TSize;
  cardVariant: TCardVariant;
  widgets: {
    stats: boolean;
    channels: boolean;
    orders: boolean;
    customer: boolean;
    alerts: boolean;
    activity: boolean;
  };
}

const STORAGE_KEY = 'treeui-example-dashboard-config';

const DEFAULTS: DashboardConfig = {
  theme: 'system',
  accent: '#0969da',
  density: 'md',
  cardVariant: 'outline',
  widgets: {
    stats: true,
    channels: true,
    orders: true,
    customer: true,
    alerts: true,
    activity: true,
  },
};

function load(): DashboardConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULTS);
    }
    const saved = JSON.parse(raw) as Partial<DashboardConfig>;
    return {
      ...structuredClone(DEFAULTS),
      ...saved,
      widgets: { ...DEFAULTS.widgets, ...saved.widgets },
    };
  } catch {
    return structuredClone(DEFAULTS);
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

function applyAccent(hex: string) {
  const rgb = hexToRgb(hex);
  const style = document.documentElement.style;
  if (!rgb) {
    for (const name of ['primary', 'hover', 'soft'] as const) {
      style.removeProperty(`--tree-color-brand-${name}`);
    }
    style.removeProperty('--tree-color-focus-ring');
    return;
  }
  const [r, g, b] = rgb;
  const hover = rgb.map((channel) => Math.round(channel * 0.8)).join(', ');
  style.setProperty('--tree-color-brand-primary', hex);
  style.setProperty('--tree-color-brand-hover', `rgb(${hover})`);
  style.setProperty('--tree-color-brand-soft', `rgba(${r}, ${g}, ${b}, 0.14)`);
  style.setProperty('--tree-color-focus-ring', `rgba(${r}, ${g}, ${b}, 0.32)`);
}

function applyTheme(mode: ThemeMode) {
  if (mode === 'system') {
    delete document.documentElement.dataset.treeTheme;
  } else {
    document.documentElement.dataset.treeTheme = mode;
  }
}

const config = reactive<DashboardConfig>(load());

watch(
  config,
  (next) => {
    applyTheme(next.theme);
    applyAccent(next.accent);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Persisting preferences is best-effort (e.g. blocked storage).
    }
  },
  { deep: true, immediate: true },
);

export function useDashboardConfig() {
  const reset = () => {
    Object.assign(config, structuredClone(DEFAULTS));
  };

  return { config, reset };
}
