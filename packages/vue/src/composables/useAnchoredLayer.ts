import { onBeforeUnmount, ref, watch, type CSSProperties, type Ref } from 'vue';

/**
 * Position a floating panel against a trigger, in a layer that does not inherit
 * an ancestor's clipping.
 *
 * Four components asked for the same thing and each was wrong in its own way: a
 * popover inside the app shell sidebar was clipped and unreachable, a popover
 * with `align="end"` opened at a negative `left` on narrow screens, the select
 * listbox was cut off by the table wrapper's `overflow`, and the date picker
 * panel was trapped inside the modal surface. They share one cause — a panel
 * positioned `absolute` lives in its ancestor's clip and in its ancestor's
 * coordinate space — so they share one fix rather than four.
 *
 * The panel is rendered through a `<Teleport to="body">` by the caller and
 * placed with `position: fixed` from the trigger's viewport rect, which is what
 * makes both the clipping and the coordinate problems go away at once. Position
 * is recomputed on `scroll` (captured, so an inner scroller counts) and on
 * `resize`.
 *
 * What this does NOT do is follow the trigger during a CSS transform or an
 * animation: there is no rAF loop and no `IntersectionObserver`. Panels here
 * open against a settled trigger, and a loop that runs while nothing moves is a
 * cost every consumer pays for a case none of them have.
 */

/** Which edge of the trigger the panel is placed against. */
export type TAnchoredSide = 'top' | 'bottom' | 'left' | 'right';

/** How the panel lines up along the trigger's cross axis. */
export type TAnchoredAlign = 'start' | 'center' | 'end';

export interface UseAnchoredLayerOptions {
  /** Gap between trigger and panel, in pixels. */
  offset?: number;
  /** Smallest distance the panel may sit from the viewport edge, in pixels. */
  viewportPadding?: number;
  /**
   * Match the panel's width to the trigger's. The select listbox wants this;
   * the popover, whose panel sizes to its content, does not.
   */
  matchTriggerWidth?: boolean;
}

export interface UseAnchoredLayer {
  /** Bind to the panel's `style`. Empty until the first measurement. */
  style: Ref<CSSProperties>;
  /**
   * The side actually used, which is the requested one unless it did not fit.
   * Callers reflect it in a class so the arrow and the enter transition point
   * the right way.
   */
  placedSide: Ref<TAnchoredSide>;
  /** Measure and place now. Safe to call when the panel is closed (no-op). */
  update: () => void;
}

const isBlockAxis = (side: TAnchoredSide) => side === 'top' || side === 'bottom';

/** Keep `value` within `[min, max]`, preferring `min` when the span is too narrow. */
const clamp = (value: number, min: number, max: number) =>
  max < min ? min : Math.min(Math.max(value, min), max);

export function useAnchoredLayer(
  triggerRef: Ref<HTMLElement | null>,
  panelRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
  side: Ref<TAnchoredSide>,
  align: Ref<TAnchoredAlign>,
  options: UseAnchoredLayerOptions = {},
): UseAnchoredLayer {
  const { offset = 8, viewportPadding = 16, matchTriggerWidth = false } = options;

  const style = ref<CSSProperties>({});
  const placedSide = ref<TAnchoredSide>(side.value);

  const update = () => {
    const trigger = triggerRef.value;
    const panel = panelRef.value;
    if (!trigger || !panel || !isOpen.value) return;
    if (typeof window === 'undefined') return;

    const anchor = trigger.getBoundingClientRect();
    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Flip to the opposite edge when the requested one does not fit AND the
    // opposite one does. Flipping into a space that is also too small only
    // moves the problem, so in that case the requested side is kept and the
    // panel scrolls within its own max-height.
    let placed = side.value;
    if (isBlockAxis(placed)) {
      const below = vh - anchor.bottom - offset - viewportPadding;
      const above = anchor.top - offset - viewportPadding;
      if (placed === 'bottom' && rect.height > below && rect.height <= above) placed = 'top';
      else if (placed === 'top' && rect.height > above && rect.height <= below) placed = 'bottom';
    } else {
      const after = vw - anchor.right - offset - viewportPadding;
      const before = anchor.left - offset - viewportPadding;
      if (placed === 'right' && rect.width > after && rect.width <= before) placed = 'left';
      else if (placed === 'left' && rect.width > before && rect.width <= after) placed = 'right';
    }
    placedSide.value = placed;

    const width = matchTriggerWidth ? anchor.width : rect.width;
    let left: number;
    let top: number;

    if (isBlockAxis(placed)) {
      top = placed === 'bottom' ? anchor.bottom + offset : anchor.top - offset - rect.height;
      if (align.value === 'start') left = anchor.left;
      else if (align.value === 'end') left = anchor.right - width;
      else left = anchor.left + anchor.width / 2 - width / 2;
    } else {
      left = placed === 'right' ? anchor.right + offset : anchor.left - offset - width;
      if (align.value === 'start') top = anchor.top;
      else if (align.value === 'end') top = anchor.bottom - rect.height;
      else top = anchor.top + anchor.height / 2 - rect.height / 2;
    }

    // The clamp is the whole point of #35: a width that WOULD fit is not the
    // same as a position that fits. `align="end"` on a trigger away from the
    // right edge opened the panel at a negative `left`.
    left = clamp(left, viewportPadding, vw - width - viewportPadding);
    top = clamp(top, viewportPadding, vh - rect.height - viewportPadding);

    style.value = {
      position: 'fixed',
      left: `${Math.round(left)}px`,
      top: `${Math.round(top)}px`,
      ...(matchTriggerWidth ? { width: `${Math.round(width)}px` } : null),
    };
  };

  // Captured, so scrolling an ancestor that is not the document still counts —
  // a panel anchored to a trigger inside the app shell's scrolling main has to
  // move with it.
  const onViewportChange = () => update();

  const listen = () => {
    window.addEventListener('scroll', onViewportChange, true);
    window.addEventListener('resize', onViewportChange);
  };

  const unlisten = () => {
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('resize', onViewportChange);
  };

  // `flush: 'post'` so the panel is in the DOM and measurable by the time this
  // runs — the default 'pre' fires before the render that creates it.
  watch(
    isOpen,
    (open) => {
      if (typeof window === 'undefined') return;
      if (open) {
        listen();
        // Two passes. The first places the panel now, so it is never painted at
        // the wrong position for a frame. The second corrects it on the next
        // frame, once the browser has laid the panel out where it was put — a
        // panel whose height depends on its width (any wrapping content) would
        // otherwise keep a position measured from a stale rect.
        update();
        requestAnimationFrame(update);
      } else {
        unlisten();
        style.value = {};
        placedSide.value = side.value;
      }
    },
    { flush: 'post' },
  );

  watch([side, align], () => update());

  onBeforeUnmount(unlisten);

  return { style, placedSide, update };
}
