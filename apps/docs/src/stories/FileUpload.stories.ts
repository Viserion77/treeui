import { ref } from 'vue';
import type { Meta, StoryObj } from '@storybook/vue3';
import { TFileUpload } from '@treeui/vue';

const meta = {
  title: 'Components/Form/FileUpload',
  component: TFileUpload,
  tags: ['autodocs'],
  args: {
    size: 'md',
    multiple: true,
    accept: 'image/*,.pdf',
    maxFiles: 5,
    label: 'Upload files',
    description: 'Drag and drop, browse, or paste screenshots with Ctrl+V.',
    buttonLabel: 'Choose files',
    filesLabel: 'Attached files',
    paste: true,
    drop: true,
    showFileList: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    maxFiles: {
      control: 'number',
    },
    maxFileSize: {
      control: 'number',
    },
  },
} satisfies Meta<typeof TFileUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([]);
      return { args, files };
    },
    template: `
      <div style="width: min(100%, 36rem);">
        <TFileUpload v-bind="args" v-model="files" />
        <p style="margin: 0.75rem 0 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected files: {{ files.length }}
        </p>
      </div>
    `,
  }),
};

export const SingleFile: Story = {
  render: () => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([]);
      return { files };
    },
    template: `
      <div style="width: min(100%, 32rem);">
        <TFileUpload
          v-model="files"
          :multiple="false"
          accept="image/*"
          label="Profile picture"
          description="Drop or paste a single image."
          button-label="Choose image"
        />
      </div>
    `,
  }),
};

export const CustomFileRow: Story = {
  render: () => ({
    components: { TFileUpload },
    setup: () => {
      const files = ref<File[]>([
        new File(['brief'], 'creative-brief.pdf', { type: 'application/pdf' }),
        new File(['mockup'], 'hero-shot.png', { type: 'image/png' }),
      ]);

      return { files };
    },
    template: `
      <div style="width: min(100%, 36rem);">
        <TFileUpload
          v-model="files"
          accept="image/*,.pdf"
          label="Assets"
          description="Keep campaign files together in one place."
        >
          <template #file="{ file, removeFile }">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%;">
              <div style="display: grid; gap: 0.2rem;">
                <strong>{{ file.name }}</strong>
                <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
                  {{ file.type || 'Unknown type' }}
                </span>
              </div>
              <button
                type="button"
                style="border: 0; background: transparent; color: var(--tree-color-brand-primary); cursor: pointer;"
                @click="removeFile()"
              >
                Remove
              </button>
            </div>
          </template>
        </TFileUpload>
      </div>
    `,
  }),
};
