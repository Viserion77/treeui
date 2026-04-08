import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  catalog,
  findComponent,
  formatComponentSummary,
  formatRecipeResults,
  formatSearchResults,
  formatSetupGuide,
  recommendComponents,
  searchComponents,
  searchRecipes,
} from './catalog';

const resourceList = [
  {
    uri: 'treeui://catalog',
    name: 'TreeUI catalog',
    description: 'Normalized TreeUI AI catalog built from docs/ai.',
    mimeType: 'application/json',
  },
  {
    uri: 'treeui://selection',
    name: 'TreeUI selection guides',
    description: 'Decision guides and component choice heuristics.',
    mimeType: 'application/json',
  },
  {
    uri: 'treeui://setup',
    name: 'TreeUI setup guide',
    description: 'Install and wiring rules for TreeUI consumer apps.',
    mimeType: 'application/json',
  },
  {
    uri: 'treeui://recipes',
    name: 'TreeUI recipes',
    description: 'Reusable multi-component composition recipes.',
    mimeType: 'application/json',
  },
  ...catalog.components.map((component) => ({
    uri: `treeui://components/${component.name}`,
    name: component.name,
    description: component.purpose ?? component.description ?? 'TreeUI component',
    mimeType: 'application/json',
  })),
];

const readResourcePayload = (uri: string) => {
  if (uri === 'treeui://catalog') {
    return catalog;
  }

  if (uri === 'treeui://selection') {
    return {
      decisionGuides: catalog.decisionGuides,
      components: catalog.components.map((component) => ({
        name: component.name,
        legacyAlias: component.legacyAlias,
        selection: component.selection,
      })),
    };
  }

  if (uri === 'treeui://setup') {
    return catalog.setup;
  }

  if (uri === 'treeui://recipes') {
    return catalog.recipes;
  }

  const componentMatch = uri.match(/^treeui:\/\/components\/([^/]+)$/);

  if (componentMatch) {
    const component = findComponent(componentMatch[1]);

    if (component) {
      return component;
    }
  }

  return undefined;
};

const asTextContent = (text: string) => ({
  content: [{ type: 'text', text }],
});

const asErrorTextContent = (text: string) => ({
  content: [{ type: 'text', text }],
  isError: true,
});

const readStringArg = (args: unknown, key: string) => {
  if (!args || typeof args !== 'object') {
    return undefined;
  }

  const value = (args as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
};

const readNumberArg = (args: unknown, key: string, fallback: number) => {
  if (!args || typeof args !== 'object') {
    return fallback;
  }

  const value = (args as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

export const createTreeuiMcpServer = () => {
  const server = new Server(
    {
      name: '@treeui/mcp',
      version: catalog.packageVersion,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_components',
        description: 'Search TreeUI components by use case, keywords, or component name.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'What the user is trying to build or the component they need.' },
            limit: { type: 'number', description: 'Maximum number of results to return.' },
          },
          required: ['query'],
        },
      },
      {
        name: 'recommend_components',
        description: 'Recommend the best TreeUI components for a task and surface relevant alternatives.',
        inputSchema: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Natural-language description of the UI need.' },
            limit: { type: 'number', description: 'Maximum number of recommendations to return.' },
          },
          required: ['task'],
        },
      },
      {
        name: 'get_component',
        description: 'Return a detailed summary for one TreeUI component.',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Component name or alias, such as TSelect or TreeSelect.' },
          },
          required: ['name'],
        },
      },
      {
        name: 'get_setup_guide',
        description: 'Return general TreeUI setup guidance or setup notes for one component.',
        inputSchema: {
          type: 'object',
          properties: {
            component: { type: 'string', description: 'Optional component name or alias.' },
          },
        },
      },
      {
        name: 'search_recipes',
        description: 'Search TreeUI multi-component composition recipes.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Feature or composition to search for.' },
            limit: { type: 'number', description: 'Maximum number of recipes to return.' },
          },
          required: ['query'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'search_components') {
      const query = readStringArg(args, 'query');

      if (!query) {
        return asErrorTextContent('The "query" argument is required.');
      }

      return asTextContent(formatSearchResults(searchComponents(query, readNumberArg(args, 'limit', 8))));
    }

    if (name === 'recommend_components') {
      const task = readStringArg(args, 'task');

      if (!task) {
        return asErrorTextContent('The "task" argument is required.');
      }

      return asTextContent(formatSearchResults(recommendComponents(task, readNumberArg(args, 'limit', 5))));
    }

    if (name === 'get_component') {
      const componentName = readStringArg(args, 'name');

      if (!componentName) {
        return asErrorTextContent('The "name" argument is required.');
      }

      const component = findComponent(componentName);

      if (!component) {
        return asErrorTextContent(`Component "${componentName}" was not found in the TreeUI catalog.`);
      }

      return asTextContent(formatComponentSummary(component));
    }

    if (name === 'get_setup_guide') {
      return asTextContent(formatSetupGuide(readStringArg(args, 'component')));
    }

    if (name === 'search_recipes') {
      const query = readStringArg(args, 'query');

      if (!query) {
        return asErrorTextContent('The "query" argument is required.');
      }

      return asTextContent(formatRecipeResults(searchRecipes(query, readNumberArg(args, 'limit', 6))));
    }

    return asErrorTextContent(`Unknown tool: ${name}`);
  });

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: resourceList,
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const payload = readResourcePayload(request.params.uri);

    if (!payload) {
      throw new Error(`Unknown resource: ${request.params.uri}`);
    }

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify(payload, null, 2),
        },
      ],
    };
  });

  return server;
};
