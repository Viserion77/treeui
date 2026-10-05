import type { InjectionKey } from 'vue';

/**
 * Present when a `TStat` is rendered inside a `TStatGroup`.
 *
 * The group draws one surface with hairlines between its cells, so a child that
 * kept drawing its own card would put a border, a radius and a shadow inside
 * another border. Injection rather than a prop the consumer repeats: a band of
 * eight indicators is eight chances to forget, and the ninth one added later
 * would be the one that looks wrong.
 */
export const STAT_GROUP_INJECTION_KEY: InjectionKey<boolean> = Symbol('t-stat-group');
