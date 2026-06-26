<script setup lang="ts">
import { computed, onBeforeUnmount, toRef, useAttrs } from 'vue';
import { createId } from '@treeui/utils';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TTooltipSide } from '../types/contracts';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    disabled?: boolean;
    content?: string;
    side?: TTooltipSide;
    delay?: number;
    id?: string;
  }>(),
  {
    defaultOpen: false,
    disabled: false,
    content: '',
    side: 'top',
    delay: 80,
    id: undefined,
  },
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'open-change': [value: boolean];
}>();

const attrs = useAttrs();
const contentId = props.id ?? createId('t-tooltip');
const triggerAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});
const rootClasses = computed(() => ['t-tooltip', attrs.class]);
const rootStyle = computed(() => attrs.style);
const { value: isOpen, setValue } = useControllableOpen(
  toRef(props, 'open'),
  props.defaultOpen,
  (value) => {
    emit('update:open', value);
    emit('open-change', value);
  },
);

let openTimer: ReturnType<typeof setTimeout> | undefined;

const clearOpenTimer = () => {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = undefined;
  }
};

const show = (immediate = false) => {
  if (props.disabled) {
    return;
  }

  clearOpenTimer();

  if (immediate) {
    setValue(true);
    return;
  }

  openTimer = setTimeout(() => {
    setValue(true);
  }, props.delay);
};

const showOnFocus = () => {
  show(true);
};

const showOnPointer = () => {
  show();
};

const hide = () => {
  clearOpenTimer();
  setValue(false);
};

const tooltipClasses = computed(() => [
  't-tooltip__content',
  `t-tooltip__content--${props.side}`,
]);

onBeforeUnmount(clearOpenTimer);
</script>

<template>
  <span
    :class="rootClasses"
    :style="rootStyle"
    :data-state="isOpen ? 'open' : 'closed'"
    @mouseenter="showOnPointer"
    @mouseleave="hide"
    @focus.capture="showOnFocus"
    @blur.capture="hide"
  >
    <span
      class="t-tooltip__trigger"
      :aria-describedby="isOpen ? contentId : undefined"
      v-bind="triggerAttrs"
    >
      <slot name="trigger">
        <slot />
      </slot>
    </span>
    <transition name="t-fade">
      <span
        v-if="isOpen && !disabled"
        :id="contentId"
        role="tooltip"
        :class="tooltipClasses"
        :data-state="isOpen ? 'open' : 'closed'"
      >
        <slot name="content">
          {{ content }}
        </slot>
      </span>
    </transition>
  </span>
</template>
