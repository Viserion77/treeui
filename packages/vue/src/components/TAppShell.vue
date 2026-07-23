<script setup lang="ts">
import {
  createId,
  focusFirst,
  focusLast,
  getFocusableElements,
  isEscapeKey,
} from '@treeui/utils';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  toRef,
  useAttrs,
  watch,
} from 'vue';
import { useControllableOpen } from '../composables/useControllableOpen';
import type { TSidebarSide } from './TSidebar.vue';
import { treeSidebarInjectionKey } from './sidebar';

defineOptions({
  inheritAttrs: false,
});

const CloseIcon = computed(() => getTreeIcon('x'));
const MenuIcon = computed(() => getTreeIcon('menu'));

const props = withDefaults(
  defineProps<{
    as?: string;
    side?: TSidebarSide;
    sidebarWidth?: string;
    collapsedWidth?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    defaultCollapsed?: boolean;
    mobile?: boolean;
    breakpoint?: string;
    /**
     * Width (measured on the shell root) below which the sidebar auto-collapses
     * to the rail, between `breakpoint` (drawer) and this value. Above it the
     * user's manual collapse preference applies. Omit for the binary
     * drawer↔expanded behavior. Must be greater than `breakpoint`.
     */
    railBreakpoint?: string;
    sidebarOpen?: boolean;
    defaultSidebarOpen?: boolean;
    /**
     * Hide the shell chrome (header and sidebar) so the content fills the
     * viewport. The default slot stays mounted across the toggle.
     */
    immersive?: boolean;
    defaultImmersive?: boolean;
    closeOnEscape?: boolean;
    closeOnOverlay?: boolean;
    showMenuButton?: boolean;
    /** Render the built-in collapse toggle in the sidebar footer (desktop). */
    showCollapseButton?: boolean;
    menuLabel?: string;
    closeLabel?: string;
    sidebarLabel?: string;
    collapseLabel?: string;
    expandLabel?: string;
  }>(),
  {
    as: 'div',
    side: 'left',
    sidebarWidth: '17.5rem',
    collapsedWidth: '4.75rem',
    collapsible: false,
    collapsed: undefined,
    defaultCollapsed: false,
    mobile: undefined,
    breakpoint: '768px',
    railBreakpoint: undefined,
    sidebarOpen: undefined,
    defaultSidebarOpen: false,
    immersive: undefined,
    defaultImmersive: false,
    closeOnEscape: true,
    closeOnOverlay: true,
    showMenuButton: true,
    showCollapseButton: true,
    menuLabel: 'Open menu',
    closeLabel: 'Close menu',
    sidebarLabel: 'Sidebar',
    collapseLabel: 'Collapse sidebar',
    expandLabel: 'Expand sidebar',
  },
);

const emit = defineEmits<{
  'update:collapsed': [value: boolean];
  'collapse-change': [value: boolean];
  'update:sidebarOpen': [value: boolean];
  'sidebar-open-change': [value: boolean];
  'update:immersive': [value: boolean];
  'immersive-change': [value: boolean];
}>();

export interface AppShellSlotProps {
  mobile: boolean;
  collapsed: boolean;
  sidebarOpen: boolean;
  immersive: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapsed: () => void;
  toggleImmersive: () => void;
}

defineSlots<{
  header?: (props: AppShellSlotProps) => unknown;
  /** Header region over the sidebar rail; the `header` slot then aligns with the content panel. */
  'header-start'?: (props: AppShellSlotProps) => unknown;
  /** Trailing header region, pinned to the far end of the row (actions, controls). */
  'header-end'?: (props: AppShellSlotProps) => unknown;
  /** Pinned above the sidebar body, inset to line up with nav item icons. */
  'sidebar-header'?: (props: AppShellSlotProps) => unknown;
  sidebar?: (props: AppShellSlotProps) => unknown;
  /** Pinned to the bottom of the sidebar, inset to line up with nav item icons. */
  'sidebar-footer'?: (props: AppShellSlotProps) => unknown;
  /**
   * Immersive hides the chrome, so the content is the only place an exit
   * control can live — `immersive` and `toggleImmersive` are passed through.
   */
  default?: (
    props: Pick<AppShellSlotProps, 'mobile' | 'collapsed' | 'immersive' | 'toggleImmersive'>,
  ) => unknown;
  'menu-icon'?: (props: { sidebarOpen: boolean }) => unknown;
  'collapse-icon'?: (props: { collapsed: boolean }) => unknown;
}>();

const attrs = useAttrs();
const sidebarId = createId('t-app-shell-sidebar');

const { value: isCollapsed, setValue: setCollapsed } = useControllableOpen(
  toRef(props, 'collapsed'),
  props.defaultCollapsed,
  (value) => {
    emit('update:collapsed', value);
    emit('collapse-change', value);
  },
);

const { value: isSidebarOpen, setValue: setSidebarOpen } = useControllableOpen(
  toRef(props, 'sidebarOpen'),
  props.defaultSidebarOpen,
  (value) => {
    emit('update:sidebarOpen', value);
    emit('sidebar-open-change', value);
  },
);

const { value: isImmersive, setValue: setImmersive } = useControllableOpen(
  toRef(props, 'immersive'),
  props.defaultImmersive,
  (value) => {
    emit('update:immersive', value);
    emit('immersive-change', value);
  },
);

const toggleImmersive = () => {
  setImmersive(!isImmersive.value);
};

// Responsive policy is driven by the shell root's own width via ResizeObserver,
// not the viewport or the content panel. Measuring the root avoids the feedback
// loop the content panel would cause (it grows as the rail collapses).
const rootEl = ref<HTMLElement | null>(null);
const rootWidth = ref(0);
let resizeObserver: ResizeObserver | null = null;

const toPx = (length: string | undefined): number | null => {
  if (!length) return null;
  const match = /^([\d.]+)(px|rem|em)?$/.exec(length.trim());
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  if (Number.isNaN(value)) return null;
  if (!match[2] || match[2] === 'px') return value;
  const rootFontSize =
    typeof document === 'undefined'
      ? 16
      : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return value * rootFontSize;
};

const breakpointPx = computed(() => toPx(props.breakpoint) ?? 768);
const railBreakpointPx = computed(() => toPx(props.railBreakpoint));

// Before the first measurement rootWidth is 0 → treated as desktop, avoiding a
// mobile flash on mount.
const autoMobile = computed(() => rootWidth.value > 0 && rootWidth.value < breakpointPx.value);
const isMobile = computed(() => props.mobile ?? autoMobile.value);

// The auto-rail band: between the drawer boundary and the rail boundary the
// sidebar is forced to the rail regardless of the manual preference.
const railActive = computed(() => {
  const rail = railBreakpointPx.value;
  if (rail == null || isMobile.value || rootWidth.value <= 0) return false;
  return rootWidth.value >= breakpointPx.value && rootWidth.value < rail;
});

const setupResizeObserver = () => {
  const el = rootEl.value;
  // `as` a component would yield an instance, not an element; degrade gracefully.
  if (typeof ResizeObserver === 'undefined' || !(el instanceof Element)) return;
  teardownResizeObserver();
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) rootWidth.value = entry.contentRect.width;
  });
  resizeObserver.observe(el);
  rootWidth.value = el.getBoundingClientRect().width;
};

const teardownResizeObserver = () => {
  resizeObserver?.disconnect();
  resizeObserver = null;
};

// Collapsing is desktop-only, so the built-in toggle follows the same rule.
const showCollapseToggle = computed(
  () => !isMobile.value && props.collapsible && props.showCollapseButton,
);

// The effective (visual) collapsed state descendants and slots see: the drawer
// is always expanded on mobile; the auto-rail band forces the rail; otherwise
// the user's manual preference (isCollapsed) applies. The auto band never
// mutates isCollapsed, so it emits no update:collapsed / collapse-change — those
// stay reserved for explicit user action, and the preference returns when the
// width grows back past railBreakpoint.
const effectiveCollapsed = computed(() =>
  isMobile.value ? false : railActive.value ? true : isCollapsed.value,
);

// The glyph points the way the rail will move: collapsing a left sidebar folds
// it left, expanding it pushes right (mirrored for a right-anchored sidebar).
const CollapseIcon = computed(() => {
  const pointsStart = props.side === 'right' ? effectiveCollapsed.value : !effectiveCollapsed.value;
  return getTreeIcon(pointsStart ? 'panel-left' : 'panel-right');
});

const surfaceRef = ref<HTMLElement | null>(null);
const previousFocusedElement = ref<HTMLElement | null>(null);
let previousBodyOverflow = '';
let bodyLocked = false;

const lockBodyScroll = () => {
  if (typeof document === 'undefined' || bodyLocked) {
    return;
  }

  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  bodyLocked = true;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined' || !bodyLocked) {
    return;
  }

  document.body.style.overflow = previousBodyOverflow;
  bodyLocked = false;
};

const focusSurface = () => {
  nextTick(() => {
    if (!surfaceRef.value) {
      return;
    }

    const focused = focusFirst(surfaceRef.value);
    if (!focused) {
      surfaceRef.value.focus();
    }
  });
};

const openSidebar = () => {
  previousFocusedElement.value =
    typeof document === 'undefined'
      ? null
      : (document.activeElement as HTMLElement | null);
  setSidebarOpen(true);
};

const closeSidebar = () => {
  setSidebarOpen(false);
};

const toggleSidebar = () => {
  if (isSidebarOpen.value) {
    closeSidebar();
  } else {
    openSidebar();
  }
};

const toggleCollapsed = () => {
  if (!props.collapsible) {
    return;
  }

  setCollapsed(!isCollapsed.value);
};

const onOverlayClick = () => {
  if (props.closeOnOverlay) {
    closeSidebar();
  }
};

const onKeydown = (event: KeyboardEvent) => {
  if (isEscapeKey(event) && props.closeOnEscape) {
    event.preventDefault();
    closeSidebar();
    return;
  }

  if (event.key !== 'Tab' || !surfaceRef.value) {
    return;
  }

  const focusable = getFocusableElements(surfaceRef.value);

  if (!focusable.length) {
    event.preventDefault();
    surfaceRef.value.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = document.activeElement as HTMLElement | null;

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    focusLast(surfaceRef.value);
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    focusFirst(surfaceRef.value);
  }
};

// The off-canvas drawer only exists in mobile mode; keep body-scroll lock and
// focus handling in sync with both the open flag and the responsive mode.
const syncOverlayState = (open: boolean, wasOpen: boolean) => {
  if (open && isMobile.value) {
    lockBodyScroll();
    focusSurface();
    return;
  }

  if (wasOpen) {
    unlockBodyScroll();
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  }
};

watch(isSidebarOpen, (value, previousValue) => {
  syncOverlayState(value, Boolean(previousValue));
});

// Entering immersive removes the drawer from the DOM without changing
// `sidebarOpen`, so the sidebarOpen watcher never fires and would leave the
// body scroll-locked with focus stranded on an unmounted surface. Release and
// re-arm here, mirroring the responsive-mode watcher below.
watch(isImmersive, (immersive) => {
  if (!isSidebarOpen.value || !isMobile.value) {
    return;
  }

  if (immersive) {
    unlockBodyScroll();
    nextTick(() => {
      previousFocusedElement.value?.focus();
    });
  } else {
    lockBodyScroll();
    focusSurface();
  }
});

watch(isMobile, (mobile) => {
  if (!isSidebarOpen.value) {
    return;
  }

  // Leaving mobile removes the drawer from the DOM, so release the lock and
  // restore focus; re-entering mobile while "open" re-arms the overlay.
  if (mobile) {
    lockBodyScroll();
    focusSurface();
  } else {
    unlockBodyScroll();
  }
});

onMounted(() => {
  setupResizeObserver();
});

onBeforeUnmount(() => {
  teardownResizeObserver();
  unlockBodyScroll();
});

provide(treeSidebarInjectionKey, {
  collapsed: effectiveCollapsed,
});

const rootClasses = computed(() => [
  't-app-shell',
  `t-app-shell--${props.side}`,
  {
    'is-mobile': isMobile.value,
    'is-collapsed':
      !isMobile.value && (railActive.value || (props.collapsible && isCollapsed.value)),
    'is-sidebar-open': isMobile.value && isSidebarOpen.value,
    'is-immersive': isImmersive.value,
  },
  attrs.class,
]);

const rootStyle = computed(() => [
  {
    '--tree-app-shell-sidebar-width': props.sidebarWidth,
    '--tree-app-shell-collapsed-width': props.collapsedWidth,
  },
  attrs.style,
]);

const rootAttrs = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs;
  return rest;
});

const slotProps = computed<AppShellSlotProps>(() => ({
  mobile: isMobile.value,
  collapsed: effectiveCollapsed.value,
  sidebarOpen: isSidebarOpen.value,
  immersive: isImmersive.value,
  toggleSidebar,
  closeSidebar,
  toggleCollapsed,
  toggleImmersive,
}));
</script>

<template>
  <component
    :is="as"
    ref="rootEl"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
    :data-mobile="isMobile ? 'true' : 'false'"
  >
    <header
      class="t-app-shell__header"
      :class="{
        'has-start': Boolean($slots['header-start']),
        'has-end': Boolean($slots['header-end']),
      }"
    >
      <button
        v-if="isMobile && showMenuButton"
        type="button"
        class="t-app-shell__menu-button"
        :aria-label="menuLabel"
        :aria-expanded="isSidebarOpen"
        :aria-controls="sidebarId"
        @click="toggleSidebar"
      >
        <slot
          name="menu-icon"
          :sidebar-open="isSidebarOpen"
        >
          <MenuIcon
            v-bind="treeIconDefaults"
            :size="24"
            aria-hidden="true"
          />
        </slot>
      </button>

      <div
        v-if="$slots['header-start']"
        class="t-app-shell__header-start"
      >
        <slot
          name="header-start"
          v-bind="slotProps"
        />
      </div>

      <div class="t-app-shell__header-content">
        <slot
          name="header"
          v-bind="slotProps"
        />
      </div>

      <div
        v-if="$slots['header-end']"
        class="t-app-shell__header-end"
      >
        <slot
          name="header-end"
          v-bind="slotProps"
        />
      </div>
    </header>

    <aside
      v-if="!isMobile"
      :id="sidebarId"
      class="t-app-shell__sidebar"
      :aria-label="sidebarLabel"
    >
      <div
        v-if="$slots['sidebar-header']"
        class="t-app-shell__sidebar-header"
      >
        <slot
          name="sidebar-header"
          v-bind="slotProps"
        />
      </div>

      <div class="t-app-shell__sidebar-body">
        <slot
          name="sidebar"
          v-bind="slotProps"
        />
      </div>

      <div
        v-if="$slots['sidebar-footer'] || showCollapseToggle"
        class="t-app-shell__sidebar-footer"
      >
        <slot
          name="sidebar-footer"
          v-bind="slotProps"
        />

        <button
          v-if="showCollapseToggle"
          type="button"
          class="t-app-shell__collapse-button"
          :aria-label="isCollapsed ? expandLabel : collapseLabel"
          :aria-expanded="!isCollapsed"
          :aria-controls="sidebarId"
          @click="toggleCollapsed"
        >
          <slot
            name="collapse-icon"
            :collapsed="effectiveCollapsed"
          >
            <CollapseIcon
              v-bind="treeIconDefaults"
              aria-hidden="true"
            />
          </slot>
        </button>
      </div>
    </aside>

    <main class="t-app-shell__main">
      <slot
        :mobile="isMobile"
        :collapsed="effectiveCollapsed"
        :immersive="isImmersive"
        :toggle-immersive="toggleImmersive"
      />
    </main>

    <transition name="t-app-shell-fade">
      <div
        v-if="isMobile && isSidebarOpen && !isImmersive"
        class="t-app-shell__overlay"
      >
        <div
          class="t-app-shell__backdrop"
          aria-hidden="true"
          @click="onOverlayClick"
        />
        <aside
          :id="sidebarId"
          ref="surfaceRef"
          class="t-app-shell__drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="sidebarLabel"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <div class="t-app-shell__drawer-topbar">
            <button
              type="button"
              class="t-app-shell__drawer-close"
              :aria-label="closeLabel"
              @click="closeSidebar"
            >
              <CloseIcon v-bind="treeIconDefaults" />
            </button>
          </div>
          <div class="t-app-shell__drawer-body">
            <div
              v-if="$slots['sidebar-header']"
              class="t-app-shell__sidebar-header"
            >
              <slot
                name="sidebar-header"
                v-bind="slotProps"
              />
            </div>

            <div class="t-app-shell__sidebar-body">
              <slot
                name="sidebar"
                v-bind="slotProps"
              />
            </div>

            <div
              v-if="$slots['sidebar-footer']"
              class="t-app-shell__sidebar-footer"
            >
              <slot
                name="sidebar-footer"
                v-bind="slotProps"
              />
            </div>
          </div>
        </aside>
      </div>
    </transition>
  </component>
</template>
