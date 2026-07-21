<script setup lang="ts">
import { TBadge, TCard } from '@treeui/vue';
import practicesData from '../../../docs/ai/practices.json';
import wordmarkUrl from './assets/treeui-wordmark.svg';
import markUrl from './assets/treeui-logo.svg';

const { philosophy, practices } = practicesData;
const componentDocs = practicesData.components as Record<string, string>;

const componentHref = (name: string) => `./vue/?path=/docs/${componentDocs[name]}--docs`;
const practicesDocsHref = `./vue/?path=/docs/${practicesData.storybookDocPage}--docs`;

const features = [
  {
    label: '@treeui/tokens',
    title: 'Design tokens',
    body: 'Framework-agnostic --tree-* variables, themes, and a brand-ramp generator.',
  },
  {
    label: 'a11y',
    title: 'Accessible by default',
    body: 'Native semantics, keyboard support, focus management, and visible focus.',
  },
  {
    label: 'T<Name>',
    title: 'Predictable API',
    body: 'A compact, consistent surface — the same names and contracts across frameworks.',
  },
  {
    label: '@treeui/mcp',
    title: 'Agent-ready',
    body: 'A machine-readable catalog and MCP server so coding agents pick the right component.',
  },
];
</script>

<template>
  <div class="landing">
    <header class="top">
      <div class="wrap top__row">
        <img
          class="top__logo"
          :src="wordmarkUrl"
          alt="TreeUI"
        >
        <nav class="top__nav">
          <a href="#practices">Best practices</a>
          <a href="./vue/">Vue docs</a>
          <a href="./react/">React docs</a>
          <a href="./examples/dashboard-vue/">Examples</a>
          <a href="https://github.com/Viserion77/treeui">GitHub</a>
        </nav>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="wrap">
          <img
            class="hero__mark"
            :src="markUrl"
            alt=""
            aria-hidden="true"
          >
          <h1>Clean components for modern products</h1>
          <p>
            An open-source component library on a framework-agnostic foundation — shared design
            tokens, accessibility-first behavior, and a compact <code>T</code>-prefixed API across
            every framework.
          </p>
        </div>
      </section>

      <div class="wrap">
        <section
          class="paths"
          aria-label="Documentation"
        >
          <TCard
            as="a"
            href="./vue/"
            variant="outline"
            class="path"
          >
            <template #header>
              <div class="path__head">
                <h2>Vue 3</h2>
                <TBadge tone="info">
                  Stable
                </TBadge>
              </div>
            </template>
            <p class="path__body">
              The complete library: 60+ production components, a plugin, full type exports, and the
              entire design-system documentation.
            </p>
            <template #footer>
              <div class="path__foot">
                <span class="mono">@treeui/vue</span>
                <span class="go">Open Vue docs →</span>
              </div>
            </template>
          </TCard>

          <TCard
            as="a"
            href="./react/"
            variant="outline"
            class="path"
          >
            <template #header>
              <div class="path__head">
                <h2>React</h2>
                <TBadge tone="warning">
                  Early
                </TBadge>
              </div>
            </template>
            <p class="path__body">
              A growing package with the core primitives — Button, Input, Badge, Card — built on the
              same tokens and <code>t-*</code> classes.
            </p>
            <template #footer>
              <div class="path__foot">
                <span class="mono">@treeui/react</span>
                <span class="go">Open React docs →</span>
              </div>
            </template>
          </TCard>
        </section>

        <section
          class="examples"
          aria-label="Live examples"
        >
          <h3>See it running</h3>
          <p class="examples__intro">
            A full configurable dashboard — theme, accent color, density, and widgets — built
            entirely with TreeUI components. No custom UI framework code.
          </p>
          <div class="examples__grid">
            <TCard
              as="a"
              href="./examples/dashboard-vue/"
              variant="soft"
              class="path"
            >
              <template #header>
                <div class="path__head">
                  <h4>Vue dashboard</h4>
                  <TBadge tone="success">
                    Live demo
                  </TBadge>
                </div>
              </template>
              <p class="path__body">
                Sidebar shell, sortable tables, KPI stats, toasts, and a settings drawer — the
                complete component set working together.
              </p>
              <template #footer>
                <div class="path__foot">
                  <span class="mono">examples/dashboard-vue</span>
                  <span class="go">Open example →</span>
                </div>
              </template>
            </TCard>

            <TCard
              as="a"
              href="./examples/dashboard-react/"
              variant="soft"
              class="path"
            >
              <template #header>
                <div class="path__head">
                  <h4>React dashboard</h4>
                  <TBadge tone="success">
                    Live demo
                  </TBadge>
                </div>
              </template>
              <p class="path__body">
                The same dashboard concept built with the React primitives — Button, Input, Badge,
                Card — on shared tokens.
              </p>
              <template #footer>
                <div class="path__foot">
                  <span class="mono">examples/dashboard-react</span>
                  <span class="go">Open example →</span>
                </div>
              </template>
            </TCard>
          </div>
        </section>

        <section class="foundation">
          <h3>One foundation, shared by every framework</h3>
          <div class="foundation__grid">
            <TCard
              v-for="feature in features"
              :key="feature.label"
              variant="soft"
              size="sm"
            >
              <p class="mono feature__label">
                {{ feature.label }}
              </p>
              <h4>{{ feature.title }}</h4>
              <p class="feature__body">
                {{ feature.body }}
              </p>
            </TCard>
          </div>
        </section>

        <section
          id="practices"
          class="practices"
          aria-label="Best practices"
        >
          <h3>Best practices, built in</h3>
          <p class="practices__intro">
            {{ philosophy.statement }}
          </p>
          <div class="practices__grid">
            <TCard
              v-for="practice in practices"
              :key="practice.id"
              variant="outline"
              class="practice"
            >
              <template #header>
                <h4 class="practice__title">
                  {{ practice.title }}
                </h4>
              </template>
              <p class="practice__summary">
                {{ practice.summary }}
              </p>
              <template #footer>
                <div class="practice__foot">
                  <span class="practice__foot-label">Components that follow it</span>
                  <ul class="practice__chips">
                    <li
                      v-for="component in practice.components"
                      :key="component"
                    >
                      <a
                        class="chip"
                        :href="componentHref(component)"
                      >{{ component }}</a>
                    </li>
                  </ul>
                </div>
              </template>
            </TCard>
          </div>
          <p class="practices__more">
            <a :href="practicesDocsHref">Every practice, with its rules and live component demos, in Storybook →</a>
          </p>
        </section>
      </div>
    </main>

    <footer class="foot">
      <div class="wrap foot__row">
        <span>MIT licensed · Built with token-driven theming.</span>
        <span class="foot__links">
          <a href="https://github.com/Viserion77/treeui">GitHub</a>
          <a href="https://www.npmjs.com/package/@treeui/vue">npm</a>
        </span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  background: var(--tree-color-bg-primary);
  color: var(--tree-color-text-primary);
  font-family: var(--tree-font-family-sans);
}

.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding-inline: var(--tree-space-6);
}

code,
.mono {
  font-family: var(--tree-font-family-mono, ui-monospace, monospace);
}

a {
  color: inherit;
}

.top {
  border-bottom: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  background: var(--tree-color-bg-surface);
}

.top__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-4);
  padding-block: var(--tree-space-4);
}

.top__logo {
  height: 28px;
  width: auto;
  display: block;
}

.top__nav {
  display: flex;
  gap: var(--tree-space-5);
  font-size: var(--tree-font-size-sm);
}

.top__nav a {
  color: var(--tree-color-text-muted);
  text-decoration: none;
}

.top__nav a:hover {
  color: var(--tree-color-text-primary);
}

.hero {
  padding-block: var(--tree-space-12) var(--tree-space-8);
  text-align: center;
}

.hero__mark {
  width: 96px;
  height: 96px;
  margin: 0 auto var(--tree-space-6);
  display: block;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  text-wrap: balance;
  margin: 0 0 var(--tree-space-4);
}

.hero p {
  font-size: var(--tree-font-size-lg);
  color: var(--tree-color-text-muted);
  max-width: 52ch;
  margin: 0 auto;
  line-height: 1.6;
}

.paths {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--tree-space-5);
  padding-block: var(--tree-space-6) var(--tree-space-3);
}

.path {
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.path:hover {
  transform: translateY(-3px);
  box-shadow: var(--tree-shadow-lg, 0 20px 44px -28px rgba(32, 87, 212, 0.5));
}

.path__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-3);
}

.path__head h2 {
  margin: 0;
  font-size: var(--tree-font-size-xl, 1.4rem);
  letter-spacing: -0.02em;
}

.path__body {
  margin: 0;
  color: var(--tree-color-text-muted);
}

.path__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-3);
  font-size: var(--tree-font-size-sm);
}

.path__foot .mono {
  color: var(--tree-color-text-muted);
}

.go {
  font-weight: var(--tree-font-weight-medium);
  color: var(--tree-color-brand-primary);
}

.examples {
  padding-block: var(--tree-space-8) var(--tree-space-3);
}

.examples h3 {
  font-size: var(--tree-font-size-lg);
  margin: 0 0 var(--tree-space-2);
  letter-spacing: -0.01em;
}

.examples__intro {
  margin: 0 0 var(--tree-space-5);
  color: var(--tree-color-text-muted);
  max-width: 64ch;
}

.examples__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--tree-space-5);
}

.examples__grid h4 {
  margin: 0;
  font-size: var(--tree-font-size-lg);
  letter-spacing: -0.02em;
}

.foundation {
  padding-block: var(--tree-space-8) var(--tree-space-3);
}

.foundation h3 {
  font-size: var(--tree-font-size-lg);
  margin: 0 0 var(--tree-space-5);
  letter-spacing: -0.01em;
}

.foundation__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--tree-space-4);
}

.feature__label {
  margin: 0 0 var(--tree-space-2);
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-brand-primary);
}

.foundation__grid h4 {
  margin: 0 0 var(--tree-space-1);
  font-size: var(--tree-font-size-md);
}

.feature__body {
  margin: 0;
  font-size: var(--tree-font-size-sm);
  color: var(--tree-color-text-muted);
}

.practices {
  padding-block: var(--tree-space-8) var(--tree-space-3);
  /* Anchor target: keep the section heading clear of the viewport edge. */
  scroll-margin-top: var(--tree-space-8);
}

.practices h3 {
  font-size: var(--tree-font-size-lg);
  margin: 0 0 var(--tree-space-2);
  letter-spacing: -0.01em;
}

.practices__intro {
  margin: 0 0 var(--tree-space-5);
  color: var(--tree-color-text-muted);
  max-width: 72ch;
}

.practices__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--tree-space-5);
}

.practice__title {
  margin: 0;
  font-size: var(--tree-font-size-md);
  letter-spacing: -0.01em;
}

.practice__summary {
  margin: 0;
  color: var(--tree-color-text-muted);
  font-size: var(--tree-font-size-sm);
  line-height: 1.6;
}

.practice__foot {
  display: grid;
  gap: var(--tree-space-2);
}

.practice__foot-label {
  font-size: var(--tree-font-size-xs);
  font-weight: var(--tree-font-weight-medium);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tree-color-text-muted);
}

.practice__chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--tree-space-2);
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: var(--tree-space-1) var(--tree-space-2);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-sm);
  font-family: var(--tree-font-family-mono, ui-monospace, monospace);
  font-size: var(--tree-font-size-xs);
  color: var(--tree-color-text-muted);
  text-decoration: none;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;
}

.chip:hover {
  color: var(--tree-color-brand-primary);
  border-color: var(--tree-color-brand-primary);
}

.chip:focus-visible {
  outline: var(--tree-border-width-strong) solid var(--tree-color-focus-ring);
  outline-offset: 2px;
}

.practices__more {
  margin: var(--tree-space-5) 0 0;
  font-size: var(--tree-font-size-sm);
}

.practices__more a {
  color: var(--tree-color-brand-primary);
  text-decoration: none;
  font-weight: var(--tree-font-weight-medium);
}

.practices__more a:hover {
  text-decoration: underline;
}

.foot {
  margin-top: var(--tree-space-12);
  border-top: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
}

.foot__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tree-space-4);
  padding-block: var(--tree-space-6);
  flex-wrap: wrap;
  color: var(--tree-color-text-muted);
  font-size: var(--tree-font-size-sm);
}

.foot__links {
  display: flex;
  gap: var(--tree-space-4);
}

.foot__links a {
  color: var(--tree-color-brand-primary);
  text-decoration: none;
}

.foot__links a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .paths,
  .examples__grid,
  .foundation__grid,
  .practices__grid {
    grid-template-columns: 1fr;
  }
}
</style>
