# styles

The design system's foundation: `tokens.css` and the Tailwind theme that exposes it.

**Tokens are named by meaning, not by appearance.** `--color-status-blocked`, not
`--color-red-500`. The name says what it is for, so the value can change without every
component having to.

Two layers:

1. **Primitives** — the raw palette and scale: `--blue-60`, `--space-3`, `--text-sm`.
2. **Semantic tokens** — what the product uses: `--color-status-pass`,
   `--color-surface-raised`, `--color-border-subtle`. Components only ever use these.

Both themes are defined here. Light is the default, because the reviewer often works in
bright, document-heavy environments; dark is available and the system preference is
respected on first load.

Motion tokens live here too, and motion is functional only: state changes, data arriving,
focus. `prefers-reduced-motion` is respected.

This folder is also the artefact a design agent could read. Keep it tidy and documented in
Storybook — that is the point of writing design decisions as code.
