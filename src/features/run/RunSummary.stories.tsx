import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean } from '../../fixtures'
import { RunSummary } from './RunSummary'

const meta = {
  title: 'Features/Run/RunSummary',
  component: RunSummary,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RunSummary>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeSentences: Story = {
  args: { summary: runClean.summary, timeline: runClean.timeline },
}

export const FiveSentences: Story = {
  args: { summary: runBlocked.summary, timeline: runBlocked.timeline },
}

export const ASentenceWithNoEvidenceDoesNotRender: Story = {
  args: {
    summary: [
      ...runClean.summary,
      { text: 'An unsupported claim with no real evidence behind it.', evidenceIds: ['nope'] },
    ],
    timeline: runClean.timeline,
  },
}

export const Loading: Story = {
  args: { summary: [], timeline: [], isLoading: true },
}

export const NoSummaryAvailable: Story = {
  args: { summary: [{ text: 'Nothing resolvable.', evidenceIds: ['missing'] }], timeline: [] },
}
