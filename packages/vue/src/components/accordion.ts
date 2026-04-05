import type { InjectionKey } from 'vue';

export type AccordionType = 'single' | 'multiple';

export interface AccordionContext {
  type: AccordionType;
  disabled: boolean;
  collapsible: boolean;
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
