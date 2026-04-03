import {
  addDays,
  addMonths,
  clamp,
  createId,
  focusFirst,
  focusLast,
  getFocusableElements,
  getNextEnabledIndex,
  isActivationKey,
  isEscapeKey,
  isSameDay,
  parseDateValue,
  startOfMonth,
  startOfWeek,
  toDateValue,
} from './index';

describe('@treeui/utils', () => {
  it('creates incremental ids with a stable prefix', () => {
    expect(createId('button')).toMatch(/^button-\d+$/);
    expect(createId('button')).not.toBe(createId('button'));
  });

  it('detects keyboard activation and escape keys', () => {
    expect(isActivationKey('Enter')).toBe(true);
    expect(isActivationKey({ key: ' ' })).toBe(true);
    expect(isEscapeKey({ key: 'Escape' })).toBe(true);
    expect(isActivationKey('Tab')).toBe(false);
  });

  it('clamps numbers within a range', () => {
    expect(clamp(4, 1, 3)).toBe(3);
    expect(clamp(-1, 0, 4)).toBe(0);
    expect(clamp(2, 0, 4)).toBe(2);
  });

  it('finds the next enabled index', () => {
    const items = [{}, { disabled: true }, {}, {}];

    expect(getNextEnabledIndex(0, items, 1)).toBe(2);
    expect(getNextEnabledIndex(2, items, 1)).toBe(3);
    expect(getNextEnabledIndex(0, items, -1)).toBe(3);
  });

  it('returns and focuses focusable elements', () => {
    document.body.innerHTML = `
      <div id="scope">
        <button id="first">First</button>
        <button disabled>Disabled</button>
        <a href="/" id="link">Link</a>
      </div>
    `;

    const container = document.getElementById('scope') as HTMLElement;
    const elements = getFocusableElements(container);

    expect(elements).toHaveLength(2);
    expect(focusFirst(container)?.id).toBe('first');
    expect(document.activeElement?.id).toBe('first');
    expect(focusLast(container)?.id).toBe('link');
    expect(document.activeElement?.id).toBe('link');
  });

  it('parses and formats stable date values', () => {
    const parsed = parseDateValue('2026-03-31');

    expect(parsed).not.toBeNull();
    expect(toDateValue(parsed as Date)).toBe('2026-03-31');
    expect(parseDateValue('2026-02-31')).toBeNull();
  });

  it('supports calendar math for reusable date components', () => {
    const date = new Date(2026, 2, 31);

    expect(toDateValue(startOfMonth(date))).toBe('2026-03-01');
    expect(toDateValue(addDays(date, -7))).toBe('2026-03-24');
    expect(toDateValue(addMonths(date, 1))).toBe('2026-04-30');
    expect(toDateValue(startOfWeek(new Date(2026, 2, 31), 1))).toBe('2026-03-30');
    expect(isSameDay(new Date(2026, 2, 31), parseDateValue('2026-03-31'))).toBe(true);
  });
});
