import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TMarkdownEditor } from '@treeui/vue';

const meta = {
  title: 'Components/Form/MarkdownEditor',
  component: TMarkdownEditor,
  tags: ['autodocs'],
  args: {
    modelValue: '',
    size: 'md',
    disabled: false,
    placeholder: 'Write your markdown here...',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TMarkdownEditor>;

export default meta;

type Story = StoryObj<typeof meta>;

const sampleMarkdown = `# Hello World

This is a **markdown editor** built with _TreeUI_.

## Features

- Live preview
- Toolbar with formatting buttons
- Image paste & upload
- Keyboard shortcuts (\`Ctrl+B\`, \`Ctrl+I\`, \`Ctrl+K\`)

> This is a blockquote with some wisdom.

### Code Example

\`\`\`
function hello() {
  console.log("Hello from TreeUI!");
}
\`\`\`

Here is some \`inline code\` as well.

---

[Visit TreeUI](https://github.com/treeui)
`;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue || '');
      return { args, content };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
      />
    `,
  }),
};

export const WithContent: Story = {
  args: {
    modelValue: sampleMarkdown,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
      />
    `,
  }),
};

export const WithImageUpload: Story = {
  args: {
    modelValue: '# Image Upload Demo\n\nPaste or drop an image to test the upload handler.\n',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue);

      // Simulated upload function
      const uploadImage = async (_file: File): Promise<string> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return `https://picsum.photos/600/400?random=${Date.now()}`;
      };

      return { args, content, uploadImage };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
        :upload-image="uploadImage"
      />
    `,
  }),
};

export const Small: Story = {
  args: {
    modelValue: '## Small editor\n\nCompact size variant.',
    size: 'sm',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
      />
    `,
  }),
};

export const Large: Story = {
  args: {
    modelValue: '# Large Editor\n\nMore spacious variant for long-form content.',
    size: 'lg',
  },
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
      />
    `,
  }),
};

export const Disabled: Story = {
  args: {
    modelValue: '# Disabled\n\nThis editor is disabled.',
    disabled: true,
  },
  render: (args: Record<string, unknown>) => ({
    components: { TMarkdownEditor },
    setup() {
      const content = ref(args.modelValue);
      return { args, content };
    },
    template: `
      <TMarkdownEditor
        v-bind="args"
        v-model="content"
      />
    `,
  }),
};
