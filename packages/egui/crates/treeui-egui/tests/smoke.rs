//! A render pass over every shape the two new widgets can take.
//!
//! The unit tests in each module measure the COLOUR contract against a palette
//! with no `Ui` in sight, which is what makes them fast and exhaustive. This one
//! covers what they cannot: the container arithmetic. A card shrinks its parent's
//! rect by its own padding and expands it again by the content's `min_rect`, and a
//! nested or empty card is where that arithmetic hands egui an inverted rect if it
//! is wrong.

use treeui_egui::{TBadge, TButton, TCard, TreeStyle};
use treeui_tokens::{BadgeTone, CardVariant, Size, Variant};

#[test]
fn the_widgets_lay_out_and_paint_without_panicking() {
    egui::__run_test_ui(|ui| {
        TreeStyle::dark().install(ui.ctx());

        for variant in [CardVariant::Outline, CardVariant::Soft, CardVariant::Inset] {
            for size in [Size::Sm, Size::Md, Size::Lg] {
                for (interactive, block) in [(false, false), (true, false), (true, true)] {
                    let out = TCard::new()
                        .variant(variant)
                        .size(size)
                        .title("Deployment")
                        .interactive(interactive)
                        .block(block)
                        .show(ui, |ui| {
                            for bv in [
                                Variant::Solid,
                                Variant::Outline,
                                Variant::Ghost,
                                Variant::Soft,
                            ] {
                                for tone in [
                                    BadgeTone::Neutral,
                                    BadgeTone::Success,
                                    BadgeTone::Warning,
                                    BadgeTone::Danger,
                                    BadgeTone::Info,
                                ] {
                                    ui.add(TBadge::new("Status").variant(bv).tone(tone).size(size));
                                }
                            }
                            ui.add(TButton::new("Save"));
                            41
                        });
                    assert_eq!(out.inner, 41);
                    assert!(out.response.rect.width() > 0.0);
                    assert!(out.response.rect.height() > 0.0);
                }
            }
        }

        // An empty card is still its own padding: `space-4` twice, plus the edge.
        let empty = TCard::new().show(ui, |_| ());
        assert!(
            empty.response.rect.height() >= 2.0 * 16.0,
            "{:?}",
            empty.response.rect
        );

        // A bigger size step is a bigger box for the same content.
        let snug = TCard::new().size(Size::Sm).show(ui, |ui| ui.label("x"));
        let roomy = TCard::new().size(Size::Lg).show(ui, |ui| ui.label("x"));
        assert!(roomy.response.rect.height() > snug.response.rect.height());

        // `block` is the web's default and this port's opt-in, so it has to
        // actually claim the width a shrink-to-fit card leaves on the table.
        let fit = TCard::new().show(ui, |ui| ui.label("x"));
        let wide = TCard::new().block(true).show(ui, |ui| ui.label("x"));
        assert!(
            wide.response.rect.width() > fit.response.rect.width(),
            "block: {:?} vs fit: {:?}",
            wide.response.rect,
            fit.response.rect
        );

        TCard::new().show(ui, |ui| {
            TCard::new()
                .variant(CardVariant::Inset)
                .block(true)
                .show(ui, |ui| {
                    ui.label("nested");
                });
        });
    });
}
