import type { Meta, StoryObj } from '@storybook/react-vite'
import { RunReviewPage } from './RunReviewPage'

/*
 * The whole page, per fixture and per load state. Deciding in a story writes to the shared
 * in-memory store for the rest of the Storybook session (lib/api.ts); reload to reset.
 */
const meta = {
  title: 'Features/Run/RunReviewPage',
  component: RunReviewPage,
  parameters: { layout: 'fullscreen' },
  args: {
    runId: 'run-messy-pending',
    getRunOptions: { delayMs: 0 },
    submitDecisionOptions: { delayMs: 300 },
  },
} satisfies Meta<typeof RunReviewPage>

export default meta
type Story = StoryObj<typeof meta>

/** Design 1a: before anyone decides. */
export const AwaitingReview: Story = {}

/** Design 1b: approved, undo still open. */
export const Approved: Story = { args: { runId: 'run-messy' } }

export const FailedCheckAndException: Story = { args: { runId: 'run-blocked' } }

export const NothingOpen: Story = { args: { runId: 'run-clean' } }

export const EvidenceView: Story = { args: { defaultView: 'evidence' } }

export const AllStepsView: Story = { args: { defaultView: 'steps' } }

export const Loading: Story = { args: { getRunOptions: { delayMs: 1_000_000 } } }

export const NotFound: Story = { args: { runId: 'run-does-not-exist' } }

export const LoadFailed: Story = {
  args: { getRunOptions: { delayMs: 0, simulateNetworkError: true } },
}
