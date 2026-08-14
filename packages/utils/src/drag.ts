/**
 * Drag-and-drop arithmetic.
 *
 * Pure, DOM-free, and framework-agnostic — the Vue composable that owns the
 * listeners builds on this, and a React one would reuse it unchanged. Two
 * consumers arrived at the same three rules independently, which is why they
 * belong here rather than in each product:
 *
 *  1. **A `dragleave` from the parent fires before the `dragenter` of a child**,
 *     so a boolean "is hovering" flickers off every time the pointer crosses an
 *     inner element. It has to be a depth counter.
 *  2. **`preventDefault` must be conditional on the payload.** Applied
 *     unconditionally on `dragover`, dragging TEXT into a field stops working;
 *     omitted, the browser NAVIGATES to the dropped file and the session is
 *     gone.
 *  3. **What counts as an acceptable payload is the product's**, not the
 *     library's: files for an upload, `application/x-<app>-task` for a card.
 */

/** The subset of `DataTransfer` this module needs, so tests need no DOM. */
export interface DragPayload {
  types: readonly string[];
  files?: ArrayLike<File>;
  getData?: (format: string) => string;
}

/**
 * Does this drag carry something the target declared it accepts?
 *
 * `accepts` is a list of `DataTransfer` types. `'Files'` is the browser's own
 * name for a file drag, so an upload target passes `['Files']` and a card
 * target passes its custom MIME type — one predicate, no special case.
 */
export const dragCarriesTypes = (
  payload: Pick<DragPayload, 'types'> | null | undefined,
  accepts: readonly string[],
): boolean => {
  if (!payload || accepts.length === 0) return false;
  const types = Array.from(payload.types ?? []);
  return accepts.some((accepted) => types.includes(accepted));
};

/** Convenience for the common case: `dragCarriesTypes(payload, ['Files'])`. */
export const dragCarriesFiles = (payload: Pick<DragPayload, 'types'> | null | undefined) =>
  dragCarriesTypes(payload, ['Files']);

/**
 * Next value of the enter/leave depth counter. Never goes below zero: a
 * `dragleave` can arrive without its matching `dragenter` when the drag starts
 * inside the target, and a negative depth would then keep the veil open
 * forever.
 */
export const nextDragDepth = (depth: number, delta: 1 | -1): number =>
  Math.max(0, depth + delta);

/** Files carried by the drag, optionally filtered by an `accept` list. */
export const filesFromTransfer = (
  payload: Pick<DragPayload, 'files'> | null | undefined,
  accept?: string,
): File[] => {
  const files = Array.from(payload?.files ?? []);
  if (!accept) return files;

  const patterns = accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (patterns.length === 0) return files;

  return files.filter((file) => patterns.some((pattern) => fileMatchesPattern(file, pattern)));
};

/** `image/*`, `.png` and `image/png` are the three shapes an `accept` entry takes. */
export const fileMatchesPattern = (file: File, pattern: string): boolean => {
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  if (pattern.startsWith('.')) return name.endsWith(pattern);
  if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
  return type === pattern;
};

/**
 * Read a custom payload back out of the drag, parsing JSON when it is JSON.
 * Returns `null` rather than throwing, because a drag from another application
 * can carry anything at all under the same type.
 */
export const payloadFromTransfer = <T>(
  payload: Pick<DragPayload, 'types' | 'getData'> | null | undefined,
  type: string,
): T | null => {
  if (!payload?.getData || !Array.from(payload.types ?? []).includes(type)) return null;

  const raw = payload.getData(type);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
};
