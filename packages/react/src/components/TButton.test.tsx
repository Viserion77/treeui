import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { treeActionTones, treeSizes, treeVariants } from '@treeui/tokens';
import { tv } from '@treeui/utils';

import { TButton, type TButtonProps } from './TButton';

/**
 * `@treeui/react` renders against the SAME stylesheet as `@treeui/vue`
 * (`packages/react/src/style.css` is a copy of the Vue one, written by
 * `scripts/copy-styles.mjs`), so the only thing that makes a React button look
 * like a TreeUI button is the class string it emits. A class this package spells
 * differently — or emits in a different order, which is how `tv()` reveals a
 * reordered variant map — is not a cosmetic divergence: it is an unstyled
 * button, and nothing else in the suite would notice.
 *
 * So the expectations below are DERIVED from the Vue component's source rather
 * than typed out next to it: the tone/variant/size map and the state dictionary
 * are parsed out of `TButton.vue` and replayed through the same `tv()` helper
 * both packages use. Rename `t-button--tone-danger` in Vue, or move `tone`
 * after `variant` there, and these tests fail in the React package.
 *
 * Rendering is `renderToStaticMarkup`, not a testing-library render: for a
 * class-driven component the whole contract is which classes and ARIA
 * attributes come out, and that keeps the package free of a DOM-testing
 * dependency it does not otherwise need.
 */

/** Walk up from the runner's cwd so the test works from the root or a package. */
const findRepoRoot = () => {
  let current = process.cwd();

  while (!existsSync(join(current, 'pnpm-workspace.yaml'))) {
    const parent = dirname(current);

    if (parent === current) {
      throw new Error('Could not locate the workspace root from ' + process.cwd());
    }

    current = parent;
  }

  return current;
};

const VUE_BUTTON_SOURCE = readFileSync(
  join(findRepoRoot(), 'packages/vue/src/components/TButton.vue'),
  'utf8',
);

/** The `tv()` config the Vue component declares, read out of its source. */
const parseVueButtonConfig = () => {
  const start = VUE_BUTTON_SOURCE.indexOf('const buttonClass = tv({');
  const block = VUE_BUTTON_SOURCE.slice(start, VUE_BUTTON_SOURCE.indexOf('\n});', start));
  const base = /base: '([^']+)'/.exec(block)?.[1];
  const marker = 'variants: {';
  const variantsBody = block.slice(block.indexOf(marker) + marker.length);

  const variants: Record<string, Record<string, string>> = {};

  // Every group body is a flat list of `key: 'class',` lines, so `[^}]*` stops
  // at that group's own closing brace.
  for (const [, group, body] of variantsBody.matchAll(/(\w+): \{([^}]*)\}/g)) {
    variants[group] = Object.fromEntries(
      [...body.matchAll(/(\w+): '([^']+)'/g)].map(([, key, value]) => [key, value]),
    );
  }

  return { base, variants };
};

/** The conditional class keys the Vue component passes to `tv()`, in order. */
const parseVueStateKeys = () => {
  const start = VUE_BUTTON_SOURCE.indexOf('    class: {');
  const block = VUE_BUTTON_SOURCE.slice(start, VUE_BUTTON_SOURCE.indexOf('\n    },', start));

  return [...block.matchAll(/'([^']+)':/g)].map(([, key]) => key);
};

const vueConfig = parseVueButtonConfig();
const vueButtonClass = tv(vueConfig);
const vueStateKeys = parseVueStateKeys();

/** What the Vue component would emit for the same props. */
const vueClassFor = ({
  tone,
  variant = 'solid',
  size = 'md',
  loading = false,
  disabled = false,
  block = false,
  iconOnly = false,
  align = 'center',
}: Partial<TButtonProps> = {}) =>
  vueButtonClass({
    tone,
    variant,
    size,
    class: {
      'has-tone': Boolean(tone),
      'is-loading': loading,
      'is-disabled': disabled || loading,
      't-button--block': block,
      't-button--icon': iconOnly,
      't-button--align-start': align === 'start',
      't-button--align-end': align === 'end',
    },
  });

const markupOf = (element: ReactElement) => renderToStaticMarkup(element);

const classOf = (element: ReactElement) =>
  /class="([^"]*)"/.exec(markupOf(element))?.[1] ?? '';

const silenceWarnings = () => vi.spyOn(console, 'warn').mockImplementation(() => {});

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TButton', () => {
  it('emits the modifier class for every variant', () => {
    silenceWarnings(); // `danger` is deprecated and warns; see below.

    for (const variant of treeVariants) {
      expect(classOf(<TButton variant={variant}>Invite</TButton>)).toContain(
        `t-button--${variant}`,
      );
    }
  });

  it('emits the modifier class for every size', () => {
    for (const size of treeSizes) {
      expect(classOf(<TButton size={size}>Invite</TButton>)).toContain(`t-button--${size}`);
    }
  });

  it('emits has-tone and the tone modifier for all seven tones', () => {
    expect(treeActionTones).toHaveLength(7);

    for (const tone of treeActionTones) {
      const classes = classOf(<TButton tone={tone}>Invite</TButton>);

      expect(classes).toContain('has-tone');
      expect(classes).toContain(`t-button--tone-${tone}`);
    }
  });

  it('leaves has-tone off when no tone is set', () => {
    const classes = classOf(<TButton>Invite</TButton>);

    expect(classes).not.toContain('has-tone');
    expect(classes).not.toContain('t-button--tone-');
  });

  it('stretches with block and aligns its content', () => {
    expect(classOf(<TButton block>Invite</TButton>)).toContain('t-button--block');
    expect(classOf(<TButton block align="start">Invite</TButton>)).toContain(
      't-button--align-start',
    );
    expect(classOf(<TButton block align="end">Invite</TButton>)).toContain('t-button--align-end');
  });

  it('emits no align class for the default centre', () => {
    const classes = classOf(<TButton block align="center">Invite</TButton>);

    expect(classes).not.toContain('t-button--align-start');
    expect(classes).not.toContain('t-button--align-end');
  });

  it('announces and blocks the button while loading', () => {
    const markup = markupOf(
      <TButton loading loadingLabel="Salvando">
        Salvar
      </TButton>,
    );

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('class="t-spinner t-spinner--sm"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-label="Salvando"');
    expect(markup).toContain('<span class="t-visually-hidden">Salvando</span>');
  });

  it('defaults the spinner announcement to English', () => {
    expect(markupOf(<TButton loading>Save</TButton>)).toContain('aria-label="Loading"');
  });

  it('applies is-disabled for both disabled and loading', () => {
    expect(classOf(<TButton disabled>Invite</TButton>)).toContain('is-disabled');
    expect(classOf(<TButton loading>Invite</TButton>)).toContain('is-disabled');
    // `loading` implies disabled; `disabled` on its own is not "loading".
    expect(classOf(<TButton disabled>Invite</TButton>)).not.toContain('is-loading');
    expect(classOf(<TButton loading>Invite</TButton>)).toContain('is-loading');
    expect(markupOf(<TButton disabled>Invite</TButton>)).not.toContain('aria-busy');
  });

  it('drops the visible label when iconOnly', () => {
    const markup = markupOf(
      <TButton iconOnly aria-label="Add teammate" icon={<PlusIcon />}>
        Add teammate
      </TButton>,
    );

    expect(markup).toContain('t-button--icon');
    expect(markup).not.toContain('t-button__label');
    expect(markup).toContain('class="t-button__icon" aria-hidden="true"');
    expect(markup).toContain('aria-label="Add teammate"');
    expect(markup).not.toContain('>Add teammate<');
  });

  it('wraps the children in a label element otherwise', () => {
    expect(markupOf(<TButton>Invite teammate</TButton>)).toContain(
      '<span class="t-button__label">Invite teammate</span>',
    );
  });

  it('keeps the caller className alongside the generated classes', () => {
    const classes = classOf(
      <TButton className="analytics-cta" tone="danger" variant="ghost">
        Delete
      </TButton>,
    );

    expect(classes).toBe(
      't-button t-button--tone-danger t-button--ghost t-button--md has-tone analytics-cta',
    );
  });

  it('forwards DOM attributes to the root element', () => {
    const markup = markupOf(
      <TButton id="invite" type="submit" data-testid="invite" aria-describedby="hint">
        Invite
      </TButton>,
    );

    expect(markup).toContain('id="invite"');
    expect(markup).toContain('type="submit"');
    expect(markup).toContain('data-testid="invite"');
    expect(markup).toContain('aria-describedby="hint"');
  });
});

describe('TButton dev warnings', () => {
  it('warns when iconOnly has no accessible name', () => {
    const warn = silenceWarnings();

    markupOf(<TButton iconOnly icon={<PlusIcon />} />);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('`iconOnly` needs an accessible name');
  });

  it('stays quiet when the icon-only button is named', () => {
    const warn = silenceWarnings();

    markupOf(<TButton iconOnly aria-label="Add teammate" icon={<PlusIcon />} />);
    markupOf(<TButton iconOnly aria-labelledby="heading" icon={<PlusIcon />} />);

    expect(warn).not.toHaveBeenCalled();
  });

  it('warns that variant="danger" is deprecated and names the replacement', () => {
    const warn = silenceWarnings();

    markupOf(<TButton variant="danger">Delete</TButton>);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('`variant="danger"` is deprecated');
    expect(warn.mock.calls[0]?.[0]).toContain('variant="solid" tone="danger"');
  });

  it('stays quiet for the replacement spelling', () => {
    const warn = silenceWarnings();

    markupOf(
      <TButton variant="solid" tone="danger">
        Delete
      </TButton>,
    );
    markupOf(
      <TButton variant="ghost" tone="danger">
        Delete
      </TButton>,
    );

    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps variant="danger" rendering exactly as before', () => {
    silenceWarnings();

    expect(classOf(<TButton variant="danger">Delete</TButton>)).toBe(
      't-button t-button--danger t-button--md',
    );
  });
});

describe('TButton class parity with @treeui/vue', () => {
  it('reads the Vue component config it is measured against', () => {
    expect(vueConfig.base).toBe('t-button');
    expect(Object.keys(vueConfig.variants)).toEqual(['tone', 'variant', 'size']);
    expect(Object.keys(vueConfig.variants.tone)).toEqual([...treeActionTones]);
    expect(vueConfig.variants.tone.danger).toBe('t-button--tone-danger');
    expect(vueStateKeys).toEqual([
      'has-tone',
      'is-loading',
      'is-disabled',
      't-button--block',
      't-button--icon',
      't-button--align-start',
      't-button--align-end',
    ]);
  });

  it('emits the same class string as the Vue component for every tone, variant and size', () => {
    silenceWarnings();

    for (const tone of [undefined, ...treeActionTones] as const) {
      for (const variant of treeVariants) {
        for (const size of treeSizes) {
          expect(classOf(<TButton tone={tone} variant={variant} size={size} />)).toBe(
            vueClassFor({ tone, variant, size }),
          );
        }
      }
    }
  });

  it('emits the same class string as the Vue component for every state combination', () => {
    const cases: Array<Partial<TButtonProps>> = [
      {},
      { loading: true },
      { disabled: true },
      { disabled: true, loading: true },
      { block: true },
      { block: true, align: 'start' },
      { block: true, align: 'end' },
      { align: 'start' },
      { iconOnly: true },
      { iconOnly: true, block: true, align: 'end', tone: 'neutral', variant: 'ghost', size: 'lg' },
      { loading: true, tone: 'brand', variant: 'soft', size: 'sm' },
    ];

    silenceWarnings();

    for (const props of cases) {
      expect(classOf(<TButton {...props} />)).toBe(vueClassFor(props));
    }
  });

  it('pins the literal strings a divergence would change', () => {
    expect(classOf(<TButton>Invite</TButton>)).toBe('t-button t-button--solid t-button--md');
    expect(classOf(<TButton tone="danger" variant="ghost">Delete</TButton>)).toBe(
      't-button t-button--tone-danger t-button--ghost t-button--md has-tone',
    );
    expect(classOf(<TButton tone="success" variant="soft" size="sm">Approve</TButton>)).toBe(
      't-button t-button--tone-success t-button--soft t-button--sm has-tone',
    );
    expect(classOf(<TButton loading>Save</TButton>)).toBe(
      't-button t-button--solid t-button--md is-loading is-disabled',
    );
    expect(classOf(<TButton block align="start">Menu row</TButton>)).toBe(
      't-button t-button--solid t-button--md t-button--block t-button--align-start',
    );
    expect(classOf(<TButton block align="end">Menu row</TButton>)).toBe(
      't-button t-button--solid t-button--md t-button--block t-button--align-end',
    );
    expect(classOf(<TButton iconOnly aria-label="Add" icon={<PlusIcon />} />)).toBe(
      't-button t-button--solid t-button--md t-button--icon',
    );
  });
});
