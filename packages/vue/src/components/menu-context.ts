import type { InjectionKey, Ref } from 'vue';

/** A registered menu item, used by TMenu to drive roving focus. */
export interface TMenuItemHandle {
  id: string;
  getElement: () => HTMLElement | null;
  isDisabled: () => boolean;
}

export interface TMenuContext {
  registerItem: (handle: TMenuItemHandle) => void;
  unregisterItem: (id: string) => void;
  /** The item that currently owns the roving tabindex (`0`); others are `-1`. */
  activeId: Ref<string | null>;
  /** Sync the active item without moving focus (e.g. on pointer focus). */
  setActive: (id: string) => void;
  /** Arrow/Home/End roving handled at the menu container; Escape bubbles to the popover. */
  onKeydown: (event: KeyboardEvent) => void;
  /** Close the menu after an item is chosen (honours `closeOnSelect`). */
  activate: () => void;
}

export const treeMenuInjectionKey: InjectionKey<TMenuContext> = Symbol('tree-menu');
