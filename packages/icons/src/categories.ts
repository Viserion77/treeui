/**
 * The catalog's subject taxonomy, two levels deep.
 *
 * Icons are looked up by name, which only works when you already know the name.
 * This is the other half: fifteen subjects a picker can group by, each split
 * into families — `signal` and its four strengths, `chevron` and its four
 * directions — so a catalog of 352 drawings reads as a few dozen ideas.
 *
 * Two rules make the families useful rather than decorative. A family lists its
 * base name first and then its variants **by meaning**, so a strength scale
 * reads off, low, medium, high rather than high, low, medium, off. And only
 * canonical names appear: `close` and `x` are one drawing under two names, so
 * the catalog shows it once and `treeIconAliases` says what else to call it.
 *
 * `categories.test.ts` holds all of that, so a new icon cannot ship without a
 * family, and a family cannot drift out of order.
 */

import { TREE_ICON_ALIASES } from './icons';
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
  | 'everyday'
  | 'ai';

/** A set of icons that share a base name. */
export interface TIconFamily {
  /**
   * The shared base, e.g. `signal`. An icon that shares its base with nothing
   * else is a family of one, so a consumer can render every group the same way
   * and show a heading only when `icons.length > 1`.
   */
  id: string;
  /** Members, base name first, then its variants in meaning order. */
  icons: readonly TIconName[];
}

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
  'everyday',
  'ai',
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
  'everyday': 'Everyday life',
  'ai': 'AI',
};

/** Families within each category, sorted by base name. */
export const treeIconFamilies: Readonly<
  Record<TIconCategory, readonly TIconFamily[]>
> = {
  'actions': [
    { id: 'brush', icons: ['brush', 'brush-stroke'] },
    { id: 'copy', icons: ['copy'] },
    { id: 'download', icons: ['download', 'download-video'] },
    { id: 'ellipsis', icons: ['ellipsis', 'ellipsis-vertical'] },
    { id: 'eraser', icons: ['eraser'] },
    { id: 'filter', icons: ['filter', 'filter-capabilities'] },
    { id: 'install', icons: ['install'] },
    { id: 'link', icons: ['link', 'link-2', 'link-off'] },
    { id: 'minus', icons: ['minus', 'minus-square'] },
    { id: 'more-horizontal', icons: ['more-horizontal'] },
    { id: 'pencil', icons: ['pencil'] },
    { id: 'plus', icons: ['plus'] },
    { id: 'publish', icons: ['publish'] },
    { id: 'refresh', icons: ['refresh-cw', 'refresh-cw-off'] },
    { id: 'rotate', icons: ['rotate-ccw', 'rotate-cw'] },
    { id: 'save', icons: ['save'] },
    { id: 'search', icons: ['search', 'search-x'] },
    { id: 'settings', icons: ['settings', 'settings-2'] },
    { id: 'share-nodes', icons: ['share-nodes'] },
    { id: 'shuffle', icons: ['shuffle'] },
    { id: 'sliders-horizontal', icons: ['sliders-horizontal'] },
    { id: 'square', icons: ['square', 'square-plus', 'square-check'] },
    { id: 'trash-2', icons: ['trash-2'] },
    { id: 'unlink', icons: ['unlink'] },
    { id: 'upload', icons: ['upload', 'upload-cloud'] },
    { id: 'x', icons: ['x'] },
  ],
  'navigation': [
    {
      id: 'arrow',
      icons: [
        'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right',
        'arrow-up-right', 'arrow-left-right',
      ],
    },
    {
      id: 'chevron',
      icons: [
        'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
        'chevrons-up-down',
      ],
    },
    { id: 'compass', icons: ['compass'] },
    { id: 'crosshair', icons: ['crosshair'] },
    { id: 'external-link', icons: ['external-link'] },
    { id: 'grip-vertical', icons: ['grip-vertical'] },
    { id: 'home', icons: ['home'] },
    { id: 'log', icons: ['log-in', 'log-out', 'log-out-all'] },
    { id: 'maximize-2', icons: ['maximize-2'] },
    { id: 'menu', icons: ['menu'] },
    { id: 'minimize-2', icons: ['minimize-2'] },
    { id: 'mouse-pointer-2', icons: ['mouse-pointer-2'] },
    { id: 'move-horizontal', icons: ['move-horizontal'] },
    { id: 'route', icons: ['route'] },
    { id: 'skip-forward', icons: ['skip-forward'] },
    { id: 'target', icons: ['target', 'target-choice'] },
    { id: 'trail', icons: ['trail'] },
  ],
  'status': [
    { id: 'activity', icons: ['activity'] },
    { id: 'badge', icons: ['badge', 'badge-check', 'badge-star'] },
    { id: 'check', icons: ['check'] },
    {
      id: 'circle',
      icons: [
        'circle-check', 'circle-x', 'circle-alert', 'circle-dot',
        'circle-help',
      ],
    },
    { id: 'flag', icons: ['flag'] },
    { id: 'gauge', icons: ['gauge', 'gauge-low', 'gauge-medium', 'gauge-high'] },
    { id: 'info', icons: ['info'] },
    { id: 'loader-circle', icons: ['loader-circle'] },
    { id: 'octagon-x', icons: ['octagon-x'] },
    {
      id: 'signal',
      icons: [
        'signal', 'signal-off', 'signal-low', 'signal-medium',
        'signal-high',
      ],
    },
    { id: 'siren', icons: ['siren'] },
    { id: 'triangle-alert', icons: ['triangle-alert'] },
  ],
  'files': [
    { id: 'archive', icons: ['archive', 'archive-restore'] },
    { id: 'book-open', icons: ['book-open'] },
    { id: 'bookmark', icons: ['bookmark'] },
    { id: 'boxes', icons: ['boxes', 'boxes-model'] },
    { id: 'clipboard-list', icons: ['clipboard-list'] },
    { id: 'cube', icons: ['cube'] },
    {
      id: 'file',
      icons: [
        'file', 'file-plus', 'file-warning', 'file-archive',
        'file-audio', 'file-code', 'file-edit', 'file-image',
        'file-pdf', 'file-scan', 'file-text', 'file-video',
      ],
    },
    { id: 'files', icons: ['files'] },
    {
      id: 'folder',
      icons: [
        'folder', 'folder-open', 'folder-input', 'folder-plus',
        'folder-x', 'folder-kanban', 'folder-shared', 'folder-tree',
      ],
    },
    { id: 'folders', icons: ['folders'] },
    { id: 'inbox', icons: ['inbox', 'inbox-empty'] },
    { id: 'journal', icons: ['journal'] },
    { id: 'layers', icons: ['layers'] },
    { id: 'library-books', icons: ['library-books'] },
    { id: 'newspaper', icons: ['newspaper'] },
    { id: 'package', icons: ['package', 'package-download'] },
    { id: 'page-snapshot', icons: ['page-snapshot'] },
    { id: 'paperclip', icons: ['paperclip'] },
  ],
  'communication': [
    { id: 'bell', icons: ['bell'] },
    { id: 'campaign', icons: ['campaign'] },
    { id: 'globe', icons: ['globe', 'globe-check'] },
    { id: 'languages', icons: ['languages'] },
    { id: 'mail', icons: ['mail', 'mail-open', 'mail-plus', 'mail-check', 'mail-warning'] },
    { id: 'mails', icons: ['mails'] },
    { id: 'megaphone', icons: ['megaphone'] },
    { id: 'message', icons: ['message-circle', 'message-square', 'message-square-plus'] },
    { id: 'messages-square', icons: ['messages-square'] },
    { id: 'mic', icons: ['mic'] },
    { id: 'newsletter', icons: ['newsletter'] },
    { id: 'radio', icons: ['radio', 'radio-tower'] },
    { id: 'responses-list', icons: ['responses-list'] },
    { id: 'rss', icons: ['rss'] },
    { id: 'send', icons: ['send', 'send-check', 'send-request'] },
    { id: 'support', icons: ['support'] },
    { id: 'volume-2', icons: ['volume-2'] },
  ],
  'people': [
    { id: 'account', icons: ['account'] },
    { id: 'hand-check', icons: ['hand-check'] },
    { id: 'human-lock', icons: ['human-lock'] },
    { id: 'id-badge', icons: ['id-badge'] },
    {
      id: 'user',
      icons: [
        'user', 'user-plus', 'user-minus', 'user-check',
        'user-x', 'user-cog', 'user-round',
      ],
    },
    { id: 'users', icons: ['users', 'users-round'] },
  ],
  'time': [
    {
      id: 'calendar',
      icons: [
        'calendar', 'calendar-plus', 'calendar-x', 'calendar-clock',
        'calendar-day', 'calendar-days', 'calendar-dot', 'calendar-range',
      ],
    },
    { id: 'clock', icons: ['clock', 'clock-x', 'clock-alert'] },
    { id: 'history', icons: ['history'] },
    { id: 'hourglass', icons: ['hourglass'] },
    { id: 'repeat', icons: ['repeat', 'repeat-2', 'repeat-fallback', 'repeat-interval'] },
    { id: 'timeline', icons: ['timeline'] },
    { id: 'timer', icons: ['timer'] },
  ],
  'data': [
    { id: 'apps-grid', icons: ['apps-grid'] },
    { id: 'catalog', icons: ['catalog'] },
    { id: 'chart', icons: ['chart-column', 'chart-line', 'chart-pie'] },
    { id: 'database', icons: ['database'] },
    { id: 'hash', icons: ['hash'] },
    { id: 'layout', icons: ['layout-dashboard', 'layout-grid', 'layout-kanban'] },
    { id: 'list', icons: ['list', 'list-checks', 'list-ordered', 'list-rule', 'list-todo'] },
    { id: 'panel', icons: ['panel-left', 'panel-right'] },
    { id: 'panels-top-left', icons: ['panels-top-left'] },
    { id: 'server', icons: ['server', 'server-api', 'server-environment'] },
    { id: 'storage', icons: ['storage'] },
    { id: 'tasks', icons: ['tasks'] },
    { id: 'token', icons: ['token-input', 'token-output'] },
    { id: 'trend-up', icons: ['trend-up'] },
    { id: 'workspace', icons: ['workspace'] },
  ],
  'development': [
    { id: 'braces', icons: ['braces'] },
    { id: 'brackets', icons: ['brackets'] },
    { id: 'bug', icons: ['bug'] },
    { id: 'calculator', icons: ['calculator'] },
    { id: 'code', icons: ['code', 'code-2', 'code-api'] },
    { id: 'developer-settings', icons: ['developer-settings'] },
    { id: 'embed-code', icons: ['embed-code'] },
    { id: 'extension', icons: ['extension'] },
    { id: 'flask-play', icons: ['flask-play'] },
    { id: 'git', icons: ['git-branch', 'git-fork'] },
    { id: 'hierarchy', icons: ['hierarchy'] },
    { id: 'network', icons: ['network', 'network-nodes'] },
    { id: 'plugin', icons: ['plugin'] },
    { id: 'square-terminal', icons: ['square-terminal'] },
    { id: 'terminal', icons: ['terminal'] },
    { id: 'workflow', icons: ['workflow'] },
    { id: 'wrench', icons: ['wrench', 'wrench-zap'] },
    { id: 'zap', icons: ['zap'] },
  ],
  'devices': [
    { id: 'app-window', icons: ['app-window'] },
    { id: 'browser', icons: ['browser'] },
    { id: 'cpu', icons: ['cpu', 'cpu-chip'] },
    { id: 'device-link', icons: ['device-link'] },
    { id: 'hard-drive', icons: ['hard-drive', 'hard-drive-off', 'hard-drive-alert'] },
    { id: 'laptop', icons: ['laptop', 'laptop-bridge'] },
    { id: 'memory-stick', icons: ['memory-stick'] },
    { id: 'monitor', icons: ['monitor-home', 'monitor-smartphone'] },
    { id: 'plug', icons: ['plug', 'plug-off', 'plug-plus', 'plug-cloud'] },
    { id: 'smartphone', icons: ['smartphone'] },
    { id: 'unplug', icons: ['unplug'] },
  ],
  'media': [
    { id: 'align-left', icons: ['align-left'] },
    { id: 'carousel', icons: ['carousel'] },
    { id: 'cloud', icons: ['cloud', 'cloud-off'] },
    { id: 'companion', icons: ['companion'] },
    { id: 'crown', icons: ['crown'] },
    { id: 'draw', icons: ['draw'] },
    { id: 'droplet', icons: ['droplet'] },
    { id: 'film', icons: ['film'] },
    { id: 'heart', icons: ['heart', 'heart-chart-up', 'heart-pulse'] },
    { id: 'image', icons: ['image', 'image-up', 'image-plus', 'image-minus'] },
    { id: 'leaf', icons: ['leaf'] },
    { id: 'life-buoy', icons: ['life-buoy'] },
    { id: 'line-width', icons: ['line-width'] },
    { id: 'moon', icons: ['moon'] },
    { id: 'palette', icons: ['palette'] },
    { id: 'pause', icons: ['pause', 'pause-circle'] },
    { id: 'pipette', icons: ['pipette'] },
    { id: 'play', icons: ['play', 'play-circle'] },
    { id: 'quote', icons: ['quote'] },
    { id: 'rocket', icons: ['rocket'] },
    { id: 'star', icons: ['star'] },
    { id: 'sticker', icons: ['sticker'] },
    { id: 'story', icons: ['story'] },
    { id: 'sun', icons: ['sun'] },
    { id: 'type', icons: ['type'] },
  ],
  'security': [
    { id: 'automation-key', icons: ['automation-key'] },
    { id: 'ban', icons: ['ban'] },
    { id: 'eye', icons: ['eye', 'eye-off'] },
    { id: 'fingerprint', icons: ['fingerprint'] },
    { id: 'gavel', icons: ['gavel'] },
    { id: 'key', icons: ['key', 'key-off', 'key-round'] },
    { id: 'lock', icons: ['lock', 'lock-keyhole'] },
    { id: 'scale', icons: ['scale'] },
    { id: 'scan', icons: ['scan'] },
    {
      id: 'shield',
      icons: [
        'shield', 'shield-check', 'shield-x', 'shield-lock',
        'shield-question',
      ],
    },
    { id: 'vault', icons: ['vault'] },
  ],
  'commerce': [
    { id: 'building-2', icons: ['building-2'] },
    { id: 'coins', icons: ['coins'] },
    { id: 'credit-card', icons: ['credit-card'] },
    { id: 'dollar', icons: ['dollar-circle', 'dollar-limit'] },
    { id: 'market', icons: ['market'] },
    { id: 'piggy-bank', icons: ['piggy-bank'] },
    { id: 'price-tag', icons: ['price-tag'] },
    { id: 'receipt', icons: ['receipt'] },
    { id: 'shopping', icons: ['shopping-basket', 'shopping-cart'] },
    { id: 'store', icons: ['store'] },
    { id: 'ticket', icons: ['ticket', 'ticket-plus'] },
    { id: 'tickets', icons: ['tickets'] },
    { id: 'wallet', icons: ['wallet'] },
    { id: 'warehouse', icons: ['warehouse'] },
  ],
  'everyday': [
    { id: 'briefcase', icons: ['briefcase'] },
    { id: 'car', icons: ['car'] },
    { id: 'graduation-cap', icons: ['graduation-cap'] },
    { id: 'landmark', icons: ['landmark'] },
    { id: 'shirt', icons: ['shirt'] },
    { id: 'utensils', icons: ['utensils'] },
  ],
  'ai': [
    { id: 'ai-studio', icons: ['ai-studio'] },
    { id: 'assistant', icons: ['assistant'] },
    { id: 'bot', icons: ['bot', 'bot-badge', 'bot-users'] },
    { id: 'brain', icons: ['brain', 'brain-lock', 'brain-circuit'] },
    { id: 'clock-sparkles', icons: ['clock-sparkles'] },
    { id: 'lightbulb', icons: ['lightbulb', 'lightbulb-sparkles'] },
    { id: 'llm', icons: ['llm'] },
    { id: 'magic-wand', icons: ['magic-wand'] },
    { id: 'sparkles', icons: ['sparkles'] },
    { id: 'wand-sparkles', icons: ['wand-sparkles'] },
  ],
};

/**
 * Names that are a second word for an icon already in the catalog.
 *
 * A picker should show the drawing once and offer these as synonyms: searching
 * "close" ought to find `x`, not a second copy of it.
 */
export const treeIconAliases: Readonly<Record<string, TIconName>> =
  TREE_ICON_ALIASES;

/**
 * Every canonical icon in a category, flattened from its families.
 *
 * Derived rather than written out a second time: two lists of the same 352
 * names are two lists that can disagree.
 */
const flattened = {} as Record<TIconCategory, readonly TIconName[]>;

for (const category of treeIconCategoryOrder) {
  flattened[category] = treeIconFamilies[category].flatMap(
    (family) => family.icons,
  );
}

export const treeIconCategories: Readonly<
  Record<TIconCategory, readonly TIconName[]>
> = flattened;

/**
 * Built on first use rather than at module load: the forward maps are the shape
 * a gallery iterates, and an application that never asks "what is this icon
 * about?" should not pay for the index.
 */
let index: Map<string, { category: TIconCategory; family: string }> | undefined;

const lookup = (name: string) => {
  if (!index) {
    index = new Map();

    for (const category of treeIconCategoryOrder) {
      for (const family of treeIconFamilies[category]) {
        for (const icon of family.icons) {
          index.set(icon, { category, family: family.id });
        }
      }
    }
  }

  // An alias is the same concept as its target, so it resolves to the same
  // category — the catalog does not file `close` separately from `x`.
  return index.get(treeIconAliases[name] ?? name);
};

/** The category an icon belongs to, or `undefined` for an unknown name. */
export const treeIconCategory = (name: string): TIconCategory | undefined =>
  lookup(name)?.category;

/** The family base an icon belongs to, or `undefined` for an unknown name. */
export const treeIconFamily = (name: string): string | undefined =>
  lookup(name)?.family;
