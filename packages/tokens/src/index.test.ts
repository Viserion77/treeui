import {
  createFoundationCss,
  createStylesheet,
  createThemeCss,
  createThemesStylesheet,
  treeThemes,
  treeTokens,
} from './index';

describe('@treeui/tokens', () => {
  it('exports the base tokens and themes', () => {
    expect(treeTokens.radius.md).toBe('0.625rem');
    expect(treeThemes.dark.color.bg.surface).toBe('#162131');
    expect(treeTokens.font.size['5xl']).toBe('3rem');
    expect(treeThemes.light.color.brand.primary).toBe('#2057d4');
  });

  it('creates CSS variables for foundation tokens', () => {
    const css = createFoundationCss();

    expect(css).toContain('--tree-font-family-sans');
    expect(css).toContain('--tree-size-control-md');
    expect(css).toContain('--tree-breakpoint-xl');
    expect(css).toContain('--tree-layout-grid-columns');
    expect(css).toContain('--tree-motion-duration-slower');
  });

  it('creates light and dark theme selectors', () => {
    const css = createThemesStylesheet();

    expect(css).toContain('[data-tree-theme="light"]');
    expect(css).toContain('[data-tree-theme="dark"]');
    expect(css).toContain('--tree-color-bg-primary');
    expect(css).toContain('--tree-color-brand-primary');
    expect(css).toContain('--tree-color-status-error');
  });

  it('creates a default stylesheet with foundation plus light theme', () => {
    const css = createStylesheet();

    expect(css).toContain(':root');
    expect(css).toContain('--tree-color-text-primary');
    expect(css).toContain('--tree-shadow-sm');
  });

  it('supports custom selectors for generated themes', () => {
    const css = createThemeCss('dark', '.tree-dark');

    expect(css).toContain('.tree-dark');
    expect(css).toContain('color-scheme: dark');
  });
});
