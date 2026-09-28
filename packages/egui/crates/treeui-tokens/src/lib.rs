//! TreeUI design tokens.
//!
//! The Rust half of the token layer that `@treeui/tokens` owns. Every value in
//! [`generated`] is emitted from that TypeScript model by `pnpm codegen:native`,
//! which is also what keeps this crate and the stylesheet in agreement — see
//! `packages/tokens/src/rust.ts`.
//!
//! This crate has no dependencies and paints nothing. It carries the contract:
//! the scales, the two shipped [`Palette`]s, and the interaction states the
//! library derives from a palette's semantic colours. The crate that knows how
//! to draw is `treeui-egui`.
//!
//! ```
//! use treeui_tokens::{LIGHT, space};
//!
//! assert_eq!(LIGHT.bg_surface.to_rgba8(), [255, 255, 255, 255]);
//! assert_eq!(space::S4, 16.0);
//! ```

mod generated;

pub use generated::*;

/// Which of the two colour modes a palette is.
///
/// Read it rather than comparing a background's luminance: a product may ship a
/// palette that is light-on-dark without being the dark theme, and the platform
/// chrome (a title bar, a status bar) has to be told which one it is.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ColorMode {
    /// Dark ink on a light canvas.
    Light,
    /// Light ink on a dark canvas.
    Dark,
}

/// An sRGB colour: 8-bit channels with a separate `0.0..=1.0` alpha.
///
/// Alpha stays a float because that is the form the contract carries it in —
/// the focus ring is `0.32` and the scrim is `0.5`, and rounding those to 8 bits
/// at rest would make two colours that differ by one step compare equal.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Color {
    /// Red channel.
    pub r: u8,
    /// Green channel.
    pub g: u8,
    /// Blue channel.
    pub b: u8,
    /// Alpha, `0.0` transparent to `1.0` opaque.
    pub a: f32,
}

impl Color {
    /// The colour as straight (non-premultiplied) 8-bit RGBA.
    #[must_use]
    pub fn to_rgba8(self) -> [u8; 4] {
        [self.r, self.g, self.b, alpha_to_u8(self.a)]
    }

    /// This colour composited over `backdrop`, which is what a translucent
    /// token actually looks like once it is painted.
    ///
    /// Needed because the contract measures contrast against the *result*: the
    /// scrim and the focus ring are specified with alpha, and a check that
    /// reads their nominal channels measures a colour nobody sees.
    #[must_use]
    pub fn over(self, backdrop: Self) -> Self {
        let a = self.a.clamp(0.0, 1.0);
        let mix = |top: u8, bottom: u8| {
            (f32::from(top) * a + f32::from(bottom) * (1.0 - a))
                .round()
                .clamp(0.0, 255.0) as u8
        };

        Self {
            r: mix(self.r, backdrop.r),
            g: mix(self.g, backdrop.g),
            b: mix(self.b, backdrop.b),
            a: backdrop.a,
        }
    }

    /// This colour with `t` of `other` blended into it, in sRGB.
    ///
    /// The same operation `color-mix(in srgb, …)` performs in the stylesheet and
    /// `mixColors` performs in `@treeui/tokens`, with the same argument order —
    /// so `color-mix(in srgb, A 36%, B)` is `a.mix(b, 0.64)`.
    #[must_use]
    pub fn mix(self, other: Self, t: f32) -> Self {
        let t = t.clamp(0.0, 1.0);
        let blend = |a: u8, b: u8| (f32::from(a) + (f32::from(b) - f32::from(a)) * t).round() as u8;

        Self {
            r: blend(self.r, other.r),
            g: blend(self.g, other.g),
            b: blend(self.b, other.b),
            a: self.a + (other.a - self.a) * t,
        }
    }

    /// WCAG relative luminance, `0.0..=1.0`.
    #[must_use]
    pub fn relative_luminance(self) -> f32 {
        fn channel(value: u8) -> f32 {
            let c = f32::from(value) / 255.0;
            if c <= 0.03928 {
                c / 12.92
            } else {
                ((c + 0.055) / 1.055).powf(2.4)
            }
        }

        0.2126 * channel(self.r) + 0.7152 * channel(self.g) + 0.0722 * channel(self.b)
    }

    /// WCAG contrast ratio against `other`, `1.0..=21.0`.
    ///
    /// Present so a product that builds its own [`Palette`] can assert the same
    /// floors the TypeScript validator holds — 4.5:1 for text, 3:1 for a control
    /// boundary — instead of taking them on trust.
    #[must_use]
    pub fn contrast_ratio(self, other: Self) -> f32 {
        let a = self.relative_luminance();
        let b = other.relative_luminance();

        (a.max(b) + 0.05) / (a.min(b) + 0.05)
    }
}

fn alpha_to_u8(alpha: f32) -> u8 {
    (alpha.clamp(0.0, 1.0) * 255.0).round() as u8
}

/// One layer of an elevation step, with its colour already composited over the
/// theme's umbra.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ShadowLayer {
    /// Horizontal offset, in points.
    pub offset_x: f32,
    /// Vertical offset, in points.
    pub offset_y: f32,
    /// Blur radius, in points.
    pub blur: f32,
    /// Spread, in points. Negative values inset the shadow.
    pub spread: f32,
    /// The layer's colour.
    pub color: Color,
}

/// A cubic-bezier timing function, as its four control values.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Easing {
    /// First control point, x.
    pub x1: f32,
    /// First control point, y.
    pub y1: f32,
    /// Second control point, x.
    pub x2: f32,
    /// Second control point, y.
    pub y2: f32,
}

impl Easing {
    /// The curve's value at `t`, `0.0..=1.0`.
    ///
    /// Solved by bisection on x rather than by the cubic formula: the curve is
    /// evaluated once per frame per animating widget, and 20 halvings resolve
    /// far below one display pixel while fitting in a `const`-friendly crate
    /// with no math dependency.
    #[must_use]
    pub fn eval(self, t: f32) -> f32 {
        let t = t.clamp(0.0, 1.0);
        let bezier = |a: f32, b: f32, u: f32| {
            let v = 1.0 - u;
            3.0 * v * v * u * a + 3.0 * v * u * u * b + u * u * u
        };

        let mut low = 0.0_f32;
        let mut high = 1.0_f32;

        for _ in 0..20 {
            // `(low + high) / 2.0` rather than `f32::midpoint`, which is stable
            // only from 1.85 and would raise this crate's MSRV past egui's.
            let mid = (low + high) / 2.0;
            if bezier(self.x1, self.x2, mid) < t {
                low = mid;
            } else {
                high = mid;
            }
        }

        bezier(self.y1, self.y2, (low + high) / 2.0)
    }
}

/// One stop of a gradient.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct GradientStop {
    /// The stop's colour.
    pub color: Color,
    /// An explicit position in percent, or `None` when the gradient spaces its
    /// stops evenly.
    pub position_pct: Option<f32>,
}

/// A linear gradient.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Gradient {
    /// The gradient line's angle in degrees, CSS convention: 0 points up, and
    /// the angle turns clockwise.
    pub angle_deg: f32,
    /// The stops, in order along the gradient line.
    pub stops: &'static [GradientStop],
}

/// The palette for a colour mode.
///
/// A convenience for a consumer that follows the platform rather than pinning a
/// theme.
#[must_use]
pub fn palette(mode: ColorMode) -> Palette {
    match mode {
        ColorMode::Light => LIGHT,
        ColorMode::Dark => DARK,
    }
}
