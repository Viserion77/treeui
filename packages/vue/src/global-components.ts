import type { AriaAttributes } from 'vue';
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
 * With it — and with `vueCompilerOptions.strictTemplates` on, which is what
 * actually turns an unknown prop into an error — `<TTag clickable>` fails to
 * compile. Without `strictTemplates` (the vue-tsc default) this augmentation
 * only fixes component RESOLUTION, not prop checking.
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

  /**
   * Attributes any component may receive, on top of its own props (TREEUX-011).
   *
   * `strictTemplates` rejects every attribute that is not a declared prop, and
   * that is too blunt for a library whose components forward `$attrs` to an
   * inner element by design: naming a `TTable` with `aria-label` became a
   * compile error, and "remove the accessible name to satisfy the type checker"
   * is not an acceptable instruction. So the passthrough surface is declared
   * instead of left to chance.
   *
   * Deliberately narrow — ARIA, identity, and native listeners, the things that
   * are legitimate on ANY root element. It does NOT open the door to arbitrary
   * names: `clickable` is still an error, which is the whole point of the
   * augmentation above.
   */
  interface ComponentCustomProps extends AriaAttributes, TreeUIPassthroughAttributes {}
}

/**
 * The non-ARIA half of the passthrough surface. Split out so the list is
 * readable and so each entry can say why it is here.
 */
export interface TreeUIPassthroughAttributes {
  /** Identity, and what a `<label for>` points at. */
  id?: string;
  /** Native tooltip; legitimate on any root element. */
  title?: string;
  /** Tab order, e.g. making a normally inert region focusable. */
  tabindex?: number | string;
  /**
   * Test and analytics hooks. Both spellings are needed: an attribute the
   * component does not declare is camelized before the check, so `data-testid`
   * in a template is looked up as `dataTestid`, while a hyphenated key that
   * DOES exist in the type (every `aria-*`, from AriaAttributes) is matched
   * verbatim. Template literal keys, so nothing outside `data-*` matches.
   */
  [dataAttribute: `data-${string}`]: unknown;
  [camelizedDataAttribute: `data${Capitalize<string>}`]: unknown;
  /**
   * Native listeners bound on a component fall through to its root element,
   * which is the documented way to react to a DOM event a component does not
   * emit itself. Typed loosely on purpose: the event object is the DOM's, and
   * pinning each one to a specific `Event` subtype here would reject correct
   * handlers written against the element the component actually renders.
   */
  [listener: `on${Capitalize<string>}`]: ((...payload: never[]) => void) | undefined;
}

/**
 * Marker, and the reason it exists: an augmentation only takes effect once
 * TypeScript LOADS the module that declares it. A bare `import
 * './global-components'` in the barrel is elided from the emitted
 * `index.d.ts` (it contributes no value), so the published
 * `global-components.d.ts` sat in `dist/` referenced by nothing and the
 * augmentation never reached a consumer at all. Re-exporting a type from the
 * barrel puts a real `from './global-components'` in `index.d.ts`, which loads
 * the file — verified by `packaging.test.ts`.
 */
export type TreeUIGlobalComponentsRegistered = true;
