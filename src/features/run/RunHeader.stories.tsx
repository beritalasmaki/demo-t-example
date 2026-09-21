import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runClean, runMessy } from '../../fixtures'
import type { Run } from '../../lib/types'
import { RunHeader } from './RunHeader'

/*
 * One story per RunStatus (six, per docs/spec-review-screen.md's exact label list) and one
 * per environment (three), plus the long-initiative truncation case. Only two statuses
 * (`awaiting_review`, `approved`) and two environments (`staging`, `production`) actually
 * occur across the three real fixtures, so the rest are `runClean` with the field overridden
 * — still real, believable data (Content rules), just not the status/environment that
 * fixture originally recorded.
 */
const meta = {
  title: 'Features/Run/RunHeader',
  component: RunHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RunHeader>

export default meta
type Story = StoryObj<typeof meta>

function withRun(run: Run, overrides: Partial<Run>): Run {
  return { ...run, ...overrides }
}

export const Running: Story = {
  args: { run: withRun(runClean, { status: 'running', finishedAt: undefined }) },
}

export const Blocked: Story = {
  args: { run: withRun(runClean, { status: 'blocked' }) },
}

export const AwaitingReview: Story = {
  args: { run: runClean },
}

export const Approved: Story = {
  args: { run: runMessy },
}

export const ChangesRequested: Story = {
  args: { run: withRun(runBlocked, { status: 'changes_requested' }) },
}

export const Rejected: Story = {
  args: { run: withRun(runBlocked, { status: 'rejected' }) },
}

export const DevelopmentEnvironment: Story = {
  args: {
    run: withRun(runClean, { target: { ...runClean.target, environment: 'dev' } }),
  },
}

export const ProductionEnvironment: Story = {
  args: { run: runMessy },
}

export const LongInitiativeName: Story = {
  args: {
    run: withRun(runClean, {
      initiative:
        'Migrate the appointment history export pipeline off the deprecated internal reporting service and onto the new managed data warehouse connector, keeping the existing CSV column order',
    }),
  },
}
