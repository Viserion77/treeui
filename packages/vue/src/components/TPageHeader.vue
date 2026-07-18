<script setup lang="ts">
import { computed, useAttrs, useSlots } from 'vue';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    /** Heading level for the title element. Defaults to the page-level `1`. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
  }>(),
  {
    title: '',
    subtitle: '',
    level: 1,
    as: 'header',
  },
);

defineSlots<{
  breadcrumb?: () => unknown;
  title?: () => unknown;
  subtitle?: () => unknown;
  actions?: () => unknown;
  default?: () => unknown;
}>();

const attrs = useAttrs();
const slots = useSlots();

const rootClasses = computed(() => ['t-page-header', attrs.class]);
const rootStyle = computed(() => attrs.style);
const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const titleTag = computed(() => `h${props.level}`);
const hasTitle = computed(() => Boolean(slots.title || props.title));
const hasSubtitle = computed(() => Boolean(slots.subtitle || props.subtitle));
</script>

<template>
  <component
    :is="as"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <div
      v-if="$slots.breadcrumb"
      class="t-page-header__breadcrumb"
    >
      <slot name="breadcrumb" />
    </div>

    <div class="t-page-header__bar">
      <div
        v-if="hasTitle || hasSubtitle"
        class="t-page-header__heading"
      >
        <component
          :is="titleTag"
          v-if="hasTitle"
          class="t-page-header__title"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </component>

        <p
          v-if="hasSubtitle"
          class="t-page-header__subtitle"
        >
          <slot name="subtitle">
            {{ subtitle }}
          </slot>
        </p>
      </div>

      <div
        v-if="$slots.actions"
        class="t-page-header__actions"
      >
        <slot name="actions" />
      </div>
    </div>

    <div
      v-if="$slots.default"
      class="t-page-header__content"
    >
      <slot />
    </div>
  </component>
</template>
