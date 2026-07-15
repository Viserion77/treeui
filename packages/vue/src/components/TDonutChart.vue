<script setup lang="ts">
import { computed, ref } from 'vue';
import { donutSegments } from '@treeui/utils';

export interface TDonutSegment {
  /** Legend + tooltip label. */
  label: string;
  /** Slice magnitude; non-positive values are omitted. */
  value: number;
  /** Override the slice color; defaults to a chart palette token. */
  color?: string;
}

const props = withDefaults(
  defineProps<{
    /** Slices to draw, in order. */
    segments?: TDonutSegment[];
    /** Square canvas size in px. */
    size?: number;
    /** Ring thickness in px. `0` renders a full pie. */
    thickness?: number;
    /** Gap between slices, in degrees. */
    gap?: number;
    /** Round the ends of donut segments (adds a larger gap to make room). */
    rounded?: boolean;
    /** Show the legend with values. */
    showLegend?: boolean;
    /** Show each slice's percentage in the legend. */
    showPercent?: boolean;
    /** Static label under the center value (donut only). */
    centerLabel?: string;
    /** Static value shown in the center (donut only). Overrides the auto total. */
    centerValue?: string | number;
    /** Format legend + center values. */
    valueFormat?: (value: number) => string;
    /** Render skeleton placeholders instead of the chart. */
    loading?: boolean;
    /** Accessible summary of the chart. */
    ariaLabel?: string;
  }>(),
  {
    segments: () => [],
    size: 200,
    thickness: 26,
    gap: 2,
    rounded: false,
    showLegend: true,
    showPercent: true,
    centerLabel: undefined,
    centerValue: undefined,
    valueFormat: undefined,
    loading: false,
    ariaLabel: undefined,
  },
);

defineSlots<{
  center?: (props: { total: number; active: TDonutSegment | null }) => unknown;
  empty?: () => unknown;
}>();

const activeIndex = ref<number | null>(null);

const visibleSegments = computed(() => props.segments.filter((item) => item.value > 0));

const total = computed(() =>
  visibleSegments.value.reduce((sum, item) => sum + item.value, 0),
);

const hasData = computed(() => total.value > 0);

const isDonut = computed(() => props.thickness > 0);

const center = computed(() => props.size / 2);

const colorFor = (index: number, segment: TDonutSegment) =>
  segment.color ?? `var(--tree-color-chart-${(index % 8) + 1})`;

// Donut segments are drawn as stroked arcs on a mid-radius circle, so the ring
// stays perfectly smooth and gaps are one consistent width. Pie slices need a
// filled wedge to the center, so they keep the path geometry.
const geometry = computed(() => {
  const single = visibleSegments.value.length === 1;

  if (isDonut.value) {
    // Leave room for the stroke width and the hover growth so nothing clips.
    const pad = props.thickness / 2 + 3;
    const midRadius = props.size / 2 - pad;
    const circumference = 2 * Math.PI * midRadius;
    const degreeGap = (props.gap / 360) * circumference;
    const gapPx = single
      ? 0
      : props.rounded
        ? Math.max(degreeGap, props.thickness + 2)
        : Math.max(degreeGap, 2);

    let start = 0;
    return visibleSegments.value.map((item, index) => {
      const fraction = item.value / total.value;
      const length = fraction * circumference;
      const on = Math.max(0.5, length - gapPx);
      const arc = {
        mode: 'arc' as const,
        r: midRadius,
        circumference,
        dashArray: `${on} ${circumference - on}`,
        dashOffset: -start,
        color: colorFor(index, item),
        label: item.label,
        value: item.value,
        fraction,
      };
      start += length;
      return arc;
    });
  }

  const radius = props.size / 2 - 2;
  const arcs = donutSegments(
    visibleSegments.value.map((item) => item.value),
    { cx: center.value, cy: center.value, radius, innerRadius: 0, gap: single ? 0 : props.gap },
  );

  return arcs.map((arc, index) => {
    const source = visibleSegments.value[index];
    return {
      mode: 'wedge' as const,
      path: arc.path,
      fraction: arc.fraction,
      color: colorFor(index, source),
      label: source.label,
      value: source.value,
    };
  });
});

const formatValue = (value: number) => {
  if (props.valueFormat) return props.valueFormat(value);
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US');
  return `${value}`;
};

const formatPercent = (fraction: number) => `${Math.round(fraction * 100)}%`;

const activeSegment = computed(() =>
  activeIndex.value === null ? null : visibleSegments.value[activeIndex.value] ?? null,
);

const centerPrimary = computed(() => {
  if (activeSegment.value) return formatValue(activeSegment.value.value);
  if (props.centerValue !== undefined) return `${props.centerValue}`;
  return formatValue(total.value);
});

const centerSecondary = computed(() => {
  if (activeSegment.value) return activeSegment.value.label;
  return props.centerLabel ?? 'Total';
});

const resolvedLabel = computed(
  () => props.ariaLabel ?? `${isDonut.value ? 'Donut' : 'Pie'} chart with ${visibleSegments.value.length} segments`,
);

const rootClasses = computed(() => [
  't-donut-chart',
  { 'is-loading': props.loading, 'has-legend': props.showLegend },
]);
</script>

<template>
  <div :class="rootClasses">
    <div
      class="t-donut-chart__figure"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <div
        v-if="loading"
        class="t-donut-chart__skeleton"
      />

      <div
        v-else-if="!hasData"
        class="t-donut-chart__empty"
      >
        <slot name="empty">
          No data
        </slot>
      </div>

      <template v-else>
        <svg
          class="t-donut-chart__svg"
          :width="size"
          :height="size"
          :viewBox="`0 0 ${size} ${size}`"
          role="img"
          :aria-label="resolvedLabel"
        >
          <g :transform="isDonut ? `rotate(-90 ${center} ${center})` : undefined">
            <template
              v-for="(segment, index) in geometry"
              :key="index"
            >
              <circle
                v-if="segment.mode === 'arc'"
                class="t-donut-chart__segment t-donut-chart__segment--arc"
                :class="{ 'is-dimmed': activeIndex !== null && activeIndex !== index }"
                :cx="center"
                :cy="center"
                :r="segment.r"
                fill="none"
                :stroke="segment.color"
                :stroke-width="activeIndex === index ? thickness + 4 : thickness"
                :stroke-linecap="rounded ? 'round' : 'butt'"
                :stroke-dasharray="segment.dashArray"
                :stroke-dashoffset="segment.dashOffset"
                :style="{ animationDelay: `${index * 70}ms` }"
                @pointerenter="activeIndex = index"
                @pointerleave="activeIndex = null"
              />
              <path
                v-else
                class="t-donut-chart__segment t-donut-chart__segment--wedge"
                :class="{ 'is-dimmed': activeIndex !== null && activeIndex !== index }"
                :d="segment.path"
                :style="{ fill: segment.color, animationDelay: `${index * 70}ms` }"
                @pointerenter="activeIndex = index"
                @pointerleave="activeIndex = null"
              />
            </template>
          </g>
        </svg>

        <div
          v-if="isDonut"
          class="t-donut-chart__center"
        >
          <slot
            name="center"
            :total="total"
            :active="activeSegment"
          >
            <span class="t-donut-chart__center-value">{{ centerPrimary }}</span>
            <span class="t-donut-chart__center-label">{{ centerSecondary }}</span>
          </slot>
        </div>
      </template>
    </div>

    <ul
      v-if="showLegend && hasData"
      class="t-donut-chart__legend"
    >
      <li
        v-for="(segment, index) in geometry"
        :key="index"
        class="t-donut-chart__legend-item"
        :class="{ 'is-active': activeIndex === index }"
        @pointerenter="activeIndex = index"
        @pointerleave="activeIndex = null"
      >
        <span
          class="t-donut-chart__legend-swatch"
          :style="{ background: segment.color }"
          aria-hidden="true"
        />
        <span class="t-donut-chart__legend-label">{{ segment.label }}</span>
        <span class="t-donut-chart__legend-value">{{ formatValue(segment.value) }}</span>
        <span
          v-if="showPercent"
          class="t-donut-chart__legend-percent"
        >{{ formatPercent(segment.fraction) }}</span>
      </li>
    </ul>
  </div>
</template>
