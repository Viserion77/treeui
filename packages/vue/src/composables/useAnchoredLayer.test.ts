import { defineComponent, h, nextTick, ref } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAnchoredLayer } from './useAnchoredLayer';

/**
 * Stacking, not geometry.
 *
 * jsdom has no layout, so position cannot be asserted here — that belongs to
 * the browser check. What IS observable is the `z-index` the composable
 * decides, and that is the whole of the regression this file exists for:
 * teleporting a panel out of a modal took it out of the modal's stacking
 * context too, and `--tree-z-dropdown` (1000) sits below `--tree-z-modal`
 * (1300), so the panel opened behind the dialog it belonged to and every
 * option in it was unclickable.
 *
 * The panel's own value comes from a real stylesheet rule rather than an inline
 * style: the composable reads the COMPUTED value to decide whether it needs to
 * raise anything, and an inline value would be the test asserting its own
 * input back.
 */
let sheet: HTMLStyleElement;

beforeEach(() => {
  sheet = document.createElement('style');
  sheet.textContent = '.probe-panel { z-index: 1000; position: fixed; }';
  document.head.append(sheet);
});

afterEach(() => sheet.remove());

/** The `zIndex` the composable writes, or `undefined` when it leaves it alone. */
const zDecidedFor = async (ancestorStyle: string) => {
  const trigger = ref<HTMLElement | null>(null);
  const panel = ref<HTMLElement | null>(null);
  const isOpen = ref(false);
  let decided: unknown;

  const Host = defineComponent({
    setup() {
      const layer = useAnchoredLayer(trigger, panel, isOpen, ref('bottom'), ref('start'));
      return () => {
        decided = layer.style.value.zIndex;
        return [
          h('div', { style: ancestorStyle }, [h('button', { ref: trigger }, 'open')]),
          h('div', { ref: panel, class: 'probe-panel' }, 'panel'),
        ];
      };
    },
  });

  const wrapper = mount(Host, { attachTo: document.body });
  isOpen.value = true;
  await nextTick();
  await nextTick();
  wrapper.unmount();
  return decided;
};

describe('an anchored panel stacks above the layer it was opened from', () => {
  it('rises above a modal-level ancestor', async () => {
    // --tree-z-modal is 1300; the panel's own sheet value is 1000.
    expect(await zDecidedFor('position: fixed; z-index: 1300')).toBe(1301);
  });

  it('rises above a drawer or any future layer, with nothing registered', async () => {
    expect(await zDecidedFor('position: fixed; z-index: 1200')).toBe(1201);
  });

  it('leaves the stylesheet in charge outside a layer', async () => {
    expect(await zDecidedFor('position: static')).toBeUndefined();
  });

  it('does not DROP below its own value for a small local stacking context', async () => {
    // A card or a sticky row with `z-index: 1` must not pull a 1000 panel to 2.
    expect(await zDecidedFor('position: relative; z-index: 1')).toBeUndefined();
  });

  it('ignores a z-index on a static ancestor, where it means nothing', async () => {
    expect(await zDecidedFor('position: static; z-index: 9999')).toBeUndefined();
  });
});
