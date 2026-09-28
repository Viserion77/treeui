package treeui.compose

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import treeui.tokens.TreeColor
import treeui.tokens.TreeColorMode
import treeui.tokens.TreePalette
import treeui.tokens.TreePalettes
import treeui.tokens.TreeSize
import treeui.tokens.TreeTokens

/**
 * A TreeUI colour as Compose's.
 *
 * The token model carries straight alpha — the focus halo is the brand at
 * `0.32`, not the brand already multiplied by it — and Compose's `Color(Int)`
 * takes exactly that packed `0xAARRGGBB` form, so nothing is premultiplied at
 * the boundary.
 */
public fun TreeColor.toColor(): Color = Color(argb)

/** A token length as `Dp`. One CSS pixel is one `dp`; see `TreeTokens`. */
internal val Float.tdp: Dp get() = dp

/**
 * A token type size as `TextUnit`.
 *
 * `sp`, never `dp`. A button whose label ignores the reader's text-size setting
 * is inaccessible on every Android device, and it is the kind of mistake that
 * looks fine on the developer's phone.
 */
internal val Float.tsp: TextUnit get() = sp

/**
 * The type roles the component set uses today.
 *
 * It grows one role at a time, with the component that needs it. A typography
 * scale invented ahead of its components is a scale nobody has checked against
 * a real line of text.
 */
@Immutable
public data class TreeTypography(
    /** Label for a small control. */
    public val controlSmall: TextStyle,
    /** Label for a medium control — the default. */
    public val controlMedium: TextStyle,
    /** Label for a large control. */
    public val controlLarge: TextStyle,
    /** Text inside a small badge. */
    public val badgeSmall: TextStyle,
    /** Text inside a medium badge — the default. */
    public val badgeMedium: TextStyle,
    /** Text inside a large badge. */
    public val badgeLarge: TextStyle,
) {
    /** The control label for a size step. */
    public fun control(size: TreeSize): TextStyle =
        when (size) {
            TreeSize.Sm -> controlSmall
            TreeSize.Md -> controlMedium
            TreeSize.Lg -> controlLarge
        }

    /** The badge text for a size step. */
    public fun badge(size: TreeSize): TextStyle =
        when (size) {
            TreeSize.Sm -> badgeSmall
            TreeSize.Md -> badgeMedium
            TreeSize.Lg -> badgeLarge
        }
}

/**
 * The type scale, built from the tokens.
 *
 * [fontFamily] is left to the application: the token model names
 * `Google Sans Flex`, and a font TreeUI does not ship cannot be resolved from a
 * library. Pass the product's own family to honour the token; the platform
 * default is used otherwise, and the size, weight, line height and tracking
 * still come from the contract.
 */
public fun treeTypography(fontFamily: FontFamily = FontFamily.Default): TreeTypography {
    fun control(sizePx: Float) =
        TextStyle(
            fontFamily = fontFamily,
            fontSize = sizePx.tsp,
            fontWeight = FontWeight(TreeTokens.FontWeight.medium),
            lineHeight = (sizePx * TreeTokens.LineHeight.tight).tsp,
            letterSpacing = TreeTokens.Tracking.normal.em,
            // Compose centres a line inside its line box only if asked to;
            // without this the label sits high in a fixed-height control.
            lineHeightStyle =
                LineHeightStyle(
                    alignment = LineHeightStyle.Alignment.Center,
                    trim = LineHeightStyle.Trim.None,
                ),
        )

    // A badge is a pill sized by its own minimum height, so its line box adds
    // nothing: `BADGE_LINE_HEIGHT` is `1`, which is not a `LineHeight` token —
    // see the constant. One step SMALLER than the control scale at every size,
    // which is the stylesheet's choice: xs/sm/md against a control's sm/md/lg.
    fun badge(sizePx: Float) =
        TextStyle(
            fontFamily = fontFamily,
            fontSize = sizePx.tsp,
            fontWeight = FontWeight(TreeTokens.FontWeight.medium),
            lineHeight = (sizePx * BADGE_LINE_HEIGHT).tsp,
            letterSpacing = TreeTokens.Tracking.normal.em,
            lineHeightStyle =
                LineHeightStyle(
                    alignment = LineHeightStyle.Alignment.Center,
                    trim = LineHeightStyle.Trim.None,
                ),
        )

    return TreeTypography(
        controlSmall = control(TreeTokens.FontSize.sm),
        controlMedium = control(TreeTokens.FontSize.md),
        controlLarge = control(TreeTokens.FontSize.lg),
        badgeSmall = badge(TreeTokens.FontSize.xs),
        badgeMedium = badge(TreeTokens.FontSize.sm),
        badgeLarge = badge(TreeTokens.FontSize.md),
    )
}

/**
 * The palette in scope.
 *
 * `static`, not a regular composition local: a theme change repaints the whole
 * tree anyway, and a regular local would make every colour read a
 * recomposition scope.
 */
public val LocalTreePalette: androidx.compose.runtime.ProvidableCompositionLocal<TreePalette> =
    staticCompositionLocalOf { TreePalettes.Light }

/** The type scale in scope. */
public val LocalTreeTypography: androidx.compose.runtime.ProvidableCompositionLocal<TreeTypography> =
    staticCompositionLocalOf { treeTypography() }

/**
 * Put a TreeUI palette and type scale in scope.
 *
 * ```
 * TreeTheme {
 *     TButton(label = "Save changes", onClick = ::save)
 * }
 * ```
 *
 * Follows the platform by default. A product pins a theme by passing [palette]
 * explicitly, and themes itself by passing one it built — the `TreePalette`
 * constructor requires every semantic role, which is the Kotlin form of the
 * colour-contract validator.
 */
@Composable
public fun TreeTheme(
    palette: TreePalette = if (isSystemInDarkTheme()) TreePalettes.Dark else TreePalettes.Light,
    typography: TreeTypography = treeTypography(),
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(
        LocalTreePalette provides palette,
        LocalTreeTypography provides typography,
        content = content,
    )
}

/** Accessors for whatever [TreeTheme] is in scope. */
public object TreeTheme {
    /** The palette in scope. */
    public val palette: TreePalette
        @Composable @ReadOnlyComposable
        get() = LocalTreePalette.current

    /** The type scale in scope. */
    public val typography: TreeTypography
        @Composable @ReadOnlyComposable
        get() = LocalTreeTypography.current

    /** Which colour mode the palette in scope is, for the platform chrome. */
    public val colorMode: TreeColorMode
        @Composable @ReadOnlyComposable
        get() = LocalTreePalette.current.mode
}
