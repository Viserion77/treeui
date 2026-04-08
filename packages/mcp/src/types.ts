export interface TreeuiCatalogField {
  name: string;
  type?: string;
  required?: boolean;
  default?: string;
  values?: string[];
  description?: string;
  note?: string;
  payload?: string;
}

export interface TreeuiAlternative {
  component: string;
  when: string;
}

export interface TreeuiSelectionProfile {
  keywords: string[];
  useWhen: string[];
  avoidWhen: string[];
  alternatives: TreeuiAlternative[];
}

export interface TreeuiComponentSetup {
  required: string[];
  notes: string[];
}

export interface TreeuiComponentEntry {
  name: string;
  legacyAlias?: string;
  aliases: string[];
  package: string;
  kind?: string;
  category?: string;
  status?: string;
  description?: string;
  purpose?: string;
  sourceFile?: string;
  storyFile?: string;
  storyTitle?: string;
  manifestFile?: string;
  props: TreeuiCatalogField[];
  events: TreeuiCatalogField[];
  slots: TreeuiCatalogField[];
  a11y: string[];
  behavior: string[];
  selection: TreeuiSelectionProfile;
  setup: TreeuiComponentSetup;
  recipes: string[];
}

export interface TreeuiDecisionGuideOption {
  use: string;
  when: string[];
  notes: string[];
}

export interface TreeuiDecisionGuide {
  id: string;
  question: string;
  options: TreeuiDecisionGuideOption[];
}

export interface TreeuiRecipe {
  id: string;
  name: string;
  useWhen: string[];
  compose: string[];
  notes: string[];
}

export interface TreeuiSetupEntry {
  install: {
    packageManagerExamples: Record<string, string>;
    requiredImports: string[];
  };
  vueSetup: {
    pluginInstall: {
      import: string;
      usage: string;
    };
    individualImports: {
      import: string;
    };
    guidance: string[];
  };
  globalRules: string[];
  componentSetup: Record<string, TreeuiComponentSetup>;
  appPatterns: {
    providers: Array<{
      component: string;
      placement: string;
      reason: string;
    }>;
    commonCompositions: string[];
  };
}

export interface TreeuiCatalog {
  generatedAt: string;
  packageName: string;
  packageVersion: string;
  decisionGuides: TreeuiDecisionGuide[];
  recipes: TreeuiRecipe[];
  setup: TreeuiSetupEntry;
  components: TreeuiComponentEntry[];
}

export interface TreeuiSearchResult {
  component: TreeuiComponentEntry;
  score: number;
  reasons: string[];
}

export interface TreeuiRecipeSearchResult {
  recipe: TreeuiRecipe;
  score: number;
}
