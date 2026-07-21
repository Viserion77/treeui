<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { TBadge, TButton, TCard, TIcon, TLanguageSelect, useTheme } from '@treeui/vue';
import type { TIconName } from '@treeui/icons';
// Brand marks follow the repo policy: Simple Icons is the standardized source,
// and each official brand color comes from the package data, never hardcoded.
import { siReact, siVuedotjs } from 'simple-icons';
import practicesData from '../../../docs/ai/practices.json';
import {
  LOCALE_STORAGE_KEY,
  detectLocale,
  isLandingLocale,
  localeOptions,
  messages,
} from './i18n';
import wordmarkUrl from './assets/treeui-wordmark.svg';
import wordmarkDarkUrl from './assets/treeui-wordmark-dark.svg';
import markUrl from './assets/treeui-logo.svg';

const INSTALL_COMMAND = 'pnpm add @treeui/vue';

const { resolved: resolvedTheme, setMode } = useTheme({ storageKey: 'treeui-landing-theme' });
const toggleTheme = () => setMode(resolvedTheme.value === 'dark' ? 'light' : 'dark');
const wordmarkSrc = computed(() =>
  resolvedTheme.value === 'dark' ? wordmarkDarkUrl : wordmarkUrl,
);

const locale = ref(detectLocale());
const localeModel = computed({
  get: () => locale.value,
  set: (value: string) => {
    if (isLandingLocale(value)) {
      locale.value = value;
    }
  },
});
const copy = computed(() => messages[locale.value]);

watchEffect(() => {
  document.documentElement.lang = locale.value;
  document.title = `TreeUI — ${copy.value.hero.title}`;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale.value);
  } catch {
    // Storage can be blocked (private mode) — persistence is best-effort.
  }
});

const componentDocs = practicesData.components as Record<string, string>;
const componentHref = (name: string) => `./vue/?path=/docs/${componentDocs[name]}--docs`;
const practicesDocsHref = `./vue/?path=/docs/${practicesData.storybookDocPage}--docs`;

// English practice copy is canonical in the contract; other locales override it
// and fall back per practice, so a practice added without translations still
// renders.
const practiceCards = computed(() =>
  practicesData.practices.map((practice) => {
    const localized = copy.value.practices.copyById[practice.id];
    return {
      id: practice.id,
      icon: practice.icon as TIconName,
      title: localized?.title ?? practice.title,
      summary: localized?.summary ?? practice.summary,
      components: practice.components,
    };
  }),
);

const copied = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;
const copyInstall = async () => {
  try {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
  } catch {
    return; // Clipboard blocked — the command stays selectable as plain text.
  }
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <div class="landing">
    <header class="top">
      <div class="wrap top__row">
        <img
          class="top__logo"
          :src="wordmarkSrc"
          alt="TreeUI"
        >
        <nav
          class="top__nav"
          :aria-label="copy.nav.ariaLabel"
        >
          <a href="#practices">{{ copy.nav.practices }}</a>
          <a href="./vue/">{{ copy.nav.vueDocs }}</a>
          <a href="./react/">{{ copy.nav.reactDocs }}</a>
          <a href="./examples/dashboard-vue/">{{ copy.nav.examples }}</a>
          <a href="https://github.com/Viserion77/treeui">GitHub</a>
        </nav>
        <div class="top__controls">
          <TLanguageSelect
            v-model="localeModel"
            :options="localeOptions"
            variant="switcher"
            icon-only
            size="sm"
            width="xs"
            :aria-label="copy.nav.languageLabel"
          />
          <TButton
            variant="ghost"
            size="sm"
            :aria-label="copy.theme.toggleLabel"
            @click="toggleTheme"
          >
            <template #icon>
              <TIcon
                :name="resolvedTheme === 'dark' ? 'sun' : 'moon'"
                :size="16"
              />
            </template>
            {{ resolvedTheme === 'dark' ? copy.theme.light : copy.theme.dark }}
          </TButton>
        </div>
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
          <h1>{{ copy.hero.title }}</h1>
          <p>{{ copy.hero.lead }}</p>
          <div class="hero__actions">
            <TButton
              as="a"
              href="./vue/"
            >
              {{ copy.hero.ctaVue }}
            </TButton>
            <TButton
              as="a"
              variant="outline"
              href="https://github.com/Viserion77/treeui"
              target="_blank"
              rel="noopener"
            >
              GitHub
            </TButton>
          </div>
          <div class="hero__install">
            <code>{{ INSTALL_COMMAND }}</code>
            <TButton
              variant="ghost"
              size="sm"
              :aria-label="copy.hero.copyLabel"
              @click="copyInstall"
            >
              <template #icon>
                <TIcon
                  :name="copied ? 'check' : 'copy'"
                  :size="16"
                />
              </template>
              {{ copied ? copy.hero.copied : copy.hero.copy }}
            </TButton>
            <span
              class="visually-hidden"
              role="status"
            >{{ copied ? copy.hero.copied : '' }}</span>
          </div>
        </div>
      </section>

      <div class="wrap">
        <section
          class="paths"
          :aria-label="copy.paths.ariaLabel"
        >
          <TCard
            as="a"
            href="./vue/"
            variant="outline"
            class="path"
          >
            <template #header>
              <div class="path__head">
                <div class="path__title">
                  <span
                    class="path__brand"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      :fill="`#${siVuedotjs.hex}`"
                    >
                      <path :d="siVuedotjs.path" />
                    </svg>
                  </span>
                  <h2>Vue 3</h2>
                </div>
                <TBadge tone="info">
                  {{ copy.paths.vueBadge }}
                </TBadge>
              </div>
            </template>
            <p class="path__body">
              {{ copy.paths.vueBody }}
            </p>
            <template #footer>
              <div class="path__foot">
                <span class="mono">@treeui/vue</span>
                <span class="go">{{ copy.paths.vueGo }}</span>
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
                <div class="path__title">
                  <span
                    class="path__brand"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      :fill="`#${siReact.hex}`"
                    >
                      <path :d="siReact.path" />
                    </svg>
                  </span>
                  <h2>React</h2>
                </div>
                <TBadge tone="warning">
                  {{ copy.paths.reactBadge }}
                </TBadge>
              </div>
            </template>
            <p class="path__body">
              {{ copy.paths.reactBody }}
            </p>
            <template #footer>
              <div class="path__foot">
                <span class="mono">@treeui/react</span>
                <span class="go">{{ copy.paths.reactGo }}</span>
              </div>
            </template>
          </TCard>
        </section>

        <section
          id="practices"
          class="practices"
          :aria-label="copy.nav.practices"
        >
          <h3>{{ copy.practices.heading }}</h3>
          <p class="practices__intro">
            {{ copy.practices.intro }}
          </p>
          <div class="practices__grid">
            <TCard
              v-for="practice in practiceCards"
              :key="practice.id"
              variant="outline"
              class="practice"
            >
              <template #header>
                <div class="practice__head">
                  <span
                    class="practice__icon"
                    aria-hidden="true"
                  >
                    <TIcon
                      :name="practice.icon"
                      :size="18"
                    />
                  </span>
                  <h4 class="practice__title">
                    {{ practice.title }}
                  </h4>
                </div>
              </template>
              <p class="practice__summary">
                {{ practice.summary }}
              </p>
              <template #footer>
                <div class="practice__foot">
                  <span class="practice__foot-label">{{ copy.practices.followedBy }}</span>
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
            <a :href="practicesDocsHref">{{ copy.practices.more }}</a>
          </p>
        </section>

        <section
          class="examples"
          :aria-label="copy.examples.heading"
        >
          <h3>{{ copy.examples.heading }}</h3>
          <p class="examples__intro">
            {{ copy.examples.intro }}
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
                  <h4>{{ copy.examples.vueTitle }}</h4>
                  <TBadge tone="success">
                    {{ copy.examples.liveBadge }}
                  </TBadge>
                </div>
              </template>
              <p class="path__body">
                {{ copy.examples.vueBody }}
              </p>
              <template #footer>
                <div class="path__foot">
                  <span class="mono">examples/dashboard-vue</span>
                  <span class="go">{{ copy.examples.go }}</span>
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
                  <h4>{{ copy.examples.reactTitle }}</h4>
                  <TBadge tone="success">
                    {{ copy.examples.liveBadge }}
                  </TBadge>
                </div>
              </template>
              <p class="path__body">
                {{ copy.examples.reactBody }}
              </p>
              <template #footer>
                <div class="path__foot">
                  <span class="mono">examples/dashboard-react</span>
                  <span class="go">{{ copy.examples.go }}</span>
                </div>
              </template>
            </TCard>
          </div>
        </section>

        <section class="foundation">
          <h3>{{ copy.foundation.heading }}</h3>
          <div class="foundation__grid">
            <TCard
              v-for="feature in copy.foundation.features"
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
      </div>
    </main>

    <footer class="foot">
      <div class="wrap foot__row">
        <span>{{ copy.footer.line }}</span>
        <span class="foot__links">
          <a href="#practices">{{ copy.nav.practices }}</a>
          <a href="./vue/">Storybook</a>
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
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
  padding-block: var(--tree-space-3);
  flex-wrap: wrap;
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
  flex-wrap: wrap;
}

.top__nav a {
  color: var(--tree-color-text-muted);
  text-decoration: none;
}

.top__nav a:hover {
  color: var(--tree-color-text-primary);
}

.top__controls {
  display: flex;
  align-items: center;
  gap: var(--tree-space-2);
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

.hero__actions {
  display: flex;
  justify-content: center;
  gap: var(--tree-space-3);
  flex-wrap: wrap;
  margin-top: var(--tree-space-6);
}

.hero__install {
  display: inline-flex;
  align-items: center;
  gap: var(--tree-space-3);
  margin-top: var(--tree-space-5);
  padding: var(--tree-space-1) var(--tree-space-1) var(--tree-space-1) var(--tree-space-4);
  border: var(--tree-border-width-subtle) solid var(--tree-color-border-default);
  border-radius: var(--tree-radius-md);
  background: var(--tree-color-bg-surface);
}

.hero__install code {
  font-size: var(--tree-font-size-sm);
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

.path__title {
  display: flex;
  align-items: center;
  gap: var(--tree-space-3);
}

.path__brand {
  display: inline-flex;
}

.path__brand svg {
  width: 22px;
  height: 22px;
  display: block;
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

.practice__head {
  display: flex;
  align-items: center;
  gap: var(--tree-space-3);
}

.practice__icon {
  display: inline-flex;
  padding: var(--tree-space-2);
  border-radius: var(--tree-radius-md);
  background: var(--tree-color-brand-soft);
  color: var(--tree-color-brand-primary);
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
  flex-wrap: wrap;
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
  .practices__grid,
  .examples__grid,
  .foundation__grid {
    grid-template-columns: 1fr;
  }
}
</style>
