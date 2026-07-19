import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TContainer } from '@treeui/vue';

const meta = {
  title: 'Components/Layout/Container',
  component: TContainer,
  tags: ['autodocs'],
  args: {
    as: 'div',
    size: 'lg',
    padded: true,
    centered: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
} satisfies Meta<typeof TContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TBadge, TButton, TContainer },
    setup: () => ({ args }),
    template: `
      <div style="background: var(--tree-color-bg-primary); padding-block: 1.5rem;">
        <TContainer v-bind="args">
          <div style="display: grid; gap: 1rem; padding: 1.25rem; border: 1px dashed var(--tree-color-border-strong); border-radius: 1rem; background: var(--tree-color-bg-surface);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <strong>Foundation roadmap</strong>
              <TBadge>Layout</TBadge>
            </div>
            <p style="margin: 0;">
              TContainer keeps page content readable while letting app shells stay full-width.
            </p>
            <div style="display: flex; justify-content: flex-end;">
              <TButton size="sm" variant="outline">View layout recipe</TButton>
            </div>
          </div>
        </TContainer>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TContainer },
    template: `
      <div style="display: grid; gap: 1rem; background: var(--tree-color-bg-primary); padding-block: 1.5rem;">
        <TContainer size="sm"><div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Small container</div></TContainer>
        <TContainer size="md"><div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Medium container</div></TContainer>
        <TContainer size="lg"><div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Large container</div></TContainer>
        <TContainer size="xl"><div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">XL container</div></TContainer>
        <TContainer size="full"><div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Full container (no max-width)</div></TContainer>
      </div>
    `,
  }),
};

export const PaddingAndAlignment: Story = {
  render: () => ({
    components: { TContainer },
    template: `
      <div style="display: grid; gap: 1.25rem; background: var(--tree-color-bg-primary); padding-block: 1.5rem;">
        <TContainer size="sm" style="outline: 1px dashed var(--tree-color-border-strong);">
          <div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">Defaults — padded and centered</div>
        </TContainer>
        <TContainer size="sm" :padded="false" style="outline: 1px dashed var(--tree-color-border-strong);">
          <div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">padded=false — content sits flush against the container edge</div>
        </TContainer>
        <TContainer size="sm" :centered="false" style="outline: 1px dashed var(--tree-color-border-strong);">
          <div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">centered=false — hugs the inline start instead of using auto margins</div>
        </TContainer>
      </div>
    `,
  }),
};

export const SemanticElement: Story = {
  render: () => ({
    components: { TContainer },
    template: `
      <div style="background: var(--tree-color-bg-primary); padding-block: 1.5rem;">
        <TContainer as="main" size="md">
          <h2 style="margin: 0 0 0.5rem;">Documentation</h2>
          <p style="margin: 0 0 1rem;">
            The <code>as</code> prop swaps the rendered element, so the layout wrapper can double as
            the page landmark instead of adding another nesting level.
          </p>
          <TContainer as="section" size="full" :padded="false" aria-label="Related links">
            <div style="padding: 0.75rem; border-radius: 0.75rem; background: var(--tree-color-brand-soft);">
              Nested section container filling its parent
            </div>
          </TContainer>
        </TContainer>
      </div>
    `,
  }),
};
