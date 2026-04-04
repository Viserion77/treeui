import type { App, Plugin } from 'vue';
import {
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
  TSpinner,
  TSwitch,
  TTextarea,
  TTooltip,
} from './components';

const components = {
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
  TSpinner,
  TSwitch,
  TTextarea,
  TTooltip,
  TreeBadge: TBadge,
  TreeButton: TButton,
  TreeCard: TCard,
  TreeCheckbox: TCheckbox,
  TreeDatePicker: TDatePicker,
  TreeRadio: TRadio,
  TreeRadioGroup: TRadioGroup,
  TreeSelect: TSelect,
  TreeInput: TInput,
  TreeTextarea: TTextarea,
  TreeModal: TModal,
  TreeSpinner: TSpinner,
  TreeFormField: TFormField,
  TreeSwitch: TSwitch,
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
