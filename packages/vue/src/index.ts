import './styles/index.css';

export * from './components';
export * from './plugin';
// Types the plugin's global registration, and the attribute surface every
// component accepts, so `vue-tsc --strictTemplates` reports a prop that does not
// exist without rejecting a legitimate `aria-label`. This is a TYPE re-export on
// purpose: a bare side-effect import is elided from the emitted `index.d.ts`,
// which left the augmentation unreachable from `dist/`. See global-components.ts.
export type {
  TreeUIGlobalComponentsRegistered,
  TreeUIPassthroughAttributes,
} from './global-components';
export * from './types/contracts';
export { useTheme } from './composables/useTheme';
export type {
  TThemeMode,
  TResolvedTheme,
  UseThemeOptions,
  UseThemeReturn,
} from './composables/useTheme';
export { useDrop } from './composables/useDrop';
export type { UseDropOptions, UseDropReturn } from './composables/useDrop';
export { useDecorativeCanvas } from './composables/useDecorativeCanvas';
export type {
  DecorativeCanvasFrame,
  UseDecorativeCanvasOptions,
  UseDecorativeCanvasReturn,
} from './composables/useDecorativeCanvas';
export { useCanvasSurface } from './composables/useCanvasSurface';
export type {
  CanvasSurfaceFrame,
  CanvasSurfacePoint,
  UseCanvasSurfaceOptions,
  UseCanvasSurfaceReturn,
} from './composables/useCanvasSurface';
export { useToast } from './composables/useToast';
export type { ToastVariant, ToastPosition, ToastOptions, ToastItem } from './composables/useToast';

export { TreeUIPlugin as default } from './plugin';
