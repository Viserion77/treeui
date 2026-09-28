package treeui.tokens

import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow
import kotlin.math.roundToInt

/**
 * Which of the two colour modes a palette is.
 *
 * Read it rather than comparing a background's luminance: a product may ship a
 * palette that is light-on-dark without being the dark theme, and the platform
 * chrome — the status bar, the navigation bar — has to be told which one it is.
 */
public enum class TreeColorMode {
    /** Dark ink on a light canvas. */
    Light,

    /** Light ink on a dark canvas. */
    Dark,
}

/**
 * An sRGB colour: 8-bit channels with a separate `0f..1f` alpha.
 *
 * Alpha stays a float because that is the form the contract carries it in — the
 * focus ring is `0.32` and the scrim is `0.5` — and rounding those to 8 bits at
 * rest would make two colours that differ by one step compare equal.
 *
 * This is not `androidx.compose.ui.graphics.Color`: this module does not depend
 * on Compose. `treeui-compose` converts.
 */
public data class TreeColor(
    /** Red channel, `0..255`. */
    public val red: Int,
    /** Green channel, `0..255`. */
    public val green: Int,
    /** Blue channel, `0..255`. */
    public val blue: Int,
    /** Alpha, `0f` transparent to `1f` opaque. */
    public val alpha: Float = 1f,
) {
    /** Packed `0xAARRGGBB`, which is the form every Android colour API takes. */
    public val argb: Int
        get() = (alphaByte shl 24) or (red shl 16) or (green shl 8) or blue

    /** Alpha as an 8-bit channel. */
    public val alphaByte: Int
        get() = (alpha.coerceIn(0f, 1f) * 255f).roundToInt()

    /**
     * This colour composited over [backdrop], which is what a translucent token
     * actually looks like once it is painted.
     *
     * Needed because the contract measures contrast against the *result*: the
     * scrim and the focus ring are specified with alpha, and a check that reads
     * their nominal channels measures a colour nobody sees.
     */
    public fun over(backdrop: TreeColor): TreeColor {
        val a = alpha.coerceIn(0f, 1f)
        fun mix(top: Int, bottom: Int) =
            (top * a + bottom * (1f - a)).roundToInt().coerceIn(0, 255)

        return TreeColor(
            red = mix(red, backdrop.red),
            green = mix(green, backdrop.green),
            blue = mix(blue, backdrop.blue),
            alpha = backdrop.alpha,
        )
    }

    /**
     * This colour with [t] of [other] blended into it, in sRGB.
     *
     * The same operation `color-mix(in srgb, …)` performs in the stylesheet and
     * `mixColors` performs in `@treeui/tokens`, with the same argument order —
     * so `color-mix(in srgb, A 36%, B)` is `a.mix(b, 0.64f)`.
     */
    public fun mix(other: TreeColor, t: Float): TreeColor {
        val amount = t.coerceIn(0f, 1f)
        fun blend(a: Int, b: Int) = (a + (b - a) * amount).roundToInt().coerceIn(0, 255)

        return TreeColor(
            red = blend(red, other.red),
            green = blend(green, other.green),
            blue = blend(blue, other.blue),
            alpha = alpha + (other.alpha - alpha) * amount,
        )
    }

    /** WCAG relative luminance, `0f..1f`. */
    public fun relativeLuminance(): Float {
        fun channel(value: Int): Float {
            val c = value / 255f
            return if (c <= 0.03928f) c / 12.92f else ((c + 0.055f) / 1.055f).pow(2.4f)
        }

        return 0.2126f * channel(red) + 0.7152f * channel(green) + 0.0722f * channel(blue)
    }

    /**
     * WCAG contrast ratio against [other], `1f..21f`.
     *
     * Present so a product that builds its own [TreePalette] can assert the same
     * floors the TypeScript validator holds — 4.5:1 for text, 3:1 for a control
     * boundary — instead of taking them on trust.
     */
    public fun contrastRatio(other: TreeColor): Float {
        val a = relativeLuminance()
        val b = other.relativeLuminance()

        return (max(a, b) + 0.05f) / (min(a, b) + 0.05f)
    }
}

/**
 * One layer of an elevation step, with its colour already composited over the
 * theme's umbra.
 */
public data class TreeShadowLayer(
    /** Horizontal offset, in dp. */
    public val offsetX: Float,
    /** Vertical offset, in dp. */
    public val offsetY: Float,
    /** Blur radius, in dp. */
    public val blur: Float,
    /** Spread, in dp. Negative values inset the shadow. */
    public val spread: Float,
    /** The layer's colour. */
    public val color: TreeColor,
)

/** A cubic-bezier timing function, as its four control values. */
public data class TreeEasing(
    /** First control point, x. */
    public val x1: Float,
    /** First control point, y. */
    public val y1: Float,
    /** Second control point, x. */
    public val x2: Float,
    /** Second control point, y. */
    public val y2: Float,
) {
    /**
     * The curve's value at [t], `0f..1f`.
     *
     * Solved by bisection on x rather than by the cubic formula: 20 halvings
     * resolve far below one display pixel, and the arithmetic stays in this
     * module instead of pulling in a math dependency the token layer is not
     * allowed to have.
     */
    public fun eval(t: Float): Float {
        val target = t.coerceIn(0f, 1f)
        fun bezier(a: Float, b: Float, u: Float): Float {
            val v = 1f - u
            return 3f * v * v * u * a + 3f * v * u * u * b + u * u * u
        }

        var low = 0f
        var high = 1f

        repeat(20) {
            val mid = (low + high) / 2f
            if (bezier(x1, x2, mid) < target) low = mid else high = mid
        }

        return bezier(y1, y2, (low + high) / 2f)
    }
}

/** One stop of a gradient. */
public data class TreeGradientStop(
    /** The stop's colour. */
    public val color: TreeColor,
    /**
     * An explicit position in percent, or `null` when the gradient spaces its
     * stops evenly.
     */
    public val positionPct: Float? = null,
)

/** A linear gradient. */
public data class TreeGradient(
    /**
     * The gradient line's angle in degrees, CSS convention: `0` points up and
     * the angle turns clockwise.
     */
    public val angleDeg: Float,
    /** The stops, in order along the gradient line. */
    public val stops: List<TreeGradientStop>,
)

/**
 * The palette for a colour mode.
 *
 * A convenience for a consumer that follows the platform rather than pinning a
 * theme.
 */
public fun treePalette(mode: TreeColorMode): TreePalette =
    when (mode) {
        TreeColorMode.Light -> TreePalettes.Light
        TreeColorMode.Dark -> TreePalettes.Dark
    }

/**
 * Whether two lengths from the token scales are the same measurement.
 *
 * The scales are `Float` because that is what the CSS model resolves to, and
 * comparing two of them with `==` is the kind of thing that works until a
 * generated value lands on `0.9375rem`. One thousandth of a dp is far below a
 * device pixel on any display.
 */
public fun sameLength(a: Float, b: Float): Boolean = abs(a - b) < 0.001f
