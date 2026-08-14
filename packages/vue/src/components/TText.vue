<script setup lang="ts">
import { computed } from 'vue';

const _treeTextSizes = [
  'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl',
  // Responsive marketing steps, three rungs that stay ordered at EVERY width —
  // `display` (hero, 3xl→5xl) > `title` (page/section heading, xl→4xl) >
  // `subtitle` (the heading under one of those, lg→2xl, on a gentler slope).
  // Two rungs sharing a slope collapse into each other on a phone, which is why
  // `subtitle` climbs slower rather than merely capping lower. `overline`
  // (eyebrow) is a closed style — small, semibold, uppercase, wide tracking —
  // that leaves colour to the `tone` axis.
  'display', 'title', 'subtitle', 'overline',
] as const;
// Status tones read the theme's `--tree-color-status-*`. `TText` was the only
// text surface without them, so "this failed" in prose meant writing CSS.
const _treeTextTones = [
  'default', 'muted', 'inverse', 'brand',
  'danger', 'success', 'warning', 'info',
] as const;
const _treeTextWeights = ['regular', 'medium', 'semibold', 'bold'] as const;
const _treeTextFamilies = ['sans', 'mono'] as const;
const _treeTextMeasures = ['headline', 'lead', 'prose'] as const;
const _treeTextWraps = ['anywhere', 'break-word'] as const;
// Logical, not physical: `start`/`end` follow the writing direction, so a
// centred closing section stays centred and an end-aligned figure flips with
// the document instead of stranding itself in RTL.
const _treeTextAligns = ['start', 'center', 'end'] as const;

export type TTextSize = (typeof _treeTextSizes)[number];
export type TTextTone = (typeof _treeTextTones)[number];
export type TTextWeight = (typeof _treeTextWeights)[number];
export type TTextFamily = (typeof _treeTextFamilies)[number];
export type TTextMeasure = (typeof _treeTextMeasures)[number];
export type TTextWrap = (typeof _treeTextWraps)[number];
export type TTextAlign = (typeof _treeTextAligns)[number];

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
     * `headline` (~20ch, a hero or section headline), `lead` (~58ch, hero
     * subtitle) and `prose` (~68ch, body). Closed axis, so every surface caps
     * at the same width without inventing a number.
     */
    measure?: TTextMeasure;
    /**
     * How a string with no break opportunity behaves. An id, ARN, API key or
     * hash is one long word: without this it overflows its box, and `truncate`
     * is the wrong answer when the string IS the thing the reader came to copy.
     * `anywhere` breaks at any character and lets the box shrink;
     * `break-word` only breaks a word that would otherwise overflow.
     * Ignored when `truncate` is set, since the two contradict each other.
     */
    wrap?: TTextWrap;
    /**
     * Even out the line lengths of a short block (`text-wrap: balance`) — for
     * headlines, where a one-word last line reads as a mistake. Browsers that
     * do not support it simply wrap normally.
     */
    balance?: boolean;
    /**
     * How the lines sit inside the box. `TStack align="center"` centres the
     * BOX, which looks centred only while the box is narrow: at full width the
     * paragraph inside it reads left-aligned. This is the other half of that
     * pair, and it renders block, because `text-align` does nothing on an
     * inline box that shrink-wraps its content.
     */
    align?: TTextAlign;
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
    wrap: undefined,
    balance: false,
    align: undefined,
  },
);

const classes = computed(() => [
  't-text',
  props.size ? `t-text--size-${props.size}` : null,
  props.tone !== 'default' ? `t-text--${props.tone}` : null,
  props.weight ? `t-text--weight-${props.weight}` : null,
  props.family ? `t-text--family-${props.family}` : null,
  props.measure ? `t-text--measure-${props.measure}` : null,
  props.wrap && !props.truncate ? `t-text--wrap-${props.wrap}` : null,
  props.align ? `t-text--align-${props.align}` : null,
  {
    'is-truncated': props.truncate,
    'is-pre-wrap': props.preserveWhitespace && !props.truncate,
    'is-balanced': props.balance,
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
