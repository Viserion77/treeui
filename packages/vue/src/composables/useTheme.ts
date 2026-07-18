import {
  computed,
  getCurrentScope,
  onScopeDispose,
  ref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue';
import { accentCssVariables } from '@treeui/tokens';

export type TThemeMode = 'system' | 'light' | 'dark';
export type TResolvedTheme = 'light' | 'dark';

const ACCENT_VARIABLES = [
  '--tree-color-brand-primary',
  '--tree-color-brand-hover',
  '--tree-color-brand-soft',
  '--tree-color-brand-contrast',
  '--tree-color-focus-ring',
] as const;

export interface UseThemeOptions {
  /** localStorage key for the persisted preference. `null` disables persistence. */
  storageKey?: string | null;
  /** Mode to start from when nothing is persisted. */
  defaultMode?: TThemeMode;
  /** Accent color (hex) to start from. `null` keeps the theme's own brand color. */
  defaultAccent?: string | null;
  /** Element the `data-tree-theme` attribute and accent variables are written to. */
  target?: HTMLElement | null;
}

export interface UseThemeReturn {
  /** Requested mode — `system` follows the OS. Writable. */
  mode: Ref<TThemeMode>;
  /** The concrete theme in effect (`system` resolved against the OS). */
  resolved: ComputedRef<TResolvedTheme>;
  /** Accent color override, or `null` for the theme's own brand. Writable. */
  accent: Ref<string | null>;
  setMode: (value: TThemeMode) => void;
  setAccent: (value: string | null) => void;
}

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const readStored = (key: string | null): { mode?: TThemeMode; accent?: string | null } => {
  if (!key || !isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as { mode?: TThemeMode; accent?: string | null }) : {};
  } catch {
    // Storage can be blocked (private mode, disabled cookies) — preferences are
    // best-effort, so fall back to defaults rather than failing to render.
    return {};
  }
};

/**
 * Theme-mode + accent controller for an app root.
 *
 * Owns the parts of theming that belong to the design system rather than the
 * app: resolving `system` against the OS, writing `data-tree-theme`, persisting
 * the choice, and — crucially — re-deriving a custom accent whenever the active
 * theme flips, so a mid-tone brand color stays legible in both themes.
 *
 * @example
 * const { mode, resolved, accent } = useTheme({ storageKey: 'my-app-theme' });
 * mode.value = 'dark';
 * accent.value = '#0969da';
 */
export const useTheme = (options: UseThemeOptions = {}): UseThemeReturn => {
  const {
    storageKey = 'treeui-theme',
    defaultMode = 'system',
    defaultAccent = null,
    target,
  } = options;

  const stored = readStored(storageKey);

  const mode = ref<TThemeMode>(stored.mode ?? defaultMode);
  const accent = ref<string | null>(stored.accent ?? defaultAccent);
  const systemDark = ref(false);

  let query: MediaQueryList | null = null;
  const onSystemChange = (event: MediaQueryListEvent | MediaQueryList) => {
    systemDark.value = event.matches;
  };

  if (isBrowser() && typeof window.matchMedia === 'function') {
    query = window.matchMedia('(prefers-color-scheme: dark)');
    systemDark.value = query.matches;
    query.addEventListener?.('change', onSystemChange);
  }

  const resolved = computed<TResolvedTheme>(() => {
    if (mode.value === 'system') {
      return systemDark.value ? 'dark' : 'light';
    }
    return mode.value;
  });

  const element = () => target ?? (isBrowser() ? document.documentElement : null);

  const applyTheme = () => {
    const el = element();
    if (!el) {
      return;
    }

    el.dataset.treeTheme = resolved.value;

    // Re-derive on every theme flip: the same accent hex needs a different ramp
    // in light vs dark to stay readable.
    if (accent.value) {
      const variables = accentCssVariables(accent.value, resolved.value);
      for (const [name, value] of Object.entries(variables)) {
        el.style.setProperty(name, value);
      }
    } else {
      for (const name of ACCENT_VARIABLES) {
        el.style.removeProperty(name);
      }
    }
  };

  const persist = () => {
    if (!storageKey || !isBrowser()) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ mode: mode.value, accent: accent.value }),
      );
    } catch {
      // Persisting preferences is best-effort.
    }
  };

  watch([resolved, accent], applyTheme, { immediate: true });
  watch([mode, accent], persist);

  // Guarded so the composable can also be created once at module scope, which
  // is how apps share a single theme controller across components.
  if (getCurrentScope()) {
    onScopeDispose(() => {
      query?.removeEventListener?.('change', onSystemChange);
      query = null;
    });
  }

  return {
    mode,
    resolved,
    accent,
    setMode: (value: TThemeMode) => {
      mode.value = value;
    },
    setAccent: (value: string | null) => {
      accent.value = value;
    },
  };
};
