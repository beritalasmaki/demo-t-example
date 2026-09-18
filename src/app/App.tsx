/*
 * Application shell. The review screen itself lives in `src/features/run/` and is
 * not built yet; this is the scaffold's placeholder so the toolchain has
 * something real to render, typecheck and test.
 */
export default function App() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Agent run review
      </h1>
      <p className="mt-4 text-text-secondary">
        A single production-quality screen for reviewing what an AI agent changed, before a
        human releases it. The scaffolding is in place; the screen is not built yet.
      </p>
      <p className="mt-4 text-text-secondary">
        What is being built and why is described in <code>docs/spec-review-screen.md</code>. The
        rules this repository is built to are in <code>AGENTS.md</code>.
      </p>
    </main>
  )
}
