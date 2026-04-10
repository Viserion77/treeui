<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';
import TreeSkeleton from './TreeSkeleton.vue';

defineOptions({
  inheritAttrs: false,
});

const _treeStatTones = ['neutral', 'success', 'warning', 'danger', 'info'] as const;
const _treeStatTrendDirections = ['up', 'down', 'neutral'] as const;

export type TreeStatTone = (typeof _treeStatTones)[number];
export type TreeStatTrendDirection = (typeof _treeStatTrendDirections)[number];

const props = withDefaults(
  defineProps<{
    label?: string;
    value?: string | number;
    trend?: string;
    meta?: string;
    tone?: TreeStatTone;
    trendDirection?: TreeStatTrendDirection;
    loading?: boolean;
  }>(),
  {
    label: '',
    value: '',
    trend: '',
    meta: '',
    tone: 'neutral',
    trendDirection: 'neutral',
    loading: false,
  },
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
  'tree-stat',
  `tree-stat--${props.tone}`,
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
      <div class="tree-stat__loading">
        <TreeSkeleton class="tree-stat__loading-label" />
        <TreeSkeleton class="tree-stat__loading-value" />
        <TreeSkeleton class="tree-stat__loading-trend" />
      </div>
    </template>
    <template v-else>
      <div
        v-if="$slots.icon"
        class="tree-stat__icon"
      >
        <slot name="icon" />
      </div>

      <div class="tree-stat__body">
        <div
          v-if="hasLabel || hasMeta"
          class="tree-stat__topline"
        >
          <p
            v-if="hasLabel"
            class="tree-stat__label"
          >
            <slot name="label">
              {{ label }}
            </slot>
          </p>

          <p
            v-if="hasMeta"
            class="tree-stat__meta"
          >
            <slot name="meta">
              {{ meta }}
            </slot>
          </p>
        </div>

        <div class="tree-stat__content">
          <p
            v-if="hasValue || $slots.value"
            class="tree-stat__value"
          >
            <slot name="value">
              {{ value }}
            </slot>
          </p>

          <p
            v-if="hasTrend"
            class="tree-stat__trend"
          >
            <slot name="trend">
              <span
                class="tree-stat__trend-indicator"
                aria-hidden="true"
              >
                {{ trendSymbol }}
              </span>
              <span>{{ trend }}</span>
            </slot>
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
