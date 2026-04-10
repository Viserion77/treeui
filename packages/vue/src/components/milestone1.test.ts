import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TreeMultiSelect from './TreeMultiSelect.vue';
import TreeNumberInput from './TreeNumberInput.vue';
import TreeSelectableList from './TreeSelectableList.vue';
import TreeStat from './TreeStat.vue';
import TreeSteps from './TreeSteps.vue';
import TreeToggleGroup from './TreeToggleGroup.vue';
import TreeTreeView from './TreeTreeView.vue';

describe('Milestone 1 components', () => {
  it('renders stat content with icon and trend styles', () => {
    const wrapper = mount(TreeStat, {
      props: {
        label: 'MRR',
        value: '$48.2k',
        trend: '12%',
        tone: 'success',
        trendDirection: 'up',
      },
      slots: {
        icon: '<span class="stat-icon">i</span>',
      },
    });

    expect(wrapper.classes()).toContain('tree-stat--success');
    expect(wrapper.find('.tree-stat__icon').exists()).toBe(true);
    expect(wrapper.find('.tree-stat__label').text()).toBe('MRR');
    expect(wrapper.find('.tree-stat__value').text()).toBe('$48.2k');
    expect(wrapper.find('.tree-stat__trend').text()).toContain('12%');
  });

  it('renders stat loading placeholders with aria-busy', () => {
    const wrapper = mount(TreeStat, {
      props: {
        loading: true,
        label: 'MRR',
      },
    });

    expect(wrapper.classes()).toContain('is-loading');
    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.find('.tree-stat__loading').exists()).toBe(true);
    expect(wrapper.find('.tree-stat__value').exists()).toBe(false);
  });

  it('steps number input with controls and keyboard while respecting bounds', async () => {
    const wrapper = mount(TreeNumberInput, {
      props: {
        modelValue: 1,
        min: 0,
        max: 2,
        step: 0.5,
      },
      attrs: {
        'aria-label': 'Seats',
      },
    });

    const [decrement, increment] = wrapper.findAll('button');
    await increment.trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1.5]);

    const input = wrapper.get('input');
    await input.trigger('keydown', { key: 'End' });
    await input.trigger('keydown', { key: 'ArrowUp' });

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([2]);
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([2]);

    await decrement.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[3]).toEqual([1.5]);
  });

  it('emits single and multiple toggle group selections', async () => {
    const single = mount(TreeToggleGroup, {
      props: {
        modelValue: 'day',
        options: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month', disabled: true },
        ],
      },
    });

    const singleButtons = single.findAll('button');
    await singleButtons[0].trigger('keydown', { key: 'ArrowRight' });

    expect(single.emitted('update:modelValue')?.[0]).toEqual(['week']);

    const multiple = mount(TreeToggleGroup, {
      props: {
        modelValue: ['design'],
        selectionMode: 'multiple',
        options: [
          { label: 'Design', value: 'design' },
          { label: 'Engineering', value: 'engineering' },
        ],
      },
    });

    await multiple.findAll('button')[1].trigger('click');

    expect(multiple.emitted('update:modelValue')?.[0]).toEqual([['design', 'engineering']]);
  });

  it('supports keyboard selection in selectable list', async () => {
    const wrapper = mount(TreeSelectableList, {
      attachTo: document.body,
      props: {
        defaultValue: 'release',
        items: [
          { label: 'Release notes', value: 'release' },
          { label: 'Launch brief', value: 'launch' },
          { label: 'Incident playbook', value: 'incident', disabled: true },
        ],
      },
      attrs: {
        'aria-label': 'Templates',
      },
    });

    const items = wrapper.findAll('.tree-selectable-list__item');
    expect(items[0].classes()).toContain('is-selected');

    await items[0].trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['launch']);
    expect(document.activeElement).toBe(items[1].element);

    wrapper.unmount();
  });

  it('updates interactive steps and resolves statuses from the current value', async () => {
    const wrapper = mount(TreeSteps, {
      props: {
        interactive: true,
        modelValue: 'workspace',
        items: [
          { value: 'profile', label: 'Profile' },
          { value: 'workspace', label: 'Workspace' },
          { value: 'billing', label: 'Billing' },
        ],
      },
    });

    const items = wrapper.findAll('.tree-steps__item');
    expect(items[0].classes()).toContain('is-complete');
    expect(items[1].classes()).toContain('is-current');
    expect(items[2].classes()).toContain('is-upcoming');

    await wrapper.findAll('.tree-steps__button')[2].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['billing']);
  });

  it('opens multi-select options and emits array updates on selection and removal', async () => {
    const wrapper = mount(TreeMultiSelect, {
      props: {
        modelValue: ['engineering'],
        options: [
          { label: 'Design', value: 'design' },
          { label: 'Engineering', value: 'engineering' },
          { label: 'Operations', value: 'ops' },
        ],
      },
      attrs: {
        'aria-label': 'Teams',
      },
    });

    const input = wrapper.get('input');
    await input.trigger('focus');
    await nextTick();

    const options = wrapper.findAll('[role="option"]');
    await options[0].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['engineering', 'design']]);

    await input.trigger('keydown', { key: 'Backspace' });

    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]]);
  });

  it('renders tree view selection and expansion interactions', async () => {
    const wrapper = mount(TreeTreeView, {
      props: {
        defaultValue: 'docs-roadmap',
        defaultExpanded: ['workspace'],
        nodes: [
          {
            id: 'workspace',
            label: 'Workspace',
            children: [
              { id: 'docs-roadmap', label: 'Roadmap.mdx' },
              {
                id: 'app',
                label: 'App',
                children: [{ id: 'app-dashboard', label: 'Dashboard.vue' }],
              },
            ],
          },
        ],
      },
      attrs: {
        'aria-label': 'Workspace tree',
      },
    });

    const rows = wrapper.findAll('[role="treeitem"]');
    expect(rows).toHaveLength(3);
    expect(rows[1].attributes('aria-selected')).toBe('true');

    await rows[2].trigger('keydown', { key: 'ArrowRight' });

    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([['workspace', 'app']]);

    await rows[2].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['app']);
  });
});
