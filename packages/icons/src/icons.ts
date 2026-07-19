import type { TIconNode, TIconNodes } from './registry';

/**
 * TreeUI Branchline — the original icon language shipped by TreeUI.
 *
 * Every glyph is authored locally on a 24x24 grid. Repeated concepts share
 * TreeUI primitives (frames, branches, badges), while each canonical
 * name receives its own geometry fingerprint. Compatibility aliases reuse the
 * exact canonical node array.
 */

const BUILTIN_ICON_NAMES = [
  'account',
  'activity',
  'ai-studio',
  'alert-circle',
  'align-left',
  'app-window',
  'apps-grid',
  'archive',
  'archive-restore',
  'arrow-down',
  'arrow-left',
  'arrow-left-right',
  'arrow-right',
  'arrow-up',
  'arrow-up-right',
  'assistant',
  'automation-key',
  'automations',
  'badge',
  'badge-check',
  'badge-star',
  'ban',
  'bell',
  'book-open',
  'bookmark',
  'bot',
  'bot-badge',
  'bot-users',
  'boxes',
  'boxes-model',
  'braces',
  'brackets',
  'brain',
  'brain-circuit',
  'brain-lock',
  'browser',
  'brush',
  'brush-stroke',
  'bug',
  'building-2',
  'calculator',
  'calendar',
  'calendar-clock',
  'calendar-day',
  'calendar-days',
  'calendar-dot',
  'calendar-plus',
  'calendar-range',
  'calendar-x',
  'carousel',
  'catalog',
  'chart-column',
  'chart-line',
  'chart-pie',
  'chat',
  'check',
  'check-circle',
  'check-square',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'chevron-up',
  'chevron-updown',
  'chevrons-up-down',
  'circle-alert',
  'circle-check',
  'circle-dot',
  'circle-help',
  'circle-x',
  'clipboard-list',
  'clock',
  'clock-alert',
  'clock-sparkles',
  'clock-x',
  'close',
  'cloud',
  'cloud-off',
  'code',
  'code-2',
  'code-api',
  'coins',
  'comment',
  'companion',
  'compass',
  'connections',
  'contentpilot',
  'copy',
  'cpu',
  'cpu-chip',
  'credit-card',
  'crosshair',
  'crown',
  'cube',
  'database',
  'developer-settings',
  'device-link',
  'dollar-circle',
  'dollar-limit',
  'download',
  'download-video',
  'draw',
  'droplet',
  'ellipsis',
  'ellipsis-vertical',
  'embed-code',
  'eraser',
  'extension',
  'external-link',
  'eye',
  'eye-off',
  'file',
  'file-archive',
  'file-audio',
  'file-code',
  'file-edit',
  'file-image',
  'file-pdf',
  'file-plus',
  'file-scan',
  'file-text',
  'file-video',
  'file-warning',
  'files',
  'film',
  'filter',
  'filter-capabilities',
  'fingerprint',
  'flag',
  'flask-play',
  'folder',
  'folder-input',
  'folder-kanban',
  'folder-open',
  'folder-plus',
  'folder-shared',
  'folder-tree',
  'folder-x',
  'folders',
  'gauge',
  'gauge-high',
  'gauge-low',
  'gauge-medium',
  'gavel',
  'git-branch',
  'git-fork',
  'globe',
  'globe-check',
  'grid',
  'grip-vertical',
  'hand-check',
  'hard-drive',
  'hard-drive-alert',
  'hard-drive-off',
  'hash',
  'heart',
  'heart-chart-up',
  'heart-pulse',
  'help',
  'hierarchy',
  'history',
  'home',
  'hourglass',
  'house',
  'human-lock',
  'id-badge',
  'image',
  'image-minus',
  'image-plus',
  'image-up',
  'inbox',
  'inbox-empty',
  'info',
  'install',
  'journal',
  'key',
  'key-off',
  'key-round',
  'languages',
  'laptop',
  'laptop-bridge',
  'layers',
  'layout-dashboard',
  'layout-grid',
  'layout-kanban',
  'leaf',
  'library-books',
  'life-buoy',
  'lightbulb',
  'lightbulb-sparkles',
  'line-width',
  'link',
  'link-2',
  'link-off',
  'list',
  'list-checks',
  'list-ordered',
  'list-rule',
  'list-todo',
  'llm',
  'loader-circle',
  'lock',
  'lock-keyhole',
  'log-in',
  'log-out',
  'log-out-all',
  'magic-wand',
  'mail',
  'mail-check',
  'mail-open',
  'mail-plus',
  'mail-warning',
  'mails',
  'market',
  'maximize-2',
  'megaphone',
  'memory-stick',
  'menu',
  'message-circle',
  'message-square',
  'message-square-plus',
  'messages-square',
  'mic',
  'microphone',
  'minimize-2',
  'minus',
  'minus-square',
  'monitor-home',
  'monitor-smartphone',
  'moon',
  'more-horizontal',
  'mouse-pointer-2',
  'move-horizontal',
  'network',
  'network-nodes',
  'newsletter',
  'newspaper',
  'octagon-x',
  'package',
  'package-download',
  'page-snapshot',
  'palette',
  'panel-left',
  'panel-right',
  'panels-top-left',
  'paper-plane',
  'paperclip',
  'pause',
  'pause-circle',
  'pencil',
  'persona',
  'piggy-bank',
  'pipette',
  'play',
  'play-circle',
  'plug',
  'plug-cloud',
  'plug-off',
  'plug-plus',
  'plugin',
  'plus',
  'price-tag',
  'publish',
  'quote',
  'radio',
  'radio-tower',
  'receipt',
  'refresh',
  'refresh-cw',
  'refresh-cw-off',
  'repeat',
  'repeat-2',
  'repeat-fallback',
  'repeat-interval',
  'responses-list',
  'rocket',
  'rotate-ccw',
  'rotate-cw',
  'route',
  'rss',
  'save',
  'scale',
  'scan',
  'search',
  'search-x',
  'send',
  'send-check',
  'send-request',
  'server',
  'server-api',
  'server-environment',
  'settings',
  'settings-2',
  'share',
  'share-nodes',
  'shield',
  'shield-check',
  'shield-lock',
  'shield-question',
  'shield-x',
  'shopping-basket',
  'shopping-cart',
  'shuffle',
  'signal',
  'signal-high',
  'signal-low',
  'signal-medium',
  'signal-off',
  'siren',
  'sliders-horizontal',
  'smartphone',
  'sparkles',
  'square',
  'square-check',
  'square-plus',
  'square-terminal',
  'star',
  'sticker',
  'storage',
  'store',
  'story',
  'sun',
  'support',
  'target',
  'target-choice',
  'tasks',
  'terminal',
  'ticket',
  'ticket-plus',
  'tickets',
  'timeline',
  'timer',
  'toggle-left',
  'toggle-right',
  'token-input',
  'token-output',
  'trail',
  'trash-2',
  'trend-up',
  'triangle-alert',
  'type',
  'unlink',
  'unplug',
  'upload',
  'upload-cloud',
  'user',
  'user-check',
  'user-cog',
  'user-minus',
  'user-plus',
  'user-round',
  'user-x',
  'users',
  'users-round',
  'vault',
  'volume-2',
  'wallet',
  'wand-sparkles',
  'warehouse',
  'workflow',
  'workspace',
  'wrench',
  'wrench-zap',
  'x',
  'zap',
] as const;

type TBuiltinIconName = (typeof BUILTIN_ICON_NAMES)[number];
type TModifier =
  | 'alert'
  | 'check'
  | 'lock'
  | 'minus'
  | 'plus'
  | 'sparkles'
  | 'star'
  | 'x';

const path = (d: string): TIconNode => ['path', { d }];
const circle = (cx: number, cy: number, r: number): TIconNode => [
  'circle',
  { cx, cy, r },
];
const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
  rx: number,
): TIconNode => ['rect', { x, y, width, height, rx }];
const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): TIconNode => ['line', { x1, y1, x2, y2 }];
const polyline = (points: string): TIconNode => ['polyline', { points }];
const polygon = (points: string): TIconNode => ['polygon', { points }];
const ellipse = (cx: number, cy: number, rx: number, ry: number): TIconNode => [
  'ellipse',
  { cx, cy, rx, ry },
];
const glyph = (...nodes: TIconNode[]): TIconNodes => nodes;

const hashName = (name: string): number => {
  let hash = 2166136261;

  for (const character of name) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

const branchMark = (
  name: string,
  centerX = 12,
  centerY = 12,
  radius = 5.25,
): TIconNodes => {
  const terminals = [
    [0, -1],
    [0.72, -0.72],
    [1, 0],
    [0.72, 0.72],
    [0, 1],
    [-0.72, 0.72],
    [-1, 0],
    [-0.72, -0.72],
  ] as const;
  const hash = hashName(name);
  const indices = [hash % 8, (hash >>> 5) % 8, (hash >>> 11) % 8];

  if (indices[1] === indices[0]) indices[1] = (indices[1] + 3) % 8;
  while (indices[2] === indices[0] || indices[2] === indices[1]) {
    indices[2] = (indices[2] + 1) % 8;
  }

  const points = indices.map((index) => {
    const [x, y] = terminals[index];

    return [
      Number((centerX + x * radius).toFixed(2)),
      Number((centerY + y * radius).toFixed(2)),
    ] as const;
  });
  const routes = points
    .map(([x, y]) => `M${centerX} ${centerY}L${x} ${y}`)
    .join('');

  return glyph(
    path(routes),
    circle(centerX, centerY, 1.15),
    ...points.map(([x, y]) => circle(x, y, 0.78)),
  );
};

const badge = (modifier: TModifier): TIconNodes => {
  const frame = circle(18, 18, 3.35);

  switch (modifier) {
    case 'check':
      return glyph(frame, polyline('16.4,18.1 17.55,19.25 19.8,16.7'));
    case 'minus':
      return glyph(frame, line(16.35, 18, 19.65, 18));
    case 'plus':
      return glyph(frame, line(18, 16.3, 18, 19.7), line(16.3, 18, 19.7, 18));
    case 'x':
      return glyph(frame, line(16.65, 16.65, 19.35, 19.35), line(19.35, 16.65, 16.65, 19.35));
    case 'alert':
      return glyph(frame, line(18, 15.95, 18, 18.25), circle(18, 20, 0.35));
    case 'lock':
      return glyph(
        path('M16.5 17v-1a1.5 1.5 0 0 1 3 0v1'),
        rect(15.75, 17, 4.5, 3.5, 1),
      );
    case 'sparkles':
      return glyph(path('M18 14.8v6.4M14.8 18h6.4M15.3 15.3l5.4 5.4M20.7 15.3l-5.4 5.4'));
    case 'star':
      return glyph(polygon('18,14.8 19,16.9 21.3,17.2 19.6,18.8 20,21.1 18,20 16,21.1 16.4,18.8 14.7,17.2 17,16.9'));
  }
};

const documentFrame = (): TIconNodes =>
  glyph(
    path('M5.25 3.25h8.5l5 5.25v12.25H5.25z'),
    path('M13.75 3.25V8.5h5'),
  );

const folderFrame = (): TIconNodes =>
  glyph(path('M2.75 7.25h6l2-2h10.5v14H2.75z'), path('M2.75 9.75h18.5'));

const calendarFrame = (): TIconNodes =>
  glyph(
    path('M5.25 4.25h13.5a2 2 0 0 1 2 2v13H3.25v-13a2 2 0 0 1 2-2Z'),
    line(3.25, 9, 20.75, 9),
    line(7.5, 2.75, 7.5, 6),
    line(16.5, 2.75, 16.5, 6),
  );

const clockFrame = (): TIconNodes =>
  glyph(path('M12 2.75a9.25 9.25 0 1 0 8.5 5.6'), path('M12 7v5l3.75 2.25'), circle(20.25, 5.75, 0.65));

const mailFrame = (): TIconNodes =>
  glyph(
    path('M3.25 6.25h17.5v12.5H3.25z'),
    path('m3.75 7 7.05 6.1a1.8 1.8 0 0 0 2.4 0L20.25 7'),
  );

const messageFrame = (round = false): TIconNodes =>
  round
    ? glyph(path('M4 5.25h16v11.5H10l-5.25 3 .9-3.8A2 2 0 0 1 4 14z'))
    : glyph(path('M3.25 4.75h17.5v12.5H9.5l-5.75 3.25 1.1-3.95a2 2 0 0 1-1.6-1.95z'));

const userFrame = (plural = false): TIconNodes =>
  plural
    ? glyph(
        circle(9.25, 8, 3),
        path('M3.75 19.75v-1.5a5.5 5.5 0 0 1 11 0v1.5'),
        circle(17.25, 9, 2.25),
        path('M15.25 14.5a4.5 4.5 0 0 1 5 4.5v.75'),
      )
    : glyph(circle(12, 7.5, 3.25), path('M4.75 20a7.25 7.25 0 0 1 14.5 0'));

const shieldFrame = (): TIconNodes =>
  glyph(path('M12 2.75 20 6.1v5.65c0 4.8-3.15 8-8 9.5-4.85-1.5-8-4.7-8-9.5V6.1z'));

const fileMark = (kind: string): TIconNodes => {
  switch (kind) {
    case 'archive':
      return glyph(rect(8, 11.25, 8, 5.75, 1.25), line(8, 13.25, 16, 13.25), line(11, 10, 13, 10));
    case 'audio':
      return glyph(path('M8 15h2l3 2.25v-8.5L10 11H8z'), path('M15 11.2a3 3 0 0 1 0 3.6'));
    case 'code':
      return glyph(polyline('10,11 7.5,13.5 10,16'), polyline('14,11 16.5,13.5 14,16'));
    case 'edit':
      return glyph(path('m8 16.5.7-3 5.8-5.8 2.3 2.3-5.8 5.8z'), line(8, 17.75, 15.5, 17.75));
    case 'image':
      return glyph(circle(9, 11.5, 1.2), polyline('7.5,17 11,13.5 13.25,15.5 15,13.75 17,16'));
    case 'pdf':
      return glyph(path('M8 16.75v-5h2.25a1.75 1.75 0 0 1 0 3.5H8M13 11.75v5M13 14.25h2.5M17 16.75v-5h2'));
    case 'scan':
      return glyph(path('M8 13v-2h2M16 13v-2h-2M8 15v2h2M16 15v2h-2'));
    case 'text':
      return glyph(line(8, 11.5, 16.5, 11.5), line(8, 14.5, 15, 14.5), line(8, 17.5, 13.5, 17.5));
    case 'video':
      return glyph(rect(8, 11, 8, 6, 1.25), polygon('11,12.5 14.5,14 11,15.5'));
    default:
      return glyph(line(8, 12, 16, 12), line(8, 15.25, 13.75, 15.25));
  }
};

const familyFile = (name: string): TIconNodes => {
  const kind = name === 'file' ? '' : name.slice('file-'.length);

  return kind ? glyph(...documentFrame(), ...fileMark(kind)) : documentFrame();
};

const familyFolder = (name: string): TIconNodes => {
  const kind = name === 'folder' ? '' : name.slice('folder-'.length);
  const base = folderFrame();

  switch (kind) {
    case 'open':
      return glyph(...base, path('m3.5 18.75 3-7h15l-3 7'));
    case 'tree':
      return glyph(...base, path('M8 11.5v4M8 13.5h5M13 13.5v3M13 13.5h4v3'), circle(8, 17, 0.7), circle(13, 17, 0.7), circle(17, 17, 0.7));
    case 'kanban':
      return glyph(...base, line(7.25, 12, 7.25, 17), line(12, 12, 12, 15.5), line(16.75, 12, 16.75, 18));
    case 'shared':
      return glyph(...base, circle(9, 14, 1.25), circle(15.5, 12.5, 1.25), path('M10.2 13.7 14.3 12.8M10 15l4.6 1.5'), circle(16, 17, 1.25));
    case 'input':
      return glyph(...base, path('M12 12v5M9.75 14.75 12 17l2.25-2.25'));
    default:
      return base;
  }
};

const familyCalendar = (name: string): TIconNodes => {
  const base = calendarFrame();
  const kind = name === 'calendar' ? '' : name.slice('calendar-'.length);

  switch (kind) {
    case 'day':
      return glyph(...base, rect(8.25, 11.5, 7.5, 5, 1));
    case 'days':
      return glyph(...base, circle(8, 12.5, 0.6), circle(12, 12.5, 0.6), circle(16, 12.5, 0.6), circle(8, 16.5, 0.6), circle(12, 16.5, 0.6));
    case 'dot':
      return glyph(...base, circle(12, 14.5, 1.3));
    case 'range':
      return glyph(...base, circle(7.5, 14.5, 0.75), line(8.5, 14.5, 15.5, 14.5), circle(16.5, 14.5, 0.75));
    default:
      return glyph(...base, line(7, 13, 10, 13), line(7, 16.5, 13.5, 16.5));
  }
};

const familyMail = (name: string): TIconNodes => {
  const base = mailFrame();

  if (name === 'mail-open') return glyph(path('M3.25 10.25 12 4l8.75 6.25v8.5H3.25z'), path('m3.75 10.5 7.05 5.4a1.8 1.8 0 0 0 2.4 0l7.05-5.4'));
  if (name === 'mails') return glyph(...base, path('M5.75 3.25h15v11.5'));

  return base;
};

const familySignal = (name: string): TIconNodes => {
  const count = name.endsWith('low') ? 1 : name.endsWith('medium') ? 2 : name.endsWith('high') ? 4 : 3;
  const nodes: TIconNode[] = [];

  for (let index = 0; index < 4; index += 1) {
    const x = 5 + index * 4.5;
    const top = 18 - (index + 1) * 3.25;

    nodes.push(line(x, 19.5, x, index < count ? top : 18.5));
  }

  return nodes;
};

const familyGauge = (name: string): TIconNodes => {
  const end = name.endsWith('low') ? 9 : name.endsWith('medium') ? 12 : name.endsWith('high') ? 16 : 14;

  return glyph(path('M3.25 17.5a9.25 9.25 0 0 1 17.5 0'), line(12, 17.5, end, 9.5), circle(12, 17.5, 1.25));
};

const familyList = (name: string): TIconNodes => {
  const rows = [7, 12, 17];
  const nodes: TIconNode[] = [];

  for (const [index, y] of rows.entries()) {
    if (name === 'list-ordered') {
      nodes.push(path(`M4 ${y - 1}h1v2`));
    } else if (name.includes('checks') || name.includes('todo')) {
      nodes.push(polyline(`3.5,${y} 4.5,${y + 1} 6,${y - 1}`));
    } else if (name === 'list-rule') {
      nodes.push(circle(4.75, y, index === 1 ? 1 : 0.55));
    } else {
      nodes.push(circle(4.75, y, 0.55));
    }
    nodes.push(line(8, y, index === 1 && name === 'list-todo' ? 17 : 20.5, y));
  }

  return nodes;
};

const familyMessage = (name: string): TIconNodes => {
  const round = name.includes('circle');
  const base = messageFrame(round);

  if (name === 'messages-square') return glyph(...base, path('M7 2.75h14v11.5l-3 2'));
  if (name === 'responses-list') {
    return glyph(
      ...base,
      circle(8, 9, 0.55),
      line(10.5, 9, 16.5, 9),
      circle(8, 13, 0.55),
      line(10.5, 13, 14.5, 13),
    );
  }
  if (name.includes('plus')) return glyph(...base, line(12, 8.75, 12, 14), line(9.4, 11.4, 14.6, 11.4));

  return glyph(...base, circle(9, 11, 0.55), circle(12, 11, 0.55), circle(15, 11, 0.55));
};

const familyUser = (name: string): TIconNodes => {
  const base = userFrame(name.startsWith('users'));

  if (name === 'users-round') {
    return glyph(
      circle(12, 12, 9.25),
      circle(9.25, 8.75, 2.25),
      circle(16.25, 9.5, 1.75),
      path('M5.25 18a4.5 4.5 0 0 1 8 0M13.25 15.25a4 4 0 0 1 5.5 2.75'),
    );
  }
  if (name.endsWith('round')) return glyph(circle(12, 12, 9.25), circle(12, 8.5, 2.5), path('M6.5 18a6.25 6.25 0 0 1 11 0'));
  if (name.endsWith('cog')) return glyph(...base, circle(18, 17.5, 2.25), path('M18 14.2v1M18 19.8v1M14.7 17.5h1M20.3 17.5h1'));

  return base;
};

const familyShield = (name: string): TIconNodes => {
  const base = shieldFrame();

  if (name.endsWith('question')) return glyph(...base, path('M9.8 9.3a2.4 2.4 0 1 1 3.4 2.2c-.8.4-1.2.9-1.2 1.7'), circle(12, 16.3, 0.45));

  return base;
};

const familyKey = (name: string): TIconNodes => {
  const round = name.endsWith('round');

  return glyph(
    round ? circle(7.25, 12.25, 3.75) : path('M3.25 12.25a4 4 0 1 0 8 0 4 4 0 1 0-8 0'),
    path('M11 12.25h10M17 12.25v3M20 12.25v2'),
  );
};

const deviceFrame = (kind: string): TIconNodes => {
  if (kind.includes('smartphone')) return glyph(rect(7.25, 2.75, 9.5, 18.5, 2.25), line(10.5, 18.25, 13.5, 18.25));
  if (kind.includes('laptop')) return glyph(rect(4.25, 4, 15.5, 11.5, 2), path('M2.75 18h18.5l-1 2.25H3.75z'));

  return glyph(rect(3.25, 3.25, 17.5, 13.5, 2.25), line(8.5, 20.5, 15.5, 20.5), line(12, 16.75, 12, 20.5));
};

const storageFrame = (name: string): TIconNodes => {
  if (name === 'database') return glyph(ellipse(12, 5.5, 7.75, 2.75), path('M4.25 5.5v6c0 1.5 3.5 2.75 7.75 2.75s7.75-1.25 7.75-2.75v-6M4.25 11.5v6c0 1.5 3.5 2.75 7.75 2.75s7.75-1.25 7.75-2.75v-6'));
  if (name.startsWith('server')) return glyph(rect(3.25, 4, 17.5, 6.5, 1.75), rect(3.25, 13.5, 17.5, 6.5, 1.75), circle(7, 7.25, 0.65), circle(7, 16.75, 0.65), line(11, 7.25, 17.5, 7.25), line(11, 16.75, 17.5, 16.75));

  return glyph(rect(3.25, 5, 17.5, 14, 2.25), line(3.25, 11.5, 20.75, 11.5), circle(7, 15.25, 0.65), line(11, 15.25, 17.5, 15.25));
};

const TREEUI_PRODUCT_ICON_NAMES = new Set<string>([
  'account',
  'ai-studio',
  'app-window',
  'assistant',
  'catalog',
  'companion',
  'contentpilot',
  'draw',
  'llm',
  'market',
  'storage',
  'support',
  'tasks',
  'trail',
]);

const productGeometry = (name: string): TIconNodes => {
  const frame = rect(3, 3, 18, 18, 4.25);
  const kind = name === 'app-window' ? 'window' : name;

  switch (kind) {
    case 'account': return glyph(frame, circle(12, 9, 2.25), path('M7.75 17a4.25 4.25 0 0 1 8.5 0'));
    case 'tasks': return glyph(frame, polyline('7.5,9 9,10.5 11.5,7.5'), line(13, 9, 17, 9), polyline('7.5,14 9,15.5 11.5,12.5'), line(13, 14, 17, 14));
    case 'storage': return glyph(frame, ellipse(12, 8.5, 5, 1.75), path('M7 8.5v6c0 1 2.25 1.75 5 1.75s5-.75 5-1.75v-6'));
    case 'draw': return glyph(frame, path('m8 16 1-4 6-6 3 3-6 6z'), line(7, 17.5, 14, 17.5));
    case 'market': return glyph(frame, path('M7 9h10l-1 8H8z'), path('M9 9a3 3 0 0 1 6 0'));
    case 'support': return glyph(frame, circle(12, 12, 5), circle(12, 12, 2), line(8.5, 8.5, 10.5, 10.5), line(13.5, 13.5, 15.5, 15.5));
    case 'catalog': return glyph(frame, rect(6.5, 6.5, 4.25, 4.25, 1), rect(13.25, 6.5, 4.25, 4.25, 1), rect(6.5, 13.25, 4.25, 4.25, 1), rect(13.25, 13.25, 4.25, 4.25, 1));
    case 'companion': return glyph(frame, path('M12 17c-5-2.6-6-7.1-3.4-8.6A3.3 3.3 0 0 1 12 9.5a3.3 3.3 0 0 1 3.4-1.1C18 9.9 17 14.4 12 17Z'));
    case 'llm': return glyph(frame, circle(8, 9, 1), circle(16, 9, 1), circle(12, 16, 1), path('M8.8 9.5 11.4 15M15.2 9.5 12.6 15M9 9h6'));
    case 'window': return glyph(frame, line(3, 8, 21, 8), circle(6.25, 5.5, 0.5), circle(9, 5.5, 0.5), rect(7, 11, 10, 6, 1.25));
    case 'ai-studio': return glyph(frame, ...branchMark(name, 12, 12, 4.75));
    case 'assistant': return glyph(frame, rect(7, 8, 10, 8, 2), circle(10, 12, 0.7), circle(14, 12, 0.7), line(10, 15, 14, 15), line(12, 6, 12, 8), circle(12, 5.5, 0.55));
    case 'contentpilot': return glyph(frame, path('M6.5 10h3l7-3v9l-7-3h-3z'), path('M9.5 13l1.25 4h2.5'), path('M18 5v3M16.5 6.5h3'));
    case 'trail': return glyph(frame, circle(7.5, 16, 1.25), circle(16.5, 8, 1.25), path('M8.75 15.5c5-.5 2-6.5 6.5-7'));
    default: throw new Error(`Missing TreeUI product icon geometry: ${name}`);
  }
};

const directionGeometry = (name: string): TIconNodes | undefined => {
  switch (name) {
    case 'arrow-left': return glyph(line(20.5, 12, 4.5, 12), polyline('10,5.75 3.75,12 10,18.25'), circle(20.5, 12, 0.55));
    case 'arrow-right': return glyph(line(3.5, 12, 19.5, 12), polyline('14,5.75 20.25,12 14,18.25'), circle(3.5, 12, 0.55));
    case 'arrow-up': return glyph(line(12, 20.5, 12, 4.5), polyline('5.75,10 12,3.75 18.25,10'), circle(12, 20.5, 0.55));
    case 'arrow-down': return glyph(line(12, 3.5, 12, 19.5), polyline('5.75,14 12,20.25 18.25,14'), circle(12, 3.5, 0.55));
    case 'arrow-up-right': return glyph(path('M4 20 20 4M10 4h10v10'), circle(4, 20, 0.55));
    case 'arrow-left-right': return glyph(path('M4 8h15M4 8l4-4M4 8l4 4M20 16H5M20 16l-4-4M20 16l-4 4'));
    case 'move-horizontal': return glyph(line(4, 12, 20, 12), polyline('8,7 3,12 8,17'), polyline('16,7 21,12 16,17'), circle(12, 12, 0.75));
    case 'chevron-left': return glyph(polyline('15.5,4.5 8,12 15.5,19.5'), circle(8, 12, 0.55));
    case 'chevron-right': return glyph(polyline('8.5,4.5 16,12 8.5,19.5'), circle(16, 12, 0.55));
    case 'chevron-up': return glyph(polyline('4.5,15.5 12,8 19.5,15.5'), circle(12, 8, 0.55));
    case 'chevron-down': return glyph(polyline('4.5,8.5 12,16 19.5,8.5'), circle(12, 16, 0.55));
    case 'chevrons-up-down': return glyph(polyline('6,9.5 12,3.5 18,9.5'), polyline('6,14.5 12,20.5 18,14.5'), circle(12, 12, 0.6));
    case 'maximize-2': return glyph(path('M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5'), circle(12, 12, 0.7));
    case 'minimize-2': return glyph(path('M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5'), circle(12, 12, 0.7));
    default: return undefined;
  }
};

const directGeometry = (name: string): TIconNodes | undefined => {
  switch (name) {
    case 'activity': return glyph(polyline('2.75,13 6.5,13 9,6 13,18 15.5,11 21.25,11'), circle(9, 6, 0.55), circle(13, 18, 0.55));
    case 'align-left': return glyph(line(4, 5, 20, 5), line(4, 10, 15, 10), line(4, 15, 18, 15), line(4, 20, 12, 20));
    case 'plus': return glyph(line(12, 3.5, 12, 20.5), line(3.5, 12, 20.5, 12), circle(12, 12, 0.8));
    case 'minus': return glyph(line(3.5, 12, 20.5, 12), circle(12, 12, 0.8));
    case 'x': return glyph(line(4.25, 4.25, 19.75, 19.75), line(19.75, 4.25, 4.25, 19.75), circle(12, 12, 0.8));
    case 'check': return glyph(polyline('3.5,12.75 8.75,18 20.5,5.75'), circle(8.75, 18, 0.8));
    case 'menu': return glyph(line(3.5, 6, 20.5, 6), line(3.5, 12, 16.5, 12), line(3.5, 18, 12.5, 18), circle(20.5, 6, 0.5));
    case 'ellipsis': return glyph(circle(5, 12, 1.1), circle(12, 12, 1.1), circle(19, 12, 1.1));
    case 'more-horizontal': return glyph(line(3.5, 12, 6.5, 12), circle(12, 12, 1.1), line(17.5, 12, 20.5, 12));
    case 'ellipsis-vertical': return glyph(circle(12, 5, 1.1), circle(12, 12, 1.1), circle(12, 19, 1.1));
    case 'grip-vertical': return glyph(circle(9, 6, 0.8), circle(15, 6, 0.8), circle(9, 12, 0.8), circle(15, 12, 0.8), circle(9, 18, 0.8), circle(15, 18, 0.8));
    case 'square': return glyph(rect(3.25, 3.25, 17.5, 17.5, 3.25), path('M16.25 3.25v4.5h4.5'));
    case 'square-check': return glyph(rect(3.25, 3.25, 17.5, 17.5, 3.25), polyline('7,12.25 10.5,15.75 17.5,8'));
    case 'square-plus': return glyph(rect(3.25, 3.25, 17.5, 17.5, 3.25), line(12, 7.5, 12, 16.5), line(7.5, 12, 16.5, 12));
    case 'minus-square': return glyph(rect(3.25, 3.25, 17.5, 17.5, 3.25), line(7.5, 12, 16.5, 12));
    case 'circle-check': return glyph(circle(12, 12, 9.25), polyline('7.25,12.5 10.75,16 17.5,8.5'));
    case 'check-circle': return glyph(path('M20.5 10.5A8.75 8.75 0 1 1 15 3.75'), polyline('7,12.5 10.5,16 20,5.75'));
    case 'circle-x': return glyph(circle(12, 12, 9.25), line(8.5, 8.5, 15.5, 15.5), line(15.5, 8.5, 8.5, 15.5));
    case 'circle-dot': return glyph(circle(12, 12, 9.25), circle(12, 12, 2.1), circle(12, 12, 0.5));
    case 'alert-circle': return glyph(circle(12, 12, 9.25), line(12, 6.75, 12, 13.25), circle(12, 17, 0.65));
    case 'circle-alert': return glyph(path('M12 2.75a9.25 9.25 0 1 1-6.8 3'), polygon('12,6.25 16,14.75 8,14.75'), circle(12, 17.25, 0.55));
    case 'circle-help': return glyph(circle(12, 12, 9.25), path('M8.75 9a3.5 3.5 0 1 1 4.75 3.25c-1 .55-1.5 1.2-1.5 2.25'), circle(12, 17.75, 0.5));
    case 'info': return glyph(path('M12 2.75a9.25 9.25 0 1 0 7.4 3.7'), line(12, 10.5, 12, 17), circle(12, 7, 0.65), circle(20.25, 5, 0.55));
    case 'triangle-alert': return glyph(polygon('12,2.75 21,20.5 3,20.5'), line(12, 8, 12, 14), circle(12, 17.5, 0.55));
    case 'octagon-x': return glyph(polygon('8,2.75 16,2.75 21.25,8 21.25,16 16,21.25 8,21.25 2.75,16 2.75,8'), line(8.5, 8.5, 15.5, 15.5), line(15.5, 8.5, 8.5, 15.5));
    case 'ban': return glyph(circle(12, 12, 9.25), line(5.5, 5.5, 18.5, 18.5));
    case 'search': return glyph(circle(10.25, 10.25, 6.75), line(15.25, 15.25, 20.75, 20.75), circle(20.75, 20.75, 0.5));
    case 'loader-circle': return glyph(path('M20.5 12a8.5 8.5 0 1 1-4.25-7.35'), circle(17.25, 5.5, 0.8));
    case 'home': return glyph(path('M3 11.25 12 3l9 8.25V21H3z'), path('M8.5 21v-7h7v7'), circle(12, 3, 0.5));
    case 'house': return glyph(path('M2.75 12 12 4.25 21.25 12'), path('M5 10.25v10h14v-10'), path('M9 20.25v-6.5h6v6.5'));
    case 'bookmark': return glyph(path('M6 3.25h12v17.5l-6-4-6 4z'), circle(12, 7.25, 0.6));
    case 'bell': return glyph(path('M5 16.5h14l-1.75-2.25v-4.5a5.25 5.25 0 0 0-10.5 0v4.5z'), path('M9.5 19a2.75 2.75 0 0 0 5 0'), circle(12, 3.75, 0.5));
    case 'heart': return glyph(path('M12 20.5C4 16.4 2.75 10 6.4 6.75A4.8 4.8 0 0 1 12 7.5a4.8 4.8 0 0 1 5.6-.75C21.25 10 20 16.4 12 20.5Z'), circle(12, 7.5, 0.45));
    case 'star': return glyph(polygon('12,2.75 14.9,8.7 21.25,9.6 16.6,14.1 17.75,20.5 12,17.45 6.25,20.5 7.4,14.1 2.75,9.6 9.1,8.7'));
    case 'sparkles': return glyph(path('M12 2.75c.8 5.3 2.95 7.45 8.25 8.25-5.3.8-7.45 2.95-8.25 8.25-.8-5.3-2.95-7.45-8.25-8.25C9.05 10.2 11.2 8.05 12 2.75Z'), path('M19 2.75v4.5M16.75 5h4.5'));
    case 'play': return glyph(polygon('6,3.75 20.25,12 6,20.25'), circle(6, 12, 0.55));
    case 'pause': return glyph(rect(5.25, 3.5, 4.5, 17, 1.5), rect(14.25, 3.5, 4.5, 17, 1.5));
    case 'play-circle': return glyph(circle(12, 12, 9.25), polygon('9.5,7.75 17,12 9.5,16.25'));
    case 'pause-circle': return glyph(circle(12, 12, 9.25), line(9.5, 8, 9.5, 16), line(14.5, 8, 14.5, 16));
    case 'eye': return glyph(path('M2.75 12c2.8-5 6-7.25 9.25-7.25S18.45 7 21.25 12c-2.8 5-6 7.25-9.25 7.25S5.55 17 2.75 12Z'), circle(12, 12, 2.75), circle(12, 12, 0.55));
    case 'eye-off': return glyph(path('M3.5 9.25C6.2 5.9 9 4.75 12 4.75c3.25 0 6.45 2.25 9.25 7.25a20 20 0 0 1-2.25 3.25M6 17a8.5 8.5 0 0 0 6 2.25c1.2 0 2.4-.3 3.6-.9'), line(3.25, 3.25, 20.75, 20.75));
    case 'link': return glyph(path('M9.75 14.25 7.5 16.5a3 3 0 0 1-4.25-4.25l2.5-2.5A3 3 0 0 1 10 9.5M14.25 9.75l2.25-2.25a3 3 0 0 1 4.25 4.25l-2.5 2.5A3 3 0 0 1 14 14.5M8.75 15.25l6.5-6.5'));
    case 'link-2': return glyph(path('M8 8.5H6a4 4 0 0 0 0 8h3M16 8.5h2a4 4 0 0 1 0 8h-3M8.5 12.5h7'));
    case 'external-link': return glyph(path('M11 5H4v15h15v-7'), path('M13 3.5h7.5V11M20.5 3.5 10 14'));
    case 'download': return glyph(line(12, 3.25, 12, 15.5), polyline('6.75,11 12,16.25 17.25,11'), path('M3.25 18v2.75h17.5V18'));
    case 'upload': return glyph(line(12, 20.75, 12, 8.5), polyline('6.75,13 12,7.75 17.25,13'), path('M3.25 6V3.25h17.5V6'));
    case 'refresh-cw': return glyph(path('M20.25 8.5A8.75 8.75 0 1 0 20 16M20.25 3.75V8.5H15.5'), circle(20, 16, 0.55));
    case 'rotate-cw': return glyph(path('M19.5 7.5A8.25 8.25 0 1 0 20 15M19.5 3v4.5H15'), circle(20, 15, 0.55));
    case 'rotate-ccw': return glyph(path('M4.5 7.5A8.25 8.25 0 1 1 4 15M4.5 3v4.5H9'), circle(4, 15, 0.55));
    case 'repeat': return glyph(path('M5 7h11.5l-2.5-2.5M19 17H7.5l2.5 2.5M19 17v-5M5 7v5'));
    case 'repeat-2': return glyph(path('M5 7h11.5l-2.5-2.5M19 17H7.5l2.5 2.5M19 17v-5M5 7v5'), circle(12, 12, 1.25));
    case 'shuffle': return glyph(path('M3.25 6h2.5c5 0 7 12 12 12h3M17.5 15l3 3-3 3M3.25 18h2.5c2.2 0 3.8-2.3 5.4-4.9M14.5 6h6M17.5 3l3 3-3 3'));
    case 'history': return glyph(path('M4.25 7.5A9 9 0 1 1 3.5 15M4.25 3v4.5H8.5'), path('M12 7v5l3.5 2'));
    case 'filter': return glyph(path('M3 4h18l-7 8v6l-4 2v-8z'), circle(12, 4, 0.55));
    case 'settings': return glyph(circle(12, 12, 3), path('M12 2.75v3M12 18.25v3M2.75 12h3M18.25 12h3M5.45 5.45l2.1 2.1M16.45 16.45l2.1 2.1M18.55 5.45l-2.1 2.1M7.55 16.45l-2.1 2.1'));
    case 'settings-2': return glyph(line(4, 6, 20, 6), line(4, 12, 20, 12), line(4, 18, 20, 18), circle(8, 6, 1.75), circle(16, 12, 1.75), circle(10, 18, 1.75));
    case 'sliders-horizontal': return glyph(line(3, 6, 21, 6), line(3, 12, 21, 12), line(3, 18, 21, 18), circle(7, 6, 1.5), circle(15, 12, 1.5), circle(10, 18, 1.5));
    case 'cloud': return glyph(path('M6.5 19h11a4 4 0 0 0 .5-7.95A6 6 0 0 0 6.55 9.5 4.75 4.75 0 0 0 6.5 19Z'), circle(6.55, 9.5, 0.5));
    case 'globe': return glyph(circle(12, 12, 9.25), ellipse(12, 12, 4, 9.25), line(3, 12, 21, 12), path('M5.25 7.5h13.5M5.25 16.5h13.5'));
    case 'sun': return glyph(circle(12, 12, 3.5), path('M12 2.75v3M12 18.25v3M2.75 12h3M18.25 12h3M5.45 5.45l2.1 2.1M16.45 16.45l2.1 2.1M18.55 5.45l-2.1 2.1M7.55 16.45l-2.1 2.1'));
    case 'moon': return glyph(path('M19.75 15.5A8.75 8.75 0 0 1 8.5 4.25 8.75 8.75 0 1 0 19.75 15.5Z'), circle(17.5, 6.5, 0.55));
    case 'target': return glyph(circle(12, 12, 9.25), circle(12, 12, 5.25), circle(12, 12, 1.25));
    case 'crosshair': return glyph(circle(12, 12, 7.25), line(12, 2.75, 12, 7), line(12, 17, 12, 21.25), line(2.75, 12, 7, 12), line(17, 12, 21.25, 12), circle(12, 12, 0.75));
    case 'compass': return glyph(circle(12, 12, 9.25), polygon('15.75,8.25 13.75,13.75 8.25,15.75 10.25,10.25'), circle(12, 12, 0.55));
    case 'save': return glyph(path('M4 3.25h13l3 3v14.5H4z'), rect(7, 3.25, 8, 5, 1), rect(7.5, 13, 9, 7.75, 1.5));
    case 'copy': return glyph(rect(7.25, 6.25, 13.5, 14.5, 2.25), path('M16.75 6.25v-3h-13.5v14.5h4'));
    case 'trash-2': return glyph(path('M5.5 7.25h13l-1 13.5h-11z'), line(3.25, 7.25, 20.75, 7.25), path('M9 7.25v-4h6v4M9.5 11v6M14.5 11v6'));
    case 'package': return glyph(polygon('12,2.75 20.5,7.5 20.5,16.5 12,21.25 3.5,16.5 3.5,7.5'), polyline('3.5,7.5 12,12.25 20.5,7.5'), line(12, 12.25, 12, 21.25), line(7.75, 5.1, 16.25, 9.85));
    case 'cube': return glyph(polygon('12,2.75 20.25,7.5 20.25,16.5 12,21.25 3.75,16.5 3.75,7.5'), polyline('3.75,7.5 12,12.25 20.25,7.5'), line(12, 12.25, 12, 21.25));
    case 'layers': return glyph(polygon('12,3 21,8 12,13 3,8'), polyline('3,12 12,17 21,12'), polyline('3,16 12,21 21,16'));
    case 'boxes': return glyph(rect(3.25, 3.25, 7.25, 7.25, 1.5), rect(13.5, 3.25, 7.25, 7.25, 1.5), rect(8.4, 13.5, 7.25, 7.25, 1.5), path('M10.5 7h3M12 10.5v3'));
    case 'brain': return glyph(path('M12 5.5a4.25 4.25 0 0 0-8 2 3.75 3.75 0 0 0 .25 7A4.25 4.25 0 0 0 12 18.5M12 5.5a4.25 4.25 0 0 1 8 2 3.75 3.75 0 0 1-.25 7A4.25 4.25 0 0 1 12 18.5M12 5.5v13M8 8.5l4 2.5M16 8.5 12 11M8 15.5l4-2.5M16 15.5 12 13'));
    case 'bot': return glyph(rect(4, 6.5, 16, 12.5, 3), circle(9, 12, 1), circle(15, 12, 1), line(9, 16, 15, 16), line(12, 3, 12, 6.5), circle(12, 3, 0.75));
    case 'rocket': return glyph(path('M8 16c-2.5-4 0-9 7.5-13.25 3.25 7 1.5 12-2.5 14.5z'), path('M8 16 4 17l-1 4 4-1 1-4M13 17.25l1 3.75 3-3.75'), circle(13.5, 8.5, 1.5));
    case 'leaf': return glyph(path('M20.75 3.25C10 3.25 4.5 7.5 4.5 14a6.5 6.5 0 0 0 6.5 6.5c6.5 0 9.75-6.5 9.75-17.25Z'), path('M4.5 20.5c3.5-6 7.5-9.5 13.25-13'));
    case 'lightbulb': return glyph(path('M7.25 14.5a6.25 6.25 0 1 1 9.5 0L15 17H9z'), line(9.5, 20.5, 14.5, 20.5), line(9, 17, 15, 17));
    case 'wrench': return glyph(path('M14.5 5.5a5 5 0 0 0-6.25 6.25L3 17l4 4 5.25-5.25A5 5 0 0 0 18.5 9.5l-3-3-3 3-2-2 3-3z'));
    case 'gavel': return glyph(path('m9 4 7 7M6.5 6.5l5-5 3 3-5 5zM13.5 13.5l5-5 3 3-5 5zM3 20.5h12M8 16l-3 3'));
    case 'crown': return glyph(path('M3 7.5 7.5 12 12 4l4.5 8L21 7.5l-2 11H5z'), line(6, 15.5, 18, 15.5));
    case 'droplet': return glyph(path('M12 2.75c5.25 6 7.25 9.25 7.25 12A7.25 7.25 0 1 1 4.75 15C4.75 12 7 8.75 12 2.75Z'), path('M8 15a4 4 0 0 0 4 4'));
    case 'hourglass': return glyph(path('M6 3.25h12M6 20.75h12M7 3.25c0 4 1.5 6.25 5 8.75-3.5 2.5-5 4.75-5 8.75M17 3.25c0 4-1.5 6.25-5 8.75 3.5 2.5 5 4.75 5 8.75'));
    case 'fingerprint': return glyph(path('M6.25 19.5c-1.5-2-2.25-4.5-2.25-7a8 8 0 0 1 16 0M9 20.75c-1.5-2.25-2-5-2-8.25a5 5 0 0 1 10 0c0 3.5-.75 6-2.25 8M12 20.75c-1.25-2.5-2-5-2-8.25a2 2 0 0 1 4 0c0 2.25-.25 4.25-.75 5.75'));
    case 'bug': return glyph(rect(6.25, 6, 11.5, 13, 5), line(9, 6, 7.5, 3.25), line(15, 6, 16.5, 3.25), line(3, 9, 6.25, 9), line(17.75, 9, 21, 9), line(3, 15, 6.25, 15), line(17.75, 15, 21, 15), line(12, 6, 12, 19));
    case 'palette': return glyph(path('M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4.5A4.5 4.5 0 0 0 21 8.5C21 5.5 17 3 12 3Z'), circle(7.5, 9, 0.75), circle(10.5, 6.5, 0.75), circle(15, 7, 0.75));
    case 'brush': return glyph(path('M15 3.25 20.75 9l-9.5 9.5-5.75-5.75z'), path('M5.5 12.75c-3 2-2.5 5.25-2.5 7.5 2.25 0 5.5.5 7.5-2.5'), circle(15, 9, 0.65));
    case 'pencil': return glyph(path('m4 16 1-4 10-9.25 6.25 6.25L11 19l-4 1z'), line(14.5, 4.25, 19.75, 9.5));
    case 'eraser': return glyph(path('m4 14 9.5-9.5 6 6-9.5 9.5H5z'), line(11, 20, 20.5, 20), line(8.5, 9.5, 14.5, 15.5));
    case 'terminal': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.75), polyline('7.25,8.25 10.75,12 7.25,15.75'), line(13, 16, 17.5, 16));
    case 'braces': return glyph(path('M9 3.25H7a2 2 0 0 0-2 2v4.5L2.75 12 5 14.25v4.5a2 2 0 0 0 2 2h2M15 3.25h2a2 2 0 0 1 2 2v4.5L21.25 12 19 14.25v4.5a2 2 0 0 1-2 2h-2'));
    case 'brackets': return glyph(path('M9 3.25H4.25v17.5H9M15 3.25h4.75v17.5H15'));
    case 'code': return glyph(polyline('9,5 2.75,12 9,19'), polyline('15,5 21.25,12 15,19'), line(13.5, 3.25, 10.5, 20.75));
    case 'credit-card': return glyph(rect(2.75, 5, 18.5, 14, 2.5), line(2.75, 9.25, 21.25, 9.25), line(6, 15.5, 11, 15.5), circle(18, 15.5, 0.75));
    case 'wallet': return glyph(path('M3.25 6h15.5v13H3.25zM5 6V3.25h13.75'), path('M14 10h7v5h-7z'), circle(17, 12.5, 0.55));
    case 'coins': return glyph(ellipse(9.5, 6, 6, 2.5), path('M3.5 6v5c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6M8.5 16c.8 1.25 3 2 5.5 2 3.3 0 6-1.1 6-2.5v-5c0-1.1-1.75-2-4.5-2.35'));
    case 'shopping-cart': return glyph(path('M2.75 4h2l2.25 11h10.5l3-7.5H6'), circle(9, 19, 1.25), circle(17, 19, 1.25));
    case 'shopping-basket': return glyph(path('M3 9h18l-2 10H5z'), path('m8 9 4-6 4 6'), line(8, 13, 8, 16), line(12, 13, 12, 16), line(16, 13, 16, 16));
    case 'calculator': return glyph(rect(4.25, 2.75, 15.5, 18.5, 2.5), rect(7, 5, 10, 4, 1), circle(8, 13, 0.75), circle(12, 13, 0.75), circle(16, 13, 0.75), circle(8, 17, 0.75), circle(12, 17, 0.75), circle(16, 17, 0.75));
    case 'building-2': return glyph(path('M4 21V5l8-2v18M12 8h8v13M7.5 7.5v2M7.5 12.5v2M7.5 17.5v2M15.5 11v2M15.5 16v2M2.75 21h18.5'));
    case 'warehouse': return glyph(path('M2.75 10 12 3l9.25 7v11H2.75z'), rect(7, 13, 10, 8, 1), line(7, 16, 17, 16), line(7, 19, 17, 19));
    case 'scale': return glyph(path('M12 3v18M6 6h12M4 6 1.75 12h4.5zM20 6l-2.25 6h4.5zM7 21h10'), circle(12, 3, 0.55));
    case 'ticket': return glyph(path('M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z'), line(12, 7, 12, 17));
    case 'quote': return glyph(path('M4 7h6v6H6a4 4 0 0 1-2 3M14 7h6v6h-4a4 4 0 0 1-2 3'));
    case 'type': return glyph(path('M4 5V3.25h16V5M12 3.25v17.5M8 20.75h8'));
    case 'hash': return glyph(path('M9 3 7 21M17 3l-2 18M4 9h16M3 15h16'));
    case 'paperclip': return glyph(path('m8.5 12.5 6-6a3.25 3.25 0 0 1 4.6 4.6l-8.5 8.5a5 5 0 0 1-7.1-7.1l8-8'));
    case 'mouse-pointer-2': return glyph(polygon('4,2.75 19,13 12.25,14.25 9,21.25'), line(13, 14, 17.5, 19));
    case 'flag': return glyph(path('M5 21.25V3.25M5 4h13l-2.5 4L18 12H5'), circle(5, 3.25, 0.55));
    case 'life-buoy': return glyph(circle(12, 12, 9.25), circle(12, 12, 3.5), path('M5.5 5.5 9.5 9.5M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4'));
    case 'megaphone': return glyph(path('M3.25 10h4l11-5v14l-11-5h-4z'), path('M7.25 14 9 20h4l-2-4.25'), line(21, 9, 21, 15));
    case 'radio': return glyph(rect(3, 6, 18, 14.5, 2.5), circle(14.75, 13.25, 3.25), line(6.5, 10, 9.5, 10), line(6.5, 14, 9, 14), path('M5 6 17 2.75'));
    case 'rss': return glyph(path('M4 11a9 9 0 0 1 9 9M4 5a15 15 0 0 1 15 15'), circle(4.5, 19.5, 1));
    case 'microphone': return glyph(rect(8, 3, 8, 13, 4), path('M4.75 12a7.25 7.25 0 0 0 14.5 0M12 19.25v2M8.5 21.25h7'));
    case 'mic': return glyph(path('M12 3.25a3.75 3.75 0 0 0-3.75 3.75v5a3.75 3.75 0 0 0 7.5 0V7A3.75 3.75 0 0 0 12 3.25ZM5 12.5a7 7 0 0 0 14 0M12 19.5v2'));
    case 'volume-2': return glyph(path('M3 10h4l5-4v12l-5-4H3z'), path('M15 9a4.25 4.25 0 0 1 0 6M17.5 6.5a7.75 7.75 0 0 1 0 11'));
    case 'film': return glyph(rect(3, 4, 18, 16, 2), line(7, 4, 7, 20), line(17, 4, 17, 20), line(3, 8, 7, 8), line(17, 8, 21, 8), line(3, 16, 7, 16), line(17, 16, 21, 16));
    case 'image': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.75), circle(8.25, 8.25, 1.5), polyline('4.5,18 9.5,12.5 13,16 15.5,13.5 20,18'));
    case 'newspaper': return glyph(path('M4 3.25h14v17.5H4zM18 7h2.75v13.75H18'), rect(7, 6, 4, 4, 1), line(13.5, 6.5, 16, 6.5), line(13.5, 9.5, 16, 9.5), line(7, 13.5, 16, 13.5), line(7, 17, 16, 17));
    case 'book-open': return glyph(path('M3.25 4.5h5.5A3.25 3.25 0 0 1 12 7.75v13a3.25 3.25 0 0 0-3.25-3.25h-5.5zM20.75 4.5h-5.5A3.25 3.25 0 0 0 12 7.75v13a3.25 3.25 0 0 1 3.25-3.25h5.5z'));
    case 'journal': return glyph(path('M5 3.25h14v17.5H5z'), line(8, 3.25, 8, 20.75), line(11, 8, 16, 8), line(11, 12, 16, 12));
    case 'inbox': return glyph(path('M3.25 4.5h17.5v15H3.25z'), path('M3.25 14h5l1.75 2.5h4L15.75 14h5'));
    case 'inbox-empty': return glyph(path('M3.25 4.5h17.5v15H3.25z'), line(8, 12, 16, 12), circle(12, 16, 0.6));
    case 'archive': return glyph(rect(3.25, 6.5, 17.5, 13.75, 2), rect(2.75, 3.25, 18.5, 4.25, 1.5), line(9, 11.5, 15, 11.5));
    case 'clipboard-list': return glyph(path('M6 4.5H4v16.25h16V4.5h-2'), rect(8, 2.75, 8, 4, 1.5), line(8, 11, 16, 11), line(8, 15, 16, 15), circle(6, 11, 0.5), circle(6, 15, 0.5));
    case 'toggle-left': return glyph(rect(2.75, 7, 18.5, 10, 5), circle(8, 12, 3.25));
    case 'toggle-right': return glyph(rect(2.75, 7, 18.5, 10, 5), circle(16, 12, 3.25));
    case 'plug': return glyph(path('M8 3.25v5M16 3.25v5M5.5 8.25h13v3.5a6.5 6.5 0 0 1-13 0zM12 18.25v3'));
    case 'unplug': return glyph(path('M8 3.25v5M16 3.25v5M5.5 8.25h13v3.5a6.5 6.5 0 0 1-2 4.75M12 18.25v3'), line(3.25, 3.25, 20.75, 20.75));
    case 'send': return glyph(polygon('2.75,4 21.25,12 2.75,20 6,12'), line(6, 12, 15.5, 12));
    case 'paper-plane': return glyph(polygon('2.75,4 21.25,12 2.75,20 6.5,12'), polyline('6.5,12 11,15.5 11,18'));
    case 'scan': return glyph(path('M3.25 8V3.25H8M16 3.25h4.75V8M20.75 16v4.75H16M8 20.75H3.25V16'), line(6.5, 12, 17.5, 12), circle(12, 12, 1));
    case 'siren': return glyph(path('M6 17V10a6 6 0 0 1 12 0v7M3 20.75h18M12 4V2.75M4.75 6.25 3.5 5M19.25 6.25 20.5 5'), line(9, 11, 15, 11));
    case 'archive-restore': return glyph(rect(3.25, 6.5, 17.5, 13.75, 2), rect(2.75, 3.25, 18.5, 4.25, 1.5), line(8.5, 11, 15.5, 11), path('M16.75 17.75a4 4 0 1 1-1-5.5'), polyline('12.5,12.25 15.75,11.75 15.25,15'));
    case 'automation-key': return glyph(circle(7.25, 12, 3.5), circle(7.25, 12, 1), path('M10.75 12h10M16.25 12V8.25h3M16.25 12v3.75h3'), circle(19.75, 8.25, 0.6), circle(19.75, 15.75, 0.6));
    case 'boxes-model': return glyph(polygon('12,2.75 17,5.5 12,8.25 7,5.5'), polygon('6.75,12 11.75,14.75 6.75,17.5 1.75,14.75'), polygon('17.25,12 22.25,14.75 17.25,17.5 12.25,14.75'), path('M12 8.25v3M8.75 13.1 12 11.25l3.25 1.85M6.75 17.5v2M17.25 17.5v2'));
    case 'brush-stroke': return glyph(path('M15.25 3.25 20.75 8.75 12 17.5 6.5 12z'), path('M6.5 12c-3 1.75-3.5 4.75-3.25 8.75 4 .25 7-.25 8.75-3.25'), path('M3.75 18.25c3 .75 5.5 0 7-2.25'));
    case 'carousel': return glyph(rect(6, 3.25, 12, 17.5, 2.5), path('M3.25 7.25H2.5v9.5h.75M20.75 7.25h.75v9.5h-.75'), circle(9.5, 17.25, 0.55), circle(12, 17.25, 0.55), circle(14.5, 17.25, 0.55), polyline('10,8.25 13.75,12 10,15.75'));
    case 'developer-settings': return glyph(rect(3.25, 3.25, 17.5, 15.5, 2.5), line(3.25, 8, 20.75, 8), polyline('7,11 9.5,13.25 7,15.5'), line(12, 15.5, 15, 15.5), circle(18.25, 18.25, 2.5), path('M18.25 14.75v1M18.25 20.75v1M14.75 18.25h1M20.75 18.25h1'));
    case 'device-link': return glyph(rect(2.75, 4, 11, 13.5, 2.25), rect(16, 7, 5.25, 11.5, 1.5), line(6, 20.5, 10.5, 20.5), path('M12 10.25h5M14.75 8l2.25 2.25-2.25 2.25'), circle(18.6, 15.75, 0.5));
    case 'download-video': return glyph(rect(3, 3.25, 18, 12.5, 2.5), polygon('9.25,7 14.75,9.5 9.25,12'), line(12, 13, 12, 21), polyline('8.5,17.5 12,21 15.5,17.5'));
    case 'extension': return glyph(path('M4.5 4.5h5.75a2 2 0 1 0 3.5 0h5.75v5.75a2 2 0 1 1 0 3.5v5.75h-5.75a2 2 0 1 0-3.5 0H4.5v-5.75a2 2 0 1 1 0-3.5z'));
    case 'files': return glyph(path('M7 2.75h8l4 4v12H7zM15 2.75v4h4'), path('M7 6H4v15.25h12v-2.5'), line(10, 11.5, 16, 11.5), line(10, 15, 15, 15));
    case 'filter-capabilities': return glyph(path('M2.75 4h11l-4.25 5v5.5l-3 1.5V9z'), line(14, 8, 21, 8), line(13, 13, 21, 13), line(14, 18, 21, 18), circle(17, 8, 1.25), circle(18, 13, 1.25), circle(16, 18, 1.25));
    case 'folders': return glyph(path('M5.25 5.25h5l2-2h8.5v12.5h-2.5'), path('M2.75 8.25h6l2-2h10.5v14H2.75z'), line(2.75, 11, 21.25, 11));
    case 'hand-check': return glyph(path('M5 12.5V8.75a1.5 1.5 0 0 1 3 0v2-4a1.5 1.5 0 0 1 3 0v4-5.25a1.5 1.5 0 0 1 3 0v5.25-4a1.5 1.5 0 0 1 3 0V14l2-2a1.75 1.75 0 0 1 2.5 2.45l-4.75 5.8H9.5A4.5 4.5 0 0 1 5 15.75Z'), polyline('13.25,15.5 15,17.25 18.5,13.75'));
    case 'heart-pulse': return glyph(path('M12 20.5C4 16.4 2.75 10 6.4 6.75A4.8 4.8 0 0 1 12 7.5a4.8 4.8 0 0 1 5.6-.75C21.25 10 20 16.4 12 20.5Z'), polyline('3.5,13 8,13 9.5,9.5 12,16.5 14,11.5 15.25,13 20.5,13'));
    case 'human-lock': return glyph(circle(9.25, 7.25, 3), path('M3.5 19.75a5.75 5.75 0 0 1 11.5 0'), path('M15.5 15.25v-1a2.5 2.5 0 0 1 5 0v1'), rect(14.5, 15.25, 7, 5.75, 1.5), circle(18, 18, 0.65));
    case 'install': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(12, 5.5, 12, 14.5), polyline('8.5,11 12,14.5 15.5,11'), path('M7 18h10'));
    case 'languages': return glyph(path('M3.25 19.75 8.5 4.25l5.25 15.5M5.25 14h7'), circle(17.25, 10, 4), path('M14.25 10h6M17.25 6a10 10 0 0 1 0 8M15 16.75l4.5 4'));
    case 'library-books': return glyph(rect(3.25, 4, 4.5, 16.75, 1), rect(9.75, 3, 4.5, 17.75, 1), path('m16.25 4 4-1 2.5 16.75-4 1z'), line(4.75, 8, 6.25, 8), line(11.25, 7, 12.75, 7), line(17.5, 8, 20, 7.5));
    case 'line-width': return glyph(line(4, 5, 20, 5), line(4, 9.5, 17.5, 9.5), line(4, 14, 14.5, 14), line(4, 18.5, 11, 18.5), circle(20, 5, 0.55), circle(17.5, 9.5, 0.55));
    case 'log-in': return glyph(path('M13 3.25h7.75v17.5H13'), line(3.25, 12, 15.5, 12), polyline('10.75,7.25 15.5,12 10.75,16.75'));
    case 'log-out': return glyph(path('M11 3.25H3.25v17.5H11'), line(8.5, 12, 20.75, 12), polyline('16,7.25 20.75,12 16,16.75'));
    case 'log-out-all': return glyph(path('M8.5 3.25H3.25v17.5H8.5'), line(8, 9, 20.75, 9), polyline('16.75,5.25 20.75,9 16.75,12.75'), line(8, 16, 18, 16), polyline('14,12.5 18,16 14,19.5'));
    case 'messages-square': return glyph(path('M3.25 5.25h14.5v10.5H9l-4.5 3 .75-3.25a2 2 0 0 1-2-2Z'), path('M7 2.75h13.75v10.5l-3 2'), circle(8, 10.25, 0.55), circle(12, 10.25, 0.55));
    case 'newsletter': return glyph(path('M3.25 5.25h17.5v13.5H3.25z'), polyline('3.75,6 12,12.25 20.25,6'), line(7, 15.25, 12, 15.25), line(14, 15.25, 17, 15.25));
    case 'package-download': return glyph(polygon('12,2.75 19.5,7 19.5,14.5 12,18.75 4.5,14.5 4.5,7'), polyline('4.5,7 12,11.25 19.5,7'), line(12, 11.25, 12, 21.25), polyline('8.75,18 12,21.25 15.25,18'));
    case 'pipette': return glyph(path('m14.25 3.25 6.5 6.5-2.5 2.5-1.5-1.5-7.5 7.5-4.5 1 1-4.5 7.5-7.5-1.5-1.5z'), line(12.75, 4.75, 19.25, 11.25), circle(4.25, 20.25, 0.55));
    case 'plugin': return glyph(path('M7 3.25v5M13 3.25v5M4.5 8.25h11v3a5.5 5.5 0 0 1-5.5 5.5v4'), rect(15.5, 13, 5.25, 5.25, 1.25), line(18.1, 10.75, 18.1, 13), line(13.25, 15.6, 15.5, 15.6));
    case 'publish': return glyph(line(12, 20.75, 12, 6), polyline('7.25,10.75 12,6 16.75,10.75'), path('M5.25 16.75a7.25 7.25 0 0 1 13.5 0M2.75 14a10 10 0 0 1 18.5 0'), circle(12, 20.75, 0.55));
    case 'send-request': return glyph(polygon('2.75,4 21.25,12 2.75,20 6,12'), line(6, 12, 13, 12), circle(17.25, 17.25, 3.25), path('M15.75 16.25a1.5 1.5 0 1 1 2 1.4c-.4.2-.5.45-.5.8'), circle(17.25, 19.5, 0.35));
    case 'share-nodes': return glyph(line(8.25, 10.25, 16.25, 6.5), line(8.25, 13.75, 16.25, 17.5), circle(5.5, 12, 2.75), circle(18.5, 5.5, 2.75), circle(18.5, 18.5, 2.75));
    case 'square-terminal': return glyph(rect(3.25, 3.25, 17.5, 17.5, 3), line(3.25, 8, 20.75, 8), polyline('7,11 9.75,13.5 7,16'), line(12.5, 16, 17, 16));
    case 'sticker': return glyph(path('M5.25 3.25h13.5a2 2 0 0 1 2 2v9l-6.5 6.5h-9a2 2 0 0 1-2-2V5.25a2 2 0 0 1 2-2Z'), path('M14.25 20.75v-4.5a2 2 0 0 1 2-2h4.5'), circle(8.25, 9, 0.6), circle(13, 9, 0.6), path('M8 13a4.5 4.5 0 0 0 5.5 0'));
    case 'story': return glyph(rect(4.25, 2.75, 15.5, 18.5, 3), line(7.25, 6, 16.75, 6), rect(7.25, 9, 9.5, 6.5, 1.5), circle(9, 18.25, 0.55), line(11.5, 18.25, 15.5, 18.25));
    case 'target-choice': return glyph(circle(9, 12, 6.25), circle(9, 12, 2.25), path('M15.25 12h2.5v-3M17.75 12v3.5h3.5'), polyline('18.75,7.5 17.75,8.5 16.75,7.5'), polyline('19.75,14.5 21.25,15.5 19.75,16.5'));
    case 'token-input': return glyph(polygon('9,3.25 15,3.25 19,8 15,12.75 9,12.75 5,8'), line(12, 12.75, 12, 21), polyline('8.75,17.75 12,21 15.25,17.75'), circle(12, 8, 1));
    case 'token-output': return glyph(polygon('9,11.25 15,11.25 19,16 15,20.75 9,20.75 5,16'), line(12, 3, 12, 11.25), polyline('8.75,6.25 12,3 15.25,6.25'), circle(12, 16, 1));
    case 'unlink': return glyph(path('M8.75 15.25 7 17a3 3 0 0 1-4.25-4.25l2.5-2.5A3 3 0 0 1 9.5 10M15.25 8.75 17 7a3 3 0 0 1 4.25 4.25l-2.5 2.5A3 3 0 0 1 14.5 14M4 4l16 16'), line(10.5, 13.5, 13.5, 10.5));
    case 'upload-cloud': return glyph(path('M6.5 18.5h11a4 4 0 0 0 .5-7.95A6 6 0 0 0 6.55 9a4.75 4.75 0 0 0-.05 9.5Z'), line(12, 20.75, 12, 11.5), polyline('8.75,14.75 12,11.5 15.25,14.75'));
    case 'wand-sparkles': return glyph(path('M3.25 18.25 15.75 5.75l2.5 2.5L5.75 20.75z'), line(13.75, 7.75, 16.25, 10.25), path('M7 3v4M5 5h4M19 14v5M16.5 16.5h5'), circle(20, 4, 0.65));
    case 'workspace': return glyph(rect(2.75, 3.25, 18.5, 17.5, 2.5), line(2.75, 8, 21.25, 8), line(8.25, 8, 8.25, 20.75), rect(11, 11, 7, 6, 1.25), circle(5.5, 5.6, 0.5));
    case 'wrench-zap': return glyph(path('M13.5 5.25A5 5 0 0 0 7.5 11.5L3 16l5 5 4.5-4.5a5 5 0 0 0 6.25-6l-3-3-3 3-2-2 3-3Z'), polygon('17.5,13 14.5,18 17.5,18 16,22 21,16.25h-3z'));
    case 'zap': return glyph(polygon('13.5,2.75 5.25,13.25 11.25,13.25 10.5,21.25 18.75,10.25 12.75,10.25'), circle(5.25, 13.25, 0.55));
    case 'calendar-clock': return glyph(...calendarFrame(), circle(14.5, 14.5, 3.75), path('M14.5 12.25v2.5l1.75 1'));
    case 'image-up': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.75), circle(8.25, 8.25, 1.5), polyline('4.5,18 9.5,12.5 12.25,15.25'), line(16.5, 18, 16.5, 10.5), polyline('13.5,13.5 16.5,10.5 19.5,13.5'));
    case 'tickets': return glyph(path('M5.5 5.25h15v3a2 2 0 0 0 0 4v3h-15v-3a2 2 0 0 0 0-4z'), path('M5.5 8.25H3.25v3a2 2 0 0 1 0 4v3h15v-3'), line(13.5, 5.25, 13.5, 15.25));
    case 'monitor-home': return glyph(rect(3.25, 3.25, 17.5, 13.5, 2.25), path('M8 12 12 8.5l4 3.5v3H8z'), line(12, 16.75, 12, 20.5), line(8.5, 20.5, 15.5, 20.5));
    case 'monitor-smartphone': return glyph(rect(2.75, 3.25, 13.5, 12, 2.25), rect(16.5, 7, 4.75, 11.5, 1.5), line(6.5, 18.5, 11.5, 18.5), line(9, 15.25, 9, 18.5), circle(18.9, 15.75, 0.45));
    case 'laptop-bridge': return glyph(rect(4.25, 3.25, 15.5, 10.5, 2), path('M2.75 16.25h18.5l-1 2.25H3.75z'), circle(7.5, 8.5, 1), circle(16.5, 8.5, 1), path('M8.5 8.5h2a1.5 1.5 0 0 1 3 0h2'));
    case 'server-api': return glyph(rect(3.25, 3.5, 17.5, 7, 1.75), rect(3.25, 13.5, 17.5, 7, 1.75), circle(6.5, 7, 0.6), circle(6.5, 17, 0.6), polyline('11.5,5.5 9.75,7 11.5,8.5'), polyline('16,5.5 17.75,7 16,8.5'), line(12.75, 15.75, 17.5, 15.75), line(12.75, 18.25, 16, 18.25));
    case 'server-environment': return glyph(rect(3.25, 3.5, 17.5, 7, 1.75), rect(3.25, 13.5, 17.5, 7, 1.75), circle(6.5, 7, 0.6), circle(6.5, 17, 0.6), path('M11 5.5h6M11 8.5h3M11 15.5h3M11 18.5h6'), circle(18, 17, 1));
    case 'plug-cloud': return glyph(path('M7.5 3.25v4M13.5 3.25v4M5.25 7.25h10.5v2.5a5.25 5.25 0 0 1-5.25 5.25v5.75'), path('M15.5 19.5h3.25a2.5 2.5 0 0 0 .3-4.98A3.75 3.75 0 0 0 12 15.75'));
    case 'repeat-fallback': return glyph(path('M5 7h11.5l-2.5-2.5M19 17H9M19 17v-5M5 7v5'), path('M9 17H6a3 3 0 0 1-3-3v-1.5'), polyline('6.5,10 3,13 6.5,16'));
    case 'repeat-interval': return glyph(path('M5 7h11.5l-2.5-2.5M19 17H7.5l2.5 2.5M19 17v-5M5 7v5'), circle(12, 12, 2.75), path('M12 10.25v2l1.25.75'));
    case 'apps-grid': return glyph(rect(3.25, 3.25, 4.5, 4.5, 1), rect(9.75, 3.25, 4.5, 4.5, 1), rect(16.25, 3.25, 4.5, 4.5, 1), rect(3.25, 9.75, 4.5, 4.5, 1), rect(9.75, 9.75, 4.5, 4.5, 1), rect(16.25, 9.75, 4.5, 4.5, 1), rect(3.25, 16.25, 4.5, 4.5, 1), rect(9.75, 16.25, 4.5, 4.5, 1), rect(16.25, 16.25, 4.5, 4.5, 1));
    case 'layout-dashboard': return glyph(rect(3.25, 3.25, 10, 17.5, 2.25), rect(15.25, 3.25, 5.5, 7.5, 1.5), rect(15.25, 12.75, 5.5, 8, 1.5));
    case 'layout-grid': return glyph(rect(3.25, 3.25, 7.5, 7.5, 1.75), rect(13.25, 3.25, 7.5, 7.5, 1.75), rect(3.25, 13.25, 7.5, 7.5, 1.75), rect(13.25, 13.25, 7.5, 7.5, 1.75));
    case 'layout-kanban': return glyph(rect(3.25, 3.25, 5, 17.5, 1.5), rect(9.5, 3.25, 5, 11, 1.5), rect(15.75, 3.25, 5, 14.5, 1.5));
    case 'panel-left': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(9, 3.25, 9, 20.75), circle(6.25, 7, 0.55));
    case 'panel-right': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(15, 3.25, 15, 20.75), circle(17.75, 7, 0.55));
    case 'panels-top-left': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(3.25, 9, 20.75, 9), line(9, 9, 9, 20.75), circle(6.25, 6.25, 0.55));
    case 'chart-column': return glyph(path('M3.25 3.25v17.5h17.5'), rect(6, 13, 3, 5.75, 0.75), rect(11, 8.5, 3, 10.25, 0.75), rect(16, 5, 3, 13.75, 0.75));
    case 'chart-line': return glyph(path('M3.25 3.25v17.5h17.5'), polyline('6,16 10,11 13,14 19,7'), circle(10, 11, 0.6), circle(13, 14, 0.6), circle(19, 7, 0.6));
    case 'chart-pie': return glyph(path('M11 3a9 9 0 1 0 9 9h-9z'), path('M14 3.5a7 7 0 0 1 6.5 6.5H14z'), line(11, 12, 17.25, 18.25));
    case 'heart-chart-up': return glyph(path('M12 20.5C4 16.4 2.75 10 6.4 6.75A4.8 4.8 0 0 1 12 7.5a4.8 4.8 0 0 1 5.6-.75C21.25 10 20 16.4 12 20.5Z'), polyline('7.25,15 10.25,12 12.5,14 16.75,9.75'), polyline('14,9.75 16.75,9.75 16.75,12.5'));
    case 'trend-up': return glyph(polyline('3.25,17.75 8.5,12.5 12.25,15.25 20.75,6.75'), polyline('15.25,6.75 20.75,6.75 20.75,12.25'), circle(8.5, 12.5, 0.6));
    case 'cpu-chip': return glyph(rect(4.75, 4.75, 14.5, 14.5, 3), path('M8.5 8.5h7v7h-7zM12 8.5v7M8.5 12h7'), path('M8 2.75v2M12 2.75v2M16 2.75v2M8 19.25v2M12 19.25v2M16 19.25v2M2.75 8h2M2.75 12h2M2.75 16h2M19.25 8h2M19.25 12h2M19.25 16h2'));
    case 'memory-stick': return glyph(rect(2.75, 7, 18.5, 10, 2), rect(6, 9.5, 3, 5, 0.75), rect(10.5, 9.5, 3, 5, 0.75), rect(15, 9.5, 3, 5, 0.75), path('M5 17v3M9 17v3M13 17v3M17 17v3M3.25 4h17.5'));
    case 'id-badge': return glyph(path('M9 3.25V2.5h6v.75'), rect(4.25, 3.25, 15.5, 17.5, 2.5), circle(9, 10, 2.25), path('M5.75 16a3.25 3.25 0 0 1 6.5 0M14.5 8h2.25M14.5 11h2.25M14.5 14h2.25'));
    case 'vault': return glyph(rect(2.75, 3.25, 18.5, 17.5, 2.5), circle(12, 12, 6), circle(12, 12, 1.25), path('M12 6v4.75M12 13.25V18M6 12h4.75M13.25 12H18'), line(19, 8, 19, 16));
    case 'dollar-circle': return glyph(circle(12, 12, 9.25), path('M15.5 8.25c-1-1-2.25-1.5-3.75-1.5-2 0-3.25 1-3.25 2.5 0 4 7 2 7 6 0 1.5-1.25 2.5-3.5 2.5-1.5 0-3-.5-4-1.5M12 4.75v14.5'));
    case 'dollar-limit': return glyph(circle(8.5, 10, 5.75), path('M10.5 7.75a3.25 3.25 0 0 0-2-.75c-1.25 0-2 .6-2 1.5 0 2.4 4 1.2 4 3.6 0 .9-.75 1.5-2.1 1.5a4 4 0 0 1-2.4-.85M8.5 5.75v8.5'), path('M14 17.5h7M14 20.75h4'), circle(19.5, 17.5, 0.55));
    case 'price-tag': return glyph(path('M3.25 12.25 12.5 3h7.75v7.75L11 20z'), circle(16.75, 6.5, 1), line(7.5, 14.25, 12.25, 9.5));
    case 'receipt': return glyph(path('M5 3.25h14v18l-2.25-1.5-2.25 1.5-2.5-1.5-2.5 1.5-2.25-1.5L5 21.25z'), line(8, 8, 16, 8), line(8, 12, 16, 12), line(8, 16, 12.5, 16), circle(16, 16, 0.55));
    case 'piggy-bank': return glyph(path('M3.25 12a7.25 7.25 0 0 1 12-5.5h3.25l-.75 3a5.75 5.75 0 0 1 1 8.5h-2.5l-1.25 3h-3v-2.25H8.5V21h-3l-1-3A7.25 7.25 0 0 1 3.25 12Z'), line(9, 7, 13, 7), circle(16, 12, 0.6));
    case 'store': return glyph(path('M4.25 9.25v11.5h15.5V9.25'), path('M3 9.25 5 3.25h14l2 6a3 3 0 0 1-4.5 2.6A3 3 0 0 1 12 11.5a3 3 0 0 1-4.5.35A3 3 0 0 1 3 9.25Z'), rect(9, 14, 6, 6.75, 1));
    case 'code-2': return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.75), polyline('9,7.5 5.5,12 9,16.5'), polyline('15,7.5 18.5,12 15,16.5'), line(13.5, 6.5, 10.5, 17.5));
    case 'embed-code': return glyph(path('M3.25 6.25h17.5v12.5H3.25z'), polyline('9.5,9 6.5,12 9.5,15'), polyline('14.5,9 17.5,12 14.5,15'), line(13, 8.5, 11, 15.5));
    case 'lock-keyhole': return glyph(path('M7 10V7a5 5 0 0 1 10 0v3'), rect(4.25, 10, 15.5, 11, 2.5), circle(12, 14.5, 1.5), path('M11.25 15.75 10.75 18h2.5l-.5-2.25'));
    case 'timer': return glyph(circle(12, 13, 8), line(12, 13, 16, 10), line(12, 13, 12, 8), path('M9 2.75h6M12 2.75V5M18.25 5.75l1.5-1.5'), circle(12, 13, 0.7));
    case 'magic-wand': return glyph(path('M3.25 18.25 15.75 5.75l2.5 2.5L5.75 20.75z'), line(13.75, 7.75, 16.25, 10.25), path('M7 3v4M5 5h4M19 14v5M16.5 16.5h5'));
    case 'radio-tower': return glyph(line(12, 9, 12, 21), circle(12, 7, 1.4), path('M8.75 4.75a4.5 4.5 0 0 0 0 4.5M15.25 4.75a4.5 4.5 0 0 1 0 4.5M5.75 2.75a8.5 8.5 0 0 0 0 8.5M18.25 2.75a8.5 8.5 0 0 1 0 8.5'), line(7, 21, 17, 21));
    default: return undefined;
  }
};

const modifierSuffixes = [
  ['-sparkles', 'sparkles'], ['-warning', 'alert'], ['-alert', 'alert'], ['-check', 'check'],
  ['-minus', 'minus'], ['-plus', 'plus'], ['-lock', 'lock'], ['-star', 'star'], ['-x', 'x'],
] as const;

const coreGeometry = (name: string): TIconNodes => {
  const directional = directionGeometry(name);
  if (directional) return directional;

  const direct = directGeometry(name);
  if (direct) return direct;

  if (TREEUI_PRODUCT_ICON_NAMES.has(name)) return productGeometry(name);

  if (name.endsWith('-off')) {
    return glyph(...coreGeometry(name.slice(0, -4)), line(3.25, 3.25, 20.75, 20.75));
  }

  const suffix = modifierSuffixes.find(([ending]) => name.endsWith(ending));
  if (suffix) {
    const [ending, modifier] = suffix;
    return glyph(...coreGeometry(name.slice(0, -ending.length)), ...badge(modifier));
  }

  if (name === 'file' || name.startsWith('file-')) return familyFile(name);
  if (name === 'folder' || name.startsWith('folder-')) return familyFolder(name);
  if (name === 'calendar' || name.startsWith('calendar-')) return familyCalendar(name);
  if (name === 'clock' || name.startsWith('clock-') || name === 'timer') return clockFrame();
  if (name === 'mail' || name === 'mails' || name.startsWith('mail-')) return familyMail(name);
  if (name.startsWith('message-') || name === 'chat' || name === 'comment' || name === 'responses-list') return familyMessage(name);
  if (name === 'user' || name === 'users' || name.startsWith('user-') || name.startsWith('users-') || name.startsWith('human-')) return familyUser(name);
  if (name === 'shield' || name.startsWith('shield-')) return familyShield(name);
  if (name === 'key' || name.startsWith('key-')) return familyKey(name);
  if (name === 'list' || name.startsWith('list-')) return familyList(name);
  if (name === 'signal' || name.startsWith('signal-')) return familySignal(name);
  if (name === 'gauge' || name.startsWith('gauge-')) return familyGauge(name);
  if (name === 'database' || name === 'hard-drive' || name.startsWith('hard-drive-') || name === 'server' || name.startsWith('server-')) return storageFrame(name);
  if (name === 'monitor-smartphone' || name === 'monitor-home' || name === 'smartphone' || name === 'laptop' || name.startsWith('laptop-')) return deviceFrame(name);
  if (name.startsWith('image-')) return glyph(...directGeometry('image')!, ...badge(name.endsWith('minus') ? 'minus' : name.endsWith('plus') ? 'plus' : 'sparkles'));
  if (name.startsWith('ticket')) return glyph(...directGeometry('ticket')!, ...(name.endsWith('plus') ? badge('plus') : []));
  if (name.startsWith('brain-')) return glyph(...directGeometry('brain')!, ...branchMark(name, 17.5, 17.5, 2.25));
  if (name.startsWith('bot-')) return glyph(...directGeometry('bot')!, ...badge(name.endsWith('users') ? 'plus' : 'star'));
  if (name.startsWith('plug-')) return glyph(...directGeometry('plug')!, ...badge(name.endsWith('plus') ? 'plus' : 'sparkles'));
  if (name.startsWith('repeat-')) return glyph(...directGeometry('repeat')!, ...branchMark(name, 12, 12, 2.5));
  if (name.startsWith('code-') || name === 'embed-code' || name === 'code-api') return glyph(...directGeometry('code')!, ...badge(name.includes('api') ? 'star' : 'plus'));
  if (name.startsWith('layout-') || name.startsWith('panel') || name === 'apps-grid' || name === 'grid') {
    return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(9, 3.25, 9, 20.75), line(9, 11, 20.75, 11), circle(15, 16, 1.2));
  }
  if (name.startsWith('chart-') || name === 'trend-up' || name.includes('chart-up')) {
    return glyph(path('M3.25 3.25v17.5h17.5'), polyline('6,16 10,11 13,14 19,7'), circle(10, 11, 0.6), circle(19, 7, 0.6));
  }
  if (name === 'network' || name.includes('network') || name === 'workflow' || name === 'hierarchy' || name === 'git-branch' || name === 'git-fork' || name === 'route' || name === 'timeline') {
    return branchMark(name, 12, 12, 8);
  }
  if (name === 'cpu' || name.startsWith('cpu-') || name === 'memory-stick') {
    return glyph(rect(5.25, 5.25, 13.5, 13.5, 2.5), rect(9, 9, 6, 6, 1.25), path('M8 2.75v2.5M12 2.75v2.5M16 2.75v2.5M8 18.75v2.5M12 18.75v2.5M16 18.75v2.5M2.75 8h2.5M2.75 12h2.5M2.75 16h2.5M18.75 8h2.5M18.75 12h2.5M18.75 16h2.5'));
  }
  if (name === 'browser' || name === 'page-snapshot') {
    return glyph(rect(3.25, 3.25, 17.5, 17.5, 2.5), line(3.25, 8, 20.75, 8), circle(6.25, 5.75, 0.5), circle(9, 5.75, 0.5), ...branchMark(name, 12, 14, 4));
  }
  if (name === 'badge' || name.startsWith('badge-') || name === 'id-badge') {
    return glyph(path('M12 2.75 15 5l3.75-.25.75 3.75 2.5 2.75-2.5 2.75-.75 3.75-3.75-.25-3 2.25-3-2.25-3.75.25-.75-3.75L2 11.25 4.5 8.5l.75-3.75L9 5z'), circle(12, 11.25, 2));
  }
  if (name === 'lock' || name.startsWith('lock-') || name === 'vault') {
    return glyph(path('M7 10V7a5 5 0 0 1 10 0v3'), rect(4.25, 10, 15.5, 11, 2.5), circle(12, 15, 1.25), line(12, 16.25, 12, 18.25));
  }
  if (name.includes('shopping') || name === 'store' || name === 'price-tag' || name === 'receipt' || name.startsWith('dollar') || name === 'piggy-bank') {
    return glyph(path('M4 8h16l-1.5 11h-13z'), path('M7 8a5 5 0 0 1 10 0'), line(8, 12, 16, 12), line(8, 16, 13, 16));
  }
  if (name === 'flask-play') return glyph(path('M9 3.25h6M10 3.25v6L5 19a1.5 1.5 0 0 0 1.3 2.25h11.4A1.5 1.5 0 0 0 19 19l-5-9.75v-6'), line(7.5, 15, 16.5, 15), polygon('10.5,16.5 14,18.25 10.5,20'));

  throw new Error(`Missing TreeUI icon geometry: ${name}`);
};

const TREE_ICON_ALIASES = {
  grid: 'layout-grid',
  share: 'share-nodes',
  'chevron-updown': 'chevrons-up-down',
  refresh: 'refresh-cw',
  comment: 'message-circle',
  chat: 'message-circle',
  'check-square': 'square-check',
  help: 'circle-help',
  automations: 'zap',
  connections: 'external-link',
  persona: 'user-round',
  close: 'x',
} as const satisfies Partial<Record<TBuiltinIconName, TBuiltinIconName>>;

const geometryCache = new Map<TBuiltinIconName, TIconNodes>();

const geometryFor = (name: TBuiltinIconName): TIconNodes => {
  const canonical =
    (TREE_ICON_ALIASES as Partial<Record<TBuiltinIconName, TBuiltinIconName>>)[name] ?? name;
  const cached = geometryCache.get(canonical);

  if (cached) return cached;

  const nodes = coreGeometry(canonical);
  geometryCache.set(canonical, nodes);

  return nodes;
};

export const builtinTreeIconNodes = Object.fromEntries(
  BUILTIN_ICON_NAMES.map((name) => [name, geometryFor(name)]),
) as { readonly [Name in TBuiltinIconName]: TIconNodes };
