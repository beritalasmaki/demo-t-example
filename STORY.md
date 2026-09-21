# The story behind this project

## Why I built this

There is a lot of talk about AI and software speed. I am more interested in what happens
next. Someone has to look at what the machine made. That person decides if it can be
released. They usually did not write the code. But their name is on the decision.

In healthcare, finance, defence and manufacturing, that decision matters a lot. The screen
where it happens is not just polish. It builds trust, or it loses it.

I had not worked on agent supervision before. I picked this problem to understand it.
Building something is how I learn.

## The question

**Can someone who did not write the code decide, in ten minutes, if it is safe to release?
Can they know exactly what they are approving?**

Most of the data already exists. What the agent did. Which rules it was checked against.
The tests. How sure the model was. What is missing is a screen that turns this into a
decision a person can explain later.

Show too little, and approval becomes a rubber stamp. Show everything, and people skim.
Good design sits between these two. It is mostly about order, plain language, and evidence.

## What I wanted to show

- **I design by building.** I make the design decisions. Tokens, components, states, flow.
  Then I ship them as working code.
- **I design the hard cases first.** A blocked run. Missing data. Low confidence. A decision
  made by someone else while you read the screen. The clean, easy run is simple to design.
  The hard cases are not.
- **Design can be written as a system.** Named tokens and documented components. Not just
  screenshots. Both a person and a machine can read them.
- **Restraint is a choice.** This screen looks calm and plain on purpose. The reader does not
  want to be impressed. They want something they can trust and explain later.

## How I worked

I made the design decisions. I reviewed everything the agent wrote. The agent did the
implementation work. That part is not my strength, so I leaned on it there.

I worked in stages. Each one has a reason it exists. One stage I left out on purpose.

1. **Spec.** Decide what the screen needs to do, and why, before writing any code. What a
   reviewer needs to know, in what order. The exact words for every state. Writing
   `AGENTS.md` belongs here too: deciding what a machine may and may not do is the same
   kind of judgment as deciding what a screen may and may not claim.
2. **System.** Colour tokens, fonts, and rules for how things should look and behave.
   Decided once, used everywhere after.
3. **Build, thin.** A basic working version of every part: header, checks, audit log,
   confidence, decision. States, content and tests, end to end.
4. **Compose.** Put every part together into one real page. Test it as a whole, not as
   separate pieces.
5. **Iterate.** Fix what only shows up once everything exists together. Page hierarchy.
   Navigation. Bugs that only appear in the real, composed screen.
6. **Skipped: user testing.** User testing is normally part of my process. Here, there were
   no real reviewers to test with, so I made the changes based on my own understanding of
   the problem instead. What "success" means in each scenario is my own assumption,
   written down and marked as one. It is not a finding from real people, and I want that
   to stay visible rather than hidden.

<!-- LATER: add one concrete example here — a moment where the agent got something
wrong, how I noticed, and what I changed. -->

## What I learned  <!-- LATER -->

<Two or three things. Include one that surprised me, or one I got wrong at first.>

## What I would do next  <!-- LATER -->

<Three points: what is missing, what I would test with real reviewers, what I would build
next.>

---

**Scope.** This is my own project. It is not connected to any company. It uses no real
customer data. Every run, rule and person in the sample data is made up.
