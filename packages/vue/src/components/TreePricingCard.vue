<script setup lang="ts">
import { computed } from 'vue';
import type { TreeSize } from '../types/contracts';
import TreeButton from './TreeButton.vue';
import TreeBadge from './TreeBadge.vue';

export interface PricingFeature {
  text: string;
  included?: boolean;
}

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    price: string | number;
    currency?: string;
    period?: string;
    features?: PricingFeature[];
    highlighted?: boolean;
    badge?: string;
    buttonText?: string;
    size?: TreeSize;
    disabled?: boolean;
  }>(),
  {
    description: undefined,
    currency: '$',
    period: undefined,
    features: () => [],
    highlighted: false,
    badge: undefined,
    buttonText: undefined,
    size: 'md',
    disabled: false,
  },
);

const emit = defineEmits<{
  select: [];
}>();

defineSlots<{
  header?: () => unknown;
  price?: () => unknown;
  features?: () => unknown;
  action?: () => unknown;
  badge?: () => unknown;
}>();

const classes = computed(() => [
  'tree-pricing-card',
  `tree-pricing-card--${props.size}`,
  {
    'tree-pricing-card--highlighted': props.highlighted,
  },
]);

const onSelect = () => {
  if (!props.disabled) {
    emit('select');
  }
};
</script>

<template>
  <article :class="classes">
    <div
      v-if="badge || $slots.badge"
      class="tree-pricing-card__badge"
    >
      <slot name="badge">
        <TreeBadge
          variant="solid"
          size="sm"
        >
          {{ badge }}
        </TreeBadge>
      </slot>
    </div>

    <header class="tree-pricing-card__header">
      <slot name="header">
        <h3 class="tree-pricing-card__title">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="tree-pricing-card__description"
        >
          {{ description }}
        </p>
      </slot>
    </header>

    <div class="tree-pricing-card__price">
      <slot name="price">
        <span class="tree-pricing-card__currency">{{ currency }}</span>
        <span class="tree-pricing-card__amount">{{ price }}</span>
        <span
          v-if="period"
          class="tree-pricing-card__period"
        >{{ period }}</span>
      </slot>
    </div>

    <div
      v-if="features.length > 0 || $slots.features"
      class="tree-pricing-card__features"
    >
      <slot name="features">
        <ul
          class="tree-pricing-card__feature-list"
          role="list"
        >
          <li
            v-for="(feature, index) in features"
            :key="index"
            class="tree-pricing-card__feature-item"
            :class="{ 'tree-pricing-card__feature-item--excluded': feature.included === false }"
          >
            <span
              class="tree-pricing-card__feature-icon"
              aria-hidden="true"
            >
              {{ feature.included === false ? '✕' : '✓' }}
            </span>
            <span>{{ feature.text }}</span>
          </li>
        </ul>
      </slot>
    </div>

    <footer
      v-if="buttonText || $slots.action"
      class="tree-pricing-card__action"
    >
      <slot name="action">
        <TreeButton
          :variant="highlighted ? 'solid' : 'outline'"
          :size="size"
          :disabled="disabled"
          @click="onSelect"
        >
          {{ buttonText }}
        </TreeButton>
      </slot>
    </footer>
  </article>
</template>
