import type { Meta, StoryObj } from '@storybook/react-vite'
import { runMessy } from '../../fixtures'
import { ScoreCard } from './ScoreCard'

const area = (name: 'implementation' | 'tests' | 'side_effects') => ({
  ...runMessy.confidence.find((a) => a.area === name)!,
  missing: false as const,
})

const meta = {
  title: 'Features/Run/ScoreCard',
  component: ScoreCard,
  parameters: { layout: 'padded' },
  args: { area: area('side_effects') },
} satisfies Meta<typeof ScoreCard>

export default meta
type Story = StoryObj<typeof meta>

export const Low: Story = {}

export const Medium: Story = { args: { area: area('implementation') } }

export const High: Story = { args: { area: area('tests') } }

/** After a decision the action is dropped; the level stays. */
export const Decided: Story = { args: { decided: true } }

export const NotChecked: Story = { args: { area: { area: 'security', missing: true } } }
