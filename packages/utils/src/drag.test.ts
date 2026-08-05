import {
  dragCarriesFiles,
  dragCarriesTypes,
  filesFromTransfer,
  fileMatchesPattern,
  nextDragDepth,
  payloadFromTransfer,
} from './drag';

const file = (name: string, type: string) => new File(['x'], name, { type });

describe('dragCarriesTypes (TREEUX-022/040)', () => {
  it('accepts a file drag through the browser type name', () => {
    expect(dragCarriesFiles({ types: ['Files'] })).toBe(true);
    expect(dragCarriesTypes({ types: ['Files'] }, ['Files'])).toBe(true);
  });

  it('accepts a product payload without assuming files', () => {
    expect(dragCarriesTypes({ types: ['application/x-s7-task'] }, ['application/x-s7-task'])).toBe(
      true,
    );
    expect(dragCarriesFiles({ types: ['application/x-s7-task'] })).toBe(false);
  });

  it('rejects a plain text drag, so dragging text into a field keeps working', () => {
    expect(dragCarriesFiles({ types: ['text/plain'] })).toBe(false);
  });

  it('is false for a missing transfer or an empty accept list', () => {
    expect(dragCarriesTypes(null, ['Files'])).toBe(false);
    expect(dragCarriesTypes({ types: ['Files'] }, [])).toBe(false);
  });
});

describe('nextDragDepth', () => {
  it('counts nested enters and leaves instead of flickering a boolean', () => {
    let depth = 0;
    depth = nextDragDepth(depth, 1); // enter the region
    depth = nextDragDepth(depth, 1); // enter a child
    expect(depth).toBe(2);
    depth = nextDragDepth(depth, -1); // the parent's leave, fired first
    expect(depth).toBe(1); // still inside — the veil must stay up
    depth = nextDragDepth(depth, -1);
    expect(depth).toBe(0);
  });

  it('never goes negative, so a stray leave cannot wedge the veil open', () => {
    expect(nextDragDepth(0, -1)).toBe(0);
  });
});

describe('filesFromTransfer', () => {
  const transfer = { files: [file('a.png', 'image/png'), file('b.txt', 'text/plain')] };

  it('returns everything with no accept filter', () => {
    expect(filesFromTransfer(transfer).map((f) => f.name)).toEqual(['a.png', 'b.txt']);
  });

  it.each([
    ['image/*', ['a.png']],
    ['.txt', ['b.txt']],
    ['image/png,text/plain', ['a.png', 'b.txt']],
  ])('filters by %s', (accept, expected) => {
    expect(filesFromTransfer(transfer, accept).map((f) => f.name)).toEqual(expected);
  });

  it('matches the three shapes an accept entry takes', () => {
    expect(fileMatchesPattern(file('a.PNG', 'image/png'), '.png')).toBe(true);
    expect(fileMatchesPattern(file('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(fileMatchesPattern(file('a.png', 'image/png'), 'image/jpeg')).toBe(false);
  });
});

describe('payloadFromTransfer', () => {
  const transfer = {
    types: ['application/x-s7-task'],
    getData: (type: string) => (type === 'application/x-s7-task' ? '{"id":"7"}' : ''),
  };

  it('parses a JSON payload', () => {
    expect(payloadFromTransfer<{ id: string }>(transfer, 'application/x-s7-task')).toEqual({
      id: '7',
    });
  });

  it('returns the raw string when it is not JSON', () => {
    expect(
      payloadFromTransfer({ types: ['text/plain'], getData: () => 'hello' }, 'text/plain'),
    ).toBe('hello');
  });

  it('returns null for a type the drag does not carry', () => {
    expect(payloadFromTransfer(transfer, 'text/plain')).toBeNull();
  });
});
