import type { ComputedRef, InjectionKey } from 'vue';

export interface TSidebarContext {
  collapsed: ComputedRef<boolean>;
}

export const treeSidebarInjectionKey: InjectionKey<TSidebarContext> =
  Symbol('tree-sidebar');
