import type { ComputedRef, InjectionKey } from 'vue';

export type AccordionType = 'single' | 'multiple';

export interface AccordionContext {
  // Refs, not plain values: reading `props.x` while building the provided object
  // snapshots it at setup time, so items would never see a container prop
  // change. Mirrors the shape TTreeView provides to TTreeViewItem.
  type: ComputedRef<AccordionType>;
  disabled: ComputedRef<boolean>;
  collapsible: ComputedRef<boolean>;
  isItemOpen: (value: string) => boolean;
  toggleItem: (value: string) => void;
  registerTrigger: (value: string, el: HTMLElement) => void;
  unregisterTrigger: (value: string) => void;
  focusPrev: (value: string) => void;
  focusNext: (value: string) => void;
  focusFirst: () => void;
  focusLast: () => void;
}

export const accordionInjectionKey: InjectionKey<AccordionContext> = Symbol('tree-accordion');
