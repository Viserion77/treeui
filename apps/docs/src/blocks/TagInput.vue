<script setup lang="ts">
// TagInput — a tag/chip input field built from TreeUI primitives.
// Implements recipe: tag-input
// Type a value and press Enter (or comma) to add a removable tag.
import { ref } from 'vue';
import { TFormField, TInput, TTag, TStack } from '@treeui/vue';

const draft = ref('');
const tags = ref<string[]>(['design', 'frontend']);

function addTag() {
  const value = draft.value.trim();
  if (value && !tags.value.includes(value)) {
    tags.value.push(value);
  }
  draft.value = '';
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    addTag();
  }
}

function removeTag(tag: string) {
  tags.value = tags.value.filter((item) => item !== tag);
}
</script>

<template>
  <TFormField
    label="Tags"
    html-for="tag-input"
    hint="Press Enter or comma to add a tag."
  >
    <TStack gap="var(--tree-space-2)">
      <TInput
        id="tag-input"
        v-model="draft"
        placeholder="Add a tag…"
        aria-label="Add a tag"
        @keydown="onKeydown"
      />
      <TStack
        v-if="tags.length"
        direction="horizontal"
        gap="var(--tree-space-2)"
        wrap
      >
        <TTag
          v-for="tag in tags"
          :key="tag"
          removable
          @remove="removeTag(tag)"
        >
          {{ tag }}
        </TTag>
      </TStack>
    </TStack>
  </TFormField>
</template>
