/// <reference types="vitest/globals" />
import { computed, h, nextTick, type Component, type FunctionalComponent } from 'vue';
import { mount } from '@vue/test-utils';
import {
  builtinTreeIconNodes,
  createTreeIcon,
  getTreeIcon,
  hasTreeIcon,
  listTreeIcons,
  registerTreeIcons,
  resetTreeIcons,
  resolveTreeIcon,
  treeIconDefaults,
  treeIcons,
  type TIconName,
  type TIconNodes,
} from './index';

// Derived, not hardcoded: adding an icon should not break unrelated assertions.
// The size of the shipped set is asserted once, deliberately, below.
const BUILTIN_COUNT = Object.keys(builtinTreeIconNodes).length;

/** Tags an icon child is allowed to use — anything else will not scale or theme. */
const ALLOWED_TAGS = [
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'ellipse',
];

/** Stroke presentation the root `<svg>` owns for every icon. */
const ROOT_ONLY_ATTRS = [
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
];

const MIGRATION_ALIASES = {
  grid: 'layout-grid',
  share: 'share-nodes',
  'chevron-updown': 'chevrons-up-down',
  refresh: 'refresh-cw',
  comment: 'message-circle',
  chat: 'message-circle',
  'check-square': 'square-check',
  help: 'circle-help',
  automations: 'zap',
  connections: 'external-link',
  persona: 'user-round',
  close: 'x',
} as const;

/** Silences the dev-mode "unknown icon" warning for lookups that miss on purpose. */
const withSilentWarn = <T,>(run: () => T): T => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

  try {
    return run();
  } finally {
    warn.mockRestore();
  }
};

const renderIcon = (component: Component, props: Record<string, unknown> = {}) =>
  mount(component, { props });

// The registry is process-wide, so without this a test that registers an icon
// leaks into every test after it and the suite only passes in source order.
afterEach(() => {
  resetTreeIcons();
});

describe('@treeui/icons registry', () => {
  // The one place the shipped set's size is pinned. Update it when adding an
  // icon — the change should be deliberate, not incidental.
  it('ships 364 built-in icons', () => {
    expect(Object.keys(builtinTreeIconNodes)).toHaveLength(364);
  });

  it('lists every built-in icon name in sorted order', () => {
    const names = listTreeIcons();

    expect(names).toHaveLength(BUILTIN_COUNT);
    expect(names).toEqual([...names].sort());
    expect(new Set(names).size).toBe(BUILTIN_COUNT);
  });

  it('lists built-ins under the current product vocabulary', () => {
    const names = listTreeIcons();

    expect(names).toContain('check');
    expect(names).toContain('cpu');
    expect(names).toContain('square-terminal');
    expect(names).toContain('layout-dashboard');
    expect(names).toContain('ai-studio');
    expect(names).toContain('assistant');
    expect(names).toContain('app-window');
    expect(names).toContain('calendar');
    expect(names).toContain('mail');
    expect(names).toContain('file-pdf');
    expect(names).toContain('workflow');
    expect(names).toContain('close');
  });

  it('exposes shipped catalog names through TIconName', () => {
    expectTypeOf<'ai-studio'>().toMatchTypeOf<TIconName>();
    expectTypeOf<'assistant'>().toMatchTypeOf<TIconName>();
    expectTypeOf<'app-window'>().toMatchTypeOf<TIconName>();
    expectTypeOf<'close'>().toMatchTypeOf<TIconName>();
    expectTypeOf<'app-ai-studio'>().not.toMatchTypeOf<TIconName>();
    expectTypeOf<'brand-google-gemini'>().not.toMatchTypeOf<TIconName>();
    expectTypeOf<'definitely-not-an-icon'>().not.toMatchTypeOf<TIconName>();
  });

  it('does not expose removed app-prefixed or brand names', () => {
    const names = listTreeIcons();
    const currentProductNames = [
      'account',
      'ai-studio',
      'assistant',
      'catalog',
      'companion',
      'contentpilot',
      'draw',
      'llm',
      'market',
      'storage',
      'support',
      'tasks',
      'trail',
    ];
    const removedAppNames = [
      'app-account',
      'app-ai-studio',
      'app-assistant',
      'app-calendar',
      'app-catalog',
      'app-companion',
      'app-contentpilot',
      'app-draw',
      'app-llm',
      'app-mail',
      'app-market',
      'app-storage',
      'app-support',
      'app-tasks',
      'app-trail',
    ];

    for (const name of currentProductNames) {
      expect(names).toContain(name);
    }

    for (const name of removedAppNames) {
      expect(names).not.toContain(name);
    }

    expect(names.filter((name) => name.startsWith('app-'))).toEqual([
      'app-window',
    ]);
    expect(names.filter((name) => name.startsWith('brand-'))).toEqual([]);
  });

  it('makes documented migration aliases reuse the canonical node array', () => {
    expect(Object.keys(MIGRATION_ALIASES)).toHaveLength(12);

    for (const [alias, canonical] of Object.entries(MIGRATION_ALIASES)) {
      expect(
        builtinTreeIconNodes[alias as keyof typeof builtinTreeIconNodes],
        `${alias} should alias ${canonical}`,
      ).toBe(
        builtinTreeIconNodes[canonical as keyof typeof builtinTreeIconNodes],
      );
    }
  });

  it('reports whether a name is registered', () => {
    expect(hasTreeIcon('check')).toBe(true);
    expect(hasTreeIcon('layout-dashboard')).toBe(true);
    expect(hasTreeIcon('definitely-not-an-icon')).toBe(false);
    expect(hasTreeIcon('')).toBe(false);
  });

  it('memoises the component built for a built-in icon', () => {
    const first = getTreeIcon('check');
    const second = getTreeIcon('check');

    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(resolveTreeIcon('check')).toBe(first);
    expect(treeIcons['check']).toBe(first);
  });
});

describe('createTreeIcon', () => {
  const nodes: TIconNodes = [
    ['path', { d: 'M4 12h16' }],
    ['circle', { cx: 12, cy: 12, r: 4 }],
  ];

  it('renders a 24x24 svg that inherits colour from its context', () => {
    const wrapper = renderIcon(createTreeIcon('TSampleIcon', nodes));

    expect(wrapper.element.tagName.toLowerCase()).toBe('svg');
    expect(wrapper.attributes('viewBox')).toBe('0 0 24 24');
    expect(wrapper.attributes('stroke')).toBe('currentColor');
    expect(wrapper.attributes('fill')).toBe('none');
    expect(wrapper.attributes('aria-hidden')).toBe('true');
    expect(wrapper.attributes('stroke-linecap')).toBe('round');
    expect(wrapper.attributes('stroke-linejoin')).toBe('round');
    expect(wrapper.attributes('xmlns')).toBe('http://www.w3.org/2000/svg');
  });

  it('renders each geometry node as a child element', () => {
    const wrapper = renderIcon(createTreeIcon('TSampleIcon', nodes));

    expect(wrapper.findAll('path')).toHaveLength(1);
    expect(wrapper.find('path').attributes('d')).toBe('M4 12h16');
    expect(wrapper.find('circle').attributes('r')).toBe('4');
  });

  it('sizes the svg from the size prop', () => {
    const icon = createTreeIcon('TSampleIcon', nodes);

    const defaulted = renderIcon(icon);
    expect(defaulted.attributes('width')).toBe(String(treeIconDefaults.size));
    expect(defaulted.attributes('height')).toBe(String(treeIconDefaults.size));

    const sized = renderIcon(icon, { size: 32 });
    expect(sized.attributes('width')).toBe('32');
    expect(sized.attributes('height')).toBe('32');
  });

  it('lets attrs override the defaults so a labelled icon can be exposed', () => {
    const wrapper = mount(createTreeIcon('TSampleIcon', nodes), {
      attrs: { 'aria-hidden': undefined, role: 'img', 'aria-label': 'Sample' },
    });

    expect(wrapper.attributes('role')).toBe('img');
    expect(wrapper.attributes('aria-label')).toBe('Sample');
    expect(wrapper.attributes('aria-hidden')).toBeUndefined();
  });
});

describe('createTreeIcon absoluteStrokeWidth', () => {
  const nodes: TIconNodes = [['path', { d: 'M4 12h16' }]];
  const icon = createTreeIcon('TStrokeIcon', nodes);

  it('scales the stroke so it stays optically constant at the default size', () => {
    // 2 * 24 / 20 — the nominal width corrected for the 24-unit grid.
    expect(renderIcon(icon, { size: 20 }).attributes('stroke-width')).toBe('2.4');
  });

  it('thins the stroke as the icon grows', () => {
    // 2 * 24 / 48
    expect(renderIcon(icon, { size: 48 }).attributes('stroke-width')).toBe('1');
    // 2 * 24 / 24
    expect(renderIcon(icon, { size: 24 }).attributes('stroke-width')).toBe('2');
  });

  it('honours a custom strokeWidth while scaling', () => {
    const wrapper = renderIcon(icon, { size: 48, strokeWidth: 3 });

    // 3 * 24 / 48
    expect(wrapper.attributes('stroke-width')).toBe('1.5');
  });

  it('keeps the nominal stroke when scaling is switched off', () => {
    expect(
      renderIcon(icon, { size: 20, absoluteStrokeWidth: false }).attributes(
        'stroke-width',
      ),
    ).toBe('2');

    expect(
      renderIcon(icon, {
        size: 48,
        strokeWidth: 3,
        absoluteStrokeWidth: false,
      }).attributes('stroke-width'),
    ).toBe('3');
  });

  it('parses numeric strings for size and strokeWidth', () => {
    const wrapper = renderIcon(icon, { size: '48', strokeWidth: '3' });

    expect(wrapper.attributes('stroke-width')).toBe('1.5');
  });

  it('falls back to the nominal stroke for a non-numeric size', () => {
    const wrapper = renderIcon(icon, { size: 'auto' });

    expect(wrapper.attributes('width')).toBe('auto');
    expect(wrapper.attributes('stroke-width')).toBe('2');
    expect(Number(wrapper.attributes('stroke-width'))).toBeTypeOf('number');
    expect(Number.isFinite(Number(wrapper.attributes('stroke-width')))).toBe(true);
  });

  it('falls back to the nominal stroke for a zero size instead of dividing by it', () => {
    const wrapper = renderIcon(icon, { size: 0 });

    expect(wrapper.attributes('stroke-width')).toBe('2');
    expect(Number.isFinite(Number(wrapper.attributes('stroke-width')))).toBe(true);
  });

  it('never renders NaN or Infinity for a degenerate size or strokeWidth', () => {
    for (const props of [
      { size: 'auto' },
      { size: 0 },
      { size: '' },
      { size: Number.NaN },
      { size: 20, strokeWidth: 'thick' },
      { size: 0, strokeWidth: 'thick' },
    ]) {
      const rendered = renderIcon(icon, props).attributes('stroke-width') ?? '';

      expect(rendered).not.toContain('NaN');
      expect(rendered).not.toContain('Infinity');
      expect(Number.isFinite(Number(rendered))).toBe(true);
    }
  });
});

describe('registerTreeIcons', () => {
  it('makes geometry resolvable, listed, and readable from treeIcons', () => {
    const before = listTreeIcons().length;

    registerTreeIcons({
      'test-geometry': [['path', { d: 'M2 2h20' }]],
    });

    expect(hasTreeIcon('test-geometry')).toBe(true);
    expect(listTreeIcons()).toContain('test-geometry');
    expect(listTreeIcons()).toHaveLength(before + 1);
    expect(Object.keys(treeIcons)).toContain('test-geometry');
    expect(treeIcons['test-geometry']).toBeTruthy();

    const wrapper = renderIcon(getTreeIcon('test-geometry' as TIconName));

    expect(wrapper.element.tagName.toLowerCase()).toBe('svg');
    expect(wrapper.find('path').attributes('d')).toBe('M2 2h20');
  });

  it('keeps the sorted ordering after a registration', () => {
    registerTreeIcons({ 'aaa-first': [['path', { d: 'M0 0h1' }]] });

    const names = listTreeIcons();

    expect(names).toEqual([...names].sort());
    expect(names[0]).toBe('aaa-first');
  });

  it('stores a supplied component as-is rather than rebuilding it', () => {
    const Custom: FunctionalComponent = () => h('svg', { 'data-custom': 'true' });

    registerTreeIcons({ 'test-component': Custom });

    expect(hasTreeIcon('test-component')).toBe(true);
    expect(getTreeIcon('test-component' as TIconName)).toBe(Custom);
    expect(resolveTreeIcon('test-component' as TIconName)).toBe(Custom);
    expect(treeIcons['test-component']).toBe(Custom);
    expect(listTreeIcons()).toContain('test-component');
  });

  it('replaces an existing icon instead of serving the cached component', () => {
    registerTreeIcons({ 'test-replace': [['path', { d: 'M1 1h1' }]] });

    const original = getTreeIcon('test-replace' as TIconName);
    expect(renderIcon(original).find('path').attributes('d')).toBe('M1 1h1');

    registerTreeIcons({ 'test-replace': [['circle', { cx: 12, cy: 12, r: 9 }]] });

    const replaced = getTreeIcon('test-replace' as TIconName);

    expect(replaced).not.toBe(original);
    expect(renderIcon(replaced).find('path').exists()).toBe(false);
    expect(renderIcon(replaced).find('circle').attributes('r')).toBe('9');
    expect(treeIcons['test-replace']).toBe(replaced);
  });

  it('replaces geometry with a component and a component with geometry', () => {
    registerTreeIcons({ 'test-swap': [['path', { d: 'M3 3h3' }]] });

    const Swapped: FunctionalComponent = () => h('svg', { 'data-swapped': 'true' });

    registerTreeIcons({ 'test-swap': Swapped });
    expect(getTreeIcon('test-swap' as TIconName)).toBe(Swapped);

    registerTreeIcons({ 'test-swap': [['line', { x1: 1, y1: 1, x2: 2, y2: 2 }]] });

    const rebuilt = getTreeIcon('test-swap' as TIconName);

    expect(rebuilt).not.toBe(Swapped);
    expect(renderIcon(rebuilt).find('line').exists()).toBe(true);
    expect(
      listTreeIcons().filter((name) => (name as string) === 'test-swap'),
    ).toHaveLength(1);
  });

  it('can override a built-in icon', () => {
    const before = listTreeIcons().length;

    registerTreeIcons({ 'check': [['path', { d: 'M0 0h24' }]] });

    const overridden = getTreeIcon('check');

    expect(renderIcon(overridden).find('path').attributes('d')).toBe('M0 0h24');
    expect(listTreeIcons()).toHaveLength(before);
  });
});

describe('resolveTreeIcon', () => {
  it('resolves a registered name to a component', () => {
    const resolved = resolveTreeIcon('cpu');

    expect(resolved).toBeTruthy();
    expect(renderIcon(resolved as Component).element.tagName.toLowerCase()).toBe(
      'svg',
    );
  });

  it('passes a component through unchanged', () => {
    const Custom: FunctionalComponent = () => h('svg');

    expect(resolveTreeIcon(Custom)).toBe(Custom);
  });

  it('returns undefined for a missing icon prop', () => {
    expect(resolveTreeIcon(undefined)).toBeUndefined();
    expect(resolveTreeIcon(null)).toBeUndefined();
    expect(resolveTreeIcon('' as TIconName)).toBeUndefined();
  });

  it('returns undefined and warns for an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(resolveTreeIcon('not-a-real-icon' as TIconName)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('not-a-real-icon');

    // Warned once per message, so a miss in a render loop cannot flood the console.
    expect(resolveTreeIcon('not-a-real-icon' as TIconName)).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockRestore();
  });
});

describe('treeIcons view', () => {
  it('enumerates every registered icon', () => {
    const keys = Object.keys(treeIcons);

    expect(keys.length).toBeGreaterThanOrEqual(BUILTIN_COUNT);
    expect(keys).toContain('check');
    expect(keys).toContain('square-terminal');
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual(listTreeIcons().sort());
  });

  it('builds a component lazily when a key is read', () => {
    const icon = treeIcons['git-branch'];

    expect(icon).toBeTruthy();
    expect(treeIcons['git-branch']).toBe(icon);
    expect(renderIcon(icon).element.tagName.toLowerCase()).toBe('svg');
  });

  it('yields a component for every enumerated key', () => {
    for (const name of Object.keys(treeIcons)) {
      expect(treeIcons[name], `treeIcons["${name}"] should resolve`).toBeTruthy();
    }
  });

  it('has no own property for an unregistered name', () => {
    expect(Object.prototype.hasOwnProperty.call(treeIcons, 'nope')).toBe(false);
    expect(withSilentWarn(() => treeIcons['nope'])).toBeUndefined();
  });
});

describe('builtin icon geometry', () => {
  const entries = Object.entries(builtinTreeIconNodes) as [string, TIconNodes][];

  it('gives all 352 canonical icons unique geometry fingerprints', () => {
    const canonicalEntries = entries.filter(
      ([name]) => !Object.prototype.hasOwnProperty.call(MIGRATION_ALIASES, name),
    );
    const namesByFingerprint = new Map<string, string[]>();

    for (const [name, nodes] of canonicalEntries) {
      // Child order affects paint order but must not be the only distinction
      // between two outline glyphs. Attribute insertion order is likewise not
      // visual, so normalize both out of the fingerprint.
      const fingerprint = JSON.stringify(
        nodes
          .map(([tag, attrs]) =>
            JSON.stringify([
              tag,
              Object.fromEntries(
                Object.entries(attrs).sort(([left], [right]) =>
                  left.localeCompare(right),
                ),
              ),
            ]),
          )
          .sort(),
      );
      const names = namesByFingerprint.get(fingerprint) ?? [];

      names.push(name);
      namesByFingerprint.set(fingerprint, names);
    }

    const duplicateNames = [...namesByFingerprint.values()].filter(
      (names) => names.length > 1,
    );

    expect(canonicalEntries).toHaveLength(352);
    expect(namesByFingerprint.size).toBe(352);
    expect(duplicateNames).toEqual([]);
  });

  it('ships the expected number of icons under sorted kebab-case keys', () => {
    const names = entries.map(([name]) => name);

    expect(names).toHaveLength(BUILTIN_COUNT);
    expect(names).toEqual([...names].sort());

    for (const name of names) {
      expect(name, `"${name}" should be kebab-case`).toMatch(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
      );
    }
  });

  it('describes every icon as a non-empty list of 2-tuples', () => {
    for (const [name, nodes] of entries) {
      expect(Array.isArray(nodes), `${name} should be an array`).toBe(true);
      expect(nodes.length, `${name} should have geometry`).toBeGreaterThan(0);

      for (const node of nodes) {
        expect(Array.isArray(node), `${name} node should be a tuple`).toBe(true);
        expect(node, `${name} node should be [tag, attrs]`).toHaveLength(2);

        const [tag, attrs] = node;

        expect(typeof tag, `${name} tag should be a string`).toBe('string');
        expect(attrs, `${name} attrs should be an object`).toBeTypeOf('object');
        expect(attrs).not.toBeNull();
        expect(Array.isArray(attrs), `${name} attrs should not be an array`).toBe(
          false,
        );
      }
    }
  });

  it('only uses tags that scale on the 24x24 grid', () => {
    for (const [name, nodes] of entries) {
      for (const [tag] of nodes) {
        expect(ALLOWED_TAGS, `${name} uses unsupported tag <${tag}>`).toContain(
          tag,
        );
      }
    }
  });

  it('keeps root stroke presentation and only uses currentColor fills', () => {
    for (const [name, nodes] of entries) {
      for (const [tag, attrs] of nodes) {
        for (const forbidden of ROOT_ONLY_ATTRS) {
          expect(
            Object.prototype.hasOwnProperty.call(attrs, forbidden),
            `${name} <${tag}> must not set "${forbidden}" — the root svg owns it`,
          ).toBe(false);
        }

        if ('fill' in attrs) {
          expect(attrs.fill, `${name} fill must inherit currentColor`).toBe(
            'currentColor',
          );
        }

        if ('stroke' in attrs) {
          expect(attrs.stroke, `${name} filled path must disable its stroke`).toBe(
            'none',
          );
          expect(attrs.fill, `${name} stroke-less path must be filled`).toBe(
            'currentColor',
          );
        }
      }
    }
  });

  it('renders every built-in icon as an svg with the right child count', () => {
    for (const [name, nodes] of entries) {
      const wrapper = renderIcon(createTreeIcon(`T${name}Icon`, nodes));

      expect(wrapper.element.tagName.toLowerCase(), name).toBe('svg');
      expect(wrapper.element.children.length, name).toBe(nodes.length);
      expect(wrapper.attributes('viewBox'), name).toBe('0 0 24 24');
    }
  });
});

describe('registration reactivity', () => {
  it('re-resolves in a computed when an icon is registered after the first read', async () => {
    const name = 'late-registered-glyph';
    const resolved = computed(() => resolveTreeIcon(name));

    expect(resolved.value).toBeUndefined();

    registerTreeIcons({ [name]: [['circle', { cx: 12, cy: 12, r: 7 }]] });
    await nextTick();

    // A lazily loaded route can register its icons without the parts of the app
    // that already rendered having to know.
    expect(resolved.value).toBeDefined();
  });
});
