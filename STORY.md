# The story behind this project

## Why I built this

Most talk about AI and software is about speed. I am more interested in what happens next.
Someone has to look at what the machine made and decide if it can be released. That person
usually did not write the code. But their name is on the decision.

In healthcare, finance, defence and manufacturing, that decision carries real weight. The
screen where it happens is not the last bit of polish. It either earns trust or loses it.

I had not worked on agent supervision before. I picked this problem because I wanted to
understand it. Building something is how I learn.

## The question

**Can someone who did not write the code decide, in ten minutes, if it is safe to release —
and know exactly what they are signing?**

The data is mostly there already: what the agent did, which rules it was checked against, the
tests, how sure the model was. What is missing is a screen that turns all of it into a decision
a person can defend later.

Show too little, and approval becomes a rubber stamp. Show everything, and people skim.
The design work sits in that gap. It is mostly about order, language and evidence.

## What I wanted to show

- **I design by building.** I make the design decisions — tokens, components, states, flow —
  and ship them as working code.
- **I design the hard cases.** Blocked runs, missing data, low confidence, a decision made by
  someone else while you read the screen. The clean run is the easy part.
- **Design can be written as a system.** Named tokens and documented components, not
  screenshots. A person and a machine can both read them.
- **Restraint is a choice.** This looks calm and document-like on purpose. The reader does
  not want to be impressed. They want something they can defend.

## How I worked  <!-- LATER -->

I made the design decisions and reviewed everything the agent wrote. The agent did the
implementation work that is not my strength.

The instructions in `AGENTS.md` are design work too. Deciding what a machine may and may
not do here is the same kind of judgment as deciding what a screen may and may not claim.

One moment where my judgment changed the result: Claude built DecisionDialog, everything passed in isolation: 170 tests, every story screenshotted. But it insisted on also running the real composed app in a real browser before calling it done, and found two bugs that nothing else had caught: dialogs that closed themselves immediately after opening, and a submit button that could hang forever. Neither would have shipped if "tests pass" had been the bar.

## What I learned  <!-- LATER -->

<Two or three things. Include one that surprised me, or that I got wrong first.>

## What I would do next  <!-- LATER -->

<Three bullets: what is missing, what I would test with real reviewers, what I would build
second.>

---

**Scope.** This is my own exercise. It is not connected to any company and uses no real
customer data. Every run, rule and person in the sample data is invented.
