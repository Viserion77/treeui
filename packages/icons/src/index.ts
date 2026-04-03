import { defineComponent, h, type Component } from 'vue';

type TreeIconNode = Array<[string, Record<string, string>]>;

export const treeIconDefaults = {
  size: 16,
  strokeWidth: 1.75,
  absoluteStrokeWidth: true,
} as const;

const toNumber = (value: number | string) => {
  if (typeof value === 'number') {
    return value;
  }

  return Number.parseFloat(value);
};

const createTreeIcon = (name: string, nodes: TreeIconNode) =>
  defineComponent({
    name,
    props: {
      size: {
        type: [Number, String],
        default: treeIconDefaults.size,
      },
      strokeWidth: {
        type: [Number, String],
        default: treeIconDefaults.strokeWidth,
      },
      absoluteStrokeWidth: {
        type: Boolean,
        default: treeIconDefaults.absoluteStrokeWidth,
      },
    },
    setup(props, { attrs }) {
      return () => {
        const normalizedSize = toNumber(props.size);
        const normalizedStrokeWidth = toNumber(props.strokeWidth);
        const strokeWidth = props.absoluteStrokeWidth
          ? (normalizedStrokeWidth * 24) / normalizedSize
          : normalizedStrokeWidth;

        return h(
          'svg',
          {
            xmlns: 'http://www.w3.org/2000/svg',
            width: props.size,
            height: props.size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': strokeWidth,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'aria-hidden': 'true',
            ...attrs,
          },
          nodes.map(([tag, nodeAttrs]) => h(tag, nodeAttrs)),
        );
      };
    },
  });

const CircleAlert = createTreeIcon('TreeCircleAlertIcon', [
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
]);

const Check = createTreeIcon('TreeCheckIcon', [['path', { d: 'M20 6 9 17l-5-5' }]]);

const Calendar = createTreeIcon('TreeCalendarIcon', [
  ['path', { d: 'M8 2v4' }],
  ['path', { d: 'M16 2v4' }],
  ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }],
  ['path', { d: 'M3 10h18' }],
]);

const ChevronLeft = createTreeIcon('TreeChevronLeftIcon', [
  ['path', { d: 'm15 18-6-6 6-6' }],
]);

const ChevronDown = createTreeIcon('TreeChevronDownIcon', [
  ['path', { d: 'm6 9 6 6 6-6' }],
]);

const ChevronRight = createTreeIcon('TreeChevronRightIcon', [
  ['path', { d: 'm9 18 6-6-6-6' }],
]);

const Info = createTreeIcon('TreeInfoIcon', [
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['path', { d: 'M12 16v-4' }],
  ['path', { d: 'M12 8h.01' }],
]);

const LoaderCircle = createTreeIcon('TreeLoaderCircleIcon', [
  ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }],
]);

const Search = createTreeIcon('TreeSearchIcon', [
  ['circle', { cx: '11', cy: '11', r: '8' }],
  ['path', { d: 'm21 21-4.3-4.3' }],
]);

const X = createTreeIcon('TreeXIcon', [
  ['path', { d: 'M18 6 6 18' }],
  ['path', { d: 'm6 6 12 12' }],
]);

export const treeIcons = {
  'alert-circle': CircleAlert,
  calendar: Calendar,
  check: Check,
  'chevron-left': ChevronLeft,
  'chevron-down': ChevronDown,
  'chevron-right': ChevronRight,
  info: Info,
  'loader-circle': LoaderCircle,
  search: Search,
  x: X,
} satisfies Record<string, Component>;

export type TreeIconName = keyof typeof treeIcons;

export const getTreeIcon = (name: TreeIconName) => treeIcons[name];
