import { reactive, watch } from 'vue';
import { useTheme } from '@treeui/vue';
import type { TCardVariant, TSize } from '@treeui/vue';

/**
 * Theme mode + accent are a design-system concern, so they live in TreeUI's
 * `useTheme` rather than in this app config: it resolves `system` against the
 * OS, writes `data-tree-theme`, and re-derives the accent ramp per theme so a
 * custom brand colour stays legible in both. Created once at module scope so
 * every component shares the same controller.
 */
const theme = useTheme({
  storageKey: 'treeui-example-theme',
  defaultAccent: '#0969da',
});

export function useAppTheme() {
  return theme;
}

export interface DashboardConfig {
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

const config = reactive<DashboardConfig>(load());

watch(
  config,
  (next) => {
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
    theme.setMode('system');
    theme.setAccent('#0969da');
  };

  return { config, reset };
}
