/**
 * `list-style: none` makes Safari/VoiceOver drop the list role from a `<ul>` —
 * the element stops being announced as "list, N items", which is the entire
 * reason a consumer chose `as="ul"` in the first place. The layout primitives
 * reset the user-agent list box (TREEUX-044), so they put the role back.
 *
 * Applied BEFORE the attrs fallthrough in each template, so a consumer that
 * passes its own `role` still wins.
 */
const LIST_ELEMENTS = new Set(['ul', 'ol', 'menu']);

export const listRoleFor = (as: unknown): 'list' | undefined =>
  typeof as === 'string' && LIST_ELEMENTS.has(as) ? 'list' : undefined;
