<script setup lang="ts">
import { computed } from 'vue';
import { buildAreaPath, buildLinePath, linearScale, type ChartPoint } from '@treeui/utils';
import type { ChartInterpolation } from '@treeui/utils';

type TSparklineType = 'line' | 'area' | 'bar';

const props = withDefaults(
  defineProps<{
    /** Values to plot, left to right. */
    data?: number[];
    /** Visual form. `area` fills under the line; `bar` draws thin columns. */
    type?: TSparklineType;
    /** Mark color. Any CSS color; defaults to the first chart token. */
    color?: string;
    /**
     * Intrinsic width in px, and the coordinate system the shape is drawn in.
     * With `fluid` it stops being the rendered width and stays the viewBox.
     */
    width?: number;
    /** Intrinsic height in px. */
    height?: number;
    /** Smooth (curved) line/area instead of straight segments. */
    /** @deprecated Use `interpolation`. `smooth: true` maps to `"smooth"`. */
    smooth?: boolean;
    /**
     * How consecutive points are joined. `linear` and `smooth` INTERPOLATE
     * between samples, which is wrong for a quantity that holds its value
     * across a bucket — concurrency, queue depth, a flag over time: a curve, or
     * even a diagonal, draws a state that never existed. `step` holds each
     * value until the next sample and then jumps.
     */
    interpolation?: ChartInterpolation;
    /** Line thickness in px (line/area only). */
    strokeWidth?: number;
    /** Force the low end of the value domain (defaults to the data min). */
    min?: number;
    /** Force the high end of the value domain (defaults to the data max). */
    max?: number;
    /** Draw a filled marker on the last point (line/area only). */
    showLastPoint?: boolean;
    /**
     * Fill the width of the parent instead of measuring 120px. A sparkline in a
     * card that grows with the page is a shape, not a fixed asset — without
     * this the only way to get one was a full `TChart` with axes, legend,
     * tooltip and animation all switched off. The height is unchanged: a
     * sparkline is a band, and letting it grow in both directions turns it into
     * a chart that lies about its precision.
     */
    fluid?: boolean;
    /** Accessible label. Falls back to a generic trend description. */
    ariaLabel?: string;
  }>(),
  {
    data: () => [],
    type: 'line',
    color: 'var(--tree-color-chart-1)',
    width: 120,
    height: 32,
    smooth: false,
    interpolation: undefined,
    strokeWidth: 2,
    min: undefined,
    max: undefined,
    showLastPoint: false,
    fluid: false,
    ariaLabel: undefined,
  },
);

// `smooth` predates the axis; keep it working and let `interpolation` win.
const resolvedInterpolation = computed<ChartInterpolation>(
  () => props.interpolation ?? (props.smooth ? 'smooth' : 'linear'),
);

// Inset so strokes and markers never clip against the SVG edge.
const inset = computed(() => Math.max(props.strokeWidth, props.showLastPoint ? 4 : 2));

const domain = computed<[number, number]>(() => {
  const values = props.data;
  const low = props.min ?? Math.min(...values);
  const high = props.max ?? Math.max(...values);
  // Pad a flat series so it renders as a centered line, not against an edge.
  return low === high ? [low - 1, high + 1] : [low, high];
});

const points = computed<ChartPoint[]>(() => {
  const values = props.data;
  if (values.length === 0) return [];

  const x = linearScale([0, Math.max(1, values.length - 1)], [inset.value, props.width - inset.value]);
  const y = linearScale(domain.value, [props.height - inset.value, inset.value]);

  return values.map((value, index) => ({ x: x(index), y: y(value) }));
});

const linePath = computed(() => buildLinePath(points.value, resolvedInterpolation.value));
const areaPath = computed(() =>
  buildAreaPath(points.value, props.height - inset.value, resolvedInterpolation.value),
);

const bars = computed(() => {
  const values = props.data;
  if (values.length === 0) return [];

  const y = linearScale(domain.value, [props.height - inset.value, inset.value]);
  const baseline = props.height - inset.value;
  const gap = 2;
  const slot = (props.width - inset.value * 2) / values.length;
  const barWidth = Math.max(1, slot - gap);

  return values.map((value, index) => {
    const top = y(value);
    return {
      x: inset.value + index * slot + gap / 2,
      y: top,
      width: barWidth,
      height: Math.max(1, baseline - top),
    };
  });
});

const lastPoint = computed(() => points.value[points.value.length - 1] ?? null);

const hasData = computed(() => props.data.length > 0);

const resolvedLabel = computed(() => props.ariaLabel ?? 'Trend sparkline');
</script>

<template>
  <svg
    class="t-sparkline"
    :class="{ 'is-fluid': fluid }"
    :width="fluid ? undefined : width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    :preserveAspectRatio="fluid ? 'none' : undefined"
    role="img"
    :aria-label="resolvedLabel"
    :style="{ color }"
  >
    <template v-if="hasData">
      <path
        v-if="type === 'area'"
        class="t-sparkline__area"
        :d="areaPath"
      />

      <template v-if="type === 'bar'">
        <rect
          v-for="(bar, index) in bars"
          :key="index"
          class="t-sparkline__bar"
          :x="bar.x"
          :y="bar.y"
          :width="bar.width"
          :height="bar.height"
          rx="1"
        />
      </template>

      <path
        v-else
        class="t-sparkline__line"
        :d="linePath"
        :stroke-width="strokeWidth"
        fill="none"
      />

      <circle
        v-if="showLastPoint && type !== 'bar' && lastPoint"
        class="t-sparkline__point"
        :cx="lastPoint.x"
        :cy="lastPoint.y"
        :r="Math.max(2, strokeWidth)"
      />
    </template>
  </svg>
</template>
