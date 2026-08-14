import { canvasBackingSize } from '@treeui/utils';
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Lifecycle of a data-driven canvas.
 *
 * The sibling of `useDecorativeCanvas`, and deliberately not the same thing.
 * A decoration is a loop that must be talked out of running: gated by
 * visibility, by reduced-motion, by a coarse pointer, because an ornament that
 * animates forever behind a backgrounded tab costs a battery and buys nothing.
 * A diagram is the opposite. It holds one still image that has to be RIGHT
 * whenever it is on screen, and it changes only when the data changes — so the
 * same gating that saves a decoration silently freezes a diagram: one frame at
 * mount, and then a refetch, a locale switch or a theme flip never arrives.
 *
 * Three differences follow from that, and they are the whole composable:
 *
 *  1. **It repaints on demand, not on a clock.** `requestRedraw()` coalesces to
 *     one frame, so a hundred calls in a tick cost one paint.
 *  2. **It sizes itself from the element.** The box is CSS (`TCanvasSurface`
 *     owns it); the backing store follows it at the device ratio, capped.
 *  3. **It does not take the pointer away.** A diagram is a target: nodes get
 *     clicked and hovered. `toCanvasPoint` converts an event into the same CSS
 *     pixel space the `draw` callback paints in, so hit-testing is arithmetic
 *     the consumer no longer writes.
 *
 * SSR-safe by construction: nothing touches the DOM outside `onMounted`.
 */
export interface CanvasSurfaceFrame {
  context: CanvasRenderingContext2D;
  /** CSS pixels, not backing-store pixels — the context is already scaled. */
  width: number;
  height: number;
}

export interface CanvasSurfacePoint {
  x: number;
  y: number;
}

export interface UseCanvasSurfaceOptions {
  /**
   * Paint the whole surface. Called on mount, on resize and on every
   * `requestRedraw()`. It receives a context already scaled to CSS pixels, and
   * is expected to clear what it does not repaint.
   */
  draw: (frame: CanvasSurfaceFrame) => void;
  /** Ceiling on `devicePixelRatio`. Defaults to 2. */
  maxPixelRatio?: number;
}

export interface UseCanvasSurfaceReturn {
  canvasRef: Ref<HTMLCanvasElement | null>;
  /** Repaint once, on the next frame. Safe to call in a loop or a watcher. */
  requestRedraw: () => void;
  /** Event coordinates in the space `draw` paints in, or null before mount. */
  toCanvasPoint: (event: { clientX: number; clientY: number }) => CanvasSurfacePoint | null;
  /** Current size in CSS pixels — for a layout that has to agree with the art. */
  size: Ref<{ width: number; height: number }>;
}

export const useCanvasSurface = (options: UseCanvasSurfaceOptions): UseCanvasSurfaceReturn => {
  const { draw, maxPixelRatio = 2 } = options;

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const size = ref({ width: 0, height: 0 });

  let context: CanvasRenderingContext2D | null = null;
  let frameId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const paint = () => {
    if (!context || size.value.width === 0 || size.value.height === 0) return;
    draw({ context, width: size.value.width, height: size.value.height });
  };

  const requestRedraw = () => {
    if (frameId !== null || typeof requestAnimationFrame === 'undefined') {
      // No rAF (a test environment, a worker): paint straight away rather than
      // dropping the request, which would leave the surface showing stale data.
      if (frameId === null) paint();
      return;
    }

    frameId = requestAnimationFrame(() => {
      frameId = null;
      paint();
    });
  };

  const resize = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    size.value = { width: rect.width, height: rect.height };

    const backing = canvasBackingSize(rect.width, rect.height, window.devicePixelRatio, maxPixelRatio);
    canvas.width = backing.width;
    canvas.height = backing.height;

    context = canvas.getContext('2d');
    // Draw in CSS pixels; the ratio is the renderer's problem, not the art's.
    context?.setTransform(backing.ratio, 0, 0, backing.ratio, 0, 0);

    // Resizing a canvas clears it, so the repaint is not an optimisation.
    paint();
  };

  const toCanvasPoint = (event: { clientX: number; clientY: number }): CanvasSurfacePoint | null => {
    const canvas = canvasRef.value;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas || typeof window === 'undefined') return;

    resize();

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }
  });

  onBeforeUnmount(() => {
    if (frameId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(frameId);
    }
    frameId = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    context = null;
  });

  return { canvasRef, requestRedraw, toCanvasPoint, size };
};
