import type { ComputedRef, InjectionKey } from 'vue';

export interface TreeSidebarContext {
  collapsed: ComputedRef<boolean>;
}

export const treeSidebarInjectionKey: InjectionKey<TreeSidebarContext> =
  Symbol('tree-sidebar');
