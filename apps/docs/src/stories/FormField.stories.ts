import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TFormField, TInput, TCheckbox } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/FormField',
  component: TFormField,
  tags: ['autodocs'],
  args: {
    label: 'Email address',
    hint: 'We will never share your email.',
    error: '',
    required: false,
    disabled: false,
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TFormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TFormField, TInput },
    setup: () => {
      const value = ref('');
      return { args, value };
    },
    template: `
      <div style="width: 320px;">
        <TFormField
          :label="args.label"
          :hint="args.hint"
          :error="args.error"
          :required="args.required"
          :disabled="args.disabled"
          :size="args.size"
          html-for="email-field"
        >
          <TInput
            id="email-field"
            :size="args.size"
            :disabled="args.disabled"
            :invalid="!!args.error"
            placeholder="you@example.com"
            :model-value="value"
            @update:model-value="value = $event"
          />
        </TFormField>
      </div>
    `,
  }),
};

export const WithError: Story = {
  render: () => ({
    components: { TFormField, TInput },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="width: 320px;">
        <TFormField
          label="Username"
          error="Username is already taken."
          required
          html-for="username-field"
        >
          <TInput
            id="username-field"
            invalid
            placeholder="Choose a username"
            :model-value="value"
            @update:model-value="value = $event"
          />
        </TFormField>
      </div>
    `,
  }),
};

export const WithHint: Story = {
  render: () => ({
    components: { TFormField, TInput },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="width: 320px;">
        <TFormField
          label="Password"
          hint="Must be at least 8 characters."
          html-for="password-field"
        >
          <TInput
            id="password-field"
            type="password"
            placeholder="Enter your password"
            :model-value="value"
            @update:model-value="value = $event"
          />
        </TFormField>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TFormField, TInput },
    setup: () => {
      const sm = ref('');
      const md = ref('');
      const lg = ref('');
      return { sm, md, lg };
    },
    template: `
      <div style="display: grid; gap: 1.5rem; width: 320px;">
        <TFormField label="Small" size="sm" hint="Small form field" html-for="sm-field">
          <TInput id="sm-field" size="sm" placeholder="Small input" :model-value="sm" @update:model-value="sm = $event" />
        </TFormField>
        <TFormField label="Medium" size="md" hint="Medium form field" html-for="md-field">
          <TInput id="md-field" size="md" placeholder="Medium input" :model-value="md" @update:model-value="md = $event" />
        </TFormField>
        <TFormField label="Large" size="lg" hint="Large form field" html-for="lg-field">
          <TInput id="lg-field" size="lg" placeholder="Large input" :model-value="lg" @update:model-value="lg = $event" />
        </TFormField>
      </div>
    `,
  }),
};

export const WithCheckbox: Story = {
  render: () => ({
    components: { TFormField, TCheckbox },
    setup: () => {
      const accepted = ref(false);
      return { accepted };
    },
    template: `
      <div style="width: 320px;">
        <TFormField error="You must accept the terms to continue.">
          <TCheckbox
            :model-value="accepted"
            @update:model-value="accepted = $event"
            :invalid="!accepted"
          >
            I accept the terms and conditions
          </TCheckbox>
        </TFormField>
      </div>
    `,
  }),
};
