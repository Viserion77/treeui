---
"@treeui/vue": minor
"@treeui/tokens": minor
"@treeui/utils": minor
"@treeui/mcp": minor
---

feat: add native charts — TChart, TSparkline, and TDonutChart

A lightweight, dependency-free data-viz set that follows the TreeUI patterns
(BEM `t-*` classes, `--tree-*` tokens, `tv()`), with no external charting library.

- **@treeui/utils**: a framework-agnostic chart geometry engine (`niceScale`,
  `linearScale`, `buildLinePath`, `buildAreaPath`, `donutSegments`) — reusable from React.
- **@treeui/tokens**: a categorical chart palette `--tree-color-chart-1..8`, validated
  for CVD separation and contrast on both the light and dark surfaces.
- **@treeui/vue**:
  - `TChart` — line / area / bar, multi-series, stacked bars, axes, gridlines, legend,
    hover crosshair + tooltip, and a visually-hidden data table for assistive tech.
  - `TSparkline` — inline, axis-less micro-trend (line / area / bar) for stat tiles,
    table cells, and text.
  - `TDonutChart` — proportional donut / pie with legend, percentages, and an
    interactive center readout.
- **@treeui/mcp**: catalog regenerated to include the new components.
