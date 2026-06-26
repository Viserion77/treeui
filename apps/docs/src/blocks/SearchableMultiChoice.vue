<script setup lang="ts">
// SearchableMultiChoice block — recipe: searchable-multi-choice
// A labelled, searchable multi-select field where typing matches option
// labels, descriptions, and hidden synonym keywords.
import { ref } from 'vue';
import { TFormField, TMultiSelect } from '@treeui/vue';
import type { TMultiSelectOption } from '@treeui/vue';

const selected = ref<string[]>(['frontend']);

const options: TMultiSelectOption[] = [
  {
    label: 'Frontend',
    value: 'frontend',
    description: 'UI, components, and styling',
    keywords: ['ui', 'web', 'css', 'vue'],
  },
  {
    label: 'Backend',
    value: 'backend',
    description: 'APIs, services, and databases',
    keywords: ['api', 'server', 'database', 'node'],
  },
  {
    label: 'Design',
    value: 'design',
    description: 'Visual and interaction design',
    keywords: ['ux', 'figma', 'tokens'],
  },
  {
    label: 'DevOps',
    value: 'devops',
    description: 'CI/CD, infrastructure, and releases',
    keywords: ['infra', 'ci', 'deploy', 'kubernetes'],
  },
  {
    label: 'QA',
    value: 'qa',
    description: 'Testing and quality assurance',
    keywords: ['testing', 'automation', 'e2e'],
  },
];
</script>

<template>
  <TFormField
    label="Team focus areas"
    html-for="team-focus"
    hint="Search by name or synonym, e.g. type “ci” to find DevOps."
  >
    <TMultiSelect
      id="team-focus"
      v-model="selected"
      :options="options"
      :max-visible-tags="2"
      placeholder="Select focus areas"
      empty-text="No matching areas."
    />
  </TFormField>
</template>
