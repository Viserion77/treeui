import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  createDefaultThemeCss,
  createStylesheet,
  createThemeCss,
  createThemesStylesheet,
} from './css';

const distDir = resolve(process.cwd(), 'dist');

await mkdir(distDir, { recursive: true });

await Promise.all([
  writeFile(resolve(distDir, 'styles.css'), `${createStylesheet()}\n`),
  writeFile(resolve(distDir, 'themes.css'), `${createThemesStylesheet()}\n`),
  writeFile(resolve(distDir, 'light.css'), `${createDefaultThemeCss('light')}\n`),
  writeFile(resolve(distDir, 'dark.css'), `${createThemeCss('dark', ':root')}\n`),
]);

