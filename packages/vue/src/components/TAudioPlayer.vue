<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import type { TSize } from '../types/contracts';
import TIcon from './TIcon.vue';

/**
 * Compact audio chip (TREEUX-019): play/pause, duration and seek.
 *
 * `src` is agnostic — the component fetches nothing and knows nothing about
 * where the audio came from. Waveform is deliberately absent: it needs Web
 * Audio analysis and is a much larger surface, and seek without a waveform is
 * the part that was actually missing.
 */
const props = withDefaults(
  defineProps<{
    src: string;
    size?: TSize;
    disabled?: boolean;
    /** Accessible name of the play control. Product copy. */
    playLabel?: string;
    /** Accessible name of the pause control. */
    pauseLabel?: string;
    /** Accessible name of the seek slider. */
    seekLabel?: string;
    /** Preload hint forwarded to the media element. */
    preload?: 'none' | 'metadata' | 'auto';
  }>(),
  {
    size: 'md',
    disabled: false,
    playLabel: 'Play',
    pauseLabel: 'Pause',
    seekLabel: 'Seek',
    preload: 'metadata',
  },
);

const emit = defineEmits<{
  play: [];
  pause: [];
  ended: [];
}>();

const audioRef = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);

const classes = computed(() => [
  't-audio-player',
  `t-audio-player--${props.size}`,
  { 'is-disabled': props.disabled, 'is-playing': isPlaying.value },
]);

/** mm:ss — the only format a voice message needs, and locale-independent. */
const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const elapsedLabel = computed(() => formatTime(currentTime.value));
const durationLabel = computed(() => formatTime(duration.value));

const toggle = () => {
  const audio = audioRef.value;
  if (!audio || props.disabled) return;
  if (audio.paused) void audio.play();
  else audio.pause();
};

const onSeek = (event: Event) => {
  const audio = audioRef.value;
  if (!audio) return;
  audio.currentTime = Number((event.target as HTMLInputElement).value);
};

const onPlay = () => {
  isPlaying.value = true;
  emit('play');
};

const onPause = () => {
  isPlaying.value = false;
  emit('pause');
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  emit('ended');
};

const onTimeUpdate = () => {
  currentTime.value = audioRef.value?.currentTime ?? 0;
};

const onLoadedMetadata = () => {
  const value = audioRef.value?.duration ?? 0;
  // A stream with no known length reports Infinity; showing "Infinity:NaN" is
  // worse than showing nothing.
  duration.value = Number.isFinite(value) ? value : 0;
};

// A new src is a new recording: never carry the previous position into it.
watch(
  () => props.src,
  () => {
    currentTime.value = 0;
    duration.value = 0;
    isPlaying.value = false;
  },
);

onBeforeUnmount(() => {
  audioRef.value?.pause();
});
</script>

<template>
  <div :class="classes">
    <audio
      ref="audioRef"
      class="t-visually-hidden"
      :src="src"
      :preload="preload"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <button
      type="button"
      class="t-audio-player__toggle"
      :disabled="disabled"
      :aria-label="isPlaying ? pauseLabel : playLabel"
      @click="toggle"
    >
      <TIcon
        :name="isPlaying ? 'pause' : 'play'"
        :size="16"
      />
    </button>

    <input
      class="t-audio-player__seek"
      type="range"
      min="0"
      step="0.01"
      :max="duration || 0"
      :value="currentTime"
      :disabled="disabled || !duration"
      :aria-label="seekLabel"
      :aria-valuetext="`${elapsedLabel} / ${durationLabel}`"
      @input="onSeek"
    >

    <span class="t-audio-player__time">
      {{ elapsedLabel }}<span v-if="duration"> / {{ durationLabel }}</span>
    </span>
  </div>
</template>
