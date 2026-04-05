import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TPagination } from '@treeui/vue';

const meta = {
  title: 'Components/Navigation/Pagination',
  component: TPagination,
  tags: ['autodocs'],
  args: {
    modelValue: 1,
    totalPages: 10,
    siblings: 1,
    size: 'md',
    disabled: false,
    label: 'Pagination',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    totalPages: { control: { type: 'number', min: 1, max: 100 } },
    siblings: { control: { type: 'number', min: 0, max: 5 } },
  },
} satisfies Meta<typeof TPagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TPagination },
    setup() {
      const page = ref(args.modelValue as number);
      return { args, page };
    },
    template: `<TPagination v-bind="args" v-model="page" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TPagination },
    setup() {
      const sm = ref(3);
      const md = ref(3);
      const lg = ref(3);
      return { sm, md, lg };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <TPagination v-model="sm" :total-pages="10" size="sm" label="Small pagination" />
        <TPagination v-model="md" :total-pages="10" size="md" label="Medium pagination" />
        <TPagination v-model="lg" :total-pages="10" size="lg" label="Large pagination" />
      </div>
    `,
  }),
};

export const FewPages: Story = {
  render: () => ({
    components: { TPagination },
    setup() {
      const page = ref(1);
      return { page };
    },
    template: `<TPagination v-model="page" :total-pages="3" label="Few pages" />`,
  }),
};

export const ManyPages: Story = {
  render: () => ({
    components: { TPagination },
    setup() {
      const page = ref(15);
      return { page };
    },
    template: `<TPagination v-model="page" :total-pages="50" :siblings="2" label="Many pages" />`,
  }),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    modelValue: 5,
    totalPages: 10,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TPagination },
    setup: () => ({ args }),
    template: `<TPagination v-bind="args" />`,
  }),
};

export const FirstPage: Story = {
  render: () => ({
    components: { TPagination },
    setup() {
      const page = ref(1);
      return { page };
    },
    template: `<TPagination v-model="page" :total-pages="10" label="First page selected" />`,
  }),
};

export const LastPage: Story = {
  render: () => ({
    components: { TPagination },
    setup() {
      const page = ref(10);
      return { page };
    },
    template: `<TPagination v-model="page" :total-pages="10" label="Last page selected" />`,
  }),
};
