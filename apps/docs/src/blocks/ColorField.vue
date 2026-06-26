<script setup lang="ts">
// ColorField — recipe: color-field
// Wraps a native <input type="color"> with TFormField for label, hint, and error handling.
// There is no dedicated TreeUI color component, so the control is a native input bound with v-model.
import { computed, ref } from 'vue';
import { TFormField } from '@treeui/vue';

const color = ref('#3b82f6');

const error = computed(() =>
  color.value.toLowerCase() === '#ffffff' ? 'Pick a color other than white.' : undefined,
);
</script>

<template>
  <TFormField
    label="Brand color"
    html-for="brand-color"
    hint="Choose the primary color for your theme."
    :error="error"
    required
  >
    <input
      id="brand-color"
      v-model="color"
      type="color"
      required
      :aria-invalid="error ? 'true' : undefined"
    >
  </TFormField>
</template>
