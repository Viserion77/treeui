import { defineComponent, h, type Component } from 'vue';

type TIconNode = Array<[string, Record<string, string>]>;

export const treeIconDefaults = {
  size: 20,
  strokeWidth: 2,
  absoluteStrokeWidth: true,
} as const;

const toNumber = (value: number | string) => {
  if (typeof value === 'number') {
    return value;
  }

  return Number.parseFloat(value);
};

const createTreeIcon = (name: string, nodes: TIconNode) =>
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

const CircleAlert = createTreeIcon('TCircleAlertIcon', [
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['line', { x1: '12', x2: '12', y1: '8', y2: '12' }],
  ['line', { x1: '12', x2: '12.01', y1: '16', y2: '16' }],
]);

const Check = createTreeIcon('TCheckIcon', [['path', { d: 'M20 6 9 17l-5-5' }]]);

const Calendar = createTreeIcon('TCalendarIcon', [
  ['path', { d: 'M8 2v4' }],
  ['path', { d: 'M16 2v4' }],
  ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }],
  ['path', { d: 'M3 10h18' }],
]);

const ChevronLeft = createTreeIcon('TChevronLeftIcon', [
  ['path', { d: 'm15 18-6-6 6-6' }],
]);

const ChevronDown = createTreeIcon('TChevronDownIcon', [
  ['path', { d: 'm6 9 6 6 6-6' }],
]);

const ChevronRight = createTreeIcon('TChevronRightIcon', [
  ['path', { d: 'm9 18 6-6-6-6' }],
]);

const Info = createTreeIcon('TInfoIcon', [
  ['circle', { cx: '12', cy: '12', r: '10' }],
  ['path', { d: 'M12 16v-4' }],
  ['path', { d: 'M12 8h.01' }],
]);

const LoaderCircle = createTreeIcon('TLoaderCircleIcon', [
  ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56' }],
]);

const Search = createTreeIcon('TSearchIcon', [
  ['circle', { cx: '11', cy: '11', r: '8' }],
  ['path', { d: 'm21 21-4.3-4.3' }],
]);

const X = createTreeIcon('TXIcon', [
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

export type TIconName = keyof typeof treeIcons;

export const getTreeIcon = (name: TIconName) => treeIcons[name];
