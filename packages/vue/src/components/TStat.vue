<script setup lang="ts">
import { computed, inject, useAttrs, useSlots } from 'vue';
import type { TSize } from '../types/contracts';
import { STAT_GROUP_INJECTION_KEY } from './stat-group-context';
import TSkeleton from './TSkeleton.vue';

defineOptions({
  inheritAttrs: false,
});

const _treeStatTones = ['neutral', 'success', 'warning', 'danger', 'info'] as const;
const _treeStatTrendDirections = ['up', 'down', 'neutral'] as const;
// Which half of the tile leads. In a dashboard the label leads, because the
// reader is scanning for WHAT is measured; on a marketing band the figure is
// the argument and the label explains it afterwards.
const _treeStatEmphases = ['label', 'value'] as const;
/* Whether the tile draws its own card. `plain` keeps the padding, the type and
   the tones and drops the border, radius, shadow and background — for a band
   of indicators that shares ONE surface. A stat has always drawn its own card,
   which inside a TCard is a card within a card: doubled frame, summed padding,
   and eight of them on a dashboard read as eight objects instead of one row of
   figures. */
const _treeStatVariants = ['card', 'plain'] as const;

export type TStatTone = (typeof _treeStatTones)[number];
export type TStatTrendDirection = (typeof _treeStatTrendDirections)[number];
export type TStatEmphasis = (typeof _treeStatEmphases)[number];
export type TStatVariant = (typeof _treeStatVariants)[number];

const props = withDefaults(
  defineProps<{
    label?: string;
    value?: string | number;
    trend?: string;
    meta?: string;
    tone?: TStatTone;
    trendDirection?: TStatTrendDirection;
    loading?: boolean;
    /**
     * Which half leads. `label` (default) is the dashboard reading: the reader
     * is scanning for what is measured. `value` puts the figure first, for a
     * marketing band where the number IS the argument — and it keeps the
     * figures of a row on one baseline, because the labels above them no longer
     * have to be the same height.
     */
    emphasis?: TStatEmphasis;
    /**
     * Density. `sm` lowers the value's floor from 1.5rem to 1.125rem and
     * tightens the padding, which is what lets two stats share a row on a
     * phone — at the default floor a formatted negative currency does not fit,
     * so a grid of six indicators collapsed into one tall column. The value
     * still scales to its card through the container query, not to the
     * viewport.
     */
    size?: TSize;
    /**
     * Where the `meta` note sits. `top` (default) shares the label's line;
     * `bottom` puts it under the value, for the reading order of an indicator
     * with a footnote — label, figure, note.
     *
     * Different from `emphasis="value"`, which promotes the FIGURE and takes
     * both the label and the note below it. Here the label still leads, which
     * is the dashboard reading; only the note moves.
     *
     * It is also a height fix. On the shared line, a long label and a long note
     * do not fit, the note wraps onto a line of its own ABOVE the value, and
     * that one tile grows — the grid then stretches the whole row to match, so
     * every sibling shows an empty band between its label and its value.
     */
    metaPlacement?: 'top' | 'bottom';
    /**
     * Whether the tile draws its own card. Defaults to `card`, except inside a
     * `TStatGroup`, which owns the surface and the hairlines between cells —
     * there the default is `plain`. Setting it explicitly always wins.
     */
    variant?: TStatVariant;
  }>(),
  {
    label: '',
    value: '',
    trend: '',
    meta: '',
    tone: 'neutral',
    trendDirection: 'neutral',
    loading: false,
    emphasis: 'label',
    size: 'md',
    metaPlacement: 'top',
    variant: undefined,
  },
);

const inGroup = inject(STAT_GROUP_INJECTION_KEY, false);

const effectiveVariant = computed<TStatVariant>(
  () => props.variant ?? (inGroup ? 'plain' : 'card'),
);

defineSlots<{
  icon?: () => unknown;
  label?: () => unknown;
  value?: () => unknown;
  trend?: () => unknown;
  meta?: () => unknown;
}>();

const attrs = useAttrs();
const slots = useSlots();

const rootClasses = computed(() => [
  't-stat',
  `t-stat--${props.tone}`,
  `t-stat--${props.size}`,
  `t-stat--emphasis-${props.emphasis}`,
  `t-stat--meta-${props.metaPlacement}`,
  `t-stat--${effectiveVariant.value}`,
  {
    'has-icon': Boolean(slots.icon) && !props.loading,
    'is-loading': props.loading,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const loadingAttrs = computed(() => ({
  ...rootAttrs.value,
  'aria-busy': props.loading || undefined,
}));

const hasValue = computed(() => props.value !== '' && props.value !== null && props.value !== undefined);
const hasTrend = computed(() => Boolean(slots.trend || props.trend));
const hasMeta = computed(() => Boolean(slots.meta || props.meta));
const hasLabel = computed(() => Boolean(slots.label || props.label));

const trendSymbol = computed(() => {
  if (props.trendDirection === 'up') {
    return '+';
  }

  if (props.trendDirection === 'down') {
    return '-';
  }

  return '•';
});
</script>

<template>
  <div
    v-bind="loadingAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <template v-if="loading">
      <div class="t-stat__loading">
        <TSkeleton class="t-stat__loading-label" />
        <TSkeleton class="t-stat__loading-value" />
        <TSkeleton class="t-stat__loading-trend" />
      </div>
    </template>
    <template v-else>
      <div
        v-if="$slots.icon"
        class="t-stat__icon"
      >
        <slot name="icon" />
      </div>

      <div class="t-stat__body">
        <div
          v-if="hasLabel || (hasMeta && metaPlacement === 'top')"
          class="t-stat__topline"
        >
          <p
            v-if="hasLabel"
            class="t-stat__label"
          >
            <slot name="label">
              {{ label }}
            </slot>
          </p>

          <p
            v-if="hasMeta && metaPlacement === 'top'"
            class="t-stat__meta"
          >
            <slot name="meta">
              {{ meta }}
            </slot>
          </p>
        </div>

        <div class="t-stat__content">
          <p
            v-if="hasValue || $slots.value"
            class="t-stat__value"
          >
            <slot name="value">
              {{ value }}
            </slot>
          </p>

          <p
            v-if="hasTrend"
            class="t-stat__trend"
          >
            <slot name="trend">
              <span
                class="t-stat__trend-indicator"
                aria-hidden="true"
              >
                {{ trendSymbol }}
              </span>
              <span>{{ trend }}</span>
            </slot>
          </p>
        </div>

        <!-- After the value, so the announced order follows the visual one:
             label, figure, note. -->
        <p
          v-if="hasMeta && metaPlacement === 'bottom'"
          class="t-stat__meta t-stat__meta--bottom"
        >
          <slot name="meta">
            {{ meta }}
          </slot>
        </p>
      </div>
    </template>
  </div>
</template>
