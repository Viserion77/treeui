//! `TButton` — the action surface.

use egui::{
    Align2, FontId, Rect, Response, Sense, Stroke, StrokeKind, Ui, Vec2, Widget, WidgetInfo,
    WidgetType,
};
use treeui_tokens::{
    border_width, control_size, font_size, radius, space, Color, Palette, Size, Tone, ToneColors,
    Variant,
};

use crate::theme::{color32, corner, TreeStyle};

/// The smallest a pointer target may be, in points.
///
/// Not a token, because it is not yet one: the web writes `44px` as a literal in
/// the stylesheet. It is the WCAG 2.5.5 floor and TreeUI treats it as a
/// requirement rather than a suggestion, so it is stated here rather than left
/// to each widget.
const MIN_TARGET: f32 = 44.0;

/// Width of the focus halo, in points. The stylesheet's `--tree-focus-ring-width`,
/// which also lives outside the token model today.
const FOCUS_RING_WIDTH: f32 = 4.0;

/// What one resolved state paints with.
struct Paint {
    fill: Color,
    text: Color,
    border: Color,
}

/// An action.
///
/// ```no_run
/// # use treeui_egui::TButton;
/// # use treeui_tokens::{Size, Tone, Variant};
/// # fn ui(ui: &mut egui::Ui) {
/// if ui.add(TButton::new("Save changes")).clicked() { /* … */ }
///
/// ui.add(TButton::new("Delete").variant(Variant::Ghost).tone(Tone::Danger));
/// ui.add(TButton::new("Saving…").loading(true));
/// ui.add(TButton::new("Continue").size(Size::Lg).block(true));
/// # }
/// ```
///
/// # What it guarantees
///
/// - A visible rest, hover, press, focus and disabled state. Disabled is a
///   measured colour, never an opacity — an opacity cannot be checked for
///   contrast, so a faded label cannot be proven readable.
/// - A pointer target of at least [`MIN_TARGET`] in both axes, which for the
///   small size is larger than the button's own box. Opt out with
///   [`Self::dense`] only where input is known to be precise.
/// - A focus indicator in two marks: an opaque edge that carries the 3:1 the
///   WCAG asks of an indicator, and a translucent halo that carries the
///   emphasis. The halo alone measures 1.59:1 on the light canvas, so a port
///   that drew only the halo would ship an indicator nobody can find.
/// - A reported role and label, so a screen reader names it.
#[must_use]
pub struct TButton {
    label: String,
    variant: Variant,
    tone: Option<Tone>,
    size: Size,
    enabled: bool,
    loading: bool,
    loading_label: String,
    block: bool,
    dense: bool,
    style: Option<TreeStyle>,
}

impl TButton {
    /// An action with a visible label.
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            variant: Variant::Solid,
            tone: None,
            size: Size::Md,
            enabled: true,
            loading: false,
            loading_label: "Loading".to_owned(),
            block: false,
            dense: false,
            style: None,
        }
    }

    /// Shape: filled, outlined, quiet or tinted.
    pub const fn variant(mut self, variant: Variant) -> Self {
        self.variant = variant;
        self
    }

    /// Colour axis, orthogonal to the variant.
    ///
    /// Left unset, the fill and the tint are the brand while the quiet variants
    /// keep neutral ink — which is how a row of secondary actions stays quiet.
    /// Set, it also inks `Outline` and `Ghost`, so a destructive action can sit
    /// in that row saying what it is without outweighing it.
    pub const fn tone(mut self, tone: Tone) -> Self {
        self.tone = Some(tone);
        self
    }

    /// Size step.
    pub const fn size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    /// Whether the action can be taken.
    pub const fn enabled(mut self, enabled: bool) -> Self {
        self.enabled = enabled;
        self
    }

    /// An action already in flight. Implies disabled, and is announced.
    pub const fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// What assistive technology hears while [`Self::loading`]. Localise it.
    pub fn loading_label(mut self, label: impl Into<String>) -> Self {
        self.loading_label = label.into();
        self
    }

    /// Stretch to the full width available.
    pub const fn block(mut self, block: bool) -> Self {
        self.block = block;
        self
    }

    /// Drop the [`MIN_TARGET`] floor and lay the button out at its own height.
    ///
    /// An opt-OUT rather than an opt-in, on purpose: a toolbar on a desktop with
    /// a mouse is a real case for tighter rhythm, but the floor has to be what
    /// you get without asking, or it is not a floor.
    pub const fn dense(mut self, dense: bool) -> Self {
        self.dense = dense;
        self
    }

    /// Paint with this palette instead of the one installed on the context.
    pub const fn style(mut self, style: &TreeStyle) -> Self {
        self.style = Some(*style);
        self
    }

    /// Inline padding, per the size step.
    const fn padding(&self) -> f32 {
        match self.size {
            Size::Sm => space::S3,
            Size::Md => space::S4,
            Size::Lg => space::S5,
        }
    }

    const fn height(&self) -> f32 {
        match self.size {
            Size::Sm => control_size::SM,
            Size::Md => control_size::MD,
            Size::Lg => control_size::LG,
        }
    }

    const fn text_size(&self) -> f32 {
        match self.size {
            Size::Sm => font_size::SM,
            Size::Md => font_size::MD,
            Size::Lg => font_size::LG,
        }
    }

    /// Resolve the colours for the state this button is actually in.
    ///
    /// The quiet variants hover and press on the NEUTRAL state surfaces rather
    /// than on the accent: an outline button that fills with brand on hover
    /// reads as a different button, not as the same button being pointed at.
    fn paint(&self, palette: &Palette, hovered: bool, pressed: bool) -> Paint {
        let tone = palette.tone(self.tone.unwrap_or(Tone::Brand));
        let inked = self.tone.is_some();

        if !self.enabled || self.loading {
            let ghost = matches!(self.variant, Variant::Ghost);
            return Paint {
                fill: if ghost {
                    TRANSPARENT
                } else {
                    palette.state_disabled_bg
                },
                text: palette.state_disabled_fg,
                border: if ghost {
                    TRANSPARENT
                } else {
                    palette.state_disabled_border
                },
            };
        }

        match self.variant {
            Variant::Solid => Paint {
                fill: step(
                    tone.accent,
                    tone.accent_hover,
                    tone.accent_press,
                    hovered,
                    pressed,
                ),
                text: tone.accent_contrast,
                border: TRANSPARENT,
            },
            Variant::Soft => Paint {
                fill: step(
                    tone.accent_soft,
                    tone.accent_soft_hover,
                    tone.accent_soft_press,
                    hovered,
                    pressed,
                ),
                text: step(
                    tone.accent_on_soft,
                    tone.accent_on_soft_hover,
                    tone.accent_on_soft_press,
                    hovered,
                    pressed,
                ),
                border: TRANSPARENT,
            },
            Variant::Outline => Paint {
                fill: step(
                    palette.bg_surface,
                    palette.state_hover_bg,
                    palette.state_press_bg,
                    hovered,
                    pressed,
                ),
                text: if inked {
                    quiet_ink(&tone, hovered, pressed)
                } else {
                    palette.text_primary
                },
                border: if inked {
                    // `color-mix(in srgb, accent 36%, border-default)` — the edge
                    // takes the tone without becoming a filled block.
                    tone.accent.mix(palette.border_default, 0.64)
                } else if hovered || pressed {
                    palette.border_strong
                } else {
                    palette.border_default
                },
            },
            Variant::Ghost => Paint {
                fill: if hovered || pressed {
                    step(
                        TRANSPARENT,
                        palette.state_hover_bg,
                        palette.state_press_bg,
                        hovered,
                        pressed,
                    )
                } else {
                    TRANSPARENT
                },
                text: if inked {
                    quiet_ink(&tone, hovered, pressed)
                } else {
                    palette.text_primary
                },
                border: TRANSPARENT,
            },
        }
    }
}

/// Ink for a toned `Outline` or `Ghost`, which deepens as its surface does.
///
/// The same rule `Soft` already follows — "the tint deepens and its ink deepens
/// with it, because a tint has only so much headroom" — applied to the neutral
/// state surfaces the quiet variants press on.
///
/// It is not cosmetic. `state.press-bg` is the surface mixed with 12% ink, which
/// takes it past `bg.subtle` — the darkest surface the colour contract measures
/// a tone against. Holding a toned quiet button while the ink stays at
/// `accent` measures between 4.11:1 and 4.45:1 across the seven tones and both
/// themes: below AA in 22 of the combinations this API can express. Stepping the
/// ink with the surface clears all of them.
///
/// The web stylesheet has the same shortfall today and the same mechanism for
/// the fix: `--tree-button-text-hover` and `--tree-button-text-press` already
/// exist and already default to the rest ink; only the quiet variants never
/// reassign them.
const fn quiet_ink(tone: &ToneColors, hovered: bool, pressed: bool) -> Color {
    step(
        tone.accent,
        tone.accent_hover,
        tone.accent_press,
        hovered,
        pressed,
    )
}

const TRANSPARENT: Color = Color {
    r: 0,
    g: 0,
    b: 0,
    a: 0.0,
};

/// Press wins over hover, because a held button is being pressed.
const fn step(rest: Color, hover: Color, press: Color, hovered: bool, pressed: bool) -> Color {
    if pressed {
        press
    } else if hovered {
        hover
    } else {
        rest
    }
}

impl Widget for TButton {
    fn ui(self, ui: &mut Ui) -> Response {
        let style = self.style.unwrap_or_else(|| TreeStyle::from_ctx(ui.ctx()));
        let palette = *style.palette();

        let font = FontId::proportional(self.text_size());
        let galley = ui.painter().layout_no_wrap(
            self.label.clone(),
            font.clone(),
            color32(palette.text_primary),
        );

        let box_height = self.height();
        let box_width = if self.block {
            ui.available_width()
        } else {
            galley.size().x + self.padding() * 2.0
        };

        // The pointer target, which for the small size is larger than the box.
        let target = if self.dense {
            Vec2::new(box_width, box_height)
        } else {
            Vec2::new(box_width.max(MIN_TARGET), box_height.max(MIN_TARGET))
        };

        let interactive = self.enabled && !self.loading;
        let (outer, response) = ui.allocate_at_least(
            target,
            if interactive {
                Sense::click()
            } else {
                Sense::hover()
            },
        );

        let visual = Rect::from_center_size(outer.center(), Vec2::new(box_width, box_height));

        let paint = self.paint(
            &palette,
            response.hovered(),
            response.is_pointer_button_down_on(),
        );

        let box_corner = corner(radius::MD);
        let painter = ui.painter();

        // The halo goes down first so the button's own edge sits on top of it.
        if response.has_focus() {
            painter.rect_filled(
                visual.expand(FOCUS_RING_WIDTH),
                corner(radius::MD + FOCUS_RING_WIDTH),
                color32(palette.focus_ring),
            );
        }

        painter.rect(
            visual,
            box_corner,
            color32(paint.fill),
            Stroke::new(border_width::SUBTLE, color32(paint.border)),
            StrokeKind::Inside,
        );

        // The opaque half of the focus treatment — the mark that carries the 3:1.
        if response.has_focus() {
            painter.rect_stroke(
                visual,
                box_corner,
                Stroke::new(border_width::STRONG, color32(palette.brand_primary)),
                StrokeKind::Inside,
            );
        }

        painter.text(
            visual.center(),
            Align2::CENTER_CENTER,
            &self.label,
            font,
            color32(paint.text),
        );

        // What a screen reader is told. While loading, the announcement is the
        // loading label rather than the caption, because the caption describes
        // an action that is no longer available to take.
        let announced = if self.loading {
            format!("{}, {}", self.label, self.loading_label)
        } else {
            self.label.clone()
        };
        response.widget_info(|| WidgetInfo::labeled(WidgetType::Button, interactive, &announced));

        response
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use egui::CornerRadius;
    use treeui_tokens::{ColorMode, DARK, LIGHT};

    /// WCAG 1.4.3 — normal-size text.
    const AA_TEXT: f32 = 4.5;

    const VARIANTS: [Variant; 4] = [
        Variant::Solid,
        Variant::Outline,
        Variant::Ghost,
        Variant::Soft,
    ];
    const TONES: [Tone; 7] = [
        Tone::Neutral,
        Tone::Brand,
        Tone::Accent,
        Tone::Success,
        Tone::Warning,
        Tone::Danger,
        Tone::Info,
    ];
    /// Rest, hover, press — the three states a fill changes in.
    const STATES: [(bool, bool); 3] = [(false, false), (true, false), (true, true)];

    fn button(variant: Variant) -> TButton {
        TButton::new("Label").variant(variant)
    }

    #[test]
    fn a_filled_button_wears_its_tone_and_the_ink_computed_for_it() {
        let paint = button(Variant::Solid)
            .tone(Tone::Danger)
            .paint(&LIGHT, false, false);
        assert_eq!(paint.fill, LIGHT.status_error);
        assert_eq!(paint.text, LIGHT.status_error_contrast);
    }

    #[test]
    fn an_untoned_button_still_fills_with_the_brand() {
        // `tone` unset is not `tone = neutral`: the fill is the brand and only
        // the quiet variants fall back to neutral ink.
        let paint = button(Variant::Solid).paint(&LIGHT, false, false);
        assert_eq!(paint.fill, LIGHT.brand_primary);
        assert_eq!(paint.text, LIGHT.brand_contrast);
    }

    #[test]
    fn hover_and_press_are_different_fills_and_press_wins() {
        let solid = button(Variant::Solid);
        assert_eq!(solid.paint(&LIGHT, false, false).fill, LIGHT.brand_primary);
        assert_eq!(solid.paint(&LIGHT, true, false).fill, LIGHT.brand_hover);
        // Held while hovered: pressed is the state that shows.
        assert_eq!(solid.paint(&LIGHT, true, true).fill, LIGHT.brand_press);
    }

    #[test]
    fn a_quiet_button_hovers_on_the_neutral_surface_not_on_the_accent() {
        // An outline button that fills with brand on hover reads as a different
        // button, not as the same button being pointed at.
        let outline = button(Variant::Outline).tone(Tone::Brand);
        assert_eq!(
            outline.paint(&LIGHT, true, false).fill,
            LIGHT.state_hover_bg
        );
        assert_eq!(outline.paint(&LIGHT, true, true).fill, LIGHT.state_press_bg);
    }

    #[test]
    fn a_tone_inks_the_quiet_variants_without_filling_them() {
        let ghost = button(Variant::Ghost)
            .tone(Tone::Danger)
            .paint(&LIGHT, false, false);
        assert_eq!(ghost.text, LIGHT.status_error);
        assert_eq!(ghost.fill.a, 0.0, "a ghost button has no fill at rest");

        let outline = button(Variant::Outline)
            .tone(Tone::Danger)
            .paint(&LIGHT, false, false);
        assert_eq!(outline.text, LIGHT.status_error);
        assert_ne!(
            outline.border, LIGHT.border_default,
            "the edge takes the tone"
        );
        assert_ne!(
            outline.border, LIGHT.status_error,
            "but not at full strength"
        );
    }

    #[test]
    fn an_untoned_quiet_button_keeps_neutral_ink() {
        // This is what lets a row of secondary actions stay quiet.
        let outline = button(Variant::Outline).paint(&LIGHT, false, false);
        assert_eq!(outline.text, LIGHT.text_primary);
        assert_eq!(outline.border, LIGHT.border_default);
    }

    #[test]
    fn a_tint_deepens_its_ink_as_it_deepens() {
        let soft = button(Variant::Soft).tone(Tone::Brand);
        let rest = soft.paint(&LIGHT, false, false);
        let press = soft.paint(&LIGHT, true, true);
        assert_eq!(rest.fill, LIGHT.brand_soft);
        assert_eq!(rest.text, LIGHT.brand_on_soft);
        assert_eq!(press.fill, LIGHT.brand_soft_press);
        assert_eq!(press.text, LIGHT.brand_on_soft_press);
    }

    #[test]
    fn disabled_is_a_colour_and_loading_implies_it() {
        for variant in VARIANTS {
            let off = button(variant).enabled(false).paint(&LIGHT, false, false);
            let loading = button(variant).loading(true).paint(&LIGHT, false, false);
            assert_eq!(off.text, LIGHT.state_disabled_fg, "{variant:?}");
            assert_eq!(
                loading.text, off.text,
                "loading paints as disabled: {variant:?}"
            );

            if matches!(variant, Variant::Ghost) {
                // A ghost button has no fill at rest, so it has none disabled.
                assert_eq!(off.fill.a, 0.0);
            } else {
                assert_eq!(off.fill, LIGHT.state_disabled_bg, "{variant:?}");
            }
        }
    }

    #[test]
    fn a_disabled_button_does_not_hover() {
        let off = button(Variant::Solid).enabled(false);
        assert_eq!(
            off.paint(&LIGHT, true, true).fill,
            off.paint(&LIGHT, false, false).fill,
        );
    }

    #[test]
    fn every_label_clears_aa_on_its_own_fill_in_every_state() {
        // The gate that matters. 4 variants x 7 tones x 3 states x 2 themes, plus
        // the untoned form of each variant: if any combination the API can
        // express puts unreadable ink on a fill, this is where it is caught —
        // not in review, and not by a person squinting at a screenshot.
        let mut failures: Vec<String> = Vec::new();

        for (theme, palette) in [("light", LIGHT), ("dark", DARK)] {
            for variant in VARIANTS {
                for tone in TONES.into_iter().map(Some).chain([None]) {
                    for (hovered, pressed) in STATES {
                        let mut candidate = button(variant);
                        if let Some(tone) = tone {
                            candidate = candidate.tone(tone);
                        }

                        let paint = candidate.paint(&palette, hovered, pressed);
                        // A translucent or absent fill shows the surface behind it,
                        // and the surface is what the ink actually sits on.
                        let behind = paint.fill.over(palette.bg_surface);
                        let ratio = paint.text.contrast_ratio(behind);

                        if ratio < AA_TEXT {
                            failures.push(format!(
                                "{theme}: {variant:?} / {tone:?} / hover={hovered} press={pressed} = {ratio:.2}:1",
                            ));
                        }
                    }
                }
            }
        }

        assert!(
            failures.is_empty(),
            "{} combinations below {AA_TEXT}:1:\n  {}",
            failures.len(),
            failures.join("\n  "),
        );
    }

    #[test]
    fn the_disabled_pairing_clears_the_ui_floor_in_both_themes() {
        for (theme, palette) in [("light", LIGHT), ("dark", DARK)] {
            for variant in VARIANTS {
                let paint = button(variant).enabled(false).paint(&palette, false, false);
                let behind = paint.fill.over(palette.bg_surface);
                let ratio = paint.text.contrast_ratio(behind);
                assert!(
                    ratio >= 3.0,
                    "{theme}: disabled {variant:?} measures {ratio:.2}:1"
                );
            }
        }
    }

    #[test]
    fn a_pill_radius_does_not_wrap_around_the_corner_type() {
        // `radius::PILL` is 999 and `as u8` would silently render it as 231.
        assert_eq!(corner(treeui_tokens::radius::PILL), CornerRadius::same(255));
        assert_eq!(corner(treeui_tokens::radius::MD), CornerRadius::same(10));
    }

    #[test]
    fn the_style_falls_back_to_light_rather_than_to_nothing() {
        assert_eq!(TreeStyle::light().palette().mode, ColorMode::Light);
        assert_eq!(
            TreeStyle::for_mode(ColorMode::Dark).palette().mode,
            ColorMode::Dark
        );
    }
}
