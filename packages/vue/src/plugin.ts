import type { App, Plugin } from 'vue';
import {
  TBadge,
  TButton,
  TCard,
  TDatePicker,
  TInput,
  TModal,
  TSpinner,
  TTooltip,
} from './components';

const components = {
  TBadge,
  TButton,
  TCard,
  TDatePicker,
  TInput,
  TModal,
  TSpinner,
  TTooltip,
  TreeBadge: TBadge,
  TreeButton: TButton,
  TreeCard: TCard,
  TreeDatePicker: TDatePicker,
  TreeInput: TInput,
  TreeModal: TModal,
  TreeSpinner: TSpinner,
  TreeTooltip: TTooltip,
};

export const TreeUIPlugin: Plugin = {
  install(app: App) {
    Object.entries(components).forEach(([name, component]) => {
      app.component(name, component);
    });
  },
};

export const install = TreeUIPlugin.install;
