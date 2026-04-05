import type { InjectionKey, Ref } from 'vue';
import type { TreeSize } from '../types/contracts';

export type TabsVariant = 'line' | 'enclosed';
export type TabsActivationMode = 'automatic' | 'manual';

export interface TabsContext {
  activeValue: Ref<string>;
  setActiveValue: (value: string) => void;
  variant: Ref<TabsVariant>;
  size: Ref<TreeSize>;
  activationMode: Ref<TabsActivationMode>;
  disabled: Ref<boolean>;
  baseId: string;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  getTabValues: () => string[];
  isTabDisabled: (value: string) => boolean;
  setTabDisabled: (value: string, disabled: boolean) => void;
}

export const TABS_INJECTION_KEY: InjectionKey<TabsContext> = Symbol('TreeTabs');
