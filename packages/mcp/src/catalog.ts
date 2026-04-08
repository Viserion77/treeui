import rawCatalog from './generated/treeui.catalog.json' with { type: 'json' };
import type {
  TreeuiCatalog,
  TreeuiComponentEntry,
  TreeuiRecipe,
  TreeuiRecipeSearchResult,
  TreeuiSearchResult,
} from './types';

export const catalog = rawCatalog as TreeuiCatalog;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const tokenize = (value: string) => normalizeText(value).split(/\s+/).filter(Boolean);

const stringifyFields = (values: Array<string | undefined>) => values.filter(Boolean).join(' ');

const recipeSearchText = (recipe: TreeuiRecipe) =>
  normalizeText(
    stringifyFields([
      recipe.id,
      recipe.name,
      recipe.useWhen.join(' '),
      recipe.compose.join(' '),
      recipe.notes.join(' '),
    ]),
  );

const scoreMatch = (query: string, haystack: string) => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  if (haystack === normalizedQuery) {
    return 120;
  }

  let score = 0;

  if (haystack.includes(normalizedQuery)) {
    score += 40;
  }

  const tokens = tokenize(normalizedQuery);

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length > 3 ? 12 : 6;
    }
  }

  return score;
};

const scoreComponent = (component: TreeuiComponentEntry, query: string) => {
  const names = normalizeText(
    stringifyFields([component.name, component.legacyAlias, ...component.aliases]),
  );
  const keywords = normalizeText(component.selection.keywords.join(' '));
  const useWhen = normalizeText(component.selection.useWhen.join(' '));
  const avoidWhen = normalizeText(component.selection.avoidWhen.join(' '));
  const purpose = normalizeText(
    stringifyFields([component.description, component.purpose, component.kind, component.category]),
  );
  const api = normalizeText(
    stringifyFields([
      component.props.map((prop) => `${prop.name} ${prop.description ?? ''}`).join(' '),
      component.events.map((event) => event.name).join(' '),
      component.slots.map((slot) => slot.name).join(' '),
    ]),
  );

  let score = 0;
  score += scoreMatch(query, names) * 3;
  score += scoreMatch(query, keywords) * 2;
  score += scoreMatch(query, useWhen) * 2;
  score += scoreMatch(query, purpose);
  score += Math.floor(scoreMatch(query, api) / 2);
  score -= Math.floor(scoreMatch(query, avoidWhen) * 1.5);

  return Math.max(score, 0);
};

const hasIntentToken = (query: string, tokens: string[]) =>
  tokens.some((token) => normalizeText(query).includes(token));

const getIntentDelta = (component: TreeuiComponentEntry, query: string) => {
  const normalizedQuery = normalizeText(query);
  const positiveSelectionText = normalizeText(
    `${component.selection.keywords.join(' ')} ${component.selection.useWhen.join(' ')}`,
  );

  let delta = 0;

  const searchIntent = hasIntentToken(normalizedQuery, [
    'search',
    'searchable',
    'autocomplete',
    'filter',
    'filtering',
    'typeahead',
  ]);
  const multipleIntent = hasIntentToken(normalizedQuery, ['multiple', 'multi', 'many selected']);
  const singleIntent = hasIntentToken(normalizedQuery, ['single choice', 'single-choice', 'one value']);
  const hierarchyIntent = hasIntentToken(normalizedQuery, ['hierarchy', 'hierarchical', 'nested', 'tree']);
  const destructiveIntent = hasIntentToken(normalizedQuery, ['delete', 'destructive', 'confirm', 'confirmation']);
  const wrapperIntent = hasIntentToken(normalizedQuery, ['form field', 'label', 'hint', 'validation', 'error message']);
  const largeOptionIntent = hasIntentToken(normalizedQuery, ['many options', 'large list', 'long list', 'many']);

  if (searchIntent) {
    if (hasIntentToken(positiveSelectionText, ['search', 'searchable', 'autocomplete', 'filter'])) {
      delta += 36;
    }

    if (['TSelect', 'TToggleGroup', 'TRadioGroup'].includes(component.name)) {
      delta -= 18;
    }

    if (component.name === 'TFormField' && !wrapperIntent) {
      delta -= 30;
    }
  }

  if (multipleIntent) {
    if (['TMultiSelect', 'TToggleGroup', 'TTreeView', 'TCheckbox'].includes(component.name)) {
      delta += 24;
    }

    if (['TSelect', 'TRadioGroup'].includes(component.name)) {
      delta -= 24;
    }
  }

  if (singleIntent) {
    if (['TSelect', 'TCombobox', 'TRadioGroup', 'TToggleGroup', 'TSelectableList'].includes(component.name)) {
      delta += 12;
    }

    if (component.name === 'TMultiSelect') {
      delta -= 28;
    }
  }

  if (hierarchyIntent) {
    if (component.name === 'TTreeView') {
      delta += 32;
    }

    if (component.name === 'TSelectableList') {
      delta -= 8;
    }
  }

  if (destructiveIntent) {
    if (component.name === 'TConfirmDialog') {
      delta += 32;
    }

    if (component.name === 'TModal') {
      delta += 10;
    }
  }

  if (wrapperIntent) {
    if (component.name === 'TFormField') {
      delta += 32;
    }
  } else if (component.name === 'TFormField') {
    delta -= 12;
  }

  if (largeOptionIntent) {
    if (['TCombobox', 'TMultiSelect', 'TTreeView'].includes(component.name)) {
      delta += 12;
    }

    if (['TToggleGroup', 'TRadioGroup'].includes(component.name)) {
      delta -= 12;
    }
  }

  return delta;
};

const buildReasons = (component: TreeuiComponentEntry, query: string): string[] => {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return [];
  }

  const tokens = tokenize(normalizedQuery);
  const reasons = new Set<string>();

  if (normalizeText(component.name) === normalizedQuery || normalizeText(component.legacyAlias ?? '') === normalizedQuery) {
    reasons.add('exact component match');
  }

  if (component.selection.keywords.some((keyword) => tokens.some((token) => normalizeText(keyword).includes(token)))) {
    reasons.add('matched component keywords');
  }

  if (component.selection.useWhen.some((entry) => tokens.some((token) => normalizeText(entry).includes(token)))) {
    reasons.add('matched intended usage');
  }

  if ((component.description ?? component.purpose ?? '').length > 0 &&
      tokens.some((token) => normalizeText(component.description ?? component.purpose ?? '').includes(token))) {
    reasons.add('matched component description');
  }

  return Array.from(reasons);
};

export const findComponent = (name: string) => {
  const normalized = normalizeText(name);

  return catalog.components.find((component) => {
    const candidates = [component.name, component.legacyAlias, ...component.aliases]
      .filter(Boolean)
      .map((candidate) => normalizeText(candidate as string));

    if (candidates.includes(normalized)) {
      return true;
    }

    const stripped = normalized.replace(/^tree/, '').replace(/^t/, '');
    return candidates.some((candidate) => candidate.replace(/^tree/, '').replace(/^t/, '') === stripped);
  });
};

export const searchComponents = (query: string, limit = 8): TreeuiSearchResult[] =>
  catalog.components
    .map((component) => {
      const score = scoreComponent(component, query);

      return {
        component,
        score,
        reasons: buildReasons(component, query),
      };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.component.name.localeCompare(right.component.name))
    .slice(0, limit);

export const recommendComponents = (task: string, limit = 5): TreeuiSearchResult[] => {
  const results = new Map<string, TreeuiSearchResult>();
  const normalizedTask = normalizeText(task);
  const searchIntent = hasIntentToken(normalizedTask, [
    'search',
    'searchable',
    'autocomplete',
    'filter',
    'filtering',
    'typeahead',
  ]);
  const wrapperIntent = hasIntentToken(normalizedTask, ['form field', 'label', 'hint', 'validation', 'error message']);
  const largeOptionIntent = hasIntentToken(normalizedTask, ['many options', 'large list', 'long list', 'many']);
  const controlIntent = hasIntentToken(normalizedTask, ['choice', 'select', 'picker', 'input', 'field']);

  for (const result of searchComponents(task, limit * 3)) {
    result.score += getIntentDelta(result.component, task);

    if (result.component.name === 'TFormField' && controlIntent && !wrapperIntent) {
      result.score -= 42;
    }

    results.set(result.component.name, result);
  }

  for (const guide of catalog.decisionGuides) {
    const guideQuestionScore = scoreMatch(task, normalizeText(guide.question));

    for (const option of guide.options) {
      const optionText = normalizeText(`${option.use} ${option.when.join(' ')} ${option.notes.join(' ')}`);

      if (searchIntent && optionText.includes('not required')) {
        continue;
      }

      if (largeOptionIntent && (optionText.includes('small') || optionText.includes('stay visible'))) {
        continue;
      }

      const score = scoreMatch(task, optionText) + Math.floor(guideQuestionScore / 4);

      if (score <= 0) {
        continue;
      }

      const component = findComponent(option.use);

      if (!component) {
        continue;
      }

      const existing = results.get(component.name);
      const adjustedScore = score + getIntentDelta(component, task);

      if (existing) {
        existing.score += adjustedScore;
        if (!existing.reasons.includes(`matched decision guide: ${guide.id}`)) {
          existing.reasons.push(`matched decision guide: ${guide.id}`);
        }
      } else {
        results.set(component.name, {
          component,
          score: adjustedScore,
          reasons: [`matched decision guide: ${guide.id}`],
        });
      }
    }
  }

  return Array.from(results.values())
    .sort((left, right) => right.score - left.score || left.component.name.localeCompare(right.component.name))
    .slice(0, limit);
};

export const searchRecipes = (query: string, limit = 6): TreeuiRecipeSearchResult[] =>
  catalog.recipes
    .map((recipe) => ({
      recipe,
      score: scoreMatch(query, recipeSearchText(recipe)),
    }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.recipe.name.localeCompare(right.recipe.name))
    .slice(0, limit);

const formatFieldList = (label: string, values: string[]) =>
  values.length > 0 ? `${label}: ${values.join(', ')}` : undefined;

export const formatComponentSummary = (component: TreeuiComponentEntry) => {
  const lines = [
    `${component.name}${component.legacyAlias ? ` (${component.legacyAlias})` : ''}`,
    component.purpose ?? component.description ?? 'No summary available.',
    component.category ? `Category: ${component.category}` : undefined,
    component.kind ? `Kind: ${component.kind}` : undefined,
    formatFieldList(
      'When to use',
      component.selection.useWhen,
    ),
    formatFieldList(
      'Avoid when',
      component.selection.avoidWhen,
    ),
    formatFieldList(
      'Key props',
      component.props.slice(0, 8).map((prop) => prop.name),
    ),
    formatFieldList(
      'Events',
      component.events.map((event) => event.name),
    ),
    formatFieldList(
      'Slots',
      component.slots.map((slot) => slot.name),
    ),
    formatFieldList(
      'Setup',
      [...component.setup.required, ...component.setup.notes],
    ),
    component.recipes.length > 0 ? `Recipes: ${component.recipes.join(', ')}` : undefined,
  ].filter(Boolean);

  return lines.join('\n');
};

export const formatSearchResults = (results: TreeuiSearchResult[]) =>
  results.length > 0
    ? results
        .map((result, index) => {
          const summary = result.component.purpose ?? result.component.description ?? 'No summary available.';
          const reason = result.reasons.length > 0 ? ` Reason: ${result.reasons.join('; ')}.` : '';
          return `${index + 1}. ${result.component.name}: ${summary}.${reason}`;
        })
        .join('\n')
    : 'No matching TreeUI components found.';

export const formatRecipeResults = (results: TreeuiRecipeSearchResult[]) =>
  results.length > 0
    ? results
        .map((result, index) => {
          const useWhen = result.recipe.useWhen[0];
          return `${index + 1}. ${result.recipe.name}: ${useWhen ?? 'No recipe summary available.'} Components: ${result.recipe.compose.join(', ')}.`;
        })
        .join('\n')
    : 'No matching TreeUI recipes found.';

export const formatSetupGuide = (componentName?: string) => {
  if (!componentName) {
    return [
      '@treeui/vue setup',
      `Install: ${Object.values(catalog.setup.install.packageManagerExamples).join(' | ')}`,
      `Required imports: ${catalog.setup.install.requiredImports.join(', ')}`,
      `Plugin: ${catalog.setup.vueSetup.pluginInstall.import} -> ${catalog.setup.vueSetup.pluginInstall.usage}`,
      `Named imports: ${catalog.setup.vueSetup.individualImports.import}`,
      `Global rules: ${catalog.setup.globalRules.join(' | ')}`,
    ].join('\n');
  }

  const component = findComponent(componentName);

  if (!component) {
    return `Component "${componentName}" was not found in the TreeUI catalog.`;
  }

  const notes = [...component.setup.required, ...component.setup.notes];

  return [
    `${component.name} setup`,
    notes.length > 0 ? notes.join(' | ') : 'No component-specific setup notes.',
    `Global rules: ${catalog.setup.globalRules.join(' | ')}`,
  ].join('\n');
};
