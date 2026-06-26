import { tv } from './index';

describe('tv', () => {
  const button = tv({
    base: 'tree-button',
    variants: {
      variant: {
        solid: 'tree-button--solid',
        outline: 'tree-button--outline',
      },
      size: {
        sm: 'tree-button--sm',
        md: 'tree-button--md',
      },
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md',
    },
  });

  it('applies base and default variants when nothing is passed', () => {
    expect(button()).toBe('tree-button tree-button--solid tree-button--md');
  });

  it('lets explicit props override defaults', () => {
    expect(button({ variant: 'outline', size: 'sm' })).toBe(
      'tree-button tree-button--outline tree-button--sm',
    );
  });

  it('ignores undefined props but honors defaults', () => {
    expect(button({ variant: undefined, size: 'sm' })).toBe(
      'tree-button tree-button--solid tree-button--sm',
    );
  });

  it('skips unknown variant values instead of fabricating a class', () => {
    expect(button({ variant: 'mystery' })).toBe('tree-button tree-button--md');
  });

  it('appends string and conditional object classes from `class`', () => {
    expect(
      button({
        class: { 'is-loading': true, 'is-disabled': false },
      }),
    ).toBe('tree-button tree-button--solid tree-button--md is-loading');

    expect(button({ class: ['extra-a', 'extra-b'] })).toBe(
      'tree-button tree-button--solid tree-button--md extra-a extra-b',
    );
  });

  it('supports compound variants', () => {
    const chip = tv({
      base: 'chip',
      variants: {
        tone: { brand: 'chip--brand', neutral: 'chip--neutral' },
        outlined: { true: 'chip--outlined', false: '' },
      },
      compoundVariants: [{ tone: 'brand', outlined: 'true', class: 'chip--brand-outlined' }],
    });

    expect(chip({ tone: 'brand', outlined: 'true' })).toBe(
      'chip chip--brand chip--outlined chip--brand-outlined',
    );
    expect(chip({ tone: 'neutral', outlined: 'true' })).toBe('chip chip--neutral chip--outlined');
  });
});
