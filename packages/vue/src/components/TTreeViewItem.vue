<script setup lang="ts">
import { getTreeIcon } from '@treeui/icons';
import { computed, inject, type ComponentPublicInstance } from 'vue';
import { treeTreeViewInjectionKey, type TTreeViewNode } from './tree-view';

defineOptions({
  name: 'TTreeViewItem',
});

const ChevronRightIcon = getTreeIcon('chevron-right');
const CheckIcon = getTreeIcon('check');

const props = defineProps<{
  node: TTreeViewNode;
  level: number;
}>();

const ctx = inject(treeTreeViewInjectionKey);

if (!ctx) {
  throw new Error('[TreeUI] TTreeView items must be rendered inside a TTreeView.');
}

const hasChildren = computed(() => Boolean(props.node.children?.length));
const isExpanded = computed(() => (hasChildren.value ? ctx.isExpanded(props.node.id) : false));
const isSelected = computed(() => ctx.isSelected(props.node.id));
const isDisabled = computed(() => ctx.disabled.value || props.node.disabled);
const isFocused = computed(() => ctx.focusedId.value === props.node.id);
const itemId = computed(() => `${ctx.baseId}-${props.node.id}`);

const rowClasses = computed(() => ({
  'is-expanded': isExpanded.value,
  'is-selected': isSelected.value,
  'is-disabled': isDisabled.value,
  'is-focused': isFocused.value,
}));

const setItemRef = (element: Element | ComponentPublicInstance | null) => {
  const resolvedElement =
    element instanceof HTMLElement
      ? element
      : element && '$el' in element && element.$el instanceof HTMLElement
        ? element.$el
        : null;

  if (resolvedElement instanceof HTMLElement) {
    ctx.registerItem(props.node.id, resolvedElement);
  } else {
    ctx.unregisterItem(props.node.id);
  }
};

const onRowClick = () => {
  ctx.setFocusedId(props.node.id);
  ctx.toggleSelected(props.node.id);
};

const onToggleClick = () => {
  if (isDisabled.value || !hasChildren.value) {
    return;
  }

  ctx.toggleExpanded(props.node.id);
  ctx.setFocusedId(props.node.id);
};
</script>

<template>
  <li
    class="t-tree-view__node"
    role="none"
  >
    <div
      :id="itemId"
      :ref="setItemRef"
      class="t-tree-view__row"
      :class="rowClasses"
      :style="{ '--tree-tree-view-level': `${level}` }"
      role="treeitem"
      :aria-level="level"
      :aria-expanded="hasChildren ? isExpanded : undefined"
      :aria-selected="isSelected"
      :aria-disabled="isDisabled || undefined"
      :tabindex="isDisabled ? -1 : isFocused ? 0 : -1"
      @click="onRowClick"
      @keydown="ctx.onItemKeydown($event, node.id)"
      @focus="ctx.setFocusedId(node.id)"
    >
      <button
        v-if="hasChildren"
        type="button"
        class="t-tree-view__toggle"
        :class="{ 'is-expanded': isExpanded }"
        tabindex="-1"
        :disabled="isDisabled"
        :aria-label="isExpanded ? 'Collapse node' : 'Expand node'"
        @click.stop="onToggleClick"
      >
        <ChevronRightIcon :size="16" />
      </button>

      <span
        v-else
        class="t-tree-view__spacer"
        aria-hidden="true"
      />

      <span
        class="t-tree-view__marker"
        :class="{
          'is-selected': isSelected,
          'is-multiple': ctx.selectionMode.value === 'multiple',
        }"
        aria-hidden="true"
      >
        <CheckIcon
          v-if="ctx.selectionMode.value === 'multiple' && isSelected"
          :size="14"
        />
      </span>

      <span class="t-tree-view__copy">
        <span class="t-tree-view__label">{{ node.label }}</span>
        <span
          v-if="node.description"
          class="t-tree-view__description"
        >
          {{ node.description }}
        </span>
      </span>

      <span
        v-if="node.meta"
        class="t-tree-view__meta"
      >
        {{ node.meta }}
      </span>
    </div>

    <ul
      v-if="hasChildren && isExpanded"
      class="t-tree-view__group"
      role="group"
    >
      <TTreeViewItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      />
    </ul>
  </li>
</template>
