export const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ');

let treeId = 0;

export const createId = (prefix = 'treeui') => {
  treeId += 1;
  return `${prefix}-${treeId}`;
};

const readKey = (input: string | Pick<KeyboardEvent, 'key'>) =>
  typeof input === 'string' ? input : input.key;

export const isActivationKey = (input: string | Pick<KeyboardEvent, 'key'>) => {
  const key = readKey(input);
  return key === 'Enter' || key === ' ';
};

export const isEscapeKey = (input: string | Pick<KeyboardEvent, 'key'>) =>
  readKey(input) === 'Escape';

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getNextEnabledIndex = <T extends { disabled?: boolean }>(
  currentIndex: number,
  items: T[],
  direction: 1 | -1,
  loop = true,
) => {
  if (!items.length) {
    return -1;
  }

  let nextIndex = currentIndex;

  for (let step = 0; step < items.length; step += 1) {
    nextIndex += direction;

    if (nextIndex >= items.length) {
      if (!loop) {
        return currentIndex;
      }

      nextIndex = 0;
    }

    if (nextIndex < 0) {
      if (!loop) {
        return currentIndex;
      }

      nextIndex = items.length - 1;
    }

    if (!items[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return currentIndex;
};

export const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

export const getFocusableElements = (container: ParentNode) => {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true',
  );
};

export const focusFirst = (container: ParentNode) => {
  const target = getFocusableElements(container)[0];
  target?.focus();
  return target ?? null;
};

export const focusLast = (container: ParentNode) => {
  const elements = getFocusableElements(container);
  const target = elements[elements.length - 1];
  target?.focus();
  return target ?? null;
};

export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return startOfDay(nextDate);
};

export const addMonths = (date: Date, amount: number) => {
  const baseDate = startOfDay(date);
  const targetMonth = baseDate.getMonth() + amount;
  const targetYear = baseDate.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const daysInTargetMonth = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const targetDay = Math.min(baseDate.getDate(), daysInTargetMonth);

  return new Date(targetYear, normalizedMonth, targetDay);
};

export const startOfWeek = (date: Date, weekStartsOn = 0) => {
  const normalizedDate = startOfDay(date);
  const offset = (normalizedDate.getDay() - weekStartsOn + 7) % 7;
  return addDays(normalizedDate, -offset);
};

export const isSameDay = (left: Date | null | undefined, right: Date | null | undefined) =>
  Boolean(
    left &&
      right &&
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate(),
  );

export const parseDateValue = (value?: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map((segment) => Number.parseInt(segment, 10));
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(date);
};

export const toDateValue = (date: Date) => {
  const year = `${date.getFullYear()}`;
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
};
