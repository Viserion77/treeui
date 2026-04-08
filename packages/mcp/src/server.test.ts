// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createTreeuiMcpServer } from './server';

const activeConnections: Array<{
  client: Client;
  clientTransport: InMemoryTransport;
  serverTransport: InMemoryTransport;
  server: ReturnType<typeof createTreeuiMcpServer>;
}> = [];

const connectClient = async () => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createTreeuiMcpServer();
  const client = new Client(
    {
      name: 'treeui-mcp-test-client',
      version: '0.1.0',
    },
    {
      capabilities: {},
    },
  );

  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);

  activeConnections.push({ client, clientTransport, serverTransport, server });
  return { client };
};

afterEach(async () => {
  while (activeConnections.length > 0) {
    const connection = activeConnections.pop();

    if (!connection) {
      continue;
    }

    await connection.client.close();
    await connection.server.close();
    await connection.clientTransport.close();
    await connection.serverTransport.close();
  }
});

describe('@treeui/mcp server', () => {
  it('lists tools and resources over MCP', async () => {
    const { client } = await connectClient();
    const tools = await client.listTools();
    const resources = await client.listResources();

    const toolNames = tools.tools.map((tool) => tool.name);
    const resourceUris = resources.resources.map((resource) => resource.uri);

    expect(toolNames).toEqual(
      expect.arrayContaining([
        'search_components',
        'recommend_components',
        'get_component',
        'get_setup_guide',
        'search_recipes',
      ]),
    );
    expect(resourceUris).toEqual(
      expect.arrayContaining([
        'treeui://catalog',
        'treeui://selection',
        'treeui://setup',
        'treeui://recipes',
        'treeui://components/TSelect',
      ]),
    );
  });

  it('returns component recommendations and setup guidance', async () => {
    const { client } = await connectClient();

    const recommendation = await client.callTool({
      name: 'recommend_components',
      arguments: {
        task: 'searchable single-choice field for many options',
      },
    });
    const setupGuide = await client.callTool({
      name: 'get_setup_guide',
      arguments: {
        component: 'TToast',
      },
    });

    const recommendationText = recommendation.content[0]?.type === 'text'
      ? recommendation.content[0].text
      : '';
    const setupText = setupGuide.content[0]?.type === 'text'
      ? setupGuide.content[0].text
      : '';

    expect(recommendationText).toContain('TCombobox');
    expect(setupText).toContain('TToastProvider');
  });

  it('reads catalog resources and per-component manifests', async () => {
    const { client } = await connectClient();

    const catalogResource = await client.readResource({
      uri: 'treeui://catalog',
    });
    const componentResource = await client.readResource({
      uri: 'treeui://components/TSelect',
    });

    const catalogText = 'text' in catalogResource.contents[0]
      ? catalogResource.contents[0].text
      : '';
    const componentText = 'text' in componentResource.contents[0]
      ? componentResource.contents[0].text
      : '';

    const catalogJson = JSON.parse(catalogText) as { components: Array<{ name: string }> };
    const componentJson = JSON.parse(componentText) as {
      name: string;
      selection: { alternatives: Array<{ component: string }> };
    };

    expect(catalogJson.components.some((component) => component.name === 'TSelect')).toBe(true);
    expect(componentJson.name).toBe('TSelect');
    expect(componentJson.selection.alternatives.some((alternative) => alternative.component === 'TCombobox')).toBe(true);
  });

  it('surfaces errors for invalid tool input', async () => {
    const { client } = await connectClient();

    const result = await client.callTool({
      name: 'get_component',
      arguments: {
        name: 'TDefinitelyMissing',
      },
    });

    const text = result.content[0]?.type === 'text' ? result.content[0].text : '';

    expect(result.isError).toBe(true);
    expect(text).toContain('was not found');
  });
});
