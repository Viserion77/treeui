/**
 * The catalog's subject taxonomy.
 *
 * Icons are looked up by name, which only works when you already know the name.
 * This is the other half: an ordered set of subjects a picker can group by, and
 * the reverse lookup a details panel needs. Storybook's icon gallery is built
 * on it, and an application building its own picker can use the same map rather
 * than re-deriving one from name prefixes — a derivation that gets `route`,
 * `scale` and `draw` wrong every time.
 *
 * Every shipped icon appears in exactly one category; `categories.test.ts`
 * holds that, so a new icon cannot be added without placing it.
 */

import type { TIconName } from './registry';

/** A subject an icon belongs to. */
export type TIconCategory =
  | 'actions'
  | 'navigation'
  | 'status'
  | 'files'
  | 'communication'
  | 'people'
  | 'time'
  | 'data'
  | 'development'
  | 'devices'
  | 'media'
  | 'security'
  | 'commerce'
  | 'ai'
  | 'product';

/** Categories in the order a picker should present them. */
export const treeIconCategoryOrder = [
  'actions',
  'navigation',
  'status',
  'files',
  'communication',
  'people',
  'time',
  'data',
  'development',
  'devices',
  'media',
  'security',
  'commerce',
  'ai',
  'product',
] as const satisfies readonly TIconCategory[];

/** Human-readable name for each category. */
export const treeIconCategoryLabels: Readonly<Record<TIconCategory, string>> = {
  'actions': 'Actions',
  'navigation': 'Navigation',
  'status': 'Status & feedback',
  'files': 'Files & storage',
  'communication': 'Communication',
  'people': 'People',
  'time': 'Time & scheduling',
  'data': 'Data & layout',
  'development': 'Development',
  'devices': 'Devices & hardware',
  'media': 'Media & nature',
  'security': 'Security',
  'commerce': 'Commerce',
  'ai': 'AI',
  'product': 'TreeUI products',
};

/** The icons in each category, sorted, covering the whole catalog. */
export const treeIconCategories: Readonly<
  Record<TIconCategory, readonly TIconName[]>
> = {
  'actions': [
    'brush', 'brush-stroke', 'close', 'copy',
    'download', 'download-video', 'ellipsis', 'ellipsis-vertical',
    'eraser', 'filter', 'filter-capabilities', 'install',
    'link', 'link-2', 'link-off', 'minus',
    'minus-square', 'more-horizontal', 'pencil', 'plus',
    'publish', 'refresh', 'refresh-cw', 'refresh-cw-off',
    'rotate-ccw', 'rotate-cw', 'save', 'search',
    'search-x', 'settings', 'settings-2', 'share',
    'share-nodes', 'shuffle', 'sliders-horizontal', 'square',
    'square-plus', 'toggle-left', 'toggle-right', 'trash-2',
    'unlink', 'upload', 'upload-cloud', 'x',
  ],
  'navigation': [
    'arrow-down', 'arrow-left', 'arrow-left-right', 'arrow-right',
    'arrow-up', 'arrow-up-right', 'chevron-down', 'chevron-left',
    'chevron-right', 'chevron-up', 'chevron-updown', 'chevrons-up-down',
    'compass', 'connections', 'crosshair', 'external-link',
    'grip-vertical', 'home', 'house', 'log-in',
    'log-out', 'log-out-all', 'maximize-2', 'menu',
    'minimize-2', 'mouse-pointer-2', 'move-horizontal', 'route',
    'skip-forward', 'target', 'target-choice',
  ],
  'status': [
    'activity', 'alert-circle', 'badge', 'badge-check',
    'badge-star', 'check', 'check-circle', 'check-square',
    'circle-alert', 'circle-check', 'circle-dot', 'circle-help',
    'circle-x', 'flag', 'gauge', 'gauge-high',
    'gauge-low', 'gauge-medium', 'help', 'info',
    'loader-circle', 'octagon-x', 'signal', 'signal-high',
    'signal-low', 'signal-medium', 'signal-off', 'siren',
    'square-check', 'triangle-alert',
  ],
  'files': [
    'archive', 'archive-restore', 'book-open', 'bookmark',
    'boxes', 'boxes-model', 'clipboard-list', 'cube',
    'file', 'file-archive', 'file-audio', 'file-code',
    'file-edit', 'file-image', 'file-pdf', 'file-plus',
    'file-scan', 'file-text', 'file-video', 'file-warning',
    'files', 'folder', 'folder-input', 'folder-kanban',
    'folder-open', 'folder-plus', 'folder-shared', 'folder-tree',
    'folder-x', 'folders', 'inbox', 'inbox-empty',
    'journal', 'layers', 'library-books', 'newspaper',
    'package', 'package-download', 'page-snapshot', 'paperclip',
  ],
  'communication': [
    'bell', 'chat', 'comment', 'globe',
    'globe-check', 'languages', 'mail', 'mail-check',
    'mail-open', 'mail-plus', 'mail-warning', 'mails',
    'megaphone', 'message-circle', 'message-square', 'message-square-plus',
    'messages-square', 'mic', 'microphone', 'newsletter',
    'paper-plane', 'radio', 'radio-tower', 'responses-list',
    'rss', 'send', 'send-check', 'send-request',
    'volume-2',
  ],
  'people': [
    'hand-check', 'human-lock', 'id-badge', 'persona',
    'user', 'user-check', 'user-cog', 'user-minus',
    'user-plus', 'user-round', 'user-x', 'users',
    'users-round',
  ],
  'time': [
    'calendar', 'calendar-clock', 'calendar-day', 'calendar-days',
    'calendar-dot', 'calendar-plus', 'calendar-range', 'calendar-x',
    'clock', 'clock-alert', 'clock-x', 'history',
    'hourglass', 'repeat', 'repeat-2', 'repeat-fallback',
    'repeat-interval', 'timeline', 'timer',
  ],
  'data': [
    'apps-grid', 'chart-column', 'chart-line', 'chart-pie',
    'database', 'grid', 'hash', 'layout-dashboard',
    'layout-grid', 'layout-kanban', 'list', 'list-checks',
    'list-ordered', 'list-rule', 'list-todo', 'panel-left',
    'panel-right', 'panels-top-left', 'server', 'server-api',
    'server-environment', 'token-input', 'token-output', 'trend-up',
  ],
  'development': [
    'automations', 'braces', 'brackets', 'bug',
    'calculator', 'code', 'code-2', 'code-api',
    'developer-settings', 'embed-code', 'extension', 'flask-play',
    'git-branch', 'git-fork', 'hierarchy', 'network',
    'network-nodes', 'plugin', 'square-terminal', 'terminal',
    'workflow', 'wrench', 'wrench-zap', 'zap',
  ],
  'devices': [
    'browser', 'cpu', 'cpu-chip', 'device-link',
    'hard-drive', 'hard-drive-alert', 'hard-drive-off', 'laptop',
    'laptop-bridge', 'memory-stick', 'monitor-home', 'monitor-smartphone',
    'plug', 'plug-cloud', 'plug-off', 'plug-plus',
    'smartphone', 'unplug',
  ],
  'media': [
    'align-left', 'carousel', 'cloud', 'cloud-off',
    'crown', 'droplet', 'film', 'heart',
    'heart-chart-up', 'heart-pulse', 'image', 'image-minus',
    'image-plus', 'image-up', 'leaf', 'life-buoy',
    'line-width', 'moon', 'palette', 'pause',
    'pause-circle', 'pipette', 'play', 'play-circle',
    'quote', 'rocket', 'star', 'sticker',
    'sun', 'type',
  ],
  'security': [
    'automation-key', 'ban', 'eye', 'eye-off',
    'fingerprint', 'gavel', 'key', 'key-off',
    'key-round', 'lock', 'lock-keyhole', 'scale',
    'scan', 'shield', 'shield-check', 'shield-lock',
    'shield-question', 'shield-x', 'vault',
  ],
  'commerce': [
    'building-2', 'coins', 'credit-card', 'dollar-circle',
    'dollar-limit', 'piggy-bank', 'price-tag', 'receipt',
    'shopping-basket', 'shopping-cart', 'store', 'ticket',
    'ticket-plus', 'tickets', 'wallet', 'warehouse',
  ],
  'ai': [
    'bot', 'bot-badge', 'bot-users', 'brain',
    'brain-circuit', 'brain-lock', 'clock-sparkles', 'lightbulb',
    'lightbulb-sparkles', 'magic-wand', 'sparkles', 'wand-sparkles',
  ],
  'product': [
    'account', 'ai-studio', 'app-window', 'assistant',
    'catalog', 'companion', 'contentpilot', 'draw',
    'llm', 'market', 'storage', 'story',
    'support', 'tasks', 'trail', 'workspace',
  ],
};

/**
 * Built on first use rather than at module load: the forward map is the shape
 * a gallery iterates, and an application that never asks "what is this icon
 * about?" should not pay for the index.
 */
let categoryByName: Map<string, TIconCategory> | undefined;

/** The category an icon belongs to, or `undefined` for an unknown name. */
export const treeIconCategory = (name: string): TIconCategory | undefined => {
  if (!categoryByName) {
    categoryByName = new Map();

    for (const category of treeIconCategoryOrder) {
      for (const icon of treeIconCategories[category]) {
        categoryByName.set(icon, category);
      }
    }
  }

  return categoryByName.get(name);
};
