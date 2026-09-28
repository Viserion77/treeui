//! The palette in scope, and how a TreeUI colour becomes an egui colour.

use egui::{Color32, Context, CornerRadius, Rect, Shadow, Shape, Stroke, Style};
use treeui_tokens::{border_width, radius, Color, ColorMode, Palette, ShadowLayer, DARK, LIGHT};

/// A TreeUI colour as egui's.
///
/// `from_rgba_unmultiplied`, not `from_rgba_premultiplied`: the contract carries
/// straight alpha — the focus halo is the brand at `0.32`, not the brand already
/// multiplied by it — and premultiplying at the boundary would darken every
/// translucent token by its own alpha.
#[must_use]
pub fn color32(color: Color) -> Color32 {
    let [r, g, b, a] = color.to_rgba8();
    Color32::from_rgba_unmultiplied(r, g, b, a)
}

/// A radius token as egui's corner radius.
///
/// `as u8` would be wrong rather than merely lossy: `radius::PILL` is `999`, and
/// the cast wraps it to `231`. Saturating is the honest conversion — egui caps a
/// corner at half the shorter side anyway, so any value at or above 255 renders
/// as the same fully rounded end.
pub(crate) fn corner(radius_px: f32) -> CornerRadius {
    CornerRadius::same(radius_px.round().clamp(0.0, 255.0) as u8)
}

/// One elevation layer as an egui shadow.
///
/// egui carries a shadow's geometry as integers — `[i8; 2]` for the offset, `u8`
/// for blur and spread — so a token's floats are rounded and clamped into range
/// rather than cast. Spread saturates at zero because egui has no inset shadow:
/// `shadow-lg` and `shadow-xl` specify a negative spread, and a cast would wrap
/// it into a shadow many times the size of its caster.
pub(crate) fn shadow(layer: &ShadowLayer, rect: Rect, corner_radius: CornerRadius) -> Shape {
    Shape::from(
        Shadow {
            offset: [
                layer.offset_x.round().clamp(-128.0, 127.0) as i8,
                layer.offset_y.round().clamp(-128.0, 127.0) as i8,
            ],
            blur: layer.blur.round().clamp(0.0, 255.0) as u8,
            spread: layer.spread.round().clamp(0.0, 255.0) as u8,
            color: color32(layer.color),
        }
        .as_shape(rect, corner_radius),
    )
}

/// The palette a TreeUI widget paints with.
///
/// Install it once on the [`Context`] and every widget below picks it up, which
/// is this port's answer to the cascade on the web and to `TreeTheme` in the
/// Compose port. A single widget can still override it with
/// [`crate::TButton::style`].
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct TreeStyle {
    palette: Palette,
}

impl TreeStyle {
    /// A style over an explicit palette — including one a product built itself.
    #[must_use]
    pub const fn new(palette: Palette) -> Self {
        Self { palette }
    }

    /// The light theme TreeUI ships.
    #[must_use]
    pub const fn light() -> Self {
        Self::new(LIGHT)
    }

    /// The dark theme TreeUI ships.
    #[must_use]
    pub const fn dark() -> Self {
        Self::new(DARK)
    }

    /// The theme for a colour mode, for an app that follows the platform.
    #[must_use]
    pub const fn for_mode(mode: ColorMode) -> Self {
        match mode {
            ColorMode::Light => Self::light(),
            ColorMode::Dark => Self::dark(),
        }
    }

    /// The palette this style carries.
    #[must_use]
    pub const fn palette(&self) -> &Palette {
        &self.palette
    }

    /// Make this the style every TreeUI widget on `ctx` uses, and bring egui's
    /// own widgets onto the same palette.
    ///
    /// The second half matters more than it looks: an app is never all TreeUI on
    /// day one, and a plain `ui.button()` sitting beside a `TButton` in egui's
    /// default grey is how a design system starts looking optional.
    pub fn install(self, ctx: &Context) {
        ctx.data_mut(|data| data.insert_temp(style_key(), self));

        let mut style = (*ctx.style()).clone();
        self.apply(&mut style);
        ctx.set_style(style);
    }

    /// The style installed on `ctx`, or the light theme.
    ///
    /// Falling back to light rather than to egui's default is deliberate: a
    /// widget that renders in the wrong theme is a visible bug a developer will
    /// fix in a minute, while a widget that renders in no theme at all looks
    /// like the library is broken.
    #[must_use]
    pub fn from_ctx(ctx: &Context) -> Self {
        ctx.data(|data| data.get_temp::<Self>(style_key()))
            .unwrap_or_else(Self::light)
    }

    /// Map the palette onto egui's own visuals.
    pub fn apply(&self, style: &mut Style) {
        let palette = &self.palette;
        let visuals = &mut style.visuals;

        visuals.dark_mode = matches!(palette.mode, ColorMode::Dark);
        visuals.panel_fill = color32(palette.bg_primary);
        visuals.window_fill = color32(palette.bg_surface);
        visuals.extreme_bg_color = color32(palette.bg_subtle);
        visuals.faint_bg_color = color32(palette.bg_subtle);
        visuals.override_text_color = Some(color32(palette.text_primary));
        visuals.hyperlink_color = color32(palette.brand_primary);
        visuals.selection.bg_fill = color32(palette.state_selected_bg);
        visuals.selection.stroke =
            Stroke::new(border_width::SUBTLE, color32(palette.state_selected_border));

        let corner = CornerRadius::same(radius::MD as u8);
        let edge = |color: Color| Stroke::new(border_width::SUBTLE, color32(color));

        for (widget, fill, stroke) in [
            (
                &mut visuals.widgets.noninteractive,
                palette.bg_surface,
                palette.border_default,
            ),
            (
                &mut visuals.widgets.inactive,
                palette.bg_surface,
                palette.border_interactive,
            ),
            (
                &mut visuals.widgets.hovered,
                palette.state_hover_bg,
                palette.border_strong,
            ),
            (
                &mut visuals.widgets.active,
                palette.state_press_bg,
                palette.border_strong,
            ),
            (
                &mut visuals.widgets.open,
                palette.bg_subtle,
                palette.border_strong,
            ),
        ] {
            widget.bg_fill = color32(fill);
            widget.weak_bg_fill = color32(fill);
            widget.bg_stroke = edge(stroke);
            widget.fg_stroke = Stroke::new(border_width::SUBTLE, color32(palette.text_primary));
            widget.corner_radius = corner;
        }
    }
}

/// Keyed on a private id so an app cannot collide with it by accident.
fn style_key() -> egui::Id {
    egui::Id::new("treeui::style")
}
