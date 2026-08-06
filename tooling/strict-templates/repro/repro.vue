<script setup lang="ts">
import { ref } from 'vue';
import { TInput, TTabs } from '@treeui/vue';

const a = ref(3100);
const b = ref(3100);
const c = ref<'x' | 'y'>('x');
const ok = ref('');
</script>

<template>
  <TInput v-model="a" />
  <TInput v-model.number="b" type="number" />
  <TTabs v-model="c" />
  <TInput v-model="ok" />
</template>
