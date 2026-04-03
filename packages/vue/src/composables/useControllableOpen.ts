import { computed, ref, type Ref } from 'vue';

export const useControllableOpen = (
  controlledValue: Ref<boolean | undefined>,
  defaultValue: boolean,
  onChange: (value: boolean) => void,
) => {
  const uncontrolledValue = ref(defaultValue);

  const value = computed(() => controlledValue.value ?? uncontrolledValue.value);

  const setValue = (nextValue: boolean) => {
    if (nextValue === value.value) {
      return;
    }

    if (controlledValue.value === undefined) {
      uncontrolledValue.value = nextValue;
    }

    onChange(nextValue);
  };

  return {
    value,
    setValue,
  };
};

