<script setup lang="ts">
import { computed } from 'vue';
import type { TSize } from '../types/contracts';
import TButton from './TButton.vue';
import TBadge from './TBadge.vue';

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
    size?: TSize;
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
  't-pricing-card',
  `t-pricing-card--${props.size}`,
  {
    't-pricing-card--highlighted': props.highlighted,
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
      class="t-pricing-card__badge"
    >
      <slot name="badge">
        <TBadge
          variant="solid"
          size="sm"
        >
          {{ badge }}
        </TBadge>
      </slot>
    </div>

    <header class="t-pricing-card__header">
      <slot name="header">
        <h3 class="t-pricing-card__title">
          {{ title }}
        </h3>
        <p
          v-if="description"
          class="t-pricing-card__description"
        >
          {{ description }}
        </p>
      </slot>
    </header>

    <div class="t-pricing-card__price">
      <slot name="price">
        <span class="t-pricing-card__currency">{{ currency }}</span>
        <span class="t-pricing-card__amount">{{ price }}</span>
        <span
          v-if="period"
          class="t-pricing-card__period"
        >{{ period }}</span>
      </slot>
    </div>

    <div
      v-if="features.length > 0 || $slots.features"
      class="t-pricing-card__features"
    >
      <slot name="features">
        <ul
          class="t-pricing-card__feature-list"
          role="list"
        >
          <li
            v-for="(feature, index) in features"
            :key="index"
            class="t-pricing-card__feature-item"
            :class="{ 't-pricing-card__feature-item--excluded': feature.included === false }"
          >
            <span
              class="t-pricing-card__feature-icon"
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
      class="t-pricing-card__action"
    >
      <slot name="action">
        <TButton
          :variant="highlighted ? 'solid' : 'outline'"
          :size="size"
          :disabled="disabled"
          @click="onSelect"
        >
          {{ buttonText }}
        </TButton>
      </slot>
    </footer>
  </article>
</template>
