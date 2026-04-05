import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TTabs, TTabList, TTab, TTabPanel } from '@treeui/vue';

const meta = {
  title: 'Components/Navigation/Tabs',
  component: TTabs,
  tags: ['autodocs'],
  args: {
    variant: 'line',
    size: 'md',
    activationMode: 'automatic',
    disabled: false,
    defaultValue: 'account',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['line', 'enclosed'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    activationMode: {
      control: 'select',
      options: ['automatic', 'manual'],
    },
  },
} satisfies Meta<typeof TTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    setup: () => {
      const value = ref(args.defaultValue);
      return { args, value };
    },
    template: `
      <div style="width: 480px;">
        <TTabs
          v-model="value"
          :variant="args.variant"
          :size="args.size"
          :activation-mode="args.activationMode"
          :disabled="args.disabled"
        >
          <TTabList>
            <TTab value="account">Account</TTab>
            <TTab value="settings">Settings</TTab>
            <TTab value="billing">Billing</TTab>
          </TTabList>
          <TTabPanel value="account">
            <p>Manage your account details, profile picture, and personal information.</p>
          </TTabPanel>
          <TTabPanel value="settings">
            <p>Configure your notification preferences, privacy, and display settings.</p>
          </TTabPanel>
          <TTabPanel value="billing">
            <p>View your invoices, update payment methods, and manage subscriptions.</p>
          </TTabPanel>
        </TTabs>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-top: var(--tree-space-2);">
          Active: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const LineVariant: Story = {
  render: () => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <div style="width: 480px;">
        <TTabs default-value="tab1" variant="line">
          <TTabList>
            <TTab value="tab1">Overview</TTab>
            <TTab value="tab2">Analytics</TTab>
            <TTab value="tab3">Reports</TTab>
          </TTabList>
          <TTabPanel value="tab1"><p>Overview content goes here.</p></TTabPanel>
          <TTabPanel value="tab2"><p>Analytics content goes here.</p></TTabPanel>
          <TTabPanel value="tab3"><p>Reports content goes here.</p></TTabPanel>
        </TTabs>
      </div>
    `,
  }),
};

export const EnclosedVariant: Story = {
  render: () => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <div style="width: 480px;">
        <TTabs default-value="tab1" variant="enclosed">
          <TTabList>
            <TTab value="tab1">Overview</TTab>
            <TTab value="tab2">Analytics</TTab>
            <TTab value="tab3">Reports</TTab>
          </TTabList>
          <TTabPanel value="tab1"><p>Overview content goes here.</p></TTabPanel>
          <TTabPanel value="tab2"><p>Analytics content goes here.</p></TTabPanel>
          <TTabPanel value="tab3"><p>Reports content goes here.</p></TTabPanel>
        </TTabs>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <div style="display: grid; gap: 2rem; width: 480px;">
        <TTabs default-value="a" size="sm">
          <TTabList>
            <TTab value="a">Small A</TTab>
            <TTab value="b">Small B</TTab>
          </TTabList>
          <TTabPanel value="a"><p>Small panel A</p></TTabPanel>
          <TTabPanel value="b"><p>Small panel B</p></TTabPanel>
        </TTabs>

        <TTabs default-value="a" size="md">
          <TTabList>
            <TTab value="a">Medium A</TTab>
            <TTab value="b">Medium B</TTab>
          </TTabList>
          <TTabPanel value="a"><p>Medium panel A</p></TTabPanel>
          <TTabPanel value="b"><p>Medium panel B</p></TTabPanel>
        </TTabs>

        <TTabs default-value="a" size="lg">
          <TTabList>
            <TTab value="a">Large A</TTab>
            <TTab value="b">Large B</TTab>
          </TTabList>
          <TTabPanel value="a"><p>Large panel A</p></TTabPanel>
          <TTabPanel value="b"><p>Large panel B</p></TTabPanel>
        </TTabs>
      </div>
    `,
  }),
};

export const DisabledTab: Story = {
  render: () => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <div style="width: 480px;">
        <TTabs default-value="tab1">
          <TTabList>
            <TTab value="tab1">Active</TTab>
            <TTab value="tab2" disabled>Disabled</TTab>
            <TTab value="tab3">Available</TTab>
          </TTabList>
          <TTabPanel value="tab1"><p>This tab is active.</p></TTabPanel>
          <TTabPanel value="tab2"><p>This tab is disabled.</p></TTabPanel>
          <TTabPanel value="tab3"><p>This tab is available.</p></TTabPanel>
        </TTabs>
      </div>
    `,
  }),
};

export const ManualActivation: Story = {
  render: () => ({
    components: { TTabs, TTabList, TTab, TTabPanel },
    template: `
      <div style="width: 480px;">
        <TTabs default-value="first" activation-mode="manual">
          <TTabList>
            <TTab value="first">First</TTab>
            <TTab value="second">Second</TTab>
            <TTab value="third">Third</TTab>
          </TTabList>
          <TTabPanel value="first"><p>Press Enter or Space to activate tabs. Arrow keys only move focus.</p></TTabPanel>
          <TTabPanel value="second"><p>Second panel content.</p></TTabPanel>
          <TTabPanel value="third"><p>Third panel content.</p></TTabPanel>
        </TTabs>
      </div>
    `,
  }),
};
