import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateRow } from './PolicyGateRow'

/*
 * One story per GateResult, plus the no-evidence edge case — six states in total. `run-messy`
 * (this feature's primary fixture) only has `pass` and `unknown` gates; `fail`, `waived` and
 * `not_applicable` are drawn from `run-blocked`, the only fixture that has them, and the
 * no-evidence case is a small local mock, since no fixture has a gate with none.
 */
const timeline: TimelineEvent[] = [
  {
    id: 't4',
    at: '2026-03-04T14:06:00Z',
    type: 'file_change',
    title: 'Added src/services/booking/rate-limiter.ts',
  },
  {
    id: 't9',
    at: '2026-03-04T14:11:00Z',
    type: 'gate_eval',
    title: 'Data retention failed.',
    detail:
      "The rate limiter's abuse log stores the requester's email address alongside their API key with no expiry.",
  },
  {
    id: 't11',
    at: '2026-03-04T14:12:00Z',
    type: 'gate_eval',
    title: 'Licensing check waived.',
  },
  {
    id: 't13',
    at: '2026-03-04T14:14:00Z',
    type: 'gate_eval',
    title: 'Accessibility check does not apply.',
    detail: 'No UI changes were detected in this revision.',
  },
  {
    id: 'm16',
    at: '2026-02-11T09:30:00Z',
    type: 'gate_eval',
    title: 'Licensing scan did not complete.',
    detail:
      'The dependency license scanner timed out after 10 minutes and was not retried before the deployment window closed.',
  },
  {
    id: 'm13',
    at: '2026-02-11T09:22:00Z',
    type: 'gate_eval',
    title: 'Security review passed.',
  },
]

const passedGate: PolicyGate = {
  id: 'security',
  name: 'Security review',
  plainLanguage:
    'Changes must not create a new way for someone outside the company to read or change data they should not have access to.',
  result: 'pass',
  evaluatedBy: 'policy-engine v2.3',
  evaluatedAt: '2026-02-11T09:22:00Z',
  evidenceIds: ['m13'],
}

const failedGate: PolicyGate = {
  id: 'data-retention',
  name: 'Data retention',
  plainLanguage: 'Personal data must be deleted within 30 days.',
  result: 'fail',
  evaluatedBy: 'policy-engine v2.3',
  evaluatedAt: '2026-03-04T14:11:00Z',
  evidenceIds: ['t4', 't9'],
}

const exceptionGate: PolicyGate = {
  id: 'licensing',
  name: 'Open-source licensing',
  plainLanguage:
    'New dependencies must use a license that allows commercial use without extra legal review.',
  result: 'waived',
  evaluatedBy: 'license-scanner v1.4',
  evaluatedAt: '2026-03-04T14:12:00Z',
  evidenceIds: ['t4', 't11'],
  waiver: {
    by: 'Owen Baptiste',
    reason:
      'Already reviewed and cleared under legal ticket LGL-4471 for the same package; no need to re-review.',
    at: '2026-03-04T15:40:00Z',
  },
}

const notApplicableGate: PolicyGate = {
  id: 'accessibility',
  name: 'Accessibility',
  plainLanguage:
    'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
  result: 'not_applicable',
  evaluatedBy: 'a11y-scanner v2.0',
  evaluatedAt: '2026-03-04T14:14:00Z',
  evidenceIds: ['t13'],
}

const notRunGate: PolicyGate = {
  id: 'licensing',
  name: 'Open-source licensing',
  plainLanguage:
    'New dependencies must use a license that allows commercial use without extra legal review.',
  result: 'unknown',
  evaluatedBy: 'license-scanner v1.4',
  evaluatedAt: '2026-02-11T09:30:00Z',
  evidenceIds: ['m16'],
}

const noEvidenceGate: PolicyGate = {
  id: 'architecture',
  name: 'Architecture review',
  plainLanguage:
    "Changes that call another team's service directly must be reviewed by the platform team first.",
  result: 'pass',
  evaluatedBy: 'Dana Whitfield',
  evaluatedAt: '2026-02-11T09:26:00Z',
  evidenceIds: [],
}

const meta = {
  title: 'Features/Run/PolicyGateRow',
  component: PolicyGateRow,
  parameters: { layout: 'padded' },
  render: (args) => (
    <ul className="max-w-2xl list-none">
      <PolicyGateRow {...args} />
    </ul>
  ),
} satisfies Meta<typeof PolicyGateRow>

export default meta
type Story = StoryObj<typeof meta>

export const Passed: Story = {
  args: { gate: passedGate, timeline, defaultOpen: true },
}

export const Failed: Story = {
  args: { gate: failedGate, timeline, defaultOpen: true },
}

export const Exception: Story = {
  args: { gate: exceptionGate, timeline, defaultOpen: true },
}

export const NotApplicable: Story = {
  args: { gate: notApplicableGate, timeline, defaultOpen: true },
}

export const NotRun: Story = {
  args: { gate: notRunGate, timeline, defaultOpen: true },
}

export const NoEvidenceAvailable: Story = {
  args: { gate: noEvidenceGate, timeline: [], defaultOpen: true },
}
