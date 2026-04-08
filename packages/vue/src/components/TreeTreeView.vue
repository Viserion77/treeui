<script setup lang="ts">
import { createId, isActivationKey } from '@treeui/utils';
import { computed, nextTick, provide, ref, useAttrs, watch } from 'vue';
import TreeTreeViewItem from './TreeTreeViewItem.vue';
import {
  treeTreeViewInjectionKey,
  type TreeTreeViewNode,
  type TreeTreeViewRecord,
  type TreeTreeViewSelectionMode,
} from './tree-view';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    modelValue?: string | string[];
    defaultValue?: string | string[];
    nodes?: TreeTreeViewNode[];
    selectionMode?: TreeTreeViewSelectionMode;
    expanded?: string[];
    defaultExpanded?: string[];
    disabled?: boolean;
    emptyText?: string;
  }>(),
  {
    modelValue: undefined,
    defaultValue: undefined,
    nodes: () => [],
    selectionMode: 'single',
    expanded: undefined,
    defaultExpanded: () => [],
    disabled: false,
    emptyText: 'No items available.',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
  'update:expanded': [value: string[]];
  'selection-change': [value: string | string[] | undefined];
  'expanded-change': [value: string[]];
}>();

const attrs = useAttrs();
const baseId = createId('tree-tree-view');
const internalValue = ref<string | string[] | undefined>(props.defaultValue);
const internalExpanded = ref<string[]>(props.defaultExpanded);
const itemRefs = ref<Map<string, HTMLElement>>(new Map());

const rootClasses = computed(() => [
  'tree-tree-view',
  {
    'is-disabled': props.disabled,
  },
  attrs.class,
]);

const rootStyle = computed(() => attrs.style);

const treeAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const selectedValues = computed(() => {
  const value = props.modelValue ?? internalValue.value;

  if (value === undefined || value === null || value === '') {
    return [] as string[];
  }

  return Array.isArray(value) ? value : [value];
});

const expandedValues = computed(() => props.expanded ?? internalExpanded.value);

const updateSelection = (nextValues: string[]) => {
  if (props.selectionMode === 'multiple') {
    if (props.modelValue === undefined) {
      internalValue.value = nextValues;
    }

    emit('update:modelValue', nextValues);
    emit('selection-change', nextValues);
    return;
  }

  const nextValue = nextValues[0];

  if (props.modelValue === undefined) {
    internalValue.value = nextValue;
  }

  emit('update:modelValue', nextValue);
  emit('selection-change', nextValue);
};

const updateExpanded = (nextValues: string[]) => {
  if (props.expanded === undefined) {
    internalExpanded.value = nextValues;
  }

  emit('update:expanded', nextValues);
  emit('expanded-change', nextValues);
};

const isSelected = (id: string) => selectedValues.value.includes(id);
const isExpanded = (id: string) => expandedValues.value.includes(id);

const flattenNodes = (
  nodes: TreeTreeViewNode[],
  level = 1,
  parentId?: string,
): TreeTreeViewRecord[] =>
  nodes.reduce<TreeTreeViewRecord[]>((records, node) => {
    records.push({
      node,
      level,
      parentId,
    });

    if (node.children?.length && isExpanded(node.id)) {
      records.push(...flattenNodes(node.children, level + 1, node.id));
    }

    return records;
  }, []);

const visibleNodes = computed(() => flattenNodes(props.nodes));
const enabledNodes = computed(() => visibleNodes.value.filter((record) => !record.node.disabled));

const getInitialFocusedId = () => {
  const selectedId = selectedValues.value.find((value) =>
    visibleNodes.value.some((record) => record.node.id === value && !record.node.disabled),
  );

  if (selectedId) {
    return selectedId;
  }

  return enabledNodes.value[0]?.node.id ?? '';
};

const focusedId = ref(getInitialFocusedId());

const registerItem = (id: string, element: HTMLElement) => {
  itemRefs.value.set(id, element);
};

const unregisterItem = (id: string) => {
  itemRefs.value.delete(id);
};

const focusItem = (id: string) => {
  nextTick(() => itemRefs.value.get(id)?.focus());
};

const setFocusedId = (id: string, shouldFocus = false) => {
  focusedId.value = id;

  if (shouldFocus) {
    focusItem(id);
  }
};

const getVisibleRecord = (id: string) =>
  visibleNodes.value.find((record) => record.node.id === id);

const focusBoundary = (position: 'first' | 'last') => {
  const target =
    position === 'first' ? enabledNodes.value[0] : enabledNodes.value[enabledNodes.value.length - 1];

  if (target) {
    setFocusedId(target.node.id, true);
  }
};

const focusAdjacent = (direction: 1 | -1) => {
  const currentIndex = enabledNodes.value.findIndex((record) => record.node.id === focusedId.value);

  if (currentIndex === -1) {
    focusBoundary(direction === 1 ? 'first' : 'last');
    return;
  }

  const nextIndex = currentIndex + direction;

  if (nextIndex < 0 || nextIndex >= enabledNodes.value.length) {
    return;
  }

  setFocusedId(enabledNodes.value[nextIndex].node.id, true);
};

const toggleExpanded = (id: string) => {
  const nextValues = isExpanded(id)
    ? expandedValues.value.filter((value) => value !== id)
    : [...expandedValues.value, id];

  updateExpanded(nextValues);
};

const toggleSelected = (id: string) => {
  const record = getVisibleRecord(id);

  if (!record || record.node.disabled || props.disabled) {
    return;
  }

  if (props.selectionMode === 'multiple') {
    const nextValues = isSelected(id)
      ? selectedValues.value.filter((value) => value !== id)
      : [...selectedValues.value, id];

    updateSelection(nextValues);
    return;
  }

  updateSelection([id]);
};

const onItemKeydown = (event: KeyboardEvent, id: string) => {
  const record = getVisibleRecord(id);

  if (!record || record.node.disabled || props.disabled) {
    return;
  }

  const hasChildren = Boolean(record.node.children?.length);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusAdjacent(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusAdjacent(-1);
      break;
    case 'ArrowRight':
      event.preventDefault();

      if (hasChildren && !isExpanded(id)) {
        toggleExpanded(id);
        return;
      }

      if (hasChildren) {
        const firstChild = visibleNodes.value.find(
          (item) => item.parentId === id && !item.node.disabled,
        );

        if (firstChild) {
          setFocusedId(firstChild.node.id, true);
        }
      }

      break;
    case 'ArrowLeft':
      event.preventDefault();

      if (hasChildren && isExpanded(id)) {
        toggleExpanded(id);
        return;
      }

      if (record.parentId) {
        setFocusedId(record.parentId, true);
      }

      break;
    case 'Home':
      event.preventDefault();
      focusBoundary('first');
      break;
    case 'End':
      event.preventDefault();
      focusBoundary('last');
      break;
    default:
      if (isActivationKey(event)) {
        event.preventDefault();
        toggleSelected(id);
      }
      break;
  }
};

watch(
  () => [visibleNodes.value, props.modelValue] as const,
  () => {
    const focusedRecord = visibleNodes.value.find(
      (record) => record.node.id === focusedId.value && !record.node.disabled,
    );

    if (!focusedRecord) {
      focusedId.value = getInitialFocusedId();
    }
  },
  { deep: true, immediate: true },
);

provide(treeTreeViewInjectionKey, {
  baseId,
  disabled: computed(() => props.disabled),
  selectionMode: computed(() => props.selectionMode),
  focusedId,
  isExpanded,
  toggleExpanded,
  isSelected,
  toggleSelected,
  setFocusedId,
  onItemKeydown,
  registerItem,
  unregisterItem,
});
</script>

<template>
  <div
    :class="rootClasses"
    :style="rootStyle"
  >
    <ul
      v-if="nodes.length > 0"
      v-bind="treeAttrs"
      class="tree-tree-view__root"
      role="tree"
      :aria-multiselectable="selectionMode === 'multiple' || undefined"
    >
      <TreeTreeViewItem
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        :level="1"
      />
    </ul>

    <div
      v-else
      class="tree-tree-view__empty"
    >
      {{ emptyText }}
    </div>
  </div>
</template>
