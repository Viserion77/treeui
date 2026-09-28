package treeui.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.semantics.Role
import treeui.tokens.TreeCardVariant
import treeui.tokens.TreeColor
import treeui.tokens.TreePalette
import treeui.tokens.TreeShadowLayer
import treeui.tokens.TreeSize
import treeui.tokens.TreeTokens

/**
 * Width of the card's focus ring, in dp.
 *
 * Not `FOCUS_RING_WIDTH_DP`, which is `4` — the stylesheet writes the card's
 * ring as a literal `0 0 0 2px`, bypassing `--tree-focus-ring-width` that every
 * other focusable surface reads. This port reproduces what the stylesheet says
 * rather than picking a side; see the note on [TCard] about the divergence.
 */
internal const val CARD_FOCUS_RING_WIDTH_DP: Float = 2f

/**
 * How a token blur radius becomes a Compose elevation.
 *
 * There is no correct conversion, only an honest one. A `TreeShadowLayer`
 * carries an offset, a blur radius, a spread and its own composited colour —
 * the four numbers a CSS `box-shadow` takes. Compose takes an *elevation* and
 * derives the blur itself from the platform's light model, so the token's blur
 * cannot be passed through.
 *
 * Halving it is chosen because it preserves the RATIO between the elevation
 * steps exactly, which is the part that carries meaning: `shadowXs` (blur 2)
 * lands at 1dp and `shadowMd` (blur 34) at 17dp, so a hovered card still reads
 * as seventeen times further off the page than a resting one. The absolute
 * blur is the platform's, and will not match a browser pixel for pixel.
 */
internal const val SHADOW_BLUR_TO_ELEVATION: Float = 0.5f

/**
 * What one resolved card surface paints with.
 *
 * [shadow] is the token's layer list, empty for a surface with no elevation, so
 * "`inset` has no shadow" is a property a test can read rather than something
 * only a screenshot would show.
 */
@Immutable
internal data class TreeCardPaint(
    val fill: TreeColor,
    val text: TreeColor,
    val border: TreeColor,
    val shadow: List<TreeShadowLayer>,
)

/**
 * Resolve the colours and the elevation for the surface a card is actually in.
 *
 * Pure, and tested as plain JVM code for the same reason `treeButtonPaint` is:
 * the part where a wrong token would ship is the resolution, not the layout.
 *
 * [hovered] only counts when [interactive] — a card that is not an action does
 * not respond to a pointer resting on it, which is the whole point of the
 * distinction.
 */
internal fun treeCardPaint(
    palette: TreePalette,
    variant: TreeCardVariant,
    interactive: Boolean = false,
    hovered: Boolean = false,
): TreeCardPaint {
    val lifted = interactive && hovered

    return TreeCardPaint(
        fill =
            when (variant) {
                TreeCardVariant.Outline -> palette.bgSurface
                TreeCardVariant.Soft -> palette.bgSubtle
                TreeCardVariant.Inset -> palette.bgSubtle
            },
        // The stylesheet's `color: var(--tree-color-text-primary)`. Foundation
        // has no content-colour cascade — there is no `LocalContentColor`
        // outside Material — so the card cannot push this onto its content the
        // way the CSS declaration does. It is resolved here anyway, because a
        // promise the surface makes about its ink is exactly what the contrast
        // gate has to measure; content reads the same `TreeTheme.palette`.
        text = palette.textPrimary,
        // `.t-card--inset` restates `border-color: border-default`, which is
        // already the base — so all three variants share one edge at rest, and
        // only the interactive hover strengthens it.
        border = if (lifted) palette.borderStrong else palette.borderDefault,
        shadow =
            when {
                // Deliberately first. In the stylesheet `.t-card--interactive:hover`
                // both outranks `.t-card--inset` on specificity and comes after
                // it in source order, so an inset card that is also interactive
                // DOES lift on hover. Ordering this branch after the `Inset`
                // check would quietly drop that.
                lifted -> palette.shadowMd
                variant == TreeCardVariant.Inset -> emptyList()
                else -> palette.shadowXs
            },
    )
}

/** Padding for a size step. */
private fun cardPadding(size: TreeSize) =
    when (size) {
        TreeSize.Sm -> TreeTokens.Space.s3
        TreeSize.Md -> TreeTokens.Space.s4
        TreeSize.Lg -> TreeTokens.Space.s5
    }

/**
 * A token elevation step as the one shadow Compose can draw.
 *
 * What is approximated, stated plainly because a dropped shadow is the kind of
 * thing nobody notices until a design review:
 *
 * - **Blur** is converted, not carried. See [SHADOW_BLUR_TO_ELEVATION].
 * - **Offset** is dropped. Every shadow in the token set has `offsetX = 0`, and
 *   Compose's elevation shadow already falls downward, so the direction
 *   survives; the exact `offsetY` does not.
 * - **Spread** is dropped. It is `0` on both steps a card uses (`shadowXs`,
 *   `shadowMd`), so nothing is lost here today — a token whose spread is
 *   non-zero, like `shadowLg`, would render wider than the web does.
 * - **Layers beyond the first** are dropped. Compose has no multi-layer
 *   box-shadow. Every step in the shipped palettes is a single layer, so this
 *   costs nothing yet; the `first()` is where it would start to.
 * - **Colour** is passed to both the ambient and the spot shadow, which the
 *   platform only honours from API 28. Below that the framework paints its own
 *   black, and the token's per-theme umbra is ignored. The token's alpha is
 *   also attenuated again by the platform's own falloff, so the shadow reads
 *   lighter than the CSS.
 */
private fun Modifier.treeShadow(layers: List<TreeShadowLayer>, shape: Shape): Modifier {
    val layer = layers.firstOrNull() ?: return this
    val color = layer.color.toColor()

    return shadow(
        elevation = (layer.blur * SHADOW_BLUR_TO_ELEVATION).tdp,
        shape = shape,
        // The card draws its own border and background after this; letting the
        // shadow modifier clip would also clip them to the same shape twice and
        // cut the focus ring off at the edge.
        clip = false,
        ambientColor = color,
        spotColor = color,
    )
}

/**
 * A surface that groups content.
 *
 * ```
 * TreeTheme {
 *     TCard(size = TreeSize.Lg) {
 *         BasicText("Deploy", style = TreeTheme.typography.controlLarge)
 *         BasicText("Ships to production.", style = TreeTheme.typography.controlMedium)
 *     }
 *
 *     TCard(variant = TreeCardVariant.Inset, onClick = ::open, onClickLabel = "Open invoice") {
 *         BasicText("INV-2043", style = TreeTheme.typography.controlMedium)
 *     }
 * }
 * ```
 *
 * ## What it guarantees
 *
 * - The base `gap` is the column's arrangement, so stacked content is spaced by
 *   the token rather than by whatever margin each child brings. Aligning
 *   content is the library's job, not the caller's.
 * - Ink that clears AA on every one of the three surfaces, in both themes —
 *   `TCardPaintTest` measures it rather than asserting it.
 * - An [onClick] card is a real target: `Role.Button`, a hover that both
 *   strengthens the edge and lifts the surface, and a visible focus ring. A
 *   card is a large target already, so no minimum size is imposed the way
 *   `TButton` imposes one.
 *
 * `TreeCardVariant` has no `solid` on purpose — it is a surface scale, not the
 * action scale. `docs/ai/DECISIONS.md` → "Variant Vocabulary" has the argument.
 *
 * Two places where this deliberately does not match the web:
 *
 * - The focus ring is [CARD_FOCUS_RING_WIDTH_DP] (`2`), because the stylesheet
 *   writes the card's ring as a literal `2px` instead of reading
 *   `--tree-focus-ring-width` (`4`), which every other focusable surface does.
 *   The stylesheet is reproduced as written; the inconsistency belongs to the
 *   design contract, not to this port.
 * - The ring is a single translucent mark, again as written. `TButton` draws two
 *   — an opaque edge for the 3:1 an indicator owes WCAG, plus the halo for
 *   emphasis — because the halo alone measures 1.59:1 on the light canvas. The
 *   card's ring inherits that weakness from the CSS.
 *
 * @param onClick Makes the whole card the action. `null` — the default — leaves
 *   it a plain surface with no hover, no focus ring and no role, which is what a
 *   card that merely groups content should be.
 * @param onClickLabel What activating the card does, for a screen reader. Only
 *   meaningful alongside [onClick].
 * @param content Stacked in a column spaced by the base gap. A header row, a
 *   footer, a title — the slots the Vue component names — are compositions of
 *   this rather than parameters, because in Compose a `Row` of two children is
 *   the whole of what `t-card__header` does.
 */
@Composable
public fun TCard(
    modifier: Modifier = Modifier,
    variant: TreeCardVariant = TreeCardVariant.Outline,
    size: TreeSize = TreeSize.Md,
    onClick: (() -> Unit)? = null,
    onClickLabel: String? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val palette = TreeTheme.palette
    val interactionSource = remember { MutableInteractionSource() }

    val hovered by interactionSource.collectIsHoveredAsState()
    val focused by interactionSource.collectIsFocusedAsState()

    val interactive = onClick != null
    val paint = treeCardPaint(palette, variant, interactive, hovered)

    val radius = TreeTokens.Radius.lg
    val shape = RoundedCornerShape(radius.tdp)
    val ring = CARD_FOCUS_RING_WIDTH_DP.tdp
    val ringColor = palette.focusRing.toColor()

    Column(
        verticalArrangement = Arrangement.spacedBy(TreeTokens.Space.s3.tdp),
        modifier =
            modifier
                .then(
                    if (onClick != null) {
                        Modifier.clickable(
                            interactionSource = interactionSource,
                            indication = null,
                            onClickLabel = onClickLabel,
                            role = Role.Button,
                            onClick = onClick,
                        )
                    } else {
                        Modifier
                    },
                )
                // Outside the card's own box, like the button's halo and like
                // the `box-shadow` spread this mirrors — a ring drawn inside the
                // border would eat into the padding. No gutter is reserved for
                // it: the ring is paint, not layout, so an interactive card
                // measures the same as a plain one. An ancestor that clips will
                // trim it, exactly as `overflow: hidden` does on the web.
                .drawBehind {
                    if (!focused) return@drawBehind
                    val inset = ring.toPx()
                    val box = this.size
                    drawRoundRect(
                        color = ringColor,
                        topLeft = Offset(-inset, -inset),
                        size = Size(box.width + inset * 2, box.height + inset * 2),
                        cornerRadius = CornerRadius((radius + CARD_FOCUS_RING_WIDTH_DP).tdp.toPx()),
                    )
                }
                .treeShadow(paint.shadow, shape)
                .background(paint.fill.toColor(), shape)
                .border(
                    width = TreeTokens.BorderWidth.subtle.tdp,
                    color = paint.border.toColor(),
                    shape = shape,
                )
                .padding(cardPadding(size).tdp),
        content = content,
    )
}
