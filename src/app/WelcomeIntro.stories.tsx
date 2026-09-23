import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { WelcomeIntro } from './WelcomeIntro'

/*
 * The intro plays once and then calls `onDone`; this story replays it on demand. Playing it
 * here also sets the real `ledger:intro-seen` flag in this browser, so the app itself will skip
 * it afterwards — clear the key in DevTools to see it in the app again.
 */
function Replayable() {
  const [run, setRun] = useState(0)
  const [playing, setPlaying] = useState(true)
  return (
    <div style={{ minHeight: '100vh', padding: 'var(--space-6)' }}>
      <p className="text-body text-text-secondary">
        The page underneath. Click, tap or press any key during the intro to skip it.
      </p>
      <button
        type="button"
        className="mt-[var(--space-4)] rounded-md border border-border px-[var(--space-4)] py-[var(--space-2)] text-body"
        onClick={() => {
          setRun((n) => n + 1)
          setPlaying(true)
        }}
      >
        Replay the intro
      </button>
      {playing && <WelcomeIntro key={run} onDone={() => setPlaying(false)} />}
    </div>
  )
}

const meta = {
  title: 'App/WelcomeIntro',
  component: WelcomeIntro,
  parameters: { layout: 'fullscreen' },
  args: { onDone: () => {} },
} satisfies Meta<typeof WelcomeIntro>

export default meta
type Story = StoryObj<typeof meta>

export const Intro: Story = { render: () => <Replayable /> }
