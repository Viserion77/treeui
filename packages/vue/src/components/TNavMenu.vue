<script setup lang="ts">
import { getNextEnabledIndex, isActivationKey } from '@treeui/utils';
import { resolveTreeIcon, type TIconInput } from '@treeui/icons';
import { computed, getCurrentInstance, inject, nextTick, ref, useAttrs, watch, type Component, type ComponentPublicInstance } from 'vue';
import type { TSize } from '../types/contracts';
import { treeSidebarInjectionKey } from './sidebar';

defineOptions({
  inheritAttrs: false,
});

export interface TNavMenuItem {
  label: string;
  value: string;
  shortLabel?: string;
  description?: string;
  /**
   * A registered icon name (`'cpu'`), or any component. A name is the simpler
   * form: it needs no import and no `markRaw`, since a string is not made
   * reactive when the item lands in a `ref`.
   */
  icon?: TIconInput;
  to?: string | Record<string, unknown>;
  badge?: string | number;
  disabled?: boolean;
  /**
   * When the item renders as a router link, controls whether an inclusive
   * (prefix) route match also marks it active. Defaults to the menu-level
   * `exact` prop. Set to `false` for section roots that should stay active on
   * nested routes.
   */
  exact?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
    items?: TNavMenuItem[];
    size?: TSize;
    collapsed?: boolean;
    disabled?: boolean;
    exact?: boolean;
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    items: () => [],
    size: 'md',
    collapsed: undefined,
    disabled: false,
    exact: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  select: [value: string, item: TNavMenuItem];
}>();

defineSlots<{
  item?: (props: {
    item: TNavMenuItem;
    selected: boolean;
    focused: boolean;
    collapsed: boolean;
  }) => unknown;
  empty?: () => unknown;
}>();

/**
 * A registry lookup, so it stays cheap enough to call from the template. An
 * unresolved name returns `undefined` and the item falls back to its letter
 * marker rather than rendering a hole.
 */
const iconFor = (item: TNavMenuItem) => resolveTreeIcon(item.icon);

const attrs = useAttrs();
const sidebar = inject(treeSidebarInjectionKey, null);
const internalValue = ref(props.defaultValue);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());
const instance = getCurrentInstance();

const selectedValue = computed(() => props.modelValue ?? internalValue.value);
const resolvedCollapsed = computed(() => props.collapsed ?? sidebar?.collapsed.value ?? false);

const routerLinkComponent = computed<Component | null>(() => (
  (instance?.appContext.components.RouterLink as Component | undefined) ?? null
));

const itemTag = (item: TNavMenuItem) => {
  if (item.to && routerLinkComponent.value) {
    return routerLinkComponent.value;
  }
  return 'button';
};

const isRouterLinkItem = (item: TNavMenuItem) =>
  Boolean(item.to) && routerLinkComponent.value !== null;

// Keep the active highlight deterministic when items render as router links.
// Vue Router's default `router-link-active` uses inclusive (prefix) matching,
// so several links can appear active at once. We map the router's active
// classes onto TreeUI's own `is-selected`:
// - Controlled menus (explicit `modelValue`) own selection, so the router adds
//   no class of its own — only the bound `is-selected` shows.
// - Uncontrolled menus let the current route drive selection, using exact
//   matching by default (opt out per item, or menu-wide, via `exact`).
const routerActiveClass = (item: TNavMenuItem) => {
  if (!isRouterLinkItem(item)) {
    return undefined;
  }

  if (props.modelValue !== undefined) {
    return '';
  }

  return (item.exact ?? props.exact) ? '' : 'is-selected';
};

const routerExactActiveClass = (item: TNavMenuItem) => {
  if (!isRouterLinkItem(item)) {
    return undefined;
  }

  return props.modelValue !== undefined ? '' : 'is-selected';
};

const getInitialFocusedIndex = () => {
  const selectedIndex = props.items.findIndex((item) =>
    item.value === selectedValue.value && !item.disabled,
  );

  if (selectedIndex >= 0) {
    return selectedIndex;
  }

  return props.items.findIndex((item) => !item.disabled);
};

const focusedIndex = ref(getInitialFocusedIndex());

const rootClasses = computed(() => [
  't-nav-menu',
  `t-nav-menu--${props.size}`,
  {
    'is-collapsed': resolvedCollapsed.value,
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const isSelected = (value: string) => selectedValue.value === value;

const setItemRef = (element: Element | ComponentPublicInstance | null, value: string) => {
  const resolvedElement =
    element instanceof HTMLElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLElement
        ? element.$el
        : null;

  if (resolvedElement) {
    itemRefs.value.set(value, resolvedElement);
  } else {
    itemRefs.value.delete(value);
  }
};

const focusItem = (index: number) => {
  const item = props.items[index];

  if (!item) {
    return;
  }

  focusedIndex.value = index;
  nextTick(() => itemRefs.value.get(item.value)?.focus());
};

const selectItem = (item: TNavMenuItem) => {
  if (props.disabled || item.disabled) {
    return;
  }

  if (props.modelValue === undefined) {
    internalValue.value = item.value;
  }

  emit('update:modelValue', item.value);
  emit('select', item.value, item);
};

const onItemKeydown = (event: KeyboardEvent, index: number) => {
  if (props.disabled) {
    return;
  }

  if (event.key === 'Home') {
    event.preventDefault();
    const firstIndex = props.items.findIndex((item) => !item.disabled);

    if (firstIndex >= 0) {
      focusItem(firstIndex);
    }

    return;
  }

  if (event.key === 'End') {
    event.preventDefault();
    const lastIndex = [...props.items].reverse().findIndex((item) => !item.disabled);

    if (lastIndex >= 0) {
      focusItem(props.items.length - 1 - lastIndex);
    }

    return;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault();
    const nextIndex = getNextEnabledIndex(index, props.items, 1);

    if (nextIndex >= 0) {
      focusItem(nextIndex);
    }

    return;
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault();
    const previousIndex = getNextEnabledIndex(index, props.items, -1);

    if (previousIndex >= 0) {
      focusItem(previousIndex);
    }

    return;
  }

  if (isActivationKey(event)) {
    event.preventDefault();
    selectItem(props.items[index]);
  }
};

const getTabIndex = (index: number) => (focusedIndex.value === index ? 0 : -1);

watch(
  () => [props.items, props.modelValue] as const,
  () => {
    const nextIndex = getInitialFocusedIndex();
    focusedIndex.value = nextIndex >= 0 ? nextIndex : -1;
  },
  { deep: true },
);
</script>

<template>
  <nav
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <ul
      v-if="items.length > 0"
      class="t-nav-menu__list"
    >
      <li
        v-for="(item, index) in items"
        :key="item.value"
        class="t-nav-menu__entry"
      >
        <component
          :is="itemTag(item)"
          :ref="(element: Element | ComponentPublicInstance | null) => setItemRef(element, item.value)"
          :type="item.to ? undefined : 'button'"
          :to="item.to || undefined"
          class="t-nav-menu__item"
          :class="{
            'is-selected': isSelected(item.value),
            'is-disabled': disabled || item.disabled,
          }"
          :active-class="routerActiveClass(item)"
          :exact-active-class="routerExactActiveClass(item)"
          :disabled="(!item.to && (disabled || item.disabled)) || undefined"
          :aria-disabled="(item.to && (disabled || item.disabled)) || undefined"
          :aria-current="isSelected(item.value) ? 'page' : undefined"
          :tabindex="disabled || item.disabled ? -1 : getTabIndex(index)"
          :title="resolvedCollapsed ? item.label : undefined"
          @click="selectItem(item)"
          @keydown="onItemKeydown($event, index)"
          @focus="focusedIndex = index"
        >
          <slot
            name="item"
            :item="item"
            :selected="isSelected(item.value)"
            :focused="focusedIndex === index"
            :collapsed="resolvedCollapsed"
          >
            <component
              :is="iconFor(item)"
              v-if="iconFor(item)"
              class="t-nav-menu__icon"
              aria-hidden="true"
            />
            <span
              v-else
              class="t-nav-menu__marker"
              aria-hidden="true"
            >
              {{ (item.shortLabel ?? item.label.charAt(0)).toUpperCase() }}
            </span>

            <span class="t-nav-menu__copy">
              <span class="t-nav-menu__label">{{ item.label }}</span>
              <span
                v-if="item.description"
                class="t-nav-menu__description"
              >
                {{ item.description }}
              </span>
            </span>

            <span
              v-if="item.badge !== undefined && item.badge !== null"
              class="t-nav-menu__badge"
            >
              {{ item.badge }}
            </span>
          </slot>
        </component>
      </li>
    </ul>

    <div
      v-else
      class="t-nav-menu__empty"
    >
      <slot name="empty">
        No navigation items.
      </slot>
    </div>
  </nav>
</template>
