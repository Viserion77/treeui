//! `TBadge` — a label that states a status.

use egui::{
    Align2, Color32, FontId, Response, Sense, Stroke, StrokeKind, Ui, Vec2, Widget, WidgetInfo,
    WidgetType,
};
use treeui_tokens::{
    border_width, font_size, radius, space, BadgeColors, BadgeTone, Palette, Size, Variant,
};

use crate::theme::{color32, corner, TreeStyle};

/// The smallest a badge may be in the block axis, per size step, in points.
///
/// Not tokens. The stylesheet writes these three as rem literals — `1.5rem`,
/// `1.75rem`, `2rem` against the `16px` root — and there is no `--tree-*`
/// variable behind any of them, so a port either hard-codes them or invents a
/// scale the web does not have. Stated here, named, with the arithmetic shown,
/// rather than spread across a `match` as bare numbers.
const MIN_HEIGHT_SM: f32 = 24.0; // 1.5rem
/// See [`MIN_HEIGHT_SM`].
const MIN_HEIGHT_MD: f32 = 28.0; // 1.75rem
/// See [`MIN_HEIGHT_SM`].
const MIN_HEIGHT_LG: f32 = 32.0; // 2rem

/// A label that states a status.
///
/// ```no_run
/// # use treeui_egui::TBadge;
/// # use treeui_tokens::{BadgeTone, Size, Variant};
/// # fn ui(ui: &mut egui::Ui) {
/// ui.add(TBadge::new("Active"));
///
/// ui.add(TBadge::new("Failed").tone(BadgeTone::Danger));
/// ui.add(TBadge::new("Beta").variant(Variant::Outline).size(Size::Sm));
/// ui.add(TBadge::new("3 open").variant(Variant::Solid).tone(BadgeTone::Info));
/// # }
/// ```
///
/// # What it guarantees
///
/// - A status, not an action. There is no hover, no press, no focus and no
///   disabled state, because there is nothing to do to it — which is also why
///   its tone axis is [`BadgeTone`] and not [`treeui_tokens::Tone`]: no brand,
///   no accent, nothing that would read as something to click.
/// - A label that clears AA on its own fill, for all twenty
///   variant × tone pairings, in both themes.
/// - A reported role and label, so a screen reader reads the status out. A badge
///   that states its meaning in colour alone states it to nobody, so the text is
///   required rather than optional.
#[must_use]
pub struct TBadge {
    label: String,
    variant: Variant,
    tone: BadgeTone,
    size: Size,
    style: Option<TreeStyle>,
}

impl TBadge {
    /// A status with a visible label.
    pub fn new(label: impl Into<String>) -> Self {
        Self {
            label: label.into(),
            variant: Variant::Soft,
            tone: BadgeTone::Neutral,
            size: Size::Md,
            style: None,
        }
    }

    /// Shape: filled, outlined, quiet or tinted.
    ///
    /// `Soft` by default, which is the quietest shape that still carries a hue —
    /// a badge is usually one of many in a table row, and twenty filled pills in
    /// a column read as a warning rather than as data.
    pub const fn variant(mut self, variant: Variant) -> Self {
        self.variant = variant;
        self
    }

    /// Which status the label is stating.
    pub const fn tone(mut self, tone: BadgeTone) -> Self {
        self.tone = tone;
        self
    }

    /// Size step.
    pub const fn size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    /// Paint with this palette instead of the one installed on the context.
    pub const fn style(mut self, style: &TreeStyle) -> Self {
        self.style = Some(*style);
        self
    }

    /// Minimum block size, per the size step.
    const fn min_height(&self) -> f32 {
        match self.size {
            Size::Sm => MIN_HEIGHT_SM,
            Size::Md => MIN_HEIGHT_MD,
            Size::Lg => MIN_HEIGHT_LG,
        }
    }

    /// Label size, per the size step.
    ///
    /// One step below the control scale at every step — `xs / sm / md` against
    /// the button's `sm / md / lg`. A badge sits beside running text and inside
    /// table cells, and matching the text it annotates would make it compete
    /// with it.
    const fn text_size(&self) -> f32 {
        match self.size {
            Size::Sm => font_size::XS,
            Size::Md => font_size::SM,
            Size::Lg => font_size::MD,
        }
    }

    /// Resolve the colours for this variant and tone.
    ///
    /// One lookup into [`Palette::badge_tone`] and nothing else. The badge's
    /// colour table is NOT the button's ten-slot accent set — a badge answers no
    /// pointer, so it has no hover or press step — and it is not this port's to
    /// derive either: it is declared once in `@treeui/tokens`, checked against
    /// the stylesheet by `badge-tone-contract.test.ts`, and generated into
    /// `generated.rs`. This method exists as the seam, not as a second table.
    ///
    /// That the whole signature is `(palette) -> colours`, with no state
    /// argument, IS the contract. There is no state for a caller to reach for and
    /// no hover the port could grow by accident.
    ///
    /// Three things the table does that are easy to get wrong by assuming:
    ///
    /// 1. **`Solid` ink never changes with the tone.** Every tone resolves its
    ///    ink to `brand.contrast`, so a solid success badge wears the ink
    ///    computed for the BRAND fill rather than `status.success.contrast`. In
    ///    the light theme the two are both white; in the dark theme they differ.
    ///    It measures between 5.19:1 and 8.13:1 across both shipped themes, so it
    ///    holds as written — but it holds by coincidence rather than by
    ///    construction, and a product that re-themes `brand.primary` light would
    ///    flip this ink dark under five unchanged fills.
    /// 2. **`Outline` keeps the surface.** No tone reassigns the fill, so a toned
    ///    outline badge is toned ink and a toned edge on the plain surface. That
    ///    is what keeps a column of them from striping.
    /// 3. **`Neutral` is the only tone whose `Ghost` and `Outline` ink differ** —
    ///    `text.muted` for ghost, `text.primary` for outline. A badge with no
    ///    fill, no edge and no hue is a caption, and captions are muted. Every
    ///    status tone uses its own colour for both.
    fn paint(&self, palette: &Palette) -> BadgeColors {
        palette.badge_tone(self.tone, self.variant)
    }
}

impl Widget for TBadge {
    fn ui(self, ui: &mut Ui) -> Response {
        let style = self.style.unwrap_or_else(|| TreeStyle::from_ctx(ui.ctx()));
        let palette = *style.palette();
        let colors = self.paint(&palette);

        let font = FontId::proportional(self.text_size());
        let galley =
            ui.painter()
                .layout_no_wrap(self.label.clone(), font.clone(), color32(colors.text));

        // `line-height: 1` on the web, so the box is the label's own height — the
        // min-height is what gives the pill its air, not the leading.
        let size = Vec2::new(
            galley.size().x + space::S3 * 2.0,
            galley.size().y.max(self.min_height()),
        );

        // `Sense::hover()`: a badge is not a target. It reports itself, and it
        // takes a tooltip, and that is the whole of its interaction.
        let (rect, response) = ui.allocate_exact_size(size, Sense::hover());
        let painter = ui.painter();

        painter.rect(
            rect,
            corner(radius::PILL),
            colors.background.map_or(Color32::TRANSPARENT, color32),
            // The edge is laid out on every variant and only inked on `Outline`,
            // exactly as the stylesheet declares it — so a solid and an outline
            // badge with the same label are the same size.
            Stroke::new(
                border_width::SUBTLE,
                colors.border.map_or(Color32::TRANSPARENT, color32),
            ),
            StrokeKind::Inside,
        );

        painter.text(
            rect.center(),
            Align2::CENTER_CENTER,
            &self.label,
            font,
            color32(colors.text),
        );

        response.widget_info(|| WidgetInfo::labeled(WidgetType::Label, false, &self.label));

        response
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use treeui_tokens::{DARK, LIGHT};

    /// WCAG 1.4.3 — normal-size text.
    const AA_TEXT: f32 = 4.5;

    const VARIANTS: [Variant; 4] = [
        Variant::Solid,
        Variant::Outline,
        Variant::Ghost,
        Variant::Soft,
    ];
    const TONES: [BadgeTone; 5] = [
        BadgeTone::Neutral,
        BadgeTone::Success,
        BadgeTone::Warning,
        BadgeTone::Danger,
        BadgeTone::Info,
    ];

    fn badge(variant: Variant, tone: BadgeTone) -> TBadge {
        TBadge::new("Label").variant(variant).tone(tone)
    }

    #[test]
    fn the_defaults_are_a_soft_neutral_at_the_middle_step() {
        let badge = TBadge::new("Active");
        assert_eq!(badge.variant, Variant::Soft);
        assert_eq!(badge.tone, BadgeTone::Neutral);
        assert_eq!(badge.size, Size::Md);
    }

    #[test]
    fn a_solid_neutral_badge_fills_with_the_brand() {
        let colors = badge(Variant::Solid, BadgeTone::Neutral).paint(&LIGHT);
        assert_eq!(colors.background, Some(LIGHT.brand_primary));
        assert_eq!(colors.text, LIGHT.brand_contrast);
        assert_eq!(colors.border, None);
    }

    #[test]
    fn an_outline_neutral_badge_is_a_surface_pill_with_the_page_ink() {
        let colors = badge(Variant::Outline, BadgeTone::Neutral).paint(&LIGHT);
        assert_eq!(colors.background, Some(LIGHT.bg_surface));
        assert_eq!(colors.text, LIGHT.text_primary);
        assert_eq!(colors.border, Some(LIGHT.border_default));
    }

    #[test]
    fn a_ghost_neutral_badge_is_muted_ink_and_nothing_else() {
        let colors = badge(Variant::Ghost, BadgeTone::Neutral).paint(&LIGHT);
        assert_eq!(colors.background, None);
        assert_eq!(colors.text, LIGHT.text_muted);
        assert_eq!(colors.border, None);
    }

    #[test]
    fn a_soft_neutral_badge_is_the_brand_tint_and_the_ink_the_tint_can_carry() {
        let colors = badge(Variant::Soft, BadgeTone::Neutral).paint(&LIGHT);
        assert_eq!(colors.background, Some(LIGHT.brand_soft));
        // `brand_on_soft`, not `brand_primary`: the ink derived to clear AA on a
        // tint. The default badge in the dark theme is the combination that
        // depends on it.
        assert_eq!(colors.text, LIGHT.brand_on_soft);
        assert_eq!(colors.border, None);
    }

    #[test]
    fn a_status_tone_substitutes_its_whole_family() {
        // `danger` on the badge is the `error` family in the token model, which is
        // the one place the two vocabularies spell the same idea differently.
        assert_eq!(
            badge(Variant::Solid, BadgeTone::Danger)
                .paint(&LIGHT)
                .background,
            Some(LIGHT.status_error)
        );

        let outline = badge(Variant::Outline, BadgeTone::Danger).paint(&LIGHT);
        assert_eq!(
            outline.background,
            Some(LIGHT.bg_surface),
            "the pill stays surface"
        );
        assert_eq!(outline.text, LIGHT.status_error);
        assert_eq!(outline.border, Some(LIGHT.status_error_border));

        assert_eq!(
            badge(Variant::Ghost, BadgeTone::Danger).paint(&LIGHT).text,
            LIGHT.status_error
        );

        let soft = badge(Variant::Soft, BadgeTone::Danger).paint(&LIGHT);
        assert_eq!(soft.background, Some(LIGHT.status_error_soft));
        assert_eq!(soft.text, LIGHT.status_error_on_soft);
    }

    #[test]
    fn every_status_tone_reaches_its_own_family_and_no_other() {
        // Guards against the mapping collapsing onto one hue, which is the failure
        // a table this wide actually has — four tones that all end up `error`.
        for (tone, solid, border, soft, on_soft) in [
            (
                BadgeTone::Success,
                LIGHT.status_success,
                LIGHT.status_success_border,
                LIGHT.status_success_soft,
                LIGHT.status_success_on_soft,
            ),
            (
                BadgeTone::Warning,
                LIGHT.status_warning,
                LIGHT.status_warning_border,
                LIGHT.status_warning_soft,
                LIGHT.status_warning_on_soft,
            ),
            (
                BadgeTone::Danger,
                LIGHT.status_error,
                LIGHT.status_error_border,
                LIGHT.status_error_soft,
                LIGHT.status_error_on_soft,
            ),
            (
                BadgeTone::Info,
                LIGHT.status_info,
                LIGHT.status_info_border,
                LIGHT.status_info_soft,
                LIGHT.status_info_on_soft,
            ),
        ] {
            assert_eq!(
                badge(Variant::Solid, tone).paint(&LIGHT).background,
                Some(solid),
                "{tone:?}"
            );
            assert_eq!(
                badge(Variant::Outline, tone).paint(&LIGHT).border,
                Some(border),
                "{tone:?}"
            );

            let tint = badge(Variant::Soft, tone).paint(&LIGHT);
            assert_eq!(tint.background, Some(soft), "{tone:?}");
            assert_eq!(tint.text, on_soft, "{tone:?}");
        }
    }

    #[test]
    fn only_the_outline_variant_draws_an_edge() {
        for tone in TONES {
            for variant in VARIANTS {
                let colors = badge(variant, tone).paint(&LIGHT);
                if matches!(variant, Variant::Outline) {
                    assert!(colors.border.is_some(), "{variant:?} / {tone:?}");
                } else {
                    assert_eq!(colors.border, None, "{variant:?} / {tone:?}");
                }
            }
        }
    }

    #[test]
    fn only_the_ghost_variant_goes_without_a_fill() {
        for tone in TONES {
            for variant in VARIANTS {
                let colors = badge(variant, tone).paint(&LIGHT);
                if matches!(variant, Variant::Ghost) {
                    assert_eq!(colors.background, None, "{variant:?} / {tone:?}");
                } else {
                    assert!(colors.background.is_some(), "{variant:?} / {tone:?}");
                }
            }
        }
    }

    #[test]
    fn a_badge_has_no_state_axis_at_all() {
        // Not an omission — the assertion IS the contract. `paint` takes a palette
        // and nothing else, so there is no state for a caller to reach for and no
        // hover the port could accidentally grow.
        let colors = badge(Variant::Soft, BadgeTone::Info).paint(&DARK);
        assert_eq!(colors.background, Some(DARK.status_info_soft));
    }

    #[test]
    fn the_geometry_steps_with_the_size() {
        for (size, height, text) in [
            (Size::Sm, MIN_HEIGHT_SM, font_size::XS),
            (Size::Md, MIN_HEIGHT_MD, font_size::SM),
            (Size::Lg, MIN_HEIGHT_LG, font_size::MD),
        ] {
            let badge = TBadge::new("Label").size(size);
            assert_eq!(badge.min_height(), height, "{size:?}");
            assert_eq!(badge.text_size(), text, "{size:?}");
        }
    }

    #[test]
    fn the_min_heights_are_the_stylesheets_rem_literals() {
        // The three values with no token behind them, pinned so a later reader can
        // see what they came from rather than guessing.
        let root = treeui_tokens::ROOT_FONT_SIZE_PX;
        assert_eq!(MIN_HEIGHT_SM, 1.5 * root);
        assert_eq!(MIN_HEIGHT_MD, 1.75 * root);
        assert_eq!(MIN_HEIGHT_LG, 2.0 * root);
    }

    #[test]
    fn every_label_clears_aa_on_its_own_fill_in_both_themes() {
        // The gate that matters. 4 variants x 5 tones x 2 themes, the whole of
        // what this API can express, with no state axis to multiply it — if any
        // pairing puts unreadable ink on a fill, this is where it is caught.
        let mut failures: Vec<String> = Vec::new();

        for (theme, palette) in [("light", LIGHT), ("dark", DARK)] {
            for variant in VARIANTS {
                for tone in TONES {
                    let colors = badge(variant, tone).paint(&palette);
                    // An absent or translucent fill shows the surface behind it, and
                    // the surface is what the ink actually sits on.
                    let behind = colors
                        .background
                        .map_or(palette.bg_surface, |fill| fill.over(palette.bg_surface));
                    let ratio = colors.text.contrast_ratio(behind);

                    if ratio < AA_TEXT {
                        failures.push(format!("{theme}: {variant:?} / {tone:?} = {ratio:.2}:1"));
                    }
                }
            }
        }

        assert!(
            failures.is_empty(),
            "{} pairings below {AA_TEXT}:1:\n  {}",
            failures.len(),
            failures.join("\n  "),
        );
    }
}
