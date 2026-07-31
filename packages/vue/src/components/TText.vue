<script setup lang="ts">
import { computed } from 'vue';

const _treeTextSizes = [
  'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl',
  // Responsive marketing steps: `display` (hero) clamps 3xl→5xl; `overline`
  // (eyebrow) is a closed style — small, semibold, uppercase, wide tracking —
  // that leaves colour to the `tone` axis.
  'display', 'overline',
] as const;
const _treeTextTones = ['default', 'muted', 'inverse', 'brand'] as const;
const _treeTextWeights = ['regular', 'medium', 'semibold', 'bold'] as const;
const _treeTextFamilies = ['sans', 'mono'] as const;
const _treeTextMeasures = ['lead', 'prose'] as const;

export type TTextSize = (typeof _treeTextSizes)[number];
export type TTextTone = (typeof _treeTextTones)[number];
export type TTextWeight = (typeof _treeTextWeights)[number];
export type TTextFamily = (typeof _treeTextFamilies)[number];
export type TTextMeasure = (typeof _treeTextMeasures)[number];

const props = withDefaults(
  defineProps<{
    /** Element to render. Defaults to `span`; use `p`, `h1`–`h6`, `label`, … */
    as?: string;
    size?: TTextSize;
    tone?: TTextTone;
    weight?: TTextWeight;
    /**
     * Font family. Omitted = inherit. `mono` maps to `--tree-font-family-mono`
     * for inline code, IDs, ARNs and other machine text, so consumers never
     * hardcode a monospace stack.
     */
    family?: TTextFamily;
    /** Truncate to a single line with an ellipsis. */
    truncate?: boolean;
    /**
     * Preserve authored line breaks and paragraph spacing (`white-space: pre-wrap`)
     * while still wrapping long lines. Use for plain-text output such as AI
     * responses. Ignored when `truncate` is set, since the two conflict.
     */
    preserveWhitespace?: boolean;
    /**
     * Reading measure — a max-width in `ch` for legibility (renders block).
     * `lead` (~58ch, hero subtitle) and `prose` (~68ch, body). Closed axis, so
     * every surface caps at the same width without inventing a number.
     */
    measure?: TTextMeasure;
  }>(),
  {
    as: 'span',
    size: undefined,
    tone: 'default',
    weight: undefined,
    family: undefined,
    truncate: false,
    preserveWhitespace: false,
    measure: undefined,
  },
);

const classes = computed(() => [
  't-text',
  props.size ? `t-text--size-${props.size}` : null,
  props.tone !== 'default' ? `t-text--${props.tone}` : null,
  props.weight ? `t-text--weight-${props.weight}` : null,
  props.family ? `t-text--family-${props.family}` : null,
  props.measure ? `t-text--measure-${props.measure}` : null,
  {
    'is-truncated': props.truncate,
    'is-pre-wrap': props.preserveWhitespace && !props.truncate,
  },
]);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <slot />
  </component>
</template>
