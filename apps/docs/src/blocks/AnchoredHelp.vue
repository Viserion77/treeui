<script setup lang="ts">
// AnchoredHelp — implements recipe "anchored-help".
// Shows the help-affordance escalation path: a TTooltip for short, non-interactive
// hints, and a TPopover when the help content needs to be interactive.
import { ref } from 'vue';
import { TStack, TTooltip, TPopover, TButton } from '@treeui/vue';

const popoverOpen = ref(false);

const dismiss = () => {
  popoverOpen.value = false;
};
</script>

<template>
  <TStack
    direction="horizontal"
    gap="2rem"
    align="flex-start"
  >
    <!-- Short, non-interactive help: a tooltip on hover/focus. -->
    <TStack gap="0.5rem">
      <span class="anchored-help__label">Tooltip</span>
      <TTooltip
        content="We email you a receipt for every successful payment."
        side="bottom"
      >
        <template #trigger>
          <TButton variant="ghost">
            What is a receipt?
          </TButton>
        </template>
      </TTooltip>
    </TStack>

    <!-- Interactive help: escalate to a popover with focusable content. -->
    <TStack gap="0.5rem">
      <span class="anchored-help__label">Popover</span>
      <TPopover
        v-model:open="popoverOpen"
        side="bottom"
        align="start"
      >
        <template #trigger="{ isOpen }">
          <TButton
            variant="outline"
            :aria-expanded="isOpen"
          >
            Need help?
          </TButton>
        </template>
        <TStack
          gap="0.75rem"
          class="anchored-help__panel"
        >
          <strong>Contact support</strong>
          <p class="anchored-help__text">
            Our team usually replies within one business day. Start a conversation
            and we will pick it up from there.
          </p>
          <TStack
            direction="horizontal"
            gap="0.5rem"
            justify="flex-end"
          >
            <TButton
              variant="ghost"
              size="sm"
              @click="dismiss"
            >
              Not now
            </TButton>
            <TButton
              variant="solid"
              size="sm"
              @click="dismiss"
            >
              Start chat
            </TButton>
          </TStack>
        </TStack>
      </TPopover>
    </TStack>
  </TStack>
</template>

<style scoped>
.anchored-help__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

.anchored-help__panel {
  min-width: 16rem;
  padding: 0.25rem;
}

.anchored-help__text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>
