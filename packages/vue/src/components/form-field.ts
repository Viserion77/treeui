import { computed, inject, type ComputedRef, type InjectionKey } from 'vue';

/**
 * Identity a TFormField hands down to the control it labels.
 *
 * A `<label for>` has to name a real control, so the id has to exist on both
 * sides. Making the app invent and repeat it by hand is a silent failure mode:
 * forget one half and nothing warns — the label simply names nothing. The
 * field mints the id and the control adopts it.
 *
 * But not every control CAN adopt one. A radio group or a toggle group has no
 * labellable element at all — `<label for>` may only point at a button, input,
 * select, textarea, meter, output or progress, and a `div[role="radiogroup"]`
 * is none of them. The right shape there is `aria-labelledby`. Emitting `for`
 * unconditionally pointed the label at an id no element carried, which is worse
 * than the gap it closed: the markup went from incomplete to incoherent.
 *
 * So the GROUP declares itself, and `for` stays on by default. The inverse —
 * every adopter announcing itself — reads better but is wrong where it counts:
 * a child's `setup` runs after its parent has already rendered, so the first
 * render (and therefore the whole server-rendered document) would ship without
 * `for` for every input, select and textarea, which is the common case and the
 * exact bug this contract exists to prevent. This way only a group is briefly
 * over-labelled, and only until the first patch.
 *
 * Deliberately narrow: only identity and description. `invalid`, `disabled` and
 * `required` are NOT propagated, because a field carrying a summary error would
 * then silently restyle a control the consumer never marked, and those props
 * already exist on the controls themselves.
 */
export interface FormFieldContext {
  /** Id the labelled control should adopt, unless it was given one. */
  id: ComputedRef<string>;
  /** Ids of the field's error/hint text, for `aria-describedby`. */
  describedBy: ComputedRef<string | undefined>;
  /** Id of the field's own `<label>`, for a group that names itself with it. */
  labelId: ComputedRef<string>;
  /**
   * Called by a control that has NO labellable element, so the field stops
   * emitting `for`. See the note above for why the group declares itself
   * instead of every adopter.
   */
  releaseId: () => void;
}

export const formFieldInjectionKey: InjectionKey<FormFieldContext> = Symbol('tree-form-field');

/**
 * Resolve the id and description a control should carry. An explicit attribute
 * always wins over the field's, and outside a TFormField both are `undefined`.
 *
 * For a control with no labellable element, use `useFormFieldGroup`.
 */
export const useFormFieldIdentity = (attrs: Record<string, unknown>) => {
  const field = inject(formFieldInjectionKey, null);

  return {
    controlId: computed(() =>
      typeof attrs.id === 'string' ? attrs.id : field?.id.value,
    ),
    describedBy: computed(() =>
      typeof attrs['aria-describedby'] === 'string'
        ? (attrs['aria-describedby'] as string)
        : field?.describedBy.value,
    ),
  };
};

/**
 * The group counterpart: a control whose label names a REGION rather than one
 * element (radio group, toggle group). It releases the id — the field then
 * leaves `for` off and the group names itself with `aria-labelledby`, which is
 * what a `role="group"`/`role="radiogroup"` is supposed to do.
 */
export const useFormFieldGroup = (attrs: Record<string, unknown>) => {
  const field = inject(formFieldInjectionKey, null);

  field?.releaseId();

  return {
    labelledBy: computed(() => {
      if (typeof attrs['aria-labelledby'] === 'string') return attrs['aria-labelledby'];
      if (attrs['aria-label']) return undefined; // an explicit name wins
      return field?.labelId.value;
    }),
    describedBy: computed(() =>
      typeof attrs['aria-describedby'] === 'string'
        ? (attrs['aria-describedby'] as string)
        : field?.describedBy.value,
    ),
  };
};

/**
 * `v-model` modifiers (`.trim`, `.number`, and any custom one) arrive as a prop
 * named `modelModifiers`. Every control that accepts `v-model` should DECLARE
 * it, for two reasons: undeclared it falls through to `$attrs` and lands on an
 * inner element as an invalid DOM attribute, and under
 * `vueCompilerOptions.strictTemplates` every `v-model.trim` in a consumer app
 * becomes a type error.
 */
export interface TModelModifiers {
  modelModifiers?: Record<string, boolean>;
}
