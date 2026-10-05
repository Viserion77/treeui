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
import TChart from './TChart.vue';
import TStat from './TStat.vue';
import TStatGroup from './TStatGroup.vue';
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

describe('round two: the validation feedback on the first delivery', () => {
  it('formats TChart axis ticks apart from the tooltip', () => {
    // One formatter could not serve both: a tooltip can spell the full figure,
    // the y-axis at 320px cannot, and the space reserved for it is capped.
    const wrapper = mount(TChart, {
      props: {
        labels: ['Jan', 'Feb'],
        series: [{ label: 'Revenue', data: [1_500_000_000, 900_000_000] }],
        valueFormat: (v: number) => `R$ ${v.toLocaleString('pt-BR')}`,
        axisValueFormat: (v: number) => `R$ ${(v / 1e9).toFixed(1)} bi`,
      },
    });

    const axis = wrapper.findAll('.t-chart__axis-label--y').map((n) => n.text());
    expect(axis.some((t) => t.includes('bi'))).toBe(true);
    // The verbose form must NOT reach the axis.
    expect(axis.some((t) => t.includes('000.000'))).toBe(false);
  });

  it('falls back to valueFormat when no axis formatter is given', () => {
    const wrapper = mount(TChart, {
      props: {
        labels: ['Jan'],
        series: [{ label: 'Revenue', data: [1200] }],
        valueFormat: (v: number) => `#${v}`,
      },
    });
    expect(wrapper.findAll('.t-chart__axis-label--y').map((n) => n.text()).join(' ')).toContain('#');
  });

  it('anchors the first and last x labels with a class, not an attribute', () => {
    const wrapper = mount(TChart, {
      props: { labels: ['Jan', 'Feb', 'Mar'], series: [{ label: 'A', data: [1, 2, 3] }] },
    });
    const xs = wrapper.findAll('.t-chart__axis-label--x');
    // CSS beats a presentation attribute, so the anchoring has to be a class.
    expect(xs[0].classes()).toContain('is-anchor-start');
    expect(xs[xs.length - 1].classes()).toContain('is-anchor-end');
    expect(xs[0].attributes('text-anchor')).toBeUndefined();
  });

  it('gives TStat a size modifier, defaulting to md', () => {
    expect(mount(TStat, { props: { label: 'A', value: '1' } }).classes()).toContain('t-stat--md');
    expect(
      mount(TStat, { props: { label: 'A', value: '1', size: 'sm' } }).classes(),
    ).toContain('t-stat--sm');
  });

  it('reserves the toolbar width only when the copy button is actually rendered', () => {
    // `copyable` without `code` renders no button, so there is nothing to clear.
    expect(mount(TCodeBlock, { props: { code: 'x', copyable: true } }).classes()).toContain(
      'is-copyable',
    );
    expect(
      mount(TCodeBlock, { props: { copyable: true } }).classes(),
    ).not.toContain('is-copyable');
  });
});

describe('round two: TFileUpload has no English left', () => {
  it('takes the spinner label and both announcements as props', () => {
    const wrapper = mount(TFileUpload, {
      props: {
        uploadingLabel: 'Enviando arquivos',
        uploadedAnnouncement: (n: string) => `${n} enviado.`,
        failedAnnouncement: (n: string) => `${n} falhou.`,
      },
    });
    expect(wrapper.props('uploadingLabel')).toBe('Enviando arquivos');
    expect(wrapper.props('uploadedAnnouncement')('nota.pdf')).toBe('nota.pdf enviado.');
    expect(wrapper.props('failedAnnouncement')('nota.pdf')).toBe('nota.pdf falhou.');
  });

  it('keeps the English defaults for anyone who passes nothing', () => {
    const wrapper = mount(TFileUpload);
    expect(wrapper.props('uploadingLabel')).toBe('Uploading files');
    expect(wrapper.props('uploadedAnnouncement')('a.pdf')).toBe('a.pdf uploaded.');
  });

  it('can turn the built-in rejection feedback off', () => {
    expect(mount(TFileUpload).props('showRejections')).toBe(true);
    expect(mount(TFileUpload, { props: { showRejections: false } }).props('showRejections')).toBe(
      false,
    );
  });

  /** Reject one file by type, so there is a message on screen to inspect. */
  const rejectAFile = async (props: Record<string, unknown>) => {
    const wrapper = mount(TFileUpload, { props: { accept: 'image/*', ...props } });
    const input = wrapper.get('input[type="file"]');
    const el = input.element as HTMLInputElement;
    Object.defineProperty(el, 'files', {
      value: [new File(['x'], 'notes.txt', { type: 'text/plain' })],
      configurable: true,
    });
    await input.trigger('change');
    return wrapper;
  };

  it('renders the built-in rejection message by default', async () => {
    const wrapper = await rejectAFile({
      rejectionLabels: { 'file-invalid-type': ({ name }: { name: string }) => `${name} recusado.` },
    });
    expect(wrapper.text()).toContain('notes.txt recusado.');
  });

  it('renders no built-in message when the product shows its own', async () => {
    const wrapper = await rejectAFile({
      showRejections: false,
      rejectionLabels: { 'file-invalid-type': ({ name }: { name: string }) => `${name} recusado.` },
    });
    // The event still fires — the product needs it to render its own alert.
    expect(wrapper.emitted('files-rejected')).toBeTruthy();
    expect(wrapper.text()).not.toContain('notes.txt recusado.');
  });

  it('retranslates a message that is already on screen', async () => {
    // The rejection used to be stored as its RENDERED string, frozen at refusal
    // time, so switching language left the old sentence up. It is stored as
    // data now and formatted during render.
    const wrapper = await rejectAFile({
      rejectionLabels: { 'file-invalid-type': ({ name }: { name: string }) => `${name} recusado.` },
    });
    expect(wrapper.text()).toContain('notes.txt recusado.');

    await wrapper.setProps({
      rejectionLabels: { 'file-invalid-type': ({ name }: { name: string }) => `${name} rejected.` },
    });
    expect(wrapper.text()).toContain('notes.txt rejected.');
    expect(wrapper.text()).not.toContain('notes.txt recusado.');
  });
});

describe('round three: a band of indicators, and the note under the value', () => {
  it('draws its own card on its own, and none inside a group', () => {
    expect(mount(TStat, { props: { label: 'A', value: '1' } }).classes()).toContain('t-stat--card');

    const band = mount(TStatGroup, {
      slots: { default: '<TStat label="A" value="1" />' },
      global: { components: { TStat } },
    });
    // Nothing is set on the child: the group tells it, so a ninth one added
    // later cannot be the one that looks wrong.
    expect(band.find('.t-stat').classes()).toContain('t-stat--plain');
    expect(band.find('.t-stat').classes()).not.toContain('t-stat--card');
  });

  it('lets an explicit variant win over the group', () => {
    const band = mount(TStatGroup, {
      slots: { default: '<TStat label="A" value="1" variant="card" />' },
      global: { components: { TStat } },
    });
    expect(band.find('.t-stat').classes()).toContain('t-stat--card');
  });

  it('announces the band as one unit', () => {
    const band = mount(TStatGroup, { props: { label: 'Indicadores do mês' } });
    expect(band.attributes('role')).toBe('group');
    expect(band.attributes('aria-label')).toBe('Indicadores do mês');
  });

  it('leaves balance off, because it composes badly with a container-scaled value', () => {
    // A lone cell stretched across the last row prints a number visibly larger
    // than its siblings', and size on a dashboard reads as importance.
    expect(mount(TStatGroup).findComponent({ name: 'TGrid' }).props('balance')).toBe(false);
  });

  it('moves the note out of the label line and after the value', () => {
    const top = mount(TStat, { props: { label: 'A', value: '1', meta: 'nota' } });
    expect(top.find('.t-stat__topline .t-stat__meta').exists()).toBe(true);

    const bottom = mount(TStat, {
      props: { label: 'A', value: '1', meta: 'nota', metaPlacement: 'bottom' },
    });
    expect(bottom.find('.t-stat__topline .t-stat__meta').exists()).toBe(false);
    expect(bottom.find('.t-stat__meta--bottom').exists()).toBe(true);

    // The announced order has to follow the visual one: label, value, note.
    const order = [...bottom.element.querySelectorAll('.t-stat__label, .t-stat__value, .t-stat__meta')]
      .map((n) => n.className.split(' ')[0]);
    expect(order).toEqual(['t-stat__label', 't-stat__value', 't-stat__meta']);
  });

  it('keeps the topline when only the label is left', () => {
    const wrapper = mount(TStat, {
      props: { label: 'A', value: '1', meta: 'nota', metaPlacement: 'bottom' },
    });
    expect(wrapper.find('.t-stat__topline .t-stat__label').exists()).toBe(true);
  });
});
