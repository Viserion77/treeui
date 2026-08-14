<script setup lang="ts">
import { computed, watch } from 'vue';
import {
  useCanvasSurface,
  type CanvasSurfaceFrame,
  type CanvasSurfacePoint,
} from '../composables/useCanvasSurface';

/**
 * A canvas that behaves like a component: it has a box, it repaints when asked,
 * and it can be clicked.
 *
 * The library already had the decorative half of this — a loop that runs only
 * while it is worth running. What was missing is the surface a DIAGRAM lives
 * on: sized by CSS instead of by imperative `style.width`, repainted on data
 * rather than on a clock, and hit-testable, because a node is a target.
 *
 * The alternative it replaces is a `<canvas>` dropped into a layout primitive,
 * where it measures 0×0 and stays blank, and five lines of imperative style to
 * rescue it.
 */
const props = withDefaults(
  defineProps<{
    /** Paint the surface. Receives a context already scaled to CSS pixels. */
    draw: (frame: CanvasSurfaceFrame) => void;
    /** Height of the box. A number is px; a string is any CSS length. */
    height?: number | string;
    /**
     * Pointer over the surface. A node's affordance cannot come from a
     * stylesheet — the sensitive area is a rectangle inside the bitmap and no
     * selector knows where it is — so it is a prop, bound to whatever the
     * consumer's hit-test just decided.
     */
    cursor?: string;
    /** Ceiling on `devicePixelRatio`. Defaults to 2. */
    maxPixelRatio?: number;
    /**
     * What the drawing says, for anyone who cannot see it. A canvas is a black
     * box to assistive technology: this is the label, and the default slot is
     * the long form — a list, a table, the same data as markup — which the
     * browser exposes and never paints.
     */
    ariaLabel?: string;
    /**
     * Repaint whenever this changes. Any value: pass the data, a version
     * counter, or the theme. Deep-watched, so an array of nodes is enough.
     */
    redrawKey?: unknown;
  }>(),
  {
    height: 320,
    cursor: undefined,
    maxPixelRatio: 2,
    ariaLabel: undefined,
    redrawKey: undefined,
  },
);

const { canvasRef, requestRedraw, toCanvasPoint, size } = useCanvasSurface({
  draw: (frame) => props.draw(frame),
  maxPixelRatio: props.maxPixelRatio,
});

watch(
  () => props.redrawKey,
  () => requestRedraw(),
  { deep: true },
);

const style = computed(() => ({
  blockSize: typeof props.height === 'number' ? `${props.height}px` : props.height,
  cursor: props.cursor,
}));

defineExpose({
  /** Repaint once, on the next frame. */
  redraw: requestRedraw,
  /** Event coordinates in the space `draw` paints in. */
  point: (event: { clientX: number; clientY: number }): CanvasSurfacePoint | null =>
    toCanvasPoint(event),
  /** Current size in CSS pixels. */
  size,
});
</script>

<template>
  <canvas
    ref="canvasRef"
    class="t-canvas-surface"
    :style="style"
    :role="ariaLabel ? 'img' : undefined"
    :aria-label="ariaLabel"
  >
    <slot />
  </canvas>
</template>
