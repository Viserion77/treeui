import { defineComponent, h, shallowRef, type Component } from 'vue';
import { builtinTreeIconNodes } from './icons';

/**
 * One child of an icon's `<svg>`: its tag and its attributes.
 *
 * Attribute values accept numbers as well as strings so icon geometry can be
 * authored with numeric coordinates without hand-quoting every number.
 */
export type TIconNode = [tag: string, attrs: Record<string, string | number>];

/** An icon's geometry: the children of its `<svg>`, drawn on a 24x24 grid. */
export type TIconNodes = TIconNode[];

/**
 * The registry of icon names.
 *
 * This is an `interface` rather than a union so applications can teach
 * TypeScript about their own icons. Augment it alongside `registerTreeIcons`
 * and every `name` prop in the library accepts the new key:
 *
 * ```ts
 * // The `export {}` is required: it makes the file a module, which is what
 * // makes this an augmentation rather than a new ambient module shadowing
 * // the real one.
 * export {};
 *
 * declare module '@treeui/icons' {
 *   interface TIconRegistry {
 *     orbit: true;
 *   }
 * }
 * ```
 */
type TBuiltinTreeIconRegistry = {
  readonly [Name in keyof typeof builtinTreeIconNodes]: true;
};

/** Automatically includes every shipped key while remaining augmentable. */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires an interface; the mapped supertype supplies its members.
export interface TIconRegistry extends TBuiltinTreeIconRegistry {}

/** A registered icon name. Widens as `TIconRegistry` is augmented. */
export type TIconName = keyof TIconRegistry & string;

/**
 * Anything the library will render as an icon: a registered name, or a
 * component supplied directly by the application.
 */
export type TIconInput = TIconName | Component;

/** Anything `registerTreeIcons` accepts: raw geometry, or a ready component. */
export type TIconDefinition = TIconNodes | Component;

export const treeIconDefaults = {
  size: 20,
  strokeWidth: 2,
  absoluteStrokeWidth: true,
} as const;

/**
 * Warns once per unknown NAME.
 *
 * Keyed on the name rather than the rendered message for two reasons: the
 * message embeds the list of valid names, which changes on every registration
 * and would defeat the dedupe, and building that list is expensive enough that
 * it must not happen on a miss that is about to be swallowed. The set is
 * therefore bounded by the number of distinct bad names an app asks for.
 *
 * This warns in production too. A missing icon is a misconfiguration the
 * developer wants to hear about exactly once, and the alternative — sniffing
 * `process.env.NODE_ENV` — reads as `undefined` in every browser bundle that
 * does not shim `process`, which is most of them.
 */
const warnUnknownIcon = (name: string) => {
  if (state.warned.has(name)) {
    return;
  }

  state.warned.add(name);
  console.warn(
    `[@treeui/icons] Unknown icon "${name}". Register it with registerTreeIcons({ '${name}': [...] }), or use one of: ${listTreeIcons().join(', ')}.`,
  );
};

const toNumber = (value: number | string) => {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Builds a TreeUI icon component from geometry.
 *
 * Use this to author an icon that behaves exactly like a built-in one — same
 * `size` / `strokeWidth` / `absoluteStrokeWidth` props, same `currentColor`
 * stroke, same `aria-hidden` default. Hand-rolling the `<svg>` instead is what
 * silently loses the `absoluteStrokeWidth` correction, so an icon drawn at a
 * size other than 20 ends up with a heavier or lighter stroke than its
 * neighbours.
 *
 * @param name  Component name, by convention `T<Name>Icon`.
 * @param nodes The children of the `<svg>`, on a 24x24 grid.
 */
export const createTreeIcon = (name: string, nodes: TIconNodes) =>
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
        const normalizedStrokeWidth =
          toNumber(props.strokeWidth) ?? treeIconDefaults.strokeWidth;

        // Scaling needs a real, non-zero size to divide by. A `size` of "auto"
        // or 0 keeps the nominal stroke rather than producing NaN/Infinity.
        const strokeWidth =
          props.absoluteStrokeWidth && normalizedSize
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
            // Spread last on purpose: TIcon overrides `aria-hidden` with
            // `role="img"` + `aria-label` when the icon carries meaning.
            ...attrs,
          },
          nodes.map(([tag, nodeAttrs]) => h(tag, nodeAttrs)),
        );
      };
    },
  });

const isNodes = (definition: TIconDefinition): definition is TIconNodes =>
  Array.isArray(definition);

interface TreeIconState {
  /** Geometry, kept apart from components so unused icons cost only their data. */
  nodes: Map<string, TIconNodes>;
  /** Components, built on first use and reused after that. */
  components: Map<string, Component>;
  /**
   * Bumped on every registration. Lookups read it, so an icon resolved inside a
   * `computed` or a render function re-resolves when the registry changes — an
   * icon registered by a lazily loaded route appears without the parts of the
   * app that already rendered having to know.
   */
  version: { value: number };
  /** Unknown names already reported, so each one warns once. */
  warned: Set<string>;
}

const createState = (): TreeIconState => ({
  nodes: new Map(Object.entries(builtinTreeIconNodes)),
  components: new Map(),
  version: shallowRef(0),
  warned: new Set(),
});

/**
 * The registry is mutable module state, so two copies of this package in one
 * application would otherwise each get their own — icons registered through one
 * would be invisible to components resolving through the other, which presents
 * as icons that render in some places and not others. Anchoring the state on a
 * well-known global key makes duplicate copies share one registry.
 */
const STATE_KEY = Symbol.for('@treeui/icons.registry');

type StateHost = typeof globalThis & { [STATE_KEY]?: TreeIconState };

const host = globalThis as StateHost;
const state: TreeIconState = (host[STATE_KEY] ??= createState());

/**
 * Turns a kebab-case registry key into the `T<Name>Icon` component name that
 * shows up in Vue devtools and warnings.
 */
const toComponentName = (name: string) =>
  `T${name.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase())}Icon`;

/** Whether `name` resolves to a registered icon. */
export const hasTreeIcon = (name: string): name is TIconName => {
  void state.version.value;

  return state.components.has(name) || state.nodes.has(name);
};

/**
 * Every registered icon name, sorted — built-ins plus anything registered.
 *
 * Like the lookups, this tracks the registry, so a `computed` listing the
 * available icons updates when an application registers more.
 */
export const listTreeIcons = (): TIconName[] => {
  void state.version.value;

  return [
    ...new Set([...state.nodes.keys(), ...state.components.keys()]),
  ].sort() as TIconName[];
};

/**
 * The registry lookup, tolerant of names TypeScript never vetted (an `icon`
 * prop filled from an API response, a config file, a route definition).
 */
const lookupTreeIcon = (name: string): Component | undefined => {
  // Read for the dependency, not the value: this is what makes a lookup inside
  // a computed or a render function re-run after a later registration.
  void state.version.value;

  const cached = state.components.get(name);
  if (cached) {
    return cached;
  }

  const nodes = state.nodes.get(name);
  if (!nodes) {
    warnUnknownIcon(name);

    return undefined;
  }

  const component = createTreeIcon(toComponentName(name), nodes);
  state.components.set(name, component);

  return component;
};

/** Publishes `name` as a lazy own-property of the `treeIcons` view. */
const exposeIcon = (view: Record<TIconName, Component>, name: string) => {
  if (Object.prototype.hasOwnProperty.call(view, name)) {
    return;
  }

  Object.defineProperty(view, name, {
    enumerable: true,
    configurable: true,
    get: () => lookupTreeIcon(name),
  });
};

const createTreeIconsView = () => {
  const view = {} as Record<TIconName, Component>;

  for (const name of state.nodes.keys()) {
    exposeIcon(view, name);
  }

  return view;
};

/**
 * The icons, as a map of name to component.
 *
 * Entries are lazy: reading one builds its component, and icons nobody reads
 * stay as geometry. Icons added with `registerTreeIcons` appear here too.
 */
export const treeIcons: Record<TIconName, Component> = createTreeIconsView();

/**
 * Adds icons to the registry, making them available by name to `TIcon` and to
 * every `icon` prop in the library.
 *
 * Accepts raw geometry (the common case) or an already-built component, which
 * is how an application registers one of its own prebuilt SVG components.
 *
 * Call this once, near the application root. Registering later also works —
 * lookups are reactive, so an icon registered by a lazily loaded route shows
 * up in components that already rendered.
 * To get autocomplete and typo-checking on the new names, augment
 * {@link TIconRegistry} as well.
 *
 * Registering a name that already ships replaces that built-in, so pick names
 * the library does not use unless replacing one is what you meant.
 *
 * ```ts
 * registerTreeIcons({
 *   orbit: [
 *     ['circle', { cx: 12, cy: 12, r: 10 }],
 *     ['path', { d: 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0' }],
 *   ],
 * });
 * ```
 */
export const registerTreeIcons = (
  icons: Record<string, TIconDefinition>,
): void => {
  for (const [name, definition] of Object.entries(icons)) {
    if (isNodes(definition)) {
      state.nodes.set(name, definition);
      // Drop any component built from the superseded geometry.
      state.components.delete(name);
    } else {
      state.components.set(name, definition);
      state.nodes.delete(name);
    }

    // A name that previously missed is now valid; let it warn again if it is
    // ever unregistered.
    state.warned.delete(name);
    exposeIcon(treeIcons, name);
  }

  state.version.value += 1;
};

/**
 * Restores the registry to the icons TreeUI ships, dropping everything
 * registered since.
 *
 * The registry is process-wide mutable state, which makes a test that registers
 * an icon leak into every test after it. Call this in an `afterEach` to keep
 * cases independent.
 */
export const resetTreeIcons = (): void => {
  for (const name of [...state.nodes.keys(), ...state.components.keys()]) {
    if (!Object.prototype.hasOwnProperty.call(builtinTreeIconNodes, name)) {
      delete (treeIcons as Record<string, Component>)[name];
    }
  }

  state.nodes = new Map(Object.entries(builtinTreeIconNodes));
  state.components.clear();
  state.warned.clear();

  for (const name of state.nodes.keys()) {
    exposeIcon(treeIcons, name);
  }

  state.version.value += 1;
};

/**
 * Returns the component for a registered icon name.
 *
 * Built-in icons are turned into components the first time they are asked for,
 * so an application pays only for the icons it actually renders.
 *
 * A `TIconName` is registered by definition, so the return type is not
 * optional. The one way to get `undefined` back is to augment
 * {@link TIconRegistry} with a name and then never call
 * {@link registerTreeIcons} for it — a dev-mode warning names the icon when
 * that happens.
 */
export const getTreeIcon = (name: TIconName): Component =>
  lookupTreeIcon(name) as Component;

/**
 * Resolves whatever an `icon` prop was given into a renderable component.
 *
 * Components pass through untouched; names go through the registry. Templates
 * must call this before `<component :is>`, because Vue resolves a raw string
 * `is` as a *globally registered component name* — passing `"cpu"` straight
 * through would look for a component called `cpu` and render nothing.
 */
export const resolveTreeIcon = (
  icon: TIconInput | undefined | null,
): Component | undefined => {
  if (!icon) {
    return undefined;
  }

  return typeof icon === 'string' ? lookupTreeIcon(icon) : icon;
};
