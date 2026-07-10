import type { Meta, StoryObj } from '@storybook/react-vite';
import { TBadge, TButton, TCard } from '@treeui/react';

// The examples are standalone Vite apps assembled next to this Storybook on the
// deployed site (site/examples/*). From the Storybook iframe at /react/, the apps
// live one level up; during local Storybook dev, run `pnpm example:react:dev`.
const reactExampleHref = '../examples/dashboard-react/';
const vueExampleHref = '../examples/dashboard-vue/';

const meta = {
  title: 'Showcase/Examples',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full standalone applications built with TreeUI, deployed alongside these docs. Source lives in the `examples/` folder of the repository.',
      },
    },
  },
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<Record<string, never>>;

export const FullApplications: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 'var(--tree-space-5)',
        maxWidth: '56rem',
        fontFamily: 'var(--tree-font-family-sans)',
      }}
    >
      <div>
        <h2
          style={{
            margin: '0 0 var(--tree-space-2)',
            fontSize: 'var(--tree-font-size-xl, 1.4rem)',
            color: 'var(--tree-color-text-primary)',
          }}
        >
          Full application examples
        </h2>
        <p style={{ margin: 0, color: 'var(--tree-color-text-muted)', maxWidth: '64ch' }}>
          Configurable dashboard apps built with TreeUI and deployed next to these docs. Source
          code lives in the <code>examples/</code> folder of the repository.
        </p>
      </div>

      <TCard
        variant="outline"
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--tree-space-3)',
            }}
          >
            <strong>React dashboard</strong>
            <TBadge tone="success" size="sm">
              Live demo
            </TBadge>
          </div>
        }
        footer={
          <TButton onClick={() => window.open(reactExampleHref, '_blank', 'noopener')}>
            Open React example
          </TButton>
        }
      >
        <p style={{ margin: 0, color: 'var(--tree-color-text-muted)' }}>
          A configurable dashboard — theme, accent color, and density — built with the React
          primitives TButton, TInput, TBadge, and TCard on shared design tokens.
        </p>
      </TCard>

      <TCard
        variant="outline"
        header={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--tree-space-3)',
            }}
          >
            <strong>Vue dashboard</strong>
            <TBadge tone="success" size="sm">
              Live demo
            </TBadge>
          </div>
        }
        footer={
          <TButton
            variant="outline"
            onClick={() => window.open(vueExampleHref, '_blank', 'noopener')}
          >
            Open Vue example
          </TButton>
        }
      >
        <p style={{ margin: 0, color: 'var(--tree-color-text-muted)' }}>
          The full component set working together — app shell, sortable tables, KPI stats, toasts,
          and a settings drawer.
        </p>
      </TCard>
    </div>
  ),
};
