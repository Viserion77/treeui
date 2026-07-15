<script setup lang="ts">
import { computed } from 'vue';
import { buildAreaPath, buildLinePath, linearScale, type ChartPoint } from '@treeui/utils';

type TSparklineType = 'line' | 'area' | 'bar';

const props = withDefaults(
  defineProps<{
    /** Values to plot, left to right. */
    data?: number[];
    /** Visual form. `area` fills under the line; `bar` draws thin columns. */
    type?: TSparklineType;
    /** Mark color. Any CSS color; defaults to the first chart token. */
    color?: string;
    /** Intrinsic width in px. */
    width?: number;
    /** Intrinsic height in px. */
    height?: number;
    /** Smooth (curved) line/area instead of straight segments. */
    smooth?: boolean;
    /** Line thickness in px (line/area only). */
    strokeWidth?: number;
    /** Force the low end of the value domain (defaults to the data min). */
    min?: number;
    /** Force the high end of the value domain (defaults to the data max). */
    max?: number;
    /** Draw a filled marker on the last point (line/area only). */
    showLastPoint?: boolean;
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
    strokeWidth: 2,
    min: undefined,
    max: undefined,
    showLastPoint: false,
    ariaLabel: undefined,
  },
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

const linePath = computed(() => buildLinePath(points.value, props.smooth));
const areaPath = computed(() =>
  buildAreaPath(points.value, props.height - inset.value, props.smooth),
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
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
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
