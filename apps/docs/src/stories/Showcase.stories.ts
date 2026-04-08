import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import {
  TAccordion,
  TAccordionItem,
  TAlert,
  TAvatar,
  TBadge,
  TBreadcrumb,
  TBreadcrumbItem,
  TButton,
  TCard,
  TCheckbox,
  TCombobox,
  TConfirmDialog,
  TContainer,
  TContextMenu,
  TDatePicker,
  TDateTimePicker,
  TDivider,
  TDrawer,
  TDropdown,
  TEmptyState,
  TFileUpload,
  TFormField,
  TGrid,
  TInput,
  TMarkdownEditor,
  TModal,
  TMultiSelect,
  TNavMenu,
  TNavbar,
  TNumberInput,
  TPagination,
  TPopover,
  TPricing,
  TProgress,
  TRadio,
  TRadioGroup,
  TSelectableList,
  TSelect,
  TSidebar,
  TSkeleton,
  TSpinner,
  TStack,
  TStat,
  TSteps,
  TSwitch,
  TTab,
  TTabList,
  TTabPanel,
  TTabs,
  TTable,
  TTag,
  TTextarea,
  TTimeline,
  TToastProvider,
  TToggleGroup,
  TTooltip,
  TTreeView,
  useToast,
} from '@treeui/vue';

const sectionStyle = `
  display: grid;
  gap: 1rem;
`;

const panelStyle = `
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border: 1px solid var(--tree-color-border-default);
  border-radius: 1rem;
  background: var(--tree-color-bg-surface);
`;

const detailsStyle = `
  border: 1px solid var(--tree-color-border-default);
  border-radius: 1.25rem;
  background: var(--tree-color-bg-surface);
  overflow: hidden;
`;

const detailsSummaryStyle = `
  display: grid;
  gap: 0.2rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  list-style: none;
  background: color-mix(in srgb, var(--tree-color-bg-subtle) 65%, transparent);
`;

const detailsContentStyle = `
  display: grid;
  gap: 1.5rem;
  padding: 1.25rem;
`;

const subsectionStyle = `
  display: grid;
  gap: 0.9rem;
  align-content: start;
`;

const eyebrowStyle = `
  margin: 0;
  color: var(--tree-color-text-muted);
  font-size: var(--tree-font-size-xs);
  font-weight: var(--tree-font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const noteStyle = `
  margin: 0;
  color: var(--tree-color-text-muted);
  font-size: var(--tree-font-size-sm);
`;

const selectOptions = [
  { label: 'Design', value: 'design' },
  { label: 'Engineering', value: 'engineering' },
  { label: 'Operations', value: 'ops' },
  { label: 'Support', value: 'support' },
];

const richOptions = [
  {
    label: 'Design systems',
    value: 'design-systems',
    description: 'Components, tokens, and docs.',
  },
  {
    label: 'Platform',
    value: 'platform',
    description: 'Infra, observability, and shared tooling.',
  },
  {
    label: 'Growth',
    value: 'growth',
    description: 'Activation and experiments.',
  },
];

const navItems = [
  { label: 'Overview', value: 'overview', description: 'Summary and activity', badge: '12', shortLabel: 'O' },
  { label: 'Projects', value: 'projects', description: 'Roadmaps and delivery', shortLabel: 'P' },
  { label: 'Billing', value: 'billing', description: 'Plan and invoices', badge: 'New', shortLabel: 'B' },
  { label: 'Settings', value: 'settings', description: 'Workspace preferences', shortLabel: 'S' },
];

const selectableItems = [
  {
    label: 'Release notes',
    value: 'release-notes',
    description: 'Customer-facing summary for the next shipment.',
    meta: 'Docs',
  },
  {
    label: 'Launch brief',
    value: 'launch-brief',
    description: 'Cross-functional checklist for launch day.',
    meta: 'Launch',
  },
  {
    label: 'Incident playbook',
    value: 'incident-playbook',
    description: 'Escalation flow and recovery steps.',
    meta: 'Ops',
  },
];

const treeNodes = [
  {
    id: 'workspace',
    label: 'Workspace',
    meta: 'root',
    children: [
      {
        id: 'workspace-docs',
        label: 'Docs',
        description: 'Guides, changelogs, and onboarding notes.',
        children: [
          { id: 'workspace-docs-roadmap', label: 'Roadmap.mdx', meta: 'MDX' },
          { id: 'workspace-docs-release', label: 'ReleasePlan.mdx', meta: 'MDX' },
        ],
      },
      {
        id: 'workspace-app',
        label: 'App',
        description: 'Main application source.',
        children: [
          { id: 'workspace-app-dashboard', label: 'Dashboard.vue', meta: 'Vue' },
          { id: 'workspace-app-shell', label: 'Shell.vue', meta: 'Vue' },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Workspace-level permissions and preferences.',
    children: [
      { id: 'settings-members', label: 'Members', meta: '27' },
      { id: 'settings-billing', label: 'Billing', meta: 'Admin only', disabled: true },
    ],
  },
];

const tableColumns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'status', label: 'Status' },
];

const tableRows = [
  { name: 'Annie Case', role: 'Owner', status: 'Active' },
  { name: 'Marco Ruiz', role: 'Editor', status: 'Reviewing' },
  { name: 'Jules Kim', role: 'Viewer', status: 'Idle' },
];

const timelineItems = [
  {
    id: 'queued',
    meta: 'Queued',
    title: 'Release queued for review',
    description: 'The release was created and sent to the review lane.',
    timestamp: '09:12',
    tone: 'brand',
  },
  {
    id: 'approved',
    meta: 'Approved',
    title: 'Design review approved',
    description: 'Tokens and component updates were signed off.',
    timestamp: '10:03',
    tone: 'success',
  },
  {
    id: 'warning',
    meta: 'Needs attention',
    title: 'Visual diff found',
    description: 'Storybook snapshots flagged a footer regression.',
    timestamp: '11:18',
    tone: 'warning',
  },
];

const pricingPlans = [
  {
    title: 'Starter',
    description: 'For small teams shipping the foundation.',
    price: 0,
    currency: '$',
    period: '/month',
    features: [
      { text: '5 projects', included: true },
      { text: 'Community support', included: true },
      { text: 'Custom domain', included: false },
    ],
    buttonText: 'Start free',
  },
  {
    title: 'Pro',
    description: 'Best for growing product teams.',
    price: 29,
    currency: '$',
    period: '/month',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: 'Priority support', included: true },
      { text: 'Analytics', included: true },
    ],
    highlighted: true,
    badge: 'Popular',
    buttonText: 'Upgrade',
  },
  {
    title: 'Enterprise',
    description: 'For larger organizations with heavier workflows.',
    price: 99,
    currency: '$',
    period: '/month',
    features: [
      { text: 'Unlimited everything', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'Advanced analytics', included: true },
    ],
    buttonText: 'Contact sales',
  },
];

const meta = {
  title: 'Showcase/All Components',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A quick visual overview of the TreeUI surface, with a gallery, size and state references, and composed usage examples.',
      },
    },
  },
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<Record<string, never>>;

export const Gallery: Story = {
  render: () => ({
    components: {
      TAccordion,
      TAccordionItem,
      TAlert,
      TAvatar,
      TBadge,
      TBreadcrumb,
      TBreadcrumbItem,
      TButton,
      TCard,
      TCheckbox,
      TCombobox,
      TConfirmDialog,
      TContainer,
      TContextMenu,
      TDatePicker,
      TDateTimePicker,
      TDivider,
      TDrawer,
      TDropdown,
      TEmptyState,
      TFileUpload,
      TFormField,
      TGrid,
      TInput,
      TMarkdownEditor,
      TModal,
      TMultiSelect,
      TNavMenu,
      TNavbar,
      TNumberInput,
      TPagination,
      TPopover,
      TPricing,
      TProgress,
      TRadio,
      TRadioGroup,
      TSelectableList,
      TSelect,
      TSidebar,
      TSkeleton,
      TSpinner,
      TStack,
      TStat,
      TSteps,
      TSwitch,
      TTab,
      TTabList,
      TTabPanel,
      TTabs,
      TTable,
      TTag,
      TTextarea,
      TTimeline,
      TToastProvider,
      TToggleGroup,
      TTooltip,
      TTreeView,
    },
    setup: () => {
      const toast = useToast();
      const selectValue = ref('engineering');
      const comboboxValue = ref('design-systems');
      const multiValue = ref(['design', 'engineering']);
      const numberValue = ref(8);
      const dateValue = ref('2026-04-15');
      const checkboxValue = ref(true);
      const switchValue = ref(true);
      const radioValue = ref('weekly');
      const toggleValue = ref('week');
      const page = ref(3);
      const selectedList = ref('release-notes');
      const treeValue = ref('workspace-docs-roadmap');
      const expanded = ref(['workspace', 'workspace-docs']);
      const galleryFiles = ref<File[]>([]);
      const markdownValue = ref('## Release notes\n\n- Docs recipes added\n- Milestones shipped\n- Release bumped to 0.4.0');
      const modalOpen = ref(false);
      const drawerOpen = ref(false);
      const confirmOpen = ref(false);

      const showToast = () => {
        toast.add({
          title: 'Showcase notification',
          description: 'TreeUI can mix feedback patterns in the same screen.',
          variant: 'success',
        });
      };

      return {
        checkboxValue,
        comboboxValue,
        confirmOpen,
        dateValue,
        detailsContentStyle,
        detailsStyle,
        detailsSummaryStyle,
        drawerOpen,
        expanded,
        galleryFiles,
        modalOpen,
        markdownValue,
        multiValue,
        navItems,
        noteStyle,
        numberValue,
        page,
        pricingPlans,
        radioValue,
        richOptions,
        sectionStyle,
        selectOptions,
        selectValue,
        selectableItems,
        selectedList,
        showToast,
        subsectionStyle,
        switchValue,
        tableColumns,
        tableRows,
        timelineItems,
        toggleValue,
        treeNodes,
        treeValue,
        eyebrowStyle,
      };
    },
    template: `
      <TToastProvider position="top-right" />

      <TContainer size="xl">
        <div style="display: grid; gap: 1.25rem;">
          <section :style="sectionStyle">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Quick Scan</p>
              <h1 style="margin: 0; font-size: clamp(1.8rem, 3vw, 2.4rem);">All components at a glance</h1>
              <p :style="noteStyle">
                The gallery is organized as open sections so you can skim the full surface without a wall of competing cards.
              </p>
            </div>
          </section>

          <details open :style="detailsStyle">
            <summary :style="detailsSummaryStyle">
              <p :style="eyebrowStyle">Section 1</p>
              <strong style="font-size: var(--tree-font-size-lg);">Layout and app shell</strong>
              <span :style="noteStyle">Container, grid, stack, navbar, sidebar, nav menu, and structural rhythm.</span>
            </summary>
            <div :style="detailsContentStyle">
              <TNavbar bordered>
                <template #start>
                  <strong>TreeUI workspace</strong>
                </template>
                <template #center>
                  <span style="color: var(--tree-color-text-muted);">Previewing the full component surface</span>
                </template>
                <template #end>
                  <TBadge size="sm">Showcase</TBadge>
                  <TButton size="sm" variant="outline">Invite</TButton>
                </template>
              </TNavbar>

              <TGrid min-item-width="22rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Container, grid, stack, and divider</p>
                  <TContainer
                    size="full"
                    :centered="false"
                    :padded="false"
                  >
                    <div style="display: grid; gap: 1rem; padding: 1rem; border: 1px dashed var(--tree-color-border-default); border-radius: 1rem;">
                      <TStack gap="var(--tree-space-3)">
                        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
                          <TButton size="sm">Primary</TButton>
                          <TButton size="sm" variant="outline">Outline</TButton>
                          <TButton size="sm" variant="ghost">Ghost</TButton>
                          <TBadge size="sm">Beta</TBadge>
                          <TTag size="sm">Docs</TTag>
                          <TAvatar alt="Annie Case" initials="AC" status="online" />
                        </div>
                        <TDivider />
                        <TGrid min-item-width="10rem" gap="var(--tree-space-3)">
                          <div style="padding: 0.9rem 1rem; border-radius: 0.85rem; background: var(--tree-color-bg-subtle);">Overview</div>
                          <div style="padding: 0.9rem 1rem; border-radius: 0.85rem; background: var(--tree-color-bg-subtle);">Analytics</div>
                          <div style="padding: 0.9rem 1rem; border-radius: 0.85rem; background: var(--tree-color-bg-subtle);">Review queue</div>
                        </TGrid>
                      </TStack>
                    </div>
                  </TContainer>
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Sidebar and nav menu</p>
                  <div style="display: grid; grid-template-columns: auto 1fr; min-height: 16rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; overflow: hidden;">
                    <TSidebar
                      width="15rem"
                      :collapsible="false"
                      :bordered="false"
                    >
                      <template #header>
                        <div style="display: grid; gap: 0.35rem;">
                          <strong>Navigation</strong>
                          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                            App shell entry points
                          </span>
                        </div>
                      </template>

                      <TNavMenu
                        aria-label="Workspace sections"
                        :items="navItems"
                        model-value="projects"
                      />
                    </TSidebar>

                    <div style="display: grid; gap: 0.9rem; padding: 1rem; align-content: start;">
                      <strong>Content canvas</strong>
                      <p :style="noteStyle">
                        Shell primitives stay lightweight so teams can assemble dashboard and workspace layouts without a page framework.
                      </p>
                      <div style="display: grid; gap: 0.75rem;">
                        <div v-for="n in 3" :key="n" style="padding: 0.9rem 1rem; border-radius: 0.85rem; background: var(--tree-color-bg-subtle);">
                          Content block {{ n }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TGrid>
            </div>
          </details>

          <details open :style="detailsStyle">
            <summary :style="detailsSummaryStyle">
              <p :style="eyebrowStyle">Section 2</p>
              <strong style="font-size: var(--tree-font-size-lg);">Inputs and selection</strong>
              <span :style="noteStyle">Text entry, choice controls, selectors, uploads, and authoring surfaces.</span>
            </summary>
            <div :style="detailsContentStyle">
              <TGrid min-item-width="22rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Field primitives</p>
                  <TFormField label="Workspace search">
                    <TInput aria-label="Workspace search" model-value="TreeUI" />
                  </TFormField>
                  <TFormField label="Seats">
                    <TNumberInput aria-label="Seats" :model-value="numberValue" @update:model-value="numberValue = $event" />
                  </TFormField>
                  <TFormField label="Ship date">
                    <TDatePicker aria-label="Ship date" :model-value="dateValue" @update:model-value="dateValue = $event" />
                  </TFormField>
                  <TFormField label="Release window">
                    <TDateTimePicker
                      aria-label="Release window"
                      model-value="2026-04-21T16:30"
                    />
                  </TFormField>
                  <TFormField label="Notes">
                    <TTextarea aria-label="Notes" model-value="Release-ready docs with quick scan coverage." />
                  </TFormField>
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Select family and choices</p>
                  <TSelect
                    aria-label="Team"
                    :options="selectOptions"
                    :model-value="selectValue"
                    @update:model-value="selectValue = $event"
                  />
                  <TCombobox
                    aria-label="Search team"
                    :options="richOptions"
                    :model-value="comboboxValue"
                    @update:model-value="comboboxValue = $event"
                  />
                  <TMultiSelect
                    aria-label="Assigned teams"
                    :options="richOptions"
                    :model-value="multiValue"
                    @update:model-value="multiValue = $event"
                  />
                  <TCheckbox :model-value="checkboxValue" @update:model-value="checkboxValue = $event">Enable audit logs</TCheckbox>
                  <TSwitch :model-value="switchValue" @update:model-value="switchValue = $event">Enable notifications</TSwitch>
                  <TRadioGroup :model-value="radioValue" name="cadence" @update:model-value="radioValue = $event">
                    <TRadio value="daily">Daily</TRadio>
                    <TRadio value="weekly">Weekly</TRadio>
                  </TRadioGroup>
                  <TToggleGroup
                    aria-label="Range"
                    :options="[
                      { label: 'Day', value: 'day' },
                      { label: 'Week', value: 'week' },
                      { label: 'Month', value: 'month' }
                    ]"
                    :model-value="toggleValue"
                    @update:model-value="toggleValue = $event"
                  />
                </div>
              </TGrid>

              <TDivider />

              <TGrid min-item-width="24rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">File upload</p>
                  <TFileUpload
                    v-model="galleryFiles"
                    label="Assets"
                    description="Drag, drop, browse, or paste supporting files."
                    button-label="Choose files"
                    accept="image/*,.pdf"
                    :show-file-list="false"
                  />
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Markdown editor</p>
                  <TMarkdownEditor
                    size="sm"
                    :model-value="markdownValue"
                    @update:model-value="markdownValue = $event"
                  />
                </div>
              </TGrid>
            </div>
          </details>

          <details open :style="detailsStyle">
            <summary :style="detailsSummaryStyle">
              <p :style="eyebrowStyle">Section 3</p>
              <strong style="font-size: var(--tree-font-size-lg);">Navigation and disclosure</strong>
              <span :style="noteStyle">Flow control, hierarchy, progressive disclosure, and lightweight navigation patterns.</span>
            </summary>
            <div :style="detailsContentStyle">
              <TGrid min-item-width="22rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Breadcrumb, tabs, and accordion</p>
                  <TBreadcrumb separator="›">
                    <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
                    <TBreadcrumbItem href="/docs">Docs</TBreadcrumbItem>
                    <TBreadcrumbItem>Showcase</TBreadcrumbItem>
                  </TBreadcrumb>
                  <TTabs default-value="overview" size="sm">
                    <TTabList>
                      <TTab value="overview">Overview</TTab>
                      <TTab value="activity">Activity</TTab>
                    </TTabList>
                    <TTabPanel value="overview">
                      <p :style="noteStyle">Compact tabs for quick content switching.</p>
                    </TTabPanel>
                    <TTabPanel value="activity">
                      <p :style="noteStyle">Tabs stay useful inside dense product screens.</p>
                    </TTabPanel>
                  </TTabs>
                  <TAccordion type="single" collapsible>
                    <TAccordionItem value="a">
                      <template #trigger>What does TreeUI optimize for?</template>
                      Accessible defaults, compact APIs, and app-ready composition.
                    </TAccordionItem>
                  </TAccordion>
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Selectable structures</p>
                  <TSelectableList
                    aria-label="Templates"
                    :items="selectableItems"
                    :model-value="selectedList"
                    @update:model-value="selectedList = $event"
                  />
                  <TSteps
                    size="sm"
                    orientation="vertical"
                    :items="[
                      { value: 'plan', label: 'Plan', status: 'complete' },
                      { value: 'build', label: 'Build', status: 'current' },
                      { value: 'ship', label: 'Ship', status: 'upcoming' }
                    ]"
                    model-value="build"
                  />
                  <TPagination v-model="page" :total-pages="8" size="sm" label="Showcase pagination" />
                </div>
              </TGrid>

              <TGrid min-item-width="24rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Tree view</p>
                  <TTreeView
                    aria-label="Workspace tree"
                    :nodes="treeNodes"
                    :model-value="treeValue"
                    :expanded="expanded"
                    @update:model-value="treeValue = $event"
                    @update:expanded="expanded = $event"
                  />
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Table</p>
                  <TTable :columns="tableColumns" :rows="tableRows" size="sm" />
                </div>
              </TGrid>
            </div>
          </details>

          <details open :style="detailsStyle">
            <summary :style="detailsSummaryStyle">
              <p :style="eyebrowStyle">Section 4</p>
              <strong style="font-size: var(--tree-font-size-lg);">Data display</strong>
              <span :style="noteStyle">Cards, stats, timelines, empty states, and plan comparison surfaces.</span>
            </summary>
            <div :style="detailsContentStyle">
              <TGrid min-item-width="18rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Identity and status</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
                    <TAvatar alt="Annie Case" initials="AC" status="online" />
                    <TBadge>Stable</TBadge>
                    <TTag>Docs</TTag>
                  </div>
                  <TStat label="MRR" value="$48.2k" trend="12.4%" tone="success" trend-direction="up" />
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Card</p>
                  <TCard>
                    <template #header>
                      <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: center;">
                        <strong>Release summary</strong>
                        <TBadge size="sm">Ready</TBadge>
                      </div>
                    </template>
                    <p style="margin: 0;">Cards keep product content grouped without forcing a larger page abstraction.</p>
                    <template #footer>
                      <div style="display: flex; justify-content: flex-end;">
                        <TButton size="sm" variant="outline">Review</TButton>
                      </div>
                    </template>
                  </TCard>
                </div>
              </TGrid>

              <TGrid min-item-width="24rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Timeline</p>
                  <TTimeline :items="timelineItems" size="sm" aria-label="Release timeline" />
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Empty state</p>
                  <TEmptyState
                    size="sm"
                    title="No incidents open"
                    description="Everything looks healthy across the current release."
                  >
                    <template #actions>
                      <TButton size="sm" variant="outline">View history</TButton>
                    </template>
                  </TEmptyState>
                </div>
              </TGrid>

              <div :style="subsectionStyle">
                <p :style="eyebrowStyle">Pricing</p>
                <TPricing :plans="pricingPlans" size="sm" />
              </div>
            </div>
          </details>

          <details open :style="detailsStyle">
            <summary :style="detailsSummaryStyle">
              <p :style="eyebrowStyle">Section 5</p>
              <strong style="font-size: var(--tree-font-size-lg);">Feedback and overlays</strong>
              <span :style="noteStyle">Transient status, floating layers, confirmations, context menus, and toasts.</span>
            </summary>
            <div :style="detailsContentStyle">
              <TGrid min-item-width="22rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Feedback primitives</p>
                  <TAlert variant="warning">Deployment window closes in 18 minutes.</TAlert>
                  <TProgress :value="68" />
                  <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <TSpinner label="Loading" />
                    <span :style="noteStyle">Loading release metrics</span>
                  </div>
                  <TSkeleton style="width: 100%; height: 3rem;" />
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Menus and floating content</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: start; padding-top: 2.5rem;">
                    <TDropdown
                      size="sm"
                      label="Actions"
                      :items="[
                        { label: 'Edit', value: 'edit' },
                        { label: 'Duplicate', value: 'duplicate' },
                        { label: 'Archive', value: 'archive' }
                      ]"
                    />

                    <TPopover side="bottom" align="start" default-open>
                      <template #trigger>
                        <TButton size="sm" variant="outline">Popover</TButton>
                      </template>
                      <p style="margin: 0; max-width: 12rem;">Compact secondary content lives here.</p>
                    </TPopover>

                    <TTooltip content="Invite another teammate to the workspace." :open="true" :delay="0">
                      <template #trigger>
                        <TButton size="sm" variant="ghost">Tooltip</TButton>
                      </template>
                    </TTooltip>
                  </div>
                </div>
              </TGrid>

              <TGrid min-item-width="22rem" gap="var(--tree-space-6)">
                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Dialog family</p>
                  <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                    <TModal
                      title="Invite teammate"
                      description="Share access without leaving the current flow."
                      :open="modalOpen"
                      @update:open="modalOpen = $event"
                    >
                      <template #trigger>
                        <TButton size="sm" variant="outline">Modal</TButton>
                      </template>
                      <template #content>
                        <TInput aria-label="Invite email" placeholder="name@company.com" />
                      </template>
                      <template #footer>
                        <TButton size="sm" variant="ghost" @click="modalOpen = false">Cancel</TButton>
                        <TButton size="sm" @click="modalOpen = false">Invite</TButton>
                      </template>
                    </TModal>

                    <TDrawer
                      title="Quick settings"
                      description="Inspect shell controls without leaving the page."
                      :open="drawerOpen"
                      @update:open="drawerOpen = $event"
                    >
                      <template #trigger>
                        <TButton size="sm" variant="outline">Drawer</TButton>
                      </template>
                      <template #content>
                        <TInput aria-label="Workspace" placeholder="TreeUI workspace" />
                      </template>
                    </TDrawer>

                    <TConfirmDialog
                      title="Delete release"
                      description="This action permanently removes the current release draft."
                      confirm-label="Delete"
                      confirm-variant="danger"
                      :open="confirmOpen"
                      @update:open="confirmOpen = $event"
                    >
                      <template #trigger>
                        <TButton size="sm" variant="danger">Confirm</TButton>
                      </template>
                    </TConfirmDialog>
                  </div>
                </div>

                <div :style="subsectionStyle">
                  <p :style="eyebrowStyle">Context menu and toast</p>
                  <TContextMenu
                    :items="[
                      { label: 'Cut', value: 'cut' },
                      { label: 'Copy', value: 'copy' },
                      { label: 'Paste', value: 'paste' }
                    ]"
                  >
                    <div
                      style="
                        padding: var(--tree-space-5);
                        border: 1px dashed var(--tree-color-border-default);
                        border-radius: var(--tree-radius-md);
                        text-align: center;
                        color: var(--tree-color-text-muted);
                        user-select: none;
                      "
                    >
                      Right-click this area
                    </div>
                  </TContextMenu>

                  <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <TButton size="sm" @click="showToast">Show toast</TButton>
                    <TButton size="sm" variant="soft">Toast provider active</TButton>
                  </div>
                </div>
              </TGrid>
            </div>
          </details>
        </div>
      </TContainer>
    `,
  }),
};

export const SizesAndStates: Story = {
  render: () => ({
    components: {
      TAlert,
      TAvatar,
      TBadge,
      TButton,
      TCheckbox,
      TContainer,
      TGrid,
      TInput,
      TDateTimePicker,
      TMultiSelect,
      TNumberInput,
      TSelect,
      TSpinner,
      TSwitch,
      TToggleGroup,
    },
    setup: () => ({
      eyebrowStyle,
      noteStyle,
      panelStyle,
      richOptions,
      sectionStyle,
      selectOptions,
    }),
    template: `
      <TContainer size="xl">
        <div style="display: grid; gap: 1.5rem;">
          <section :style="sectionStyle">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Reference</p>
              <h1 style="margin: 0; font-size: clamp(1.7rem, 3vw, 2.2rem);">Sizes and states</h1>
              <p :style="noteStyle">
                A fast visual reference for common variants, sizes, and UI states across the most-used controls.
              </p>
            </div>

            <TGrid min-item-width="18rem" gap="var(--tree-space-4)">
              <div :style="panelStyle">
                <p :style="eyebrowStyle">Buttons</p>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <TButton size="sm">Small</TButton>
                  <TButton size="md">Medium</TButton>
                  <TButton size="lg">Large</TButton>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <TButton variant="outline">Outline</TButton>
                  <TButton variant="soft">Soft</TButton>
                  <TButton variant="ghost">Ghost</TButton>
                  <TButton variant="danger">Danger</TButton>
                </div>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                  <TButton loading>Loading</TButton>
                  <TButton disabled>Disabled</TButton>
                </div>
              </div>

              <div :style="panelStyle">
                <p :style="eyebrowStyle">Inputs</p>
                <div style="display: grid; gap: 0.75rem;">
                  <TInput aria-label="Small input" size="sm" placeholder="Small" />
                  <TInput aria-label="Medium input" size="md" placeholder="Medium" />
                  <TInput aria-label="Large input" size="lg" placeholder="Large" />
                  <TInput aria-label="Invalid input" invalid placeholder="Invalid" />
                  <TInput aria-label="Loading input" loading placeholder="Loading" />
                  <TInput aria-label="Disabled input" disabled model-value="Disabled" />
                </div>
              </div>

              <div :style="panelStyle">
                <p :style="eyebrowStyle">Select family</p>
                <div style="display: grid; gap: 0.75rem;">
                  <TSelect aria-label="Small select" size="sm" placeholder="Small" :options="selectOptions" />
                  <TSelect aria-label="Invalid select" invalid placeholder="Invalid" :options="selectOptions" />
                  <TSelect aria-label="Loading select" loading placeholder="Loading" :options="selectOptions" />
                  <TMultiSelect aria-label="Multi select" placeholder="Teams" :options="richOptions" />
                </div>
              </div>

              <div :style="panelStyle">
                <p :style="eyebrowStyle">Choice controls</p>
                <div style="display: grid; gap: 0.75rem;">
                  <TCheckbox size="sm" :model-value="true">Small</TCheckbox>
                  <TCheckbox size="md" :model-value="true" indeterminate>Indeterminate</TCheckbox>
                  <TCheckbox size="lg" :model-value="false" invalid>Invalid</TCheckbox>
                  <TSwitch size="sm" :model-value="true">Small</TSwitch>
                  <TSwitch size="md" :model-value="false">Off</TSwitch>
                  <TSwitch size="lg" :model-value="true" disabled>Disabled</TSwitch>
                  <TToggleGroup
                    aria-label="Sizes"
                    size="sm"
                    variant="outline"
                    model-value="week"
                    :options="[
                      { label: 'Day', value: 'day' },
                      { label: 'Week', value: 'week' },
                      { label: 'Month', value: 'month' }
                    ]"
                  />
                </div>
              </div>

              <div :style="panelStyle">
                <p :style="eyebrowStyle">Numbers, date, and status</p>
                <div style="display: grid; gap: 0.75rem;">
                  <TNumberInput aria-label="Small number" size="sm" :model-value="2" />
                  <TNumberInput aria-label="Medium number" size="md" :model-value="6" />
                  <TNumberInput aria-label="Large number" size="lg" :model-value="10" />
                  <TDateTimePicker aria-label="Meeting time" size="md" model-value="2026-04-08T14:30" />
                  <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                    <TBadge size="sm">Small</TBadge>
                    <TBadge>Medium</TBadge>
                    <TBadge size="lg">Large</TBadge>
                  </div>
                  <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                    <TAvatar alt="Annie Case" initials="AC" size="sm" />
                    <TAvatar alt="Annie Case" initials="AC" size="md" status="online" />
                    <TAvatar alt="Annie Case" initials="AC" size="lg" status="busy" />
                  </div>
                </div>
              </div>

              <div :style="panelStyle">
                <p :style="eyebrowStyle">Feedback and loaders</p>
                <div style="display: grid; gap: 0.75rem;">
                  <TAlert variant="info" size="sm">Info</TAlert>
                  <TAlert variant="success" size="md">Success</TAlert>
                  <TAlert variant="warning" size="lg">Warning</TAlert>
                  <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <TSpinner size="sm" label="Small spinner" />
                    <TSpinner label="Medium spinner" />
                  </div>
                </div>
              </div>
            </TGrid>
          </section>
        </div>
      </TContainer>
    `,
  }),
};

export const UsageExamples: Story = {
  render: () => ({
    components: {
      TBreadcrumb,
      TBreadcrumbItem,
      TButton,
      TCard,
      TContainer,
      TDivider,
      TEmptyState,
      TFileUpload,
      TFormField,
      TGrid,
      TInput,
      TDateTimePicker,
      TMarkdownEditor,
      TMultiSelect,
      TNavMenu,
      TNavbar,
      TPricing,
      TSelectableList,
      TSelect,
      TSidebar,
      TStack,
      TStat,
      TSteps,
      TSwitch,
      TTab,
      TTabList,
      TTabPanel,
      TTabs,
      TTable,
      TTextarea,
      TTimeline,
      TToggleGroup,
    },
    setup: () => ({
      eyebrowStyle,
      noteStyle,
      navItems,
      pricingPlans,
      selectableItems,
      tableColumns,
      tableRows,
      timelineItems,
      richOptions,
      selectOptions,
      markdownValue: ref(`## Release notes\n\n- Dashboard shell delivered\n- Docs recipes added\n- Release pipeline versioned`),
      shellSection: ref('projects'),
    }),
    template: `
      <TContainer size="xl">
        <div style="display: grid; gap: 2rem;">
          <section style="display: grid; gap: 1rem;">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Examples</p>
              <h1 style="margin: 0; font-size: clamp(1.7rem, 3vw, 2.2rem);">Composed usage examples</h1>
              <p :style="noteStyle">
                These examples show how layout, data, input, navigation, and feedback primitives fit together in product screens.
              </p>
            </div>

            <div style="display: grid; gap: 1rem; padding: 1rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; background: var(--tree-color-bg-surface);">
              <TNavbar bordered elevated>
                <template #start>
                  <strong>Release center</strong>
                </template>
                <template #center>
                  <span style="color: var(--tree-color-text-muted);">Dashboard overview</span>
                </template>
                <template #end>
                  <TButton size="sm" variant="outline">Invite</TButton>
                  <TButton size="sm">Ship release</TButton>
                </template>
              </TNavbar>

              <TBreadcrumb separator="›">
                <TBreadcrumbItem href="/">Home</TBreadcrumbItem>
                <TBreadcrumbItem href="/workspace">Workspace</TBreadcrumbItem>
                <TBreadcrumbItem>Release center</TBreadcrumbItem>
              </TBreadcrumb>

              <TGrid min-item-width="14rem">
                <TStat label="MRR" value="$48.2k" trend="12.4%" tone="success" trend-direction="up" />
                <TStat label="Activation" value="68%" trend="4.1%" tone="info" trend-direction="up" />
                <TStat label="Open incidents" value="7" trend="2 urgent" tone="warning" trend-direction="neutral" />
                <TStat label="Churn risk" value="4.2%" trend="0.8%" tone="danger" trend-direction="down" />
              </TGrid>

              <TDivider />

              <TGrid min-item-width="20rem">
                <TCard>
                  <template #header>
                    <strong>Workspace members</strong>
                  </template>
                  <TTable :columns="tableColumns" :rows="tableRows" size="sm" />
                </TCard>

                <TCard>
                  <template #header>
                    <strong>Release timeline</strong>
                  </template>
                  <TTimeline :items="timelineItems" size="sm" aria-label="Dashboard timeline" />
                </TCard>
              </TGrid>
            </div>
          </section>

          <section style="display: grid; gap: 1rem;">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Example 2</p>
              <h2 style="margin: 0;">Setup form and content workflow</h2>
            </div>

            <TCard>
              <TStack gap="var(--tree-space-5)">
                <TSteps
                  :items="[
                    { value: 'plan', label: 'Plan', status: 'complete' },
                    { value: 'build', label: 'Build', status: 'current' },
                    { value: 'ship', label: 'Ship', status: 'upcoming' }
                  ]"
                  model-value="build"
                />

                <TGrid min-item-width="16rem" gap="var(--tree-space-3)">
                  <TFormField label="Workspace name">
                    <TInput model-value="TreeUI" />
                  </TFormField>

                  <TFormField label="Primary team">
                    <TSelect aria-label="Primary team" :options="selectOptions" model-value="engineering" />
                  </TFormField>

                  <TFormField label="Assigned teams">
                    <TMultiSelect aria-label="Assigned teams" :options="richOptions" :model-value="['design-systems', 'platform']" />
                  </TFormField>

                  <TFormField label="Release window">
                    <TDateTimePicker aria-label="Release window" model-value="2026-04-21T16:30" />
                  </TFormField>

                  <TFormField label="Review cadence">
                    <TToggleGroup
                      aria-label="Review cadence"
                      model-value="week"
                      :options="[
                        { label: 'Day', value: 'day' },
                        { label: 'Week', value: 'week' },
                        { label: 'Month', value: 'month' }
                      ]"
                    />
                  </TFormField>
                </TGrid>

                <TFormField
                  label="Launch notes"
                  hint="Summarize rollout details for support and product."
                >
                  <TTextarea model-value="TreeUI now ships Milestones 1 and 2, docs recipes, and a release-ready version bump." />
                </TFormField>

                <TSwitch :model-value="true">Notify the entire workspace when published</TSwitch>

                <TFileUpload
                  label="Assets"
                  description="Attach screenshots, PDF notes, or supporting files."
                  button-label="Choose files"
                  :multiple="true"
                  accept="image/*,.pdf"
                />

                <TMarkdownEditor
                  size="sm"
                  :model-value="markdownValue"
                  @update:model-value="markdownValue = $event"
                />
              </TStack>
            </TCard>
          </section>

          <section style="display: grid; gap: 1rem;">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Example 3</p>
              <h2 style="margin: 0;">Workspace shell</h2>
            </div>

            <div style="display: grid; grid-template-columns: auto 1fr; min-height: 32rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; overflow: hidden; background: var(--tree-color-bg-surface);">
              <TSidebar width="16rem">
                <template #header>
                  <div style="display: grid; gap: 0.35rem;">
                    <strong>TreeUI</strong>
                    <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                      Documentation workspace
                    </span>
                  </div>
                </template>

                <TNavMenu
                  aria-label="Workspace navigation"
                  :items="navItems"
                  :model-value="shellSection"
                  @update:model-value="shellSection = $event"
                />

                <template #footer>
                  <TButton size="sm" variant="outline">New page</TButton>
                </template>
              </TSidebar>

              <div style="display: grid; gap: 1rem; padding: 1.25rem;">
                <TTabs default-value="draft">
                  <TTabList>
                    <TTab value="draft">Draft</TTab>
                    <TTab value="assets">Assets</TTab>
                  </TTabList>

                  <TTabPanel value="draft">
                    <TGrid min-item-width="18rem" gap="var(--tree-space-4)">
                      <TCard>
                        <template #header>
                          <strong>Outline</strong>
                        </template>
                        <TSelectableList aria-label="Content outline" :items="selectableItems" model-value="launch-brief" />
                      </TCard>

                      <TCard>
                        <template #header>
                          <strong>Editor</strong>
                        </template>
                        <TMarkdownEditor size="sm" model-value="## Draft content&#10;&#10;Start writing here." />
                      </TCard>
                    </TGrid>
                  </TTabPanel>

                  <TTabPanel value="assets">
                    <TEmptyState
                      title="No assets attached"
                      description="Upload release screenshots, diagrams, or PDF notes for reviewers."
                    >
                      <template #actions>
                        <TButton size="sm">Add asset</TButton>
                      </template>
                    </TEmptyState>
                  </TTabPanel>
                </TTabs>
              </div>
            </div>
          </section>

          <section style="display: grid; gap: 1rem;">
            <div style="display: grid; gap: 0.35rem;">
              <p :style="eyebrowStyle">Example 4</p>
              <h2 style="margin: 0;">Plan comparison</h2>
            </div>

            <div style="padding: 1rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem; background: var(--tree-color-bg-surface);">
              <TPricing :plans="pricingPlans" size="sm" />
            </div>
          </section>
        </div>
      </TContainer>
    `,
  }),
};
