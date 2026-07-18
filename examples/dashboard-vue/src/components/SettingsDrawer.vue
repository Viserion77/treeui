<script setup lang="ts">
import { computed } from 'vue';
import {
  TButton,
  TCheckbox,
  TDivider,
  TDrawer,
  TFormField,
  TSelect,
  TStack,
  TToggleGroup,
  useToast,
} from '@treeui/vue';
import type { TCardVariant, TSize } from '@treeui/vue';
import { useDashboardConfig, type ThemeMode } from '../composables/useDashboardConfig';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const { config, reset } = useDashboardConfig();
const toast = useToast();

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
});

const themeOptions: Array<{ label: string; value: ThemeMode }> = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const densityOptions: Array<{ label: string; value: TSize }> = [
  { label: 'Compact', value: 'sm' },
  { label: 'Comfortable', value: 'md' },
  { label: 'Spacious', value: 'lg' },
];

const cardVariantOptions: Array<{ label: string; value: TCardVariant }> = [
  { label: 'Outline', value: 'outline' },
  { label: 'Soft', value: 'soft' },
  { label: 'Solid', value: 'solid' },
  { label: 'Inset', value: 'inset' },
];

const accentPresets = [
  { label: 'Ocean blue', value: '#0969da' },
  { label: 'Forest green', value: '#1a7f37' },
  { label: 'Grape violet', value: '#6d28d9' },
  { label: 'Clay orange', value: '#c2410c' },
  { label: 'Rosewood', value: '#be185d' },
];

const widgetOptions: Array<{ key: keyof typeof config.widgets; label: string }> = [
  { key: 'stats', label: 'Key metrics' },
  { key: 'channels', label: 'Sessions by channel' },
  { key: 'orders', label: 'Latest orders' },
  { key: 'customer', label: 'New customer form' },
  { key: 'alerts', label: 'Alerts' },
  { key: 'activity', label: 'Recent activity' },
];

function restoreDefaults() {
  reset();
  toast.add({
    title: 'Preferences restored',
    description: 'The dashboard is back to its default look.',
    variant: 'info',
  });
}
</script>

<template>
  <TDrawer
    v-model:open="isOpen"
    side="right"
    title="Customize dashboard"
    description="Preferences are saved on this device."
  >
    <TStack gap="var(--tree-space-6)">
      <TFormField
        label="Theme"
        hint="System follows your OS preference."
      >
        <TToggleGroup
          v-model="config.theme"
          aria-label="Theme"
          :options="themeOptions"
          size="sm"
        />
      </TFormField>

      <TFormField label="Accent color">
        <TStack
          direction="horizontal"
          align="center"
          wrap
          gap="var(--tree-space-2)"
        >
          <button
            v-for="preset in accentPresets"
            :key="preset.value"
            type="button"
            class="accent__swatch"
            :class="{ 'is-active': config.accent === preset.value }"
            :style="{ background: preset.value }"
            :aria-label="preset.label"
            :aria-pressed="config.accent === preset.value"
            @click="config.accent = preset.value"
          />
          <input
            v-model="config.accent"
            type="color"
            class="accent__picker"
            aria-label="Custom accent color"
          >
        </TStack>
      </TFormField>

      <TFormField
        label="Density"
        hint="Controls the size of tables, inputs, and buttons."
      >
        <TToggleGroup
          v-model="config.density"
          aria-label="Density"
          :options="densityOptions"
          size="sm"
        />
      </TFormField>

      <TFormField label="Card style">
        <TSelect
          v-model="config.cardVariant"
          aria-label="Card style"
          :options="cardVariantOptions"
          size="sm"
        />
      </TFormField>

      <TDivider />

      <TFormField label="Overview widgets">
        <TStack gap="var(--tree-space-2)">
          <TCheckbox
            v-for="widget in widgetOptions"
            :key="widget.key"
            v-model="config.widgets[widget.key]"
            size="sm"
          >
            {{ widget.label }}
          </TCheckbox>
        </TStack>
      </TFormField>
    </TStack>

    <template #footer>
      <TStack
        direction="horizontal"
        justify="space-between"
        gap="var(--tree-space-3)"
      >
        <TButton
          variant="outline"
          size="sm"
          @click="restoreDefaults"
        >
          Restore defaults
        </TButton>
        <TButton
          size="sm"
          @click="isOpen = false"
        >
          Done
        </TButton>
      </TStack>
    </template>
  </TDrawer>
</template>

<style scoped>
/* Bespoke: styling native color inputs (swatch buttons + <input type="color">)
   is app-specific chrome — not something a general component library owns. */
.accent__swatch {
  width: 28px;
  height: 28px;
  border-radius: var(--tree-radius-full, 999px);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  cursor: pointer;
  padding: 0;
}

.accent__swatch.is-active {
  outline: 2px solid var(--tree-color-brand-primary);
  outline-offset: 2px;
}

.accent__picker {
  width: 36px;
  height: 28px;
  padding: 0;
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-sm, 6px);
  background: var(--tree-color-bg-surface);
  cursor: pointer;
}
</style>
