<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  type Component,
} from 'vue';
import { createId } from '@treeui/utils';
import { treeMenuInjectionKey } from './menu-context';
import TIcon from './TIcon.vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    meta?: string;
    disabled?: boolean;
    /** Destructive action styling. The label text still carries the meaning — the tone is not the only signal. */
    danger?: boolean;
    /** Present (true/false) makes the item a `menuitemradio` with `aria-checked` — e.g. a workspace switch. */
    checked?: boolean;
    href?: string;
    to?: string | Record<string, unknown>;
  }>(),
  {
    label: undefined,
    description: undefined,
    meta: undefined,
    disabled: false,
    danger: false,
    checked: undefined,
    href: undefined,
    to: undefined,
  },
);

const emit = defineEmits<{ select: [] }>();

const menu = inject(treeMenuInjectionKey, null);
const id = createId('t-menu-item');
const el = ref<HTMLElement | null>(null);

const instance = getCurrentInstance();
const routerLink = computed<Component | null>(() => {
  if (!props.to) return null;
  return (instance?.appContext.components.RouterLink as Component | undefined) ?? null;
});

const isRadio = computed(() => props.checked !== undefined);
const isLink = computed(() => Boolean(props.href || props.to));

const tag = computed<string | Component>(() => {
  if (props.to && routerLink.value) return routerLink.value;
  if (isLink.value) return 'a';
  return 'button';
});

const linkAttrs = computed(() => {
  if (props.to && routerLink.value) return { to: props.to };
  if (isLink.value) {
    return { href: props.href ?? (typeof props.to === 'string' ? props.to : undefined) };
  }
  return {};
});

const isActive = computed(() => menu?.activeId.value === id);
const tabindex = computed(() => (props.disabled || !isActive.value ? -1 : 0));
const role = computed(() => (isRadio.value ? 'menuitemradio' : 'menuitem'));

const classes = computed(() => [
  't-menu-item',
  { 'is-disabled': props.disabled, 't-menu-item--danger': props.danger },
]);

onMounted(() => {
  menu?.registerItem({ id, getElement: () => el.value, isDisabled: () => props.disabled });
});

onBeforeUnmount(() => {
  menu?.unregisterItem(id);
});

const onFocus = () => {
  if (!props.disabled) menu?.setActive(id);
};

const onClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit('select');
  menu?.activate();
};

const onKeydown = (event: KeyboardEvent) => {
  // A link does not activate on Space by default; a menu item should.
  if (isLink.value && event.key === ' ') {
    event.preventDefault();
    el.value?.click();
  }
};
</script>

<template>
  <component
    :is="tag"
    ref="el"
    v-bind="linkAttrs"
    :class="classes"
    :role="role"
    :tabindex="tabindex"
    :aria-disabled="disabled || undefined"
    :aria-checked="isRadio ? (checked ? 'true' : 'false') : undefined"
    :disabled="tag === 'button' ? disabled : undefined"
    @click="onClick"
    @focus="onFocus"
    @keydown="onKeydown"
  >
    <span
      v-if="$slots.leading"
      class="t-menu-item__leading"
      aria-hidden="true"
    >
      <slot name="leading" />
    </span>
    <span class="t-menu-item__body">
      <span class="t-menu-item__label"><slot>{{ label }}</slot></span>
      <span
        v-if="description"
        class="t-menu-item__description"
      >{{ description }}</span>
    </span>
    <span
      v-if="meta"
      class="t-menu-item__meta"
    >{{ meta }}</span>
    <span
      v-if="isRadio && checked"
      class="t-menu-item__check"
      aria-hidden="true"
    >
      <TIcon
        name="check"
        :size="16"
      />
    </span>
  </component>
</template>
