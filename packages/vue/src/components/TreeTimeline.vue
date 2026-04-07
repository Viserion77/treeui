<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import type { TreeSize } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

export type TreeTimelineTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

export interface TreeTimelineItem {
  id?: string | number;
  title: string;
  description?: string;
  meta?: string;
  timestamp?: string;
  datetime?: string;
  tone?: TreeTimelineTone;
}

const props = withDefaults(
  defineProps<{
    items?: TreeTimelineItem[];
    size?: TreeSize;
  }>(),
  {
    items: () => [],
    size: 'md',
  },
);

defineSlots<{
  marker?: (props: { item: TreeTimelineItem; index: number }) => unknown;
  item?: (props: { item: TreeTimelineItem; index: number }) => unknown;
}>();

const attrs = useAttrs();

const classes = computed(() => [
  'tree-timeline',
  `tree-timeline--${props.size}`,
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const normalizeTone = (tone?: TreeTimelineTone) => tone ?? 'neutral';
const itemKey = (item: TreeTimelineItem, index: number) => item.id ?? `${item.title}-${index}`;
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
      class="tree-timeline__item"
    >
      <div class="tree-timeline__rail">
        <span
          v-if="index < items.length - 1"
          class="tree-timeline__line"
          aria-hidden="true"
        />
        <div
          class="tree-timeline__marker"
          :class="`tree-timeline__marker--${normalizeTone(item.tone)}`"
          aria-hidden="true"
        >
          <slot
            name="marker"
            :item="item"
            :index="index"
          />
        </div>
      </div>

      <div class="tree-timeline__content">
        <slot
          name="item"
          :item="item"
          :index="index"
        >
          <div
            v-if="item.meta"
            class="tree-timeline__meta"
          >
            {{ item.meta }}
          </div>

          <div class="tree-timeline__header">
            <p class="tree-timeline__title">
              {{ item.title }}
            </p>
            <time
              v-if="item.timestamp"
              class="tree-timeline__timestamp"
              :datetime="item.datetime || undefined"
            >
              {{ item.timestamp }}
            </time>
          </div>

          <p
            v-if="item.description"
            class="tree-timeline__description"
          >
            {{ item.description }}
          </p>
        </slot>
      </div>
    </li>
  </ol>
</template>
