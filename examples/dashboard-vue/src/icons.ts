import { h, type FunctionalComponent } from 'vue';

type IconNode = Array<[string, Record<string, string>]>;

// Small app-local icon set following the same stroke style as @treeui/icons.
const createIcon = (nodes: IconNode): FunctionalComponent => {
  const icon: FunctionalComponent = (_, { attrs }) =>
    h(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        width: 20,
        height: 20,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'aria-hidden': 'true',
        ...attrs,
      },
      nodes.map(([tag, nodeAttrs]) => h(tag, nodeAttrs)),
    );
  return icon;
};

export const IconHome = createIcon([
  ['path', { d: 'm3 9.5 9-7 9 7' }],
  ['path', { d: 'M5 8v12h14V8' }],
  ['path', { d: 'M10 20v-6h4v6' }],
]);

export const IconOrders = createIcon([
  ['circle', { cx: '9', cy: '20', r: '1.5' }],
  ['circle', { cx: '18', cy: '20', r: '1.5' }],
  ['path', { d: 'M2 3h2.5l2.6 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H5' }],
]);

export const IconUsers = createIcon([
  ['circle', { cx: '9', cy: '8', r: '3.5' }],
  ['path', { d: 'M2.5 20a6.5 6.5 0 0 1 13 0' }],
  ['path', { d: 'M16.5 4.9a3.5 3.5 0 0 1 0 6.2' }],
  ['path', { d: 'M18 14.2a6.5 6.5 0 0 1 3.9 5.8' }],
]);

export const IconGear = createIcon([
  ['circle', { cx: '12', cy: '12', r: '3' }],
  [
    'path',
    {
      d: 'M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03Z',
    },
  ],
]);

export const IconSun = createIcon([
  ['circle', { cx: '12', cy: '12', r: '4' }],
  ['path', { d: 'M12 2v2' }],
  ['path', { d: 'M12 20v2' }],
  ['path', { d: 'm4.93 4.93 1.41 1.41' }],
  ['path', { d: 'm17.66 17.66 1.41 1.41' }],
  ['path', { d: 'M2 12h2' }],
  ['path', { d: 'M20 12h2' }],
  ['path', { d: 'm6.34 17.66-1.41 1.41' }],
  ['path', { d: 'm19.07 4.93-1.41 1.41' }],
]);

export const IconMoon = createIcon([
  ['path', { d: 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' }],
]);

export const IconSearch = createIcon([
  ['circle', { cx: '11', cy: '11', r: '7' }],
  ['path', { d: 'm20 20-3.5-3.5' }],
]);

export const IconBell = createIcon([
  ['path', { d: 'M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6' }],
  ['path', { d: 'M10 20a2 2 0 0 0 4 0' }],
]);

export const IconPlus = createIcon([
  ['path', { d: 'M12 5v14' }],
  ['path', { d: 'M5 12h14' }],
]);
