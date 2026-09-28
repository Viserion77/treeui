package treeui.compose

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue
import treeui.tokens.TreeBadgeTone
import treeui.tokens.TreeColor
import treeui.tokens.TreePalette
import treeui.tokens.TreePalettes
import treeui.tokens.TreeVariant
import treeui.tokens.badgeTone

/**
 * `TBadge`'s colours, measured.
 *
 * The table itself is generated — `TreePalette.badgeTone`, emitted from the
 * declared `NATIVE_BADGE_TONES` in `@treeui/tokens`, with
 * `badge-tone-contract.test.ts` holding it against the stylesheet. So these are
 * not a second derivation of the mapping; they are the Kotlin side's check that
 * the generated table says what this component needs it to say, and that what it
 * says is readable.
 *
 * Not `TBadgePaintTest`, and the asymmetry with `TButtonPaintTest` and
 * `TCardPaintTest` is deliberate rather than an oversight. Those two name a real
 * `treeButtonPaint` / `treeCardPaint` in this module; the badge has no such
 * function, because its colours come from the contract rather than from a
 * port-local resolver. The name is the reminder of which of those two kinds of
 * component this is.
 *
 * Plain JVM tests: the part where a wrong token would ship is the resolution, and
 * it does not need an emulator to check.
 */
class TBadgeColorsTest {
    private val light = TreePalettes.Light
    private val dark = TreePalettes.Dark

    private val variants = TreeVariant.entries
    private val tones = TreeBadgeTone.entries

    private fun colors(
        variant: TreeVariant,
        tone: TreeBadgeTone = TreeBadgeTone.Neutral,
        palette: TreePalette = light,
    ) = palette.badgeTone(tone, variant)

    /** What the ink actually sits on: the fill, or the surface when there is none. */
    private fun behind(palette: TreePalette, background: TreeColor?) =
        background?.over(palette.bgSurface) ?: palette.bgSurface

    @Test
    fun `the default badge is a neutral tint`() {
        // `variant = Soft`, `tone = Neutral` — the shape a status takes when it
        // is not claiming to be urgent.
        val resolved = colors(TreeVariant.Soft)
        assertEquals(light.brandSoft, resolved.background)
        assertEquals(light.brandOnSoft, resolved.text)
        assertNull(resolved.border, "a tint has no edge")
    }

    @Test
    fun `a neutral solid badge wears the brand`() {
        val resolved = colors(TreeVariant.Solid)
        assertEquals(light.brandPrimary, resolved.background)
        assertEquals(light.brandContrast, resolved.text)
        assertNull(resolved.border)
    }

    @Test
    fun `a neutral outline badge sits on the surface with the default edge`() {
        val resolved = colors(TreeVariant.Outline)
        assertEquals(light.bgSurface, resolved.background)
        assertEquals(light.textPrimary, resolved.text)
        assertEquals(light.borderDefault, resolved.border)
    }

    @Test
    fun `a neutral ghost badge is muted ink and nothing else`() {
        val resolved = colors(TreeVariant.Ghost)
        assertNull(resolved.background, "a ghost badge has no fill")
        assertNull(resolved.border)
        // The one slot where neutral's quiet ink differs by variant: muted for
        // ghost, primary for outline.
        assertEquals(light.textMuted, resolved.text)
        assertNotEquals(colors(TreeVariant.Outline).text, resolved.text)
    }

    @Test
    fun `a status tone substitutes its own family in every slot it owns`() {
        val solid = colors(TreeVariant.Solid, TreeBadgeTone.Success)
        assertEquals(light.statusSuccess, solid.background)

        val outline = colors(TreeVariant.Outline, TreeBadgeTone.Success)
        assertEquals(light.bgSurface, outline.background, "the surface is not toned")
        assertEquals(light.statusSuccess, outline.text)
        assertEquals(light.statusSuccessBorder, outline.border)

        val ghost = colors(TreeVariant.Ghost, TreeBadgeTone.Success)
        assertNull(ghost.background)
        assertEquals(light.statusSuccess, ghost.text)

        val soft = colors(TreeVariant.Soft, TreeBadgeTone.Success)
        assertEquals(light.statusSuccessSoft, soft.background)
        assertEquals(light.statusSuccessOnSoft, soft.text)
    }

    @Test
    fun `the danger tone reads the error family`() {
        // The vocabulary says `danger` and the palette says `error`. This is the
        // only place that seam is crossed, so it is worth one assertion.
        val soft = colors(TreeVariant.Soft, TreeBadgeTone.Danger)
        assertEquals(light.statusErrorSoft, soft.background)
        assertEquals(light.statusErrorOnSoft, soft.text)
        assertEquals(light.statusErrorBorder, colors(TreeVariant.Outline, TreeBadgeTone.Danger).border)
    }

    @Test
    fun `solid ink stays the brand's contrast whatever the tone`() {
        // Faithful to the contract, and surprising enough to pin: no tone
        // overrides the solid ink, so a toned solid badge is NOT
        // `status.<x>.contrast`. Identical to it in the light theme, a few steps
        // off in the dark one, and above AA either way — but by coincidence
        // rather than by construction, since nothing ties the brand's contrast
        // ink to a status fill. The gate below is what would catch a brand
        // colour that broke it.
        for (tone in tones) {
            assertEquals(light.brandContrast, colors(TreeVariant.Solid, tone).text, "$tone")
            assertEquals(dark.brandContrast, colors(TreeVariant.Solid, tone, dark).text, "$tone")
        }
        assertNotEquals(dark.statusSuccessContrast, dark.brandContrast)
    }

    @Test
    fun `a tone always retones the tint and the edge`() {
        // Guard against a tone silently resolving to the neutral base. Scoped to
        // `Soft` and `Outline` because those are the two variants where the token
        // families are distinct by construction — see the next test for why the
        // guard cannot be stated over all four.
        for (tone in tones - TreeBadgeTone.Neutral) {
            for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
                assertNotEquals(
                    colors(TreeVariant.Soft, TreeBadgeTone.Neutral, palette),
                    colors(TreeVariant.Soft, tone, palette),
                    "$theme: Soft / $tone resolves identically to neutral",
                )
                assertNotEquals(
                    colors(TreeVariant.Outline, TreeBadgeTone.Neutral, palette).border,
                    colors(TreeVariant.Outline, tone, palette).border,
                    "$theme: Outline / $tone keeps the neutral edge",
                )
            }
        }
    }

    @Test
    fun `a solid info badge is indistinguishable from a neutral one in the light theme`() {
        // Not a resolution bug — `status.info` and `brand.primary` are literally
        // the same colour in the light palette (#0969da), so the tone has nothing
        // to change. Pinned because it is exactly the kind of thing that looks
        // like a broken tone in a screenshot, and because it is only true in one
        // theme: the dark palette gives info its own hue.
        assertEquals(light.brandPrimary, light.statusInfo)
        assertEquals(
            colors(TreeVariant.Solid, TreeBadgeTone.Neutral),
            colors(TreeVariant.Solid, TreeBadgeTone.Info),
        )
        assertNotEquals(dark.brandPrimary, dark.statusInfo)
        assertNotEquals(
            colors(TreeVariant.Solid, TreeBadgeTone.Neutral, dark),
            colors(TreeVariant.Solid, TreeBadgeTone.Info, dark),
        )
    }

    @Test
    fun `every label clears AA on its own fill in every tone`() {
        // The gate that matters. 4 variants x 5 tones x 2 themes = 40. A badge
        // has no interaction states, so unlike the button there is no state axis
        // — which makes this the complete surface the API can express.
        //
        // This gate is what found the tint shortfall that was fixed in the
        // contract: `--tree-badge-soft-text` used to resolve to the tone's solid
        // colour, which measured 4.19:1 to 4.49:1 in 8 of these 40 cells,
        // including the default badge. It now reads `*-on-soft` and all 40 clear.
        val failures = mutableListOf<String>()

        for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
            for (variant in variants) {
                for (tone in tones) {
                    val resolved = colors(variant, tone, palette)
                    val ratio = resolved.text.contrastRatio(behind(palette, resolved.background))

                    if (ratio < AA_TEXT) {
                        failures += "$theme: $variant / $tone = " + "%.2f".format(ratio) + ":1"
                    }
                }
            }
        }

        assertTrue(
            failures.isEmpty(),
            "${failures.size} combinations below $AA_TEXT:1:\n  " + failures.joinToString("\n  "),
        )
    }

    @Test
    fun `the tint reads the on-soft ink, which is what clears AA on it`() {
        // Two assertions per tint, and the identity one is the point: a tint's
        // ink must be the `*OnSoft` step, the colour derived to clear AA on that
        // tint, and not the tone's solid colour. Substituting the solid colour
        // back in is precisely the regression that measured below AA in 8 of the
        // 10 combinations here, so this pins the shape of the fix rather than
        // only its effect — the ratio alone would still pass for a while if the
        // ramp drifted.
        for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
            for (tone in tones) {
                val resolved = colors(TreeVariant.Soft, tone, palette)
                assertEquals(
                    palette.onSoftInk(tone),
                    resolved.text,
                    "$theme: Soft / $tone is not the on-soft step",
                )

                val ratio = resolved.text.contrastRatio(behind(palette, resolved.background))
                assertTrue(
                    ratio >= AA_TEXT,
                    "$theme: Soft / $tone measures ${"%.2f".format(ratio)}:1",
                )
            }
        }
    }

    @Test
    fun `the stranded geometry literals are the ones the stylesheet writes`() {
        // `.t-badge--sm|md|lg` write `1.5rem` / `1.75rem` / `2rem` and `.t-badge`
        // writes `line-height: 1`, none of which is a token. Pinned here so
        // lifting them into `@treeui/tokens` has something to compare against.
        assertEquals(24f, BADGE_MIN_HEIGHT_SM_DP)
        assertEquals(28f, BADGE_MIN_HEIGHT_MD_DP)
        assertEquals(32f, BADGE_MIN_HEIGHT_LG_DP)
        assertEquals(1f, BADGE_LINE_HEIGHT)
        assertEquals(4.5f, AA_TEXT)
    }

    @Test
    fun `the vocabulary excludes the deprecated danger variant`() {
        // `.t-badge--danger` and its `--tree-badge-danger-*` slots exist on the
        // web and have no Kotlin counterpart, deliberately: `TreeVariant` drops
        // `danger` because a variant named for a colour can only be one filled
        // red shape. Everything the legacy class resolved to is reachable as
        // `Soft` plus a tone, which this checks rather than claims.
        assertEquals(4, TreeVariant.entries.size)
        assertEquals(light.statusErrorSoft, colors(TreeVariant.Soft, TreeBadgeTone.Danger).background)
    }

    /** The ink derived to clear AA on a tone's tint. */
    private fun TreePalette.onSoftInk(tone: TreeBadgeTone): TreeColor =
        when (tone) {
            TreeBadgeTone.Neutral -> brandOnSoft
            TreeBadgeTone.Success -> statusSuccessOnSoft
            TreeBadgeTone.Warning -> statusWarningOnSoft
            TreeBadgeTone.Danger -> statusErrorOnSoft
            TreeBadgeTone.Info -> statusInfoOnSoft
        }

    private companion object {
        /** WCAG 1.4.3 — normal-size text. */
        const val AA_TEXT = 4.5f
    }
}
