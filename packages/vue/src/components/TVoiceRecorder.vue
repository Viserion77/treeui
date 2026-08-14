<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

export type TVoiceRecorderState = 'idle' | 'recording' | 'preview';

/**
 * Voice-recorder states.
 *
 * The library owns the STATES — the pulse, the mm:ss timer, the cap, and the
 * accessible names — not the capture. `MediaRecorder`/`getUserMedia` and the
 * upload stay with the product: they need permissions, error handling and a
 * transport policy that no design system should have an opinion about.
 *
 * The pulse is frozen under `prefers-reduced-motion` BY DEFAULT, not as an
 * opt-in. A recording indicator is exactly the kind of永-running animation that
 * makes people ill, and it runs for as long as someone is talking.
 */
const props = withDefaults(
  defineProps<{
    /** Controlled state. Leave unset to let the component track it internally. */
    state?: TVoiceRecorderState;
    /** Seconds elapsed. The product owns the clock — it owns the recorder. */
    elapsed?: number;
    /** Hard stop, in seconds. Reaching it emits `cap-reached`. */
    maxDuration?: number;
    size?: TSize;
    disabled?: boolean;
    recordLabel?: string;
    stopLabel?: string;
    discardLabel?: string;
    /** Announced live while recording, e.g. "Gravando". */
    recordingLabel?: string;
  }>(),
  {
    state: 'idle',
    elapsed: 0,
    maxDuration: undefined,
    size: 'md',
    disabled: false,
    recordLabel: 'Record',
    stopLabel: 'Stop',
    discardLabel: 'Discard',
    recordingLabel: 'Recording',
  },
);

const emit = defineEmits<{
  record: [];
  stop: [];
  discard: [];
  /** `maxDuration` was reached. The product stops the actual recorder. */
  'cap-reached': [];
}>();

defineSlots<{
  /** Preview of the captured audio — typically a TAudioPlayer. */
  preview?: () => unknown;
}>();

const classes = computed(() => [
  't-voice-recorder',
  `t-voice-recorder--${props.size}`,
  `is-${props.state}`,
  { 'is-disabled': props.disabled },
]);

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const timer = computed(() => formatTime(props.elapsed));

const remaining = computed(() =>
  props.maxDuration ? Math.max(0, props.maxDuration - props.elapsed) : null,
);

let capped = false;

watch(
  () => [props.elapsed, props.maxDuration, props.state] as const,
  ([elapsed, max, state]) => {
    if (state !== 'recording' || !max) {
      capped = false;
      return;
    }
    // Emit once per recording, not once per tick past the cap.
    if (!capped && elapsed >= max) {
      capped = true;
      emit('cap-reached');
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  capped = false;
});
</script>

<template>
  <div :class="classes">
    <button
      v-if="state === 'idle'"
      type="button"
      class="t-voice-recorder__control"
      :disabled="disabled"
      :aria-label="recordLabel"
      @click="emit('record')"
    >
      <TIcon
        name="mic"
        :size="18"
      />
    </button>

    <template v-else-if="state === 'recording'">
      <!--
        `aria-live="polite"` on the timer, not on the dot: announcing every
        second would flood a screen reader. The dot is decorative and the label
        carries the meaning.
      -->
      <span
        class="t-voice-recorder__pulse"
        aria-hidden="true"
      />
      <span class="t-voice-recorder__status">{{ recordingLabel }}</span>
      <span
        class="t-voice-recorder__timer"
        aria-live="polite"
      >{{ timer }}<template v-if="remaining !== null"> / {{ formatTime(maxDuration ?? 0) }}</template></span>
      <button
        type="button"
        class="t-voice-recorder__control"
        :disabled="disabled"
        :aria-label="stopLabel"
        @click="emit('stop')"
      >
        <TIcon
          name="square"
          :size="16"
        />
      </button>
    </template>

    <template v-else>
      <slot name="preview" />
      <button
        type="button"
        class="t-voice-recorder__control"
        :disabled="disabled"
        :aria-label="discardLabel"
        @click="emit('discard')"
      >
        <TIcon
          name="trash-2"
          :size="16"
        />
      </button>
    </template>
  </div>
</template>
