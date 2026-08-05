<script setup lang="ts">
import { TButton, TCheckbox, TConfirmDialog, TInput, TStat, TTag } from '@treeui/vue';
</script>

<template>
  <TTag clickable>a</TTag>
  <TStat label="x" hint="y" />
  <TInput label="x" />
  <TButton variant="destructive">x</TButton>
  <TCheckbox label="x" checkedd />
  <TConfirmDialog :open="false" tone="danger" />
</template>
