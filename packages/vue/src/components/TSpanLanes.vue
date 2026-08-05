<script setup lang="ts">
import { computed } from 'vue';
import { clamp } from '@treeui/utils';

export type TSpanTone = 'default' | 'danger' | 'success' | 'warning' | 'info';

export interface TSpan {
  start: number;
  end: number;
  tone?: TSpanTone;
  /** Native tooltip on the bar. Product copy, so it is localizable. */
  title?: string;
}

export interface TSpanLane {
  label: string;
  spans: TSpan[];
  /** Accessible summary of the lane, e.g. "auth: 12 invocations, 1 failed". */
  description?: string;
}

/**
 * Horizontal lanes on a shared time axis (TREEUX-003).
 *
 * One row per subject, N bars positioned by start/duration inside the same
 * `from`/`to` window — which is how "what ran in parallel" becomes legible.
 * Nothing else in the library expresses it: `TTimeline` is vertical and ordered
 * by event rather than positioned by time, and `TChart`/`TSparkline` take
 * `data: number[]` aligned to `labels`, which cannot place anything.
 */
const props = withDefaults(
  defineProps<{
    rows: TSpanLane[];
    /** Start of the window, in the same unit as the spans (ms, seconds, index). */
    from: number;
    /** End of the window. Must be greater than `from`. */
    to: number;
    /** Height of one lane. */
    laneHeight?: number;
    /** Accessible name of the whole chart. */
    label?: string;
    /**
     * Minimum visible width of a bar, as a percentage of the window. A 3ms
     * invocation in a 60s window is otherwise a zero-width rectangle: present in
     * the data, invisible on screen.
     */
    minSpanPercent?: number;
  }>(),
  {
    laneHeight: 20,
    label: undefined,
    minSpanPercent: 0.4,
  },
);

defineSlots<{
  /**
   * Non-colour marker for a span, drawn on top of the bar. Failure must never
   * be encoded by colour alone: `--tree-color-status-success` and
   * `--tree-color-status-error` sit at ΔE 4.4 under deuteranopia, so a red bar
   * and a green bar are the same bar for some readers.
   */
  marker?: (props: { span: TSpan; row: TSpanLane }) => unknown;
  /** Replaces the lane label. */
  label?: (props: { row: TSpanLane }) => unknown;
}>();

const span = computed(() => Math.max(props.to - props.from, 1));

const geometry = (item: TSpan) => {
  const left = clamp(((item.start - props.from) / span.value) * 100, 0, 100);
  const rawWidth = ((item.end - item.start) / span.value) * 100;
  const width = Math.max(rawWidth, props.minSpanPercent);

  return {
    insetInlineStart: `${left}%`,
    // Never spill past the window: the floor is applied AFTER the clamp, so a
    // short span at the very end shrinks instead of overflowing the lane.
    inlineSize: `${Math.min(width, 100 - left)}%`,
  };
};
</script>

<template>
  <div
    class="t-span-lanes"
    role="group"
    :aria-label="label"
  >
    <div
      v-for="row in rows"
      :key="row.label"
      class="t-span-lanes__lane"
      :style="{ '--tree-span-lane-height': `${laneHeight}px` }"
    >
      <span class="t-span-lanes__label">
        <slot
          name="label"
          :row="row"
        >{{ row.label }}</slot>
      </span>
      <div
        class="t-span-lanes__track"
        role="img"
        :aria-label="row.description ?? row.label"
      >
        <span
          v-for="(item, index) in row.spans"
          :key="index"
          class="t-span-lanes__span"
          :class="item.tone && item.tone !== 'default' ? `t-span-lanes__span--${item.tone}` : null"
          :style="geometry(item)"
          :title="item.title"
        >
          <slot
            name="marker"
            :span="item"
            :row="row"
          />
        </span>
      </div>
    </div>
  </div>
</template>
