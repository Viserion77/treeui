package treeui.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.interaction.collectIsHoveredAsState
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.unit.dp
import treeui.tokens.TreeColor
import treeui.tokens.TreePalette
import treeui.tokens.TreeSize
import treeui.tokens.TreeToneColors
import treeui.tokens.TreeTokens
import treeui.tokens.TreeTone
import treeui.tokens.TreeVariant
import treeui.tokens.tone

/**
 * The smallest a pointer target may be, in dp.
 *
 * Not a token, because it is not one yet: the stylesheet writes `44px` as a
 * literal. It is the WCAG 2.5.5 floor and TreeUI treats it as a requirement, so
 * it is stated once here rather than per component.
 */
internal const val MIN_TARGET_DP: Float = 44f

/** Width of the focus halo, in dp. The stylesheet's `--tree-focus-ring-width`. */
internal const val FOCUS_RING_WIDTH_DP: Float = 4f

/** Fully transparent, for a variant with no fill or no edge. */
private val TRANSPARENT = TreeColor(0, 0, 0, 0f)

/** What one resolved state paints with. */
@Immutable
internal data class TreeButtonPaint(
    val fill: TreeColor,
    val text: TreeColor,
    val border: TreeColor,
)

/** Press wins over hover, because a held button is being pressed. */
private fun step(rest: TreeColor, hover: TreeColor, press: TreeColor, hovered: Boolean, pressed: Boolean) =
    when {
        pressed -> press
        hovered -> hover
        else -> rest
    }

/**
 * Ink for a toned `Outline` or `Ghost`, which deepens as its surface does.
 *
 * The same rule `Soft` already follows — a tint has only so much headroom before
 * its label stops clearing AA — applied to the neutral state surfaces the quiet
 * variants press on.
 *
 * It is not cosmetic. `state.press-bg` is the surface mixed with 12% ink, which
 * takes it past `bg.subtle`, the darkest surface the colour contract measures a
 * tone against. Holding a toned quiet button with the ink left at `accent`
 * measures between 4.11:1 and 4.45:1 across the seven tones and both themes —
 * below AA in 22 of the combinations this API can express. Stepping the ink with
 * the surface clears all of them. The egui port applies the same rule, and
 * `TButtonPaintTest` holds it in both.
 */
private fun quietInk(tone: TreeToneColors, hovered: Boolean, pressed: Boolean) =
    step(tone.accent, tone.accentHover, tone.accentPress, hovered, pressed)

/**
 * Resolve the colours for the state a button is actually in.
 *
 * Kept as a pure function rather than folded into the composable so it can be
 * tested as plain JVM code: the part where a wrong token would ship is the
 * resolution, not the layout.
 *
 * The quiet variants hover and press on the NEUTRAL state surfaces rather than
 * on the accent — an outline button that fills with brand on hover reads as a
 * different button, not as the same button being pointed at.
 */
internal fun treeButtonPaint(
    palette: TreePalette,
    variant: TreeVariant,
    tone: TreeTone?,
    hovered: Boolean = false,
    pressed: Boolean = false,
    enabled: Boolean = true,
    loading: Boolean = false,
): TreeButtonPaint {
    val colors = palette.tone(tone ?: TreeTone.Brand)
    val inked = tone != null

    if (!enabled || loading) {
        val ghost = variant == TreeVariant.Ghost
        return TreeButtonPaint(
            fill = if (ghost) TRANSPARENT else palette.stateDisabledBg,
            text = palette.stateDisabledFg,
            border = if (ghost) TRANSPARENT else palette.stateDisabledBorder,
        )
    }

    return when (variant) {
        TreeVariant.Solid ->
            TreeButtonPaint(
                fill = step(colors.accent, colors.accentHover, colors.accentPress, hovered, pressed),
                text = colors.accentContrast,
                border = TRANSPARENT,
            )

        TreeVariant.Soft ->
            TreeButtonPaint(
                fill = step(colors.accentSoft, colors.accentSoftHover, colors.accentSoftPress, hovered, pressed),
                text = step(colors.accentOnSoft, colors.accentOnSoftHover, colors.accentOnSoftPress, hovered, pressed),
                border = TRANSPARENT,
            )

        TreeVariant.Outline ->
            TreeButtonPaint(
                fill = step(palette.bgSurface, palette.stateHoverBg, palette.statePressBg, hovered, pressed),
                text = if (inked) quietInk(colors, hovered, pressed) else palette.textPrimary,
                border =
                    when {
                        // `color-mix(in srgb, accent 36%, border-default)` — the
                        // edge takes the tone without becoming a filled block.
                        inked -> colors.accent.mix(palette.borderDefault, 0.64f)
                        hovered || pressed -> palette.borderStrong
                        else -> palette.borderDefault
                    },
            )

        TreeVariant.Ghost ->
            TreeButtonPaint(
                fill =
                    if (hovered || pressed) {
                        step(TRANSPARENT, palette.stateHoverBg, palette.statePressBg, hovered, pressed)
                    } else {
                        TRANSPARENT
                    },
                text = if (inked) quietInk(colors, hovered, pressed) else palette.textPrimary,
                border = TRANSPARENT,
            )
    }
}

/** Control height for a size step. */
private fun controlHeight(size: TreeSize) =
    when (size) {
        TreeSize.Sm -> TreeTokens.ControlSize.sm
        TreeSize.Md -> TreeTokens.ControlSize.md
        TreeSize.Lg -> TreeTokens.ControlSize.lg
    }

/** Inline padding for a size step. */
private fun inlinePadding(size: TreeSize) =
    when (size) {
        TreeSize.Sm -> TreeTokens.Space.s3
        TreeSize.Md -> TreeTokens.Space.s4
        TreeSize.Lg -> TreeTokens.Space.s5
    }

/**
 * An action.
 *
 * ```
 * TreeTheme {
 *     TButton(label = "Save changes", onClick = ::save)
 *     TButton(label = "Delete", onClick = ::delete, variant = TreeVariant.Ghost, tone = TreeTone.Danger)
 *     TButton(label = "Saving…", onClick = {}, loading = true)
 * }
 * ```
 *
 * ## What it guarantees
 *
 * - A visible rest, hover, press, focus and disabled state. Disabled is a
 *   measured colour, never an alpha — an alpha cannot be checked for contrast,
 *   so a faded label cannot be proven readable.
 * - A pointer target of at least [MIN_TARGET_DP] in both axes, which for the
 *   small size is larger than the button's own box. The gutter that holds it is
 *   reserved in layout whether or not the button has focus, so focus never
 *   shifts anything around it.
 * - A focus indicator in two marks: an opaque edge carrying the 3:1 that WCAG
 *   asks of an indicator, and a translucent halo carrying the emphasis. The halo
 *   alone measures 1.59:1 on the light canvas, so a port that drew only the halo
 *   would ship an indicator nobody can find.
 * - `Role.Button` and, while [loading], a state description — so a screen reader
 *   both names it and says it is busy.
 *
 * @param tone Colour axis, orthogonal to [variant]. Left `null`, the fill and
 *   the tint are the brand while the quiet variants keep neutral ink, which is
 *   how a row of secondary actions stays quiet. Set, it also inks `Outline` and
 *   `Ghost`, so a destructive action can sit in that row saying what it is
 *   without outweighing it.
 * @param loading An action already in flight. Implies disabled, and is announced.
 * @param dense Drop the [MIN_TARGET_DP] floor and lay the button out at its own
 *   height. An opt-OUT rather than an opt-in on purpose: a pointer-only toolbar
 *   is a real case for tighter rhythm, but the floor has to be what you get
 *   without asking, or it is not a floor.
 */
@Composable
public fun TButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: TreeVariant = TreeVariant.Solid,
    tone: TreeTone? = null,
    size: TreeSize = TreeSize.Md,
    enabled: Boolean = true,
    loading: Boolean = false,
    loadingLabel: String = "Loading",
    block: Boolean = false,
    dense: Boolean = false,
) {
    val palette = TreeTheme.palette
    val typography = TreeTheme.typography
    val interactionSource = remember { MutableInteractionSource() }

    val hovered by interactionSource.collectIsHoveredAsState()
    val pressed by interactionSource.collectIsPressedAsState()
    val focused by interactionSource.collectIsFocusedAsState()

    val interactive = enabled && !loading
    val paint = treeButtonPaint(palette, variant, tone, hovered, pressed, enabled, loading)

    val shape = RoundedCornerShape(TreeTokens.Radius.md.tdp)
    val ring = FOCUS_RING_WIDTH_DP.tdp
    val haloColor = palette.focusRing.toColor()
    val edgeColor = palette.brandPrimary.toColor()

    // The touch floor and the halo gutter are both reserved on the outer box, so
    // the click area is the whole target and focus costs no layout.
    val target = if (dense) 0.dp else MIN_TARGET_DP.tdp

    Box(
        contentAlignment = Alignment.Center,
        modifier =
            modifier
                .then(if (block) Modifier.fillMaxWidth() else Modifier)
                .defaultMinSize(minWidth = target, minHeight = target)
                .clickable(
                    interactionSource = interactionSource,
                    indication = null,
                    enabled = interactive,
                    role = Role.Button,
                    onClick = onClick,
                )
                .semantics {
                    if (loading) stateDescription = loadingLabel
                }
                .padding(ring),
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier =
                Modifier
                    .then(if (block) Modifier.fillMaxWidth() else Modifier)
                    .height(controlHeight(size).tdp)
                    // Before `background`, so the halo is not clipped by the
                    // button's own shape, and drawn outside the box rather than
                    // inside it — a ring inside the border would eat the label.
                    .drawBehind {
                        if (!focused) return@drawBehind
                        val inset = ring.toPx()
                        // `this.size`, qualified: the composable's own `size`
                        // parameter shadows `DrawScope.size` here.
                        val box = this.size
                        drawRoundRect(
                            color = haloColor,
                            topLeft = Offset(-inset, -inset),
                            size = Size(box.width + inset * 2, box.height + inset * 2),
                            cornerRadius = CornerRadius((TreeTokens.Radius.md + FOCUS_RING_WIDTH_DP).tdp.toPx()),
                        )
                    }
                    .background(paint.fill.toColor(), shape)
                    .border(
                        width = if (focused) TreeTokens.BorderWidth.strong.tdp else TreeTokens.BorderWidth.subtle.tdp,
                        color = if (focused) edgeColor else paint.border.toColor(),
                        shape = shape,
                    )
                    .padding(horizontal = inlinePadding(size).tdp),
        ) {
            BasicText(
                text = label,
                style = typography.control(size).copy(color = paint.text.toColor()),
            )
        }
    }
}
