<script setup lang="ts">
import { ref } from 'vue';
import {
  TButton, TCheckbox, TFormField, TInput, TNavMenu, TNumberInput, TSelect, TTab, TTabList,
  TTable, TTabs, TTag, TTextarea, TToggleGroup,
} from '@treeui/vue';

const text = ref('');
const count = ref(0);
// `TNumberInput` really can emit `null` — clearing the field is not an error
// state, it is empty. So a consumer binding it needs a nullable ref, and the
// probe says so rather than pretending otherwise. This is a contract, not a
// typing gap: see COMPONENTS/number-input.yaml.
const port = ref<number | null>(null);
const tab = ref<'a' | 'b'>('a');
const choice = ref<'x' | 'y'>('x');
const flag = ref(false);
</script>

<template>
  <TTable aria-label="Recursos" :columns="[]" :rows="[]" />
  <TSelect aria-label="Regiao" :options="[]" />
  <TNavMenu aria-label="Principal" :items="[]" />
  <TInput id="k" aria-label="Chave" readonly @blur="() => {}" @keyup="() => {}" />
  <TInput type="number" aria-label="Porta" min="1" max="65535" step="1" inputmode="numeric" />
  <TTextarea aria-label="JSON" readonly :maxlength="2000" />
  <TButton as="a" href="/download" download target="_blank" rel="noopener">Baixar</TButton>
  <TNumberInput aria-label="Timeout" :min="0" :max="10" v-model="port" />
  <TTag data-testid="x" @click="() => {}">x</TTag>

  <TInput v-model.trim="text" />
  <TTextarea v-model.trim="text" />

  <TInput v-model="count" />
  <TButton variant="ghost" tone="danger">Excluir</TButton>
  <TTabs v-model="tab"><TTabList><TTab value="a">A</TTab></TTabList></TTabs>
  <TToggleGroup v-model="choice" :options="[{ label: 'X', value: 'x' }]" />
  <TCheckbox v-model="flag" label="ok" />
  <TFormField label="Campo"><TInput v-model="text" /></TFormField>
</template>
