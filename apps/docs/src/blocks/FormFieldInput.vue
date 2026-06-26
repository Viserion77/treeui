<script setup lang="ts">
// FormFieldInput — a labelled text field that surfaces validation messaging.
// Implements recipe: form-field-input (TFormField + TInput).
import { computed, ref } from 'vue';
import { TFormField, TInput } from '@treeui/vue';

const fieldId = 'form-field-input-email';

const email = ref('');

const error = computed(() =>
  email.value.length > 0 && !email.value.includes('@')
    ? 'Enter a valid email address.'
    : undefined,
);
</script>

<template>
  <TFormField
    label="Email address"
    :html-for="fieldId"
    :error="error"
    hint="We'll only use this to send account updates."
    required
  >
    <TInput
      :id="fieldId"
      v-model="email"
      type="email"
      placeholder="you@example.com"
      :invalid="!!error"
    />
  </TFormField>
</template>
