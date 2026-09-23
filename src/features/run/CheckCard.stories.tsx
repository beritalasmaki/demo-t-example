import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import { CheckCard } from './CheckCard'

const gate = (run: typeof runMessy, id: string) => run.gates.find((g) => g.id === id)!

const meta = {
  title: 'Features/Run/CheckCard',
  component: CheckCard,
  parameters: { layout: 'padded' },
  args: { gate: gate(runMessy, 'licensing'), timeline: runMessy.timeline, actionable: true },
} satisfies Meta<typeof CheckCard>

export default meta
type Story = StoryObj<typeof meta>

/** "Run check again" is the way forward before a decision. */
export const NotRun: Story = {}

export const NotRunAfterDecision: Story = { args: { actionable: false } }

export const Failed: Story = {
  args: { gate: gate(runBlocked, 'data-retention'), timeline: runBlocked.timeline },
}

export const Exception: Story = {
  args: { gate: gate(runBlocked, 'licensing'), timeline: runBlocked.timeline },
}
