import type { Component } from 'vue';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';

// Cast via `as Component` instead of annotating the binding to avoid
// TS2321 "Excessive stack depth" introduced by vue@3.5.31+ when the
// concrete DefineComponent returned by getTreeIcon is checked for
// assignability against the widened Component union.
export const CheckIcon = getTreeIcon('check') as Component;
export const InfoIcon = getTreeIcon('info') as Component;
export const SearchIcon = getTreeIcon('search') as Component;
export const iconProps = treeIconDefaults;
