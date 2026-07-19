import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TLanguageSelect } from '@treeui/vue';

const languageOptions = [
  { label: 'Português (Brasil)', value: 'pt-BR', code: 'br' },
  { label: 'English (US)', value: 'en-US', code: 'us' },
  { label: 'Español', value: 'es-ES', code: 'es' },
  { label: 'Français', value: 'fr-FR', code: 'fr' },
  { label: 'Deutsch', value: 'de-DE', code: 'de' },
  { label: '日本語', value: 'ja-JP', code: 'jp' },
];

const endonymOptions = [
  { label: 'Portuguese', value: 'pt-BR', code: 'br', description: 'Português (Brasil)' },
  { label: 'English', value: 'en-US', code: 'us', description: 'English (United States)' },
  { label: 'Japanese', value: 'ja-JP', code: 'jp', description: '日本語' },
];

const meta = {
  title: 'Components/Data Entry/LanguageSelect',
  component: TLanguageSelect,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Choose a language',
    modelValue: '',
    options: languageOptions,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TLanguageSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TLanguageSelect },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value, languageOptions };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TLanguageSelect
          aria-label="Language"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :options="languageOptions"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const Switcher: Story = {
  render: () => ({
    components: { TLanguageSelect },
    // Page-level control: nothing nearby labels it, so the translate icon states
    // the purpose and the trailing flag states the current value.
    setup: () => ({ languageOptions, value: ref('pt-BR') }),
    template: `
      <div style="display: grid; gap: 1rem; justify-items: end; width: 420px;">
        <TLanguageSelect
          aria-label="Page language"
          variant="switcher"
          :options="languageOptions"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <TLanguageSelect
          aria-label="Page language"
          variant="switcher"
          icon-only
          :options="languageOptions"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const SwitcherInBar: Story = {
  render: () => ({
    components: { TLanguageSelect },
    setup: () => ({ languageOptions, value: ref('en-US') }),
    template: `
      <div style="width: 560px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; border: 1px solid var(--tree-color-border-default); border-radius: var(--tree-radius-md); background: var(--tree-color-bg-surface);">
        <strong style="font-size: var(--tree-font-size-md);">Acme</strong>
        <TLanguageSelect
          aria-label="Page language"
          variant="switcher"
          size="sm"
          :options="languageOptions"
          :model-value="value"
          @update:model-value="value = $event"
        />
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TLanguageSelect },
    setup: () => ({
      languageOptions,
      selected: ref('pt-BR'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TLanguageSelect aria-label="Default" placeholder="Default" :options="languageOptions" />
        <TLanguageSelect aria-label="With value" :options="languageOptions" :model-value="selected" />
        <TLanguageSelect aria-label="Invalid" invalid placeholder="Invalid state" :options="languageOptions" />
        <TLanguageSelect aria-label="Loading" loading placeholder="Loading state" :options="languageOptions" />
        <TLanguageSelect aria-label="Disabled" disabled placeholder="Disabled" :options="languageOptions" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TLanguageSelect },
    setup: () => ({ languageOptions, selected: ref('pt-BR') }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TLanguageSelect size="sm" aria-label="Small" :options="languageOptions" :model-value="selected" />
        <TLanguageSelect size="md" aria-label="Medium" :options="languageOptions" :model-value="selected" />
        <TLanguageSelect size="lg" aria-label="Large" :options="languageOptions" :model-value="selected" />
      </div>
    `,
  }),
};

export const WithDescriptions: Story = {
  render: () => ({
    components: { TLanguageSelect },
    setup: () => ({ endonymOptions, selected: ref('pt-BR') }),
    template: `
      <div style="width: 320px;">
        <TLanguageSelect
          aria-label="Language"
          :options="endonymOptions"
          :model-value="selected"
        />
      </div>
    `,
  }),
};

export const WithoutFlags: Story = {
  render: () => ({
    components: { TLanguageSelect },
    // Languages without a single defensible country get no flag — omitting
    // `code` is a first-class case, not a degraded one.
    setup: () => ({
      options: [
        { label: 'English', value: 'en' },
        { label: 'Esperanto', value: 'eo' },
        { label: 'العربية', value: 'ar' },
      ],
    }),
    template: `
      <div style="width: 320px;">
        <TLanguageSelect aria-label="Language" placeholder="Choose a language" :options="options" />
      </div>
    `,
  }),
};

export const DisabledOptions: Story = {
  render: () => ({
    components: { TLanguageSelect },
    setup: () => ({
      options: [
        { label: 'Português (Brasil)', value: 'pt-BR', code: 'br' },
        { label: 'English (US)', value: 'en-US', code: 'us' },
        { label: 'Italiano', value: 'it-IT', code: 'it', disabled: true, description: 'Coming soon' },
      ],
    }),
    template: `
      <div style="width: 320px;">
        <TLanguageSelect aria-label="Language" placeholder="Choose a language" :options="options" />
      </div>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    components: { TLanguageSelect },
    template: `
      <div style="width: 320px;">
        <TLanguageSelect aria-label="Language" placeholder="Choose a language" :options="[]" />
      </div>
    `,
  }),
};
