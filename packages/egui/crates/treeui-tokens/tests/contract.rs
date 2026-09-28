//! The colour contract, measured on the shipped palettes.
//!
//! These are not tests of the generator — a generator bug that produced a
//! plausible wrong colour would pass a round-trip check. They are the WCAG
//! floors `contract.ts` holds on the TypeScript side, asserted again here
//! against the values this crate actually carries, so a bad regeneration is
//! caught by measurement rather than by review.

use treeui_tokens::{font_size, space, Color, Palette, DARK, LIGHT};

/// WCAG 1.4.3 — normal-size text.
const AA_TEXT: f32 = 4.5;
/// WCAG 1.4.11 — a non-text UI element or an inactive control.
const AA_UI: f32 = 3.0;
/// Below this, a fill change is not a state change. Mirrors `MIN_STATE_DELTA`.
const MIN_STATE_DELTA: f32 = 1.12;

fn themes() -> [(&'static str, Palette); 2] {
    [("light", LIGHT), ("dark", DARK)]
}

fn surfaces(palette: &Palette) -> [(&'static str, Color); 3] {
    [
        ("bg.primary", palette.bg_primary),
        ("bg.surface", palette.bg_surface),
        ("bg.subtle", palette.bg_subtle),
    ]
}

fn assert_clears(ink: Color, background: Color, floor: f32, what: &str) {
    let ratio = ink.contrast_ratio(background);
    assert!(
        ratio >= floor,
        "{what} measures {ratio:.2}:1, below the {floor}:1 floor",
    );
}

#[test]
fn body_and_muted_ink_clear_aa_on_every_surface() {
    for (theme, palette) in themes() {
        for (name, background) in surfaces(&palette) {
            assert_clears(
                palette.text_primary,
                background,
                AA_TEXT,
                &format!("{theme}: text.primary on {name}"),
            );
            assert_clears(
                palette.text_muted,
                background,
                AA_TEXT,
                &format!("{theme}: text.muted on {name}"),
            );
        }
    }
}

#[test]
fn status_and_brand_ink_clear_aa_on_every_surface() {
    for (theme, palette) in themes() {
        for (name, background) in surfaces(&palette) {
            for (role, ink) in [
                ("brand.primary", palette.brand_primary),
                ("status.error", palette.status_error),
                ("status.success", palette.status_success),
                ("status.warning", palette.status_warning),
                ("status.info", palette.status_info),
            ] {
                assert_clears(
                    ink,
                    background,
                    AA_TEXT,
                    &format!("{theme}: {role} on {name}"),
                );
            }
        }
    }
}

#[test]
fn a_filled_button_label_clears_aa_on_its_own_fill() {
    for (theme, palette) in themes() {
        assert_clears(
            palette.brand_contrast,
            palette.brand_primary,
            AA_TEXT,
            &format!("{theme}: brand.contrast on brand.primary"),
        );
        assert_clears(
            palette.accent_contrast,
            palette.accent_primary,
            AA_TEXT,
            &format!("{theme}: accent.contrast on accent.primary"),
        );
    }
}

#[test]
fn a_soft_button_label_clears_aa_on_its_own_tint() {
    for (theme, palette) in themes() {
        assert_clears(
            palette.brand_on_soft,
            palette.brand_soft,
            AA_TEXT,
            &format!("{theme}: brand.on-soft on brand.soft"),
        );
    }
}

#[test]
fn disabled_is_a_colour_and_stays_at_the_ui_floor() {
    // The reason this token exists rather than an opacity: `opacity` is not a
    // colour, so a faded label cannot be measured. This can.
    for (theme, palette) in themes() {
        assert_clears(
            palette.state_disabled_fg,
            palette.state_disabled_bg,
            AA_UI,
            &format!("{theme}: state.disabled-fg on state.disabled-bg"),
        );
    }
}

#[test]
fn a_control_boundary_clears_the_ui_floor_on_every_surface() {
    for (theme, palette) in themes() {
        for (name, background) in surfaces(&palette) {
            assert_clears(
                palette.border_interactive,
                background,
                AA_UI,
                &format!("{theme}: border.interactive on {name}"),
            );
        }
    }
}

#[test]
fn every_interaction_state_is_visibly_different_from_its_base() {
    for (theme, palette) in themes() {
        for (what, state, base, floor) in [
            (
                "brand.hover vs brand.primary",
                palette.brand_hover,
                palette.brand_primary,
                MIN_STATE_DELTA,
            ),
            (
                "brand.press vs brand.primary",
                palette.brand_press,
                palette.brand_primary,
                MIN_STATE_DELTA,
            ),
            (
                "brand.press vs brand.hover",
                palette.brand_press,
                palette.brand_hover,
                1.05,
            ),
            (
                "state.hover-bg vs bg.surface",
                palette.state_hover_bg,
                palette.bg_surface,
                1.04,
            ),
            (
                "state.press-bg vs state.hover-bg",
                palette.state_press_bg,
                palette.state_hover_bg,
                1.04,
            ),
            (
                "state.disabled-bg vs bg.surface",
                palette.state_disabled_bg,
                palette.bg_surface,
                1.04,
            ),
        ] {
            let ratio = state.contrast_ratio(base);
            assert!(
                ratio >= floor,
                "{theme}: {what} measures {ratio:.3}:1, which reads as the same colour (floor {floor})",
            );
        }
    }
}

#[test]
fn the_focus_halo_is_a_perceptible_change_to_every_surface() {
    // The ring carries alpha, so its nominal channels are not what anyone sees;
    // compositing is the only measurement that means anything.
    //
    // The floor here is perceptibility, not WCAG 1.4.11. At `0.32` the halo
    // alone measures 1.59:1 over the light canvas, well under the 3:1 a focus
    // indicator is asked for, which is why a TreeUI focus treatment is TWO
    // marks: an opaque edge that carries the 3:1 (see the test below) and this
    // halo, which carries the emphasis. A port that drew only the halo would
    // ship an indicator nobody can find.
    for (theme, palette) in themes() {
        for (name, background) in surfaces(&palette) {
            let painted = palette.focus_ring.over(background);
            let ratio = painted.contrast_ratio(background);
            assert!(
                ratio >= 1.04,
                "{theme}: the focus halo over {name} measures {ratio:.3}:1 — it is the same colour as the surface",
            );
        }
    }
}

#[test]
fn the_focus_edge_carries_the_ui_floor_on_every_surface() {
    // The opaque half of the focus treatment. This is the mark that has to be
    // findable, so it is the one held at 3:1.
    for (theme, palette) in themes() {
        for (name, background) in surfaces(&palette) {
            assert_clears(
                palette.brand_primary,
                background,
                AA_UI,
                &format!("{theme}: the focus edge on {name}"),
            );
        }
    }
}

#[test]
fn the_chart_palette_is_visible_on_its_own_surface() {
    for (theme, palette) in themes() {
        for (index, ink) in [
            palette.chart_1,
            palette.chart_2,
            palette.chart_3,
            palette.chart_4,
            palette.chart_5,
            palette.chart_6,
            palette.chart_7,
            palette.chart_8,
        ]
        .into_iter()
        .enumerate()
        {
            assert_clears(
                ink,
                palette.bg_surface,
                AA_UI,
                &format!("{theme}: chart.{} on bg.surface", index + 1),
            );
        }
    }
}

#[test]
fn the_spacing_scale_only_ever_grows() {
    let scale = [
        ("0", space::S0),
        ("1", space::S1),
        ("2", space::S2),
        ("3", space::S3),
        ("4", space::S4),
        ("5", space::S5),
        ("6", space::S6),
        ("8", space::S8),
        ("12", space::S12),
        ("16", space::S16),
    ];

    for pair in scale.windows(2) {
        let (before, a) = pair[0];
        let (after, b) = pair[1];
        assert!(
            b > a,
            "space-{after} ({b}) is not larger than space-{before} ({a})"
        );
    }
}

#[test]
fn the_type_scale_only_ever_grows() {
    // `base` is deliberately absent: it is an alias of `md`, so including it
    // would assert that a scale step grows past itself.
    let scale = [
        ("xs", font_size::XS),
        ("sm", font_size::SM),
        ("md", font_size::MD),
        ("lg", font_size::LG),
        ("xl", font_size::XL),
        ("2xl", font_size::XL2),
        ("3xl", font_size::XL3),
        ("4xl", font_size::XL4),
        ("5xl", font_size::XL5),
    ];

    for pair in scale.windows(2) {
        let (before, a) = pair[0];
        let (after, b) = pair[1];
        assert!(
            b > a,
            "font-size-{after} ({b}) is not larger than font-size-{before} ({a})"
        );
    }

    assert_eq!(font_size::BASE, font_size::MD, "base is the alias of md");
}

#[test]
fn an_elevation_step_is_tinted_by_its_own_theme() {
    // A slate umbra on a dark surface is invisible; the dark theme's is
    // near-black. Emitting one shadow for both themes is the bug this catches.
    assert_ne!(
        LIGHT.shadow_xs[0].color, DARK.shadow_xs[0].color,
        "both themes ship the same shadow colour, so one of them is wrong",
    );
    assert_eq!(
        DARK.shadow_rgb.to_rgba8()[..3],
        [0, 0, 0],
        "the dark umbra is near-black"
    );
}
