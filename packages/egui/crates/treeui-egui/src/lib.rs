//! TreeUI components for [`egui`].
//!
//! The Rust rendering of the same component contract `@treeui/vue` and
//! `@treeui/react` render on the web. What crosses over is not CSS — egui has
//! none — it is the part that was never web-specific:
//!
//! - the **tokens**, from [`treeui_tokens`], generated from the one TypeScript
//!   model that also writes the stylesheet;
//! - the **vocabularies**: [`Size`], [`Variant`], [`Tone`] are the same closed
//!   sets, with the same members, minus the ones the web keeps only for
//!   compatibility;
//! - the **interaction shape**: a rest, hover, press, focus and disabled state
//!   for every control, with disabled expressed as a measurable colour rather
//!   than as an opacity;
//! - the **accessibility floor**: a 44×44 minimum hit target, a focus indicator
//!   that clears 3:1, and a reported role and label for every widget.
//!
//! ```no_run
//! use treeui_egui::{TBadge, TButton, TCard, TreeStyle};
//! use treeui_tokens::{BadgeTone, Tone, Variant};
//!
//! # fn ui(ui: &mut egui::Ui) {
//! let style = TreeStyle::light();
//!
//! TCard::new().style(&style).title("Deployment").show(ui, |ui| {
//!     ui.add(TBadge::new("Failed").style(&style).tone(BadgeTone::Danger));
//!
//!     if ui.add(TButton::new("Save changes").style(&style)).clicked() {
//!         // …
//!     }
//!
//!     ui.add(
//!         TButton::new("Delete")
//!             .style(&style)
//!             .variant(Variant::Ghost)
//!             .tone(Tone::Danger),
//!     );
//! });
//! # }
//! ```

mod badge;
mod button;
mod card;
mod theme;

pub use badge::TBadge;
pub use button::TButton;
pub use card::TCard;
pub use theme::{color32, TreeStyle};

pub use treeui_tokens as tokens;
