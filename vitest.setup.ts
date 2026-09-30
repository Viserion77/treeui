import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';

/**
 * Unmount every mounted wrapper between tests.
 *
 * Overlay components render through `<Teleport to="body">`, so their panels are
 * siblings of the mount root rather than descendants of it, and a test that
 * does not unmount leaves one behind. That was invisible while only TModal
 * teleported and its tests all unmounted; once TPopover, TSelect and
 * TDatePicker moved their panels out of the clipping ancestor, a
 * `document.body.querySelector('[role="dialog"]')` in one test started finding
 * the previous test's panel.
 *
 * `enableAutoUnmount` rather than emptying `document.body`: wiping the body
 * removes a live component's teleport target without telling Vue, and the next
 * update of that component dies on `insertBefore` of null. Unmounting lets Vue
 * take its own nodes down, teleported ones included.
 */
enableAutoUnmount(afterEach);
