/**
 * Path D of MIGRATION.md, for a product whose theme is a PICKER.
 *
 * MIGRATION.md validates one hand-authored theme. This app ships five accents
 * and a free custom field, so "the theme" is a range: every preset gets checked,
 * in light and dark, against the same contract the running app checks a custom
 * value against. Checking only the default would leave four themes a user can
 * reach with nothing standing behind them.
 *
 * Run: `pnpm --filter @treeui/example-dashboard-vue check:theme`
 *
 * The `.ts` in the import is deliberate: `--experimental-strip-types` does no
 * extension resolution, so an extensionless specifier fails at runtime with
 * ERR_MODULE_NOT_FOUND — see MIGRATION.md -> Path D.
 */

// A top-level `await` needs this file to be a module, and its only import is a
// dynamic one — which does not count.
export {};

// Loaded dynamically so the "you have not built yet" case says so. `@treeui/*`
// resolves to `dist` at runtime (tsconfig paths only apply to typechecking), and
// a bare ERR_MODULE_NOT_FOUND naming a transitive import is a bad first
// experience for the one script a product is being asked to add to its CI.
let theme: typeof import('../src/theme.ts');

try {
  theme = await import('../src/theme.ts');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);

  console.error(
    `Could not load the theme: ${message}\n` +
      'If this names @treeui/tokens, the workspace packages are not built — run `pnpm build:packages` first.',
  );
  process.exit(1);
}

const { accentPresets, checkAccent } = theme;

const failures = accentPresets.filter((preset) => {
  const result = checkAccent(preset.value);

  if (result.valid) {
    console.log(`  ok   ${preset.label.padEnd(14)} ${preset.value}`);
    return false;
  }

  console.error(`  FAIL ${preset.label.padEnd(14)} ${preset.value}`);
  for (const problem of result.problems) console.error(`       ${problem}`);

  return true;
});

if (failures.length > 0) {
  console.error(
    `\n${failures.length} of ${accentPresets.length} accent presets fail the TreeUI colour contract.`,
  );
  process.exit(1);
}

console.log(`\n${accentPresets.length} accent presets pass, light and dark.`);
