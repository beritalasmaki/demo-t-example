import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import type { PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateList } from './PolicyGateList'

const meta = {
  title: 'Features/Run/PolicyGateList',
  component: PolicyGateList,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PolicyGateList>

export default meta
type Story = StoryObj<typeof meta>

/** The primary fixture for this feature — see docs/spec-review-screen.md, though it only
 * has `pass` and `unknown` gates (`Blocked` and `AllResults` below cover the rest). */
export const Messy: Story = {
  args: { gates: runMessy.gates, timeline: runMessy.timeline },
}

/** The only fixture with `fail`, `waived` and `not_applicable` gates. */
export const Blocked: Story = {
  args: { gates: runBlocked.gates, timeline: runBlocked.timeline },
}

const allResultsTimeline: TimelineEvent[] = [
  {
    id: 'e1',
    at: '2026-04-01T09:00:00Z',
    type: 'gate_eval',
    title: 'Data retention failed.',
    detail: 'A new log table stores customer email addresses with no expiry.',
  },
  {
    id: 'e2',
    at: '2026-04-01T09:05:00Z',
    type: 'gate_eval',
    title: 'Licensing check waived.',
  },
  {
    id: 'e3',
    at: '2026-04-01T09:10:00Z',
    type: 'gate_eval',
    title: 'Accessibility scan did not complete.',
    detail: 'The accessibility scanner could not reach the staging environment.',
  },
  {
    id: 'e4',
    at: '2026-04-01T09:12:00Z',
    type: 'gate_eval',
    title: 'Architecture review does not apply.',
    detail: 'No new service call was introduced.',
  },
  {
    id: 'e5',
    at: '2026-04-01T09:15:00Z',
    type: 'gate_eval',
    title: 'Security review passed.',
  },
]

const allResultsGates: PolicyGate[] = [
  {
    id: 'test-coverage',
    name: 'Test coverage',
    plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
    result: 'pass',
    evaluatedBy: 'coverage-gate v3.1',
    evaluatedAt: '2026-04-01T09:15:00Z',
    evidenceIds: ['e5'],
  },
  {
    id: 'architecture',
    name: 'Architecture review',
    plainLanguage:
      "Changes that call another team's service directly must be reviewed by the platform team first.",
    result: 'not_applicable',
    evaluatedBy: 'Dana Whitfield',
    evaluatedAt: '2026-04-01T09:12:00Z',
    evidenceIds: ['e4'],
  },
  {
    id: 'accessibility',
    name: 'Accessibility',
    plainLanguage:
      'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
    result: 'unknown',
    evaluatedBy: 'a11y-scanner v2.0',
    evaluatedAt: '2026-04-01T09:10:00Z',
    evidenceIds: ['e3'],
  },
  {
    id: 'licensing',
    name: 'Open-source licensing',
    plainLanguage:
      'New dependencies must use a license that allows commercial use without extra legal review.',
    result: 'waived',
    evaluatedBy: 'license-scanner v1.4',
    evaluatedAt: '2026-04-01T09:05:00Z',
    evidenceIds: ['e2'],
    waiver: {
      by: 'Owen Baptiste',
      reason: 'Already reviewed and cleared under legal ticket LGL-4471 for the same package.',
      at: '2026-04-01T10:00:00Z',
    },
  },
  {
    id: 'data-retention',
    name: 'Data retention',
    plainLanguage: 'Personal data must be deleted within 30 days.',
    result: 'fail',
    evaluatedBy: 'policy-engine v2.3',
    evaluatedAt: '2026-04-01T09:00:00Z',
    evidenceIds: ['e1'],
  },
]

/** One gate of each of the five results, deliberately listed here out of sort order, so the
 * story also demonstrates the sort itself: failed and the exception first, then not run
 * (unknown), then not applicable, then passed. */
export const AllResults: Story = {
  args: { gates: allResultsGates, timeline: allResultsTimeline },
}

export const Empty: Story = {
  args: { gates: [], timeline: [] },
}

export const Loading: Story = {
  args: { gates: [], timeline: [], isLoading: true },
}
