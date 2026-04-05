import { readonly, ref } from 'vue';
import { createId } from '@treeui/utils';

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  closable?: boolean;
}

export interface ToastItem extends Required<Pick<ToastOptions, 'title' | 'variant' | 'duration' | 'closable'>> {
  id: string;
  description?: string;
}

const toasts = ref<ToastItem[]>([]);
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function add(options: ToastOptions): string {
  const id = createId('tree-toast');

  const item: ToastItem = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant ?? 'info',
    duration: options.duration ?? 5000,
    closable: options.closable ?? true,
  };

  toasts.value = [...toasts.value, item];

  if (item.duration > 0) {
    const timer = setTimeout(() => {
      remove(id);
    }, item.duration);
    timers.set(id, timer);
  }

  return id;
}

function remove(id: string) {
  const timer = timers.get(id);

  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }

  toasts.value = toasts.value.filter((t) => t.id !== id);
}

function clear() {
  for (const timer of timers.values()) {
    clearTimeout(timer);
  }

  timers.clear();
  toasts.value = [];
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    add,
    remove,
    clear,
  };
}
