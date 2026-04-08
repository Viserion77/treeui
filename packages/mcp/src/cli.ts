#!/usr/bin/env node

import process from 'node:process';
import { PassThrough } from 'node:stream';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createTreeuiMcpServer } from './server';

const main = async () => {
  // Some runtimes do not keep a stdio child process alive until the first
  // chunk is received. Hold the event loop briefly so the MCP client can send
  // its initialize request, then let stdio manage liveness normally.
  const keepAlive = setInterval(() => {}, 1_000);
  const startupTimeout = setTimeout(() => {
    clearInterval(keepAlive);
  }, 30_000);
  const stopKeepAlive = () => {
    clearInterval(keepAlive);
    clearTimeout(startupTimeout);
  };

  process.once('SIGINT', stopKeepAlive);
  process.once('SIGTERM', stopKeepAlive);

  const server = createTreeuiMcpServer();
  server.oninitialized = stopKeepAlive;
  const stdin = new PassThrough();

  process.stdin.pipe(stdin);

  const transport = new StdioServerTransport(stdin, process.stdout);

  await server.connect(transport);
};

main().catch((error) => {
  console.error('[treeui-mcp] failed to start', error);
  process.exitCode = 1;
});
