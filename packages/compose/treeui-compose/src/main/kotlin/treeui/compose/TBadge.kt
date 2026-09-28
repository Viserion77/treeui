package treeui.compose

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.clearAndSetSemantics
import treeui.tokens.TreeBadgeTone
import treeui.tokens.TreeSize
import treeui.tokens.TreeTokens
import treeui.tokens.TreeVariant
import treeui.tokens.badgeTone

/**
 * The badge's minimum heights, in dp, by size step.
 *
 * Stranded literals. The stylesheet writes `1.5rem` / `1.75rem` / `2rem`
 * directly in `.t-badge--sm|md|lg` rather than reading a size token, so there is
 * nothing in `TreeTokens` to point at — 24, 28 and 32 at the 16px root. They sit
 * between `Space` (which stops being a height at 24) and `ControlSize` (which
 * starts at 32), which is presumably why they were written by hand.
 *
 * Declared here, named, rather than inlined at the call site, so the census of
 * what the port had to hard-code is greppable.
 */
internal const val BADGE_MIN_HEIGHT_SM_DP: Float = 24f

/** See [BADGE_MIN_HEIGHT_SM_DP]. The stylesheet's `1.75rem`. */
internal const val BADGE_MIN_HEIGHT_MD_DP: Float = 28f

/** See [BADGE_MIN_HEIGHT_SM_DP]. The stylesheet's `2rem`. */
internal const val BADGE_MIN_HEIGHT_LG_DP: Float = 32f

/**
 * The badge's line height, as a multiple of its font size.
 *
 * Also stranded: `.t-badge` writes `line-height: 1`, and the tightest token,
 * `LineHeight.compact`, is `1.1`. A pill sized by its own minimum height wants
 * the line box to add nothing, which no token expresses.
 */
internal const val BADGE_LINE_HEIGHT: Float = 1f

/** Minimum height for a size step. */
private fun badgeMinHeight(size: TreeSize) =
    when (size) {
        TreeSize.Sm -> BADGE_MIN_HEIGHT_SM_DP
        TreeSize.Md -> BADGE_MIN_HEIGHT_MD_DP
        TreeSize.Lg -> BADGE_MIN_HEIGHT_LG_DP
    }

/**
 * A label that states a status.
 *
 * ```
 * TreeTheme {
 *     TBadge(label = "Active", tone = TreeBadgeTone.Success)
 *     TBadge(label = "Draft")
 *     TBadge(label = "Overdue", variant = TreeVariant.Solid, tone = TreeBadgeTone.Danger)
 * }
 * ```
 *
 * ## What it guarantees
 *
 * - Ink that clears AA on its own fill, for every `variant` × `tone` × theme the
 *   API can express. `TBadgeColorsTest` measures all 40.
 * - No interaction states at all, because a badge is not an action. It has no
 *   hover, no press, no focus and no role; a status that reacts to a pointer is
 *   telling the reader something untrue about itself. Reach for `TButton` or a
 *   chip when the thing is clickable.
 * - `TreeBadgeTone`, not `TreeTone`: no brand and no accent. A badge says what
 *   state something is in, and "brand" is not a state.
 *
 * ## Where the colours come from
 *
 * `TreePalette.badgeTone`, generated into `treeui-tokens` from the declared
 * `NATIVE_BADGE_TONES` table in `@treeui/tokens`. This component resolves
 * nothing itself, on purpose: the badge's twenty cells are not the button's
 * ten-slot accent set, and a port that re-derived them from the stylesheet would
 * be a second source of truth for one decision. `badgeTone` is exhaustive over
 * both vocabularies with no `else` branch, so a new tone or variant fails the
 * generated file to compile rather than quietly painting a default.
 *
 * Two things in that table worth knowing before reading a screenshot:
 *
 * - **`Solid` ink is `brand.contrast` for every tone**, not `status.<x>.contrast`.
 *   In the light theme they are the same colour; in the dark theme they differ by
 *   a few steps. It measures between 5.19:1 and 8.13:1 across the ten
 *   tone/theme pairs, so it clears AA — but it clears by coincidence rather than
 *   by construction, since nothing ties the brand's contrast ink to a status
 *   fill. A future brand colour could break it, and the gate here is what would
 *   catch that.
 * - **`Outline` keeps `bg.surface` for every tone.** A toned outline badge is
 *   toned ink and a toned edge on the plain surface; the surface itself is never
 *   tinted. `Neutral` is also the only tone whose `Ghost` and `Outline` ink
 *   differ — `text.muted` against `text.primary`. Every status tone uses its own
 *   solid colour for both.
 *
 * ## The deprecated `danger` variant
 *
 * `TreeVariant.Danger` does not exist in this vocabulary — it is excluded as
 * deprecated, since a variant named for a colour can only ever be one filled red
 * shape. Use `tone = TreeBadgeTone.Danger`, which composes with all four
 * variants. The `--tree-badge-danger-*` slots the stylesheet still carries for
 * the legacy `.t-badge--danger` class therefore have no counterpart here, and
 * want none: every value they resolve to is already reachable as `Soft` plus a
 * tone.
 *
 * @param leading Drawn before the label, spaced by the base gap, and hidden from
 *   assistive technology the way the Vue component's `icon` slot is
 *   `aria-hidden` — a status icon that is also announced says the status twice.
 */
@Composable
public fun TBadge(
    label: String,
    modifier: Modifier = Modifier,
    variant: TreeVariant = TreeVariant.Soft,
    size: TreeSize = TreeSize.Md,
    tone: TreeBadgeTone = TreeBadgeTone.Neutral,
    leading: (@Composable () -> Unit)? = null,
) {
    val palette = TreeTheme.palette
    val typography = TreeTheme.typography
    val colors = palette.badgeTone(tone, variant)

    val shape = RoundedCornerShape(TreeTokens.Radius.pill.tdp)

    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(TreeTokens.Space.s2.tdp),
        modifier =
            modifier
                // A minimum, not a height: the pill grows for a wrapped label
                // rather than clipping it. `Row` is already fit-content wide,
                // which is the stylesheet's `width: fit-content`.
                .defaultMinSize(minHeight = badgeMinHeight(size).tdp)
                // `null` in the table means "no fill" / "no edge", which is the
                // stylesheet's `transparent` — a ghost badge shows the surface
                // it sits on rather than painting one of its own.
                .background(colors.background?.toColor() ?: Color.Transparent, shape)
                .border(
                    width = TreeTokens.BorderWidth.subtle.tdp,
                    color = colors.border?.toColor() ?: Color.Transparent,
                    shape = shape,
                )
                .padding(horizontal = TreeTokens.Space.s3.tdp),
    ) {
        if (leading != null) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.clearAndSetSemantics {},
            ) {
                leading()
            }
        }

        BasicText(
            text = label,
            style = typography.badge(size).copy(color = colors.text.toColor()),
        )
    }
}
