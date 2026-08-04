<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    /** Fragment pointing at the region to skip to, e.g. `#content`. */
    href?: string;
  }>(),
  {
    href: '#content',
  },
);

// The target is only ever focused programmatically, so it needs `tabindex="-1"`
// to accept focus at all — and it must not paint a focus ring, which would read
// as a stray outline around the whole main region. Both are wired here (the
// data attribute drives the ring rule in the stylesheet) so no consumer has to
// carry a loose `#content:focus { outline: none }`.
const managedTarget = ref<HTMLElement | null>(null);
const addedTabindex = ref(false);

const resolveTarget = (): HTMLElement | null => {
  if (typeof document === 'undefined' || !props.href.startsWith('#')) return null;
  const id = props.href.slice(1);
  if (!id) return null;
  return document.getElementById(id);
};

const releaseTarget = () => {
  const el = managedTarget.value;
  if (!el) return;
  el.removeAttribute('data-tree-skip-target');
  if (addedTabindex.value) el.removeAttribute('tabindex');
  managedTarget.value = null;
  addedTabindex.value = false;
};

const prepareTarget = () => {
  releaseTarget();
  const el = resolveTarget();
  if (!el) return;
  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1');
    addedTabindex.value = true;
  }
  el.setAttribute('data-tree-skip-target', '');
  managedTarget.value = el;
};

// Client-only: there is no document while the HTML is written, and the link
// itself renders on the server either way.
onMounted(prepareTarget);
watch(() => props.href, prepareTarget);
onBeforeUnmount(releaseTarget);

// Some browsers move the visual viewport on a fragment jump without moving
// focus. Focusing explicitly makes the next Tab continue from the target.
const onClick = () => {
  const el = managedTarget.value ?? resolveTarget();
  el?.focus();
};
</script>

<template>
  <a
    class="t-skip-link"
    :href="href"
    @click="onClick"
  >
    <slot />
  </a>
</template>
