import type { Component } from 'vue';
import { getTreeIcon, treeIconDefaults } from '@treeui/icons';

export const CheckIcon: Component = getTreeIcon('check');
export const InfoIcon: Component = getTreeIcon('info');
export const SearchIcon: Component = getTreeIcon('search');
export const iconProps = treeIconDefaults;
