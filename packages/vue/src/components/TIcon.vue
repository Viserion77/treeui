<script setup lang="ts">
import { computed } from 'vue';
import { resolveTreeIcon, treeIconDefaults, type TIconName } from '@treeui/icons';

/**
 * The closed half of the `size` axis, mapped to `--tree-size-icon-*`. Sharing
 * the token names with the rest of the library is what makes `size="sm"` mean
 * the same thing here as everywhere else — before this it type-checked, reached
 * the SVG as the literal string `sm`, and rendered a 300px glyph.
 */
export type TIconSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const ICON_SIZE_PX: Record<TIconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

const props = withDefaults(
  defineProps<{
    name: TIconName;
    /**
     * A token name (`sm`…`2xl`, matching `--tree-size-icon-*`) or a pixel
     * number. Deliberately NOT a free string: an unrecognised one used to reach
     * the SVG untouched.
     */
    size?: number | TIconSize;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    label?: string;
  }>(),
  {
    size: treeIconDefaults.size,
    strokeWidth: treeIconDefaults.strokeWidth,
    absoluteStrokeWidth: treeIconDefaults.absoluteStrokeWidth,
    label: undefined,
  },
);

// Resolved per render rather than once at setup, so an icon registered after
// this component mounted still appears.
const iconComponent = computed(() => resolveTreeIcon(props.name));

const resolvedSize = computed(() => {
  const { size } = props;
  if (typeof size === 'number') return size;
  const token = ICON_SIZE_PX[size];
  if (token !== undefined) return token;
  // TypeScript already rejects this; the warning is for JavaScript consumers,
  // who otherwise get a silently enormous glyph.
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[TreeUI] TIcon: unknown size ${JSON.stringify(size)}. ` +
        `Use a number of pixels or one of: ${Object.keys(ICON_SIZE_PX).join(', ')}.`,
    );
  }
  return treeIconDefaults.size;
});
</script>

<template>
  <component
    :is="iconComponent"
    v-if="iconComponent"
    class="t-icon"
    :size="resolvedSize"
    :stroke-width="strokeWidth"
    :absolute-stroke-width="absoluteStrokeWidth"
    :role="label ? 'img' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  />
</template>
