<script setup lang="ts">
import { computed } from 'vue';

const _treeTextSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const _treeTextTones = ['default', 'muted', 'inverse', 'brand'] as const;
const _treeTextWeights = ['regular', 'medium', 'semibold', 'bold'] as const;

export type TTextSize = (typeof _treeTextSizes)[number];
export type TTextTone = (typeof _treeTextTones)[number];
export type TTextWeight = (typeof _treeTextWeights)[number];

const props = withDefaults(
  defineProps<{
    /** Element to render. Defaults to `span`; use `p`, `h1`–`h6`, `label`, … */
    as?: string;
    size?: TTextSize;
    tone?: TTextTone;
    weight?: TTextWeight;
    /** Truncate to a single line with an ellipsis. */
    truncate?: boolean;
    /**
     * Preserve authored line breaks and paragraph spacing (`white-space: pre-wrap`)
     * while still wrapping long lines. Use for plain-text output such as AI
     * responses. Ignored when `truncate` is set, since the two conflict.
     */
    preserveWhitespace?: boolean;
  }>(),
  {
    as: 'span',
    size: undefined,
    tone: 'default',
    weight: undefined,
    truncate: false,
    preserveWhitespace: false,
  },
);

const classes = computed(() => [
  't-text',
  props.size ? `t-text--size-${props.size}` : null,
  props.tone !== 'default' ? `t-text--${props.tone}` : null,
  props.weight ? `t-text--weight-${props.weight}` : null,
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
