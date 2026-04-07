import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TreeBadge from './TreeBadge.vue';
import TreeButton from './TreeButton.vue';
import TreeAlert from './TreeAlert.vue';
import TreeCard from './TreeCard.vue';
import TreeCheckbox from './TreeCheckbox.vue';
import TreeCombobox from './TreeCombobox.vue';
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
import TreeSkeleton from './TreeSkeleton.vue';
import TreeProgress from './TreeProgress.vue';
import TreePagination from './TreePagination.vue';
import TreeAccordion from './TreeAccordion.vue';
import TreeAccordionItem from './TreeAccordionItem.vue';
import TreeBreadcrumb from './TreeBreadcrumb.vue';
import TreeBreadcrumbItem from './TreeBreadcrumbItem.vue';
import TreeDropdown from './TreeDropdown.vue';
import TreeDrawer from './TreeDrawer.vue';
import TreeContextMenu from './TreeContextMenu.vue';
import TreePopover from './TreePopover.vue';
import TreeTabs from './TreeTabs.vue';
import TreeTabList from './TreeTabList.vue';
import TreeTab from './TreeTab.vue';
import TreeTabPanel from './TreeTabPanel.vue';
import TreeToastProvider from './TreeToastProvider.vue';
import TreeAvatar from './TreeAvatar.vue';
import TreeDivider from './TreeDivider.vue';
import TreeEmptyState from './TreeEmptyState.vue';
import TreeTable from './TreeTable.vue';
import TreeTag from './TreeTag.vue';
import TreePricingCard from './TreePricingCard.vue';
import TreePricing from './TreePricing.vue';
import TreeMarkdownEditor from './TreeMarkdownEditor.vue';
import { useToast } from '../composables/useToast';

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

  it('opens the drawer from a trigger slot and closes on escape', async () => {
    const wrapper = mount(TreeDrawer, {
      attachTo: document.body,
      props: {
        title: 'Settings',
        description: 'Manage your preferences.',
        side: 'right',
      },
      slots: {
        trigger: '<button type="button">Open drawer</button>',
        default: '<p>Drawer content</p>',
        footer: `
          <button type="button" id="drawer-cancel">Cancel</button>
          <button type="button" id="drawer-save">Save</button>
        `,
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Settings');
    expect(document.body.textContent).toContain('Drawer content');

    const surface = document.body.querySelector('.tree-drawer__surface');
    expect(surface?.classList.contains('tree-drawer__surface--right')).toBe(true);

    (
      document.getElementById('drawer-save') as HTMLButtonElement | null
    )?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
    await nextTick();

    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement?.textContent).toContain('Open drawer');

    wrapper.unmount();
  });

  it('traps focus inside the drawer and closes from the overlay', async () => {
    const wrapper = mount(TreeDrawer, {
      attachTo: document.body,
      props: {
        defaultOpen: true,
        side: 'left',
        showCloseButton: false,
      },
      slots: {
        header: '<h2>Focus trap</h2>',
        default: '<p>Keep focus inside the drawer.</p>',
        footer: `
          <button type="button" id="drawer-first">First</button>
          <button type="button" id="drawer-last">Last</button>
        `,
      },
    });

    await nextTick();
    (document.getElementById('drawer-last') as HTMLButtonElement | null)?.focus();

    (
      document.getElementById('drawer-last') as HTMLButtonElement | null
    )?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Tab' }));
    await nextTick();
    expect(document.activeElement?.id).toBe('drawer-first');

    (
      document.getElementById('drawer-first') as HTMLButtonElement | null
    )?.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Tab',
        shiftKey: true,
      }),
    );
    await nextTick();
    expect(document.activeElement?.id).toBe('drawer-last');

    (
      document.body.querySelector('.tree-drawer__backdrop') as HTMLDivElement | null
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

  // ── Combobox ───────────────────────────────────────────

  it('filters combobox options and emits model updates on selection', async () => {
    const wrapper = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [
          { label: 'Apple', value: 'apple', keywords: ['red'] },
          { label: 'Banana', value: 'banana', keywords: ['yellow'] },
          { label: 'Cherry', value: 'cherry', keywords: ['red'] },
        ],
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    const input = wrapper.get('input');

    expect(input.attributes('role')).toBe('combobox');
    expect(input.attributes('aria-autocomplete')).toBe('list');

    await input.trigger('focus');
    await input.setValue('app');

    expect(wrapper.emitted('input-change')?.[0]).toEqual(['app']);

    const options = wrapper.findAll('[role="option"]');
    expect(options).toHaveLength(1);
    expect(options[0].text()).toContain('Apple');

    await options[0].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['apple']);
  });

  it('supports keyboard navigation in the combobox', async () => {
    const wrapper = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
          { label: 'Cherry', value: 'cherry', disabled: true },
        ],
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    const input = wrapper.get('input');

    await input.trigger('focus');
    await nextTick();

    let options = wrapper.findAll('.tree-combobox__option');
    expect(options[0].classes()).toContain('is-active');
    expect(input.attributes('aria-activedescendant')).toContain('apple');

    await input.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    options = wrapper.findAll('.tree-combobox__option');
    expect(options[1].classes()).toContain('is-active');
    expect(options[2].classes()).not.toContain('is-active');

    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
  });

  it('renders the combobox empty state when nothing matches', async () => {
    const wrapper = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [{ label: 'Apple', value: 'apple' }],
        emptyText: 'Nothing found here.',
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    const input = wrapper.get('input');

    await input.trigger('focus');
    await input.setValue('zzz');
    await nextTick();

    expect(wrapper.find('.tree-combobox__empty').text()).toContain('Nothing found here.');
  });

  it('clears the combobox selection when the input is emptied and closed', async () => {
    const wrapper = mount(TreeCombobox, {
      props: {
        modelValue: 'banana',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    const input = wrapper.get('input');

    expect((input.element as HTMLInputElement).value).toBe('Banana');

    await input.setValue('');
    await input.trigger('keydown', { key: 'Tab' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['']);
  });

  it('restores the previous combobox selection on escape', async () => {
    const wrapper = mount(TreeCombobox, {
      props: {
        modelValue: 'banana',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    const input = wrapper.get('input');

    await input.trigger('focus');
    await input.setValue('app');
    await input.trigger('keydown', { key: 'Escape' });

    expect((input.element as HTMLInputElement).value).toBe('Banana');
  });

  it('applies combobox states and sizes', () => {
    const invalid = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [],
        invalid: true,
      },
      attrs: {
        'aria-label': 'Invalid combobox',
      },
    });

    expect(invalid.classes()).toContain('is-invalid');
    expect(invalid.get('input').attributes('aria-invalid')).toBe('true');

    const disabled = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [],
        disabled: true,
      },
      attrs: {
        'aria-label': 'Disabled combobox',
      },
    });

    expect(disabled.classes()).toContain('is-disabled');
    expect(disabled.get('input').attributes('disabled')).toBeDefined();

    const loading = mount(TreeCombobox, {
      props: {
        modelValue: '',
        options: [],
        loading: true,
      },
      attrs: {
        'aria-label': 'Loading combobox',
      },
    });

    expect(loading.classes()).toContain('is-loading');
    expect(loading.get('input').attributes('aria-busy')).toBe('true');

    const sm = mount(TreeCombobox, {
      props: { modelValue: '', options: [], size: 'sm' as const },
      attrs: { 'aria-label': 'Small combobox' },
    });
    const lg = mount(TreeCombobox, {
      props: { modelValue: '', options: [], size: 'lg' as const },
      attrs: { 'aria-label': 'Large combobox' },
    });

    expect(sm.classes()).toContain('tree-combobox--sm');
    expect(lg.classes()).toContain('tree-combobox--lg');
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

  it('renders progress bar with determinate value', () => {
    const wrapper = mount(TreeProgress, {
      props: { value: 60, label: 'Upload progress' },
    });

    expect(wrapper.classes()).toContain('tree-progress');
    expect(wrapper.classes()).toContain('tree-progress--md');
    expect(wrapper.attributes('role')).toBe('progressbar');
    expect(wrapper.attributes('aria-valuenow')).toBe('60');
    expect(wrapper.attributes('aria-valuemin')).toBe('0');
    expect(wrapper.attributes('aria-valuemax')).toBe('100');
    expect(wrapper.attributes('aria-label')).toBe('Upload progress');
    expect(wrapper.find('.tree-progress__fill').exists()).toBe(true);
  });

  it('renders progress bar as indeterminate when no value', () => {
    const wrapper = mount(TreeProgress, {
      props: { label: 'Loading' },
    });

    expect(wrapper.classes()).toContain('tree-progress--indeterminate');
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined();
  });

  it('renders progress sizes', () => {
    const sm = mount(TreeProgress, {
      props: { value: 30, size: 'sm' as const },
    });
    const lg = mount(TreeProgress, {
      props: { value: 30, size: 'lg' as const },
    });

    expect(sm.classes()).toContain('tree-progress--sm');
    expect(lg.classes()).toContain('tree-progress--lg');
  });

  it('clamps progress value between 0 and 100', () => {
    const over = mount(TreeProgress, {
      props: { value: 150 },
    });
    expect(over.attributes('aria-valuenow')).toBe('100');

    const under = mount(TreeProgress, {
      props: { value: -10 },
    });
    expect(under.attributes('aria-valuenow')).toBe('0');
  });

  it('renders alert with role and variant class', () => {
    const wrapper = mount(TreeAlert, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Something went wrong!',
      },
    });

    expect(wrapper.attributes('role')).toBe('alert');
    expect(wrapper.classes()).toContain('tree-alert');
    expect(wrapper.classes()).toContain('tree-alert--danger');
    expect(wrapper.text()).toContain('Something went wrong!');
  });

  it('renders alert sizes', () => {
    const sm = mount(TreeAlert, {
      props: { size: 'sm' as const },
      slots: { default: 'Small' },
    });
    const lg = mount(TreeAlert, {
      props: { size: 'lg' as const },
      slots: { default: 'Large' },
    });

    expect(sm.classes()).toContain('tree-alert--sm');
    expect(lg.classes()).toContain('tree-alert--lg');
  });

  it('renders alert icon slot with aria-hidden', () => {
    const wrapper = mount(TreeAlert, {
      slots: {
        default: 'Info message',
        icon: '<svg data-testid="icon"></svg>',
      },
    });

    const iconSlot = wrapper.find('.tree-alert__icon');
    expect(iconSlot.exists()).toBe(true);
    expect(iconSlot.attributes('aria-hidden')).toBe('true');
  });

  it('shows dismiss button and emits dismiss event', async () => {
    const wrapper = mount(TreeAlert, {
      props: {
        dismissible: true,
      },
      slots: {
        default: 'Closable alert',
      },
    });

    const dismissBtn = wrapper.find('.tree-alert__dismiss');
    expect(dismissBtn.exists()).toBe(true);
    expect(dismissBtn.attributes('aria-label')).toBe('Dismiss');

    await dismissBtn.trigger('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('does not show dismiss button when not dismissible', () => {
    const wrapper = mount(TreeAlert, {
      slots: {
        default: 'Not closable',
      },
    });

    expect(wrapper.find('.tree-alert__dismiss').exists()).toBe(false);
  });

  it('renders skeleton with default text variant', () => {
    const wrapper = mount(TreeSkeleton);
    expect(wrapper.classes()).toContain('tree-skeleton');
    expect(wrapper.classes()).toContain('tree-skeleton--pulse');
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('renders skeleton with custom dimensions', () => {
    const wrapper = mount(TreeSkeleton, {
      props: { width: '100%', height: '8rem' },
    });
    expect(wrapper.element.style.height).toBe('8rem');
  });

  it('renders skeleton wave animation', () => {
    const wrapper = mount(TreeSkeleton, {
      props: { animation: 'wave' },
    });
    expect(wrapper.classes()).toContain('tree-skeleton--wave');
    expect(wrapper.classes()).not.toContain('tree-skeleton--pulse');
  });

  it('renders skeleton without animation', () => {
    const wrapper = mount(TreeSkeleton, {
      props: { animation: 'none' },
    });
    expect(wrapper.classes()).not.toContain('tree-skeleton--pulse');
    expect(wrapper.classes()).not.toContain('tree-skeleton--wave');
  });

  it('renders skeleton with slot content', () => {
    const wrapper = mount(TreeSkeleton, {
      slots: { default: '<span>Loading content</span>' },
    });
    expect(wrapper.text()).toContain('Loading content');
  });

  it('renders toast notifications via useToast composable', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TreeToastProvider, {
      attachTo: document.body,
      props: { position: 'bottom-right' },
    });

    toast.add({
      title: 'Changes saved',
      description: 'Your settings have been updated.',
      variant: 'success',
      duration: 0,
    });

    await nextTick();

    const toastEl = document.querySelector('.tree-toast');
    expect(toastEl).not.toBeNull();
    expect(toastEl?.classList.contains('tree-toast--success')).toBe(true);
    expect(toastEl?.getAttribute('role')).toBe('status');
    expect(toastEl?.textContent).toContain('Changes saved');
    expect(toastEl?.textContent).toContain('Your settings have been updated.');

    toast.clear();
    await nextTick();
    expect(document.querySelector('.tree-toast')).toBeNull();

    wrapper.unmount();
  });

  it('renders default slot content while teleporting toasts to body', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TreeToastProvider, {
      attachTo: document.body,
      slots: {
        default: '<div class="toast-provider-child">Wrapped app</div>',
      },
    });

    expect(wrapper.find('.toast-provider-child').exists()).toBe(true);
    expect(wrapper.text()).toContain('Wrapped app');

    toast.add({
      title: 'Still teleported',
      variant: 'info',
      duration: 0,
    });

    await nextTick();

    const toastContainer = document.querySelector('.tree-toast-provider');
    expect(toastContainer).not.toBeNull();
    expect(toastContainer?.parentElement).toBe(document.body);

    toast.clear();
    wrapper.unmount();
  });

  it('removes a single toast by id and respects closable', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TreeToastProvider, {
      attachTo: document.body,
    });

    const id = toast.add({
      title: 'Removable',
      variant: 'info',
      duration: 0,
      closable: true,
    });

    await nextTick();

    const closeBtn = document.querySelector('.tree-toast__close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.getAttribute('aria-label')).toBe('Dismiss notification');

    toast.remove(id);
    await nextTick();

    expect(document.querySelector('.tree-toast')).toBeNull();

    wrapper.unmount();
  });

  it('renders toast with all four variants', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TreeToastProvider, {
      attachTo: document.body,
    });

    toast.add({ title: 'Info', variant: 'info', duration: 0 });
    toast.add({ title: 'Success', variant: 'success', duration: 0 });
    toast.add({ title: 'Warning', variant: 'warning', duration: 0 });
    toast.add({ title: 'Danger', variant: 'danger', duration: 0 });

    await nextTick();

    const toasts = document.querySelectorAll('.tree-toast');
    expect(toasts).toHaveLength(4);
    expect(toasts[0]?.classList.contains('tree-toast--info')).toBe(true);
    expect(toasts[1]?.classList.contains('tree-toast--success')).toBe(true);
    expect(toasts[2]?.classList.contains('tree-toast--warning')).toBe(true);
    expect(toasts[3]?.classList.contains('tree-toast--danger')).toBe(true);

    toast.clear();
    wrapper.unmount();
  });

  it('limits visible toasts to max prop', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TreeToastProvider, {
      attachTo: document.body,
      props: { max: 2 },
    });

    toast.add({ title: 'First', variant: 'info', duration: 0 });
    toast.add({ title: 'Second', variant: 'info', duration: 0 });
    toast.add({ title: 'Third', variant: 'info', duration: 0 });

    await nextTick();

    const toasts = document.querySelectorAll('.tree-toast');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]?.textContent).toContain('Second');
    expect(toasts[1]?.textContent).toContain('Third');

    toast.clear();
    wrapper.unmount();
  });

  it('renders breadcrumb with nav and aria-label', () => {
    const wrapper = mount(TreeBreadcrumb, {
      slots: {
        default: '<li>Home</li>',
      },
    });

    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
    expect(wrapper.classes()).toContain('tree-breadcrumb');
    expect(wrapper.find('ol.tree-breadcrumb__list').exists()).toBe(true);
  });

  it('renders breadcrumb items with links and current page', () => {
    const wrapper = mount(TreeBreadcrumb, {
      slots: {
        default: [
          `<li class="tree-breadcrumb__item"><a href="/" class="tree-breadcrumb__link">Home</a></li>`,
          `<li class="tree-breadcrumb__item"><span class="tree-breadcrumb__current" aria-current="page">Current</span></li>`,
        ],
      },
    });

    const link = wrapper.find('.tree-breadcrumb__link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/');

    const current = wrapper.find('.tree-breadcrumb__current');
    expect(current.exists()).toBe(true);
    expect(current.attributes('aria-current')).toBe('page');
  });

  it('renders breadcrumb item as link when href is provided', () => {
    const wrapper = mount(TreeBreadcrumbItem, {
      props: { href: '/products' },
      slots: { default: 'Products' },
    });

    const link = wrapper.find('a.tree-breadcrumb__link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/products');
    expect(link.text()).toBe('Products');
    expect(wrapper.find('[aria-current]').exists()).toBe(false);
  });

  it('renders breadcrumb item as current when no href', () => {
    const wrapper = mount(TreeBreadcrumbItem, {
      slots: { default: 'Current Page' },
    });

    expect(wrapper.find('a').exists()).toBe(false);
    const current = wrapper.find('span.tree-breadcrumb__current');
    expect(current.exists()).toBe(true);
    expect(current.attributes('aria-current')).toBe('page');
    expect(current.text()).toBe('Current Page');
  });

  it('applies custom separator via CSS variable', () => {
    const wrapper = mount(TreeBreadcrumb, {
      props: { separator: '›' },
      slots: { default: '<li>Home</li>' },
    });

    const ol = wrapper.find('ol.tree-breadcrumb__list');
    expect(ol.attributes('style')).toContain("--tree-breadcrumb-separator: '›'");
  });

  // ── Accordion ─────────────────────────────────────────────

  function mountAccordion(props: Record<string, unknown> = {}) {
    return mount(TreeAccordion, {
      attachTo: document.body,
      props: {
        type: 'single' as const,
        collapsible: true,
        ...props,
      },
      slots: {
        default: {
          components: { TreeAccordionItem },
          template: `
            <TreeAccordionItem value="item-1">
              <template #trigger>First</template>
              Content 1
            </TreeAccordionItem>
            <TreeAccordionItem value="item-2">
              <template #trigger>Second</template>
              Content 2
            </TreeAccordionItem>
            <TreeAccordionItem value="item-3" disabled>
              <template #trigger>Third (disabled)</template>
              Content 3
            </TreeAccordionItem>
          `,
        },
      },
    });
  }

  it('renders accordion with items and aria attributes', () => {
    const wrapper = mountAccordion();

    const triggers = wrapper.findAll('.tree-accordion__trigger');
    expect(triggers).toHaveLength(3);
    expect(triggers[0].attributes('aria-expanded')).toBe('false');
    expect(triggers[0].text()).toContain('First');
  });

  it('opens an item on click and sets aria-expanded', async () => {
    const wrapper = mountAccordion();

    const trigger = wrapper.findAll('.tree-accordion__trigger')[0];
    await trigger.trigger('click');

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('.tree-accordion__content').exists()).toBe(true);
    expect(wrapper.find('.tree-accordion__panel').text()).toContain('Content 1');
  });

  it('single mode closes previous item when opening another', async () => {
    const wrapper = mountAccordion();

    const triggers = wrapper.findAll('.tree-accordion__trigger');
    await triggers[0].trigger('click');
    expect(triggers[0].attributes('aria-expanded')).toBe('true');

    await triggers[1].trigger('click');
    expect(triggers[0].attributes('aria-expanded')).toBe('false');
    expect(triggers[1].attributes('aria-expanded')).toBe('true');
  });

  it('collapsible single mode allows closing open item', async () => {
    const wrapper = mountAccordion({ collapsible: true });

    const trigger = wrapper.findAll('.tree-accordion__trigger')[0];
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');

    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('disabled item cannot be toggled', async () => {
    const wrapper = mountAccordion();

    const disabledTrigger = wrapper.findAll('.tree-accordion__trigger')[2];
    await disabledTrigger.trigger('click');

    expect(disabledTrigger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.findAll('.tree-accordion__item')[2].classes()).toContain('is-disabled');
  });

  it('multiple mode allows several items open at once', async () => {
    const wrapper = mount(TreeAccordion, {
      attachTo: document.body,
      props: { type: 'multiple' as const },
      slots: {
        default: {
          components: { TreeAccordionItem },
          template: `
            <TreeAccordionItem value="a">
              <template #trigger>A</template>
              Content A
            </TreeAccordionItem>
            <TreeAccordionItem value="b">
              <template #trigger>B</template>
              Content B
            </TreeAccordionItem>
          `,
        },
      },
    });

    const triggers = wrapper.findAll('.tree-accordion__trigger');
    await triggers[0].trigger('click');
    await triggers[1].trigger('click');

    expect(triggers[0].attributes('aria-expanded')).toBe('true');
    expect(triggers[1].attributes('aria-expanded')).toBe('true');
  });

  it('panel has region role and aria-labelledby linking to trigger', async () => {
    const wrapper = mountAccordion();

    await wrapper.findAll('.tree-accordion__trigger')[0].trigger('click');

    const panel = wrapper.find('.tree-accordion__content');
    expect(panel.attributes('role')).toBe('region');

    const triggerId = wrapper.findAll('.tree-accordion__trigger')[0].attributes('id');
    expect(panel.attributes('aria-labelledby')).toBe(triggerId);
  });

  it('emits update:modelValue when item is toggled', async () => {
    const wrapper = mountAccordion();

    await wrapper.findAll('.tree-accordion__trigger')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['item-1']);
  });

  /* ── TPagination ───────── */

  it('renders pagination with correct number of page buttons', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 3, modelValue: 1 },
    });
    expect(wrapper.find('.tree-pagination').exists()).toBe(true);
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Pagination');
    const buttons = wrapper.findAll('.tree-pagination__button').filter(b => !b.classes().includes('tree-pagination__button--prev') && !b.classes().includes('tree-pagination__button--next'));
    expect(buttons.length).toBe(3);
  });

  it('marks the active page with aria-current', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 5, modelValue: 3 },
    });
    const activeBtn = wrapper.find('[aria-current="page"]');
    expect(activeBtn.exists()).toBe(true);
    expect(activeBtn.text()).toBe('3');
    expect(activeBtn.classes()).toContain('is-active');
  });

  it('emits update:modelValue when a page button is clicked', async () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 3, modelValue: 1 },
    });
    const pageButtons = wrapper.findAll('.tree-pagination__button').filter(b => !b.classes().includes('tree-pagination__button--prev') && !b.classes().includes('tree-pagination__button--next'));
    await pageButtons[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  });

  it('disables previous button on first page', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 5, modelValue: 1 },
    });
    const prevBtn = wrapper.find('.tree-pagination__button--prev');
    expect((prevBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 5, modelValue: 5 },
    });
    const nextBtn = wrapper.find('.tree-pagination__button--next');
    expect((nextBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('applies size classes', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 5, modelValue: 1, size: 'lg' },
    });
    expect(wrapper.find('.tree-pagination').classes()).toContain('tree-pagination--lg');
  });

  it('renders ellipsis for many pages', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 20, modelValue: 10, siblings: 1 },
    });
    const ellipses = wrapper.findAll('.tree-pagination__ellipsis');
    expect(ellipses.length).toBe(2);
  });

  it('disables all buttons when disabled prop is set', () => {
    const wrapper = mount(TreePagination, {
      props: { totalPages: 5, modelValue: 3, disabled: true },
    });
    expect(wrapper.find('.tree-pagination').classes()).toContain('is-disabled');
    const buttons = wrapper.findAll('button');
    buttons.forEach(btn => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(true);
    });
  });

  // ── Dropdown ──────────────────────────────────────────────

  it('renders dropdown with items and emits select on click', async () => {
    const wrapper = mount(TreeDropdown, {
      props: {
        label: 'Actions',
        items: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete' },
        ],
      },
    });

    expect(wrapper.classes()).toContain('tree-dropdown');
    const trigger = wrapper.get('button');
    expect(trigger.attributes('aria-haspopup')).toBe('menu');
    expect(trigger.attributes('aria-expanded')).toBe('false');

    // Open dropdown
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');
    const items = wrapper.findAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    expect(items[0].text()).toBe('Edit');

    // Select an item
    await items[1].trigger('click');
    expect(wrapper.emitted('select')?.[0]).toEqual(['delete']);
  });

  it('renders dropdown sizes', () => {
    const sm = mount(TreeDropdown, {
      props: { size: 'sm' as const, label: 'SM', items: [] },
    });
    const lg = mount(TreeDropdown, {
      props: { size: 'lg' as const, label: 'LG', items: [] },
    });

    expect(sm.classes()).toContain('tree-dropdown--sm');
    expect(lg.classes()).toContain('tree-dropdown--lg');
  });

  it('applies disabled state to dropdown', () => {
    const wrapper = mount(TreeDropdown, {
      props: {
        disabled: true,
        label: 'Actions',
        items: [{ label: 'Edit', value: 'edit' }],
      },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.get('button').attributes('disabled')).toBeDefined();
  });

  it('renders disabled items in dropdown', async () => {
    const wrapper = mount(TreeDropdown, {
      props: {
        label: 'Actions',
        items: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete', disabled: true },
        ],
      },
    });

    await wrapper.get('button').trigger('click');
    const items = wrapper.findAll('[role="menuitem"]');
    expect(items[1].classes()).toContain('is-disabled');
    expect(items[1].attributes('aria-disabled')).toBe('true');
  });

  it('closes dropdown on Escape key', async () => {
    const wrapper = mount(TreeDropdown, {
      props: {
        label: 'Actions',
        items: [{ label: 'Edit', value: 'edit' }],
      },
    });

    const trigger = wrapper.get('button');
    await trigger.trigger('click');
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(1);

    await wrapper.get('[role="menuitem"]').trigger('keydown', { key: 'Escape' });
    await nextTick();
    expect(wrapper.findAll('[role="menuitem"]').length).toBe(0);
  });

  it('emits open-change events', async () => {
    const wrapper = mount(TreeDropdown, {
      props: {
        label: 'Actions',
        items: [{ label: 'Edit', value: 'edit' }],
      },
    });

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true]);

    await wrapper.get('[role="menuitem"]').trigger('click');
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);
  });
});

describe('TTabs', () => {
  const TabsFixture = {
    components: { TreeTabs, TreeTabList, TreeTab, TreeTabPanel },
    template: `
      <TreeTabs v-bind="$attrs">
        <TreeTabList>
          <TreeTab value="a">Tab A</TreeTab>
          <TreeTab value="b">Tab B</TreeTab>
          <TreeTab value="c" :disabled="disabledC">Tab C</TreeTab>
        </TreeTabList>
        <TreeTabPanel value="a">Panel A</TreeTabPanel>
        <TreeTabPanel value="b">Panel B</TreeTabPanel>
        <TreeTabPanel value="c">Panel C</TreeTabPanel>
      </TreeTabs>
    `,
    props: {
      disabledC: { type: Boolean, default: false },
    },
  };

  it('renders the active panel based on defaultValue', () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'b' },
    });

    expect(wrapper.text()).toContain('Panel B');
    expect(wrapper.text()).not.toContain('Panel A');
  });

  it('switches tabs on click', async () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
    });

    expect(wrapper.text()).toContain('Panel A');

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1].trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Panel B');
    expect(wrapper.text()).not.toContain('Panel A');
  });

  it('applies correct ARIA attributes', () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
    });

    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs[0].attributes('aria-selected')).toBe('true');
    expect(tabs[1].attributes('aria-selected')).toBe('false');
    expect(tabs[0].attributes('tabindex')).toBe('0');
    expect(tabs[1].attributes('tabindex')).toBe('-1');

    const panel = wrapper.find('[role="tabpanel"]');
    expect(panel.exists()).toBe(true);
    expect(panel.attributes('aria-labelledby')).toBe(tabs[0].attributes('id'));
    expect(panel.attributes('id')).toBe(tabs[0].attributes('aria-controls'));
  });

  it('navigates tabs with arrow keys', async () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
      attachTo: document.body,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0].element as HTMLElement).focus();

    await tabs[0].trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    expect(document.activeElement).toBe(tabs[1].element);
    expect(wrapper.text()).toContain('Panel B');

    wrapper.unmount();
  });

  it('skips disabled tabs during keyboard navigation', async () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
      props: { disabledC: true },
      attachTo: document.body,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[1].element as HTMLElement).focus();

    // Arrow right from B should wrap to A (C is disabled)
    await tabs[1].trigger('keydown', { key: 'ArrowRight' });
    await nextTick();

    expect(document.activeElement).toBe(tabs[0].element);

    wrapper.unmount();
  });

  it('does not activate disabled tabs on click', async () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
      props: { disabledC: true },
    });

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[2].trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Panel A');
    expect(wrapper.text()).not.toContain('Panel C');
  });

  it('supports controlled mode via v-model', async () => {
    const ControlledFixture = {
      components: { TreeTabs, TreeTabList, TreeTab, TreeTabPanel },
      template: `
        <TreeTabs :model-value="active" @update:model-value="active = $event">
          <TreeTabList>
            <TreeTab value="x">X</TreeTab>
            <TreeTab value="y">Y</TreeTab>
          </TreeTabList>
          <TreeTabPanel value="x">Content X</TreeTabPanel>
          <TreeTabPanel value="y">Content Y</TreeTabPanel>
        </TreeTabs>
      `,
      data: () => ({ active: 'x' }),
    };

    const wrapper = mount(ControlledFixture);
    expect(wrapper.text()).toContain('Content X');

    const tabs = wrapper.findAll('[role="tab"]');
    await tabs[1].trigger('click');
    await nextTick();

    expect(wrapper.text()).toContain('Content Y');
  });

  it('supports Home and End keys', async () => {
    const wrapper = mount(TabsFixture, {
      attrs: { 'default-value': 'a' },
      attachTo: document.body,
    });

    const tabs = wrapper.findAll('[role="tab"]');
    (tabs[0].element as HTMLElement).focus();

    await tabs[0].trigger('keydown', { key: 'End' });
    await nextTick();

    expect(document.activeElement).toBe(tabs[2].element);

    await tabs[2].trigger('keydown', { key: 'Home' });
    await nextTick();

    expect(document.activeElement).toBe(tabs[0].element);

    wrapper.unmount();
  });

  it('renders correct size classes', () => {
    const line = mount(TabsFixture, {
      attrs: { 'default-value': 'a', size: 'sm' },
    });
    expect(line.find('.tree-tabs--sm').exists()).toBe(true);
  });

  it('opens the popover on click and closes on escape', async () => {
    const wrapper = mount(TreePopover, {
      attachTo: document.body,
      slots: {
        trigger: '<button type="button">Open</button>',
        default: '<p>Popover content</p>',
      },
    });

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true]);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);

    await wrapper.find('[role="dialog"]').trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.emitted('update:open')?.[1]).toEqual([false]);
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);

    wrapper.unmount();
  });

  it('renders the popover with the correct side class', () => {
    const wrapper = mount(TreePopover, {
      attachTo: document.body,
      props: {
        defaultOpen: true,
        side: 'right',
        align: 'start',
      },
      slots: {
        trigger: '<button type="button">Open</button>',
        default: '<p>Right content</p>',
      },
    });

    const content = wrapper.find('[role="dialog"]');
    expect(content.classes()).toContain('tree-popover__content--right');
    expect(content.classes()).toContain('tree-popover__content--align-start');

    wrapper.unmount();
  });

  it('does not open the popover when disabled', async () => {
    const wrapper = mount(TreePopover, {
      attachTo: document.body,
      props: {
        disabled: true,
      },
      slots: {
        trigger: '<button type="button">Open</button>',
        default: '<p>Content</p>',
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);
    expect(wrapper.emitted('update:open')).toBeUndefined();

    wrapper.unmount();
  });

  // ── Context Menu ──────────────────────────────────────────

  it('renders context menu and emits select on item click', async () => {
    const wrapper = mount(TreeContextMenu, {
      props: {
        items: [
          { label: 'Cut', value: 'cut' },
          { label: 'Copy', value: 'copy' },
        ],
      },
      slots: {
        default: '<div class="trigger-area">Right-click here</div>',
      },
      attachTo: document.body,
    });

    expect(wrapper.classes()).toContain('tree-context-menu');

    // Open context menu via right-click
    await wrapper.trigger('contextmenu');
    await nextTick();

    const items = document.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(2);
    expect(items[0].textContent?.trim()).toBe('Cut');

    // Select an item
    (items[0] as HTMLElement).click();
    await nextTick();
    expect(wrapper.emitted('select')?.[0]).toEqual(['cut']);

    wrapper.unmount();
  });

  it('renders context menu sizes', () => {
    const sm = mount(TreeContextMenu, {
      props: { size: 'sm' as const, items: [] },
      slots: { default: '<div>Area</div>' },
    });
    const lg = mount(TreeContextMenu, {
      props: { size: 'lg' as const, items: [] },
      slots: { default: '<div>Area</div>' },
    });

    expect(sm.classes()).toContain('tree-context-menu--sm');
    expect(lg.classes()).toContain('tree-context-menu--lg');

    sm.unmount();
    lg.unmount();
  });

  it('does not open context menu when disabled', async () => {
    const wrapper = mount(TreeContextMenu, {
      props: {
        disabled: true,
        items: [{ label: 'Cut', value: 'cut' }],
      },
      slots: {
        default: '<div>Right-click here</div>',
      },
      attachTo: document.body,
    });

    expect(wrapper.classes()).toContain('is-disabled');

    await wrapper.trigger('contextmenu');
    await nextTick();

    const items = document.querySelectorAll('[role="menuitem"]');
    expect(items.length).toBe(0);

    wrapper.unmount();
  });

  it('renders disabled items in context menu', async () => {
    const wrapper = mount(TreeContextMenu, {
      props: {
        items: [
          { label: 'Cut', value: 'cut' },
          { label: 'Copy', value: 'copy', disabled: true },
        ],
      },
      slots: {
        default: '<div>Right-click here</div>',
      },
      attachTo: document.body,
    });

    await wrapper.trigger('contextmenu');
    await nextTick();

    const items = document.querySelectorAll('[role="menuitem"]');
    expect(items[1].classList.contains('is-disabled')).toBe(true);
    expect(items[1].getAttribute('aria-disabled')).toBe('true');

    wrapper.unmount();
  });

  it('emits open-change events on context menu', async () => {
    const wrapper = mount(TreeContextMenu, {
      props: {
        items: [{ label: 'Cut', value: 'cut' }],
      },
      slots: {
        default: '<div>Right-click here</div>',
      },
      attachTo: document.body,
    });

    await wrapper.trigger('contextmenu');
    await nextTick();
    expect(wrapper.emitted('open-change')?.[0]).toEqual([true]);

    // Select to close
    const item = document.querySelector('[role="menuitem"]') as HTMLElement;
    item?.click();
    await nextTick();
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);

    wrapper.unmount();
  });

  // ── Avatar ──

  it('renders avatar with initials from alt text', () => {
    const wrapper = mount(TreeAvatar, {
      props: { alt: 'Jane Doe', size: 'md' },
    });
    expect(wrapper.classes()).toContain('tree-avatar');
    expect(wrapper.classes()).toContain('tree-avatar--md');
    expect(wrapper.text()).toBe('JD');
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('Jane Doe');
  });

  it('renders avatar with explicit initials', () => {
    const wrapper = mount(TreeAvatar, {
      props: { alt: 'Jane Doe', initials: 'X' },
    });
    expect(wrapper.text()).toBe('X');
  });

  it('renders avatar with image', () => {
    const wrapper = mount(TreeAvatar, {
      props: { src: 'https://example.com/photo.jpg', alt: 'Jane' },
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/photo.jpg');
    expect(img.attributes('alt')).toBe('Jane');
  });

  it('renders avatar with status dot', () => {
    const wrapper = mount(TreeAvatar, {
      props: { alt: 'User', status: 'online' },
    });
    const dot = wrapper.find('.tree-avatar__status');
    expect(dot.exists()).toBe(true);
    expect(dot.classes()).toContain('tree-avatar__status--online');
  });

  // ── Divider ──

  it('renders horizontal divider by default', () => {
    const wrapper = mount(TreeDivider);
    expect(wrapper.classes()).toContain('tree-divider');
    expect(wrapper.classes()).toContain('tree-divider--horizontal');
    expect(wrapper.attributes('role')).toBe('none');
  });

  it('renders vertical divider with separator role', () => {
    const wrapper = mount(TreeDivider, {
      props: { orientation: 'vertical', decorative: false, label: 'Section' },
    });
    expect(wrapper.classes()).toContain('tree-divider--vertical');
    expect(wrapper.attributes('role')).toBe('separator');
    expect(wrapper.attributes('aria-orientation')).toBe('vertical');
    expect(wrapper.attributes('aria-label')).toBe('Section');
  });

  // ── EmptyState ──

  it('renders empty state with title and description props', () => {
    const wrapper = mount(TreeEmptyState, {
      props: {
        title: 'No releases yet',
        description: 'Create your first release to start tracking milestones.',
      },
    });

    expect(wrapper.classes()).toContain('tree-empty-state');
    expect(wrapper.find('.tree-empty-state__title').text()).toBe('No releases yet');
    expect(wrapper.find('.tree-empty-state__description').text()).toContain('Create your first release');
    expect(wrapper.attributes('aria-labelledby')).toBeDefined();
    expect(wrapper.attributes('aria-describedby')).toBeDefined();
  });

  it('renders icon, body, and actions slots in empty state', () => {
    const wrapper = mount(TreeEmptyState, {
      props: {
        title: 'No projects',
      },
      slots: {
        icon: '<span class="test-icon">icon</span>',
        default: '<p class="test-body">Invite teammates to get started.</p>',
        actions: '<button type="button" class="test-action">Invite</button>',
      },
    });

    expect(wrapper.find('.tree-empty-state__icon').exists()).toBe(true);
    expect(wrapper.find('.tree-empty-state__body').text()).toContain('Invite teammates');
    expect(wrapper.find('.tree-empty-state__actions').text()).toContain('Invite');
  });

  it('supports polymorphic empty state root and size classes', () => {
    const sm = mount(TreeEmptyState, {
      props: {
        as: 'article',
        size: 'sm',
        title: 'Small empty state',
      },
    });
    const lg = mount(TreeEmptyState, {
      props: {
        size: 'lg',
        title: 'Large empty state',
      },
    });

    expect(sm.element.tagName).toBe('ARTICLE');
    expect(sm.classes()).toContain('tree-empty-state--sm');
    expect(lg.classes()).toContain('tree-empty-state--lg');
  });

  it('renders title and description slots when provided', () => {
    const wrapper = mount(TreeEmptyState, {
      slots: {
        title: '<span>Custom title</span>',
        description: '<span>Custom description</span>',
      },
    });

    expect(wrapper.find('.tree-empty-state__title').text()).toBe('Custom title');
    expect(wrapper.find('.tree-empty-state__description').text()).toBe('Custom description');
  });

  // ── Table ──

  it('renders table with columns and rows', () => {
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
    ];
    const rows = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ];

    const wrapper = mount(TreeTable, {
      props: { columns, rows },
    });

    expect(wrapper.find('.tree-table').exists()).toBe(true);
    expect(wrapper.findAll('.tree-table__header')).toHaveLength(2);
    expect(wrapper.findAll('.tree-table__body .tree-table__row')).toHaveLength(2);
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('bob@example.com');
  });

  it('renders empty state when no rows', () => {
    const columns = [{ key: 'name', label: 'Name' }];
    const wrapper = mount(TreeTable, {
      props: { columns, rows: [] },
    });

    expect(wrapper.find('.tree-table__cell--empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('No data available');
  });

  it('sorts rows client-side when sortable header is clicked', async () => {
    const columns = [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'age', label: 'Age' },
    ];
    const rows = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 28 },
    ];

    const wrapper = mount(TreeTable, {
      props: { columns, rows },
    });

    const sortableHeader = wrapper.find('.tree-table__header--sortable');
    await sortableHeader.trigger('click');

    const cells = wrapper.findAll('.tree-table__body .tree-table__row');
    expect(cells[0].text()).toContain('Alice');
    expect(cells[1].text()).toContain('Bob');
    expect(cells[2].text()).toContain('Charlie');

    expect(wrapper.emitted('sort')).toBeTruthy();
    expect(wrapper.emitted('sort')![0]).toEqual([{ key: 'name', direction: 'asc' }]);
  });

  it('sets aria-sort on sortable headers', async () => {
    const columns = [{ key: 'name', label: 'Name', sortable: true }];
    const rows = [{ name: 'A' }];

    const wrapper = mount(TreeTable, {
      props: { columns, rows },
    });

    const header = wrapper.find('.tree-table__header--sortable');
    expect(header.attributes('aria-sort')).toBe('none');

    await header.trigger('click');
    expect(header.attributes('aria-sort')).toBe('ascending');

    await header.trigger('click');
    expect(header.attributes('aria-sort')).toBe('descending');
  });

  // ── Tag ──

  it('renders tag with variant and size classes', () => {
    const wrapper = mount(TreeTag, {
      props: { variant: 'solid', size: 'sm' },
      slots: { default: 'Vue' },
    });
    expect(wrapper.classes()).toContain('tree-tag');
    expect(wrapper.classes()).toContain('tree-tag--solid');
    expect(wrapper.classes()).toContain('tree-tag--sm');
    expect(wrapper.text()).toContain('Vue');
  });

  it('shows remove button and emits remove event', async () => {
    const wrapper = mount(TreeTag, {
      props: { removable: true },
      slots: { default: 'React' },
    });

    const removeBtn = wrapper.find('.tree-tag__remove');
    expect(removeBtn.exists()).toBe(true);
    expect(removeBtn.attributes('aria-label')).toBe('Remove');

    await removeBtn.trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });

  it('does not emit remove when disabled', async () => {
    const wrapper = mount(TreeTag, {
      props: { removable: true, disabled: true },
      slots: { default: 'Disabled' },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    await wrapper.find('.tree-tag__remove').trigger('click');
    expect(wrapper.emitted('remove')).toBeUndefined();
  });

  it('renders pricing card with title, price, and features', () => {
    const wrapper = mount(TreePricingCard, {
      props: {
        title: 'Pro',
        price: 29,
        currency: '$',
        period: '/month',
        features: [
          { text: 'Unlimited projects', included: true },
          { text: 'Custom domain', included: false },
        ],
        buttonText: 'Get started',
      },
    });

    expect(wrapper.find('.tree-pricing-card__title').text()).toBe('Pro');
    expect(wrapper.find('.tree-pricing-card__amount').text()).toBe('29');
    expect(wrapper.find('.tree-pricing-card__currency').text()).toBe('$');
    expect(wrapper.find('.tree-pricing-card__period').text()).toBe('/month');
    expect(wrapper.findAll('.tree-pricing-card__feature-item')).toHaveLength(2);
    expect(wrapper.find('.tree-pricing-card__feature-item--excluded').exists()).toBe(true);
    expect(wrapper.find('.tree-button').text()).toBe('Get started');
  });

  it('applies highlighted class and badge on pricing card', () => {
    const wrapper = mount(TreePricingCard, {
      props: {
        title: 'Pro',
        price: 29,
        highlighted: true,
        badge: 'Most popular',
      },
    });

    expect(wrapper.classes()).toContain('tree-pricing-card--highlighted');
    expect(wrapper.find('.tree-pricing-card__badge').exists()).toBe(true);
    expect(wrapper.find('.tree-badge').text()).toBe('Most popular');
  });

  it('emits select when pricing card button is clicked', async () => {
    const wrapper = mount(TreePricingCard, {
      props: {
        title: 'Pro',
        price: 29,
        buttonText: 'Choose',
      },
    });

    await wrapper.find('.tree-button').trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  it('renders pricing grid with multiple plans', () => {
    const wrapper = mount(TreePricing, {
      props: {
        plans: [
          { title: 'Free', price: 0, buttonText: 'Start' },
          { title: 'Pro', price: 29, highlighted: true, buttonText: 'Choose' },
          { title: 'Enterprise', price: 99, buttonText: 'Contact' },
        ],
      },
    });

    expect(wrapper.findAll('.tree-pricing-card')).toHaveLength(3);
    expect(wrapper.find('.tree-pricing-card--highlighted').exists()).toBe(true);
  });

  it('emits select with plan data from pricing grid', async () => {
    const plans = [
      { title: 'Free', price: 0, buttonText: 'Start' },
      { title: 'Pro', price: 29, buttonText: 'Choose' },
    ];

    const wrapper = mount(TreePricing, {
      props: { plans },
    });

    await wrapper.findAll('.tree-button')[1].trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')![0]).toEqual([plans[1], 1]);
  });

  /* ── MarkdownEditor ── */

  it('renders markdown editor with default classes', () => {
    const wrapper = mount(TreeMarkdownEditor);
    expect(wrapper.classes()).toContain('tree-md-editor');
    expect(wrapper.classes()).toContain('tree-md-editor--md');
  });

  it('emits update:modelValue on textarea input', async () => {
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('.tree-md-editor__textarea');
    await textarea.setValue('# Hello');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['# Hello']);
  });

  it('renders markdown preview from modelValue', () => {
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: '# Title\n\nSome **bold** text' },
    });

    const preview = wrapper.find('.tree-md-editor__preview');
    expect(preview.html()).toContain('<h1');
    expect(preview.html()).toContain('Title');
    expect(preview.html()).toContain('<strong>bold</strong>');
  });

  it('applies disabled state', () => {
    const wrapper = mount(TreeMarkdownEditor, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.find('.tree-md-editor__textarea').attributes('disabled')).toBeDefined();
  });

  it('applies size variants', () => {
    const sm = mount(TreeMarkdownEditor, { props: { size: 'sm' as const } });
    const lg = mount(TreeMarkdownEditor, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('tree-md-editor--sm');
    expect(lg.classes()).toContain('tree-md-editor--lg');
  });

  it('renders headings at different levels in preview', () => {
    const md = '# H1\n## H2\n### H3';
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: md },
    });

    const preview = wrapper.find('.tree-md-editor__preview');
    expect(preview.html()).toContain('<h1');
    expect(preview.html()).toContain('<h2');
    expect(preview.html()).toContain('<h3');
  });

  it('renders code blocks in preview', () => {
    const md = '```\nconst x = 1;\n```';
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: md },
    });

    const preview = wrapper.find('.tree-md-editor__preview');
    expect(preview.html()).toContain('<pre');
    expect(preview.html()).toContain('const x = 1;');
  });

  it('renders blockquotes in preview', () => {
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: '> quoted text' },
    });

    const preview = wrapper.find('.tree-md-editor__preview');
    expect(preview.html()).toContain('<blockquote');
    expect(preview.html()).toContain('quoted text');
  });

  it('renders lists in preview', () => {
    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: '- item 1\n- item 2' },
    });

    const preview = wrapper.find('.tree-md-editor__preview');
    expect(preview.html()).toContain('<ul');
    expect(preview.html()).toContain('<li>');
  });

  it('has accessible toolbar buttons with titles', () => {
    const wrapper = mount(TreeMarkdownEditor);
    const buttons = wrapper.findAll('.tree-md-editor__toolbar-btn');

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  it('calls uploadImage and emits image-upload on paste', async () => {
    const uploadImage = vi.fn().mockResolvedValue('https://example.com/img.png');

    const wrapper = mount(TreeMarkdownEditor, {
      props: { modelValue: '', uploadImage },
    });

    const file = new File(['img'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [{ type: 'image/png', getAsFile: () => file }],
    };

    const textarea = wrapper.find('.tree-md-editor__textarea');
    await textarea.trigger('paste', { clipboardData });

    // Wait for async upload
    await new Promise((r) => setTimeout(r, 50));

    expect(uploadImage).toHaveBeenCalledWith(file);
  });
});
