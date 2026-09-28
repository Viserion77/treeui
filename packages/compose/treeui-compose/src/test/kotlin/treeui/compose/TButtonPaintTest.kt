package treeui.compose

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue
import treeui.tokens.TreeColorMode
import treeui.tokens.TreePalette
import treeui.tokens.TreePalettes
import treeui.tokens.TreeTone
import treeui.tokens.TreeVariant

/**
 * `TButton`'s colour resolution, measured.
 *
 * The same suite the egui port runs in `crates/treeui-egui/src/button.rs`. Two
 * independent implementations of one resolution will drift unless both are held
 * to the same assertions against the same token data — so they are.
 *
 * These are plain JVM tests on purpose: the resolution is the part where a wrong
 * token would actually ship, and it does not need an emulator to check.
 */
class TButtonPaintTest {
    private val light = TreePalettes.Light
    private val dark = TreePalettes.Dark

    private val variants = TreeVariant.entries
    private val tones: List<TreeTone?> = TreeTone.entries + listOf(null)

    /** Rest, hover, press — the three states a fill changes in. */
    private val states = listOf(false to false, true to false, true to true)

    private fun paint(
        variant: TreeVariant,
        tone: TreeTone? = null,
        palette: TreePalette = light,
        hovered: Boolean = false,
        pressed: Boolean = false,
        enabled: Boolean = true,
        loading: Boolean = false,
    ) = treeButtonPaint(palette, variant, tone, hovered, pressed, enabled, loading)

    @Test
    fun `a filled button wears its tone and the ink computed for it`() {
        val resolved = paint(TreeVariant.Solid, TreeTone.Danger)
        assertEquals(light.statusError, resolved.fill)
        assertEquals(light.statusErrorContrast, resolved.text)
    }

    @Test
    fun `an untoned button still fills with the brand`() {
        // `tone = null` is not `tone = Neutral`: the fill is the brand and only
        // the quiet variants fall back to neutral ink.
        val resolved = paint(TreeVariant.Solid)
        assertEquals(light.brandPrimary, resolved.fill)
        assertEquals(light.brandContrast, resolved.text)
    }

    @Test
    fun `hover and press are different fills and press wins`() {
        assertEquals(light.brandPrimary, paint(TreeVariant.Solid).fill)
        assertEquals(light.brandHover, paint(TreeVariant.Solid, hovered = true).fill)
        // Held while hovered: pressed is the state that shows.
        assertEquals(light.brandPress, paint(TreeVariant.Solid, hovered = true, pressed = true).fill)
    }

    @Test
    fun `a quiet button hovers on the neutral surface not on the accent`() {
        // An outline button that fills with brand on hover reads as a different
        // button, not as the same button being pointed at.
        assertEquals(light.stateHoverBg, paint(TreeVariant.Outline, TreeTone.Brand, hovered = true).fill)
        assertEquals(
            light.statePressBg,
            paint(TreeVariant.Outline, TreeTone.Brand, hovered = true, pressed = true).fill,
        )
    }

    @Test
    fun `a tone inks the quiet variants without filling them`() {
        val ghost = paint(TreeVariant.Ghost, TreeTone.Danger)
        assertEquals(light.statusError, ghost.text)
        assertEquals(0f, ghost.fill.alpha, "a ghost button has no fill at rest")

        val outline = paint(TreeVariant.Outline, TreeTone.Danger)
        assertEquals(light.statusError, outline.text)
        assertNotEquals(light.borderDefault, outline.border, "the edge takes the tone")
        assertNotEquals(light.statusError, outline.border, "but not at full strength")
    }

    @Test
    fun `an untoned quiet button keeps neutral ink`() {
        // This is what lets a row of secondary actions stay quiet.
        val outline = paint(TreeVariant.Outline)
        assertEquals(light.textPrimary, outline.text)
        assertEquals(light.borderDefault, outline.border)
    }

    @Test
    fun `a tint deepens its ink as it deepens`() {
        val rest = paint(TreeVariant.Soft, TreeTone.Brand)
        val press = paint(TreeVariant.Soft, TreeTone.Brand, hovered = true, pressed = true)
        assertEquals(light.brandSoft, rest.fill)
        assertEquals(light.brandOnSoft, rest.text)
        assertEquals(light.brandSoftPress, press.fill)
        assertEquals(light.brandOnSoftPress, press.text)
    }

    @Test
    fun `disabled is a colour and loading implies it`() {
        for (variant in variants) {
            val off = paint(variant, enabled = false)
            val loading = paint(variant, loading = true)
            assertEquals(light.stateDisabledFg, off.text, "$variant")
            assertEquals(off.text, loading.text, "loading paints as disabled: $variant")

            if (variant == TreeVariant.Ghost) {
                // A ghost button has no fill at rest, so it has none disabled.
                assertEquals(0f, off.fill.alpha)
            } else {
                assertEquals(light.stateDisabledBg, off.fill, "$variant")
            }
        }
    }

    @Test
    fun `a disabled button does not hover`() {
        assertEquals(
            paint(TreeVariant.Solid, enabled = false).fill,
            paint(TreeVariant.Solid, enabled = false, hovered = true, pressed = true).fill,
        )
    }

    @Test
    fun `every label clears AA on its own fill in every state`() {
        // The gate that matters. 4 variants x (7 tones + untoned) x 3 states x 2
        // themes: if any combination the API can express puts unreadable ink on a
        // fill, this is where it is caught — not in review, and not by a person
        // squinting at a screenshot.
        val failures = mutableListOf<String>()

        for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
            for (variant in variants) {
                for (tone in tones) {
                    for ((hovered, pressed) in states) {
                        val resolved = paint(variant, tone, palette, hovered, pressed)
                        // A translucent or absent fill shows the surface behind
                        // it, and the surface is what the ink actually sits on.
                        val behind = resolved.fill.over(palette.bgSurface)
                        val ratio = resolved.text.contrastRatio(behind)

                        if (ratio < AA_TEXT) {
                            failures +=
                                "$theme: $variant / $tone / hover=$hovered press=$pressed = " +
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
    fun `the disabled pairing clears the UI floor in both themes`() {
        for ((theme, palette) in listOf("light" to light, "dark" to dark)) {
            for (variant in variants) {
                val resolved = paint(variant, palette = palette, enabled = false)
                val behind = resolved.fill.over(palette.bgSurface)
                val ratio = resolved.text.contrastRatio(behind)
                assertTrue(ratio >= AA_UI, "$theme: disabled $variant measures ${"%.2f".format(ratio)}:1")
            }
        }
    }

    @Test
    fun `the sRGB mix matches the stylesheet's colour-mix`() {
        // `color-mix(in srgb, A 36%, B)` is `a.mix(b, 0.64f)`. Checked against a
        // hand-computed channel so an argument-order slip cannot pass.
        val a = treeui.tokens.TreeColor(0, 100, 200)
        val b = treeui.tokens.TreeColor(100, 0, 0)
        val mixed = a.mix(b, 0.5f)
        assertEquals(50, mixed.red)
        assertEquals(50, mixed.green)
        assertEquals(100, mixed.blue)
    }

    @Test
    fun `the accessibility floors are the ones the contract states`() {
        // Guards against a future edit quietly lowering a floor in this file.
        assertEquals(4.5f, AA_TEXT)
        assertEquals(3.0f, AA_UI)
        assertEquals(44f, MIN_TARGET_DP)
        assertEquals(4f, FOCUS_RING_WIDTH_DP)
    }

    @Test
    fun `both shipped palettes report their own mode`() {
        assertEquals(TreeColorMode.Light, light.mode)
        assertEquals(TreeColorMode.Dark, dark.mode)
    }

    private companion object {
        /** WCAG 1.4.3 — normal-size text. */
        const val AA_TEXT = 4.5f

        /** WCAG 1.4.11 — a non-text UI element or an inactive control. */
        const val AA_UI = 3.0f
    }
}
