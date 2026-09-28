package treeui.tokens

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotEquals
import kotlin.test.assertTrue

/**
 * The colour contract, measured on the shipped palettes.
 *
 * These are not tests of the generator — a generator bug that produced a
 * plausible wrong colour would pass a round-trip check. They are the WCAG
 * floors `contract.ts` holds on the TypeScript side, asserted again here
 * against the values this module actually carries, so a bad regeneration is
 * caught by measurement rather than by review.
 *
 * The Rust port asserts the same list in `crates/treeui-tokens/tests/contract.rs`.
 * Three ecosystems, one set of floors.
 */
class ContractTest {
    private val themes = listOf("light" to TreePalettes.Light, "dark" to TreePalettes.Dark)

    private fun surfaces(palette: TreePalette) = listOf(
        "bg.primary" to palette.bgPrimary,
        "bg.surface" to palette.bgSurface,
        "bg.subtle" to palette.bgSubtle,
    )

    private fun assertClears(ink: TreeColor, background: TreeColor, floor: Float, what: String) {
        val ratio = ink.contrastRatio(background)
        assertTrue(ratio >= floor, "$what measures ${"%.2f".format(ratio)}:1, below the $floor:1 floor")
    }

    @Test
    fun `body and muted ink clear AA on every surface`() {
        for ((theme, palette) in themes) {
            for ((name, background) in surfaces(palette)) {
                assertClears(palette.textPrimary, background, AA_TEXT, "$theme: text.primary on $name")
                assertClears(palette.textMuted, background, AA_TEXT, "$theme: text.muted on $name")
            }
        }
    }

    @Test
    fun `status and brand ink clear AA on every surface`() {
        for ((theme, palette) in themes) {
            for ((name, background) in surfaces(palette)) {
                val inks = listOf(
                    "brand.primary" to palette.brandPrimary,
                    "status.error" to palette.statusError,
                    "status.success" to palette.statusSuccess,
                    "status.warning" to palette.statusWarning,
                    "status.info" to palette.statusInfo,
                )
                for ((role, ink) in inks) {
                    assertClears(ink, background, AA_TEXT, "$theme: $role on $name")
                }
            }
        }
    }

    @Test
    fun `a filled button label clears AA on its own fill`() {
        for ((theme, palette) in themes) {
            assertClears(palette.brandContrast, palette.brandPrimary, AA_TEXT, "$theme: brand.contrast on brand.primary")
            assertClears(palette.accentContrast, palette.accentPrimary, AA_TEXT, "$theme: accent.contrast on accent.primary")
        }
    }

    @Test
    fun `a soft button label clears AA on its own tint`() {
        for ((theme, palette) in themes) {
            assertClears(palette.brandOnSoft, palette.brandSoft, AA_TEXT, "$theme: brand.on-soft on brand.soft")
        }
    }

    @Test
    fun `disabled is a colour and stays at the UI floor`() {
        // The reason this token exists rather than an opacity: `opacity` is not
        // a colour, so a faded label cannot be measured. This can.
        for ((theme, palette) in themes) {
            assertClears(
                palette.stateDisabledFg,
                palette.stateDisabledBg,
                AA_UI,
                "$theme: state.disabled-fg on state.disabled-bg",
            )
        }
    }

    @Test
    fun `a control boundary clears the UI floor on every surface`() {
        for ((theme, palette) in themes) {
            for ((name, background) in surfaces(palette)) {
                assertClears(palette.borderInteractive, background, AA_UI, "$theme: border.interactive on $name")
            }
        }
    }

    @Test
    fun `every interaction state is visibly different from its base`() {
        for ((theme, palette) in themes) {
            val distinctions = listOf(
                Triple("brand.hover vs brand.primary", palette.brandHover to palette.brandPrimary, MIN_STATE_DELTA),
                Triple("brand.press vs brand.primary", palette.brandPress to palette.brandPrimary, MIN_STATE_DELTA),
                Triple("brand.press vs brand.hover", palette.brandPress to palette.brandHover, 1.05f),
                Triple("state.hover-bg vs bg.surface", palette.stateHoverBg to palette.bgSurface, 1.04f),
                Triple("state.press-bg vs state.hover-bg", palette.statePressBg to palette.stateHoverBg, 1.04f),
                Triple("state.disabled-bg vs bg.surface", palette.stateDisabledBg to palette.bgSurface, 1.04f),
            )

            for ((what, pair, floor) in distinctions) {
                val ratio = pair.first.contrastRatio(pair.second)
                assertTrue(
                    ratio >= floor,
                    "$theme: $what measures ${"%.3f".format(ratio)}:1, which reads as the same colour (floor $floor)",
                )
            }
        }
    }

    @Test
    fun `the focus halo is a perceptible change to every surface`() {
        // The halo carries alpha, so its nominal channels are not what anyone
        // sees; compositing is the only measurement that means anything.
        //
        // The floor here is perceptibility, not WCAG 1.4.11. At `0.32` the halo
        // alone measures 1.59:1 over the light canvas, well under the 3:1 a
        // focus indicator is asked for, which is why a TreeUI focus treatment
        // is TWO marks: an opaque edge that carries the 3:1 (see the test
        // below) and this halo, which carries the emphasis.
        for ((theme, palette) in themes) {
            for ((name, background) in surfaces(palette)) {
                val painted = palette.focusRing.over(background)
                val ratio = painted.contrastRatio(background)
                assertTrue(
                    ratio >= 1.04f,
                    "$theme: the focus halo over $name measures ${"%.3f".format(ratio)}:1 — it is the surface colour",
                )
            }
        }
    }

    @Test
    fun `the focus edge carries the UI floor on every surface`() {
        for ((theme, palette) in themes) {
            for ((name, background) in surfaces(palette)) {
                assertClears(palette.brandPrimary, background, AA_UI, "$theme: the focus edge on $name")
            }
        }
    }

    @Test
    fun `the chart palette is visible on its own surface`() {
        for ((theme, palette) in themes) {
            val series = listOf(
                palette.chart1, palette.chart2, palette.chart3, palette.chart4,
                palette.chart5, palette.chart6, palette.chart7, palette.chart8,
            )
            series.forEachIndexed { index, ink ->
                assertClears(ink, palette.bgSurface, AA_UI, "$theme: chart.${index + 1} on bg.surface")
            }
        }
    }

    @Test
    fun `the spacing scale only ever grows`() {
        val scale = listOf(
            "0" to TreeTokens.Space.s0, "1" to TreeTokens.Space.s1, "2" to TreeTokens.Space.s2,
            "3" to TreeTokens.Space.s3, "4" to TreeTokens.Space.s4, "5" to TreeTokens.Space.s5,
            "6" to TreeTokens.Space.s6, "8" to TreeTokens.Space.s8, "12" to TreeTokens.Space.s12,
            "16" to TreeTokens.Space.s16,
        )

        scale.zipWithNext { (before, a), (after, b) ->
            assertTrue(b > a, "space-$after ($b) is not larger than space-$before ($a)")
        }
    }

    @Test
    fun `the type scale only ever grows`() {
        // `base` is deliberately absent: it is an alias of `md`, so including it
        // would assert that a scale step grows past itself.
        val scale = listOf(
            "xs" to TreeTokens.FontSize.xs, "sm" to TreeTokens.FontSize.sm,
            "md" to TreeTokens.FontSize.md, "lg" to TreeTokens.FontSize.lg,
            "xl" to TreeTokens.FontSize.xl, "2xl" to TreeTokens.FontSize.xl2,
            "3xl" to TreeTokens.FontSize.xl3, "4xl" to TreeTokens.FontSize.xl4,
            "5xl" to TreeTokens.FontSize.xl5,
        )

        scale.zipWithNext { (before, a), (after, b) ->
            assertTrue(b > a, "font-size-$after ($b) is not larger than font-size-$before ($a)")
        }

        assertTrue(sameLength(TreeTokens.FontSize.base, TreeTokens.FontSize.md), "base is the alias of md")
    }

    @Test
    fun `an elevation step is tinted by its own theme`() {
        // A slate umbra on a dark surface is invisible; the dark theme's is
        // near-black. Emitting one shadow for both themes is the bug this
        // catches.
        assertNotEquals(
            TreePalettes.Light.shadowXs.first().color,
            TreePalettes.Dark.shadowXs.first().color,
            "both themes ship the same shadow colour, so one of them is wrong",
        )
        assertEquals(0, TreePalettes.Dark.shadowRgb.red, "the dark umbra is near-black")
        assertEquals(0, TreePalettes.Dark.shadowRgb.green, "the dark umbra is near-black")
        assertEquals(0, TreePalettes.Dark.shadowRgb.blue, "the dark umbra is near-black")
    }

    @Test
    fun `the packed colour round-trips through ARGB`() {
        val ring = TreePalettes.Light.focusRing
        assertEquals(ring.alphaByte, (ring.argb ushr 24) and 0xff)
        assertEquals(ring.red, (ring.argb shr 16) and 0xff)
        assertEquals(ring.green, (ring.argb shr 8) and 0xff)
        assertEquals(ring.blue, ring.argb and 0xff)
    }

    @Test
    fun `an easing curve starts and ends where it should`() {
        val standard = TreeTokens.Easing.standard
        assertTrue(standard.eval(0f) < 0.001f, "an easing curve starts at 0")
        assertTrue(standard.eval(1f) > 0.999f, "an easing curve ends at 1")
    }

    private companion object {
        /** WCAG 1.4.3 — normal-size text. */
        const val AA_TEXT = 4.5f

        /** WCAG 1.4.11 — a non-text UI element or an inactive control. */
        const val AA_UI = 3.0f

        /** Below this, a fill change is not a state change. Mirrors `MIN_STATE_DELTA`. */
        const val MIN_STATE_DELTA = 1.12f
    }
}
