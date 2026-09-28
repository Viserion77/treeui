package treeui.compose

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue
import treeui.tokens.TreeCardVariant
import treeui.tokens.TreePalette
import treeui.tokens.TreePalettes

/**
 * `TCard`'s surface resolution, measured.
 *
 * Plain JVM tests on the pure paint function, for the same reason
 * `TButtonPaintTest` is: the part where a wrong token would ship is the
 * resolution, and it does not need an emulator to check.
 */
class TCardPaintTest {
    private val light = TreePalettes.Light
    private val dark = TreePalettes.Dark

    private val variants = TreeCardVariant.entries

    private fun paint(
        variant: TreeCardVariant,
        palette: TreePalette = light,
        interactive: Boolean = false,
        hovered: Boolean = false,
    ) = treeCardPaint(palette, variant, interactive, hovered)

    @Test
    fun `outline is the base surface`() {
        val resolved = paint(TreeCardVariant.Outline)
        assertEquals(light.bgSurface, resolved.fill)
        assertEquals(light.textPrimary, resolved.text)
        assertEquals(light.borderDefault, resolved.border)
    }

    @Test
    fun `soft drops to the subtle surface and keeps its edge`() {
        val resolved = paint(TreeCardVariant.Soft)
        assertEquals(light.bgSubtle, resolved.fill)
        assertEquals(light.borderDefault, resolved.border)
    }

    @Test
    fun `inset is soft's surface with the elevation taken away`() {
        val resolved = paint(TreeCardVariant.Inset)
        assertEquals(light.bgSubtle, resolved.fill)
        assertEquals(light.borderDefault, resolved.border)
    }

    @Test
    fun `inset has no shadow while outline does`() {
        // The distinction the variant exists for: an inset card sits IN the page
        // rather than on it, and a shadow would contradict that.
        assertTrue(paint(TreeCardVariant.Inset).shadow.isEmpty())
        assertEquals(light.shadowXs, paint(TreeCardVariant.Outline).shadow)
        assertEquals(light.shadowXs, paint(TreeCardVariant.Soft).shadow)
    }

    @Test
    fun `an interactive card strengthens its edge and lifts on hover`() {
        val rest = paint(TreeCardVariant.Outline, interactive = true)
        val hover = paint(TreeCardVariant.Outline, interactive = true, hovered = true)

        assertNotEquals(rest.border, hover.border, "the edge has to change, or hover is invisible")
        assertEquals(light.borderStrong, hover.border)
        assertEquals(light.shadowMd, hover.shadow)
        assertEquals(light.shadowXs, rest.shadow)
    }

    @Test
    fun `a plain card does not react to a pointer`() {
        // A card that is not an action must not pretend to be one.
        val rest = paint(TreeCardVariant.Outline)
        val hovered = paint(TreeCardVariant.Outline, hovered = true)
        assertEquals(rest, hovered)
    }

    @Test
    fun `an interactive inset card lifts on hover anyway`() {
        // Not an oversight in the port. In the stylesheet
        // `.t-card--interactive:hover` both outranks `.t-card--inset` on
        // specificity and follows it in source order, so the hover shadow wins.
        val resolved = paint(TreeCardVariant.Inset, interactive = true, hovered = true)
        assertEquals(light.shadowMd, resolved.shadow)
        assertEquals(dark.shadowMd, paint(TreeCardVariant.Inset, dark, interactive = true, hovered = true).shadow)
    }

    @Test
    fun `every surface carries readable ink in both themes`() {
        val failures = mutableListOf<String>()

        for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
            for (variant in variants) {
                for (interactive in listOf(false, true)) {
                    for (hovered in listOf(false, true)) {
                        val resolved = paint(variant, palette, interactive, hovered)
                        val behind = resolved.fill.over(palette.bgSurface)
                        val ratio = resolved.text.contrastRatio(behind)

                        if (ratio < AA_TEXT) {
                            failures +=
                                "$theme: $variant / interactive=$interactive hover=$hovered = " +
                                    "%.2f".format(ratio) + ":1"
                        }
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
    fun `the shadow steps this port draws are single-layer`() {
        // `Modifier.treeShadow` draws the first layer and drops the rest,
        // because Compose has no multi-layer box-shadow. That is free only while
        // every step a card uses is one layer — this is where it stops being.
        for (palette in listOf(light, dark)) {
            assertEquals(1, palette.shadowXs.size)
            assertEquals(1, palette.shadowMd.size)
        }
    }

    @Test
    fun `the card's ring width is the literal the stylesheet writes`() {
        // Guards the divergence against a well-meaning future edit in either
        // direction: the card's ring is 2 because `.t-card--interactive:focus-visible`
        // writes `0 0 0 2px`, while every other focusable surface reads
        // `--tree-focus-ring-width`, which is 4. If the stylesheet is fixed, this
        // is the line that has to change with it.
        assertEquals(2f, CARD_FOCUS_RING_WIDTH_DP)
        assertEquals(4f, FOCUS_RING_WIDTH_DP)
        assertNotEquals(CARD_FOCUS_RING_WIDTH_DP, FOCUS_RING_WIDTH_DP)
    }

    @Test
    fun `halving the blur preserves the ratio between the elevation steps`() {
        // The one property the elevation approximation actually promises.
        for (palette in listOf(light, dark)) {
            val xs = palette.shadowXs.first().blur * SHADOW_BLUR_TO_ELEVATION
            val md = palette.shadowMd.first().blur * SHADOW_BLUR_TO_ELEVATION
            val tokenRatio = palette.shadowMd.first().blur / palette.shadowXs.first().blur
            assertEquals(tokenRatio, md / xs)
        }
    }

    private companion object {
        /** WCAG 1.4.3 — normal-size text. */
        const val AA_TEXT = 4.5f
    }
}
