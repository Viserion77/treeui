<script setup lang="ts">
// ConfirmDestructiveAction — destructive confirmation flow recipe.
// Implements recipe id: confirm-destructive-action
// A danger TButton opens a TConfirmDialog; confirming fires a success TToast.
import { ref } from 'vue';
import { TButton, TConfirmDialog, useToast } from '@treeui/vue';

const toast = useToast();

const projectName = ref('Acme marketing site');
const deleted = ref(false);

function handleConfirm() {
  deleted.value = true;
  toast.add({
    title: 'Project deleted',
    description: `“${projectName.value}” was permanently removed.`,
    variant: 'success',
  });
}
</script>

<template>
  <TConfirmDialog
    title="Delete project"
    :description="`This permanently deletes “${projectName}” and all of its data. This action cannot be undone.`"
    confirm-label="Delete project"
    cancel-label="Keep project"
    :disabled="deleted"
    @confirm="handleConfirm"
  >
    <template #trigger>
      <TButton
        variant="danger"
        :disabled="deleted"
      >
        {{ deleted ? 'Project deleted' : 'Delete project' }}
      </TButton>
    </template>
  </TConfirmDialog>
</template>
