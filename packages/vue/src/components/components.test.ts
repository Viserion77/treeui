import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TreeBadge from './TreeBadge.vue';
import TreeButton from './TreeButton.vue';
import TreeCard from './TreeCard.vue';
import TreeCheckbox from './TreeCheckbox.vue';
import TreeDatePicker from './TreeDatePicker.vue';
import TreeInput from './TreeInput.vue';
import TreeTextarea from './TreeTextarea.vue';
import TreeModal from './TreeModal.vue';
import TreeSpinner from './TreeSpinner.vue';
import TreeTooltip from './TreeTooltip.vue';
import TreeRadio from './TreeRadio.vue';
import TreeRadioGroup from './TreeRadioGroup.vue';
import TreeSelect from './TreeSelect.vue';
import TreeFormField from './TreeFormField.vue';
import TreeSwitch from './TreeSwitch.vue';

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

  it('emits textarea updates and applies size class', async () => {
    const wrapper = mount(TreeTextarea, {
      props: {
        modelValue: 'hello',
        size: 'lg',
        'onUpdate:modelValue': (value: string) => value,
      },
      attrs: {
        'aria-label': 'Description',
      },
    });

    expect(wrapper.classes()).toContain('tree-textarea');
    expect(wrapper.classes()).toContain('tree-textarea--lg');

    await wrapper.get('textarea').setValue('hello tree');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello tree']);
    expect(wrapper.get('textarea').attributes('aria-label')).toBe('Description');
  });

  it('applies invalid and disabled states to textarea', () => {
    const invalid = mount(TreeTextarea, {
      props: { modelValue: '', invalid: true },
      attrs: { 'aria-label': 'Invalid' },
    });

    expect(invalid.classes()).toContain('is-invalid');
    expect(invalid.get('textarea').attributes('aria-invalid')).toBe('true');

    const disabled = mount(TreeTextarea, {
      props: { modelValue: '', disabled: true },
      attrs: { 'aria-label': 'Disabled' },
    });

    expect(disabled.classes()).toContain('is-disabled');
    expect(disabled.get('textarea').attributes('disabled')).toBeDefined();
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

  it('toggles checkbox and emits update:modelValue', async () => {
    const wrapper = mount(TreeCheckbox, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => value,
      },
      slots: {
        default: 'Accept terms',
      },
    });

    expect(wrapper.classes()).toContain('tree-checkbox');
    expect(wrapper.classes()).not.toContain('is-checked');
    expect(wrapper.text()).toContain('Accept terms');

    await wrapper.get('input[type="checkbox"]').trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('renders checked state with correct aria', () => {
    const wrapper = mount(TreeCheckbox, {
      props: {
        modelValue: true,
      },
      slots: {
        default: 'Checked item',
      },
    });

    expect(wrapper.classes()).toContain('is-checked');
    expect(wrapper.get('input').attributes('aria-checked')).toBe('true');
  });

  it('renders indeterminate state with aria-checked mixed', () => {
    const wrapper = mount(TreeCheckbox, {
      props: {
        modelValue: false,
        indeterminate: true,
      },
      slots: {
        default: 'Select all',
      },
    });

    expect(wrapper.classes()).toContain('is-indeterminate');
    expect(wrapper.get('input').attributes('aria-checked')).toBe('mixed');
  });

  it('applies disabled state to checkbox', () => {
    const wrapper = mount(TreeCheckbox, {
      props: {
        modelValue: false,
        disabled: true,
      },
      slots: {
        default: 'Disabled option',
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
  });

  it('applies invalid state to checkbox', () => {
    const wrapper = mount(TreeCheckbox, {
      props: {
        modelValue: false,
        invalid: true,
      },
      slots: {
        default: 'Required field',
      },
    });

    expect(wrapper.classes()).toContain('is-invalid');
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true');
  });

  it('renders checkbox sizes', () => {
    const sm = mount(TreeCheckbox, { props: { size: 'sm' as const } });
    const lg = mount(TreeCheckbox, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('tree-checkbox--sm');
    expect(lg.classes()).toContain('tree-checkbox--lg');
  });

  it('selects a radio option and emits update:modelValue on the group', async () => {
    const wrapper = mount(TreeRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'test-group',
        'onUpdate:modelValue': (value: string) => value,
      },
      slots: {
        default: {
          components: { TreeRadio },
          template: `
            <TreeRadio value="a">Option A</TreeRadio>
            <TreeRadio value="b">Option B</TreeRadio>
          `,
        },
      },
    });

    expect(wrapper.find('.tree-radio-group').exists()).toBe(true);
    expect(wrapper.find('.tree-radio-group').attributes('role')).toBe('radiogroup');

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].attributes('name')).toBe('test-group');
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
    expect((radios[1].element as HTMLInputElement).checked).toBe(false);

    await radios[1].trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  it('renders checked state with correct aria on radio', () => {
    const wrapper = mount(TreeRadioGroup, {
      props: {
        modelValue: 'yes',
        name: 'checked-test',
      },
      slots: {
        default: {
          components: { TreeRadio },
          template: `
            <TreeRadio value="yes">Yes</TreeRadio>
            <TreeRadio value="no">No</TreeRadio>
          `,
        },
      },
    });

    const labels = wrapper.findAll('.tree-radio');
    expect(labels[0].classes()).toContain('is-checked');
    expect(labels[1].classes()).not.toContain('is-checked');

    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs[0].attributes('aria-checked')).toBe('true');
    expect(inputs[1].attributes('aria-checked')).toBe('false');
  });

  it('applies disabled state from group to radios', () => {
    const wrapper = mount(TreeRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'disabled-test',
        disabled: true,
      },
      slots: {
        default: {
          components: { TreeRadio },
          template: '<TreeRadio value="a">Option A</TreeRadio>',
        },
      },
    });

    expect(wrapper.find('.tree-radio').classes()).toContain('is-disabled');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  it('applies invalid state from group to radios', () => {
    const wrapper = mount(TreeRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'invalid-test',
        invalid: true,
      },
      slots: {
        default: {
          components: { TreeRadio },
          template: '<TreeRadio value="a">Option A</TreeRadio>',
        },
      },
    });

    expect(wrapper.find('.tree-radio').classes()).toContain('is-invalid');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('renders radio sizes from group', () => {
    const sm = mount(TreeRadioGroup, {
      props: { modelValue: 'a', name: 'sm', size: 'sm' as const },
      slots: {
        default: {
          components: { TreeRadio },
          template: '<TreeRadio value="a">A</TreeRadio>',
        },
      },
    });
    const lg = mount(TreeRadioGroup, {
      props: { modelValue: 'a', name: 'lg', size: 'lg' as const },
      slots: {
        default: {
          components: { TreeRadio },
          template: '<TreeRadio value="a">A</TreeRadio>',
        },
      },
    });

    expect(sm.find('.tree-radio').classes()).toContain('tree-radio--sm');
    expect(lg.find('.tree-radio').classes()).toContain('tree-radio--lg');
  });

  it('toggles switch and emits update:modelValue', async () => {
    const wrapper = mount(TreeSwitch, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => value,
      },
      slots: {
        default: 'Enable notifications',
      },
    });

    expect(wrapper.classes()).toContain('tree-switch');
    expect(wrapper.classes()).not.toContain('is-checked');
    expect(wrapper.text()).toContain('Enable notifications');

    await wrapper.get('input[type="checkbox"]').trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('renders checked switch with role and aria', () => {
    const wrapper = mount(TreeSwitch, {
      props: {
        modelValue: true,
      },
      slots: {
        default: 'Dark mode',
      },
    });

    expect(wrapper.classes()).toContain('is-checked');
    expect(wrapper.get('input').attributes('role')).toBe('switch');
    expect(wrapper.get('input').attributes('aria-checked')).toBe('true');
  });

  it('applies disabled state to switch', () => {
    const wrapper = mount(TreeSwitch, {
      props: {
        modelValue: false,
        disabled: true,
      },
      slots: {
        default: 'Disabled toggle',
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.get('input').attributes('disabled')).toBeDefined();
  });

  it('applies invalid state to switch', () => {
    const wrapper = mount(TreeSwitch, {
      props: {
        modelValue: false,
        invalid: true,
      },
      slots: {
        default: 'Required toggle',
      },
    });

    expect(wrapper.classes()).toContain('is-invalid');
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true');
  });

  it('renders switch sizes', () => {
    const sm = mount(TreeSwitch, { props: { size: 'sm' as const } });
    const lg = mount(TreeSwitch, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('tree-switch--sm');
    expect(lg.classes()).toContain('tree-switch--lg');
  });

  // ── Select ──────────────────────────────────────────────

  it('renders select with options and emits update:modelValue on click', async () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
        'onUpdate:modelValue': (v: string) => v,
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    expect(wrapper.classes()).toContain('tree-select');
    const trigger = wrapper.get('button');
    expect(trigger.attributes('aria-haspopup')).toBe('listbox');
    expect(trigger.attributes('aria-label')).toBe('Fruit');

    // Open dropdown
    await trigger.trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options.length).toBe(2);
    expect(options[0].text()).toBe('Apple');

    // Select an option
    await options[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
  });

  it('renders placeholder text when no value selected', () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [{ label: 'Apple', value: 'apple' }],
        placeholder: 'Choose fruit',
      },
    });

    expect(wrapper.get('.tree-select__value').text()).toBe('Choose fruit');
    expect(wrapper.get('.tree-select__value').attributes('data-placeholder')).toBeDefined();
  });

  it('renders selected label in trigger', () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: 'apple',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      },
    });

    expect(wrapper.get('.tree-select__value').text()).toBe('Apple');
    expect(wrapper.get('.tree-select__value').attributes('data-placeholder')).toBeUndefined();
  });

  it('applies disabled state to select', () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [],
        disabled: true,
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
  });

  it('applies invalid state to select', () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [],
        invalid: true,
      },
    });

    expect(wrapper.classes()).toContain('is-invalid');
    expect(wrapper.get('button').attributes('aria-invalid')).toBe('true');
  });

  it('applies loading state to select', () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [],
        loading: true,
      },
    });

    expect(wrapper.classes()).toContain('is-loading');
    expect(wrapper.get('button').attributes('aria-busy')).toBe('true');
  });

  it('renders select sizes', () => {
    const sm = mount(TreeSelect, {
      props: { modelValue: '', options: [], size: 'sm' as const },
    });
    const lg = mount(TreeSelect, {
      props: { modelValue: '', options: [], size: 'lg' as const },
    });

    expect(sm.classes()).toContain('tree-select--sm');
    expect(lg.classes()).toContain('tree-select--lg');
  });

  it('renders disabled options in select', async () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: '',
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b', disabled: true },
        ],
      },
    });

    await wrapper.get('button').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options[1].classes()).toContain('is-disabled');
    expect(options[1].attributes('aria-disabled')).toBe('true');
  });

  it('shows check icon for selected option', async () => {
    const wrapper = mount(TreeSelect, {
      props: {
        modelValue: 'apple',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      },
    });

    await wrapper.get('button').trigger('click');
    const options = wrapper.findAll('[role="option"]');
    expect(options[0].classes()).toContain('is-selected');
    expect(options[0].find('.tree-select__check').exists()).toBe(true);
    expect(options[1].find('.tree-select__check').exists()).toBe(false);
  });

  it('renders form field with label and hint', () => {
    const wrapper = mount(TreeFormField, {
      props: {
        label: 'Email',
        hint: 'Enter your email address',
        htmlFor: 'email-input',
      },
      slots: {
        default: '<input id="email-input" type="email" />',
      },
    });

    expect(wrapper.classes()).toContain('tree-form-field');
    expect(wrapper.find('.tree-form-field__label').text()).toBe('Email');
    expect(wrapper.find('.tree-form-field__hint').text()).toBe('Enter your email address');
    expect(wrapper.find('label').attributes('for')).toBe('email-input');
  });

  it('renders form field with error and role alert', () => {
    const wrapper = mount(TreeFormField, {
      props: {
        label: 'Username',
        error: 'Username is required',
        hint: 'This hint should be hidden',
      },
      slots: {
        default: '<input type="text" />',
      },
    });

    expect(wrapper.classes()).toContain('is-invalid');
    expect(wrapper.find('.tree-form-field__error').text()).toBe('Username is required');
    expect(wrapper.find('.tree-form-field__error').attributes('role')).toBe('alert');
    expect(wrapper.find('.tree-form-field__hint').exists()).toBe(false);
  });

  it('renders required indicator on form field', () => {
    const wrapper = mount(TreeFormField, {
      props: {
        label: 'Name',
        required: true,
      },
      slots: {
        default: '<input type="text" />',
      },
    });

    expect(wrapper.classes()).toContain('is-required');
    const required = wrapper.find('.tree-form-field__required');
    expect(required.exists()).toBe(true);
    expect(required.text()).toBe('*');
    expect(required.attributes('aria-hidden')).toBe('true');
  });

  it('applies disabled state to form field', () => {
    const wrapper = mount(TreeFormField, {
      props: {
        label: 'Field',
        disabled: true,
      },
      slots: {
        default: '<input type="text" />',
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
  });

  it('renders form field sizes', () => {
    const sm = mount(TreeFormField, {
      props: { label: 'SM', size: 'sm' as const },
      slots: { default: '<input />' },
    });
    const lg = mount(TreeFormField, {
      props: { label: 'LG', size: 'lg' as const },
      slots: { default: '<input />' },
    });

    expect(sm.classes()).toContain('tree-form-field--sm');
    expect(lg.classes()).toContain('tree-form-field--lg');
  });
});
