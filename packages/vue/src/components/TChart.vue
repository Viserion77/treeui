<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import {
  buildAreaPath,
  buildLinePath,
  linearScale,
  niceScale,
  type ChartPoint,
} from '@treeui/utils';

export type TChartType = 'line' | 'area' | 'bar';

export interface TChartSeries {
  /** Legend/tooltip name for the series. */
  name: string;
  /** One value per category, aligned to `labels`. */
  data: number[];
  /** Override the series color; defaults to a chart palette token. */
  color?: string;
}

export interface TChartActivePayload {
  index: number;
  label: string;
  values: Array<{ name: string; value: number; color: string }>;
}

const props = withDefaults(
  defineProps<{
    /** Visual form of the plot. */
    type?: TChartType;
    /** One or more data series. */
    series?: TChartSeries[];
    /** Category labels for the x-axis, aligned to each series' data. */
    labels?: string[];
    /** Plot height in px (width is fluid). */
    height?: number;
    /** Smooth (curved) line/area. */
    smooth?: boolean;
    /**
     * Stack bar series on top of each other instead of grouping side by side.
     * Negative values are clamped to 0 in stacked mode (grouped mode renders them).
     */
    stacked?: boolean;
    /** Draw horizontal gridlines. */
    showGrid?: boolean;
    /** Show the legend. Defaults to on when there is more than one series. */
    showLegend?: boolean;
    /** Show x-axis category labels. */
    showXAxis?: boolean;
    /** Show y-axis value ticks. */
    showYAxis?: boolean;
    /** Show the hover crosshair + tooltip. */
    showTooltip?: boolean;
    /** Always render markers on line/area points (not just on hover). */
    showPoints?: boolean;
    /** Target number of y-axis ticks. */
    yTicks?: number;
    /** Format axis + tooltip values. */
    valueFormat?: (value: number) => string;
    /** Force the low end of the y domain. */
    minY?: number;
    /** Force the high end of the y domain. */
    maxY?: number;
    /** Animate marks on first render (respects prefers-reduced-motion). */
    animated?: boolean;
    /** Render skeleton placeholders instead of the plot. */
    loading?: boolean;
    /** Accessible summary of the chart. */
    ariaLabel?: string;
  }>(),
  {
    type: 'line',
    series: () => [],
    labels: () => [],
    height: 260,
    smooth: false,
    stacked: false,
    showGrid: true,
    showLegend: undefined,
    showXAxis: true,
    showYAxis: true,
    showTooltip: true,
    showPoints: false,
    yTicks: 5,
    valueFormat: undefined,
    minY: undefined,
    maxY: undefined,
    animated: true,
    loading: false,
    ariaLabel: undefined,
  },
);

const emit = defineEmits<{
  'point-click': [payload: TChartActivePayload];
}>();

defineSlots<{
  legend?: (props: { series: Array<{ name: string; color: string }> }) => unknown;
  tooltip?: (props: TChartActivePayload) => unknown;
  empty?: () => unknown;
}>();

// --- measurement ----------------------------------------------------------
const canvasRef = ref<HTMLElement | null>(null);
const width = ref(640);
let observer: ResizeObserver | null = null;

onMounted(() => {
  const element = canvasRef.value;
  if (!element) return;
  width.value = element.clientWidth || width.value;

  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width;
      if (measured) width.value = measured;
    });
    observer.observe(element);
  }
});

onBeforeUnmount(() => observer?.disconnect());

// --- derived data ---------------------------------------------------------
const validSeries = computed(() => props.series.filter((item) => item.data.length > 0));

const categoryCount = computed(() =>
  Math.max(0, ...validSeries.value.map((item) => item.data.length)),
);

// Shared category index range, so the a11y table stays rectangular even when
// series have different lengths.
const axisIndices = computed(() =>
  Array.from({ length: categoryCount.value }, (_, index) => index),
);

const hasData = computed(() => validSeries.value.length > 0 && categoryCount.value > 0);

const resolvedShowLegend = computed(() =>
  props.showLegend ?? validSeries.value.length > 1,
);

const colorFor = (index: number, series: TChartSeries) =>
  series.color ?? `var(--tree-color-chart-${(index % 8) + 1})`;

const legendItems = computed(() =>
  validSeries.value.map((series, index) => ({
    name: series.name,
    color: colorFor(index, series),
  })),
);

const formatValue = (value: number) => {
  if (props.valueFormat) return props.valueFormat(value);
  if (Math.abs(value) >= 1000) return value.toLocaleString('en-US');
  return `${value}`;
};

// --- layout ---------------------------------------------------------------
const margin = computed(() => ({
  top: 12,
  right: 12,
  bottom: props.showXAxis && props.labels.length ? 28 : 10,
  left: props.showYAxis ? 44 : 10,
}));

const plot = computed(() => {
  const { top, right, bottom, left } = margin.value;
  return {
    left,
    right: width.value - right,
    top,
    bottom: props.height - bottom,
    get innerWidth() {
      return this.right - this.left;
    },
    get innerHeight() {
      return this.bottom - this.top;
    },
  };
});

const stackedTotals = computed(() => {
  if (!props.stacked || props.type !== 'bar') return [];
  return Array.from({ length: categoryCount.value }, (_, index) =>
    validSeries.value.reduce((sum, series) => sum + Math.max(0, series.data[index] ?? 0), 0),
  );
});

const scale = computed(() => {
  const baselineZero = props.type === 'bar' || props.type === 'area';
  const flat = validSeries.value.flatMap((series) => series.data);

  const source = props.stacked && props.type === 'bar' ? stackedTotals.value : flat;
  const rawMin = source.length ? Math.min(...source) : 0;
  const rawMax = source.length ? Math.max(...source) : 1;

  const min = props.minY ?? (baselineZero ? Math.min(0, rawMin) : rawMin);
  const max = props.maxY ?? Math.max(rawMax, min + 1);

  return niceScale(min, max, props.yTicks);
});

const yScale = computed(() =>
  linearScale([scale.value.min, scale.value.max], [plot.value.bottom, plot.value.top]),
);

const baselineY = computed(() => yScale.value(Math.max(scale.value.min, 0)));

// x-position helpers -------------------------------------------------------
const pointX = (index: number) => {
  const count = categoryCount.value;
  if (count <= 1) return plot.value.left + plot.value.innerWidth / 2;
  return plot.value.left + (index / (count - 1)) * plot.value.innerWidth;
};

const band = computed(() => plot.value.innerWidth / Math.max(1, categoryCount.value));
const bandCenter = (index: number) => plot.value.left + band.value * (index + 0.5);

// active category (for line/area points and axis labels)
const activeX = (index: number) =>
  props.type === 'bar' ? bandCenter(index) : pointX(index);

// --- line / area geometry -------------------------------------------------
const linePaths = computed(() =>
  props.type === 'bar'
    ? []
    : validSeries.value.map((series, seriesIndex) => {
        const points: ChartPoint[] = series.data.map((value, index) => ({
          x: pointX(index),
          y: yScale.value(value),
        }));
        return {
          color: colorFor(seriesIndex, series),
          line: buildLinePath(points, props.smooth),
          area: props.type === 'area' ? buildAreaPath(points, plot.value.bottom, props.smooth) : '',
          points,
        };
      }),
);

// --- bar geometry ---------------------------------------------------------
const BAR_MAX = 24;
const BAR_GAP = 2;

const bars = computed(() => {
  if (props.type !== 'bar') return [];
  const output: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    seriesIndex: number;
    index: number;
  }> = [];

  const bandWidth = band.value;
  const groupWidth = Math.min(bandWidth * 0.72, BAR_MAX * validSeries.value.length + BAR_GAP);

  for (let index = 0; index < categoryCount.value; index += 1) {
    const center = bandCenter(index);

    if (props.stacked) {
      const barWidth = Math.min(groupWidth, BAR_MAX);
      let cursorBottom = baselineY.value;
      validSeries.value.forEach((series, seriesIndex) => {
        const value = Math.max(0, series.data[index] ?? 0);
        // Pixel height is proportional to the segment's own value.
        const segmentHeight = baselineY.value - yScale.value(value);
        if (segmentHeight <= 0) return;
        const top = cursorBottom - segmentHeight;
        output.push({
          x: center - barWidth / 2,
          y: top,
          // Trim 2px off each segment for a surface gap between stacked marks.
          height: Math.max(0, segmentHeight - BAR_GAP),
          width: barWidth,
          color: colorFor(seriesIndex, series),
          seriesIndex,
          index,
        });
        cursorBottom = top;
      });
    } else {
      const barWidth = Math.max(1, (groupWidth - BAR_GAP * (validSeries.value.length - 1)) / validSeries.value.length);
      validSeries.value.forEach((series, seriesIndex) => {
        const value = series.data[index] ?? 0;
        const top = yScale.value(value);
        const start = center - groupWidth / 2 + seriesIndex * (barWidth + BAR_GAP);
        output.push({
          x: start,
          y: Math.min(top, baselineY.value),
          width: barWidth,
          height: Math.abs(baselineY.value - top),
          color: colorFor(seriesIndex, series),
          seriesIndex,
          index,
        });
      });
    }
  }

  return output;
});

// --- gridlines & axes -----------------------------------------------------
const gridLines = computed(() =>
  scale.value.ticks.map((tick) => ({
    value: tick,
    y: yScale.value(tick),
    label: formatValue(tick),
  })),
);

const xLabels = computed(() => {
  if (!props.showXAxis) return [];
  const count = categoryCount.value;
  const maxLabels = Math.max(2, Math.floor(plot.value.innerWidth / 52));
  const step = Math.max(1, Math.ceil(count / maxLabels));
  return props.labels.slice(0, count).map((label, index) => ({
    label,
    x: activeX(index),
    show: index % step === 0 || index === count - 1,
  }));
});

// --- interaction ----------------------------------------------------------
const activeIndex = ref<number | null>(null);

const pointerToIndex = (clientX: number) => {
  const element = canvasRef.value;
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const x = clientX - rect.left;
  const count = categoryCount.value;
  if (count === 0) return null;

  if (props.type === 'bar') {
    const index = Math.floor((x - plot.value.left) / band.value);
    return Math.min(count - 1, Math.max(0, index));
  }

  const ratio = (x - plot.value.left) / Math.max(1, plot.value.innerWidth);
  return Math.min(count - 1, Math.max(0, Math.round(ratio * (count - 1))));
};

const onPointerMove = (event: PointerEvent) => {
  if (!props.showTooltip || !hasData.value) return;
  activeIndex.value = pointerToIndex(event.clientX);
};

const onPointerLeave = () => {
  activeIndex.value = null;
};

const activePayload = computed<TChartActivePayload | null>(() => {
  const index = activeIndex.value;
  if (index === null) return null;
  return {
    index,
    label: props.labels[index] ?? `#${index + 1}`,
    values: validSeries.value.map((series, seriesIndex) => ({
      name: series.name,
      value: series.data[index] ?? 0,
      color: colorFor(seriesIndex, series),
    })),
  };
});

const tooltipStyle = computed(() => {
  const index = activeIndex.value;
  if (index === null) return {};
  const x = activeX(index);
  const clamped = Math.min(Math.max(x, 64), width.value - 64);
  return { left: `${clamped}px`, top: `${plot.value.top}px` };
});

const activeMarkers = computed(() => {
  const index = activeIndex.value;
  if (index === null || props.type === 'bar') return [];
  return linePaths.value.map((path) => ({
    x: path.points[index]?.x ?? 0,
    y: path.points[index]?.y ?? 0,
    color: path.color,
  }));
});

const onClick = () => {
  if (activePayload.value) emit('point-click', activePayload.value);
};

const resolvedLabel = computed(
  () => props.ariaLabel ?? `${props.type} chart with ${validSeries.value.length} series`,
);

const rootClasses = computed(() => [
  't-chart',
  `t-chart--${props.type}`,
  {
    'is-animated': props.animated,
    'is-loading': props.loading,
  },
]);
</script>

<template>
  <div :class="rootClasses">
    <div
      ref="canvasRef"
      class="t-chart__canvas"
      :style="{ height: `${height}px` }"
    >
      <div
        v-if="loading"
        class="t-chart__loading"
      >
        <span
          v-for="n in 5"
          :key="n"
          class="t-chart__loading-bar"
          :style="{ height: `${30 + ((n * 37) % 60)}%` }"
        />
      </div>

      <div
        v-else-if="!hasData"
        class="t-chart__empty"
      >
        <slot name="empty">
          No data to display
        </slot>
      </div>

      <template v-else>
        <svg
          class="t-chart__svg"
          :width="width"
          :height="height"
          :viewBox="`0 0 ${width} ${height}`"
          aria-hidden="true"
          @pointermove="onPointerMove"
          @pointerleave="onPointerLeave"
          @click="onClick"
        >
          <!-- gridlines + y ticks -->
          <g class="t-chart__grid">
            <template
              v-for="line in gridLines"
              :key="line.value"
            >
              <line
                v-if="showGrid"
                class="t-chart__gridline"
                :x1="plot.left"
                :x2="plot.right"
                :y1="line.y"
                :y2="line.y"
              />
              <text
                v-if="showYAxis"
                class="t-chart__axis-label t-chart__axis-label--y"
                :x="plot.left - 8"
                :y="line.y"
              >
                {{ line.label }}
              </text>
            </template>
          </g>

          <!-- area fills -->
          <g class="t-chart__areas">
            <path
              v-for="(path, index) in linePaths"
              v-show="type === 'area'"
              :key="`area-${index}`"
              class="t-chart__area"
              :d="path.area"
              :style="{ color: path.color }"
            />
          </g>

          <!-- bars -->
          <g class="t-chart__bars">
            <rect
              v-for="(bar, index) in bars"
              :key="`bar-${index}`"
              class="t-chart__bar"
              :x="bar.x"
              :y="bar.y"
              :width="bar.width"
              :height="bar.height"
              :rx="Math.min(4, bar.width / 2)"
              :style="{ color: bar.color, animationDelay: `${bar.index * 40}ms` }"
              :class="{ 'is-active': activeIndex === bar.index }"
            />
          </g>

          <!-- lines + optional static points -->
          <g class="t-chart__lines">
            <template
              v-for="(path, index) in linePaths"
              :key="`line-${index}`"
            >
              <path
                v-if="type !== 'bar'"
                class="t-chart__line"
                :d="path.line"
                path-length="1"
                :style="{ color: path.color }"
              />
              <template v-if="showPoints && type !== 'bar'">
                <circle
                  v-for="(point, pointIndex) in path.points"
                  :key="`point-${index}-${pointIndex}`"
                  class="t-chart__point"
                  :cx="point.x"
                  :cy="point.y"
                  r="3"
                  :style="{ color: path.color }"
                />
              </template>
            </template>
          </g>

          <!-- hover crosshair + active markers -->
          <g
            v-if="activeIndex !== null && showTooltip"
            class="t-chart__hover"
          >
            <line
              class="t-chart__crosshair"
              :x1="activeX(activeIndex)"
              :x2="activeX(activeIndex)"
              :y1="plot.top"
              :y2="plot.bottom"
            />
            <circle
              v-for="(marker, index) in activeMarkers"
              :key="`marker-${index}`"
              class="t-chart__marker"
              :cx="marker.x"
              :cy="marker.y"
              r="4"
              :style="{ color: marker.color }"
            />
          </g>

          <!-- x-axis labels -->
          <g
            v-if="showXAxis"
            class="t-chart__x-axis"
          >
            <text
              v-for="(item, index) in xLabels"
              v-show="item.show"
              :key="`x-${index}`"
              class="t-chart__axis-label t-chart__axis-label--x"
              :x="item.x"
              :y="height - 8"
            >
              {{ item.label }}
            </text>
          </g>
        </svg>

        <div
          v-if="showTooltip && activePayload"
          class="t-chart__tooltip"
          :style="tooltipStyle"
          role="presentation"
        >
          <slot
            name="tooltip"
            v-bind="activePayload"
          >
            <p class="t-chart__tooltip-label">
              {{ activePayload.label }}
            </p>
            <ul class="t-chart__tooltip-list">
              <li
                v-for="(item, index) in activePayload.values"
                :key="index"
                class="t-chart__tooltip-item"
              >
                <span
                  class="t-chart__tooltip-dot"
                  :style="{ background: item.color }"
                  aria-hidden="true"
                />
                <span class="t-chart__tooltip-name">{{ item.name }}</span>
                <span class="t-chart__tooltip-value">{{ formatValue(item.value) }}</span>
              </li>
            </ul>
          </slot>
        </div>
      </template>
    </div>

    <div
      v-if="resolvedShowLegend && hasData"
      class="t-chart__legend"
    >
      <slot
        name="legend"
        :series="legendItems"
      >
        <span
          v-for="(item, index) in legendItems"
          :key="index"
          class="t-chart__legend-item"
        >
          <span
            class="t-chart__legend-swatch"
            :style="{ background: item.color }"
            aria-hidden="true"
          />
          {{ item.name }}
        </span>
      </slot>
    </div>

    <!--
      Accessible data table: the chart's data as text for assistive tech.
      The visually-hidden class goes on a wrapper, not the table: a <table>
      ignores a width below its min-content, so hiding it directly leaves a
      full-width box that pushes the page's scroll width.
    -->
    <div class="t-visually-hidden">
      <table class="t-chart__a11y">
        <caption>{{ resolvedLabel }}</caption>
        <thead>
          <tr>
            <th scope="col">
              Series
            </th>
            <th
              v-for="index in axisIndices"
              :key="index"
              scope="col"
            >
              {{ labels[index] ?? '' }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in validSeries"
            :key="rowIndex"
          >
            <th scope="row">
              {{ row.name }}
            </th>
            <td
              v-for="index in axisIndices"
              :key="index"
            >
              {{ row.data[index] === undefined ? '' : formatValue(row.data[index]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
