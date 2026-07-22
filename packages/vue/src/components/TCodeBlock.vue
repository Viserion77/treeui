<script setup lang="ts">
import { computed, ref } from 'vue';
import TIcon from './TIcon.vue';

const props = withDefaults(
  defineProps<{
    /**
     * Code as a string. Rendered as the block content and used by the built-in
     * copy button. Omit and use the default slot for pre-formatted markup.
     */
    code?: string;
    /**
     * Line wrapping. `false` (default) keeps lines intact and scrolls
     * horizontally — right for logs. `true` wraps long lines (`pre-wrap`) — right
     * for JSON.
     */
    wrap?: boolean;
    /** Max height before the block scrolls vertically. Any CSS length. */
    maxBlockSize?: string;
    /** Show the built-in copy button. Requires `code` (nothing to copy from a slot). */
    copyable?: boolean;
    /** Accessible name for the scrollable region and the copy button. */
    label?: string;
  }>(),
  {
    code: undefined,
    wrap: false,
    maxBlockSize: undefined,
    copyable: false,
    label: 'Code',
  },
);

const emit = defineEmits<{
  copy: [text: string];
}>();

const copied = ref(false);
let resetTimer: ReturnType<typeof setTimeout> | undefined;

const showCopy = computed(() => props.copyable && props.code != null);
const hasToolbar = computed(() => showCopy.value);

const preStyle = computed(() =>
  props.maxBlockSize ? { maxBlockSize: props.maxBlockSize } : undefined,
);

const classes = computed(() => ['t-code-block', { 'is-wrap': props.wrap }]);

async function onCopy() {
  if (props.code == null) return;
  try {
    await navigator.clipboard?.writeText(props.code);
    emit('copy', props.code);
    copied.value = true;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Clipboard can reject (permissions, insecure context); leave state as-is.
  }
}
</script>

<template>
  <div :class="classes">
    <div
      v-if="hasToolbar"
      class="t-code-block__toolbar"
    >
      <button
        v-if="showCopy"
        type="button"
        class="t-code-block__copy"
        :aria-label="copied ? 'Copied' : `Copy ${label}`"
        @click="onCopy"
      >
        <TIcon
          :name="copied ? 'check' : 'copy'"
          :size="16"
        />
      </button>
    </div>
    <pre
      class="t-code-block__pre"
      role="region"
      :aria-label="label"
      tabindex="0"
      :style="preStyle"
    ><code class="t-code-block__code"><slot>{{ code }}</slot></code></pre>
  </div>
</template>
