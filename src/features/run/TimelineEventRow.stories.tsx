import type { Meta, StoryObj } from '@storybook/react-vite'
import type { TimelineEvent } from '../../lib/types'
import { TimelineEventRow } from './TimelineEventRow'

const meta = {
  title: 'Features/Run/TimelineEventRow',
  component: TimelineEventRow,
  parameters: { layout: 'padded' },
  render: (args) => (
    <ul className="flex max-w-2xl flex-col gap-2">
      <TimelineEventRow {...args} />
    </ul>
  ),
} satisfies Meta<typeof TimelineEventRow>

export default meta
type Story = StoryObj<typeof meta>

const plan: TimelineEvent = {
  id: 'e1',
  at: '2026-02-11T08:02:00Z',
  type: 'plan',
  title: "Planned moving refund processing to the new payment gateway's refund endpoint.",
}

const toolCall: TimelineEvent = {
  id: 'e2',
  at: '2026-02-11T08:12:00Z',
  type: 'tool_call',
  title: "Called the new payment gateway's sandbox API.",
  detail: "Confirmed the refund endpoint's request shape and its timeout behaviour.",
}

const fileChange: TimelineEvent = {
  id: 'e3',
  at: '2026-02-11T08:24:00Z',
  type: 'file_change',
  title: 'Added src/services/payments/gateway-client.ts',
  detail: "New client for the payment gateway's refund endpoint.",
  artefactIds: ['src/services/payments/gateway-client.ts'],
}

const testRun: TimelineEvent = {
  id: 'e4',
  at: '2026-02-11T09:10:00Z',
  type: 'test_run',
  title: 'Ran the payments service test suite.',
  detail: '162 passed, covering the new client and the updated refund and reconciliation paths.',
}

const gateEval: TimelineEvent = {
  id: 'e5',
  at: '2026-02-11T09:22:00Z',
  type: 'gate_eval',
  title: 'Security review passed.',
}

const errorEvent: TimelineEvent = {
  id: 'e6',
  at: '2026-03-04T14:08:00Z',
  type: 'error',
  title: 'Test run failed to start.',
  detail:
    'Could not reach the Redis instance used for rate-limiter state in tests (connection refused).',
  severity: 'error',
}

const retryEvent: TimelineEvent = {
  id: 'e7',
  at: '2026-03-04T14:09:00Z',
  type: 'test_run',
  title: 'Retried the test suite.',
  detail: 'Redis connection succeeded on retry. 14 new and 96 existing tests passing.',
}

const note: TimelineEvent = {
  id: 'e8',
  at: '2026-02-11T09:45:00Z',
  type: 'note',
  title: 'The nightly reconciliation job was not re-run against this change.',
  detail: 'It next runs at 02:00.',
  severity: 'warning',
}

export const Plan: Story = { args: { event: plan } }
export const ToolCall: Story = { args: { event: toolCall } }
export const FileChange: Story = { args: { event: fileChange } }
export const TestRun: Story = { args: { event: testRun } }
export const GateEval: Story = { args: { event: gateEval } }
export const Error: Story = { args: { event: errorEvent } }
export const Retry: Story = { args: { event: retryEvent } }
export const Note: Story = { args: { event: note } }

export const ForcedVisibleDespiteFilters: Story = {
  args: { event: errorEvent, forcedVisible: true },
}
