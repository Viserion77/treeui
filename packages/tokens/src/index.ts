export * from './vocabulary';
export * from './primitives';
export * from './tokens';
export * from './color';
export * from './states';
export * from './contract';
export * from './css';
export * from './seed';
export * from './validate';

// Named rather than `export *`: the two parsers and the `WEB_ONLY` escape hatch
// inside `native.ts` are implementation details of the renderer, not package
// API. What a consumer can use is the resolved model, the parity report, the
// tone table, and the two source emitters — which is what a product that seeds
// its own theme needs in order to regenerate the Kotlin and Rust palettes.
export {
  NATIVE_BADGE_TONES,
  NATIVE_BADGE_TONE_NAMES,
  NATIVE_BADGE_VARIANTS,
  NATIVE_TOKEN_GROUPS,
  NATIVE_TONES,
  NATIVE_TONE_DOCS,
  NATIVE_TONE_NAMES,
  NATIVE_TONE_SLOTS,
  ROOT_FONT_SIZE_PX,
  nativeFoundationKeys,
  nativeParityReport,
  resolveBadgeTone,
  resolveNativeTokens,
  resolveTone,
  type NativeEasing,
  type NativeGradient,
  type NativeGradientStop,
  type NativeParityReport,
  type NativeRgba,
  type NativeShadowLayer,
  type NativeThemePalette,
  type NativeBadgeSlot,
  type NativeBadgeSlots,
  type NativeBadgeToneName,
  type NativeBadgeVariant,
  type NativeTokenGroup,
  type NativeTokens,
  type NativeToneName,
  type NativeToneSlot,
} from './native';
export { KOTLIN_PACKAGE, createKotlinTokens } from './kotlin';
export { createRustTokens } from './rust';
