<script setup lang="ts">
// IconGallery block — the browsable catalog behind Components/Data Display/Icon.
//
// A flat grid of 365 names is a list you can only use if you already know what
// you are looking for. This groups by subject, filters by name, and opens a
// bottom drawer with the one thing a consumer actually leaves with: the line of
// code that renders the icon they picked.
//
// Built entirely from TreeUI components, so the gallery is also a working
// example of the library documenting itself.
import { computed, ref, watch } from 'vue';
import {
  TButton,
  TCodeBlock,
  TDrawer,
  TEmptyState,
  TIcon,
  TInput,
  TSwitch,
  TTag,
  TText,
  TToggleGroup,
  listTreeIcons,
  treeIconCategories,
  treeIconCategory,
  treeIconCategoryLabels,
  treeIconCategoryOrder,
  type TIconCategory,
  type TIconName,
} from '@treeui/vue';

const allNames = listTreeIcons();

const query = ref('');
const category = ref<TIconCategory | 'all'>('all');
const previewSize = ref('24');
const selected = ref<TIconName | undefined>();
const detailSize = ref(48);
const detailStroke = ref(2);
const detailAbsolute = ref(true);

const categoryOptions = [
  { label: `All ${allNames.length}`, value: 'all' as const },
  ...treeIconCategoryOrder.map((id) => ({
    label: `${treeIconCategoryLabels[id]} ${treeIconCategories[id].length}`,
    value: id,
  })),
];

const sizeOptions = [
  { label: 'S', value: '16' },
  { label: 'M', value: '24' },
  { label: 'L', value: '32' },
];

/**
 * Groups matching icons under their category heading.
 *
 * Searching keeps the grouping rather than flattening: "where does this icon
 * live" is part of the answer, and a flat result list throws it away.
 */
const groups = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const wanted =
    category.value === 'all' ? treeIconCategoryOrder : [category.value];

  return wanted
    .map((id) => ({
      id,
      label: treeIconCategoryLabels[id],
      icons: treeIconCategories[id].filter(
        (name) =>
          needle === '' ||
          name.includes(needle) ||
          treeIconCategoryLabels[id].toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.icons.length > 0);
});

const matchCount = computed(() =>
  groups.value.reduce((total, group) => total + group.icons.length, 0),
);

const open = computed({
  get: () => selected.value !== undefined,
  set: (value: boolean) => {
    if (!value) selected.value = undefined;
  },
});

const selectedCategory = computed(() =>
  selected.value ? treeIconCategory(selected.value) : undefined,
);

// Each visit starts from the defaults, so the panel always shows what a
// consumer gets from `<TIcon name="…" />` before they change anything.
watch(selected, (name) => {
  if (!name) return;

  detailSize.value = 48;
  detailStroke.value = 2;
  detailAbsolute.value = true;
});

const snippet = computed(() => {
  const name = selected.value;

  if (!name) return '';

  const attrs = [`name="${name}"`];

  if (detailSize.value !== 20) attrs.push(`:size="${detailSize.value}"`);
  if (detailStroke.value !== 2) attrs.push(`:stroke-width="${detailStroke.value}"`);
  if (!detailAbsolute.value) attrs.push(':absolute-stroke-width="false"');

  return `<TIcon ${attrs.join(' ')} />`;
});

const importSnippet = "import { TIcon } from '@treeui/vue';";

const move = (offset: number) => {
  if (!selected.value) return;

  const flat = groups.value.flatMap((group) => group.icons);
  const at = flat.indexOf(selected.value);

  if (at === -1) return;

  selected.value = flat[(at + offset + flat.length) % flat.length];
};
</script>

<template>
  <div class="icon-gallery">
    <div class="icon-gallery__toolbar">
      <TInput
        v-model="query"
        class="icon-gallery__search"
        type="search"
        placeholder="Search 365 icons by name…"
        width="md"
        aria-label="Search icons by name"
      >
        <template #prefix>
          <TIcon
            name="search"
            :size="16"
          />
        </template>
      </TInput>

      <TToggleGroup
        v-model="previewSize"
        :options="sizeOptions"
        size="sm"
        aria-label="Preview size"
      />
    </div>

    <TToggleGroup
      v-model="category"
      :options="categoryOptions"
      size="sm"
      variant="soft"
      class="icon-gallery__categories"
      aria-label="Filter by category"
    />

    <TEmptyState
      v-if="matchCount === 0"
      title="No icon matches that name"
      :description="`Nothing in the catalog contains “${query}”. Icon names are descriptive kebab-case — try a shorter word, like “file” or “user”.`"
    >
      <template #icon>
        <TIcon
          name="search-x"
          :size="32"
        />
      </template>
      <template #actions>
        <TButton
          variant="outline"
          @click="query = ''"
        >
          Clear search
        </TButton>
      </template>
    </TEmptyState>

    <template v-else>
      <section
        v-for="group in groups"
        :key="group.id"
        class="icon-gallery__group"
      >
        <header class="icon-gallery__group-head">
          <TText
            as="h3"
            size="sm"
            weight="semibold"
          >
            {{ group.label }}
          </TText>
          <TTag
            size="sm"
            tone="neutral"
          >
            {{ group.icons.length }}
          </TTag>
        </header>

        <div class="icon-gallery__grid">
          <button
            v-for="name in group.icons"
            :key="name"
            type="button"
            class="icon-gallery__cell"
            :class="{ 'is-selected': name === selected }"
            :aria-pressed="name === selected"
            @click="selected = name"
          >
            <TIcon
              :name="name"
              :size="Number(previewSize)"
            />
            <span class="icon-gallery__name">{{ name }}</span>
          </button>
        </div>
      </section>
    </template>

    <TDrawer
      v-model:open="open"
      side="bottom"
      size="lg"
      :title="selected ?? ''"
      description="Every icon renders from the same registry, at any size, in currentColor."
    >
      <div
        v-if="selected"
        class="icon-detail"
      >
        <div class="icon-detail__preview">
          <div class="icon-detail__stage">
            <TIcon
              :name="selected"
              :size="detailSize"
              :stroke-width="detailStroke"
              :absolute-stroke-width="detailAbsolute"
            />
          </div>
          <div class="icon-detail__sizes">
            <div
              v-for="step in [16, 20, 24, 32]"
              :key="step"
              class="icon-detail__step"
            >
              <TIcon
                :name="selected"
                :size="step"
              />
              <TText
                size="xs"
                tone="muted"
                family="mono"
              >
                {{ step }}
              </TText>
            </div>
          </div>
        </div>

        <div class="icon-detail__controls">
          <div class="icon-detail__meta">
            <TTag
              v-if="selectedCategory"
              size="sm"
              tone="accent"
            >
              {{ treeIconCategoryLabels[selectedCategory] }}
            </TTag>
            <div class="icon-detail__nav">
              <TButton
                variant="soft"
                size="sm"
                aria-label="Previous icon"
                @click="move(-1)"
              >
                <template #icon>
                  <TIcon
                    name="chevron-left"
                    :size="16"
                  />
                </template>
              </TButton>
              <TButton
                variant="soft"
                size="sm"
                aria-label="Next icon"
                @click="move(1)"
              >
                <template #icon>
                  <TIcon
                    name="chevron-right"
                    :size="16"
                  />
                </template>
              </TButton>
            </div>
          </div>

          <label class="icon-detail__field">
            <TText
              size="xs"
              tone="muted"
              family="mono"
            >size {{ detailSize }}</TText>
            <input
              v-model.number="detailSize"
              type="range"
              min="12"
              max="96"
              step="2"
            >
          </label>

          <label class="icon-detail__field">
            <TText
              size="xs"
              tone="muted"
              family="mono"
            >
              strokeWidth {{ detailStroke }}
            </TText>
            <input
              v-model.number="detailStroke"
              type="range"
              min="1"
              max="3"
              step="0.25"
            >
          </label>

          <TSwitch v-model="detailAbsolute">
            <TText
              size="xs"
              tone="muted"
              family="mono"
            >
              absoluteStrokeWidth
            </TText>
          </TSwitch>

          <TCodeBlock
            :code="importSnippet"
            copyable
            label="Import"
          />
          <TCodeBlock
            :code="snippet"
            copyable
            label="Usage"
            wrap
          />
        </div>
      </div>
    </TDrawer>
  </div>
</template>

<style scoped>
.icon-gallery {
  display: grid;
  gap: var(--tree-space-4);
}

.icon-gallery__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-3);
  position: sticky;
  top: 0;
  z-index: 1;
  padding-block: var(--tree-space-2);
  background: var(--tree-color-bg-primary);
}

.icon-gallery__search {
  flex: 1 1 16rem;
}

.icon-gallery__categories {
  flex-wrap: wrap;
}

.icon-gallery__group {
  display: grid;
  gap: var(--tree-space-2);
}

.icon-gallery__group-head {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
  padding-block-start: var(--tree-space-2);
}

.icon-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
  gap: var(--tree-space-2);
}

.icon-gallery__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--tree-space-2);
  min-height: 5.5rem;
  padding: var(--tree-space-3) var(--tree-space-2);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-md);
  background: var(--tree-color-bg-surface);
  color: var(--tree-color-text-primary);
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--tree-motion-duration-fast) var(--tree-motion-easing-standard),
    border-color var(--tree-motion-duration-fast) var(--tree-motion-easing-standard);
}

.icon-gallery__cell:hover {
  background: var(--tree-color-bg-subtle);
  border-color: var(--tree-color-border-strong);
}

.icon-gallery__cell:focus-visible {
  outline: var(--tree-focus-ring-width) solid var(--tree-color-border-focus);
  outline-offset: var(--tree-focus-ring-offset);
}

.icon-gallery__cell.is-selected {
  border-color: var(--tree-color-brand-primary);
  background: var(--tree-color-brand-subtle);
}

.icon-gallery__name {
  font-family: var(--tree-font-family-mono);
  font-size: var(--tree-font-size-xs);
  line-height: var(--tree-font-lineHeight-tight);
  color: var(--tree-color-text-muted);
  text-align: center;
  overflow-wrap: anywhere;
}

.icon-detail {
  display: grid;
  gap: var(--tree-space-6);
  align-items: start;
  grid-template-columns: minmax(0, 1fr);
}

@media (min-width: 48rem) {
  .icon-detail {
    grid-template-columns: minmax(0, 18rem) minmax(0, 1fr);
  }
}

.icon-detail__preview {
  display: grid;
  gap: var(--tree-space-4);
  justify-items: center;
}

.icon-detail__stage {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 8rem;
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-lg);
  background: var(--tree-color-bg-subtle);
}

.icon-detail__sizes {
  display: flex;
  align-items: flex-end;
  gap: var(--tree-space-4);
}

.icon-detail__step {
  display: grid;
  justify-items: center;
  gap: var(--tree-space-1);
}

.icon-detail__controls {
  display: grid;
  gap: var(--tree-space-3);
  align-content: start;
}

.icon-detail__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-2);
}

.icon-detail__nav {
  display: flex;
  gap: var(--tree-space-1);
}

.icon-detail__field {
  display: grid;
  gap: var(--tree-space-1);
}

.icon-detail__field input[type='range'] {
  width: 100%;
  accent-color: var(--tree-color-brand-primary);
}
</style>
