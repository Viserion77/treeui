import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TreeBadge from './TreeBadge.vue';
import TreeButton from './TreeButton.vue';
import TreeCard from './TreeCard.vue';
import TreeDatePicker from './TreeDatePicker.vue';
import TreeInput from './TreeInput.vue';
import TreeModal from './TreeModal.vue';
import TreeSpinner from './TreeSpinner.vue';
import TreeTooltip from './TreeTooltip.vue';

describe('@treeui/vue', () => {
  it('renders button states and blocks clicks while loading', async () => {
    const wrapper = mount(TreeButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Save changes',
      },
    });

    expect(wrapper.classes()).toContain('tree-button--solid');
    expect(wrapper.attributes('aria-busy')).toBe('true');

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders polymorphic button with correct a11y when disabled', async () => {
    const wrapper = mount(TreeButton, {
      props: {
        as: 'a',
        disabled: true,
      },
      slots: {
        default: 'Disabled link',
      },
    });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('tabindex')).toBe('-1');
    expect(wrapper.attributes('disabled')).toBeUndefined();

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders polymorphic button without a11y attrs when enabled', async () => {
    const wrapper = mount(TreeButton, {
      props: {
        as: 'a',
      },
      slots: {
        default: 'Active link',
      },
    });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('aria-disabled')).toBeUndefined();
    expect(wrapper.attributes('tabindex')).toBeUndefined();
    expect(wrapper.attributes('type')).toBeUndefined();

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('emits input updates and keeps prefix and suffix slots', async () => {
    const wrapper = mount(TreeInput, {
      props: {
        modelValue: 'hello',
        'onUpdate:modelValue': (value: string) => value,
      },
      attrs: {
        'aria-label': 'Project name',
      },
      slots: {
        prefix: '<span>pre</span>',
        suffix: '<span>suf</span>',
      },
    });

    await wrapper.get('input').setValue('hello tree');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello tree']);
    expect(wrapper.text()).toContain('pre');
    expect(wrapper.text()).toContain('suf');
    expect(wrapper.get('input').attributes('aria-label')).toBe('Project name');
  });

  it('renders card slots', () => {
    const wrapper = mount(TreeCard, {
      slots: {
        header: '<strong>TreeUI</strong>',
        default: '<p>Quiet elegance for product UI.</p>',
        footer: '<small>v0.1.0</small>',
      },
    });

    expect(wrapper.find('.tree-card__header').exists()).toBe(true);
    expect(wrapper.find('.tree-card__footer').exists()).toBe(true);
  });

  it('renders badge variants', () => {
    const wrapper = mount(TreeBadge, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Critical',
      },
    });

    expect(wrapper.classes()).toContain('tree-badge--danger');
    expect(wrapper.text()).toContain('Critical');
  });

  it('exposes an accessible loading label on the spinner', () => {
    const wrapper = mount(TreeSpinner, {
      props: {
        label: 'Saving',
      },
    });

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-label')).toBe('Saving');
  });

  it('opens the tooltip from a slotted trigger and emits state changes', async () => {
    vi.useFakeTimers();

    const wrapper = mount(TreeTooltip, {
      attachTo: document.body,
      props: {
        content: 'Helpful hint',
        delay: 120,
      },
      slots: {
        trigger: '<button type="button">Hover me</button>',
      },
    });

    await wrapper.get('button').trigger('focus');
    await nextTick();

    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true]);

    await wrapper.get('button').trigger('blur');
    vi.runAllTimers();
    await nextTick();

    wrapper.unmount();
    vi.useRealTimers();
  });

  it('selects dates from the calendar and emits the shared open contract', async () => {
    const wrapper = mount(TreeDatePicker, {
      props: {
        modelValue: '2026-03-15',
      },
      attrs: {
        'aria-label': 'Release date',
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Release date"]').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.get('[data-date="2026-03-20"]').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-03-20']);
    expect(wrapper.emitted('select')?.[0]).toEqual(['2026-03-20']);
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);

    wrapper.unmount();
  });

  it('supports keyboard navigation and month changes in the date picker', async () => {
    const wrapper = mount(TreeDatePicker, {
      props: {
        modelValue: '2026-03-15',
      },
      attrs: {
        'aria-label': 'Launch date',
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Launch date"]').trigger('keydown', {
      key: 'ArrowDown',
    });
    await nextTick();

    const selectedDay = wrapper.get('[data-date="2026-03-15"]');

    await selectedDay.trigger('keydown', { key: 'ArrowRight' });
    await nextTick();
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-03-16');

    await wrapper.get('[data-date="2026-03-16"]').trigger('keydown', { key: 'PageDown' });
    await nextTick();
    expect(wrapper.get('.tree-date-picker__month').text()).toContain('April');

    await wrapper.get('[data-date="2026-04-16"]').trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it('opens the modal from a trigger slot and closes on escape', async () => {
    const wrapper = mount(TreeModal, {
      attachTo: document.body,
      props: {
        title: 'Invite teammate',
        description: 'Share workspace access with your team.',
      },
      slots: {
        trigger: '<button type="button">Open modal</button>',
        default: '<p>Modal content</p>',
        footer: `
          <button type="button" id="cancel-action">Cancel</button>
          <button type="button" id="confirm-action">Confirm</button>
        `,
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Invite teammate');
    expect(document.body.textContent).toContain('Modal content');

    (
      document.getElementById('confirm-action') as HTMLButtonElement | null
    )?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await nextTick();

    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement?.textContent).toContain('Open modal');

    wrapper.unmount();
  });

  it('traps focus inside the modal and closes from the overlay', async () => {
    const wrapper = mount(TreeModal, {
      attachTo: document.body,
      props: {
        defaultOpen: true,
        showCloseButton: false,
      },
      slots: {
        header: '<h2>Focus trap</h2>',
        default: '<p>Keep focus inside the surface.</p>',
        footer: `
          <button type="button" id="first-action">First</button>
          <button type="button" id="last-action">Last</button>
        `,
      },
    });

    await nextTick();
    (document.getElementById('last-action') as HTMLButtonElement | null)?.focus();

    (
      document.getElementById('last-action') as HTMLButtonElement | null
    )?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
    await nextTick();
    expect(document.activeElement?.id).toBe('first-action');

    (
      document.getElementById('first-action') as HTMLButtonElement | null
    )?.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Tab',
        shiftKey: true,
      }),
    );
    await nextTick();
    expect(document.activeElement?.id).toBe('last-action');

    (
      document.body.querySelector('.tree-modal__backdrop') as HTMLDivElement | null
    )?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });
});
