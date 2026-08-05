import { computed, inject, type ComputedRef, type InjectionKey } from 'vue';

/**
 * Identity a TFormField hands down to the control it labels (TREEUX-009).
 *
 * A `<label for>` has to name a real control, so the id has to exist on both
 * sides. Making the app invent and repeat it by hand is a silent failure mode:
 * forget one half and nothing warns — the label simply names nothing. The
 * field mints the id and the control adopts it.
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
}

export const formFieldInjectionKey: InjectionKey<FormFieldContext> = Symbol('tree-form-field');

/**
 * Resolve the id and description a control should carry: an explicit attribute
 * always wins over the field's, and outside a TFormField both are `undefined`.
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
