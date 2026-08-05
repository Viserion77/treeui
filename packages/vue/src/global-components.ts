import type { TreeUIGlobalComponents } from './plugin';

/**
 * Type the components `TreeUIPlugin` registers globally (TREEUX-008).
 *
 * Without this augmentation `vue-tsc` has nothing to check a globally
 * registered `<TTag>` against, so a prop that does not exist is not an error —
 * it silently becomes an entry in `$attrs`, and on a component with
 * `inheritAttrs: false` it lands on an inner element as an invalid HTML
 * attribute and disappears. One consumer audit found six such props across 19
 * call sites: a checkbox with no accessible name, a destructive button in the
 * default colour, and translated copy that never rendered — none of which
 * produced a single warning in dev, in build, or in `vue-tsc`.
 *
 * With it, `<TTag clickable>` fails to compile.
 *
 * The trade-off, stated plainly: the augmentation is unconditional, so an app
 * that imports components by name instead of installing the plugin is also told
 * they resolve globally. That direction fails loudly at runtime (Vue's
 * "Failed to resolve component" warning), while the direction this fixes failed
 * silently — which is why it is worth taking.
 */
declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface GlobalComponents extends TreeUIGlobalComponents {}
}

export {};
