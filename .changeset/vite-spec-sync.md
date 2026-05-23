---
'@treeui/vue': patch
---

Sync root `vite` devDependency spec to `^8.0.14` to match the lockfile resolution. The Dependabot security PR bumped the lockfile (vite 5 → 8) without updating the `package.json` spec; this aligns them.
