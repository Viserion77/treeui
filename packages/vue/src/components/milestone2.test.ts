import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TreeContainer from './TreeContainer.vue';
import TreeGrid from './TreeGrid.vue';
import TreeStack from './TreeStack.vue';
import TreeNavbar from './TreeNavbar.vue';
import TreeNavMenu from './TreeNavMenu.vue';
import TreeSidebar from './TreeSidebar.vue';

describe('Milestone 2 components', () => {
  it('renders container with sizing and polymorphic tag', () => {
    const wrapper = mount(TreeContainer, {
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
    expect(wrapper.classes()).toContain('tree-container--xl');
    expect(wrapper.classes()).not.toContain('is-padded');
    expect(wrapper.text()).toContain('Container content');
  });

  it('applies grid styles for fixed and auto-fit layouts', () => {
    const fixed = mount(TreeGrid, {
      props: {
        columns: 3,
        gap: '1rem',
      },
    });

    expect((fixed.element as HTMLElement).style.gridTemplateColumns).toContain('repeat(3');
    expect((fixed.element as HTMLElement).style.gap).toBe('1rem');

    const auto = mount(TreeGrid, {
      props: {
        minItemWidth: '18rem',
      },
    });

    expect((auto.element as HTMLElement).style.gridTemplateColumns).toContain('18rem');
  });

  it('renders stack direction and wrapping controls', () => {
    const wrapper = mount(TreeStack, {
      props: {
        direction: 'horizontal',
        wrap: true,
        reverse: true,
        justify: 'space-between',
      },
    });

    expect(wrapper.classes()).toContain('tree-stack--horizontal');
    expect(wrapper.classes()).toContain('is-wrapping');
    expect(wrapper.classes()).toContain('is-reversed');
    expect((wrapper.element as HTMLElement).style.justifyContent).toBe('space-between');
  });

  it('renders navbar slots and sticky state', () => {
    const wrapper = mount(TreeNavbar, {
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
    expect(wrapper.find('.tree-navbar__section--start').text()).toContain('TreeUI');
    expect(wrapper.find('.tree-navbar__section--end').text()).toContain('Invite');
  });

  it('supports keyboard focus and selection in nav menu', async () => {
    const wrapper = mount(TreeNavMenu, {
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

    const items = wrapper.findAll('.tree-nav-menu__item');
    await items[0].trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    expect(document.activeElement).toBe(items[1].element);

    await items[1].trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['projects']);
    expect(wrapper.emitted('select')?.[0]?.[0]).toBe('projects');

    wrapper.unmount();
  });

  it('toggles sidebar collapsed state and updates nested nav menu presentation', async () => {
    const wrapper = mount(TreeSidebar, {
      attachTo: document.body,
      props: {
        defaultCollapsed: false,
      },
      slots: {
        default: `
          <TreeNavMenu
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
          TreeNavMenu,
        },
      },
    });

    expect(wrapper.classes()).not.toContain('is-collapsed');
    expect(wrapper.find('.tree-nav-menu').classes()).not.toContain('is-collapsed');

    await wrapper.get('.tree-sidebar__toggle').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:collapsed')?.[0]).toEqual([true]);
    expect(wrapper.classes()).toContain('is-collapsed');
    expect(wrapper.find('.tree-nav-menu').classes()).toContain('is-collapsed');

    wrapper.unmount();
  });
});
