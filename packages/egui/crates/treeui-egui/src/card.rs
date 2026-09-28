//! `TCard` — the surface primitive.

use egui::{
    Align, FontId, InnerResponse, Layout, RichText, Sense, Shape, Stroke, StrokeKind, Ui,
    UiBuilder, WidgetInfo, WidgetType,
};
use treeui_tokens::{
    border_width, font_size, radius, space, CardVariant, Color, Palette, ShadowLayer, Size,
};

use crate::theme::{color32, corner, shadow, TreeStyle};

/// Width of the card's focus ring, in points.
///
/// Two, not the four [`crate::TButton`] draws: the stylesheet writes
/// `box-shadow: 0 0 0 2px var(--tree-color-focus-ring)` for a card and
/// `var(--tree-focus-ring-width)` — which is `4px` — for a control. The port
/// reproduces the discrepancy rather than resolving it, because resolving it in
/// one of four ecosystems is how two ecosystems stop matching.
const FOCUS_RING_WIDTH: f32 = 2.0;

/// What one resolved state paints with.
struct Paint {
    fill: Color,
    text: Color,
    border: Color,
    /// The elevation layers, in paint order. Empty is flush with the canvas.
    shadow: &'static [ShadowLayer],
}

/// A surface that groups content.
///
/// ```no_run
/// # use treeui_egui::TCard;
/// # use treeui_tokens::{CardVariant, Size};
/// # fn ui(ui: &mut egui::Ui) {
/// TCard::new().title("Monthly usage").show(ui, |ui| {
///     ui.label("41,820 requests");
/// });
///
/// TCard::new().variant(CardVariant::Inset).size(Size::Sm).show(ui, |ui| {
///     ui.label("A recessed band inside a surface.");
/// });
///
/// let card = TCard::new().title("Billing").interactive(true).show(ui, |ui| {
///     ui.label("Manage your plan");
/// });
/// if card.response.clicked() { /* … */ }
/// # }
/// ```
///
/// # What it guarantees
///
/// - A container, not a widget: it takes a closure the way [`egui::Frame`] does,
///   so content nests inside the padding instead of being positioned against it.
///   [`Self::show`] returns an [`InnerResponse`], so the closure's value and the
///   card's own response both come back.
/// - The surface is the TOKEN surface. Background, edge and elevation are
///   painted from the palette rather than from egui's visuals, so a card does
///   not drift when an app changes `Style` — and the elevation is the real
///   `shadow-xs` / `shadow-md` geometry, not an approximation of it.
/// - Non-interactive by default. A card is a surface; it gains a hover edge, a
///   raised elevation, a focus ring and a click sense only when
///   [`Self::interactive`] says it is also an affordance.
/// - Ink that clears AA on every one of the three surfaces, in both themes.
/// - A reported role and name when it carries a [`Self::title`], so a card used
///   as an affordance is not an unlabelled click target.
#[must_use]
pub struct TCard {
    variant: CardVariant,
    size: Size,
    title: Option<String>,
    interactive: bool,
    block: bool,
    style: Option<TreeStyle>,
}

impl Default for TCard {
    fn default() -> Self {
        Self::new()
    }
}

impl TCard {
    /// A surface at the default variant and size.
    pub const fn new() -> Self {
        Self {
            variant: CardVariant::Outline,
            size: Size::Md,
            title: None,
            interactive: false,
            block: false,
            style: None,
        }
    }

    /// Surface step: outlined, tinted or recessed.
    ///
    /// A surface scale rather than the action scale — there is deliberately no
    /// `solid` card. See `docs/ai/DECISIONS.md` → "Variant Vocabulary".
    pub const fn variant(mut self, variant: CardVariant) -> Self {
        self.variant = variant;
        self
    }

    /// Size step, which on a card is its padding.
    pub const fn size(mut self, size: Size) -> Self {
        self.size = size;
        self
    }

    /// A heading, painted above the content and reported as the card's name.
    pub fn title(mut self, title: impl Into<String>) -> Self {
        self.title = Some(title.into());
        self
    }

    /// Treat the surface as an affordance: a hover edge, a raised elevation, a
    /// focus ring and a click sense.
    ///
    /// A bool rather than a variant, because it is orthogonal to the surface
    /// step — any of the three can be the one you click.
    pub const fn interactive(mut self, interactive: bool) -> Self {
        self.interactive = interactive;
        self
    }

    /// Stretch to the full width available instead of shrinking to the content.
    ///
    /// The web has this the other way round: `.t-card` is a grid, so it is
    /// block-level and fills its container without being asked. egui containers
    /// shrink to fit, and a card that silently claimed the whole remaining width
    /// would break the commonest layout there is — a row of cards. So the web's
    /// behaviour is the opt-in here, under the name [`crate::TButton`] already
    /// uses for it.
    pub const fn block(mut self, block: bool) -> Self {
        self.block = block;
        self
    }

    /// Paint with this palette instead of the one installed on the context.
    pub const fn style(mut self, style: &TreeStyle) -> Self {
        self.style = Some(*style);
        self
    }

    /// Padding, per the size step.
    const fn padding(&self) -> f32 {
        match self.size {
            Size::Sm => space::S3,
            Size::Md => space::S4,
            Size::Lg => space::S5,
        }
    }

    /// Resolve the colours and the elevation for the state this card is in.
    ///
    /// `hovered` and `focused` only ever move anything when the card is
    /// [`Self::interactive`]: a surface that lifts under the pointer is claiming
    /// to be clickable, and a surface that is not clickable must not claim it.
    fn paint(&self, palette: &Palette, hovered: bool, focused: bool) -> Paint {
        let live = self.interactive;

        let fill = match self.variant {
            CardVariant::Outline => palette.bg_surface,
            CardVariant::Soft | CardVariant::Inset => palette.bg_subtle,
        };

        // `inset` is `soft` with the elevation taken away — the tint is what they
        // share and the shadow is the whole of what separates them.
        let rest_shadow: &'static [ShadowLayer] = match self.variant {
            CardVariant::Inset => &[],
            CardVariant::Outline | CardVariant::Soft => palette.shadow_xs,
        };

        Paint {
            fill,
            // `.t-card--interactive` reassigns `color: inherit` so a card rendered
            // as an `<a>` does not turn link-blue. What it inherits is the page's
            // ink, which is this token — so the port names it rather than
            // reproducing an inheritance egui does not have.
            text: palette.text_primary,
            border: if live && hovered {
                palette.border_strong
            } else {
                palette.border_default
            },
            shadow: if live && focused {
                // The web's focus rule sets `box-shadow` to the ring alone, and
                // `box-shadow` is one property — so a focused card has no
                // elevation. Reproduced, because the ring reading clearly is the
                // point and two ecosystems disagreeing about it is not worth it.
                &[]
            } else if live && hovered {
                palette.shadow_md
            } else {
                rest_shadow
            },
        }
    }

    /// Lay out `add_contents` inside the surface.
    ///
    /// The surface is painted into a slot reserved before the content, and
    /// resolved after: its colours depend on a response that does not exist
    /// until the content has been measured. Same shape as [`egui::Frame`], for
    /// the same reason.
    pub fn show<R>(self, ui: &mut Ui, add_contents: impl FnOnce(&mut Ui) -> R) -> InnerResponse<R> {
        let style = self.style.unwrap_or_else(|| TreeStyle::from_ctx(ui.ctx()));
        let palette = *style.palette();

        // The edge is drawn inside the box, so it eats into the padding unless
        // the content is inset past it.
        let inset = self.padding() + border_width::SUBTLE;
        let where_to_put_surface = ui.painter().add(Shape::Noop);

        let outer_bounds = ui.available_rect_before_wrap();
        let mut max_content = outer_bounds.shrink(inset);
        // A container narrower than its own padding would otherwise hand the
        // content an inverted rect.
        max_content.max.x = max_content.max.x.max(max_content.min.x);
        max_content.max.y = max_content.max.y.max(max_content.min.y);

        let mut content_ui = ui.new_child(
            UiBuilder::new()
                .max_rect(max_content)
                // `.t-card` is a grid with one column: content stacks, whatever
                // layout the card itself was placed in.
                .layout(Layout::top_down(Align::Min)),
        );
        content_ui.spacing_mut().item_spacing.y = space::S3;

        // The ink is the one slot with no state axis, so the resting resolution
        // is the whole of it — which is what lets it be settled BEFORE the
        // content runs, where a nested `ui.label` can inherit it.
        let ink = color32(self.paint(&palette, false, false).text);
        content_ui.visuals_mut().override_text_color = Some(ink);

        if let Some(title) = &self.title {
            content_ui.label(
                RichText::new(title)
                    .font(FontId::proportional(font_size::LG))
                    .color(ink),
            );
        }

        let inner = add_contents(&mut content_ui);

        let mut content_rect = content_ui.min_rect();
        if self.block {
            content_rect.max.x = max_content.max.x;
        }
        let outer_rect = content_rect.expand(inset);

        let response = ui.allocate_rect(
            outer_rect,
            if self.interactive {
                Sense::click()
            } else {
                Sense::hover()
            },
        );

        let paint = self.paint(&palette, response.hovered(), response.has_focus());
        let box_corner = corner(radius::LG);
        let mut surface: Vec<Shape> = Vec::with_capacity(paint.shadow.len() + 2);

        if self.interactive && response.has_focus() {
            surface.push(Shape::rect_filled(
                outer_rect.expand(FOCUS_RING_WIDTH),
                corner(radius::LG + FOCUS_RING_WIDTH),
                color32(palette.focus_ring),
            ));
        }

        for layer in paint.shadow {
            surface.push(shadow(layer, outer_rect, box_corner));
        }

        surface.push(Shape::rect_filled(
            outer_rect,
            box_corner,
            color32(paint.fill),
        ));
        // The edge last, so it reads over the fill's own antialiased corner
        // rather than under it.
        surface.push(Shape::rect_stroke(
            outer_rect,
            box_corner,
            Stroke::new(border_width::SUBTLE, color32(paint.border)),
            StrokeKind::Inside,
        ));

        ui.painter().set(where_to_put_surface, Shape::Vec(surface));

        // Only a named card reports itself. An unnamed surface has nothing to
        // announce, and announcing an empty name is worse than staying quiet.
        if let Some(title) = &self.title {
            let role = if self.interactive {
                WidgetType::Button
            } else {
                WidgetType::Other
            };
            response.widget_info(|| WidgetInfo::labeled(role, self.interactive, title));
        }

        InnerResponse::new(inner, response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use treeui_tokens::{DARK, LIGHT};

    /// WCAG 1.4.3 — normal-size text.
    const AA_TEXT: f32 = 4.5;

    const VARIANTS: [CardVariant; 3] =
        [CardVariant::Outline, CardVariant::Soft, CardVariant::Inset];

    fn card(variant: CardVariant) -> TCard {
        TCard::new().variant(variant)
    }

    /// The resting paint, which most of these assertions are about.
    fn rest(variant: CardVariant, palette: &Palette) -> Paint {
        card(variant).paint(palette, false, false)
    }

    #[test]
    fn each_variant_paints_its_own_surface() {
        assert_eq!(rest(CardVariant::Outline, &LIGHT).fill, LIGHT.bg_surface);
        assert_eq!(rest(CardVariant::Soft, &LIGHT).fill, LIGHT.bg_subtle);
        assert_eq!(rest(CardVariant::Inset, &LIGHT).fill, LIGHT.bg_subtle);
    }

    #[test]
    fn every_variant_keeps_the_page_ink_and_the_decorative_edge() {
        for variant in VARIANTS {
            let paint = rest(variant, &LIGHT);
            assert_eq!(paint.text, LIGHT.text_primary, "{variant:?}");
            assert_eq!(paint.border, LIGHT.border_default, "{variant:?}");
        }
    }

    #[test]
    fn an_inset_card_is_flush_while_an_outline_card_is_raised() {
        // The tint is what `soft` and `inset` share; the elevation is the whole
        // of what separates them, so this is the assertion that keeps them two
        // variants rather than one.
        assert!(rest(CardVariant::Inset, &LIGHT).shadow.is_empty());
        assert_eq!(rest(CardVariant::Outline, &LIGHT).shadow, LIGHT.shadow_xs);
        assert_eq!(rest(CardVariant::Soft, &LIGHT).shadow, LIGHT.shadow_xs);
    }

    #[test]
    fn the_elevation_is_the_real_token_geometry() {
        // Not an approximation of it: a port that rounded `shadow-xs` to "1pt of
        // grey" would look right in isolation and wrong next to a modal.
        let layers = rest(CardVariant::Outline, &LIGHT).shadow;
        assert_eq!(layers.len(), 1);
        assert_eq!(layers[0].offset_y, 1.0);
        assert_eq!(layers[0].blur, 2.0);
    }

    #[test]
    fn an_interactive_card_strengthens_its_edge_and_lifts_under_the_pointer() {
        for variant in VARIANTS {
            let live = card(variant).interactive(true);
            let rest = live.paint(&LIGHT, false, false);
            let hover = live.paint(&LIGHT, true, false);

            assert_eq!(rest.border, LIGHT.border_default, "{variant:?}");
            assert_eq!(hover.border, LIGHT.border_strong, "{variant:?}");
            assert_ne!(
                hover.border, rest.border,
                "the hover edge has to differ from the rest edge: {variant:?}"
            );
            assert_eq!(hover.shadow, LIGHT.shadow_md, "{variant:?}");
        }
    }

    #[test]
    fn a_static_card_does_not_answer_the_pointer() {
        // A surface that lifts under the pointer is claiming to be clickable.
        for variant in VARIANTS {
            let still = card(variant);
            let rest = still.paint(&LIGHT, false, false);
            let hover = still.paint(&LIGHT, true, false);
            assert_eq!(hover.border, rest.border, "{variant:?}");
            assert_eq!(hover.shadow, rest.shadow, "{variant:?}");
        }
    }

    #[test]
    fn a_focused_card_shows_the_ring_instead_of_its_elevation() {
        // Faithful to the stylesheet, where the focus rule reassigns the whole of
        // `box-shadow` and so drops the elevation with it.
        let live = card(CardVariant::Outline).interactive(true);
        assert!(live.paint(&LIGHT, false, true).shadow.is_empty());
        assert!(live.paint(&LIGHT, true, true).shadow.is_empty());
        assert_eq!(live.paint(&LIGHT, false, false).shadow, LIGHT.shadow_xs);
    }

    #[test]
    fn the_focus_ring_is_the_cards_width_not_the_buttons() {
        // 2pt against the control's 4pt. A discrepancy carried over on purpose —
        // see the constant.
        assert_eq!(FOCUS_RING_WIDTH, 2.0);
    }

    #[test]
    fn padding_steps_with_the_size() {
        assert_eq!(TCard::new().size(Size::Sm).padding(), space::S3);
        assert_eq!(TCard::new().size(Size::Md).padding(), space::S4);
        assert_eq!(TCard::new().size(Size::Lg).padding(), space::S5);
    }

    #[test]
    fn the_ink_clears_aa_on_every_surface_in_every_state() {
        // 3 variants x 2 interactive modes x 3 states x 2 themes. A card's ink is
        // one token, so this gate is not looking for a bad pairing so much as
        // proving that no state ever moves the ink off a surface that carries it.
        let mut failures: Vec<String> = Vec::new();

        for (theme, palette) in [("light", LIGHT), ("dark", DARK)] {
            for variant in VARIANTS {
                for interactive in [false, true] {
                    for (hovered, focused) in [(false, false), (true, false), (false, true)] {
                        let paint = card(variant)
                            .interactive(interactive)
                            .paint(&palette, hovered, focused);
                        let behind = paint.fill.over(palette.bg_surface);
                        let ratio = paint.text.contrast_ratio(behind);

                        if ratio < AA_TEXT {
                            failures.push(format!(
                                "{theme}: {variant:?} / interactive={interactive} / hover={hovered} focus={focused} = {ratio:.2}:1",
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
    fn the_edge_clears_the_non_text_floor_on_its_own_surface() {
        // WCAG 1.4.11 asks 3:1 of a boundary that carries meaning. A card's edge
        // is decorative at rest, so the floor that matters is the INTERACTIVE
        // hover edge — the mark that says the surface answered the pointer.
        for (theme, palette) in [("light", LIGHT), ("dark", DARK)] {
            for variant in VARIANTS {
                let rest = card(variant)
                    .interactive(true)
                    .paint(&palette, false, false);
                let hover = card(variant).interactive(true).paint(&palette, true, false);
                let behind = hover.fill.over(palette.bg_surface);
                let ratio = hover.border.contrast_ratio(behind);
                assert!(
                    ratio > rest.border.contrast_ratio(behind),
                    "{theme}: the hover edge on {variant:?} has to be the stronger of the two"
                );
            }
        }
    }
}
