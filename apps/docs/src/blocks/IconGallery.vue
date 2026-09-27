<script setup lang="ts">
// IconGallery block — the browsable catalog behind Components/Data Display/Icon.
//
// A flat list of names is only usable by someone who already knows the name.
// This shows the catalog the way it is actually organised: fifteen subjects,
// each split into families, each family in meaning order — `signal` before its
// four strengths, `chevron` before its four directions. Picking an icon opens a
// drawer with the one thing a consumer leaves with: the line of code.
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
  treeIconAliases,
  treeIconCategories,
  treeIconCategory,
  treeIconCategoryLabels,
  treeIconCategoryOrder,
  treeIconFamilies,
  treeIconFamily,
  type TIconCategory,
  type TIconName,
} from '@treeui/vue';

const catalogSize = treeIconCategoryOrder.reduce(
  (total, id) => total + treeIconCategories[id].length,
  0,
);

/** Synonyms, keyed by the canonical name they point at. */
const synonymsOf = new Map<string, string[]>();

for (const [alias, target] of Object.entries(treeIconAliases)) {
  synonymsOf.set(target, [...(synonymsOf.get(target) ?? []), alias]);
}

const query = ref('');
const category = ref<TIconCategory | 'all'>('all');
const family = ref('all');
const previewSize = ref('24');
const selected = ref<TIconName | undefined>();
const detailSize = ref(48);
const detailStroke = ref(2);
const detailAbsolute = ref(true);

const categoryOptions = [
  { label: `All ${catalogSize}`, value: 'all' as const },
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
 * The families a chosen category offers, as a second filter.
 *
 * Only families with more than one member: a chip that filters 348 icons down
 * to one is a worse way to find that icon than typing its name.
 */
const familyOptions = computed(() => {
  if (category.value === 'all') return [];

  const groups = treeIconFamilies[category.value].filter(
    (entry) => entry.icons.length > 1,
  );

  if (groups.length === 0) return [];

  return [
    { label: 'All', value: 'all' },
    ...groups.map((entry) => ({
      label: `${entry.id} ${entry.icons.length}`,
      value: entry.id,
    })),
  ];
});

// A family chosen inside one category means nothing in the next one.
watch(category, () => {
  family.value = 'all';
});

/** An icon matches on its own name, or on any synonym pointing at it. */
const matches = (name: string, needle: string) =>
  needle === '' ||
  name.includes(needle) ||
  (synonymsOf.get(name) ?? []).some((alias) => alias.includes(needle));

/**
 * Matching icons, kept in their category and family structure.
 *
 * Searching narrows the tree rather than flattening it: "where does this icon
 * live" is part of the answer, and a flat result list throws it away.
 */
const groups = computed(() => {
  const needle = query.value.trim().toLowerCase();
  const wanted =
    category.value === 'all' ? treeIconCategoryOrder : [category.value];

  return wanted
    .map((id) => {
      const visible = treeIconFamilies[id]
        .filter((entry) => family.value === 'all' || entry.id === family.value)
        .map((entry) => ({
          id: entry.id,
          named: entry.icons.length > 1,
          icons: entry.icons.filter((name) => matches(name, needle)),
        }))
        .filter((entry) => entry.icons.length > 0);

      // Icons with no relatives flow together in one unlabelled grid. Giving
      // each its own row — which is what a family of one literally is — turned
      // a category into a column of single cells.
      const standalone = visible
        .filter((entry) => !entry.named)
        .flatMap((entry) => entry.icons);

      return {
        id,
        label: treeIconCategoryLabels[id],
        families: [
          ...(standalone.length > 0
            ? [{ id: '', named: false, icons: standalone }]
            : []),
          ...visible.filter((entry) => entry.named),
        ],
      };
    })
    .filter((group) => group.families.length > 0);
});

const matchCount = computed(() =>
  groups.value.reduce(
    (total, group) =>
      total +
      group.families.reduce((sum, entry) => sum + entry.icons.length, 0),
    0,
  ),
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

/** The other icons in the selected icon's family, for the "see also" row. */
const siblings = computed(() => {
  const name = selected.value;
  const inCategory = selectedCategory.value;

  if (!name || !inCategory) return [];

  const base = treeIconFamily(name);
  const entry = treeIconFamilies[inCategory].find((item) => item.id === base);

  return entry && entry.icons.length > 1 ? entry.icons : [];
});

const synonyms = computed(() =>
  selected.value ? (synonymsOf.get(selected.value) ?? []) : [],
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

  const flat = groups.value.flatMap((group) =>
    group.families.flatMap((entry) => entry.icons),
  );
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
        :placeholder="`Search ${catalogSize} icons by name…`"
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
      class="icon-gallery__chips"
      aria-label="Filter by category"
    />

    <TToggleGroup
      v-if="familyOptions.length > 0"
      v-model="family"
      :options="familyOptions"
      size="sm"
      variant="soft"
      class="icon-gallery__chips icon-gallery__chips--family"
      aria-label="Filter by family"
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
        </header>

        <div
          v-for="entry in group.families"
          :key="`${group.id}:${entry.id}`"
          class="icon-gallery__family"
        >
          <TText
            v-if="entry.named"
            class="icon-gallery__family-name"
            size="xs"
            tone="muted"
            family="mono"
          >
            {{ entry.id }}
          </TText>

          <div class="icon-gallery__grid">
            <button
              v-for="name in entry.icons"
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
            <div class="icon-detail__tags">
              <TTag
                v-if="selectedCategory"
                size="sm"
                tone="accent"
              >
                {{ treeIconCategoryLabels[selectedCategory] }}
              </TTag>
              <TTag
                v-for="alias in synonyms"
                :key="alias"
                size="sm"
                tone="neutral"
              >
                also {{ alias }}
              </TTag>
            </div>
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

          <div
            v-if="siblings.length > 0"
            class="icon-detail__siblings"
          >
            <TText
              size="xs"
              tone="muted"
              family="mono"
            >
              {{ treeIconFamily(selected) }} family
            </TText>
            <div class="icon-detail__sibling-row">
              <button
                v-for="name in siblings"
                :key="name"
                type="button"
                class="icon-detail__sibling"
                :class="{ 'is-selected': name === selected }"
                :aria-pressed="name === selected"
                :title="name"
                @click="selected = name"
              >
                <TIcon
                  :name="name"
                  :size="20"
                />
              </button>
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

.icon-gallery__chips {
  flex-wrap: wrap;
}

/* The family row is a sub-filter of the category above it, and is indented so
   it reads as one, not as a second set of top-level chips. */
.icon-gallery__chips--family {
  margin-inline-start: var(--tree-space-4);
}

.icon-gallery__group {
  display: grid;
  gap: var(--tree-space-3);
}

.icon-gallery__family {
  display: grid;
  gap: var(--tree-space-1);
}

.icon-gallery__family-name {
  padding-inline-start: var(--tree-space-1);
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

.icon-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tree-space-1);
}

.icon-detail__siblings {
  display: grid;
  gap: var(--tree-space-1);
}

.icon-detail__sibling-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tree-space-1);
}

.icon-detail__sibling {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-sm);
  background: var(--tree-color-bg-surface);
  color: var(--tree-color-text-primary);
  cursor: pointer;
}

.icon-detail__sibling:hover {
  background: var(--tree-color-bg-subtle);
}

.icon-detail__sibling:focus-visible {
  outline: var(--tree-focus-ring-width) solid var(--tree-color-border-focus);
  outline-offset: var(--tree-focus-ring-offset);
}

.icon-detail__sibling.is-selected {
  border-color: var(--tree-color-brand-primary);
  background: var(--tree-color-brand-subtle);
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
