<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { TSize } from '../types/contracts';

/**
 * Flags are requested from the CDN's fixed-height endpoints, which serve the
 * flat artwork at each flag's true proportions — Nepal stays a pennant and
 * Switzerland stays square. The CDN's 4:3 endpoints would normalise every ratio,
 * but only by switching to the waving artwork, which reads as decoration next to
 * flat UI icons. A common height is what actually aligns a column of flags; the
 * varying widths are absorbed by the fixed box in CSS.
 *
 * Each step's retina asset is at least twice its box height so 2x screens never
 * upscale.
 */
const FLAG_ASSETS: Record<TSize, { base: string; retina: string }> = {
  sm: { base: 'h20', retina: 'h40' },
  md: { base: 'h20', retina: 'h40' },
  lg: { base: 'h24', retina: 'h60' },
};

const props = withDefaults(
  defineProps<{
    /** ISO 3166-1 alpha-2 country code. Case-insensitive. */
    code: string;
    /** Origin serving the flag assets. Point at a mirror to self-host. */
    baseUrl?: string;
    size?: TSize;
    /** Set to expose the flag to assistive tech; omit to keep it decorative. */
    label?: string;
    /** Text shown when the image cannot load. Defaults to the uppercased code. */
    fallbackText?: string;
  }>(),
  {
    baseUrl: 'https://flagcdn.com',
    size: 'md',
    label: undefined,
    fallbackText: undefined,
  },
);

const classes = computed(() => [
  't-flag',
  `t-flag--${props.size}`,
]);

const normalizedCode = computed(() => props.code.trim().toLowerCase());

// A JS consumer can hand us a size outside the union; fall back rather than
// throwing on an undefined lookup.
const assets = computed(() => FLAG_ASSETS[props.size] ?? FLAG_ASSETS.md);

// Tolerate a baseUrl written with a trailing slash so a self-hosted mirror does
// not silently produce a double-slashed path.
const origin = computed(() => props.baseUrl.replace(/\/+$/, ''));

const src = computed(
  () => `${origin.value}/${assets.value.base}/${normalizedCode.value}.png`,
);

const srcset = computed(
  () => `${origin.value}/${assets.value.retina}/${normalizedCode.value}.png 2x`,
);

const resolvedFallback = computed(
  () => props.fallbackText ?? normalizedCode.value.toUpperCase(),
);

const failed = ref(false);

// A new source deserves a fresh attempt — otherwise one bad code would leave the
// component stuck on the fallback for every later flag.
watch(src, () => {
  failed.value = false;
});

const onError = () => {
  failed.value = true;
};
</script>

<template>
  <span
    :class="classes"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <img
      v-if="!failed"
      :src="src"
      :srcset="srcset"
      alt=""
      class="t-flag__image"
      @error="onError"
    >
    <!--
      Flags come from a third-party origin, so the request can fail offline or
      behind a strict img-src policy. Showing the country code keeps the control
      legible instead of collapsing it to an empty box.
    -->
    <span
      v-else
      class="t-flag__fallback"
    >
      {{ resolvedFallback }}
    </span>
  </span>
</template>
