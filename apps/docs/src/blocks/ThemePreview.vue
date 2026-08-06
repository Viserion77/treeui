<script setup lang="ts">
/**
 * Theme preview — takes an arbitrary seed and renders the library against it,
 * light and dark, with every contrast pair measured on the page.
 *
 * This is the visual half of Phase 4. `validateTheme` proves a seed is sound in
 * CI; this proves it to a person. The contrast table is not decoration — it is
 * the same `measurements` array the validator returns, so what a designer reads
 * here is exactly what breaks a build.
 */
import { computed } from 'vue';
import {
  createTheme,
  themeDeclarations,
  validateTheme,
  type ColorMode,
} from '@treeui/tokens';
import {
  TAlert,
  TAvatar,
  TBadge,
  TButton,
  TCard,
  TCheckbox,
  TInput,
  TProgress,
  TRadio,
  TSelect,
  TStat,
  TSwitch,
  TTable,
  TTag,
  TTextarea,
} from '@treeui/vue';

const props = withDefaults(
  defineProps<{
    /** The product's brand colour — the one required input. */
    accent?: string;
    /** Optional second voice. */
    accentSecondary?: string;
    /** Optional neutral hue; the grays are tinted toward it, luminance preserved. */
    neutral?: string;
    /** Show every measured pair rather than only the ones near the threshold. */
    showAllPairs?: boolean;
  }>(),
  {
    accent: '#0969da',
    accentSecondary: undefined,
    neutral: undefined,
    showAllPairs: false,
  },
);

const MODES: ColorMode[] = ['light', 'dark'];

const seed = computed(() => ({
  accent: props.accent,
  accentSecondary: props.accentSecondary,
  neutral: props.neutral,
}));

const panels = computed(() =>
  MODES.map((mode) => {
    const color = createTheme(seed.value, mode);
    const result = validateTheme(color, mode, { label: props.accent });

    return {
      mode,
      color,
      result,
      // Applied inline so the preview does not depend on a stylesheet build:
      // the same declarations `createSemanticThemeCss` would emit.
      style: Object.fromEntries(themeDeclarations(color, mode)) as Record<string, string>,
    };
  }),
);

const rows = [
  { plan: 'Starter', seats: '3', spend: '$29', state: 'Active' },
  { plan: 'Growth', seats: '18', spend: '$240', state: 'Active' },
  { plan: 'Scale', seats: '96', spend: '$1,180', state: 'Past due' },
];

const columns = [
  { key: 'plan', label: 'Plan' },
  { key: 'seats', label: 'Seats' },
  { key: 'spend', label: 'Spend' },
  { key: 'state', label: 'Status' },
];

const selectOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Annual', value: 'annual' },
];

const ACTION_VARIANTS = ['solid', 'outline', 'ghost', 'soft'] as const;
/* The tone axis is not identical across components — TBadge has no brand or
   accent tone, and TAlert spells the destructive one `danger`. Each list is the
   component's own union so the preview covers what actually exists. */
const BUTTON_TONES = ['brand', 'accent', 'neutral', 'success', 'warning', 'danger', 'info'] as const;
const BADGE_TONES = ['neutral', 'success', 'warning', 'danger', 'info'] as const;
const TAG_TONES = ['neutral', 'brand', 'accent', 'success', 'warning', 'danger', 'info'] as const;
const ALERT_VARIANTS = ['info', 'success', 'warning', 'danger'] as const;

/** Pairs worth showing first: failures, then anything with under 1:1 of headroom. */
const notableMeasurements = (
  measurements: (typeof panels.value)[number]['result']['measurements'],
) =>
  props.showAllPairs
    ? measurements
    : measurements.filter((m) => !m.passes || m.ratio - m.required < 1);
</script>

<template>
  <div class="theme-preview">
    <section
      v-for="panel in panels"
      :key="panel.mode"
      class="theme-preview__panel"
      :style="panel.style"
      :data-tree-theme="panel.mode"
    >
      <header class="theme-preview__header">
        <h3 class="theme-preview__title">
          {{ panel.mode }}
        </h3>
        <TBadge :tone="panel.result.valid ? 'success' : 'danger'">
          {{
            panel.result.valid
              ? `${panel.result.measurements.length} pairs pass`
              : `${panel.result.errors.length} failing`
          }}
        </TBadge>
      </header>

      <!-- Actions: every variant against every tone, so a seed that breaks one
           combination is visible rather than inferred. -->
      <TCard variant="outline">
        <h4 class="theme-preview__section">
          Actions
        </h4>
        <div
          v-for="tone in BUTTON_TONES"
          :key="tone"
          class="theme-preview__row"
        >
          <span class="theme-preview__label">{{ tone }}</span>
          <TButton
            v-for="variant in ACTION_VARIANTS"
            :key="variant"
            :variant="variant"
            :tone="tone"
            size="sm"
          >
            {{ variant }}
          </TButton>
          <TButton
            variant="solid"
            :tone="tone"
            size="sm"
            disabled
          >
            disabled
          </TButton>
        </div>
      </TCard>

      <TCard variant="outline">
        <h4 class="theme-preview__section">
          Form controls
        </h4>
        <div class="theme-preview__grid">
          <TInput
            model-value="Readable value"
            placeholder="Placeholder"
          />
          <TInput
            model-value=""
            placeholder="Disabled"
            disabled
          />
          <TSelect
            :options="selectOptions"
            model-value="monthly"
          />
          <TTextarea
            model-value="Multi-line content"
            :rows="2"
          />
        </div>
        <div class="theme-preview__row">
          <TCheckbox
            :model-value="true"
            label="Checked"
          />
          <TCheckbox
            :model-value="false"
            label="Disabled"
            disabled
          />
          <TRadio
            :model-value="'a'"
            value="a"
            label="Selected"
          />
          <TSwitch
            :model-value="true"
            label="On"
          />
        </div>
      </TCard>

      <TCard variant="outline">
        <h4 class="theme-preview__section">
          Status
        </h4>
        <TAlert
          v-for="status in ALERT_VARIANTS"
          :key="status"
          :variant="status"
          :title="`${status} alert`"
          class="theme-preview__alert"
        >
          Soft surface, computed ink, and an edge that clears 3:1 on the tint.
        </TAlert>
        <div class="theme-preview__row">
          <TBadge
            v-for="tone in BADGE_TONES"
            :key="tone"
            :tone="tone"
          >
            {{ tone }}
          </TBadge>
        </div>
        <div class="theme-preview__row">
          <TTag
            v-for="tone in TAG_TONES"
            :key="tone"
            :tone="tone"
          >
            {{ tone }}
          </TTag>
        </div>
      </TCard>

      <TCard variant="outline">
        <h4 class="theme-preview__section">
          Surfaces and data
        </h4>
        <div class="theme-preview__row">
          <TStat
            label="Revenue"
            value="$48.2k"
            tone="success"
          />
          <TStat
            label="Churn"
            value="2.1%"
            tone="danger"
          />
          <TAvatar
            initials="AL"
            alt="Ada Lovelace"
          />
        </div>
        <TProgress :value="62" />
        <TTable
          :columns="columns"
          :rows="rows"
        />
      </TCard>

      <!-- Contrast, visible. Every row is a pair the library actually renders;
           the ratio is the measured one, not a target. -->
      <TCard variant="outline">
        <h4 class="theme-preview__section">
          Contrast — {{ notableMeasurements(panel.result.measurements).length }} of
          {{ panel.result.measurements.length }} pairs shown
        </h4>
        <table class="theme-preview__contrast">
          <thead>
            <tr>
              <th scope="col">
                Pair
              </th>
              <th scope="col">
                Where
              </th>
              <th scope="col">
                Ratio
              </th>
              <th scope="col">
                Needs
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pair in notableMeasurements(panel.result.measurements)"
              :key="`${pair.foreground}|${pair.background}`"
              :class="{ 'is-failing': !pair.passes }"
            >
              <td>
                <span
                  class="theme-preview__chip"
                  :style="{
                    background: `var(--tree-color-${pair.background.replace('.', '-')})`,
                    color: `var(--tree-color-${pair.foreground.replace('.', '-')})`,
                  }"
                >Aa</span>
                {{ pair.foreground }} on {{ pair.background }}
              </td>
              <td>{{ pair.where }}</td>
              <td class="theme-preview__ratio">
                {{ pair.ratio.toFixed(2) }}:1
              </td>
              <td class="theme-preview__ratio">
                {{ pair.required }}:1
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!panel.result.valid"
          class="theme-preview__errors"
        >
          <strong>This seed does not pass.</strong> In CI, `assertThemeValid` throws with
          exactly these lines.
        </p>
      </TCard>
    </section>
  </div>
</template>

<style scoped>
.theme-preview {
  display: grid;
  gap: var(--tree-space-6);
  grid-template-columns: repeat(auto-fit, minmax(28rem, 1fr));
}

/* Each panel carries its own generated theme, so light and dark render side by
   side on one page instead of behind a toggle. */
.theme-preview__panel {
  display: grid;
  gap: var(--tree-space-4);
  align-content: start;
  padding: var(--tree-space-4);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-lg);
  background: var(--tree-color-bg-primary);
  color: var(--tree-color-text-primary);
}

.theme-preview__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-3);
}

.theme-preview__title {
  margin: 0;
  font-size: var(--tree-font-size-lg);
  text-transform: capitalize;
}

.theme-preview__section {
  margin: 0 0 var(--tree-space-3);
  font-size: var(--tree-font-size-sm);
  font-weight: var(--tree-font-weight-semibold);
  color: var(--tree-color-text-muted);
  text-transform: uppercase;
  letter-spacing: var(--tree-font-tracking-wide);
}

.theme-preview__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tree-space-2);
  margin-block-end: var(--tree-space-3);
}

.theme-preview__label {
  min-width: 4.5rem;
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
}

.theme-preview__grid {
  display: grid;
  gap: var(--tree-space-3);
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  margin-block-end: var(--tree-space-3);
}

.theme-preview__alert {
  margin-block-end: var(--tree-space-2);
}

.theme-preview__contrast {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--tree-font-size-xs);
}

.theme-preview__contrast th,
.theme-preview__contrast td {
  padding: var(--tree-space-1) var(--tree-space-2);
  border-block-end: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  text-align: start;
  vertical-align: middle;
}

.theme-preview__contrast th {
  color: var(--tree-color-text-muted);
  font-weight: var(--tree-font-weight-medium);
}

.theme-preview__contrast tr.is-failing td {
  background: var(--tree-color-status-error-soft);
  color: var(--tree-color-status-error-on-soft);
}

.theme-preview__ratio {
  font-family: var(--tree-font-family-mono);
  white-space: nowrap;
}

/* The swatch renders the pair itself, so a number and the thing it describes
   are never separated. */
.theme-preview__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0 var(--tree-space-1);
  margin-inline-end: var(--tree-space-1);
  border-radius: var(--tree-radius-sm);
  font-weight: var(--tree-font-weight-semibold);
}

.theme-preview__errors {
  margin: var(--tree-space-3) 0 0;
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-status-error);
}
</style>
