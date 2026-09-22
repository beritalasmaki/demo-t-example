# Decisions

A record of choices where there was a real trade-off. Newest first.

Each entry has four parts: the situation, the options, the choice, and what it means going forward.

---

## 0037 · Second correction pass: card padding, band bleed, pill contrast, tab hover

**Context.** After PR #8 merged, the user supplied four more reference images and asked for a
second round of fixes: a "Deselect all" quick action on the timeline filter dropdown,
`ConfidencePanel`'s percentage band matching the mockup's edge-to-edge look (it still had
padding around it after 0036's restructure), the `ActorName` pill in `DecisionBar`'s decided
view no longer blending into its own card background, more padding and gap around
`RegionCard` content generally, and tab hover changed from a background fill to an underline.

**"Deselect all": a real `DropdownMenu.Item`, not a plain `<button>`.** The natural first
build was a plain `<button>` dropped into the menu next to the checkbox items — it renders
and is reachable by `Tab`, so it looks correct at a glance. A Playwright keyboard trace showed
the real problem: a raw button doesn't join Radix's roving-focus `ArrowUp`/`ArrowDown` group,
so once a user is navigating the menu by arrow key (the expected pattern once any item is
focused), "Deselect all" is silently unreachable — present, focusable by `Tab` alone, but
invisible to the same navigation everything else in the menu uses. Converting it to a real
`DropdownMenu.Item` (disabled when `hiddenTypes` is already empty, `onSelect` calling
`event.preventDefault()` to keep the menu open, matching the existing checkbox items'
behaviour) fixed this — it now participates in the same roving-focus group as every other row.
A follow-up trace also caught a false alarm worth recording: `Tab` and the initial auto-focus
correctly skip a *disabled* item, per standard ARIA behaviour, which briefly looked like a
second bug before a cleaner trace ruled it out.

**`RegionCard`'s default padding moved from `--space-4` (16px) to `--space-5` (24px), app-wide,
not per-region.** The user's ask ("Summary and before-you-approve card sections should have
more padding") named two regions, but every `RegionCard` in the app shares the same default —
special-casing two call sites would have meant carrying two padding scales side by side for no
visible reason, since the mockups don't show tighter padding anywhere else either. `Tabs`'
horizontal padding and `PolicyGateList`'s tab-bleed negative margin were both bumped from
`--space-4` to `--space-5` in the same change, since both exist specifically to align with
`RegionCard`'s own inset.

**`ConfidencePanel`'s band bleeds to the row's own edges via `overflow-hidden` + the parent's
`rounded-md`, not its own border-radius.** 0036 already established this "zero the shared
padding, re-add it only where content needs it" pattern for `RunHeader`'s Disclosure and
`PolicyGateList`'s tab bar; this is the same pattern applied a third time. The alternative —
giving the band its own `rounded-l-md` to match the card's corner radius — was rejected
because it hard-codes a radius value that has to be kept in sync with the parent's whenever
either changes; `overflow-hidden` clips whatever radius the parent actually has, so there is
nothing to keep in sync.

**`ActorName`'s `bg-surface-raised` default was overridden with `className="bg-surface"` at
exactly one call site (`DecisionBar`'s `DecidedView`), not changed globally.** Every other
place `ActorName` renders sits on a plain `RegionCard` (`bg-surface`), where the pill's default
fill already contrasts correctly — `DecidedView` is the one context that itself uses
`bg-surface-raised`, which is what caused the collision. Changing the component's own default
would have fixed this one case and broken every other one.

**Tab hover: `hover:underline`, not `hover:bg-surface-raised`.** A pure CSS property swap on
`TabsTrigger` — the mockup's inactive-tab hover state is a text underline, not a background
change, and Playwright confirmed both `text-decoration-line: underline` and `cursor: pointer`
on hover after the change.

**Consequence.** `RegionCard`'s padding bump is the one change in this round with real
downstream reach — it affects every card in the app, not just the two the user pointed at, so
any future card-density work (a denser "compact" variant, say) should treat 24px as the new
baseline, not 16px. Every other change in this round is scoped to one component or one call
site. Re-verified end to end: full `npm run check` (typecheck, lint, theme-bridge,
format-locale, 222 tests) green, and a real-browser Playwright pass across all three fixtures
in both themes confirmed no console/page errors from the app itself (one `ERR_CERT_AUTHORITY_
INVALID` on the Google Fonts `<link>` is this sandbox's own egress policy blocking an external
resource, unrelated to any change here, and not present outside this environment).

---

## 0036 · Correction pass: alignment, spacing and two component-API extensions

**Context.** After PR #7 merged, the user compared the result against the original mockups
directly (not from memory) and found real drift: `ActorName` pills misaligned against their
label text, `RunHeader`'s "Show details" panel squeezed into a narrow right-aligned box
instead of the full card width, inter-item spacing under the mockup's ~24px rhythm in several
regions, and `PolicyGateList`'s tabs looking nothing like the mockup's full-width segmented
control. Fixed all of it against the actual mockup images, not approximated from memory.

**Two shared components needed real API extensions, not just call-site tweaks:**

1. **`Disclosure` gained `summaryClassName`/`contentClassName`.** `RunHeader`'s and
   `ConfidencePanel`'s "Show details" rows need to sit flush inside a card that already
   supplies its own padding — Disclosure's default `px-4 py-3` on both the summary and the
   content wrapper doubled that inset. The existing single `className` prop only reaches the
   outer `<details>`, not those two inner elements, so reaching them required two new,
   narrowly-scoped override props rather than duplicating Disclosure's whole structure at
   each call site.
2. **`Tabs`/`TabsTrigger` gained an `icon` prop and a full-bleed-friendly `TabsList`.** The
   mockup's tabs are a full-width segmented bar with an icon per tab and no rounding (so a
   caller's own `-mx-[var(--space-4)]` can bleed it to the card's edge) — a real visual
   language change from the small underlined text-link tabs shipped in PR #7, not a colour
   tweak.

**Two mockup details deliberately not matched exactly, and why:**

- **Tab width.** The mockup's two tab segments look asymmetric (~25%/75%), which reads like
  two manually-sized Figma rectangles rather than a deliberate rule — nothing in the design
  ties the ratio to tab content length or active state in a way that would generalise. Built
  both tabs `flex-1` (equal width) instead: a standard, predictable segmented-control
  behaviour that doesn't depend on which tab happens to be active or which label is longer.
- **`ConfidencePanel`'s "Not checked" icon.** The Confidence mockup's icon for this state
  looks like a plain exclamation-in-a-circle, slightly different from `CircleHelp`. Kept
  `CircleHelp` anyway: it's the same icon `StatusBadge`'s `info` tone already uses for the
  identical semantic state (`docs/DECISIONS.md` 0028), and switching just here would break
  that one deliberate cross-region consistency for a difference that reads as mockup noise,
  not a signal.

**Consequence.** `Disclosure`'s two new props are optional and backward compatible — every
other existing call site (`PolicyGateRow`, `TimelineEventRow`, `PolicyGateList`'s old
disclosure) is unaffected. `ConfidencePanel`'s reported-area rows are now `<li><Disclosure>…`
instead of a bare `<Disclosure>` as a direct `<ul>` child, fixing an invalid-HTML issue
(`<details>` was a direct child of `<ul>`) that the earlier version had introduced without
anyone noticing. Every fixed region was re-verified against its actual mockup image
side-by-side, not just re-tested — this correction pass exists precisely because that step
was skipped, or done from memory, the first time.

---

## 0035 · The logo is the real Figma SVG, not a re-typeset lockup

**Context.** 0034 (below) approximated the mockup's wordmark as two lines of styled text:
`LEDGER` (bold, uppercase, `--text-page-title`) over `demo` (`--text-body`,
`--color-text-secondary`). The user then supplied the actual logo mark's SVG source directly
— a double-exposure wordmark (a faded, oversized `LEDGER` behind a crisp, smaller one) that a
type-and-token approximation cannot reproduce; that layered effect is the artwork, not
something CSS letter-spacing and font-weight can fake.

**Options.** (a) Keep refining the text lockup's tracking/weight/line-height to get visually
closer. (b) Inline the supplied SVG verbatim as the wordmark, replacing the text lockup
entirely.

**Choice.** (b), with one change from the SVG exactly as given: every `fill="#555555"` and
`fill="#C5C5C5"` became `fill="currentColor"`, and the wrapping `<h1>` sets
`text-text-primary` — so the mark still resolves through the theme token instead of two fixed
hex greys that would look wrong (too dark, low contrast) against the dark theme's background.
Everything else (paths, the 0.2-opacity backdrop layer) is unchanged from the source.

**Consequence.** `App.tsx`'s `Wordmark` component is now ~90 lines of inlined SVG path data —
unusually large for this codebase's usual "no raw values, everything from tokens" components,
but a brand mark's path geometry isn't a token candidate the way a colour or a spacing value
is. Accessibility: the `<h1>` keeps its native heading role (nothing adds `role="img"` to it,
which would replace that role); the `<svg>` itself carries `role="img"` and a `<title>Ledger —
demo</title>`, so assistive tech gets one clean "Ledger — demo, heading level 1" announcement,
not a heading immediately followed by a separately-announced image with the same label.

---

## 0034 · Testing a Radix modal layer (`DropdownMenu`) in jsdom: one open per test file

**Context.** `TimelineFilters.tsx`'s new dropdown (0030, below) is built on `radix-ui`'s
`DropdownMenu`, a modal layer (it locks `body { pointer-events: none }` while open). Two
things about it don't behave the way every other interactive component in this codebase's
test suite does:

1. `userEvent.click()` on the trigger silently fails to open it — the click's own later
   `pointerup`/`click` events land while the body's pointer-events are already locked to
   `none`, and userEvent's default pointer-events visibility check reads that as "target
   unreachable" and cancels the interaction partway through, even though the *first*
   `pointerdown` already toggled it open a moment earlier.
2. More surprising: once a `DropdownMenu` has been opened and closed in one test (however
   cleanly — `Escape`, a full unmount, `document.body.style` reset all tried), a *separate,
   freshly rendered* `DropdownMenu` instance in a *later* test in the same file can no longer
   be opened at all, by any method (`userEvent`, raw `fireEvent.pointerDown`, with or without
   `vi.resetModules()`). Verified this is jsdom-only, not a real bug: the exact same
   open → close → open sequence works every time in a real browser (Playwright), and works
   every time *within one still-mounted instance* in jsdom too — it's specifically a second
   *mount* that fails, not a second *interaction*.

**Options.** (a) Skip or stub out jsdom coverage for anything using `DropdownMenu`, relying on
Playwright alone. (b) Set `pointerEventsCheck: PointerEventsCheckLevel.Never` on `userEvent`
for these tests (fixes surprise 1), and restructure each affected test file so every
interaction that opens the menu happens against one render, in one test, rather than split
across several fresh `render()` calls (works around surprise 2, since re-mounting is what
breaks, not repeated open/close on the same mount).

**Choice.** (b). `TimelineFilters.test.tsx` and `Timeline.test.tsx`'s toggle test both follow
this now: label-only assertions (no menu interaction) stay as ordinary separate tests; the
"opens it, lists items, checks the initial state, toggles a type on, toggles it back off"
coverage is one test with one `render()`, not four.

**Consequence.** This is a real constraint on this repo's tests, not a one-off: **any future
component built on a Radix modal-layer primitive (`DropdownMenu`, `Popover`, `Select`,
`AlertDialog` — anything using `DismissableLayer`) needs the same two workarounds** if its
tests open it more than once across the file. `Tabs` (0028, `PolicyGateList.test.tsx`) and the
plain `Disclosure`/native `<details>` pattern do **not** have this problem — confirmed by
running several fresh `render()`+interact cycles of each in one file with no issue — so this
is specific to Radix's modal-layer machinery, not Radix components generally, and not a
reason to avoid Radix elsewhere.

---

## 0033 · `DecisionBar`'s Undo gets the one filled, non-neutral button in the app

**Context.** Every button in this codebase is deliberately neutral — `features/run/README.md`
and Scenario S2 (docs/spec-review-screen.md) require "no brand colour on any of [the three
decision] actions," so Approve/Request changes/Reject, and every other button built since,
share one plain bordered style (`BUTTON_CLASSNAME` in `DecisionBar.tsx`). The mockup shows
`DecidedView`'s Undo button filled solid dark (light text on a near-black fill in the light
theme).

**Options.** (a) Keep Undo on the same neutral bordered style as every other button, for
absolute consistency. (b) Give Undo a filled treatment, matching the mockup.

**Choice.** (b), reasoned as a *different* rule from S2's, not a violation of it: S2's "no
brand colour" is specifically about not making one of the three *decision* actions look like
"the recommended one." Undo is not a decision action — it only exists after a decision was
already made, in a single-button context with no siblings to rank against. The fill itself
uses `bg-text-primary`/`text-surface` — an inversion of the existing neutral text/background
tokens, not `--color-primary` or any other brand/accent colour — so it stays inside "no brand
colour anywhere," just not inside "every button looks identical."

**Consequence.** `DecisionBar.tsx` now has two distinct button treatments where it previously
had one; a future button added to this file should default to the existing neutral
`BUTTON_CLASSNAME`, not the filled one — the filled treatment is Undo's alone until another
genuine "single prominent action, no siblings" case shows up.

---

## 0032 · Confidence's percentage band stays one neutral tone, never coloured by value

**Context.** The mockup colour-codes each `ConfidencePanel` row's percentage band by its
value — green for ~81–88%, yellow for ~52%. This directly contradicts a principle the panel
was already built around (`ConfidencePanel.tsx`'s own doc comment, predating this session):
"Low confidence is normal information, not an alarm" (`features/run/README.md`'s glossary
entry for **Confidence**). Asked the user directly before planning further (see the
transcript) — confirmed: keep it colour-neutral, restyle only the *layout*.

**Options.** (a) Follow the mockup's green/yellow split. (b) Restructure the layout (a left
band with a large percentage, matching the mockup's visual weight) while keeping the band one
consistent tone (`--color-surface-raised`) regardless of value.

**Choice.** (b). A 52% side-effects confidence value in `run-blocked` is the model correctly
reporting something ordinary it couldn't fully verify — not a failure. Colouring it yellow
would read as a warning next to `PolicyGateList`'s actual warnings, undermining the one
signal this app tries hardest to keep calm.

**Consequence.** The big percentage number itself still needs to never read as "a bare
number" (existing acceptance criterion) even without colour to carry that framing — solved
with a visually-hidden `"Confidence "` prefix inside the same element as the number, so a
screen reader always hears "Confidence 72%," not "72%" floating alone, while sighted users get
the plain, unframed number the neutral band already contextualises.

---

## 0031 · Audit log: filter semantics invert to "hide," behind a dropdown

**Context.** The mockup replaces `TimelineFilters`' row of `ToggleChip`s (checked = shown,
matching `activeTypes`) with a single dropdown, "Hide events · N selected." Read literally,
selecting an item now *hides* that type — the inverse of the current semantics, where
selecting a chip *shows* it. Asked the user to confirm this was an intentional inversion, not
a mockup-reading error, before implementing (see the transcript) — confirmed: yes, invert it.

**Options.** (a) Keep `activeTypes`/show-semantics internally, translate to hide-language only
in the label. (b) Actually invert the underlying data: `lib/timeline.ts`'s `filterTimeline`
takes `hiddenTypes`, empty by default (nothing hidden — the least surprising starting state).

**Choice.** (b). A dropdown reading "Hide events · 3 selected" while secretly tracking which
3 types are *shown* is exactly the kind of naming mismatch that turns into a bug the next time
someone touches this code without re-deriving the inversion from scratch. `filterTimeline`,
`TimelineFilters`, `Timeline`'s `defaultHiddenTypes` prop, and every test/story/fixture that
touched the old `activeTypes` shape were all updated together, not left half-converted.

**Consequence.** The one acceptance criterion this must keep holding — "filtering never
actually hides an error or a retry" — is unchanged in logic, just inverted in which set
triggers it: `filterTimeline` now excludes an event only when its type is in `hiddenTypes`
*and* it isn't an error or a retry, instead of excluding when the type is missing from
`activeTypes`.

---

## 0030 · Three mockup renderings treated as unreviewed Figma artifacts, not replicated

**Context.** Cross-referencing the 9 mockup images against each other and against this app's
existing, deliberate content rules surfaced three places where a mockup's rendering looked
like a leftover from building the Figma file, not a considered design choice:

1. **`RunSummary`'s heading icon** shown as a warning triangle — identical to
   `AttentionDigest`'s own icon on the same file, strongly suggesting a duplicated Figma
   instance that was never swapped back. A warning triangle on the Summary region directly
   contradicts Content rules' "no adjectives, no reassurance, no alarm" voice: the summary is
   plain sourced fact, not a caution.
2. **`DecisionStatusBanner`'s body text** reads "This decisions already stands" in the
   mockup — a grammatical typo (plural "decisions," singular subject), not a wording change;
   nothing else in the 9 images suggests the product voice moved to a plural there.
3. **`TimelineEventRow`'s timestamp position** is inconsistent across the mockup's own five
   visible rows — inline with the title for two, on its own line below for three — with no
   pattern tied to event type, length, or anything else in the data that would explain the
   split.

**Options, each time.** (a) Replicate the mockup exactly, on the assumption every pixel was
intentional. (b) Treat it as an artifact and keep (or choose, for #3) the version that's
internally consistent with this app's own established rules.

**Choice.** (b), all three times: `RunSummary` keeps its `FileText` icon; the banner keeps
"This decision already stands" (singular); `TimelineEventRow` gets **one** consistent layout
(title, then timestamp below, always) rather than mirroring the mockup's split — chosen
specifically because a below-the-title timestamp is what avoids the icon/text wrap-alignment
bug 0025 already fixed once for this exact component.

**Consequence.** This is a judgment call, not a certainty — the alternative (asking about all
three before touching anything) was rejected because none of them changes structure or data,
only which of two very similar renderings gets kept, and the reasoning for each is recorded
here rather than silently overriding what the mockup showed.

---

## 0029 · `RunStatus` gets colour, scoped to exactly two of its six values

**Context.** `RunStatus` (`running`/`blocked`/`awaiting_review`/`approved`/
`changes_requested`/`rejected`) was deliberately colour-neutral before this session — a
workflow phase isn't a `GateResult` claim, so it never got `StatusBadge`'s vocabulary. The
mockup colours "Approved" as a filled green pill. Asked the user directly (see the
transcript) whether this meant reversing that rule generally — confirmed: yes, but only for
what the mockups actually show.

**Options.** (a) Invent a six-way colour mapping so every `RunStatus` value has *some* status
colour, for visual consistency. (b) Colour only the two values the mockups have evidence for
(`approved` → `StatusBadge success`, `changes_requested` → `StatusBadge warning`), and leave
`running`/`blocked`/`awaiting_review`/`rejected` on the existing plain `Tag`.

**Choice.** (b). No mockup shows a coloured "Blocked" or "Rejected" pill, and the new tint
tokens (0027, below) were authorized for exactly green and amber — inventing colours for the
other four would mean guessing at values nothing in this task ever specified.

**Consequence.** `RunHeader.tsx` now branches on `run.status`: two values render via
`StatusBadge`, the rest via the pre-existing `Tag` + a small icon map
(`Loader2`/`OctagonAlert`/`Eye`/`CircleX`). The scope boundary is explicit in code
(`STATUS_BADGE_TONE` is a `Partial<Record<...>>` covering only the two colourable values,
not a `Record` that would need a case for all six) so a future contributor adding a colour
for, say, `rejected` has to consciously widen that type, not just add a class string.

---

## 0028 · `info` tone recolours from blue to neutral grey

**Context.** `StatusBadge`'s `info` tone (the only `GateResult` it covers: `unknown`, "Not
run") used `--color-status-unknown`, a blue. Two independent mockups — Policy gates' "Not
run" pill and Confidence's "Not checked" icon — both render this state in plain grey, never
blue, across every instance shown.

**Options.** (a) Keep blue, on the assumption the mockup simply didn't restyle this one
state. (b) Recolour to neutral, since two independent images agree and neither shows blue
anywhere.

**Choice.** (b) — two independent, unprompted agreements is real evidence of intent, not a
single ambiguous instance. `info`'s own `CircleHelp` icon (distinct from `neutral`'s
`CircleMinus`) is what now distinguishes "not run" from "not applicable," since colour no
longer does.

**Consequence.** `--color-status-unknown` (the blue token) is now unused by `StatusBadge`
entirely, but not orphaned: `RunSummary.tsx`'s own `unknown`-kind sentence (icon + text) still
uses it, left unchanged since no mockup showed that specific case. The two are now
deliberately inconsistent — a badge reads neutral grey, an inline summary sentence about the
same kind of gate outcome still reads blue — until there's real evidence either way.

---

## 0027 · One new colour token, not a new palette, for the filled `StatusBadge` exception

**Context.** The mockups show `success`/`warning` `StatusBadge` tones as filled pills (tint
background, coloured icon/border/text) — reversing this app's own "status colour is never a
fill, never the text" rule (`src/styles/README.md`, backed by 0005's contrast work). The user
pre-authorized adding light-green/light-yellow tokens if needed, but that is not the same as
authorizing a whole new colour system.

**Options.** (a) Design a full new tint palette (background + foreground) for every status
colour, for consistency with a hypothetical future need. (b) Reuse the *existing*, already
contrast-verified `--status-green-light`/`-dark` and `--status-amber-light`/`-dark` as the
on-tint foreground, adding only the light-background tints themselves as new tokens — and
only a genuinely new foreground colour where the existing one can't reach 4.5:1.

**Choice.** (b), and the WCAG relative-luminance check (same method as 0005) found that
`--status-green-light` (#1e8a5a) is *mathematically incapable* of reaching 4.5:1 against any
tint background — it already tops out at ~4.3:1 against pure white, the best possible case, so
no darker tint could improve on that. `--status-amber-light` had enough headroom (5.36:1)
against its own tint to reuse directly, as did both dark-theme colours (7.87:1, 6.44:1). Only
one genuinely new primitive was needed: `--status-green-tint-fg-light` (#1a7a3e), verified at
4.81:1 against its paired tint (#e6f6ec).

**Consequence.** Four new tint-background primitives plus one new foreground primitive
(`tokens.css`), surfaced as `--color-status-pass-tint-bg`/`-fg` and
`--color-status-waived-tint-bg`/`-fg` in `@theme` — scoped to exactly the two tones with
mockup evidence, not a blanket "every status gets a filled variant" system; `danger`/`neutral`
stay icon-and-border-only. `npm run check:theme-bridge` still passes (38 colours verified
across 3 themes), confirming the new tokens compute correctly in both light and dark.

---

## 0026 · `RunHeader`'s requester gets the same pill, on its own line

**Context.** 0023 gave every human actor's name a pill — but missed `RunHeader`'s
`requestedBy`, which was still plain text folded into the same sentence as the initiative
name: `"{initiative} — requested by {name}"`. That sentence also truncates to one line at
`md` and up (0025).

**Options.** (a) Wrap just the name in `ActorName`, in place, inside the existing truncating
sentence. (b) Give the requester its own line, separate from the (still truncating)
initiative name.

**Choice.** (b). `ActorName`'s pill has real shape — border, padding, an icon — and a
`text-overflow: ellipsis` truncation clipping it mid-pill when the sentence overflows would
look broken, not just cut text short the way it does for a plain word. The em dash that used
to join the two ("initiative — requested by name") is dropped; "Requested by [pill]" reads
fine as its own line, the same shape `DecisionStatusBanner`/`DecidedView` already use for "by
[pill]".

**Consequence.** The initiative name's own `<p>` no longer carries `run.requestedBy` at all,
so its truncation (`md:truncate`) now only ever clips the initiative name itself, never a
person's name.

---

## 0025 · The mobile region pass: two real bugs fixed, touch-target size left alone

**Context.** 0024 fixed the page shell and nav but explicitly left "a full per-region mobile
pass" as an open gap. Audited every region in a real browser at 375px before changing
anything, rather than guessing what "mobile polish" might mean. Found two concrete bugs and
one thing that looked like it might need fixing but, checked against the actual accessibility
standard, didn't:

1. **`TimelineEventRow` and `RunSummary`**: `IconText`'s icon vertically centers against its
   whole content by default (`items-center`). Fine for the ten other call sites, which are all
   single-line labels — but an event title or a summary sentence can wrap to several lines at
   375px, and centering the icon against the *whole wrapped block* floats it down toward a
   middle line instead of sitting next to the first one.
2. **`RunHeader`**: the initiative name truncates to one line with a `title` attribute as the
   way to read the rest — a tooltip that never fires on a touchscreen, so on a phone the only
   way to reach "what was asked for" (Reviewer question 1, docs/spec-review-screen.md) was
   gone entirely, not just visually compressed.
3. **Touch-target size** (nav links ~33px tall, filter chips ~30px tall): looked undersized
   against the common "44px" mobile guideline. Checked against WCAG 2.5.8 (AA) instead of
   going by that guideline alone: its actual minimum is 24×24 CSS px, which both already
   clear. 44px is Apple/Material's *comfortable* recommendation, not a compliance gap.

**Options, for (1) and (2).** (a) Fold the fix into `IconText`/keep truncate unconditional,
accepting the small side effect elsewhere. (b) Scope each fix to exactly where the real
problem is.

**Choice.** (b), both times.
- `IconText`'s own default (`items-center`) is untouched — changing it globally would nudge
  every heading icon in the app by a few pixels (`items-center` vs `items-start` differ
  slightly even for single-line content, since the icon is shorter than a line box) for a
  problem that only exists at two call sites. `className="items-start"` on just those two
  `IconText` usages relies on `cn()`'s `tailwind-merge`, which already resolves a conflicting
  utility in favour of the later class — no change to the shared component at all.
- `RunHeader`'s truncate becomes `md:truncate` (unconditional wrap below `md`, today's
  single-line truncate unchanged at `md` and up) rather than removing it altogether — the
  desktop reasoning it was added for (bounding the row's height in a side-by-side layout)
  still holds there; only the touchscreen case where the `title` fallback is unreachable
  changes.

**Choice, for (3).** Left as-is. Bumping shared components (`Tag`, `ToggleChip`) used
everywhere to hit a stricter guideline, with no actual failure against the standard this app
already holds itself to elsewhere (WCAG, per AGENTS.md's accessibility non-negotiable), isn't
a fix — it's a redesign with no bug behind it. Named here rather than silently skipped, so the
choice is visible rather than looking like an oversight.

**Consequence.** `RunHeader.test.tsx`'s existing assertion updated from `toHaveClass('truncate')`
to `toHaveClass('md:truncate')` — the behaviour it guards (desktop still truncates) is
unchanged, just correctly scoped now. Verified in a real browser at 375px, both fixes, both
themes: the icon sits against the first line, and the full initiative name reads without
needing a tooltip. Confirmed unchanged at `md` and up by comparison screenshot.

---

## 0024 · Mobile is now in scope — page shell and nav only, not a full per-region pass

**Context.** `docs/spec-review-screen.md`'s "Out of scope" line listed "mobile layouts" since
the project started; `AnchorNav.tsx` repeated it (and mis-cited the source as `AGENTS.md` —
the real line was only ever in `spec-review-screen.md`). The user asked to fix the mobile
version, specifically to put the navigation at the top, and confirmed — asked directly, since
this reverses a standing scope line rather than being a pure style tweak — that mobile should
come into scope generally, not just for this one screen.

**What was actually broken, checked in a real browser before deciding anything**: at 375px,
`RunReviewPage.tsx`'s outer container (`flex items-start`, no responsive variant) never
stacked `AnchorNav`'s fixed `w-44` column above the content — it just squeezed the content
column to roughly 180px, clipping the run's own system name mid-word and forcing real
horizontal overflow (measured: the page was forced to 459px inside a 375px viewport).

**Options.** (a) Design a full mobile pass in one session — every region's density, touch
targets, table-like layouts. (b) Fix the page shell and navigation (what was both asked for
and measurably broken), name the rest as a real, still-open gap rather than let "mobile is in
scope" quietly imply it's all been designed.

**Choice.** (b). `App.tsx`/`RunReviewPage.tsx`/`AnchorNav.tsx` now use Tailwind's default `md`
breakpoint (768px) — no custom value invented, nothing added to `tokens.css` (a breakpoint is
structural, not a design token this app restricts). Below `md`: `RunReviewPage`'s container is
`flex-col` (nav stacks above content — nav is already first in DOM order, so this alone puts
it "at the top"), `AnchorNav` itself switches from a sticky vertical column to a horizontal,
scrollable, non-sticky strip (`overflow-x-auto`, each link `shrink-0` so the scroll container
can't squeeze a label mid-word), and `App.tsx`'s page padding scales down
(`px-4 py-8` → `md:px-6 md:py-12`). `md` and up: pixel-identical to before this change,
confirmed by screenshot.

**Consequence.** Verified in a real browser (not just from source) at 375px and at the `md`
boundary, across all three fixtures, both themes: zero horizontal scroll, all seven nav links
reachable and activatable by keyboard (focus auto-scrolls the strip; Enter still jumps the
page), and every already-existing `flex-wrap` group (`RunHeader`'s tag row, `PolicyGateRow`'s
summary row, `DecisionBar`'s action buttons, `TimelineFilters`' chips) reflowed cleanly once
given real width back — none of them needed their own fix. `docs/spec-review-screen.md`'s
"Out of scope" line now says exactly this: the shell is responsive, a full per-region mobile
design pass is not — the next thing to design, if a phone-width reviewer turns out to matter
enough to invest further in, is density and touch-target sizing per region, not named here as
already handled.

---

## 0023 · A person's name gets a pill; a system's name-and-version doesn't

**Context.** Every actor name on screen already got an icon (`ActorIcon`, person vs system
via `isSystemActor`), but the two read too similarly at a glance — same size, same weight,
distinguished only by which small icon sat next to the text. The user asked, with a reference
image, for a human name to be visually set apart as its own pill/chip, not just plain text
next to an icon.

**Options.** (a) Give every actor name (person and system alike) the same pill chrome,
differing only by icon. (b) Pill only the person case; leave a system's name-and-version as
plain icon + text, unchanged.

**Choice.** (b). The ask was specifically to "emphasize that this is a human" — giving both
kinds the same chrome would restore the exact ambiguity being fixed. The contrast (one gets a
pill, the other doesn't) is what does the emphasizing; the icon distinction alone stays for
the system case, as before.

**Implementation note.** `ActorName` was previously duplicated — a local function in
`PolicyGateRow.tsx`, and the identical JSX inlined again in `DecisionBar.tsx`. Pulled out to
`features/run/ActorName.tsx` (not `components/`, matching the boundary `ActorIcon`'s own doc
comment already draws: the generic circle-around-an-icon shape lives in `components/`, but
deciding *which* icon from a raw name string is product-specific and lives in `features/run/`).
Now used by `PolicyGateRow.tsx`, `DecisionBar.tsx`, and the new `DecisionStatusBanner.tsx`
alike, so the human/system distinction is consistent everywhere an actor's name appears
instead of three places that could quietly drift apart.

**Consequence.** The pill's own border (`border-border-subtle`) is deliberately a step
subtler than `ActorIcon`'s own ring (`border-border`) rather than reusing the same token for
both — nesting two identically-weighted borders a few pixels apart read as visual clutter in
review; keeping them at different strengths reads as one shape (the pill) with a smaller
detail (the avatar) inside it, not two competing outlines.

---

## 0022 · The "Before you rely on this" digest is a new region, not part of the spec's six

**Context.** A reference mockup (shared as inspiration for "make the UI more user-friendly,"
tokens unchanged) showed a synthesized card near the top pulling together the failed/not-run
gates, the weakest confidence area, and a flagged audit note — one scannable pre-flight list
with jump links. `docs/spec-review-screen.md` defines exactly six regions and doesn't have
one for this.

**Options.** (a) Skip it — stay to visual/layout refinements of the existing six regions.
(b) Build it as a seventh, clearly-separate region, sourced from real data only.

**Choice.** (b), confirmed with the user before building (this was asked as a scope question,
since it's new content architecture, not styling). `lib/attention.ts`'s `buildAttentionItems`
is deliberately conservative about what qualifies, the same discipline `isSystemActor`
(0016) and `classifySummarySentence` were held to — a fact, never a threshold judgment:

- A gate group only exists for `fail`/`unknown`/`waived` gates that are actually present
  (`lib/gates.ts`'s `gateAttentionGroups`) — the exact same three results `PolicyGateList` now
  treats as "needs attention" (0021), not a separate definition of "risky."
- The confidence bullet is the single weakest area, but *only* among areas that name
  something concrete they could not verify (`unverified.length > 0`). There is deliberately no
  "confidence below X%" threshold — docs/spec-review-screen.md says "low confidence is normal
  and should look normal, not alarming," so the trigger is a specific, sourced fact ("could
  not verify Y"), never a number judged low on its own.
- The audit-note bullet only ever comes from `severity: 'warning'` `note` events.
  `severity: 'error'` events are excluded on purpose: those are already always-visible in the
  Audit log's own step/error/retry summary (Region 4's own hierarchy rule), so repeating them
  here would be the same fact twice, not a new one.

**Consequence.** Verified by hand against all three fixtures, not just written and trusted:
`run-clean` (the "boring" case) still gets one bullet — a confidence area with something real
it couldn't verify — proving the digest doesn't manufacture urgency where none exists;
`run-blocked` gets three (a failed gate, a waived gate, the weakest confidence area);
`run-messy` gets three (two not-run gates, the weakest confidence area, the reconciliation
note) — which happens to match the reference mockup's own three bullets exactly. If a future
region ever needs the same "which gates need looking at" grouping `PolicyGateList` and the
digest both now use, it has a single source (`gateAttentionGroups`), not two definitions to
keep in sync.

---

## 0021 · Policy gates: settled results collapse only once something needs attention

**Context.** The same reference mockup collapsed passing/not-applicable gates behind "Show N
passed checks," with failed/not-run gates always visible above an eyebrow count. But Scenario
S2 in docs/spec-review-screen.md is explicit: for an all-pass run, a design "fails when...
[it] hides what was checked behind a single green summary" — collapsing everything in the
common, boring case is exactly the failure that scenario names.

**Options.** (a) Always collapse settled (pass/not_applicable) gates behind the disclosure,
matching the mockup literally. (b) Collapse settled gates only when at least one gate needs
attention (`fail`/`waived`/`unknown`); render the flat list, exactly as before, when every
gate is pass/not_applicable.

**Choice.** (b). `PolicyGateList.tsx` computes `attention`/`settled` from the existing
`sortGates` order; `attention.length === 0` renders unchanged from before this session (the
literal S2 case), `attention.length > 0` adds a "Needs attention · N" eyebrow above the
always-visible attention rows and wraps `settled` in the existing `Disclosure` component
("Show N passed checks") — no new component, no new tokens.

**Consequence.** `PolicyGateList.test.tsx`'s existing sort-order test now opens the
disclosure before asserting order (closed native `<details>` content is correctly excluded
from `getAllByRole`, the same behaviour `ConfidencePanel.test.tsx` already relies on) — the
sort behaviour it checks didn't change, only that it's sometimes behind one extra click now.
Two new tests cover the two branches directly: settled gates collapse when something needs
attention, and nothing collapses when everything passed.

---

## 0020 · `AttentionDigest`'s own chrome stays colour-neutral, not a status colour

**Context.** `src/styles/README.md`'s usage rules: `--color-status-*` is for an icon, border
or swatch reporting one specific `GateResult` — "if something needs colour and it is not
reporting a pass/fail/waived/not-applicable/unknown result, it does not get a status colour."
The new `AttentionDigest` card (0022) needed some visual weight for its heading icon and
border, and the reference mockup it took inspiration from used a solid amber/brown fill for
the equivalent card.

**Options.** (a) Give the card's heading icon/border a status colour — `--color-status-waived`
(amber) reads closest to "caution." (b) Keep the card's own chrome fully neutral
(`border-border-subtle`, `text-text-secondary`/`text-text-primary`), the same treatment
`RunHeader.tsx` already gives `RunStatus` for an analogous reason (see that component's own
doc comment).

**Choice.** (b). The digest is not itself reporting one `GateResult` — a single card can
carry a failed-gate bullet, a confidence bullet and an audit-note bullet all at once, so no
single status tone is accurate for the card as a whole, and the usage rule is explicit that
status colour doesn't get reused once something stops being a status claim. (A full
background fill, which the mockup used, was also never on the table: `styles/README.md`
already established status colour as "icon, border and swatch — never the text itself," and a
solid amber fill is the same kind of reuse the "never a fill" line in tokens.css's own status
block already rules out for `StatusBadge`.)

**Consequence.** The card reads calmer than the reference's amber box; each item's own lead
sentence, not the card's chrome, is what tells a reviewer this is a "worth checking" list, the
same way `RunSummary.tsx` and `PolicyGateRow.tsx` already carry their own status meaning at
the item level rather than tinting a whole container. No new token was added or considered.

---

## 0019 · Smooth scroll for section nav: CSS `scroll-behavior`, not `scrollIntoView`

**Context.** AnchorNav's links (`#run-header-heading` etc.) jumped instantly. The ask was a
smooth scroll on click, reduced-motion respected, plus `scroll-margin-top` on each heading if
any sticky/fixed element would otherwise cover it after scrolling.

**Options.** (a) `scroll-behavior: smooth` on `html` via CSS, gated behind
`@media (prefers-reduced-motion: no-preference)`, relying on the browser's native anchor
navigation. (b) A click handler per link calling
`element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })`.

**Choice.** (a). AnchorNav's links are plain `<a href="#id">` with no other click behaviour —
there is nothing for a handler to do that the browser doesn't already do given the CSS
property, and no other programmatic scroll exists anywhere in the app for the site-wide
`html` selector to affect unintentionally. The reduced-motion branch falls out of the media
query for free (the property is simply never set, so the browser's own instant jump runs,
not an animation that's merely shortened) rather than needing a JS `matchMedia` check.

**Consequence — no `scroll-margin-top` added.** The one *conditional* part of the ask
("if any nav/header element is sticky/fixed...") turned out not to apply: `AnchorNav` is
sticky, but it's a side rail next to the content column (`flex items-start` in
`RunReviewPage.tsx`), not a bar stacked above it — scrolling never tucks a region heading
underneath it. Verified in a real browser (Playwright): `getComputedStyle(html).scrollBehavior`
reads `smooth` under `no-preference` and `auto` under `reduce`, and a keyboard-activated
(Enter, not click) nav link scrolls the page either way. If a fixed header is ever added
above the content column, this is the entry to revisit.

---

## 0018 · Disclosure's open/close animation: CSS grid-rows, not a measured-height overshoot

**Context.** The request asked for a springy overshoot easing on open (`cubic-bezier(0.34,
1.56, 0.64, 1)`) with an explicit constraint: "no bounce/scale/rotation — the personality
comes from the easing curve, not from extra movement." Native `<details>` can't be animated
directly (the browser applies `display: none` to its children the instant `open` goes false,
before any transition can run), so this needed a real technique, not just adding
`transition`.

**Options.** (a) A single-track CSS Grid (`grid-template-rows: 0fr` ↔ `1fr`), transitioning
that property with the spring easing — no JS state, `<details>` stays exactly as
uncontrolled as it already was. (b) Measure the content's real pixel height (a ref +
`scrollHeight`, or a `ResizeObserver`) and animate an explicit `height` (or `max-height`) to
that value in React state — more moving parts, and a component whose own doc comment
currently says "native `<details>`/`<summary>` rather than custom JS."

**Choice.** (a) — implemented and verified: the computed `transition-duration` and
`transition-timing-function` on open genuinely match the spring token, and the row's real
height interpolates through it (confirmed via `getComputedStyle` mid-transition in a real
browser, not assumed from the CSS alone). **But it doesn't produce a literally visible
overshoot.** A CSS Grid track sized in `fr` units has nothing to overshoot *into*: with only
one flexible track, the row always claims exactly the space the content needs, at every
point in the curve, including the portion of the curve past `1.0` — there's no pixel value
for the row to briefly exceed and settle back from, the way a `scale` or a fixed-pixel
`height` animation could. (b) would have made a genuine overshoot possible (an explicit pixel
height briefly exceeding the content's natural height *is* visible, as a small extra gap that
closes), but only by giving up the "no custom JS" property this component has had since it
was built, for a request that also explicitly ruled out the other way overshoot is usually
made visible (`scale`). Given the explicit "no scale" constraint, (a) is what's implementable
within it — the curve genuinely runs at the exact tokens specified, it just expresses as an
unusually fast-then-settling *rate* of opening rather than a visible bounce past the final
size.

**Consequence.** `--motion-duration-open`/`-close`/`--motion-ease-spring`/`--motion-ease-in`
are real, used tokens, and the transition timing is verified correct. If a literally visible
overshoot bounce turns out to matter more than keeping `Disclosure` free of JS state and
`transform`/`scale`, option (b) is the concrete alternative — a small, contained change
(a ref, a measured height, React `open` state synced from the native `toggle` event) — not a
redesign.

---

## 0017 · Undo is real, but local-only — there is nothing to reverse it on

**Context.** The undo window (0003) was, until now, a countdown with nothing to click: real
information ("you can undo this for 6 min 59 s more"), but no way to act on it. The request
was to add an actual "Undo" button. `lib/api.ts` has no `undoDecision`-shaped function, and
adding one would mean deciding what a real undo endpoint does — whether it needs its own
audit trail entry, whether a second reviewer can undo someone else's decision, what happens
if the undo itself races a release — none of which this demo's fixture-backed `getRun`/
`submitDecision` pair has any real backend semantics for.

**Options.** (a) A real `<button>` that calls `onRunUpdated({ ...run, decision: undefined,
status: 'awaiting_review' })` — the exact same local-state mechanism `DecisionBar` already
uses for a live decision or an S5 conflict (`RunReviewPage`'s `decidedRun` state), reverting
what's on screen, with no network call. (b) Add a matching `undoDecision` to `lib/api.ts`,
mirroring `submitDecision`'s shape, so undo goes through the same seam a real backend would.
(c) Leave the button out and keep only the countdown text.

**Choice.** (a). It makes the button real in the only sense this app can make anything
real — the screen genuinely changes, immediately, the same way approving or rejecting does —
without inventing backend behaviour (b) would need real answers for for a demo that
explicitly has none (AGENTS.md, Stack: "No backend"). (c) would leave the request half-done
for no reason: the local-state mechanism (a) uses already exists and already does exactly
this shape of thing.

**Consequence.** Undo is real and immediate on screen, but only for this browser tab, this
session, this local React state — refreshing the page reloads the original fixture,
undecided-or-decided exactly as it was written, same as any other local-only change already
made through `DecisionBar`. If a real backend is ever added, this is the seam
(`onRunUpdated`) where an actual `undoDecision` call would slot in, the same way (b) would
have worked, without changing `DecisionBar`'s own shape.

---

## 0016 · Person-vs-system actor icons are a string heuristic, not a data-model field

**Context.** A screenshot review asked for a small icon distinguishing a person's name from a
system's name-and-version next to `PolicyGate.evaluatedBy`, `PolicyGate.waiver.by` and
`Decision.by` (docs/spec-review-screen.md, Content rules, "Who did what": "a person by name,
or a system by name and version"). The data model has no field saying which one a given
string is — adding one was explicitly out of scope for this task.

**Options.** (a) A heuristic over the string itself: every system name in this app's fixtures
ends in a version tag ("policy-engine v2.3"), no person's name does. (b) Add a real
`PolicyGate.evaluatedByKind: 'person' | 'system'` (and the equivalent for `waiver`/
`Decision`) field to the data model. (c) Skip the icon distinction entirely until a real field
exists.

**Choice.** (a), `src/lib/actors.ts`'s `isSystemActor`. Verified against every actual
`evaluatedBy`/`waiver.by`/`decision.by` value across all three fixtures (7 distinct values: 4
system, 3 person) — correct on all of them. (b) is the more correct long-term answer but was
out of scope tonight; (c) would have left the request half-done for no real reason, since (a)
is cheap, reversible, and doesn't touch anything (b) would later need to replace.

**Consequence.** This is a text-pattern guess, not a real distinction: a future system name
that doesn't end in a version tag, or a person whose name coincidentally does, would be
misclassified. It is verified correct on every value that exists today, not proven correct in
general. If a system evaluator is ever named without a version suffix (or a gate/decision
gains a real `evaluatedByKind`-style field for another reason), `isSystemActor` should be
replaced, not extended with more pattern cases.

---

## 0015 · `format.ts`'s locale is now pinned, and checked, not left to the runtime default

**Context.** Relative-time strings (`formatRelativeTime`) rendered in Finnish
("7 kuukautta sitten") instead of English, on a machine whose browser/OS reported that
locale. Every `Intl`/`toLocale*` call in `src/lib/format.ts` passed `undefined` for locale,
which means "follow the runtime's default" — not a deliberate choice, just left unset. This
is the second time a bug in this exact file has come from the same root cause: the first was
12-hour vs. 24-hour clock time (`docs/WORKLOG.md`, 2026-09-19), fixed with `hour12: false`
but without addressing the *other* locale-dependent calls in the same file, which is exactly
why this one was still open to find.

**Options.** (a) Pin every locale-sensitive call in `format.ts` to a single explicit
constant (`'en'`), and rely on code review to keep it that way. (b) Same fix, plus a narrow
automated check (matching `scripts/check-theme-bridge.mjs`'s precedent, 0009) that fails
`npm run check` if any locale-sensitive call in that file omits an explicit locale again.
(c) Leave it locale-dependent, and instead force a consistent locale at the app's root (e.g.
an `<html lang>`-driven i18n setup).

**Choice.** (b), `scripts/check-format-locale.mjs`. (a) alone is what was already true for the
12-hour-clock fix — it held for exactly the one call that got fixed, not the others in the
same file, which is how this happened a second time. (c) is real internationalization
infrastructure this app doesn't have and doesn't need yet (it has no other language content;
Content rules' wording is fixed English throughout) — pinning one file's own calls is a much
smaller, sufficient fix for the actual problem. Verified the same way 0009's check was:
reintroduced the exact bug, confirmed the new check fails and names the offending call, then
confirmed a clean pass after restoring.

**Consequence.** `format.ts` can no longer regress to the runtime's default locale without
`npm run check` failing immediately and naming the exact call. The check is deliberately
narrow — a regex over one file's known call shapes — and would need updating if a
locale-sensitive call were added elsewhere in the app or written in an unrecognized shape.

---

## 0014 · `--color-primary`/`--color-primary-foreground` were a self-reference cycle, not a safe mirror — correcting 0008

**Context.** 0008 audited every bridge name against tokens.css and found one other exact-name
overlap besides border: `primary`. It reasoned that was fine because "the bridge maps it to
itself, which is only safe because both sides already agree on the value" — i.e.
`--color-primary: var(--color-primary);` in the bridge, mirroring tokens.css's own
`--color-primary: var(--violet-light);`. That reasoning was wrong, and 0008's own text above
is left as it was written rather than edited to hide the mistake. Building the first real
shadcn components (0013) and actually looking at the rendered result — not just the source —
showed `bg-primary` painting nothing at all in light theme. Tailwind merges an `@theme` name
and a same-named `@theme inline` name into one registry entry, the later (bridge) declaration
winning outright, never layered on top of the earlier one. So the bridge's line wasn't
"mirroring" anything at runtime — it was the *only* surviving declaration for that name, and
it referenced its own name: a CSS custom-property cycle, which computes to nothing (per spec,
its guaranteed-invalid value), silently. `--color-primary-foreground` had the identical bug.
Worse, tokens.css's own `--color-focus-ring: var(--color-primary);` rode the same cycle,
making `:focus-visible`'s outline colour invalid too — every keyboard focus ring on the site
was invisible in light theme, the default theme, until this was found and fixed.

**Options.** (a) Remove both self-referencing lines from the bridge, same fix as 0007/0008 —
tokens.css's own declaration becomes the only registry entry for the name, nothing to collide
with. (b) Keep the bridge lines but give them a real, different value pointing somewhere
else. (c) Rename tokens.css's `primary`/`primary-foreground` to dodge shadcn's vocabulary
entirely.

**Choice.** (a). There is no version of redeclaring a colliding name in the bridge that is
safe — not a different value (0007/0008's failure mode: silently wrong, not invalid) and not
the name's own value either (this failure mode: silently invalid). The only fix that can't
recreate either bug is to not redeclare the name at all. (c) is a bigger, more disruptive
change for a collision (a) already resolves cleanly, and rejected here for the same reason
0009 rejected it for border/accent.

**Consequence.** `bg-primary`/`text-primary`/`bg-primary-foreground`/`text-primary-foreground`
now resolve to tokens.css's real values in both themes, verified by a probe build and by
`getComputedStyle` on the rendered app. `:focus-visible` is visible again in light theme,
confirmed the same way, on a real focusable element, not just by reading the CSS. Every other
bridge name was re-audited against tokens.css for this exact pattern (a name that collides at
all, regardless of what value it's given); none of the remaining ones do.
`scripts/check-theme-bridge.mjs` (0009) is rewritten: its "safe if the value mirrors the
token's name" exception — exactly the reasoning 0008 used, and exactly what let this bug
through unflagged for as long as it did — is gone; any colliding name is now an error, full
stop. A second, independent check was added alongside it: build the real CSS and, in an
actual browser, verify every semantic colour's `bg-*`/`text-*` utility actually paints its
own colour, in light and both dark paths — the thing that would have caught this even if the
static rule had missed it, and that also caught a synthetic mutual cycle between two
non-colliding bridge names during verification (a case the static rule structurally cannot
see). This makes `npm run check` depend on a real Chromium build; see `README.md` for the
one-time `npx playwright install chromium` this now requires.

---

## 0013 · Added the shadcn bridge's missing `border-color` preflight reset

**Context.** Adding the first real shadcn components (Button, Checkbox, Dialog — fetched
directly from shadcn-ui/ui on GitHub, since ui.shadcn.com is blocked by this session's egress
policy) exposed a gap the bridge comment had flagged as unverified: Tailwind v4's preflight
sets bare `border`/`border-*` width utilities with `border-color: currentColor`, not any theme
token. Every fetched component uses bare `border` assuming shadcn's own classic
`* { @apply border-border }` reset, which this project never had — so `DialogContent`'s and
Button's `outline` variant's border would have rendered as `currentColor` (matching text)
instead of `--color-border`.

**Options.** (a) Add the missing global reset (`*, ::after, ::before { border-color:
var(--color-border); }`) to `index.css`'s existing `@layer base` block, matching shadcn's own
convention. (b) Patch only the three new files to use the explicit `border-border` utility
instead of bare `border`, leaving no site-wide change. (c) Leave it and accept the wrong
border colour until it's visibly noticed.

**Choice.** (a). This is exactly the kind of cross-cutting shadcn-compatibility concern the
bridge file exists to own, and the bridge comment already anticipated needing this fix once a
real component landed. Scoping the fix to only the three new files (b) would leave the same
gap for every future shadcn component to hit again.

**Consequence.** Any element anywhere in the app that uses a bare Tailwind `border` utility
now gets `--color-border` by default instead of `currentColor`. Verified with a probe build:
the compiled CSS shows the reset before any component styles, and `bg-surface-raised`/
`hover:text-foreground` are what the three new files reference instead of shadcn's
`accent`/`accent-foreground` (dropped from the bridge by 0007), per that decision's own
instruction to patch call sites by hand.

---

## 0012 · Passive detection of a conflicting decision is out of scope for v1

**Context.** Scenario S5 ("Run decided by another reviewer during review") describes two
different moments a conflict can be caught: passively, while a reviewer is just reading the
screen and someone else decides in the background; and actively, at the moment this reviewer
tries to submit their own decision and finds one is already recorded. `lib/api.ts` only
supports the second: `submitDecision` throws `DecisionConflictError` if `run.decision` is
already set. There is nothing to poll or subscribe to that would let `RunReviewPage` notice a
conflict while a reviewer is doing nothing but reading.

**Options.** (a) Build only the active form (`DecisionDialog`'s conflict state), leaving the
passive form for later. (b) Add polling to `useRun` (re-`getRun` on an interval, compare
`decision`) so a background change surfaces even without a submit attempt. (c) Add a fake
real-time channel (e.g. an event emitter in `lib/api.ts`) purely to simulate what a real
backend's websocket or long-poll would eventually do.

**Choice.** (a). (b) and (c) are both real, buildable features, but they're a distinct piece
of work — deciding how often to poll, whether to interrupt a reviewer mid-read, how to surface
a change that isn't a conflict yet (the run simply moved on) — and the task that motivated this
session asked specifically for the conflict `submitDecision` already simulates. Building the
passive form now, unasked, would be scope creep into a feature this app doesn't have the
believable backend semantics for yet (AGENTS.md: "ask before... restructuring").

**Consequence.** A reviewer who never clicks Approve/Request changes/Reject while someone else
decides in the background sees nothing change on their screen until they act — at which point
`DecisionDialog` catches it, exactly as the lighter form already does. The full S5 (a banner or
similar appearing unprompted while reading) is genuinely unbuilt, not just untested; it belongs
with whatever `useRun` needs when a real backend can push or be polled for changes.

---

## 0011 · `Run.revision` added to the data model

**Context.** The approve confirmation ("Release revision *x* to *y*") and the post-decision
view both need a real, sourced revision string. The spec's own data model only puts `revision`
on `Decision` — set once a decision exists, too late for a confirmation dialog that has to
show it *before* the reviewer decides anything. Non-negotiable 3 ("No claim without a source")
rules out putting an unsourced or made-up value in that dialog.

**Options.** (a) Add `revision: string` to `Run` itself. (b) Derive something revision-shaped
from existing fields (e.g. `Run.id`) instead of adding one. (c) Leave the confirmation text
without a concrete revision until a real backend supplies one.

**Choice.** (a). (b) would show something in the revision's place that isn't actually a
revision identifier — a different flavor of the same "invented" problem non-negotiable 3
warns against, just one level removed. (c) fails Scenario S6 and the Buttons content rule
outright, both of which give a concrete revision in their own example text. This mirrors
0004's precedent exactly: `DecisionInput` needed a field the spec's `Decision` didn't have, and
the fix there was the same — a small, deliberate, documented addition, not a workaround.

**Consequence.** Every fixture now carries a `revision`; `run-messy`'s matches its already-
recorded `decision.revision` exactly (`e91a4c`), since nothing has moved on since it was
approved. A future run that changes revision after a decision was already made — the deeper
form of staleness 0012 above scopes out — would need `Run.revision` and `Decision.revision` to
be allowed to differ; nothing here prevents that, but nothing depends on it either yet.

---

## 0010 · Run status and environment get a neutral `Tag`, not `StatusBadge`

**Context.** `RunHeader` needs to show `RunStatus` (running/blocked/awaiting_review/approved/
changes_requested/rejected) and the target environment (dev/staging/production), both with
"icon + text, never colour alone" (AGENTS.md non-negotiable 4). `StatusBadge` already does
exactly that shape of thing for `GateResult` — but its five tones are wired to
`--color-status-*`, and both `tokens.css` and `src/styles/README.md` scope those tokens
specifically to "a claim about a policy check." Neither a workflow phase nor a deployment
environment is that.

**Options.** (a) Reuse `StatusBadge`, mapping each `RunStatus`/environment value onto the
closest-feeling existing tone (e.g. `approved` → `success`, `rejected` → `danger`).
(b) Add new tones (and new `--color-status-*` tokens) for the values `StatusBadge` doesn't
already cover. (c) Build a colour-neutral `Tag` (icon + label, no tone) for anything that
needs "icon + text" but isn't a policy-check claim.

**Choice.** (c). (a) would visually conflate two different claims made by two different
parties — "this policy check passed" and "this run was approved" are not the same statement,
and `src/styles/README.md` already warns against exactly this kind of look-alike confusion for
accent vs. status. (b) solves the confusion but violates AGENTS.md's design-system target ("a
new screen can be built without adding a single new colour value") for a case that doesn't
need a new colour at all — a workflow phase doesn't need to look like a pass/fail claim to be
legible; an icon and an exact label are enough.

**Consequence.** `Tag` (`src/components/`) is now the generic building block for "icon + text,
no colour semantics" — reusable anywhere a status-shaped thing isn't actually a policy-check
result. `StatusBadge` stays scoped to `GateResult` exactly as before. If a future region needs
another non-policy status (e.g. something for `ConfidenceArea` or `Decision`), it should reach
for `Tag`, not extend `StatusBadge`'s tone set.

---

## 0009 · Shadcn-bridge/token collisions are now checked by a script, not by memory

**Context.** 0007 (`--color-accent`) and 0008 (`--color-border`) were the same bug found
twice, six commits apart: `src/styles/index.css`'s `@theme inline` block declared a custom
property under the exact name of one of our own semantic tokens, but pointed it at a
different value. Because the bridge is `@import`ed after `tokens.css`, that declaration wins
the cascade for every consumer of the name, everywhere in the app — not only inside shadcn
components. Both were only found because a component happened to be the first thing to use
that particular Tailwind class, and someone thought to run a probe build instead of trusting
the source. Nothing stopped a third name from doing the same thing silently, forever, until
something visibly broke.

**Options.** (a) Keep relying on probe builds and code review to catch this by eye, now
that it's a documented pattern to watch for. (b) Write an automated check for this specific
class of bug — any bridge declaration that shares a token's name is only valid if it mirrors
that token's value exactly — and run it as part of `npm run check`. (c) Avoid the possibility
entirely by renaming either the bridge's or the tokens' vocabulary so the two can never share
a name.

**Choice.** (b): `scripts/check-theme-bridge.mjs`. (a) is what already failed twice — a
pattern worth documenting is a pattern worth enforcing, not re-noticing. (c) would work but
means giving up shadcn's fixed naming convention (`border`, `accent`, `ring`, …) or renaming
our own tokens to dodge collisions that don't exist yet, which is a bigger, more disruptive
change for a problem a small script already solves. The script reads both `@theme` blocks as
text, matches declarations by name, and fails if a bridge value under a colliding name is
anything other than `var(--that-name)` — the one form that provably carries the token's value
through unchanged. Verified by temporarily reintroducing both the accent and the border bugs
and confirming it fails on each, then confirming it passes clean on the current files.

**Consequence.** A third collision like this now fails `npm run check` immediately, at the
name level, before anyone needs to notice a wrong colour or think to probe-build. The check
is deliberately narrow (a regex over two known blocks, not a real CSS parser) — it only knows
about this one failure mode, not shadcn-bridge correctness in general, and it would need
updating if the bridge or tokens file's structure changed shape enough to break the regex.
That's an acceptable trade for how cheaply it runs and how exactly it targets the two bugs
that already happened.

**Superseded in part by 0014.** The "only valid if it mirrors that token's value exactly"
rule above is exactly what missed the `primary`/`primary-foreground` self-reference cycle —
mirroring by name is not safe, only omitting the colliding name is. The script no longer has
that exception, and now also builds the real CSS and checks computed values in a browser,
which a text-level regex structurally cannot do. See 0014 for the full account.

---

## 0008 · Removed the shadcn bridge's `--color-border` override

**Context.** `src/styles/index.css`'s shadcn bridge redeclared `--color-border` to equal
`--color-border-subtle`, for shadcn's own fixed vocabulary. `--color-border` is also a real
semantic token in `tokens.css`, a stronger border colour than the subtle one — the same name
meaning two different things, the same collision already caught for `accent` (0007), just
missed for `border` because nothing had used `border-border`/`bg-border`/`text-border`
directly until building `ToggleChip` for the Timeline task. Verified with a probe build, not
assumed: `border-border` was silently resolving to the subtle value.

**Options.** (a) Leave it — nothing currently visible was wrong. (b) Rename our semantic
token to avoid the collision. (c) Remove the bridge's override, same as 0007 did for accent.

**Choice.** (c). Once removed, `--color-input` (which was already defined as
`var(--color-border)`) automatically resolves to our real token via the normal CSS cascade,
with no further change needed — a strictly better outcome than 0007's accent case, which is
left with no value in the bridge at all until a real component supplies one.

**Consequence.** `border-border`/`bg-border`/`text-border` now mean what `tokens.css` says
they mean, everywhere, including inside any future shadcn component. Audited the rest of
shadcn's bridge vocabulary the same way (probe-built and checked the resolved value, not
just read the source) rather than assume this was the only one: `primary` is the one other
exact-name overlap, and it isn't a collision — the bridge maps it to itself, which is only
safe because both sides already agree on the value. `secondary`, `muted`, `destructive`,
`ring` and `input` don't collide, because none of them is also one of our own token names.

**Correction (see 0014).** The claim above about `primary` being safe was wrong, and this
paragraph is left as originally written rather than edited to hide that. The bridge mapping
it "to itself" wasn't a safe mirror — it was a self-referencing CSS custom-property cycle
that silently computed to nothing in light theme, taking `--color-focus-ring` (and every
`:focus-visible` outline on the site) down with it. The probe-build audit this paragraph
describes checked whether the *value* looked right by reading the source; it didn't check
whether the property actually resolved to anything at runtime, which is the only way this
specific failure mode shows up. 0014 has the full account and the fix.

---

## 0007 · shadcn's `accent` bridge slot is dropped, not remapped

**Context.** shadcn/ui components are written against a fixed vocabulary, including
`accent`/`accent-foreground` for a quiet hover surface. The design system now has a real,
visible `--color-accent` (teal-green) — a genuine brand colour, not a hover tint. One CSS
custom property in the shadcn bridge (`src/styles/index.css`) cannot mean both.

**Options.** (a) Point shadcn's `accent` bridge slot at some neutral surface
(`--color-surface-raised`) so any generated component's hover state still resolves to
something, even though the name no longer means what shadcn intends.
(b) Drop the `accent`/`accent-foreground` mapping from the bridge entirely, and leave it
unmapped until a real component needs it.

**Choice.** (b). Silently repointing `accent` to a neutral surface would make `bg-accent`
resolve to *something* without anyone deciding it was right for that specific component — the
same failure mode as inventing a one-off value, just hidden behind an existing name.

**Consequence.** Any future shadcn component that references `bg-accent` or
`accent-foreground` will not theme itself automatically; whoever adds that component patches
it by hand to use `--color-surface-raised` (or whatever fits), the same way `ui.shadcn.com`
being blocked already means every shadcn integration in this repo is manual and unverified
until a first real component exists.

---

## 0006 · Status and accent colours are icon/border colour, never text colour

**Context.** The design system's colour spec gives one hex value per status and per brand
colour, per theme. Several of those, computed as literal text colour against the app's
surfaces, fail 4.5:1 in light theme: `--color-accent` (~3.1–3.3:1),
`--color-status-pass` (~4.0–4.3:1), `--color-status-not-applicable` on
`--color-surface-raised` specifically (4.43:1).

**Options.** (a) Darken the affected light-theme values until they clear 4.5:1 as text.
(b) Keep the given values exactly, and rule that these colours are only ever used for an icon,
a border or a swatch — never the literal colour of the label text next to them, which stays
`--color-text-primary` or `--color-text-secondary`.

**Choice.** (b). The given values are exact, and the reference mockup this task was built
from already shows label text in the ordinary text colour, not the status colour — the rule
was implicit in the source material, just not written down until now.

**Consequence.** Every status/accent-coloured icon or badge component built from here on
must keep its label in a text token, not the status colour, and this needs to be checked by
eye in review (nothing currently enforces it automatically). Icons and borders themselves are
fine at these values — they clear WCAG's 3:1 non-text threshold — so the values are not
wasted, only restricted in where they can carry text.

---

## 0005 · Contrast is verified by computing WCAG ratios, not by eye

**Context.** This task asked for every text/background pairing in the new colour spec to be
checked against 4.5:1 before finishing. Contrast is a real number, not a visual impression —
"looks readable" and "clears 4.5:1" diverge exactly at the borderline cases that matter most.

**Options.** (a) Judge each pairing visually against the rendered swatches.
(b) Compute the actual WCAG relative-luminance contrast ratio for every pairing.

**Choice.** (b), with a small script (not committed — it was scratch work, not part of the
app) implementing the standard formula: linearize each sRGB channel, take the luminance-
weighted sum, then `(L_lighter + 0.05) / (L_darker + 0.05)`.

**Consequence.** The numbers in `src/styles/README.md`, "Contrast" are exact, not estimated,
and they surfaced a real bug before it shipped: a filled primary button needs white text in
light theme but near-black in dark theme, because the dark-theme primary is a lightened
violet. A by-eye check on one theme alone would very plausibly have missed this.

---

## 0004 · `DecisionInput` carries `by`, not just what changed

**Context.** `submitDecision(runId, decision)` needs to know who is deciding. A real backend
would read that from an authenticated session, never from the request body, so the client
would not need to send it.

**Options.** (a) Add a third `reviewer` parameter to `submitDecision`. (b) Put `by` on
`DecisionInput` itself. (c) Wait until there is a real backend to decide this.

**Choice.** (b), because there is no session to read it from yet, and the task that asked for
this API specified an exact two-argument signature.

**Consequence.** `by` on `DecisionInput` is a stand-in for auth, not a design to keep: once a
real backend exists, it should read the reviewer from the session and this field should come
out. `at`, by contrast, is set by `lib/api.ts` itself, not taken from the input — a client
should not get to say when its own request happened.

---

## 0003 · The undo window is a policy, not a stored field

**Context.** The spec's data model has no field for the undo window it describes elsewhere
(Region 6, "Hierarchy and disclosure", "Acceptance criteria" all mention a counting-down undo
window after a decision), and `docs/spec-review-screen.md` gives one concrete number: "You can
undo this for 10 minutes."

**Options.** (a) Add `undoableUntil` (or similar) to `Decision`, set once at decision time.
(b) Treat the window as a fixed duration computed from `Decision.at`, not stored at all.

**Choice.** (b). It matches the one number the spec actually gives, and it means "use the data
model there" (this task's own instruction) holds literally — no field was added to `Decision`.

**Consequence.** The window length lives wherever it is computed (for now, a comment in
`src/fixtures/run-messy.ts`), not in the type. If a real system ever needs the window to vary
by risk or environment, that is the point to add the field back — a single global constant
does not fit that case.

---

## 0002 · The design system stays inside the app, for now

**Context.** `components/` and `styles/` together are the design system. The obvious
alternative is to publish them as separate packages, which is how a platform that lets AI
agents consume design standards would eventually do it.

**Options.** (a) Monorepo with `packages/ui` and `packages/tokens` from day one.
(b) Keep one app, but write the design system so it can be extracted later.

**Choice.** (b). One screen does not justify the build and release machinery of (a).

**Consequence.** The boundary has to be enforced by discipline instead of package limits:
`components/` and `styles/` never import from `features/` or `fixtures/`, and never contain
product concepts. An ESLint import rule guards this.

---

## 0001 · Light theme is the default

**Context.** The reviewer in this product is often a compliance or security person working
in bright, document-heavy environments, next to spreadsheets and PDFs.

**Options.** (a) Dark default, like most developer tools. (b) Light default, dark available.
(c) Follow the system setting only.

**Choice.** Light default, dark available, system preference respected on first load.

**Consequence.** Every component has to be designed twice, and tokens must be semantic
from day one. It also means the screenshots look unlike the usual dark AI-tool UI, which is
intentional.
