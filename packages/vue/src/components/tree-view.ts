import type { ComputedRef, InjectionKey, Ref } from 'vue';

export interface TTreeViewNode {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
  children?: TTreeViewNode[];
}

export const treeTreeViewSelectionModes = ['single', 'multiple'] as const;

export type TTreeViewSelectionMode = (typeof treeTreeViewSelectionModes)[number];

export interface TTreeViewRecord {
  node: TTreeViewNode;
  level: number;
  parentId?: string;
}

export interface TTreeViewContext {
  baseId: string;
  disabled: ComputedRef<boolean>;
  selectionMode: ComputedRef<TTreeViewSelectionMode>;
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

export const treeTreeViewInjectionKey: InjectionKey<TTreeViewContext> =
  Symbol('tree-tree-view');
