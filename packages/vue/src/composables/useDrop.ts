import {
  dragCarriesTypes,
  filesFromTransfer,
  nextDragDepth,
  payloadFromTransfer,
} from '@treeui/utils';
import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Drop target for a page or a region (TREEUX-022 / TREEUX-040).
 *
 * One mechanism, two scopes, because the browser is the same in both. What the
 * library owns is the part every consumer got wrong the same way:
 *
 *  - the **depth counter**, because a parent's `dragleave` fires before a
 *    child's `dragenter` and a boolean flickers off on every inner element;
 *  - `preventDefault` **conditioned on the payload** — unconditional and
 *    dragging text into a field stops working, absent and the browser navigates
 *    to the dropped file and the session is gone;
 *  - `preventDefault` on the drop itself, for the same reason;
 *  - cleanup, which is what leaks when this is written per screen.
 *
 * What the product owns: what to accept, and what to do with it.
 */
export interface UseDropOptions<T = unknown> {
  /**
   * `DataTransfer` types this target accepts. `'Files'` is the browser's own
   * name for a file drag; a card drag passes its custom MIME type.
   */
  accepts: readonly string[];
  /**
   * `page` listens on `window`, so the whole viewport is the target even over
   * chrome that is outside this component's subtree. `region` listens on the
   * element in `targetRef`.
   */
  scope?: 'page' | 'region';
  /** Element that is the target when `scope` is `region`. */
  targetRef?: Ref<HTMLElement | null>;
  /** `accept` string used to filter the dropped files (`image/*,.pdf`). */
  accept?: string;
  /** Called on a valid drop with the files the drag carried. */
  onDropFiles?: (files: File[]) => void;
  /** Called on a valid drop with the custom payload, parsed when it is JSON. */
  onDropPayload?: (payload: T, type: string) => void;
  disabled?: boolean;
}

export interface UseDropReturn {
  /** True while an acceptable drag is over the target. Drives the veil. */
  isOver: Ref<boolean>;
  /** Handlers to bind by hand when `scope` is `region` and you own the element. */
  handlers: {
    onDragenter: (event: DragEvent) => void;
    onDragover: (event: DragEvent) => void;
    onDragleave: (event: DragEvent) => void;
    onDrop: (event: DragEvent) => void;
  };
}

export const useDrop = <T = unknown>(options: UseDropOptions<T>): UseDropReturn => {
  const { accepts, scope = 'region', targetRef, accept, onDropFiles, onDropPayload } = options;

  const depth = ref(0);
  const isOver = computed(() => depth.value > 0);

  const carriesAcceptedPayload = (event: DragEvent) =>
    !options.disabled && dragCarriesTypes(event.dataTransfer, accepts);

  const onDragenter = (event: DragEvent) => {
    if (!carriesAcceptedPayload(event)) return;
    event.preventDefault();
    depth.value = nextDragDepth(depth.value, 1);
  };

  const onDragover = (event: DragEvent) => {
    // Conditional, always. Without the guard, dragging selected TEXT into an
    // input inside the region stops working; without the preventDefault at all,
    // the browser navigates away to the file and the page is gone.
    if (!carriesAcceptedPayload(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  };

  const onDragleave = (event: DragEvent) => {
    if (!carriesAcceptedPayload(event)) return;
    depth.value = nextDragDepth(depth.value, -1);
  };

  const onDrop = (event: DragEvent) => {
    if (!carriesAcceptedPayload(event)) return;
    event.preventDefault();
    depth.value = 0;

    const transfer = event.dataTransfer;
    if (!transfer) return;

    if (onDropFiles && dragCarriesTypes(transfer, ['Files'])) {
      onDropFiles(filesFromTransfer(transfer, accept));
    }

    if (onDropPayload) {
      for (const type of accepts) {
        if (type === 'Files') continue;
        const payload = payloadFromTransfer<T>(transfer, type);
        if (payload !== null) {
          onDropPayload(payload, type);
          break;
        }
      }
    }
  };

  const handlers = { onDragenter, onDragover, onDragleave, onDrop };

  // `page` binds itself; `region` hands the handlers back for the consumer to
  // spread, so the element stays the component's and no extra wrapper appears.
  const bind = (target: EventTarget) => {
    target.addEventListener('dragenter', onDragenter as EventListener);
    target.addEventListener('dragover', onDragover as EventListener);
    target.addEventListener('dragleave', onDragleave as EventListener);
    target.addEventListener('drop', onDrop as EventListener);
  };

  const unbind = (target: EventTarget) => {
    target.removeEventListener('dragenter', onDragenter as EventListener);
    target.removeEventListener('dragover', onDragover as EventListener);
    target.removeEventListener('dragleave', onDragleave as EventListener);
    target.removeEventListener('drop', onDrop as EventListener);
  };

  let bound: EventTarget | null = null;

  onMounted(() => {
    if (typeof window === 'undefined') return;
    bound = scope === 'page' ? window : (targetRef?.value ?? null);
    if (bound) bind(bound);
  });

  onBeforeUnmount(() => {
    if (bound) unbind(bound);
    bound = null;
  });

  return { isOver, handlers };
};
