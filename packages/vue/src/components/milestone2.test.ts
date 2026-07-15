import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TContainer from './TContainer.vue';
import TGrid from './TGrid.vue';
import TStack from './TStack.vue';
import TNavbar from './TNavbar.vue';
import TNavMenu from './TNavMenu.vue';
import TSidebar from './TSidebar.vue';
import TAppShell from './TAppShell.vue';

describe('Milestone 2 components', () => {
  it('renders container with sizing and polymorphic tag', () => {
    const wrapper = mount(TContainer, {
      props: {
        as: 'section',
        size: 'xl',
        padded: false,
      },
      slots: {
        default: 'Container content',
      },
    });

    expect(wrapper.element.tagName).toBe('SECTION');
    expect(wrapper.classes()).toContain('t-container--xl');
    expect(wrapper.classes()).not.toContain('is-padded');
    expect(wrapper.text()).toContain('Container content');
  });

  it('applies grid styles for fixed and auto-fit layouts', () => {
    const fixed = mount(TGrid, {
      props: {
        columns: 3,
        gap: '1rem',
      },
    });

    expect((fixed.element as HTMLElement).style.gridTemplateColumns).toContain('repeat(3');
    expect((fixed.element as HTMLElement).style.gap).toBe('1rem');

    const auto = mount(TGrid, {
      props: {
        minItemWidth: '18rem',
      },
    });

    expect((auto.element as HTMLElement).style.gridTemplateColumns).toContain('18rem');
  });

  it('renders stack direction and wrapping controls', () => {
    const wrapper = mount(TStack, {
      props: {
        direction: 'horizontal',
        wrap: true,
        reverse: true,
        justify: 'space-between',
      },
    });

    expect(wrapper.classes()).toContain('t-stack--horizontal');
    expect(wrapper.classes()).toContain('is-wrapping');
    expect(wrapper.classes()).toContain('is-reversed');
    expect((wrapper.element as HTMLElement).style.justifyContent).toBe('space-between');
  });

  it('renders navbar slots and sticky state', () => {
    const wrapper = mount(TNavbar, {
      props: {
        sticky: true,
        elevated: true,
      },
      slots: {
        start: '<strong>TreeUI</strong>',
        default: '<span>Center</span>',
        end: '<button type="button">Invite</button>',
      },
    });

    expect(wrapper.classes()).toContain('is-sticky');
    expect(wrapper.classes()).toContain('is-elevated');
    expect(wrapper.find('.t-navbar__section--start').text()).toContain('TreeUI');
    expect(wrapper.find('.t-navbar__section--end').text()).toContain('Invite');
  });

  it('supports keyboard focus and selection in nav menu', async () => {
    const wrapper = mount(TNavMenu, {
      attachTo: document.body,
      props: {
        modelValue: 'overview',
        items: [
          { label: 'Overview', value: 'overview' },
          { label: 'Projects', value: 'projects' },
          { label: 'Settings', value: 'settings', disabled: true },
        ],
      },
      attrs: {
        'aria-label': 'Workspace navigation',
      },
    });

    const items = wrapper.findAll('.t-nav-menu__item');
    await items[0].trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    expect(document.activeElement).toBe(items[1].element);

    await items[1].trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['projects']);
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('projects');

    wrapper.unmount();
  });

  it('toggles sidebar collapsed state and updates nested nav menu presentation', async () => {
    const wrapper = mount(TSidebar, {
      attachTo: document.body,
      props: {
        defaultCollapsed: false,
      },
      slots: {
        default: `
          <TNavMenu
            aria-label="Nav"
            :items="[
              { label: 'Overview', value: 'overview', shortLabel: 'O' },
              { label: 'Projects', value: 'projects', shortLabel: 'P' }
            ]"
            model-value="overview"
          />
        `,
      },
      global: {
        components: {
          TNavMenu,
        },
      },
    });

    expect(wrapper.classes()).not.toContain('is-collapsed');
    expect(wrapper.find('.t-nav-menu').classes()).not.toContain('is-collapsed');

    await wrapper.get('.t-sidebar__toggle').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true]);
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.find('.t-nav-menu').classes()).toContain('is-collapsed');

    wrapper.unmount();
  });

  it('renders app shell regions and full-viewport desktop layout', () => {
    const wrapper = mount(TAppShell, {
      props: {
        side: 'left',
      },
      slots: {
        header: '<strong>Brand</strong>',
        sidebar: '<nav>Navigation</nav>',
        default: '<p>Main content</p>',
      },
    });

    expect(wrapper.classes()).toContain('t-app-shell');
    expect(wrapper.classes()).toContain('t-app-shell--left');
    expect(wrapper.classes()).not.toContain('is-mobile');
    expect(wrapper.attributes('data-mobile')).toBe('false');

    // Desktop keeps the sidebar in-flow (no overlay) and shows every region.
    expect(wrapper.find('.t-app-shell__header').text()).toContain('Brand');
    expect(wrapper.find('.t-app-shell__sidebar').text()).toContain('Navigation');
    expect(wrapper.find('.t-app-shell__main').text()).toContain('Main content');
    expect(wrapper.find('.t-app-shell__menu-button').exists()).toBe(false);
    expect(wrapper.find('.t-app-shell__overlay').exists()).toBe(false);
  });

  it('provides collapsed state to a nested nav menu on desktop', async () => {
    const wrapper = mount(TAppShell, {
      props: {
        collapsible: true,
        defaultCollapsed: true,
      },
      slots: {
        sidebar: `
          <TNavMenu
            aria-label="Nav"
            :items="[
              { label: 'Overview', value: 'overview', shortLabel: 'O' },
              { label: 'Projects', value: 'projects', shortLabel: 'P' }
            ]"
            model-value="overview"
          />
        `,
      },
      global: {
        components: {
          TNavMenu,
        },
      },
    });

    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.find('.t-nav-menu').classes()).toContain('is-collapsed');
  });

  it('switches the sidebar to an off-canvas drawer in mobile mode', async () => {
    const wrapper = mount(TAppShell, {
      attachTo: document.body,
      props: {
        mobile: true,
      },
      slots: {
        sidebar: '<nav>Mobile navigation</nav>',
        default: '<p>Main content</p>',
      },
    });

    expect(wrapper.classes()).toContain('is-mobile');
    expect(wrapper.attributes('data-mobile')).toBe('true');
    // The in-flow sidebar is removed; a menu button appears instead.
    expect(wrapper.find('.t-app-shell__sidebar').exists()).toBe(false);
    expect(wrapper.find('.t-app-shell__menu-button').exists()).toBe(true);
    expect(wrapper.find('.t-app-shell__drawer').exists()).toBe(false);

    await wrapper.get('.t-app-shell__menu-button').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:sidebarOpen')?.[0]).toEqual([true]);

    const drawer = wrapper.find('.t-app-shell__drawer');
    expect(drawer.exists()).toBe(true);
    expect(drawer.attributes('role')).toBe('dialog');
    expect(drawer.attributes('aria-modal')).toBe('true');
    expect(drawer.text()).toContain('Mobile navigation');

    wrapper.unmount();
  });

  it('closes the mobile drawer on Escape and backdrop click', async () => {
    const wrapper = mount(TAppShell, {
      attachTo: document.body,
      props: {
        mobile: true,
        defaultSidebarOpen: true,
      },
      slots: {
        sidebar: '<nav>Mobile navigation</nav>',
      },
    });

    expect(wrapper.find('.t-app-shell__drawer').exists()).toBe(true);

    await wrapper
      .get('.t-app-shell__drawer')
      .trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.emitted('update:sidebarOpen')?.[0]).toEqual([false]);
    expect(wrapper.find('.t-app-shell__drawer').exists()).toBe(false);

    wrapper.unmount();
  });
});
