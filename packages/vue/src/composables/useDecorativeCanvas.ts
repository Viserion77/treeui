import { canvasBackingSize } from '@treeui/utils';
import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Lifecycle of a decorative canvas.
 *
 * Two independent ornaments in one repository — a hero wave and a presence orb —
 * discovered the same ~90 lines of trap by measuring. None of it is about
 * particles; all of it is about how a decorative canvas has to behave:
 *
 *  1. **It does not run when it cannot be seen.** Not under
 *     `prefers-reduced-motion`, not on a coarse pointer, not while the tab is
 *     in the background, not while it is outside the viewport. An animation
 *     that never settles holds a `requestAnimationFrame` open forever behind
 *     somebody's spreadsheet.
 *  2. **The backing store follows the element.** A fixed buffer stretched to
 *     fit squashes every point into a smear.
 *  3. **It never steals a pointer event.** The canvas is `pointer-events: none`
 *     and the host element is what listens, or a click on the CTA dies in the
 *     ornament.
 *  4. **It unmounts clean.** Frame cancelled, every listener and observer
 *     released.
 *
 * SSR-safe by construction: nothing here touches `matchMedia`,
 * `IntersectionObserver` or `document` outside `onMounted`, because the surface
 * that needs it most is pre-rendered — the gating running at import is exactly
 * the bug the SSR smoke test closed.
 */
export interface DecorativeCanvasFrame {
  context: CanvasRenderingContext2D;
  /** CSS pixels, not backing-store pixels — the context is already scaled. */
  width: number;
  height: number;
  /** Seconds since the first frame. Pauses while the animation is suspended. */
  time: number;
  /** Seconds since the previous frame, clamped by the caller's maths. */
  delta: number;
}

export interface UseDecorativeCanvasOptions {
  /** Called once per frame. Keep it pure of DOM reads. */
  draw: (frame: DecorativeCanvasFrame) => void;
  /** Ceiling on `devicePixelRatio`. Defaults to 2. */
  maxPixelRatio?: number;
  /**
   * Run a single frame instead of none when motion is unwanted, so the canvas
   * shows a composed still rather than going blank. Defaults to `true`.
   */
  staticFrameWhenReduced?: boolean;
}

export interface UseDecorativeCanvasReturn {
  canvasRef: Ref<HTMLCanvasElement | null>;
  /** Whether the loop is currently running — for a debug badge or a test. */
  isRunning: Ref<boolean>;
}

export const useDecorativeCanvas = (
  options: UseDecorativeCanvasOptions,
): UseDecorativeCanvasReturn => {
  const { draw, maxPixelRatio = 2, staticFrameWhenReduced = true } = options;

  const canvasRef = ref<HTMLCanvasElement | null>(null);
  const isRunning = ref(false);

  let context: CanvasRenderingContext2D | null = null;
  let frameId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let reducedMotionQuery: MediaQueryList | null = null;
  let coarsePointerQuery: MediaQueryList | null = null;

  let cssWidth = 0;
  let cssHeight = 0;
  let startedAt = 0;
  let lastFrameAt = 0;
  let elapsed = 0;
  let isVisible = false;

  const prefersReducedMotion = () => Boolean(reducedMotionQuery?.matches);
  const hasCoarsePointer = () => Boolean(coarsePointerQuery?.matches);
  const isTabVisible = () => typeof document === 'undefined' || !document.hidden;

  const shouldAnimate = () =>
    isVisible && isTabVisible() && !prefersReducedMotion() && !hasCoarsePointer();

  const paint = (time: number, delta: number) => {
    if (!context || cssWidth === 0 || cssHeight === 0) return;
    draw({ context, width: cssWidth, height: cssHeight, time, delta });
  };

  const step = (now: number) => {
    if (!shouldAnimate()) {
      stop();
      return;
    }

    const delta = lastFrameAt === 0 ? 0 : (now - lastFrameAt) / 1000;
    lastFrameAt = now;
    elapsed = (now - startedAt) / 1000;

    paint(elapsed, delta);
    frameId = requestAnimationFrame(step);
  };

  const start = () => {
    if (frameId !== null || !context) return;

    if (!shouldAnimate()) {
      // Composed still: the ornament exists, it simply does not move.
      if (staticFrameWhenReduced) paint(elapsed, 0);
      return;
    }

    isRunning.value = true;
    // Resume where it paused, so a backgrounded tab does not jump on return.
    startedAt = performance.now() - elapsed * 1000;
    lastFrameAt = 0;
    frameId = requestAnimationFrame(step);
  };

  const stop = () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    isRunning.value = false;
  };

  const resize = () => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;

    const backing = canvasBackingSize(cssWidth, cssHeight, window.devicePixelRatio, maxPixelRatio);
    canvas.width = backing.width;
    canvas.height = backing.height;

    context = canvas.getContext('2d');
    // Draw in CSS pixels; the ratio is the renderer's problem, not the art's.
    context?.setTransform(backing.ratio, 0, 0, backing.ratio, 0, 0);

    // Repaint immediately: a resize with the loop stopped would otherwise leave
    // a cleared canvas until something else woke it.
    if (frameId === null) paint(elapsed, 0);
  };

  const onVisibilityChange = () => {
    if (shouldAnimate()) start();
    else stop();
  };

  onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas || typeof window === 'undefined') return;

    reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    coarsePointerQuery = window.matchMedia?.('(pointer: coarse)') ?? null;

    resize();

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver((entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
        onVisibilityChange();
      });
      intersectionObserver.observe(canvas);
    } else {
      isVisible = true;
      onVisibilityChange();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotionQuery?.addEventListener?.('change', onVisibilityChange);
    coarsePointerQuery?.addEventListener?.('change', onVisibilityChange);
  });

  onBeforeUnmount(() => {
    stop();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
    reducedMotionQuery?.removeEventListener?.('change', onVisibilityChange);
    coarsePointerQuery?.removeEventListener?.('change', onVisibilityChange);
    resizeObserver = null;
    intersectionObserver = null;
    reducedMotionQuery = null;
    coarsePointerQuery = null;
    context = null;
  });

  return { canvasRef, isRunning };
};
