# Design Explorations & Layout Drafts

This folder holds the design work for **Ledger**, a portfolio project. Ledger is a review page. An AI agent changes a company's software. Before the change goes live, a person must look at what the agent did and decide: approve it, ask for changes, or reject it.

Ledger is not linked to any company. All people, runs and events are made up.

## The question

Can someone who did not write the code decide, in ten minutes, if a change is safe to release? And can they explain later exactly what they approved?

Most of the data already exists: what the agent did, which checks it passed, the tests, and how sure the agent was. What is missing is a page that turns this data into a decision a person can explain.

## Files

| File                     | What it is                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `iteration2-design-v3`   | Third and more advanced version of the page. Changes done after iteration phase 2.                                                            |
| `ledger-design-v2.0.png` | Second and more advanced version of the page designed in Claude Design.                                                                       |
| `early-design-v1.png`    | First fast mock-up for the page just to perceive what needs to be added to the page. Made by human in Figma to understand the concept better. |
| `Project timeline`       | A 16-week plan for building a service like this in a real company.                                                                            |
| `User Journey Map`       | Example of how I do User Journey Mapping. In this file we explore how a reviewer gets to the page, and what happens after they decide.        |

## 1. Review page designs

I sketched the first version by hand to quickly map out all the necessary pieces. However, it lacked visual hierarchy: it had six equally sized cards, the main decision was buried down the page, and the audit log was just a heavy wall of text.

In the second version, we introduced a clear order. We improved the visual layout and refined the user journeys to make the most important actions stand out.

**Main design decisions**

- **Open items first.** What the run could not finish is at the top, above all details.
- **Every score is explained.** Each confidence score has a level (high, medium, low), an action ("check this yourself before approving"), and the sentence that explains what it is based on.
- **Safer decisions in high-risk cases.** For a change to payments in production, the reviewer ticks each open item separately and must write a reason before approving.
- **Clear order for the buttons.** _Approve and release_ is the only dark button. _Request changes_ and _Reject run_ sit below a divider ("or, if it is not ready"). Each button says what happens next. _Undo_ has its own box, away from the other actions.
- **A next step for every failure.** A check that did not run offers _Run check again_.
- **People are always visible.** When a real person did something, their name is shown in a user pill, so human work never looks like agent work.
- **Works inside another platform.** The page has no logo or main menu of its own. Run names such as `e91a4c` or `run-messy` are labelled fields with a short info text.
- **Plain language.** Short sentences, one date and time format (24-hour clock, with time zone), and button names written exactly as they appear.

## 2. Reviewer journey map

The map follows Juhani, a release reviewer, through nine stages in three parts:

- **Before the page:** a change is requested, the agent does the work, Juhani is asked to review.
- **On the review page (about 10 minutes):** he gets the picture, checks the evidence, and decides.
- **After the decision:** he can still undo, the change meets real traffic, and weeks later someone asks why.

For each stage the map shows who is involved, what happens, what Juhani asks himself, how he feels, what can go wrong, and how the design helps. The lowest point is checking the evidence. The most important moment is weeks later, when the record must show what he knew.

Not designed yet: the message that asks a reviewer to review, and the alert if something goes wrong after release.

## 3. Project timeline

A typical 16-week plan to build new digital product / service for a regulated company, such as finance or healthcare.

- **Research and discovery (weeks 1–5):** kickoff, link to company strategy, legal review (this starts first), interviews and shadowing, competitor analysis, review of today's process and data, synthesis, metrics and goals for 6 and 12 months, problem statement, and product strategy and roadmap.
- **Design (weeks 5–10):** flows, page structure, wireframes, UI design and plain-language text.
- **Design system and DesignOps (weeks 2–11):** audit what exists, set up files, tools and handoff, build tokens and shared components in Storybook, and check the built page against the design with engineers.
- **Code (weeks 6–11):** data contract and test data, front-end build, and automated tests.
- **Testing (weeks 6.5–12):** two rounds of usability tests, fixes, an accessibility audit (WCAG 2.1 AA), and a security and compliance review.
- **Launch (weeks 12–16):** handover, a two-week pilot with one team, and launch to all teams.

**Decision points:** problem and strategy agreed, design sign-off, go / no-go for the pilot, and launch.

**Increments:** after the strategy is agreed, the team works in short increments. At the end of each one, they check the work against the strategy and roadmap, and change the plan if they need to. The plan uses two weeks as an example. It is not tied to Scrum, and a start-up can use any rhythm.

## Principles used

The designs follow ideas from two guides, and one broader design philosophy. They follow the principles, not the visual style.

**Apple's human-first design.** Put the person's understanding ahead of the technology. Explain technical words the first time they appear. Write button names exactly as they appear. Use can, might and may carefully. Use one clear format for dates and times.

**Google People + AI Guidebook.** Help people trust an AI system the right amount. Explain confidence scores and the data behind them. Ask for more care when the risk is high. Give a way forward when something fails.
The designs use ideas from two guides. They follow the principles, not the visual style.

## Built on

The designs use the tokens from the Ledger code repository e.g. Raleway and Montserrat fonts, colours, and a 4 px spacing scale.
