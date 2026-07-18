import './styles/index.css';

export * from './components';
export * from './plugin';
export * from './types/contracts';
export { useTheme } from './composables/useTheme';
export type {
  TThemeMode,
  TResolvedTheme,
  UseThemeOptions,
  UseThemeReturn,
} from './composables/useTheme';
export { useToast } from './composables/useToast';
export type { ToastVariant, ToastPosition, ToastOptions, ToastItem } from './composables/useToast';

export { TreeUIPlugin as default } from './plugin';
