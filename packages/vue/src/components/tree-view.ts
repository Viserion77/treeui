import type { ComputedRef, InjectionKey, Ref } from 'vue';

export interface TreeTreeViewNode {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
  children?: TreeTreeViewNode[];
}

export const treeTreeViewSelectionModes = ['single', 'multiple'] as const;

export type TreeTreeViewSelectionMode = (typeof treeTreeViewSelectionModes)[number];

export interface TreeTreeViewRecord {
  node: TreeTreeViewNode;
  level: number;
  parentId?: string;
}

export interface TreeTreeViewContext {
  baseId: string;
  disabled: ComputedRef<boolean>;
  selectionMode: ComputedRef<TreeTreeViewSelectionMode>;
  focusedId: Ref<string>;
  isExpanded: (id: string) => boolean;
  toggleExpanded: (id: string) => void;
  isSelected: (id: string) => boolean;
  toggleSelected: (id: string) => void;
  setFocusedId: (id: string, shouldFocus?: boolean) => void;
  onItemKeydown: (event: KeyboardEvent, id: string) => void;
  registerItem: (id: string, element: HTMLElement) => void;
  unregisterItem: (id: string) => void;
}

export const treeTreeViewInjectionKey: InjectionKey<TreeTreeViewContext> =
  Symbol('tree-tree-view');
