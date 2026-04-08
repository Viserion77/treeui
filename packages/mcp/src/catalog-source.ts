import fs from 'node:fs';
import path from 'node:path';
import { parseAllDocuments } from 'yaml';
import type {
  TreeuiCatalog,
  TreeuiCatalogField,
  TreeuiComponentEntry,
  TreeuiComponentSetup,
  TreeuiDecisionGuide,
  TreeuiRecipe,
  TreeuiSelectionProfile,
  TreeuiSetupEntry,
} from './types';

type UnknownRecord = Record<string, unknown>;

const readText = (filePath: string) => fs.readFileSync(filePath, 'utf8');

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const slugify = (value: string) =>
  value
    .replace(/^T/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const stringifyValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
};

const normalizeStringList = (value: unknown): string[] => {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringList(item));
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'object') {
    return Object.entries(value as UnknownRecord).map(([key, entryValue]) =>
      normalizeWhitespace(`${key}: ${stringifyValue(entryValue) ?? ''}`),
    );
  }

  return [String(value)];
};

const normalizeComponentName = (rawName: unknown): string | undefined => {
  if (typeof rawName !== 'string' || !rawName.trim()) {
    return undefined;
  }

  const value = rawName.trim();

  if (value.startsWith('T')) {
    return value;
  }

  if (value.startsWith('Tree')) {
    return `T${value.slice(4)}`;
  }

  return `T${value}`;
};

const normalizeSourceFile = (rawValue: unknown): string | undefined => {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return undefined;
  }

  if (rawValue.startsWith('packages/')) {
    return rawValue;
  }

  if (rawValue.endsWith('.vue')) {
    return `packages/vue/src/components/${rawValue}`;
  }

  return rawValue;
};

const normalizeFieldMap = (value: unknown): TreeuiCatalogField[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === 'string'
        ? { name: entry }
        : {
            name: stringifyValue((entry as UnknownRecord).name) ?? 'unnamed',
            type: stringifyValue((entry as UnknownRecord).type),
            description: stringifyValue((entry as UnknownRecord).description),
          },
    );
  }

  if (typeof value !== 'object') {
    return [];
  }

  return Object.entries(value as UnknownRecord).map(([name, entry]) => {
    if (typeof entry === 'string') {
      return { name, description: entry };
    }

    if (Array.isArray(entry)) {
      return { name, values: entry.map((item) => String(item)) };
    }

    const record = (entry ?? {}) as UnknownRecord;
    const values = Array.isArray(record.values)
      ? record.values.map((item) => String(item))
      : undefined;

    return {
      name,
      type: stringifyValue(record.type),
      required: typeof record.required === 'boolean' ? record.required : undefined,
      default: stringifyValue(record.default),
      values,
      description: stringifyValue(record.description),
      note: stringifyValue(record.note),
      payload: stringifyValue(record.payload),
    };
  });
};

const normalizeEventList = (value: unknown): TreeuiCatalogField[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === 'string'
        ? { name: entry }
        : {
            name: stringifyValue((entry as UnknownRecord).name) ?? 'unnamed',
            description: stringifyValue((entry as UnknownRecord).description),
            payload: stringifyValue((entry as UnknownRecord).payload),
          },
    );
  }

  if (typeof value !== 'object') {
    return [];
  }

  return Object.entries(value as UnknownRecord).map(([name, entry]) => {
    if (typeof entry === 'string') {
      return { name, description: entry };
    }

    const record = (entry ?? {}) as UnknownRecord;
    return {
      name,
      description: stringifyValue(record.description),
      payload: stringifyValue(record.payload),
    };
  });
};

const normalizeSlotList = (value: unknown): TreeuiCatalogField[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((entry) =>
      typeof entry === 'string'
        ? { name: entry }
        : {
            name: stringifyValue((entry as UnknownRecord).name) ?? 'unnamed',
            description: stringifyValue((entry as UnknownRecord).description),
            note: stringifyValue((entry as UnknownRecord).bindings),
          },
    );
  }

  if (typeof value !== 'object') {
    return [];
  }

  return Object.entries(value as UnknownRecord).map(([name, entry]) => {
    if (typeof entry === 'string') {
      return { name, description: entry };
    }

    const record = (entry ?? {}) as UnknownRecord;
    return {
      name,
      description: stringifyValue(record.description),
      note: stringifyValue(record.bindings),
    };
  });
};

const normalizeSelectionProfile = (value: unknown): TreeuiSelectionProfile => {
  const record = (value ?? {}) as UnknownRecord;
  const alternatives = Array.isArray(record.alternatives)
    ? record.alternatives
        .map((entry) => {
          const alternative = entry as UnknownRecord;
          const component = stringifyValue(alternative.component);
          const when = stringifyValue(alternative.when);

          if (!component || !when) {
            return undefined;
          }

          return { component, when };
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    : [];

  return {
    keywords: normalizeStringList(record.keywords),
    useWhen: normalizeStringList(record.use_when),
    avoidWhen: normalizeStringList(record.avoid_when),
    alternatives,
  };
};

const normalizeSetupEntry = (value: unknown): TreeuiComponentSetup => {
  const record = (value ?? {}) as UnknownRecord;
  return {
    required: normalizeStringList(record.required),
    notes: normalizeStringList(record.notes),
  };
};

const normalizeDecisionGuides = (value: unknown): TreeuiDecisionGuide[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((guide) => {
    const record = guide as UnknownRecord;
    const options = Array.isArray(record.options)
      ? record.options.map((option) => {
          const optionRecord = option as UnknownRecord;
          return {
            use: String(optionRecord.use),
            when: normalizeStringList(optionRecord.when),
            notes: normalizeStringList(optionRecord.notes),
          };
        })
      : [];

    return {
      id: String(record.id),
      question: String(record.question),
      options,
    };
  });
};

const normalizeRecipes = (value: unknown): TreeuiRecipe[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((recipe) => {
    const record = recipe as UnknownRecord;
    return {
      id: String(record.id),
      name: String(record.name),
      useWhen: normalizeStringList(record.use_when),
      compose: normalizeStringList(record.compose),
      notes: normalizeStringList(record.notes),
    };
  });
};

const loadYamlDocuments = (filePath: string): UnknownRecord[] =>
  parseAllDocuments(readText(filePath))
    .map((document) => document.toJSON() as UnknownRecord | null)
    .filter((document): document is UnknownRecord => Boolean(document));

const buildStoryIndex = (repoRoot: string) => {
  const storiesDir = path.join(repoRoot, 'apps/docs/src/stories');
  const index = new Map<string, { storyFile: string; storyTitle?: string; category?: string }>();

  for (const fileName of fs.readdirSync(storiesDir)) {
    if (!fileName.endsWith('.stories.ts')) {
      continue;
    }

    const filePath = path.join(storiesDir, fileName);
    const source = readText(filePath);
    const componentMatch = source.match(/component:\s*(T[A-Za-z0-9]+)/);

    if (!componentMatch) {
      continue;
    }

    const componentName = componentMatch[1];
    const titleMatch = source.match(/title:\s*'([^']+)'/);
    const storyTitle = titleMatch?.[1];
    const titleParts = storyTitle?.split('/') ?? [];
    const category = titleParts.length > 2 ? titleParts.slice(1, -1).join(' / ') : titleParts[1];

    index.set(componentName, {
      storyFile: path.relative(repoRoot, filePath),
      storyTitle,
      category,
    });
  }

  return index;
};

export const buildCatalogFromRepo = (repoRoot: string): TreeuiCatalog => {
  const docsDir = path.join(repoRoot, 'docs/ai');
  const componentsDir = path.join(docsDir, 'COMPONENTS');
  const storyIndex = buildStoryIndex(repoRoot);

  const vuePackage = JSON.parse(
    readText(path.join(repoRoot, 'packages/vue/package.json')),
  ) as { name: string; version: string };
  const selectionDoc = loadYamlDocuments(path.join(docsDir, 'SELECTION.yaml'))[0] ?? {};
  const setupDoc = loadYamlDocuments(path.join(docsDir, 'SETUP.yaml'))[0] ?? {};
  const recipesDoc = loadYamlDocuments(path.join(docsDir, 'RECIPES.yaml'))[0] ?? {};
  const contractsDoc = loadYamlDocuments(path.join(docsDir, 'CONTRACTS.yaml'))[0] ?? {};

  const componentProfiles = (selectionDoc.component_profiles ?? {}) as UnknownRecord;
  const componentSetup = (setupDoc.component_setup ?? {}) as UnknownRecord;
  const aliasMap = (contractsDoc.compatibility_aliases ?? {}) as Record<string, string>;
  const recipes = normalizeRecipes(recipesDoc.recipes);

  const components = fs
    .readdirSync(componentsDir)
    .filter((fileName) => fileName.endsWith('.yaml'))
    .flatMap((fileName) => {
      const filePath = path.join(componentsDir, fileName);

      return loadYamlDocuments(filePath).flatMap((document) => {
        const name = normalizeComponentName(document.name ?? document.component);

        if (!name) {
          return [];
        }

        const story = storyIndex.get(name);
        const selection = normalizeSelectionProfile(componentProfiles[name]);
        const setup = normalizeSetupEntry(componentSetup[name]);
        const aliases = Array.from(
          new Set(
            [
              ...normalizeStringList(document.aliases),
              aliasMap[name],
              name.startsWith('T') ? `Tree${name.slice(1)}` : undefined,
            ].filter((value): value is string => Boolean(value)),
          ),
        );

        const componentRecipes = recipes
          .filter((recipe) => recipe.compose.includes(name))
          .map((recipe) => recipe.id);

        const entry: TreeuiComponentEntry = {
          name,
          legacyAlias: aliasMap[name] ?? aliases.find((alias) => alias.startsWith('Tree')),
          aliases,
          package: stringifyValue(document.package) ?? vuePackage.name,
          kind: stringifyValue(document.kind),
          category: story?.category,
          status: stringifyValue(document.status),
          description: stringifyValue(document.description),
          purpose: stringifyValue(document.purpose),
          sourceFile: normalizeSourceFile(document.source_file ?? document.source ?? document.provider_source_file),
          storyFile: story?.storyFile,
          storyTitle: story?.storyTitle,
          manifestFile: path.relative(repoRoot, filePath),
          props: normalizeFieldMap(document.props),
          events: normalizeEventList(document.events ?? document.toast_events),
          slots: normalizeSlotList(document.slots),
          a11y: normalizeStringList(document.a11y ?? document.accessibility),
          behavior: normalizeStringList(document.behavior),
          selection,
          setup,
          recipes: componentRecipes,
        };

        return [entry];
      });
    })
    .sort((left, right) => left.name.localeCompare(right.name));

  const setup: TreeuiSetupEntry = {
    install: {
      packageManagerExamples: ((setupDoc.install ?? {}) as UnknownRecord)
        .package_manager_examples as Record<string, string>,
      requiredImports: normalizeStringList(
        ((setupDoc.install ?? {}) as UnknownRecord).required_imports,
      ),
    },
    vueSetup: {
      pluginInstall: {
        import: String((((setupDoc.vue_setup ?? {}) as UnknownRecord).plugin_install as UnknownRecord).import),
        usage: String((((setupDoc.vue_setup ?? {}) as UnknownRecord).plugin_install as UnknownRecord).usage),
      },
      individualImports: {
        import: String((((setupDoc.vue_setup ?? {}) as UnknownRecord).individual_imports as UnknownRecord).import),
      },
      guidance: normalizeStringList(((setupDoc.vue_setup ?? {}) as UnknownRecord).guidance),
    },
    globalRules: normalizeStringList(setupDoc.global_rules),
    componentSetup: Object.fromEntries(
      Object.keys(componentSetup).map((name) => [name, normalizeSetupEntry(componentSetup[name])]),
    ),
    appPatterns: {
      providers: Array.isArray(((setupDoc.app_patterns ?? {}) as UnknownRecord).providers)
        ? ((((setupDoc.app_patterns ?? {}) as UnknownRecord).providers as UnknownRecord[]).map((entry) => ({
            component: String(entry.component),
            placement: String(entry.placement),
            reason: String(entry.reason),
          })))
        : [],
      commonCompositions: normalizeStringList(
        ((setupDoc.app_patterns ?? {}) as UnknownRecord).common_compositions,
      ),
    },
  };

  return {
    generatedAt: new Date().toISOString(),
    packageName: vuePackage.name,
    packageVersion: vuePackage.version,
    decisionGuides: normalizeDecisionGuides(selectionDoc.decision_guides),
    recipes,
    setup,
    components,
  };
};

export const getRepoRootFromPackageRoot = (packageRoot: string) =>
  path.resolve(packageRoot, '../..');

export const componentSlug = (componentName: string) => slugify(componentName);
