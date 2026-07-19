import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import TCard from './TCard.vue';
import TDropdown from './TDropdown.vue';
import TPopover from './TPopover.vue';

const items = [
  { label: 'Edit', value: 'edit' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Delete', value: 'delete' },
];

describe('TCard slot contract', () => {
  it('keeps the actions slot rendered when a custom header is provided', () => {
    const wrapper = mount(TCard, {
      slots: {
        header: '<span class="custom-header">Custom</span>',
        actions: '<button class="custom-action">Action</button>',
        default: 'Body',
      },
    });

    expect(wrapper.find('.custom-header').exists()).toBe(true);
    expect(wrapper.find('.t-card__actions').exists()).toBe(true);
    expect(wrapper.find('.custom-action').exists()).toBe(true);
  });

  it('renders actions alongside the title fallback when no header slot is provided', () => {
    const wrapper = mount(TCard, {
      props: { title: 'Title' },
      slots: {
        actions: '<button class="custom-action">Action</button>',
      },
    });

    expect(wrapper.find('.t-card__title').text()).toBe('Title');
    expect(wrapper.find('.custom-action').exists()).toBe(true);
  });

  it('does not render the title fallback when the header slot replaces it', () => {
    const wrapper = mount(TCard, {
      props: { title: 'Title' },
      slots: {
        header: '<span class="custom-header">Custom</span>',
      },
    });

    expect(wrapper.find('.t-card__title').exists()).toBe(false);
    expect(wrapper.find('.custom-header').exists()).toBe(true);
  });

  it('keeps the footer slot isolated from the header slot', () => {
    const wrapper = mount(TCard, {
      slots: {
        header: '<span class="custom-header">Custom</span>',
        footer: '<span class="custom-footer">Footer</span>',
      },
    });

    expect(wrapper.find('.t-card__footer .custom-footer').exists()).toBe(true);
  });
});

describe('TDropdown trigger slot contract', () => {
  const mountWithCustomTrigger = () =>
    mount(TDropdown, {
      attachTo: document.body,
      props: { items },
      slots: {
        trigger: '<button class="custom-trigger" type="button">Open</button>',
      },
    });

  it('opens the menu from a custom trigger click', async () => {
    const wrapper = mountWithCustomTrigger();

    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(false);
    await wrapper.find('.custom-trigger').trigger('click');

    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(true);
    wrapper.unmount();
  });

  it('opens the menu from a custom trigger keyboard activation', async () => {
    const wrapper = mountWithCustomTrigger();

    await wrapper.find('.custom-trigger').trigger('keydown', { key: 'Enter' });
    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(true);

    wrapper.unmount();
  });

  it('moves focus through items with the arrow keys from a custom trigger', async () => {
    const wrapper = mountWithCustomTrigger();

    await wrapper.find('.custom-trigger').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    const menuItems = wrapper.findAll('.t-dropdown__item');
    expect(document.activeElement).toBe(menuItems[0].element);

    await menuItems[0].trigger('keydown', { key: 'ArrowDown' });
    expect(document.activeElement).toBe(menuItems[1].element);

    wrapper.unmount();
  });

  it('restores focus to the custom trigger on Escape', async () => {
    const wrapper = mountWithCustomTrigger();
    const trigger = wrapper.find('.custom-trigger');

    await trigger.trigger('click');
    await nextTick();

    await wrapper.findAll('.t-dropdown__item')[0].trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it('restores focus to the custom trigger after selecting an item', async () => {
    const wrapper = mountWithCustomTrigger();
    const trigger = wrapper.find('.custom-trigger');

    await trigger.trigger('click');
    await nextTick();

    await wrapper.findAll('.t-dropdown__item')[1].trigger('click');
    await nextTick();

    expect(wrapper.emitted('select')?.[0]).toEqual(['duplicate']);
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it('keeps the built-in trigger button working when the slot is unused', async () => {
    const wrapper = mount(TDropdown, {
      attachTo: document.body,
      props: { items, label: 'Actions' },
    });

    const trigger = wrapper.find('.t-dropdown__trigger');
    expect(trigger.exists()).toBe(true);
    expect(trigger.attributes('aria-expanded')).toBe('false');

    await trigger.trigger('click');
    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(true);
    expect(wrapper.find('.t-dropdown__trigger').attributes('aria-expanded')).toBe('true');

    await trigger.trigger('click');
    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(false);

    await trigger.trigger('click');
    await nextTick();
    await wrapper.findAll('.t-dropdown__item')[0].trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it('does not open from the trigger wrapper when disabled', async () => {
    const wrapper = mount(TDropdown, {
      attachTo: document.body,
      props: { items, disabled: true },
      slots: {
        trigger: '<button class="custom-trigger" type="button">Open</button>',
      },
    });

    await wrapper.find('.custom-trigger').trigger('click');

    expect(wrapper.find('.t-dropdown__menu').exists()).toBe(false);
    expect(wrapper.emitted('update:open')).toBeUndefined();
    wrapper.unmount();
  });

  it('exposes the menu id so a custom trigger can wire aria-controls', async () => {
    const wrapper = mount(TDropdown, {
      attachTo: document.body,
      props: { items, id: 'dropdown-menu' },
      slots: {
        trigger: `
          <button
            class="custom-trigger"
            type="button"
            aria-haspopup="menu"
            :aria-expanded="isOpen"
            :aria-controls="isOpen ? menuId : undefined"
          >Open</button>
        `,
      },
    });

    const trigger = wrapper.find('.custom-trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.attributes('aria-controls')).toBeUndefined();

    await trigger.trigger('click');
    await nextTick();

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(trigger.attributes('aria-controls')).toBe('dropdown-menu');
    expect(wrapper.find('.t-dropdown__menu').attributes('id')).toBe('dropdown-menu');
    wrapper.unmount();
  });
});

describe('TPopover trigger slot contract', () => {
  const mountWithCustomTrigger = () =>
    mount(TPopover, {
      attachTo: document.body,
      slots: {
        trigger: '<button class="custom-trigger" type="button">Open</button>',
        default: '<button class="panel-action" type="button">Act</button>',
      },
    });

  it('restores focus to the custom trigger on Escape', async () => {
    const wrapper = mountWithCustomTrigger();
    const trigger = wrapper.find('.custom-trigger');

    await trigger.trigger('click');
    await nextTick();
    expect(wrapper.find('.t-popover__content').exists()).toBe(true);

    await wrapper.find('.t-popover__content').trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.find('.t-popover__content').exists()).toBe(false);
    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it('restores focus to the built-in trigger on Escape', async () => {
    const wrapper = mount(TPopover, {
      attachTo: document.body,
      slots: { default: '<button class="panel-action" type="button">Act</button>' },
    });

    const trigger = wrapper.find('.t-popover__trigger');
    await trigger.trigger('click');
    await nextTick();

    await wrapper.find('.t-popover__content').trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(document.activeElement).toBe(trigger.element);
    wrapper.unmount();
  });

  it('exposes the content id so a custom trigger can wire aria-controls', async () => {
    const wrapper = mount(TPopover, {
      attachTo: document.body,
      props: { id: 'popover-panel' },
      slots: {
        trigger: `
          <button
            class="custom-trigger"
            type="button"
            aria-haspopup="dialog"
            :aria-expanded="isOpen"
            :aria-controls="isOpen ? contentId : undefined"
          >Open</button>
        `,
        default: 'Panel',
      },
    });

    const trigger = wrapper.find('.custom-trigger');
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(trigger.attributes('aria-controls')).toBeUndefined();

    await trigger.trigger('click');
    await nextTick();

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(trigger.attributes('aria-controls')).toBe('popover-panel');
    expect(wrapper.find('.t-popover__content').attributes('id')).toBe('popover-panel');
    wrapper.unmount();
  });
});
