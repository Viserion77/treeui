export { catalog } from './catalog';
export {
  findComponent,
  formatComponentSummary,
  formatRecipeResults,
  formatSearchResults,
  formatSetupGuide,
  recommendComponents,
  searchComponents,
  searchRecipes,
} from './catalog';
export { buildCatalogFromRepo, getRepoRootFromPackageRoot } from './catalog-source';
export { createTreeuiMcpServer } from './server';
export type {
  TreeuiCatalog,
  TreeuiCatalogField,
  TreeuiComponentEntry,
  TreeuiDecisionGuide,
  TreeuiRecipe,
  TreeuiSearchResult,
  TreeuiSetupEntry,
} from './types';
