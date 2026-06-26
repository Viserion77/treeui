<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export type TTimelineTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export interface TTimelineItem {
  id?: string | number;
  title: string;
  description?: string;
  meta?: string;
  timestamp?: string;
  datetime?: string;
  tone?: TTimelineTone;
}

const props = withDefaults(
  defineProps<{
    items?: TTimelineItem[];
    size?: TSize;
  }>(),
  {
    items: () => [],
    size: 'md',
  },
);

defineSlots<{
  marker?: (props: { item: TTimelineItem; index: number }) => unknown;
  item?: (props: { item: TTimelineItem; index: number }) => unknown;
}>();

const attrs = useAttrs();

const classes = computed(() => [
  't-timeline',
  `t-timeline--${props.size}`,
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const normalizeTone = (tone?: TTimelineTone) => tone ?? 'neutral';
const itemKey = (item: TTimelineItem, index: number) => item.id ?? `${item.title}-${index}`;
</script>

<template>
  <ol
    v-bind="rootAttrs"
    :class="classes"
    :style="rootStyle"
  >
    <li
      v-for="(item, index) in items"
      :key="itemKey(item, index)"
      class="t-timeline__item"
    >
      <div class="t-timeline__rail">
        <span
          v-if="index < items.length - 1"
          class="t-timeline__line"
          aria-hidden="true"
        />
        <div
          class="t-timeline__marker"
          :class="`t-timeline__marker--${normalizeTone(item.tone)}`"
          aria-hidden="true"
        >
          <slot
            name="marker"
            :item="item"
            :index="index"
          />
        </div>
      </div>

      <div class="t-timeline__content">
        <slot
          name="item"
          :item="item"
          :index="index"
        >
          <div
            v-if="item.meta"
            class="t-timeline__meta"
          >
            {{ item.meta }}
          </div>

          <div class="t-timeline__header">
            <p class="t-timeline__title">
              {{ item.title }}
            </p>
            <time
              v-if="item.timestamp"
              class="t-timeline__timestamp"
              :datetime="item.datetime || undefined"
            >
              {{ item.timestamp }}
            </time>
          </div>

          <p
            v-if="item.description"
            class="t-timeline__description"
          >
            {{ item.description }}
          </p>
        </slot>
      </div>
    </li>
  </ol>
</template>
