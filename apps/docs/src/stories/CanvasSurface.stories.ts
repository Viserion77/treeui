import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TCanvasSurface } from '@treeui/vue';
import { practiceNote } from './practice-refs';

/** A tiny node-and-edge drawing, so the surface has something to be about. */
const nodes = [
  { id: 'api', label: 'api', x: 0.16, y: 0.3 },
  { id: 'queue', label: 'queue', x: 0.5, y: 0.18 },
  { id: 'worker', label: 'worker', x: 0.82, y: 0.34 },
  { id: 'store', label: 'store', x: 0.5, y: 0.74 },
];

const edges = [
  ['api', 'queue'],
  ['queue', 'worker'],
  ['worker', 'store'],
  ['api', 'store'],
] as const;

const readToken = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const drawGraph = (hovered: string | null) => (frame: {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}) => {
  const { context, width, height } = frame;
  const at = (node: (typeof nodes)[number]) => ({ x: node.x * width, y: node.y * height });
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  context.clearRect(0, 0, width, height);
  context.lineWidth = 1.5;
  context.strokeStyle = readToken('--tree-color-border-strong', '#8b949e');

  for (const [from, to] of edges) {
    const a = at(byId[from]);
    const b = at(byId[to]);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.stroke();
  }

  context.font = '12px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (const node of nodes) {
    const { x, y } = at(node);
    const isHovered = node.id === hovered;
    context.beginPath();
    context.arc(x, y, isHovered ? 26 : 22, 0, Math.PI * 2);
    context.fillStyle = isHovered
      ? readToken('--tree-color-brand-soft', '#ddf4ff')
      : readToken('--tree-color-bg-subtle', '#eff2f5');
    context.fill();
    context.strokeStyle = isHovered
      ? readToken('--tree-color-brand-primary', '#0969da')
      : readToken('--tree-color-border-default', '#d0d7de');
    context.stroke();
    context.fillStyle = readToken('--tree-color-text-primary', '#1f2328');
    context.fillText(node.label, x, y);
  }
};

const meta = {
  title: 'Components/Data Display/Canvas Surface',
  component: TCanvasSurface,
  parameters: {
    docs: { description: { component: practiceNote('TCanvasSurface') } },
  },
  tags: ['autodocs'],
  args: {
    draw: drawGraph(null),
    height: 320,
  },
} satisfies Meta<typeof TCanvasSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The surface a diagram lives on: sized by CSS instead of imperative `style.width`, repainted when the data changes instead of on a clock, and hit-testable, because a node is a target. A bare `<canvas>` dropped into a layout primitive measures 0×0 and paints nothing at all — a blank box rather than a wrong one, which is why it is easy to miss.',
      },
    },
  },
  render: () => ({
    components: { TCanvasSurface },
    setup: () => {
      const hovered = ref<string | null>(null);
      const surface = ref<InstanceType<typeof TCanvasSurface> | null>(null);

      const onMove = (event: PointerEvent) => {
        const point = surface.value?.point(event);
        if (!point) return;

        const size = surface.value?.size;
        const width = size?.width ?? 0;
        const height = size?.height ?? 0;
        const hit = nodes.find(
          (node) => Math.hypot(node.x * width - point.x, node.y * height - point.y) < 24,
        );
        const next = hit?.id ?? null;

        if (next !== hovered.value) {
          hovered.value = next;
          surface.value?.redraw();
        }
      };

      return { hovered, surface, onMove, drawGraph };
    },
    template: `
      <TCanvasSurface
        ref="surface"
        :draw="drawGraph(hovered)"
        :redraw-key="hovered"
        :height="320"
        :cursor="hovered ? 'pointer' : undefined"
        aria-label="Service dependencies: api to queue to worker to store"
        @pointermove="onMove"
        @pointerleave="hovered = null"
      >
        <ul>
          <li>api → queue</li>
          <li>queue → worker</li>
          <li>worker → store</li>
          <li>api → store</li>
        </ul>
      </TCanvasSurface>
    `,
  }),
};

export const AccessibleForm: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The default slot renders inside the `<canvas>` element: the browser exposes it to assistive technology and never paints it. That is the accessible form of the drawing, not a fallback for a browser that cannot draw — a bitmap says nothing on its own, and `aria-label` alone only names it. Anything clickable inside the drawing still needs a real control elsewhere, or a keyboard user cannot reach it.',
      },
    },
  },
  render: () => ({
    components: { TCanvasSurface },
    setup: () => ({ draw: drawGraph(null) }),
    template: `
      <TCanvasSurface
        :draw="draw"
        height="14rem"
        aria-label="Service dependencies"
      >
        <table>
          <caption>Service dependencies</caption>
          <thead><tr><th>From</th><th>To</th></tr></thead>
          <tbody>
            <tr><td>api</td><td>queue</td></tr>
            <tr><td>queue</td><td>worker</td></tr>
            <tr><td>worker</td><td>store</td></tr>
            <tr><td>api</td><td>store</td></tr>
          </tbody>
        </table>
      </TCanvasSurface>
    `,
  }),
};
