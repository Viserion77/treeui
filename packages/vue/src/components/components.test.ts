import { nextTick, reactive } from 'vue';
import { mount } from '@vue/test-utils';
import TBadge from './TBadge.vue';
import TButton from './TButton.vue';
import TAlert from './TAlert.vue';
import TCard from './TCard.vue';
import TCheckbox from './TCheckbox.vue';
import TCombobox from './TCombobox.vue';
import TConfirmDialog from './TConfirmDialog.vue';
import TDatePicker from './TDatePicker.vue';
import TDateTimePicker from './TDateTimePicker.vue';
import TInput from './TInput.vue';
import TTextarea from './TTextarea.vue';
import TModal from './TModal.vue';
import TSpinner from './TSpinner.vue';
import TTooltip from './TTooltip.vue';
import TRadio from './TRadio.vue';
import TRadioGroup from './TRadioGroup.vue';
import TSelect from './TSelect.vue';
import TFormField from './TFormField.vue';
import TSwitch from './TSwitch.vue';
import TSkeleton from './TSkeleton.vue';
import TProgress from './TProgress.vue';
import TPagination from './TPagination.vue';
import TAccordion from './TAccordion.vue';
import TAccordionItem from './TAccordionItem.vue';
import TBreadcrumb from './TBreadcrumb.vue';
import TBreadcrumbItem from './TBreadcrumbItem.vue';
import TDropdown from './TDropdown.vue';
import TDrawer from './TDrawer.vue';
import TContextMenu from './TContextMenu.vue';
import TFileUpload from './TFileUpload.vue';
import type { TFileUploadState } from './TFileUpload.vue';
import TPopover from './TPopover.vue';
import TTabs from './TTabs.vue';
import TTabList from './TTabList.vue';
import TTab from './TTab.vue';
import TTabPanel from './TTabPanel.vue';
import TToastProvider from './TToastProvider.vue';
import TAvatar from './TAvatar.vue';
import TDivider from './TDivider.vue';
import TEmptyState from './TEmptyState.vue';
import TTable from './TTable.vue';
import TTag from './TTag.vue';
import TTimeline from './TTimeline.vue';
import TPricingCard from './TPricingCard.vue';
import TPricing from './TPricing.vue';
import TMarkdownEditor from './TMarkdownEditor.vue';
import TIcon from './TIcon.vue';
import TChart from './TChart.vue';
import TSparkline from './TSparkline.vue';
import TDonutChart from './TDonutChart.vue';
import TLink from './TLink.vue';
import TNavMenu from './TNavMenu.vue';
import { useToast } from '../composables/useToast';

describe('@treeui/vue', () => {
  it('renders button states and blocks clicks while loading', async () => {
    const wrapper = mount(TButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Save changes',
      },
    });

    expect(wrapper.classes()).toContain('t-button--solid');
    expect(wrapper.attributes('aria-busy')).toBe('true');

    await wrapper.trigger('click');

    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('renders polymorphic button with correct a11y when disabled', async () => {
    const wrapper = mount(TButton, {
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
    const wrapper = mount(TButton, {
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
    const wrapper = mount(TInput, {
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

  it('opens the file picker from keyboard and accepts input files', async () => {
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});

    const wrapper = mount(TFileUpload, {
      props: {
        label: 'Upload assets',
      },
    });

    const dropzone = wrapper.get('.t-file-upload__dropzone');
    await dropzone.trigger('keydown', { key: 'Enter' });

    expect(clickSpy).toHaveBeenCalledTimes(1);

    const input = wrapper.get('input[type="file"]');
    const file = new File(['brief'], 'brief.txt', { type: 'text/plain' });

    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true,
    });

    await input.trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file]]);
    expect(wrapper.emitted('files-accepted')?.[0]).toEqual([[file]]);

    clickSpy.mockRestore();
  });

  it('handles drag and drop files', async () => {
    const wrapper = mount(TFileUpload);
    const dropzone = wrapper.get('.t-file-upload__dropzone');
    const file = new File(['image'], 'hero.png', { type: 'image/png' });
    const dataTransfer = {
      files: [file],
      types: ['Files'],
      dropEffect: '',
    } as unknown as DataTransfer;

    await dropzone.trigger('dragenter', { dataTransfer });

    expect(wrapper.classes()).toContain('is-drag-active');

    await dropzone.trigger('drop', { dataTransfer });

    expect(wrapper.classes()).not.toContain('is-drag-active');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file]]);
  });

  it('accepts pasted files while focused', async () => {
    const wrapper = mount(TFileUpload);
    const file = new File(['image'], 'pasted.png', { type: 'image/png' });
    const pasteEvent = new Event('paste', {
      bubbles: true,
      cancelable: true,
    });

    Object.defineProperty(pasteEvent, 'clipboardData', {
      value: {
        items: [
          {
            kind: 'file',
            getAsFile: () => file,
          },
        ],
      },
      configurable: true,
    });

    await wrapper.trigger('focusin');
    document.dispatchEvent(pasteEvent);
    await nextTick();

    expect(pasteEvent.defaultPrevented).toBe(true);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[file]]);
  });

  it('rejects invalid type and oversized files in file upload', async () => {
    const wrapper = mount(TFileUpload, {
      props: {
        accept: 'image/*',
        maxFileSize: 3,
      },
    });

    const dropzone = wrapper.get('.t-file-upload__dropzone');
    const invalidType = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });
    const oversized = new File(['12345'], 'screen.png', { type: 'image/png' });
    const dataTransfer = {
      files: [invalidType, oversized],
      types: ['Files'],
    } as unknown as DataTransfer;

    await dropzone.trigger('drop', { dataTransfer });

    const rejections = wrapper.emitted('files-rejected')?.[0]?.[0] as Array<{ reason: string }>;

    expect(rejections).toHaveLength(2);
    expect(rejections[0].reason).toBe('file-invalid-type');
    expect(rejections[1].reason).toBe('file-too-large');
    expect(wrapper.text()).toContain('report.pdf is not an accepted file type.');
    expect(wrapper.text()).toContain('screen.png exceeds the 3 B limit.');
  });

  it('renders selected files and supports remove and clear actions', async () => {
    const first = new File(['a'], 'alpha.txt', { type: 'text/plain' });
    const second = new File(['b'], 'beta.txt', { type: 'text/plain' });

    const wrapper = mount(TFileUpload, {
      props: {
        modelValue: [first, second],
        filesLabel: 'Uploads',
      },
    });

    expect(wrapper.text()).toContain('Uploads (2)');
    expect(wrapper.text()).toContain('alpha.txt');
    expect(wrapper.text()).toContain('beta.txt');

    await wrapper.findAll('.t-file-upload__remove')[0].trigger('click');
    await wrapper.get('.t-file-upload__clear').trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[second]]);
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]]);
  });

  it('swaps the dropzone label while a drag is active and reverts afterwards', async () => {
    const wrapper = mount(TFileUpload, {
      props: {
        label: 'Drop files here',
      },
    });

    const dropzone = wrapper.get('.t-file-upload__dropzone');
    const file = new File(['brief'], 'brief.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: [file],
      types: ['Files'],
      dropEffect: '',
    } as unknown as DataTransfer;

    expect(wrapper.get('.t-file-upload__label').text()).toBe('Drop files here');

    await dropzone.trigger('dragenter', { dataTransfer });

    expect(wrapper.get('.t-file-upload__label').text()).toBe('Release to upload');

    await dropzone.trigger('dragleave', { dataTransfer });

    expect(wrapper.get('.t-file-upload__label').text()).toBe('Drop files here');

    await dropzone.trigger('dragenter', { dataTransfer });
    await dropzone.trigger('drop', { dataTransfer });

    expect(wrapper.get('.t-file-upload__label').text()).toBe('Drop files here');
  });

  it('renders upload percentage and remaining time for an uploading file', async () => {
    const file = new File(['hero'], 'hero.png', { type: 'image/png' });
    const uploadState = new Map([
      [file, { status: 'uploading' as const, progress: 62, remainingMs: 12000 }],
    ]);

    const wrapper = mount(TFileUpload, {
      props: {
        modelValue: [file],
        uploadState,
      },
    });

    expect(wrapper.get('.t-file-upload__file-status').text()).toBe(
      'Uploading · 62% · About 12s left',
    );

    const progressbars = wrapper.findAll('[role="progressbar"]');

    expect(progressbars).toHaveLength(1);
    expect(progressbars[0].attributes('aria-valuenow')).toBe('62');
    expect(wrapper.get('.t-file-upload__file').attributes('aria-busy')).toBe('true');
  });

  it('offers a resume affordance for a resumable errored file and emits retry', async () => {
    const file = new File(['x'], 'video.mp4', { type: 'video/mp4' });
    const state = {
      status: 'error' as const,
      progress: 90,
      error: 'Connection lost at 90%.',
      resumable: true,
    };
    const uploadState = new Map([[file, state]]);

    const wrapper = mount(TFileUpload, {
      props: {
        modelValue: [file],
        uploadState,
      },
    });

    const retry = wrapper.get('.t-file-upload__retry');

    expect(retry.text()).toBe('Resume from 90%');
    expect(wrapper.text()).toContain('Connection lost at 90%.');

    await retry.trigger('click');

    expect(wrapper.emitted('retry')?.[0]).toEqual([
      {
        file,
        index: 0,
        fileKey: expect.any(String),
        mode: 'resume',
        state,
      },
    ]);
  });

  it('keeps every row independent when one file fails or is uploading', async () => {
    const first = new File(['a'], 'alpha.txt', { type: 'text/plain' });
    const second = new File(['b'], 'beta.txt', { type: 'text/plain' });
    const third = new File(['c'], 'gamma.txt', { type: 'text/plain' });

    const uploadState = new Map([
      [first, { status: 'error' as const, progress: 90, error: 'Connection lost.', resumable: true }],
      [second, { status: 'uploading' as const, progress: 40 }],
      [third, { status: 'paused' as const, progress: 10 }],
    ]);

    const wrapper = mount(TFileUpload, {
      props: {
        modelValue: [first, second, third],
        uploadState,
        loading: true,
      },
    });

    const removeButtons = wrapper.findAll('.t-file-upload__remove');
    const retryButtons = wrapper.findAll('.t-file-upload__retry');

    expect(removeButtons).toHaveLength(3);
    expect(retryButtons).toHaveLength(2);

    for (const button of [...removeButtons, ...retryButtons]) {
      expect((button.element as HTMLButtonElement).disabled).toBe(false);
    }

    expect(wrapper.classes()).not.toContain('is-disabled');

    await removeButtons[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[first, third]]);
  });

  it('renders thumbnails for image files only and revokes object urls on unmount', async () => {
    const globalUrl = URL as unknown as Record<string, unknown>;
    const hadCreate = 'createObjectURL' in globalUrl;
    const hadRevoke = 'revokeObjectURL' in globalUrl;
    const originalCreate = globalUrl.createObjectURL;
    const originalRevoke = globalUrl.revokeObjectURL;

    const createObjectURL = vi.fn(() => 'blob:tree-thumb');
    const revokeObjectURL = vi.fn();

    globalUrl.createObjectURL = createObjectURL;
    globalUrl.revokeObjectURL = revokeObjectURL;

    try {
      const image = new File(['image'], 'hero.png', { type: 'image/png' });
      const document_ = new File(['doc'], 'brief.txt', { type: 'text/plain' });

      const wrapper = mount(TFileUpload, {
        props: {
          modelValue: [image, document_],
        },
      });

      await nextTick();

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(createObjectURL).toHaveBeenCalledWith(image);

      const thumbnails = wrapper.findAll('.t-file-upload__thumb-image');

      expect(thumbnails).toHaveLength(1);
      expect(thumbnails[0].attributes('src')).toBe('blob:tree-thumb');

      const fallbacks = wrapper.findAll('.t-file-upload__thumb-fallback');

      expect(fallbacks).toHaveLength(1);
      expect(fallbacks[0].text()).toBe('TXT');

      wrapper.unmount();

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:tree-thumb');
    } finally {
      if (hadCreate) {
        globalUrl.createObjectURL = originalCreate;
      } else {
        delete globalUrl.createObjectURL;
      }

      if (hadRevoke) {
        globalUrl.revokeObjectURL = originalRevoke;
      } else {
        delete globalUrl.revokeObjectURL;
      }
    }
  });

  it('announces a repeated identical failure by appending a new status log node', async () => {
    const file = new File(['v'], 'video.mp4', { type: 'video/mp4' });

    const uploadState = reactive(
      new Map<File, TFileUploadState>([[file, { status: 'uploading', progress: 90 }]]),
    );

    const wrapper = mount(TFileUpload, {
      props: { modelValue: [file], uploadState },
      attachTo: document.body,
    });

    await nextTick();

    const log = wrapper.get('.t-file-upload__status-log').element;

    let addedNodes = 0;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        addedNodes += record.addedNodes.length;
      }
    });

    observer.observe(log, { childList: true, characterData: true, subtree: true });

    // A flaky connection failing twice with the identical error is the common
    // case: each failure must mutate the live region, or assistive tech stays
    // silent on the second one.
    for (let cycle = 0; cycle < 2; cycle += 1) {
      uploadState.set(file, { status: 'error', progress: 90, error: 'Connection lost.' });
      await nextTick();
      await nextTick();

      uploadState.set(file, { status: 'uploading', progress: 90 });
      await nextTick();
      await nextTick();
    }

    observer.disconnect();

    expect(addedNodes).toBe(2);

    const entries = wrapper.findAll('.t-file-upload__status-log-entry');

    expect(entries).toHaveLength(2);
    expect(entries[1].text()).toBe('video.mp4 failed. Connection lost.');

    wrapper.unmount();
  });

  it('bounds the status log history while still announcing every failure', async () => {
    const file = new File(['v'], 'video.mp4', { type: 'video/mp4' });

    const uploadState = reactive(
      new Map<File, TFileUploadState>([[file, { status: 'uploading' }]]),
    );

    const wrapper = mount(TFileUpload, {
      props: { modelValue: [file], uploadState },
      attachTo: document.body,
    });

    await nextTick();

    for (let cycle = 0; cycle < 8; cycle += 1) {
      uploadState.set(file, { status: 'error', error: 'Connection lost.' });
      await nextTick();
      await nextTick();

      uploadState.set(file, { status: 'uploading' });
      await nextTick();
      await nextTick();
    }

    expect(wrapper.findAll('.t-file-upload__status-log-entry')).toHaveLength(5);

    wrapper.unmount();
  });

  it('emits textarea updates and applies size class', async () => {
    const wrapper = mount(TTextarea, {
      props: {
        modelValue: 'hello',
        size: 'lg',
        'onUpdate:modelValue': (value: string) => value,
      },
      attrs: {
        'aria-label': 'Description',
      },
    });

    expect(wrapper.classes()).toContain('t-textarea');
    expect(wrapper.classes()).toContain('t-textarea--lg');

    await wrapper.get('textarea').setValue('hello tree');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello tree']);
    expect(wrapper.get('textarea').attributes('aria-label')).toBe('Description');
  });

  it('applies invalid and disabled states to textarea', () => {
    const invalid = mount(TTextarea, {
      props: { modelValue: '', invalid: true },
      attrs: { 'aria-label': 'Invalid' },
    });

    expect(invalid.classes()).toContain('is-invalid');
    expect(invalid.get('textarea').attributes('aria-invalid')).toBe('true');

    const disabled = mount(TTextarea, {
      props: { modelValue: '', disabled: true },
      attrs: { 'aria-label': 'Disabled' },
    });

    expect(disabled.classes()).toContain('is-disabled');
    expect(disabled.get('textarea').attributes('disabled')).toBeDefined();
  });

  it('renders card slots', () => {
    const wrapper = mount(TCard, {
      slots: {
        header: '<strong>TreeUI</strong>',
        default: '<p>Quiet elegance for product UI.</p>',
        footer: '<small>v0.1.0</small>',
      },
    });

    expect(wrapper.find('.t-card__header').exists()).toBe(true);
    expect(wrapper.find('.t-card__footer').exists()).toBe(true);
  });

  it('renders card with title prop and actions slot', () => {
    const wrapper = mount(TCard, {
      props: { title: 'Pool Semanal' },
      slots: {
        actions: '<button>Fechar</button>',
        default: '<p>Content here</p>',
      },
    });

    expect(wrapper.find('.t-card__title').text()).toBe('Pool Semanal');
    expect(wrapper.find('.t-card__actions').exists()).toBe(true);
    expect(wrapper.find('.t-card__header').exists()).toBe(true);
  });

  it('renders card inset variant', () => {
    const wrapper = mount(TCard, {
      props: { variant: 'inset' },
      slots: { default: '<p>Sub-section</p>' },
    });

    expect(wrapper.classes()).toContain('t-card--inset');
  });

  it('renders card header slot as override when both title and header are provided', () => {
    const wrapper = mount(TCard, {
      props: { title: 'Ignored' },
      slots: {
        header: '<strong>Custom Header</strong>',
        default: '<p>Content</p>',
      },
    });

    expect(wrapper.find('.t-card__header').exists()).toBe(true);
    expect(wrapper.find('.t-card__title').exists()).toBe(false);
    expect(wrapper.find('strong').text()).toBe('Custom Header');
  });

  it('renders link with default variant and href', () => {
    const wrapper = mount(TLink, {
      props: { href: '/docs' },
      slots: { default: 'Documentation' },
    });

    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/docs');
    expect(wrapper.classes()).toContain('t-link');
    expect(wrapper.classes()).toContain('t-link--default');
    expect(wrapper.text()).toBe('Documentation');
  });

  it('renders link as span when disabled', () => {
    const wrapper = mount(TLink, {
      props: { href: '/docs', disabled: true },
      slots: { default: 'Disabled link' },
    });

    expect(wrapper.element.tagName).toBe('SPAN');
    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.attributes('tabindex')).toBe('-1');
  });

  it('renders external link with target and rel', () => {
    const wrapper = mount(TLink, {
      props: { href: 'https://example.com', external: true },
      slots: { default: 'External' },
    });

    expect(wrapper.attributes('target')).toBe('_blank');
    expect(wrapper.attributes('rel')).toBe('noopener noreferrer');
  });

  it('renders link variant classes', () => {
    const muted = mount(TLink, {
      props: { href: '#', variant: 'muted' as const },
      slots: { default: 'Muted' },
    });
    expect(muted.classes()).toContain('t-link--muted');

    const danger = mount(TLink, {
      props: { href: '#', variant: 'danger' as const },
      slots: { default: 'Danger' },
    });
    expect(danger.classes()).toContain('t-link--danger');
  });

  it('renders nav menu items and emits selection', async () => {
    const wrapper = mount(TNavMenu, {
      props: {
        items: [
          { label: 'Home', value: 'home' },
          { label: 'Settings', value: 'settings' },
        ],
        modelValue: 'home',
      },
      attrs: { 'aria-label': 'Main nav' },
    });

    expect(wrapper.find('nav').exists()).toBe(true);
    expect(wrapper.findAll('.t-nav-menu__item')).toHaveLength(2);

    const firstItem = wrapper.find('.t-nav-menu__item.is-selected');
    expect(firstItem.exists()).toBe(true);
    expect(firstItem.attributes('aria-current')).toBe('page');

    await wrapper.findAll('.t-nav-menu__item')[1].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['settings']);
  });

  it('renders nav menu item with icon when provided', () => {
    const IconStub = { template: '<svg />' };
    const wrapper = mount(TNavMenu, {
      props: {
        items: [
          { label: 'Dashboard', value: 'dash', icon: IconStub },
        ],
      },
      attrs: { 'aria-label': 'Nav' },
    });

    expect(wrapper.find('.t-nav-menu__icon').exists()).toBe(true);
    expect(wrapper.find('.t-nav-menu__marker').exists()).toBe(false);
  });

  it('renders badge variants', () => {
    const wrapper = mount(TBadge, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Critical',
      },
    });

    expect(wrapper.classes()).toContain('t-badge--danger');
    expect(wrapper.text()).toContain('Critical');
  });

  it('supports semantic badge tones without changing the visual variant API', () => {
    const wrapper = mount(TBadge, {
      props: {
        variant: 'soft',
        tone: 'success',
      },
      slots: {
        default: 'Healthy',
      },
    });

    expect(wrapper.classes()).toContain('t-badge--soft');
    expect(wrapper.classes()).toContain('t-badge--tone-success');
    expect(wrapper.text()).toContain('Healthy');
  });

  it('exposes an accessible loading label on the spinner', () => {
    const wrapper = mount(TSpinner, {
      props: {
        label: 'Saving',
      },
    });

    expect(wrapper.attributes('role')).toBe('status');
    expect(wrapper.attributes('aria-label')).toBe('Saving');
  });

  it('opens the tooltip from a slotted trigger and emits state changes', async () => {
    vi.useFakeTimers();

    const wrapper = mount(TTooltip, {
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
    const wrapper = mount(TDatePicker, {
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
    const wrapper = mount(TDatePicker, {
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
    expect(wrapper.get('.t-date-picker__month').text()).toContain('April');

    await wrapper.get('[data-date="2026-04-16"]').trigger('keydown', { key: 'Escape' });
    await nextTick();

    expect(wrapper.find('[role="dialog"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it('opens the custom datetime picker, lets users pick a slot, and emits the shared open contract', async () => {
    const wrapper = mount(TDateTimePicker, {
      props: {
        modelValue: '2026-04-08T14:30',
        step: 900,
      },
      attrs: {
        'aria-label': 'Release window',
        name: 'releaseWindow',
      },
      slots: {
        prefix: '<span>prefix</span>',
        suffix: '<span>suffix</span>',
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Release window"]').trigger('click');
    await nextTick();

    expect(wrapper.classes()).toContain('t-date-time-picker');
    expect(wrapper.emitted('update:open')?.[0]).toEqual([true]);
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
    expect(wrapper.get('input[type="hidden"]').attributes('name')).toBe('releaseWindow');
    expect(wrapper.text()).toContain('prefix');
    expect(wrapper.text()).toContain('suffix');

    await wrapper.get('[data-date="2026-04-10"]').trigger('click');
    await wrapper.get('select[aria-label="Select hour"]').setValue('16');
    await wrapper.get('select[aria-label="Select minute"]').setValue('45');
    await wrapper.get('.t-date-time-picker__footer .t-button--solid').trigger('click');
    await nextTick();

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-04-10T16:45']);
    expect(wrapper.emitted('change')?.[0]).toEqual(['2026-04-10T16:45']);
    expect(wrapper.emitted('select')?.[0]).toEqual(['2026-04-10T16:45']);
    expect(wrapper.emitted('open-change')?.[1]).toEqual([false]);

    wrapper.unmount();
  });

  it('disables out-of-range days and times in the datetime picker surface', async () => {
    const wrapper = mount(TDateTimePicker, {
      props: {
        modelValue: '2026-04-08T14:30',
        min: '2026-04-08T14:30',
        max: '2026-04-08T16:00',
        step: 900,
      },
      attrs: {
        'aria-label': 'Window',
      },
      attachTo: document.body,
    });

    await wrapper.get('button[aria-label="Window"]').trigger('click');
    await nextTick();

    expect(wrapper.get('[data-date="2026-04-07"]').attributes('disabled')).toBeDefined();
    expect(
      wrapper
        .get('select[aria-label="Select hour"] option[value="13"]')
        .attributes('disabled'),
    ).toBeDefined();
    expect(
      wrapper
        .get('select[aria-label="Select hour"] option[value="15"]')
        .attributes('disabled'),
    ).toBeUndefined();

    wrapper.unmount();
  });

  it('opens the modal from a trigger slot and closes on escape', async () => {
    const wrapper = mount(TModal, {
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
    const wrapper = mount(TModal, {
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
      document.body.querySelector('.t-modal__backdrop') as HTMLDivElement | null
    )?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });

  it('opens the drawer from a trigger slot and closes on escape', async () => {
    const wrapper = mount(TDrawer, {
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

    const surface = document.body.querySelector('.t-drawer__surface');
    expect(surface?.classList.contains('t-drawer__surface--right')).toBe(true);

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
    const wrapper = mount(TDrawer, {
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
      document.body.querySelector('.t-drawer__backdrop') as HTMLDivElement | null
    )?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await nextTick();
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });

  it('toggles checkbox and emits update:modelValue', async () => {
    const wrapper = mount(TCheckbox, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => value,
      },
      slots: {
        default: 'Accept terms',
      },
    });

    expect(wrapper.classes()).toContain('t-checkbox');
    expect(wrapper.classes()).not.toContain('is-checked');
    expect(wrapper.text()).toContain('Accept terms');

    await wrapper.get('input[type="checkbox"]').trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('renders checked state with correct aria', () => {
    const wrapper = mount(TCheckbox, {
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
    const wrapper = mount(TCheckbox, {
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
    const wrapper = mount(TCheckbox, {
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
    const wrapper = mount(TCheckbox, {
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
    const sm = mount(TCheckbox, { props: { size: 'sm' as const } });
    const lg = mount(TCheckbox, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('t-checkbox--sm');
    expect(lg.classes()).toContain('t-checkbox--lg');
  });

  it('selects a radio option and emits update:modelValue on the group', async () => {
    const wrapper = mount(TRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'test-group',
        'onUpdate:modelValue': (value: string) => value,
      },
      slots: {
        default: {
          components: { TRadio },
          template: `
            <TRadio value="a">Option A</TRadio>
            <TRadio value="b">Option B</TRadio>
          `,
        },
      },
    });

    expect(wrapper.find('.t-radio-group').exists()).toBe(true);
    expect(wrapper.find('.t-radio-group').attributes('role')).toBe('radiogroup');

    const radios = wrapper.findAll('input[type="radio"]');
    expect(radios).toHaveLength(2);
    expect(radios[0].attributes('name')).toBe('test-group');
    expect((radios[0].element as HTMLInputElement).checked).toBe(true);
    expect((radios[1].element as HTMLInputElement).checked).toBe(false);

    await radios[1].trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b']);
  });

  it('renders checked state with correct aria on radio', () => {
    const wrapper = mount(TRadioGroup, {
      props: {
        modelValue: 'yes',
        name: 'checked-test',
      },
      slots: {
        default: {
          components: { TRadio },
          template: `
            <TRadio value="yes">Yes</TRadio>
            <TRadio value="no">No</TRadio>
          `,
        },
      },
    });

    const labels = wrapper.findAll('.t-radio');
    expect(labels[0].classes()).toContain('is-checked');
    expect(labels[1].classes()).not.toContain('is-checked');

    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs[0].attributes('aria-checked')).toBe('true');
    expect(inputs[1].attributes('aria-checked')).toBe('false');
  });

  it('applies disabled state from group to radios', () => {
    const wrapper = mount(TRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'disabled-test',
        disabled: true,
      },
      slots: {
        default: {
          components: { TRadio },
          template: '<TRadio value="a">Option A</TRadio>',
        },
      },
    });

    expect(wrapper.find('.t-radio').classes()).toContain('is-disabled');
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });

  it('applies invalid state from group to radios', () => {
    const wrapper = mount(TRadioGroup, {
      props: {
        modelValue: 'a',
        name: 'invalid-test',
        invalid: true,
      },
      slots: {
        default: {
          components: { TRadio },
          template: '<TRadio value="a">Option A</TRadio>',
        },
      },
    });

    expect(wrapper.find('.t-radio').classes()).toContain('is-invalid');
    expect(wrapper.find('input').attributes('aria-invalid')).toBe('true');
  });

  it('renders radio sizes from group', () => {
    const sm = mount(TRadioGroup, {
      props: { modelValue: 'a', name: 'sm', size: 'sm' as const },
      slots: {
        default: {
          components: { TRadio },
          template: '<TRadio value="a">A</TRadio>',
        },
      },
    });
    const lg = mount(TRadioGroup, {
      props: { modelValue: 'a', name: 'lg', size: 'lg' as const },
      slots: {
        default: {
          components: { TRadio },
          template: '<TRadio value="a">A</TRadio>',
        },
      },
    });

    expect(sm.find('.t-radio').classes()).toContain('t-radio--sm');
    expect(lg.find('.t-radio').classes()).toContain('t-radio--lg');
  });

  it('toggles switch and emits update:modelValue', async () => {
    const wrapper = mount(TSwitch, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (value: boolean) => value,
      },
      slots: {
        default: 'Enable notifications',
      },
    });

    expect(wrapper.classes()).toContain('t-switch');
    expect(wrapper.classes()).not.toContain('is-checked');
    expect(wrapper.text()).toContain('Enable notifications');

    await wrapper.get('input[type="checkbox"]').trigger('change');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true]);
  });

  it('renders checked switch with role and aria', () => {
    const wrapper = mount(TSwitch, {
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
    const wrapper = mount(TSwitch, {
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
    const wrapper = mount(TSwitch, {
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
    const sm = mount(TSwitch, { props: { size: 'sm' as const } });
    const lg = mount(TSwitch, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('t-switch--sm');
    expect(lg.classes()).toContain('t-switch--lg');
  });

  // ── Combobox ───────────────────────────────────────────

  it('filters combobox options and emits model updates on selection', async () => {
    const wrapper = mount(TCombobox, {
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
    const wrapper = mount(TCombobox, {
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

    let options = wrapper.findAll('.t-combobox__option');
    expect(options[0].classes()).toContain('is-active');
    expect(input.attributes('aria-activedescendant')).toContain('apple');

    await input.trigger('keydown', { key: 'ArrowDown' });
    await nextTick();

    options = wrapper.findAll('.t-combobox__option');
    expect(options[1].classes()).toContain('is-active');
    expect(options[2].classes()).not.toContain('is-active');

    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['banana']);
  });

  it('renders the combobox empty state when nothing matches', async () => {
    const wrapper = mount(TCombobox, {
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

    expect(wrapper.find('.t-combobox__empty').text()).toContain('Nothing found here.');
  });

  it('clears the combobox selection when the input is emptied and closed', async () => {
    const wrapper = mount(TCombobox, {
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
    const wrapper = mount(TCombobox, {
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

  // ── ConfirmDialog ──────────────────────────────────────

  it('opens confirm dialog from trigger and emits confirm', async () => {
    const wrapper = mount(TConfirmDialog, {
      attachTo: document.body,
      props: {
        title: 'Delete component',
        description: 'This action cannot be undone.',
      },
      slots: {
        trigger: '<button type="button">Open confirm</button>',
        default: '<p>Delete the current component from the registry.</p>',
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();

    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();

    const buttons = Array.from(document.body.querySelectorAll('button'));
    const confirmButton = buttons.find((button) => button.textContent?.includes('Confirm')) as HTMLButtonElement | undefined;

    expect(confirmButton).toBeDefined();

    confirmButton?.click();
    await nextTick();

    expect(wrapper.emitted('confirm')).toHaveLength(1);
    expect(wrapper.emitted('update:open')?.at(-1)).toEqual([false]);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });

  it('emits cancel and keeps overlay clicks disabled by default', async () => {
    const wrapper = mount(TConfirmDialog, {
      attachTo: document.body,
      props: {
        title: 'Archive release',
      },
      slots: {
        trigger: '<button type="button">Archive</button>',
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();

    const backdrop = document.body.querySelector('.t-modal__backdrop') as HTMLDivElement | null;
    backdrop?.click();
    await nextTick();

    expect(document.body.querySelector('[role="dialog"]')).not.toBeNull();

    const buttons = Array.from(document.body.querySelectorAll('button'));
    const cancelButton = buttons.find((button) => button.textContent?.includes('Cancel')) as HTMLButtonElement | undefined;

    cancelButton?.click();
    await nextTick();

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(document.body.querySelector('[role="dialog"]')).toBeNull();

    wrapper.unmount();
  });

  it('applies confirm dialog defaults and loading state', () => {
    const wrapper = mount(TConfirmDialog, {
      attachTo: document.body,
      props: {
        defaultOpen: true,
        title: 'Delete release',
        loading: true,
        confirmLabel: 'Delete now',
        showCloseButton: true,
      },
      slots: {
        icon: '<span class="confirm-icon">!</span>',
      },
    });

    expect(wrapper.findComponent(TModal).props('closeOnOverlay')).toBe(false);
    expect(wrapper.findComponent(TModal).props('showCloseButton')).toBe(true);
    expect(document.body.querySelector('.t-confirm-dialog__icon')).not.toBeNull();

    const buttons = wrapper.findAllComponents(TButton);
    expect(buttons[1].props('loading')).toBe(true);
    expect(buttons[1].text()).toContain('Delete now');
    expect(buttons[1].props('variant')).toBe('danger');
  });

  it('applies combobox states and sizes', () => {
    const invalid = mount(TCombobox, {
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

    const disabled = mount(TCombobox, {
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

    const loading = mount(TCombobox, {
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

    const sm = mount(TCombobox, {
      props: { modelValue: '', options: [], size: 'sm' as const },
      attrs: { 'aria-label': 'Small combobox' },
    });
    const lg = mount(TCombobox, {
      props: { modelValue: '', options: [], size: 'lg' as const },
      attrs: { 'aria-label': 'Large combobox' },
    });

    expect(sm.classes()).toContain('t-combobox--sm');
    expect(lg.classes()).toContain('t-combobox--lg');
  });

  // ── Select ──────────────────────────────────────────────

  it('renders select with options and emits update:modelValue on click', async () => {
    const wrapper = mount(TSelect, {
      props: {
        modelValue: '',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
        'onUpdate:modelValue': (v: string | number) => v,
      },
      attrs: {
        'aria-label': 'Fruit',
      },
    });

    expect(wrapper.classes()).toContain('t-select');
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
    const wrapper = mount(TSelect, {
      props: {
        modelValue: '',
        options: [{ label: 'Apple', value: 'apple' }],
        placeholder: 'Choose fruit',
      },
    });

    expect(wrapper.get('.t-select__value').text()).toBe('Choose fruit');
    expect(wrapper.get('.t-select__value').attributes('data-placeholder')).toBeDefined();
  });

  it('supports numeric select values without treating zero as placeholder', () => {
    const wrapper = mount(TSelect, {
      props: {
        modelValue: 0,
        options: [
          { label: 'January', value: 0 },
          { label: 'February', value: 1 },
        ],
      },
    });

    expect(wrapper.get('.t-select__value').text()).toBe('January');
    expect(wrapper.get('.t-select__value').attributes('data-placeholder')).toBeUndefined();
  });

  it('renders selected label in trigger', () => {
    const wrapper = mount(TSelect, {
      props: {
        modelValue: 'apple',
        options: [
          { label: 'Apple', value: 'apple' },
          { label: 'Banana', value: 'banana' },
        ],
      },
    });

    expect(wrapper.get('.t-select__value').text()).toBe('Apple');
    expect(wrapper.get('.t-select__value').attributes('data-placeholder')).toBeUndefined();
  });

  it('applies disabled state to select', () => {
    const wrapper = mount(TSelect, {
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
    const wrapper = mount(TSelect, {
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
    const wrapper = mount(TSelect, {
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
    const sm = mount(TSelect, {
      props: { modelValue: '', options: [], size: 'sm' as const },
    });
    const lg = mount(TSelect, {
      props: { modelValue: '', options: [], size: 'lg' as const },
    });

    expect(sm.classes()).toContain('t-select--sm');
    expect(lg.classes()).toContain('t-select--lg');
  });

  it('renders disabled options in select', async () => {
    const wrapper = mount(TSelect, {
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

  it('flips the select listbox above the trigger when it overflows below', async () => {
    // Trigger near the viewport bottom; rendered listbox overflows past it.
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const rect = { x: 0, y: 0, left: 0, right: 200, width: 200, height: 0, top: 0, bottom: 0, toJSON: () => ({}) };
        if (this.getAttribute('role') === 'listbox') {
          return { ...rect, top: 746, bottom: 946, height: 200 } as DOMRect;
        }
        if (this.tagName === 'BUTTON') {
          return { ...rect, top: 700, bottom: 738, height: 38 } as DOMRect;
        }
        return rect as DOMRect;
      });

    const wrapper = mount(TSelect, {
      props: {
        modelValue: '',
        options: [{ label: 'Apple', value: 'apple' }],
      },
    });

    expect(wrapper.classes()).not.toContain('t-select--drop-up');
    await wrapper.get('button').trigger('click');
    await nextTick();
    expect(wrapper.classes()).toContain('t-select--drop-up');

    rectSpy.mockRestore();
  });

  it('keeps the select listbox below the trigger when it fits', async () => {
    // Trigger near the viewport top; rendered listbox fits within it.
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function (this: HTMLElement) {
        const rect = { x: 0, y: 0, left: 0, right: 200, width: 200, height: 0, top: 0, bottom: 0, toJSON: () => ({}) };
        if (this.getAttribute('role') === 'listbox') {
          return { ...rect, top: 66, bottom: 266, height: 200 } as DOMRect;
        }
        if (this.tagName === 'BUTTON') {
          return { ...rect, top: 20, bottom: 58, height: 38 } as DOMRect;
        }
        return rect as DOMRect;
      });

    const wrapper = mount(TSelect, {
      props: {
        modelValue: '',
        options: [{ label: 'Apple', value: 'apple' }],
      },
    });

    await wrapper.get('button').trigger('click');
    await nextTick();
    expect(wrapper.classes()).not.toContain('t-select--drop-up');

    rectSpy.mockRestore();
  });

  it('shows check icon for selected option', async () => {
    const wrapper = mount(TSelect, {
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
    expect(options[0].find('.t-select__check').exists()).toBe(true);
    expect(options[1].find('.t-select__check').exists()).toBe(false);
  });

  it('emits numeric values from select options without string coercion', async () => {
    const wrapper = mount(TSelect, {
      props: {
        modelValue: 0,
        options: [
          { label: '2025', value: 2025 },
          { label: '2026', value: 2026 },
        ],
      },
      attrs: {
        'aria-label': 'Year',
      },
    });

    await wrapper.get('button').trigger('click');
    await wrapper.findAll('[role="option"]')[1].trigger('click');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2026]);
  });

  it('renders form field with label and hint', () => {
    const wrapper = mount(TFormField, {
      props: {
        label: 'Email',
        hint: 'Enter your email address',
        htmlFor: 'email-input',
      },
      slots: {
        default: '<input id="email-input" type="email" />',
      },
    });

    expect(wrapper.classes()).toContain('t-form-field');
    expect(wrapper.find('.t-form-field__label').text()).toBe('Email');
    expect(wrapper.find('.t-form-field__hint').text()).toBe('Enter your email address');
    expect(wrapper.find('label').attributes('for')).toBe('email-input');
  });

  it('renders form field with error and role alert', () => {
    const wrapper = mount(TFormField, {
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
    expect(wrapper.find('.t-form-field__error').text()).toBe('Username is required');
    expect(wrapper.find('.t-form-field__error').attributes('role')).toBe('alert');
    expect(wrapper.find('.t-form-field__hint').exists()).toBe(false);
  });

  it('renders required indicator on form field', () => {
    const wrapper = mount(TFormField, {
      props: {
        label: 'Name',
        required: true,
      },
      slots: {
        default: '<input type="text" />',
      },
    });

    expect(wrapper.classes()).toContain('is-required');
    const required = wrapper.find('.t-form-field__required');
    expect(required.exists()).toBe(true);
    expect(required.text()).toBe('*');
    expect(required.attributes('aria-hidden')).toBe('true');
  });

  it('applies disabled state to form field', () => {
    const wrapper = mount(TFormField, {
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
    const sm = mount(TFormField, {
      props: { label: 'SM', size: 'sm' as const },
      slots: { default: '<input />' },
    });
    const lg = mount(TFormField, {
      props: { label: 'LG', size: 'lg' as const },
      slots: { default: '<input />' },
    });

    expect(sm.classes()).toContain('t-form-field--sm');
    expect(lg.classes()).toContain('t-form-field--lg');
  });

  it('renders progress bar with determinate value', () => {
    const wrapper = mount(TProgress, {
      props: { value: 60, label: 'Upload progress' },
    });

    expect(wrapper.classes()).toContain('t-progress');
    expect(wrapper.classes()).toContain('t-progress--md');
    expect(wrapper.attributes('role')).toBe('progressbar');
    expect(wrapper.attributes('aria-valuenow')).toBe('60');
    expect(wrapper.attributes('aria-valuemin')).toBe('0');
    expect(wrapper.attributes('aria-valuemax')).toBe('100');
    expect(wrapper.attributes('aria-label')).toBe('Upload progress');
    expect(wrapper.find('.t-progress__fill').exists()).toBe(true);
  });

  it('renders progress bar as indeterminate when no value', () => {
    const wrapper = mount(TProgress, {
      props: { label: 'Loading' },
    });

    expect(wrapper.classes()).toContain('t-progress--indeterminate');
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined();
  });

  it('renders progress sizes', () => {
    const sm = mount(TProgress, {
      props: { value: 30, size: 'sm' as const },
    });
    const lg = mount(TProgress, {
      props: { value: 30, size: 'lg' as const },
    });

    expect(sm.classes()).toContain('t-progress--sm');
    expect(lg.classes()).toContain('t-progress--lg');
  });

  it('clamps progress value between 0 and 100', () => {
    const over = mount(TProgress, {
      props: { value: 150 },
    });
    expect(over.attributes('aria-valuenow')).toBe('100');

    const under = mount(TProgress, {
      props: { value: -10 },
    });
    expect(under.attributes('aria-valuenow')).toBe('0');
  });

  it('renders alert with role and variant class', () => {
    const wrapper = mount(TAlert, {
      props: {
        variant: 'danger',
      },
      slots: {
        default: 'Something went wrong!',
      },
    });

    expect(wrapper.attributes('role')).toBe('alert');
    expect(wrapper.classes()).toContain('t-alert');
    expect(wrapper.classes()).toContain('t-alert--danger');
    expect(wrapper.text()).toContain('Something went wrong!');
  });

  it('renders alert sizes', () => {
    const sm = mount(TAlert, {
      props: { size: 'sm' as const },
      slots: { default: 'Small' },
    });
    const lg = mount(TAlert, {
      props: { size: 'lg' as const },
      slots: { default: 'Large' },
    });

    expect(sm.classes()).toContain('t-alert--sm');
    expect(lg.classes()).toContain('t-alert--lg');
  });

  it('renders alert icon slot with aria-hidden', () => {
    const wrapper = mount(TAlert, {
      slots: {
        default: 'Info message',
        icon: '<svg data-testid="icon"></svg>',
      },
    });

    const iconSlot = wrapper.find('.t-alert__icon');
    expect(iconSlot.exists()).toBe(true);
    expect(iconSlot.attributes('aria-hidden')).toBe('true');
  });

  it('shows dismiss button and emits dismiss event', async () => {
    const wrapper = mount(TAlert, {
      props: {
        dismissible: true,
      },
      slots: {
        default: 'Closable alert',
      },
    });

    const dismissBtn = wrapper.find('.t-alert__dismiss');
    expect(dismissBtn.exists()).toBe(true);
    expect(dismissBtn.attributes('aria-label')).toBe('Dismiss');

    await dismissBtn.trigger('click');
    expect(wrapper.emitted('dismiss')).toHaveLength(1);
  });

  it('does not show dismiss button when not dismissible', () => {
    const wrapper = mount(TAlert, {
      slots: {
        default: 'Not closable',
      },
    });

    expect(wrapper.find('.t-alert__dismiss').exists()).toBe(false);
  });

  it('renders skeleton with default text variant', () => {
    const wrapper = mount(TSkeleton);
    expect(wrapper.classes()).toContain('t-skeleton');
    expect(wrapper.classes()).toContain('t-skeleton--pulse');
    expect(wrapper.attributes('aria-hidden')).toBe('true');
  });

  it('renders skeleton with custom dimensions', () => {
    const wrapper = mount(TSkeleton, {
      props: { width: '100%', height: '8rem' },
    });
    expect(wrapper.element.style.height).toBe('8rem');
  });

  it('renders skeleton wave animation', () => {
    const wrapper = mount(TSkeleton, {
      props: { animation: 'wave' },
    });
    expect(wrapper.classes()).toContain('t-skeleton--wave');
    expect(wrapper.classes()).not.toContain('t-skeleton--pulse');
  });

  it('renders skeleton without animation', () => {
    const wrapper = mount(TSkeleton, {
      props: { animation: 'none' },
    });
    expect(wrapper.classes()).not.toContain('t-skeleton--pulse');
    expect(wrapper.classes()).not.toContain('t-skeleton--wave');
  });

  it('renders skeleton with slot content', () => {
    const wrapper = mount(TSkeleton, {
      slots: { default: '<span>Loading content</span>' },
    });
    expect(wrapper.text()).toContain('Loading content');
  });

  it('renders toast notifications via useToast composable', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TToastProvider, {
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

    const toastEl = document.querySelector('.t-toast');
    expect(toastEl).not.toBeNull();
    expect(toastEl?.classList.contains('t-toast--success')).toBe(true);
    expect(toastEl?.getAttribute('role')).toBe('status');
    expect(toastEl?.textContent).toContain('Changes saved');
    expect(toastEl?.textContent).toContain('Your settings have been updated.');

    toast.clear();
    await nextTick();
    expect(document.querySelector('.t-toast')).toBeNull();

    wrapper.unmount();
  });

  it('renders default slot content while teleporting toasts to body', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TToastProvider, {
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

    const toastContainer = document.querySelector('.t-toast-provider');
    expect(toastContainer).not.toBeNull();
    expect(toastContainer?.parentElement).toBe(document.body);

    toast.clear();
    wrapper.unmount();
  });

  it('removes a single toast by id and respects closable', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TToastProvider, {
      attachTo: document.body,
    });

    const id = toast.add({
      title: 'Removable',
      variant: 'info',
      duration: 0,
      closable: true,
    });

    await nextTick();

    const closeBtn = document.querySelector('.t-toast__close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn?.getAttribute('aria-label')).toBe('Dismiss notification');

    toast.remove(id);
    await nextTick();

    expect(document.querySelector('.t-toast')).toBeNull();

    wrapper.unmount();
  });

  it('renders toast with all four variants', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TToastProvider, {
      attachTo: document.body,
    });

    toast.add({ title: 'Info', variant: 'info', duration: 0 });
    toast.add({ title: 'Success', variant: 'success', duration: 0 });
    toast.add({ title: 'Warning', variant: 'warning', duration: 0 });
    toast.add({ title: 'Danger', variant: 'danger', duration: 0 });

    await nextTick();

    const toasts = document.querySelectorAll('.t-toast');
    expect(toasts).toHaveLength(4);
    expect(toasts[0]?.classList.contains('t-toast--info')).toBe(true);
    expect(toasts[1]?.classList.contains('t-toast--success')).toBe(true);
    expect(toasts[2]?.classList.contains('t-toast--warning')).toBe(true);
    expect(toasts[3]?.classList.contains('t-toast--danger')).toBe(true);

    toast.clear();
    wrapper.unmount();
  });

  it('limits visible toasts to max prop', async () => {
    const toast = useToast();
    toast.clear();

    const wrapper = mount(TToastProvider, {
      attachTo: document.body,
      props: { max: 2 },
    });

    toast.add({ title: 'First', variant: 'info', duration: 0 });
    toast.add({ title: 'Second', variant: 'info', duration: 0 });
    toast.add({ title: 'Third', variant: 'info', duration: 0 });

    await nextTick();

    const toasts = document.querySelectorAll('.t-toast');
    expect(toasts).toHaveLength(2);
    expect(toasts[0]?.textContent).toContain('Second');
    expect(toasts[1]?.textContent).toContain('Third');

    toast.clear();
    wrapper.unmount();
  });

  it('renders breadcrumb with nav and aria-label', () => {
    const wrapper = mount(TBreadcrumb, {
      slots: {
        default: '<li>Home</li>',
      },
    });

    expect(wrapper.element.tagName).toBe('NAV');
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb');
    expect(wrapper.classes()).toContain('t-breadcrumb');
    expect(wrapper.find('ol.t-breadcrumb__list').exists()).toBe(true);
  });

  it('renders breadcrumb items with links and current page', () => {
    const wrapper = mount(TBreadcrumb, {
      slots: {
        default: [
          `<li class="t-breadcrumb__item"><a href="/" class="t-breadcrumb__link">Home</a></li>`,
          `<li class="t-breadcrumb__item"><span class="t-breadcrumb__current" aria-current="page">Current</span></li>`,
        ],
      },
    });

    const link = wrapper.find('.t-breadcrumb__link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/');

    const current = wrapper.find('.t-breadcrumb__current');
    expect(current.exists()).toBe(true);
    expect(current.attributes('aria-current')).toBe('page');
  });

  it('renders breadcrumb item as link when href is provided', () => {
    const wrapper = mount(TBreadcrumbItem, {
      props: { href: '/products' },
      slots: { default: 'Products' },
    });

    const link = wrapper.find('a.t-breadcrumb__link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/products');
    expect(link.text()).toBe('Products');
    expect(wrapper.find('[aria-current]').exists()).toBe(false);
  });

  it('renders breadcrumb item from string to prop when router is not installed', () => {
    const wrapper = mount(TBreadcrumbItem, {
      props: { to: '/products' },
      slots: { default: 'Products' },
    });

    const link = wrapper.find('a.t-breadcrumb__link');
    expect(link.exists()).toBe(true);
    expect(link.attributes('href')).toBe('/products');
  });

  it('renders breadcrumb item with RouterLink when to prop is used and router is available', () => {
    const wrapper = mount(TBreadcrumbItem, {
      props: {
        to: { name: 'products' },
      },
      slots: {
        default: 'Products',
      },
      global: {
        components: {
          RouterLink: {
            props: ['to'],
            template: '<a class="router-link-stub"><slot /></a>',
          },
        },
      },
    });

    expect(wrapper.find('.router-link-stub.t-breadcrumb__link').exists()).toBe(true);
    expect(wrapper.find('[aria-current]').exists()).toBe(false);
  });

  it('renders breadcrumb item as current when no href', () => {
    const wrapper = mount(TBreadcrumbItem, {
      slots: { default: 'Current Page' },
    });

    expect(wrapper.find('a').exists()).toBe(false);
    const current = wrapper.find('span.t-breadcrumb__current');
    expect(current.exists()).toBe(true);
    expect(current.attributes('aria-current')).toBe('page');
    expect(current.text()).toBe('Current Page');
  });

  it('applies custom separator via CSS variable', () => {
    const wrapper = mount(TBreadcrumb, {
      props: { separator: '›' },
      slots: { default: '<li>Home</li>' },
    });

    const ol = wrapper.find('ol.t-breadcrumb__list');
    expect(ol.attributes('style')).toContain("--tree-breadcrumb-separator: '›'");
  });

  // ── Accordion ─────────────────────────────────────────────

  function mountAccordion(props: Record<string, unknown> = {}) {
    return mount(TAccordion, {
      attachTo: document.body,
      props: {
        type: 'single' as const,
        collapsible: true,
        ...props,
      },
      slots: {
        default: {
          components: { TAccordionItem },
          template: `
            <TAccordionItem value="item-1">
              <template #trigger>First</template>
              Content 1
            </TAccordionItem>
            <TAccordionItem value="item-2">
              <template #trigger>Second</template>
              Content 2
            </TAccordionItem>
            <TAccordionItem value="item-3" disabled>
              <template #trigger>Third (disabled)</template>
              Content 3
            </TAccordionItem>
          `,
        },
      },
    });
  }

  it('renders accordion with items and aria attributes', () => {
    const wrapper = mountAccordion();

    const triggers = wrapper.findAll('.t-accordion__trigger');
    expect(triggers).toHaveLength(3);
    expect(triggers[0].attributes('aria-expanded')).toBe('false');
    expect(triggers[0].text()).toContain('First');
  });

  it('opens an item on click and sets aria-expanded', async () => {
    const wrapper = mountAccordion();

    const trigger = wrapper.findAll('.t-accordion__trigger')[0];
    await trigger.trigger('click');

    expect(trigger.attributes('aria-expanded')).toBe('true');
    expect(wrapper.find('.t-accordion__content').exists()).toBe(true);
    expect(wrapper.find('.t-accordion__panel').text()).toContain('Content 1');
  });

  it('single mode closes previous item when opening another', async () => {
    const wrapper = mountAccordion();

    const triggers = wrapper.findAll('.t-accordion__trigger');
    await triggers[0].trigger('click');
    expect(triggers[0].attributes('aria-expanded')).toBe('true');

    await triggers[1].trigger('click');
    expect(triggers[0].attributes('aria-expanded')).toBe('false');
    expect(triggers[1].attributes('aria-expanded')).toBe('true');
  });

  it('collapsible single mode allows closing open item', async () => {
    const wrapper = mountAccordion({ collapsible: true });

    const trigger = wrapper.findAll('.t-accordion__trigger')[0];
    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('true');

    await trigger.trigger('click');
    expect(trigger.attributes('aria-expanded')).toBe('false');
  });

  it('disabled item cannot be toggled', async () => {
    const wrapper = mountAccordion();

    const disabledTrigger = wrapper.findAll('.t-accordion__trigger')[2];
    await disabledTrigger.trigger('click');

    expect(disabledTrigger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.findAll('.t-accordion__item')[2].classes()).toContain('is-disabled');
  });

  it('multiple mode allows several items open at once', async () => {
    const wrapper = mount(TAccordion, {
      attachTo: document.body,
      props: { type: 'multiple' as const },
      slots: {
        default: {
          components: { TAccordionItem },
          template: `
            <TAccordionItem value="a">
              <template #trigger>A</template>
              Content A
            </TAccordionItem>
            <TAccordionItem value="b">
              <template #trigger>B</template>
              Content B
            </TAccordionItem>
          `,
        },
      },
    });

    const triggers = wrapper.findAll('.t-accordion__trigger');
    await triggers[0].trigger('click');
    await triggers[1].trigger('click');

    expect(triggers[0].attributes('aria-expanded')).toBe('true');
    expect(triggers[1].attributes('aria-expanded')).toBe('true');
  });

  it('panel has region role and aria-labelledby linking to trigger', async () => {
    const wrapper = mountAccordion();

    await wrapper.findAll('.t-accordion__trigger')[0].trigger('click');

    const panel = wrapper.find('.t-accordion__content');
    expect(panel.attributes('role')).toBe('region');

    const triggerId = wrapper.findAll('.t-accordion__trigger')[0].attributes('id');
    expect(panel.attributes('aria-labelledby')).toBe(triggerId);
  });

  it('emits update:modelValue when item is toggled', async () => {
    const wrapper = mountAccordion();

    await wrapper.findAll('.t-accordion__trigger')[0].trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['item-1']);
  });

  /* ── TPagination ───────── */

  it('renders pagination with correct number of page buttons', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 3, modelValue: 1 },
    });
    expect(wrapper.find('.t-pagination').exists()).toBe(true);
    expect(wrapper.find('nav').attributes('aria-label')).toBe('Pagination');
    const buttons = wrapper.findAll('.t-pagination__button').filter(b => !b.classes().includes('t-pagination__button--prev') && !b.classes().includes('t-pagination__button--next'));
    expect(buttons.length).toBe(3);
  });

  it('marks the active page with aria-current', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 5, modelValue: 3 },
    });
    const activeBtn = wrapper.find('[aria-current="page"]');
    expect(activeBtn.exists()).toBe(true);
    expect(activeBtn.text()).toBe('3');
    expect(activeBtn.classes()).toContain('is-active');
  });

  it('emits update:modelValue when a page button is clicked', async () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 3, modelValue: 1 },
    });
    const pageButtons = wrapper.findAll('.t-pagination__button').filter(b => !b.classes().includes('t-pagination__button--prev') && !b.classes().includes('t-pagination__button--next'));
    await pageButtons[1]!.trigger('click');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  });

  it('disables previous button on first page', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 5, modelValue: 1 },
    });
    const prevBtn = wrapper.find('.t-pagination__button--prev');
    expect((prevBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('disables next button on last page', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 5, modelValue: 5 },
    });
    const nextBtn = wrapper.find('.t-pagination__button--next');
    expect((nextBtn.element as HTMLButtonElement).disabled).toBe(true);
  });

  it('applies size classes', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 5, modelValue: 1, size: 'lg' },
    });
    expect(wrapper.find('.t-pagination').classes()).toContain('t-pagination--lg');
  });

  it('renders ellipsis for many pages', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 20, modelValue: 10, siblings: 1 },
    });
    const ellipses = wrapper.findAll('.t-pagination__ellipsis');
    expect(ellipses.length).toBe(2);
  });

  it('disables all buttons when disabled prop is set', () => {
    const wrapper = mount(TPagination, {
      props: { totalPages: 5, modelValue: 3, disabled: true },
    });
    expect(wrapper.find('.t-pagination').classes()).toContain('is-disabled');
    const buttons = wrapper.findAll('button');
    buttons.forEach(btn => {
      expect((btn.element as HTMLButtonElement).disabled).toBe(true);
    });
  });

  // ── Dropdown ──────────────────────────────────────────────

  it('renders dropdown with items and emits select on click', async () => {
    const wrapper = mount(TDropdown, {
      props: {
        label: 'Actions',
        items: [
          { label: 'Edit', value: 'edit' },
          { label: 'Delete', value: 'delete' },
        ],
      },
    });

    expect(wrapper.classes()).toContain('t-dropdown');
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
    const sm = mount(TDropdown, {
      props: { size: 'sm' as const, label: 'SM', items: [] },
    });
    const lg = mount(TDropdown, {
      props: { size: 'lg' as const, label: 'LG', items: [] },
    });

    expect(sm.classes()).toContain('t-dropdown--sm');
    expect(lg.classes()).toContain('t-dropdown--lg');
  });

  it('aligns the dropdown menu to the end when requested', () => {
    const start = mount(TDropdown, {
      props: { label: 'Actions', items: [] },
    });
    const end = mount(TDropdown, {
      props: { align: 'end' as const, label: 'Actions', items: [] },
    });

    expect(start.classes()).not.toContain('t-dropdown--align-end');
    expect(end.classes()).toContain('t-dropdown--align-end');
  });

  it('applies disabled state to dropdown', () => {
    const wrapper = mount(TDropdown, {
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
    const wrapper = mount(TDropdown, {
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
    const wrapper = mount(TDropdown, {
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
    const wrapper = mount(TDropdown, {
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
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <TTabs v-bind="$attrs">
        <TTabList>
          <TTab value="a">Tab A</TTab>
          <TTab value="b">Tab B</TTab>
          <TTab value="c" :disabled="disabledC">Tab C</TTab>
        </TTabList>
        <TTabPanel value="a">Panel A</TTabPanel>
        <TTabPanel value="b">Panel B</TTabPanel>
        <TTabPanel value="c">Panel C</TTabPanel>
      </TTabs>
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
      components: { TTabs, TTabList, TTab, TTabPanel },
      template: `
        <TTabs :model-value="active" @update:model-value="active = $event">
          <TTabList>
            <TTab value="x">X</TTab>
            <TTab value="y">Y</TTab>
          </TTabList>
          <TTabPanel value="x">Content X</TTabPanel>
          <TTabPanel value="y">Content Y</TTabPanel>
        </TTabs>
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
    expect(line.find('.t-tabs--sm').exists()).toBe(true);
  });

  it('opens the popover on click and closes on escape', async () => {
    const wrapper = mount(TPopover, {
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
    const wrapper = mount(TPopover, {
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
    expect(content.classes()).toContain('t-popover__content--right');
    expect(content.classes()).toContain('t-popover__content--align-start');

    wrapper.unmount();
  });

  it('does not open the popover when disabled', async () => {
    const wrapper = mount(TPopover, {
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
    const wrapper = mount(TContextMenu, {
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

    expect(wrapper.classes()).toContain('t-context-menu');

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
    const sm = mount(TContextMenu, {
      props: { size: 'sm' as const, items: [] },
      slots: { default: '<div>Area</div>' },
    });
    const lg = mount(TContextMenu, {
      props: { size: 'lg' as const, items: [] },
      slots: { default: '<div>Area</div>' },
    });

    expect(sm.classes()).toContain('t-context-menu--sm');
    expect(lg.classes()).toContain('t-context-menu--lg');

    sm.unmount();
    lg.unmount();
  });

  it('does not open context menu when disabled', async () => {
    const wrapper = mount(TContextMenu, {
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
    const wrapper = mount(TContextMenu, {
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
    const wrapper = mount(TContextMenu, {
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
    const wrapper = mount(TAvatar, {
      props: { alt: 'Jane Doe', size: 'md' },
    });
    expect(wrapper.classes()).toContain('t-avatar');
    expect(wrapper.classes()).toContain('t-avatar--md');
    expect(wrapper.text()).toBe('JD');
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('Jane Doe');
  });

  it('renders avatar with explicit initials', () => {
    const wrapper = mount(TAvatar, {
      props: { alt: 'Jane Doe', initials: 'X' },
    });
    expect(wrapper.text()).toBe('X');
  });

  it('renders avatar with image', () => {
    const wrapper = mount(TAvatar, {
      props: { src: 'https://example.com/photo.jpg', alt: 'Jane' },
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('https://example.com/photo.jpg');
    expect(img.attributes('alt')).toBe('Jane');
  });

  it('renders avatar with status dot', () => {
    const wrapper = mount(TAvatar, {
      props: { alt: 'User', status: 'online' },
    });
    const dot = wrapper.find('.t-avatar__status');
    expect(dot.exists()).toBe(true);
    expect(dot.classes()).toContain('t-avatar__status--online');
  });

  // ── Divider ──

  it('renders horizontal divider by default', () => {
    const wrapper = mount(TDivider);
    expect(wrapper.classes()).toContain('t-divider');
    expect(wrapper.classes()).toContain('t-divider--horizontal');
    expect(wrapper.attributes('role')).toBe('none');
  });

  it('renders vertical divider with separator role', () => {
    const wrapper = mount(TDivider, {
      props: { orientation: 'vertical', decorative: false, label: 'Section' },
    });
    expect(wrapper.classes()).toContain('t-divider--vertical');
    expect(wrapper.attributes('role')).toBe('separator');
    expect(wrapper.attributes('aria-orientation')).toBe('vertical');
    expect(wrapper.attributes('aria-label')).toBe('Section');
  });

  // ── EmptyState ──

  it('renders empty state with title and description props', () => {
    const wrapper = mount(TEmptyState, {
      props: {
        title: 'No releases yet',
        description: 'Create your first release to start tracking milestones.',
      },
    });

    expect(wrapper.classes()).toContain('t-empty-state');
    expect(wrapper.find('.t-empty-state__title').text()).toBe('No releases yet');
    expect(wrapper.find('.t-empty-state__description').text()).toContain('Create your first release');
    expect(wrapper.attributes('aria-labelledby')).toBeDefined();
    expect(wrapper.attributes('aria-describedby')).toBeDefined();
  });

  it('renders icon, body, and actions slots in empty state', () => {
    const wrapper = mount(TEmptyState, {
      props: {
        title: 'No projects',
      },
      slots: {
        icon: '<span class="test-icon">icon</span>',
        default: '<p class="test-body">Invite teammates to get started.</p>',
        actions: '<button type="button" class="test-action">Invite</button>',
      },
    });

    expect(wrapper.find('.t-empty-state__icon').exists()).toBe(true);
    expect(wrapper.find('.t-empty-state__body').text()).toContain('Invite teammates');
    expect(wrapper.find('.t-empty-state__actions').text()).toContain('Invite');
  });

  it('supports polymorphic empty state root and size classes', () => {
    const sm = mount(TEmptyState, {
      props: {
        as: 'article',
        size: 'sm',
        title: 'Small empty state',
      },
    });
    const lg = mount(TEmptyState, {
      props: {
        size: 'lg',
        title: 'Large empty state',
      },
    });

    expect(sm.element.tagName).toBe('ARTICLE');
    expect(sm.classes()).toContain('t-empty-state--sm');
    expect(lg.classes()).toContain('t-empty-state--lg');
  });

  it('renders title and description slots when provided', () => {
    const wrapper = mount(TEmptyState, {
      slots: {
        title: '<span>Custom title</span>',
        description: '<span>Custom description</span>',
      },
    });

    expect(wrapper.find('.t-empty-state__title').text()).toBe('Custom title');
    expect(wrapper.find('.t-empty-state__description').text()).toBe('Custom description');
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

    const wrapper = mount(TTable, {
      props: { columns, rows },
    });

    expect(wrapper.find('.t-table').exists()).toBe(true);
    expect(wrapper.findAll('.t-table__header')).toHaveLength(2);
    expect(wrapper.findAll('.t-table__body .t-table__row')).toHaveLength(2);
    expect(wrapper.text()).toContain('Alice');
    expect(wrapper.text()).toContain('bob@example.com');
  });

  it('renders empty state when no rows', () => {
    const columns = [{ key: 'name', label: 'Name' }];
    const wrapper = mount(TTable, {
      props: { columns, rows: [] },
    });

    expect(wrapper.find('.t-table__cell--empty').exists()).toBe(true);
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

    const wrapper = mount(TTable, {
      props: { columns, rows },
    });

    const sortableHeader = wrapper.find('.t-table__header--sortable');
    await sortableHeader.trigger('click');

    const cells = wrapper.findAll('.t-table__body .t-table__row');
    expect(cells[0].text()).toContain('Alice');
    expect(cells[1].text()).toContain('Bob');
    expect(cells[2].text()).toContain('Charlie');

    expect(wrapper.emitted('sort')).toBeTruthy();
    expect(wrapper.emitted('sort')![0]).toEqual([{ key: 'name', direction: 'asc' }]);
  });

  it('sets aria-sort on sortable headers', async () => {
    const columns = [{ key: 'name', label: 'Name', sortable: true }];
    const rows = [{ name: 'A' }];

    const wrapper = mount(TTable, {
      props: { columns, rows },
    });

    const header = wrapper.find('.t-table__header--sortable');
    expect(header.attributes('aria-sort')).toBe('none');

    await header.trigger('click');
    expect(header.attributes('aria-sort')).toBe('ascending');

    await header.trigger('click');
    expect(header.attributes('aria-sort')).toBe('descending');
  });

  it('renders custom table cells through the keyed slot API', () => {
    const wrapper = mount({
      components: { TTable },
      data: () => ({
        columns: [{ key: 'status', label: 'Status' }],
        rows: [{ status: 'Ready' }],
      }),
      template: `
        <TTable :columns="columns" :rows="rows">
          <template #cell-status="{ value }">
            <strong class="custom-status">{{ value }}</strong>
          </template>
        </TTable>
      `,
    });

    expect(wrapper.find('.custom-status').exists()).toBe(true);
    expect(wrapper.find('.custom-status').text()).toBe('Ready');
  });

  // ── Tag ──

  it('renders tag with variant and size classes', () => {
    const wrapper = mount(TTag, {
      props: { variant: 'solid', size: 'sm' },
      slots: { default: 'Vue' },
    });
    expect(wrapper.classes()).toContain('t-tag');
    expect(wrapper.classes()).toContain('t-tag--solid');
    expect(wrapper.classes()).toContain('t-tag--sm');
    expect(wrapper.text()).toContain('Vue');
  });

  it('shows remove button and emits remove event', async () => {
    const wrapper = mount(TTag, {
      props: { removable: true },
      slots: { default: 'React' },
    });

    const removeBtn = wrapper.find('.t-tag__remove');
    expect(removeBtn.exists()).toBe(true);
    expect(removeBtn.attributes('aria-label')).toBe('Remove');

    await removeBtn.trigger('click');
    expect(wrapper.emitted('remove')).toHaveLength(1);
  });

  it('does not emit remove when disabled', async () => {
    const wrapper = mount(TTag, {
      props: { removable: true, disabled: true },
      slots: { default: 'Disabled' },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    await wrapper.find('.t-tag__remove').trigger('click');
    expect(wrapper.emitted('remove')).toBeUndefined();
  });

  // ── Timeline ──

  it('renders timeline items with metadata and timestamps', () => {
    const wrapper = mount(TTimeline, {
      props: {
        items: [
          {
            id: 'queued',
            meta: 'Queued',
            title: 'Release queued',
            description: 'Waiting for review.',
            timestamp: '09:12',
            datetime: '2026-04-07T09:12:00Z',
            tone: 'brand',
          },
          {
            id: 'approved',
            meta: 'Approved',
            title: 'Review approved',
            description: 'Ready to publish.',
            timestamp: '10:03',
            tone: 'success',
          },
        ],
      },
      attrs: {
        'aria-label': 'Release history',
      },
    });

    expect(wrapper.classes()).toContain('t-timeline');
    expect(wrapper.findAll('.t-timeline__item')).toHaveLength(2);
    expect(wrapper.text()).toContain('Release queued');
    expect(wrapper.text()).toContain('Approved');
    expect(wrapper.find('.t-timeline__marker--brand').exists()).toBe(true);
    expect(wrapper.find('.t-timeline__marker--success').exists()).toBe(true);
    expect(wrapper.get('time').attributes('datetime')).toBe('2026-04-07T09:12:00Z');
    expect(wrapper.attributes('aria-label')).toBe('Release history');
  });

  it('supports custom marker and item slots in timeline', () => {
    const wrapper = mount(TTimeline, {
      props: {
        items: [
          { id: 'item-1', title: 'Event one', tone: 'warning' },
        ],
      },
      slots: {
        marker: '<span class="custom-marker">!</span>',
        item: '<div class="custom-item">Custom timeline item</div>',
      },
    });

    expect(wrapper.find('.custom-marker').exists()).toBe(true);
    expect(wrapper.find('.custom-item').text()).toContain('Custom timeline item');
  });

  it('applies timeline size classes and omits connector on last item', () => {
    const sm = mount(TTimeline, {
      props: {
        size: 'sm',
        items: [{ title: 'Small item' }],
      },
    });
    const lg = mount(TTimeline, {
      props: {
        size: 'lg',
        items: [
          { title: 'First item' },
          { title: 'Second item' },
        ],
      },
    });

    expect(sm.classes()).toContain('t-timeline--sm');
    expect(sm.find('.t-timeline__line').exists()).toBe(false);
    expect(lg.classes()).toContain('t-timeline--lg');
    expect(lg.findAll('.t-timeline__line')).toHaveLength(1);
  });

  it('renders pricing card with title, price, and features', () => {
    const wrapper = mount(TPricingCard, {
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

    expect(wrapper.find('.t-pricing-card__title').text()).toBe('Pro');
    expect(wrapper.find('.t-pricing-card__amount').text()).toBe('29');
    expect(wrapper.find('.t-pricing-card__currency').text()).toBe('$');
    expect(wrapper.find('.t-pricing-card__period').text()).toBe('/month');
    expect(wrapper.findAll('.t-pricing-card__feature-item')).toHaveLength(2);
    expect(wrapper.find('.t-pricing-card__feature-item--excluded').exists()).toBe(true);
    expect(wrapper.find('.t-button').text()).toBe('Get started');
  });

  it('applies highlighted class and badge on pricing card', () => {
    const wrapper = mount(TPricingCard, {
      props: {
        title: 'Pro',
        price: 29,
        highlighted: true,
        badge: 'Most popular',
      },
    });

    expect(wrapper.classes()).toContain('t-pricing-card--highlighted');
    expect(wrapper.find('.t-pricing-card__badge').exists()).toBe(true);
    expect(wrapper.find('.t-badge').text()).toBe('Most popular');
  });

  it('emits select when pricing card button is clicked', async () => {
    const wrapper = mount(TPricingCard, {
      props: {
        title: 'Pro',
        price: 29,
        buttonText: 'Choose',
      },
    });

    await wrapper.find('.t-button').trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
  });

  it('renders pricing grid with multiple plans', () => {
    const wrapper = mount(TPricing, {
      props: {
        plans: [
          { title: 'Free', price: 0, buttonText: 'Start' },
          { title: 'Pro', price: 29, highlighted: true, buttonText: 'Choose' },
          { title: 'Enterprise', price: 99, buttonText: 'Contact' },
        ],
      },
    });

    expect(wrapper.findAll('.t-pricing-card')).toHaveLength(3);
    expect(wrapper.find('.t-pricing-card--highlighted').exists()).toBe(true);
  });

  it('emits select with plan data from pricing grid', async () => {
    const plans = [
      { title: 'Free', price: 0, buttonText: 'Start' },
      { title: 'Pro', price: 29, buttonText: 'Choose' },
    ];

    const wrapper = mount(TPricing, {
      props: { plans },
    });

    await wrapper.findAll('.t-button')[1].trigger('click');
    expect(wrapper.emitted('select')).toHaveLength(1);
    expect(wrapper.emitted('select')![0]).toEqual([plans[1], 1]);
  });

  /* ── MarkdownEditor ── */

  it('renders markdown editor with default classes', () => {
    const wrapper = mount(TMarkdownEditor);
    expect(wrapper.classes()).toContain('t-md-editor');
    expect(wrapper.classes()).toContain('t-md-editor--md');
  });

  it('emits update:modelValue on textarea input', async () => {
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: '' },
    });

    const textarea = wrapper.find('.t-md-editor__textarea');
    await textarea.setValue('# Hello');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['# Hello']);
  });

  it('renders markdown preview from modelValue', () => {
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: '# Title\n\nSome **bold** text' },
    });

    const preview = wrapper.find('.t-md-editor__preview');
    expect(preview.html()).toContain('<h1');
    expect(preview.html()).toContain('Title');
    expect(preview.html()).toContain('<strong>bold</strong>');
  });

  it('applies disabled state', () => {
    const wrapper = mount(TMarkdownEditor, {
      props: { disabled: true },
    });

    expect(wrapper.classes()).toContain('is-disabled');
    expect(wrapper.find('.t-md-editor__textarea').attributes('disabled')).toBeDefined();
  });

  it('applies size variants', () => {
    const sm = mount(TMarkdownEditor, { props: { size: 'sm' as const } });
    const lg = mount(TMarkdownEditor, { props: { size: 'lg' as const } });

    expect(sm.classes()).toContain('t-md-editor--sm');
    expect(lg.classes()).toContain('t-md-editor--lg');
  });

  it('renders headings at different levels in preview', () => {
    const md = '# H1\n## H2\n### H3';
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: md },
    });

    const preview = wrapper.find('.t-md-editor__preview');
    expect(preview.html()).toContain('<h1');
    expect(preview.html()).toContain('<h2');
    expect(preview.html()).toContain('<h3');
  });

  it('renders code blocks in preview', () => {
    const md = '```\nconst x = 1;\n```';
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: md },
    });

    const preview = wrapper.find('.t-md-editor__preview');
    expect(preview.html()).toContain('<pre');
    expect(preview.html()).toContain('const x = 1;');
  });

  it('renders blockquotes in preview', () => {
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: '> quoted text' },
    });

    const preview = wrapper.find('.t-md-editor__preview');
    expect(preview.html()).toContain('<blockquote');
    expect(preview.html()).toContain('quoted text');
  });

  it('renders lists in preview', () => {
    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: '- item 1\n- item 2' },
    });

    const preview = wrapper.find('.t-md-editor__preview');
    expect(preview.html()).toContain('<ul');
    expect(preview.html()).toContain('<li>');
  });

  it('has accessible toolbar buttons with titles', () => {
    const wrapper = mount(TMarkdownEditor);
    const buttons = wrapper.findAll('.t-md-editor__toolbar-btn');

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.attributes('title')).toBeTruthy();
    });
  });

  it('calls uploadImage and emits image-upload on paste', async () => {
    const uploadImage = vi.fn().mockResolvedValue('https://example.com/img.png');

    const wrapper = mount(TMarkdownEditor, {
      props: { modelValue: '', uploadImage },
    });

    const file = new File(['img'], 'test.png', { type: 'image/png' });
    const clipboardData = {
      items: [{ type: 'image/png', getAsFile: () => file }],
    };

    const textarea = wrapper.find('.t-md-editor__textarea');
    await textarea.trigger('paste', { clipboardData });

    // Wait for async upload
    await new Promise((r) => setTimeout(r, 50));

    expect(uploadImage).toHaveBeenCalledWith(file);
  });
});

describe('TIcon', () => {
  it('renders the registered icon by name with aria-hidden by default', () => {
    const wrapper = mount(TIcon, { props: { name: 'check' } });

    const svg = wrapper.find('svg');
    expect(svg.exists()).toBe(true);
    expect(svg.classes()).toContain('t-icon');
    expect(svg.attributes('aria-hidden')).toBe('true');
    expect(svg.attributes('role')).toBeUndefined();
  });

  it('marks the icon as an image with aria-label when label is provided', () => {
    const wrapper = mount(TIcon, { props: { name: 'alert-circle', label: 'Warning' } });

    const svg = wrapper.find('svg');
    expect(svg.attributes('role')).toBe('img');
    expect(svg.attributes('aria-label')).toBe('Warning');
    expect(svg.attributes('aria-hidden')).toBeUndefined();
  });

  it('forwards size to the underlying svg', () => {
    const wrapper = mount(TIcon, { props: { name: 'info', size: 32 } });

    const svg = wrapper.find('svg');
    expect(svg.attributes('width')).toBe('32');
    expect(svg.attributes('height')).toBe('32');
  });
});

describe('TSparkline', () => {
  it('renders a line path for line type', () => {
    const wrapper = mount(TSparkline, {
      props: { data: [1, 4, 2, 8, 5], type: 'line' },
    });

    const line = wrapper.find('.t-sparkline__line');
    expect(line.exists()).toBe(true);
    expect(line.attributes('d')).toBeTruthy();
    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('Trend sparkline');
  });

  it('renders one bar per value for bar type', () => {
    const wrapper = mount(TSparkline, {
      props: { data: [1, 4, 2], type: 'bar' },
    });

    expect(wrapper.findAll('.t-sparkline__bar')).toHaveLength(3);
    expect(wrapper.find('.t-sparkline__line').exists()).toBe(false);
  });

  it('renders an area path and honors a custom aria-label', () => {
    const wrapper = mount(TSparkline, {
      props: { data: [3, 1, 5], type: 'area', ariaLabel: 'Latency trend' },
    });

    expect(wrapper.find('.t-sparkline__area').exists()).toBe(true);
    expect(wrapper.attributes('aria-label')).toBe('Latency trend');
  });

  it('draws the last point marker only when requested', () => {
    const off = mount(TSparkline, { props: { data: [1, 2, 3] } });
    expect(off.find('.t-sparkline__point').exists()).toBe(false);

    const on = mount(TSparkline, { props: { data: [1, 2, 3], showLastPoint: true } });
    expect(on.find('.t-sparkline__point').exists()).toBe(true);
  });

  it('renders no marks for empty data', () => {
    const wrapper = mount(TSparkline, { props: { data: [] } });
    expect(wrapper.find('.t-sparkline__line').exists()).toBe(false);
    expect(wrapper.findAll('.t-sparkline__bar')).toHaveLength(0);
  });
});

describe('TChart', () => {
  const baseSeries = [
    { name: 'Revenue', data: [10, 20, 15, 30] },
    { name: 'Cost', data: [5, 8, 6, 12] },
  ];
  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];

  it('renders a line per series with a legend for multiple series', () => {
    const wrapper = mount(TChart, {
      props: { type: 'line', series: baseSeries, labels },
    });

    expect(wrapper.classes()).toContain('t-chart--line');
    expect(wrapper.findAll('.t-chart__line')).toHaveLength(2);
    expect(wrapper.findAll('.t-chart__legend-item')).toHaveLength(2);
  });

  it('hides the legend for a single series by default', () => {
    const wrapper = mount(TChart, {
      props: { series: [baseSeries[0]], labels },
    });

    expect(wrapper.find('.t-chart__legend').exists()).toBe(false);
  });

  it('renders grouped bars for bar type', () => {
    const wrapper = mount(TChart, {
      props: { type: 'bar', series: baseSeries, labels },
    });

    // 2 series * 4 categories.
    expect(wrapper.findAll('.t-chart__bar')).toHaveLength(8);
    expect(wrapper.find('.t-chart__line').exists()).toBe(false);
  });

  it('renders a filled area path for area type', () => {
    const wrapper = mount(TChart, {
      props: { type: 'area', series: [baseSeries[0]], labels },
    });

    const area = wrapper.find('.t-chart__area');
    expect(area.exists()).toBe(true);
    expect(area.attributes('d')).toBeTruthy();
  });

  it('exposes the data as an accessible table', () => {
    const wrapper = mount(TChart, {
      props: { series: baseSeries, labels, ariaLabel: 'Quarterly finance' },
    });

    const table = wrapper.find('table.t-chart__a11y');
    expect(table.exists()).toBe(true);
    expect(table.find('caption').text()).toBe('Quarterly finance');
    expect(table.findAll('tbody tr')).toHaveLength(2);
    expect(table.findAll('thead th')).toHaveLength(5); // "Series" + 4 quarters
  });

  it('keeps the a11y table rectangular when series lengths differ', () => {
    const wrapper = mount(TChart, {
      props: {
        series: [
          { name: 'Long', data: [1, 2, 3, 4] },
          { name: 'Short', data: [5, 6] },
        ],
        labels: ['A', 'B', 'C', 'D'],
      },
    });

    const table = wrapper.find('table.t-chart__a11y');
    const categoryColumns = table.findAll('thead th').length - 1; // minus the "Series" column
    expect(categoryColumns).toBe(4);
    table.findAll('tbody tr').forEach((tr) => {
      expect(tr.findAll('td')).toHaveLength(categoryColumns);
    });
  });

  it('renders the empty slot when there is no data', () => {
    const wrapper = mount(TChart, {
      props: { series: [] },
      slots: { empty: 'Nothing here' },
    });

    expect(wrapper.find('.t-chart__empty').text()).toBe('Nothing here');
    expect(wrapper.find('.t-chart__svg').exists()).toBe(false);
  });

  it('renders loading placeholders', () => {
    const wrapper = mount(TChart, {
      props: { series: baseSeries, labels, loading: true },
    });

    expect(wrapper.classes()).toContain('is-loading');
    expect(wrapper.find('.t-chart__loading').exists()).toBe(true);
    expect(wrapper.find('.t-chart__svg').exists()).toBe(false);
  });

  it('shows a tooltip on hover and emits point-click', async () => {
    const wrapper = mount(TChart, {
      props: { series: baseSeries, labels },
    });

    const svg = wrapper.find('.t-chart__svg');
    await svg.trigger('pointermove', { clientX: 120 });

    expect(wrapper.find('.t-chart__tooltip').exists()).toBe(true);
    expect(wrapper.findAll('.t-chart__tooltip-item')).toHaveLength(2);

    await svg.trigger('click');
    expect(wrapper.emitted('point-click')).toBeTruthy();

    await svg.trigger('pointerleave');
    expect(wrapper.find('.t-chart__tooltip').exists()).toBe(false);
  });

  it('respects an explicit showLegend override', () => {
    const wrapper = mount(TChart, {
      props: { series: [baseSeries[0]], labels, showLegend: true },
    });

    expect(wrapper.find('.t-chart__legend').exists()).toBe(true);
  });
});

describe('TDonutChart', () => {
  const segments = [
    { label: 'Direct', value: 45 },
    { label: 'Referral', value: 30 },
    { label: 'Social', value: 25 },
  ];

  it('renders one arc per positive value for a donut', () => {
    const wrapper = mount(TDonutChart, { props: { segments } });

    expect(wrapper.findAll('.t-donut-chart__segment')).toHaveLength(3);
    expect(wrapper.findAll('.t-donut-chart__legend-item')).toHaveLength(3);
    expect(wrapper.find('.t-donut-chart__segment').attributes('stroke-dasharray')).toBeTruthy();
  });

  it('renders filled wedges for a pie', () => {
    const wrapper = mount(TDonutChart, { props: { segments, thickness: 0 } });

    expect(wrapper.findAll('.t-donut-chart__segment')).toHaveLength(3);
    expect(wrapper.find('.t-donut-chart__segment').attributes('d')).toBeTruthy();
  });

  it('omits zero and negative values', () => {
    const wrapper = mount(TDonutChart, {
      props: { segments: [{ label: 'A', value: 10 }, { label: 'B', value: 0 }, { label: 'C', value: -4 }] },
    });

    expect(wrapper.findAll('.t-donut-chart__segment')).toHaveLength(1);
  });

  it('shows the center total for a donut and hides it for a pie', () => {
    const donut = mount(TDonutChart, { props: { segments, centerLabel: 'Sessions' } });
    expect(donut.find('.t-donut-chart__center').exists()).toBe(true);
    expect(donut.find('.t-donut-chart__center-value').text()).toBe('100');
    expect(donut.find('.t-donut-chart__center-label').text()).toBe('Sessions');

    const pie = mount(TDonutChart, { props: { segments, thickness: 0 } });
    expect(pie.find('.t-donut-chart__center').exists()).toBe(false);
  });

  it('renders percentages in the legend', () => {
    const wrapper = mount(TDonutChart, { props: { segments } });
    const percents = wrapper.findAll('.t-donut-chart__legend-percent');
    expect(percents).toHaveLength(3);
    expect(percents[0].text()).toBe('45%');
  });

  it('supports a custom center slot', () => {
    const wrapper = mount(TDonutChart, {
      props: { segments },
      slots: { center: '<span class="custom-center">hi</span>' },
    });

    expect(wrapper.find('.custom-center').exists()).toBe(true);
    expect(wrapper.find('.t-donut-chart__center-value').exists()).toBe(false);
  });

  it('renders the empty state when the total is zero', () => {
    const wrapper = mount(TDonutChart, { props: { segments: [] } });
    expect(wrapper.find('.t-donut-chart__empty').exists()).toBe(true);
    expect(wrapper.find('.t-donut-chart__svg').exists()).toBe(false);
  });
});
