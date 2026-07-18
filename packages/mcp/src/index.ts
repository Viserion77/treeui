export { catalog } from './catalog';
export {
  findComponent,
  formatComponentSummary,
  formatRecipeResults,
  formatSearchResults,
  formatSetupGuide,
  formatTokenResults,
  recommendComponents,
  searchComponents,
  searchRecipes,
  searchTokens,
} from './catalog';
export { buildCatalogFromRepo, getRepoRootFromPackageRoot } from './catalog-source';
export { buildTokenEntries } from './token-source';
export { createTreeuiMcpServer } from './server';
export type {
  TreeuiCatalog,
  TreeuiCatalogField,
  TreeuiComponentEntry,
  TreeuiDecisionGuide,
  TreeuiRecipe,
  TreeuiSearchResult,
  TreeuiSetupEntry,
  TreeuiTokenEntry,
  TreeuiTokenSearchResult,
} from './types';
