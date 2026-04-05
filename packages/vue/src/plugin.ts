import type { App, Plugin } from 'vue';
import {
  TAlert,
  TBadge,
  TButton,
  TCard,
  TCheckbox,
  TDatePicker,
  TFormField,
  TInput,
  TModal,
  TProgress,
  TRadio,
  TRadioGroup,
  TSelect,
  TSkeleton,
  TSpinner,
  TSwitch,
  TTextarea,
  TToast,
  TToastProvider,
  TTooltip,
} from './components';

const components = {
  TAlert,
  TBadge,
  TButton,
  TCard,
  TCheckbox,
  TDatePicker,
  TFormField,
  TInput,
  TModal,
  TRadio,
  TRadioGroup,
  TSelect,
  TSkeleton,
  TSpinner,
  TSwitch,
  TTextarea,
  TToast,
  TToastProvider,
  TProgress,
  TTooltip,
  TreeAlert: TAlert,
  TreeBadge: TBadge,
  TreeButton: TButton,
  TreeCard: TCard,
  TreeCheckbox: TCheckbox,
  TreeDatePicker: TDatePicker,
  TreeRadio: TRadio,
  TreeRadioGroup: TRadioGroup,
  TreeSelect: TSelect,
  TreeSkeleton: TSkeleton,
  TreeInput: TInput,
  TreeTextarea: TTextarea,
  TreeModal: TModal,
  TreeSpinner: TSpinner,
  TreeFormField: TFormField,
  TreeProgress: TProgress,
  TreeSwitch: TSwitch,
  TreeToast: TToast,
  TreeToastProvider: TToastProvider,
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
