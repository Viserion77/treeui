// @vitest-environment node
//
// SSR smoke test (TREEUX-028). Runs in the `node` environment — NO `document`,
// NO `window` — so `renderToString` exercises the real server path. Any
// component that touches the DOM during setup (e.g. a `document` call in an
// `immediate` watcher) throws here, exactly as it does in a consumer's
// `nuxt generate` build. Covers the outside-click / overlay class that carries
// the risk; extend the list when a new component listens on document/window.
import { describe, expect, it } from 'vitest';
import { createSSRApp, h, type Component } from 'vue';
import { renderToString } from 'vue/server-renderer';
import {
  TLanguageSelect,
  TDropdown,
  TMenu,
  TPopover,
  TCombobox,
  TMultiSelect,
  TContextMenu,
  TModal,
  TDrawer,
  TTooltip,
} from './index';

const cases: Array<{ name: string; component: Component; props?: Record<string, unknown> }> = [
  { name: 'TLanguageSelect', component: TLanguageSelect, props: { options: [{ label: 'English', value: 'en' }] } },
  { name: 'TDropdown', component: TDropdown, props: { items: [{ label: 'A', value: 'a' }] } },
  { name: 'TMenu', component: TMenu, props: { label: 'Menu' } },
  { name: 'TPopover', component: TPopover },
  { name: 'TCombobox', component: TCombobox, props: { options: [{ label: 'A', value: 'a' }] } },
  { name: 'TMultiSelect', component: TMultiSelect, props: { options: [{ label: 'A', value: 'a' }] } },
  { name: 'TContextMenu', component: TContextMenu, props: { items: [{ label: 'A', value: 'a' }] } },
  { name: 'TModal', component: TModal, props: { open: false } },
  { name: 'TDrawer', component: TDrawer, props: { open: false } },
  { name: 'TTooltip', component: TTooltip },
];

describe('SSR smoke — components render to string without a DOM (TREEUX-028)', () => {
  it('has no document/window globals in this environment', () => {
    expect(typeof document).toBe('undefined');
    expect(typeof window).toBe('undefined');
  });

  it.each(cases)('$name renders to HTML on the server', async ({ component, props }) => {
    const app = createSSRApp({ render: () => h(component, props) });
    await expect(renderToString(app)).resolves.toEqual(expect.any(String));
  });
});
