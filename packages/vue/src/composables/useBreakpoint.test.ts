import { defineComponent } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { useBreakpoint } from './useBreakpoint';

/**
 * jsdom implements `matchMedia` only as a stub in some versions, so the query
 * objects are installed here. The composable reads `window.innerWidth` on each
 * change event, which is what these drive.
 */
const withViewport = (width: number) => {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
  window.matchMedia = ((query: string) => ({
    matches: width >= Number.parseFloat(/\d+/.exec(query)?.[0] ?? '0'),
    media: query,
    addEventListener: (_: string, fn: () => void) => listeners.add(fn),
    removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
  })) as unknown as typeof window.matchMedia;
  return {
    resize(next: number) {
      (window as { innerWidth: number }).innerWidth = next;
      for (const fn of listeners) fn();
    },
  };
};

const host = () => {
  const seen: { api?: ReturnType<typeof useBreakpoint> } = {};
  const Component = defineComponent({
    setup() {
      seen.api = useBreakpoint();
      return () => null;
    },
  });
  mount(Component);
  return seen.api!;
};

describe('useBreakpoint', () => {
  it('reports the largest breakpoint the viewport has reached', () => {
    withViewport(1100);
    const { current, at, below } = host();

    // 1100 is past lg (1024) but not xl (1280).
    expect(current.value).toBe('lg');
    expect(at('md')).toBe(true);
    expect(at('lg')).toBe(true);
    expect(at('xl')).toBe(false);
    expect(below('xl')).toBe(true);
  });

  it('reports `base` below the smallest breakpoint', () => {
    withViewport(500);
    expect(host().current.value).toBe('base');
  });

  it('follows a resize across a boundary', () => {
    const viewport = withViewport(500);
    const { current } = host();
    expect(current.value).toBe('base');

    viewport.resize(800);
    // 800 is past sm (640) and md (768).
    expect(current.value).toBe('md');
  });

  it('uses the boundaries the token layer ships, so it cannot drift from TShow', () => {
    // --tree-breakpoint-md is 768px: `at('md')` must be false at 767 and true
    // at 768, matching `TShow at="md"`, which is generated from the same value.
    const viewport = withViewport(767);
    const { at } = host();
    expect(at('md')).toBe(false);

    viewport.resize(768);
    expect(at('md')).toBe(true);
  });
});
