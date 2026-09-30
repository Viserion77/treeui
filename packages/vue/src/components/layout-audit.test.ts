// Behaviour half of the layout audit.
//
// `packages/vue/src/styles/surface-containment.test.ts` holds the CSS half —
// the rules that jsdom cannot exercise because it has no layout engine. What is
// here is the part that IS observable without layout: props that changed shape,
// markup that moved, and strings that stopped being hard-coded.
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';

import TBadge from './TBadge.vue';
import TCodeBlock from './TCodeBlock.vue';
import TDatePicker from './TDatePicker.vue';
import TFileUpload from './TFileUpload.vue';
import TPageHeader from './TPageHeader.vue';
import TPopover from './TPopover.vue';
import TSelect from './TSelect.vue';
import TTable from './TTable.vue';
import TTextarea from './TTextarea.vue';
import TToast from './TToast.vue';
import type { ToastItem } from '../composables/useToast';

/** Overlay panels teleport out of the wrapper; read the document instead. */
const inBody = <T extends Element = HTMLElement>(selector: string): T | null =>
  document.body.querySelector<T>(selector);

describe('overlay panels escape their clipping ancestor', () => {
  it.each([
    [
      'TPopover',
      () => mount(TPopover, { props: { defaultOpen: true }, slots: { default: '<p>panel</p>' } }),
      '.t-popover__content',
    ],
    [
      'TSelect',
      () =>
        mount(TSelect, {
          props: { defaultOpen: true, options: [{ label: 'A', value: 'a' }] },
        }),
      '.t-select__listbox',
    ],
    [
      'TDatePicker',
      () => mount(TDatePicker, { props: { defaultOpen: true, modelValue: '2026-03-15' } }),
      '.t-date-picker__content',
    ],
  ])('%s renders its panel in the body, not inside its own root', (_name, factory, selector) => {
    const wrapper = factory();

    const panel = inBody(selector);
    expect(panel, `${selector} should be teleported to the body`).not.toBeNull();
    // The point of the move: the panel is no longer a descendant of the root,
    // so no ancestor `overflow` can clip it.
    expect(wrapper.element.contains(panel!)).toBe(false);
    expect(panel!.classList.contains('is-anchored')).toBe(true);
  });

  it('keeps a click on the teleported popover panel from closing it', () => {
    const wrapper = mount(TPopover, {
      props: { defaultOpen: true },
      slots: { default: '<p class="inner">panel</p>' },
    });

    inBody('.inner')?.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    expect(wrapper.emitted('update:open')).toBeUndefined();
  });
});

describe('TSelect is generic over its value', () => {
  it('hands a narrow literal back through v-model', async () => {
    // The type-level half is what the issue was about; this pins the runtime
    // behaviour the generic describes — the value round-trips unwidened.
    const mode = ref<'scan' | 'query'>('scan');
    const wrapper = mount(TSelect, {
      props: {
        modelValue: mode.value,
        options: [
          { label: 'Scan', value: 'scan' as const },
          { label: 'Query', value: 'query' as const },
        ],
        defaultOpen: true,
        'onUpdate:modelValue': (value: 'scan' | 'query') => {
          mode.value = value;
        },
      },
    });

    document.body
      .querySelectorAll('[role="option"]')[1]
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();

    expect(mode.value).toBe('query');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['query']);
  });
});

describe('TBadge truncate', () => {
  it('wraps by default and carries no title', () => {
    const wrapper = mount(TBadge, { slots: { default: 'A rather long status' } });
    expect(wrapper.classes()).not.toContain('is-truncated');
    expect(wrapper.attributes('title')).toBeUndefined();
    expect(wrapper.find('.t-badge__label').exists()).toBe(true);
  });

  it('clips on one line and exposes the full text in title when asked', () => {
    const wrapper = mount(TBadge, { props: { truncate: true, label: 'A rather long status' } });
    expect(wrapper.classes()).toContain('is-truncated');
    expect(wrapper.attributes('title')).toBe('A rather long status');
    expect(wrapper.find('.t-badge__label').text()).toBe('A rather long status');
  });
});

describe('labels that used to be hard-coded English', () => {
  it('lets TFileUpload rename its clear and remove controls', () => {
    const wrapper = mount(TFileUpload, {
      props: {
        clearLabel: 'Limpar tudo',
        removeLabel: 'Remover',
        // A function, not a string: the file name sits inside the sentence and
        // its position differs by language.
        removeAriaLabel: (file: File) => `Remover ${file.name}`,
      },
    });
    expect(wrapper.props('clearLabel')).toBe('Limpar tudo');
    expect(wrapper.props('removeLabel')).toBe('Remover');
    expect(wrapper.props('removeAriaLabel')(new File([''], 'nota.pdf'))).toBe('Remover nota.pdf');
  });

  it('keeps the English defaults for anyone who passes nothing', () => {
    const wrapper = mount(TFileUpload);
    expect(wrapper.props('clearLabel')).toBe('Clear all');
    expect(wrapper.props('removeLabel')).toBe('Remove');
    expect(wrapper.props('removeAriaLabel')(new File([''], 'a.pdf'))).toBe('Remove a.pdf');
  });

  it('lets a toast name its own dismiss button, over the provider default', () => {
    const toast = (closeLabel?: string): ToastItem => ({
      id: 't1',
      title: 'Saved',
      variant: 'info',
      duration: 0,
      closable: true,
      closeLabel,
    });

    const instanceDefault = mount(TToast, {
      props: { toast: toast(), closeLabel: 'Fechar aviso' },
    });
    expect(instanceDefault.find('.t-toast__close').attributes('aria-label')).toBe('Fechar aviso');

    const perToast = mount(TToast, {
      props: { toast: toast('Dispensar'), closeLabel: 'Fechar aviso' },
    });
    expect(perToast.find('.t-toast__close').attributes('aria-label')).toBe('Dispensar');

    const untouched = mount(TToast, { props: { toast: toast() } });
    expect(untouched.find('.t-toast__close').attributes('aria-label')).toBe(
      'Dismiss notification',
    );
  });
});

describe('TCodeBlock density', () => {
  it('emits a size modifier and defaults to md', () => {
    expect(mount(TCodeBlock, { props: { code: 'a' } }).classes()).toContain('t-code-block--md');
    expect(mount(TCodeBlock, { props: { code: 'a', size: 'sm' } }).classes()).toContain(
      't-code-block--sm',
    );
  });
});

describe('TTextarea spellcheck', () => {
  it('forwards the attribute, and leaves it unset when not asked', () => {
    expect(
      mount(TTextarea, { props: { spellcheck: false } }).find('textarea').attributes('spellcheck'),
    ).toBe('false');
    expect(mount(TTextarea).find('textarea').attributes('spellcheck')).toBeUndefined();
  });
});

describe('TTable column minWidth', () => {
  it('puts the floor on a box inside the header, where the auto layout must honour it', () => {
    // On the `<th>` itself a width is only a suggestion under
    // `table-layout: auto`, which is the whole reason `width` did not work.
    const wrapper = mount(TTable, {
      props: {
        columns: [{ key: 'when', label: 'When', minWidth: '12rem' }],
        rows: [{ when: 'now' }],
      },
    });
    const content = wrapper.find('.t-table__header-content');
    expect(content.attributes('style')).toContain('min-inline-size: 12rem');
    expect(wrapper.find('th').attributes('style')).toBeUndefined();
  });
});

describe('TPageHeader slot presence', () => {
  // The reported case is a slot that is CONDITIONALLY PROVIDED — `v-if` on the
  // `<template #title>` — which is what changes `$slots`. Reading it through a
  // `computed` over `useSlots()` cached the first answer, because the slots
  // object keeps its identity and a property read on it is not a reactive
  // dependency. The template reads `$slots.title` directly, which is
  // re-evaluated on every render.
  const Host = {
    components: { TPageHeader },
    props: { show: { type: Boolean, default: false } },
    template: `
      <TPageHeader>
        <template
          v-if="show"
          #title
        >Reports</template>
      </TPageHeader>
    `,
  };

  it('picks up a title slot that appears after the first render', async () => {
    const wrapper = mount(Host, { props: { show: false } });
    expect(wrapper.find('.t-page-header__title').exists()).toBe(false);

    await wrapper.setProps({ show: true });
    expect(wrapper.find('.t-page-header__title').text()).toBe('Reports');
  });

  it('leaves no empty heading when the slot goes away again', async () => {
    const wrapper = mount(Host, { props: { show: true } });
    expect(wrapper.find('.t-page-header__title').exists()).toBe(true);

    await wrapper.setProps({ show: false });
    expect(wrapper.find('.t-page-header__title').exists()).toBe(false);
  });
});

describe('TIcon size is a closed axis', () => {
  it('warns and falls back rather than rendering an unknown size', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { default: TIcon } = await import('./TIcon.vue');

    const wrapper = mount(TIcon, { props: { name: 'cpu', size: 'huge' as never } });
    expect(wrapper.find('svg').attributes('width')).toBe('20');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
