---
name: worklog-entry
description: Use at the end of every work session, before finishing, to write the docs/WORKLOG.md entry and ask the human the end-of-session question.
---

# Writing the worklog entry

Read `docs/WORKLOG.md` for the template before writing. Do this every session, no exceptions,
even for a short one — short sessions are the ones most likely to be skipped and most likely
to be forgotten later.

## Write for a designer learning to do this by hand

The reader did not write the code and may not know the tools. Every field should make sense
to someone who wants to repeat the work manually:

- **Steps, in order** — actual commands run (`npm install …`, `npx shadcn@latest add …`),
  not a paraphrase of what happened
- **Why it was done this way** — the reasoning, especially for anything non-obvious. If the
  choice has a real trade-off, add it to `docs/DECISIONS.md` too, not just here
- **How to do this by hand** — skip only if it is identical to "Steps, in order"
- **Verification** — the actual command run and what it returned, not "tests pass"

## Then ask, do not write, the end-of-session question

After the entry is written, ask the human directly in the conversation:

> "Anything from this session worth writing down — something that surprised you, something
> I got wrong, or a decision you changed your mind about?"

Their answer goes into their own notes, not into this repository. Do not create or write to
any notes file — just ask, and leave it with them.

## Keep it short

The worklog is a log, not a report. If an entry is getting long, the "why" section is usually
doing too much — move detail into `docs/DECISIONS.md` and link to it instead.
