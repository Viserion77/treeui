# TreeUI Design Foundation

TreeUI treats the design system as a durable product contract, not just a visual reference. This file captures the principles used to review design and component changes. Exact token names, values, and theme data live in `docs/ai/TOKENS.yaml` and the Storybook foundation pages.

## Visual Direction

TreeUI aims for a professional, calm interface language:

- Soft corners without exaggerated roundness
- Strong, clean borders
- Subtle shadows
- High contrast text and surfaces
- Short, purposeful motion
- Visible focus indicators

## Design Rules

- Use semantic tokens instead of raw visual values in component code
- Keep design foundations framework-agnostic so future packages can inherit the same contract
- Treat light and dark as first-class themes
- Design and document more than the happy path: default, hover, active, focus, disabled, loading, and relevant error or empty states
- Preserve clear keyboard behavior, visible focus treatment, and understandable status changes
- Keep clickable icon affordances at or above a `44x44px` target area

## Canonical References

- Storybook foundation pages explain tokens, theming, accessibility, and component guidance
- `docs/ai/TOKENS.yaml` is the compact canonical token contract
- `docs/ai/COMPONENTS/*.yaml` capture component-specific public behavior and states

## Review Checklist

- Does the change reuse semantic tokens instead of introducing raw visual values?
- Does it stay on the existing type, spacing, and motion system?
- Are all user-visible states represented and documented?
- Is keyboard and focus behavior still clear?
- Does the result still feel quiet, consistent, and production-ready?
