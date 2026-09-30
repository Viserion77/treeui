import { computed, onBeforeUnmount, ref, type ComputedRef, type Ref } from 'vue';
import { treeBreakpoints, treeTokens, type TBreakpoint } from '@treeui/tokens';

/**
 * Read the current breakpoint in JavaScript.
 *
 * `TShow` and `THide` answer the same question in CSS, and they are still the
 * right tool for showing one of two arrangements of the same content: both
 * branches render, so pre-rendering and crawlers see everything and there is no
 * layout flash. What they cannot do is keep a branch from MOUNTING — a map, an
 * editor, a chart that opens a socket is paid for on a phone even though it is
 * never visible — and they cannot answer a question that is not about
 * rendering, like how many rows to request.
 *
 * So this is the escape hatch, not the default. It reads the same
 * `--tree-breakpoint-*` values the CSS classes are generated from, so the two
 * cannot drift apart.
 *
 * Server rendering: there is no `matchMedia`, so the first answer is `ssrValue`
 * (default `lg`) and the client corrects it on mount. That correction is a real
 * re-render — which is exactly why a purely visual choice belongs in `TShow`.
 */

export interface UseBreakpointOptions {
  /**
   * What `current` reports before `matchMedia` is available — during server
   * rendering and pre-rendering. Defaults to `lg`.
   */
  ssrValue?: TBreakpoint | 'base';
}

export interface UseBreakpoint {
  /** The largest breakpoint whose minimum width the viewport has reached. */
  current: ComputedRef<TBreakpoint | 'base'>;
  /** True from `name`'s minimum width up — the same boundary as `TShow at`. */
  at: (name: TBreakpoint) => boolean;
  /** True below `name`'s minimum width — the same boundary as `TShow below`. */
  below: (name: TBreakpoint) => boolean;
  /** The reactive width, in pixels. `null` until the client measures. */
  width: Ref<number | null>;
}

/** `'768px'` → `768`. The token layer only ever emits `px` here. */
const pixels = (value: string) => Number.parseFloat(value);

const MIN_WIDTH: Record<TBreakpoint, number> = Object.fromEntries(
  treeBreakpoints.map((name) => [name, pixels(treeTokens.breakpoint[name])]),
) as Record<TBreakpoint, number>;

export function useBreakpoint(options: UseBreakpointOptions = {}): UseBreakpoint {
  const { ssrValue = 'lg' } = options;

  const width = ref<number | null>(null);

  // One listener per breakpoint rather than a `resize` handler: `matchMedia`
  // fires only when a boundary is actually crossed, so a drag across the
  // viewport costs a handful of callbacks instead of one per frame.
  const queries: MediaQueryList[] = [];
  const onChange = () => {
    width.value = window.innerWidth;
  };

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    width.value = window.innerWidth;
    for (const name of treeBreakpoints) {
      const query = window.matchMedia(`(min-width: ${MIN_WIDTH[name]}px)`);
      query.addEventListener('change', onChange);
      queries.push(query);
    }
    onBeforeUnmount(() => {
      for (const query of queries) query.removeEventListener('change', onChange);
    });
  }

  const current = computed<TBreakpoint | 'base'>(() => {
    if (width.value === null) return ssrValue;
    let found: TBreakpoint | 'base' = 'base';
    for (const name of treeBreakpoints) {
      if (width.value >= MIN_WIDTH[name]) found = name;
    }
    return found;
  });

  const at = (name: TBreakpoint) =>
    width.value === null
      ? ssrValue !== 'base' && MIN_WIDTH[ssrValue] >= MIN_WIDTH[name]
      : width.value >= MIN_WIDTH[name];

  const below = (name: TBreakpoint) => !at(name);

  return { current, at, below, width };
}
