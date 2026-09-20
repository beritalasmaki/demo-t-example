import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import type { TimelineEvent } from '../../lib/types'
import { Timeline } from './Timeline'

const meta = {
  title: 'Features/Run/Timeline',
  component: Timeline,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

/** The primary fixture for this feature: 200 real events, proving the "stays usable at 200+
 * events" requirement for real rather than in a synthetic story-only dataset. */
export const Messy: Story = {
  args: { events: runMessy.timeline, startedAt: runMessy.startedAt },
}

/** The error-and-retry case: run-blocked's one error, immediately followed by its retry. */
export const Blocked: Story = {
  args: { events: runBlocked.timeline, startedAt: runBlocked.startedAt },
}

export const Empty: Story = {
  // Computed relative to now, like run-messy.ts's decision.at, so this keeps demonstrating
  // "a run that just started" whenever the story is loaded, not only on the day it was written.
  args: { events: [], startedAt: new Date(Date.now() - 20_000).toISOString() },
}

export const Loading: Story = {
  args: { events: [], startedAt: new Date().toISOString(), isLoading: true },
}

const filteredEvents: TimelineEvent[] = [
  { id: 'f1', at: '2026-03-04T14:02:00Z', type: 'plan', title: 'Planned the change.' },
  { id: 'f2', at: '2026-03-04T14:03:00Z', type: 'tool_call', title: 'Read the config file.' },
  { id: 'f3', at: '2026-03-04T14:04:00Z', type: 'file_change', title: 'Edited the config file.' },
  {
    id: 'f4',
    at: '2026-03-04T14:05:00Z',
    type: 'error',
    title: 'Test run failed to start.',
    severity: 'error',
  },
  { id: 'f5', at: '2026-03-04T14:06:00Z', type: 'test_run', title: 'Retried the test suite.' },
  { id: 'f6', at: '2026-03-04T14:07:00Z', type: 'test_run', title: 'Ran the full suite.' },
  { id: 'f7', at: '2026-03-04T14:08:00Z', type: 'gate_eval', title: 'Security review passed.' },
]

/** Only "plan" is active on load — everything else is filtered out, except the error and the
 * retry, which stay visible with a note explaining why, and don't count toward "hidden". */
export const Filtered: Story = {
  args: {
    events: filteredEvents,
    startedAt: '2026-03-04T14:02:00Z',
    defaultActiveTypes: new Set<TimelineEvent['type']>(['plan']),
  },
}
