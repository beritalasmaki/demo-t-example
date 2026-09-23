import type { Run } from '../lib/types'

/**
 * Long run (200 timeline events, on purpose — see `shardVerificationEvents` below), released
 * to production, with two checks that never ran and one confidence area with no value at
 * all. See docs/spec-review-screen.md, "Fixtures to build" (3. Messy).
 *
 * `decision.at` is computed relative to `Date.now()`, not a fixed past timestamp, so this
 * fixture keeps demonstrating "an undo window still active" (docs/DECISIONS.md, 0003: the
 * window is 10 minutes from `Decision.at`, computed at read time — not a stored field)
 * whenever it is loaded, rather than only on the day it was written.
 */
const decisionAt = new Date(Date.now() - 3 * 60 * 1000).toISOString()

/**
 * A payments system this size is sharded per merchant, so verifying a refund path change
 * really does mean checking it against every shard's gateway config individually — a
 * genuine reason a real run can produce 100+ near-identical events, rather than padding for
 * the sake of it (docs/spec-review-screen.md, Acceptance criteria: "Long runs stay usable:
 * 200+ events scroll without losing the header"). Generated, not hand-written, because 180
 * hand-written near-duplicates would be harder to trust than 20 clearly-different ones —
 * but every one is a real, believable tool_call the way the rest of this fixture's events
 * are (Content rules: "realistic file paths... believable content is part of the design").
 */
const shardVerificationEvents = Array.from({ length: 180 }, (_, index) => {
  const shard = String(index + 1).padStart(3, '0')
  const at = new Date(Date.UTC(2026, 8, 23, 7, 58, 30 + index * 3))
  return {
    id: `ms${index + 1}`,
    at: at.toISOString(),
    type: 'tool_call' as const,
    title: `Checked the gateway config for shard-${shard}.`,
  }
})

export const runMessy: Run = {
  id: 'run-messy',
  initiative: 'Move refund processing to the new payment gateway',
  requestedBy: 'Maarit Kasakallio',
  // Matches decision.revision below: nothing has moved on since this run was approved.
  revision: 'e91a4c',
  target: { system: 'payments-service', environment: 'production' },
  agent: { name: 'Kestrel', version: '4.3.0', model: 'kestrel-code-14b' },
  startedAt: '2026-09-23T07:02:00Z',
  finishedAt: '2026-09-23T08:51:00Z',
  status: 'approved',
  summary: [
    {
      text: 'Moved refund processing for cancelled orders to the new payment gateway.',
      evidenceIds: ['m5', 'm6'],
    },
    {
      text: '6 files changed, 164 tests passing.',
      evidenceIds: ['m10', 'm11', 'm12'],
    },
    {
      text: 'Two checks are not run: licensing and accessibility.',
      evidenceIds: ['m16', 'm18'],
    },
  ],
  gates: [
    {
      id: 'security',
      name: 'Security review',
      plainLanguage:
        'Changes must not create a new way for someone outside the company to read or change data they should not have access to.',
      result: 'pass',
      evaluatedBy: 'policy-engine v2.3',
      evaluatedAt: '2026-09-23T08:22:00Z',
      evidenceIds: ['m5', 'm6', 'm13'],
    },
    {
      id: 'data-retention',
      name: 'Data retention',
      plainLanguage: 'Personal data must be deleted within 30 days.',
      result: 'pass',
      evaluatedBy: 'policy-engine v2.3',
      evaluatedAt: '2026-09-23T08:24:00Z',
      evidenceIds: ['m5', 'm6', 'm14'],
    },
    {
      id: 'architecture',
      name: 'Architecture review',
      plainLanguage:
        "Changes that call another team's service directly must be reviewed by the platform team first.",
      result: 'pass',
      evaluatedBy: 'Aino Lehtomäki',
      evaluatedAt: '2026-09-23T08:26:00Z',
      evidenceIds: ['m5', 'm6', 'm7', 'm15'],
    },
    {
      id: 'licensing',
      name: 'Open-source licensing',
      plainLanguage:
        'New dependencies must use a license that allows commercial use without extra legal review.',
      result: 'unknown',
      evaluatedBy: 'license-scanner v1.4',
      evaluatedAt: '2026-09-23T08:30:00Z',
      evidenceIds: ['m5', 'm16'],
    },
    {
      id: 'test-coverage',
      name: 'Test coverage',
      plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
      result: 'pass',
      evaluatedBy: 'coverage-gate v3.1',
      evaluatedAt: '2026-09-23T08:33:00Z',
      evidenceIds: ['m10', 'm11', 'm17'],
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      plainLanguage:
        'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
      result: 'unknown',
      evaluatedBy: 'a11y-scanner v2.0',
      evaluatedAt: '2026-09-23T08:41:00Z',
      evidenceIds: ['m9', 'm18'],
    },
  ],
  timeline: [
    {
      id: 'm1',
      at: '2026-09-23T07:02:00Z',
      type: 'plan',
      title: "Planned moving refund processing to the new payment gateway's refund endpoint.",
    },
    {
      id: 'm2',
      at: '2026-09-23T07:05:00Z',
      type: 'tool_call',
      title: 'Read src/services/payments/refunds.ts to find the current refund call.',
    },
    {
      id: 'm3',
      at: '2026-09-23T07:07:00Z',
      type: 'tool_call',
      title: 'Read src/services/payments/gateway-legacy-client.ts for the existing gateway client.',
    },
    {
      id: 'm4',
      at: '2026-09-23T07:12:00Z',
      type: 'tool_call',
      title: "Called the new payment gateway's sandbox API.",
      detail: "Confirmed the refund endpoint's request shape and its timeout behaviour.",
    },
    {
      id: 'm5',
      at: '2026-09-23T07:24:00Z',
      type: 'file_change',
      title: 'Added src/services/payments/gateway-client.ts',
      detail: "New client for the payment gateway's refund endpoint.",
      artefactIds: ['src/services/payments/gateway-client.ts'],
    },
    {
      id: 'm6',
      at: '2026-09-23T07:31:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/refunds.ts',
      detail: 'Calls the new gateway client instead of the legacy one for cancelled-order refunds.',
      artefactIds: ['src/services/payments/refunds.ts'],
    },
    {
      id: 'm7',
      at: '2026-09-23T07:39:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/reconciliation.ts',
      detail: "Reads refund status from the new gateway's response shape.",
      artefactIds: ['src/services/payments/reconciliation.ts'],
    },
    {
      id: 'm8',
      at: '2026-09-23T07:44:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/order-events.ts',
      detail:
        "Emits the existing 'refund.issued' event unchanged, now sourced from the new gateway's callback.",
      artefactIds: ['src/services/payments/order-events.ts'],
    },
    {
      id: 'm9',
      at: '2026-09-23T07:50:00Z',
      type: 'file_change',
      title: 'Edited src/ops-dashboard/order-status-label.ts',
      detail:
        "Shows 'Refunded' once the new gateway confirms the refund, matching the previous wording.",
      artefactIds: ['src/ops-dashboard/order-status-label.ts'],
    },
    {
      id: 'm10',
      at: '2026-09-23T07:58:00Z',
      type: 'file_change',
      title: 'Added src/services/payments/gateway-client.test.ts',
      detail: 'Unit tests for the new client, including a timeout case.',
      artefactIds: ['src/services/payments/gateway-client.test.ts'],
    },
    ...shardVerificationEvents,
    {
      id: 'm11',
      at: '2026-09-23T08:10:00Z',
      type: 'test_run',
      title: 'Ran the payments service test suite.',
      detail:
        '162 passed, covering the new client and the updated refund and reconciliation paths.',
    },
    {
      id: 'm12',
      at: '2026-09-23T08:18:00Z',
      type: 'test_run',
      title: 'Ran the integration suite against the payment gateway sandbox.',
      detail: '2 passed: a full refund, and a refund retried after a simulated timeout.',
    },
    {
      id: 'm13',
      at: '2026-09-23T08:22:00Z',
      type: 'gate_eval',
      title: 'Security review passed.',
    },
    {
      id: 'm14',
      at: '2026-09-23T08:24:00Z',
      type: 'gate_eval',
      title: 'Data retention passed.',
    },
    {
      id: 'm15',
      at: '2026-09-23T08:26:00Z',
      type: 'gate_eval',
      title: 'Architecture review passed.',
      detail: 'Reviewed by Aino Lehtomäki: the new client is called only from this service.',
    },
    {
      id: 'm16',
      at: '2026-09-23T08:30:00Z',
      type: 'gate_eval',
      title: 'Licensing scan did not complete.',
      detail:
        'The dependency license scanner timed out after 10 minutes and was not retried before the deployment window closed.',
      severity: 'warning',
    },
    {
      id: 'm17',
      at: '2026-09-23T08:33:00Z',
      type: 'gate_eval',
      title: 'Test coverage passed.',
    },
    {
      id: 'm18',
      at: '2026-09-23T08:41:00Z',
      type: 'gate_eval',
      title: 'Accessibility check did not complete.',
      detail:
        'The accessibility scanner could not reach the staging environment before the deployment window closed.',
      severity: 'warning',
    },
    {
      id: 'm19',
      at: '2026-09-23T08:45:00Z',
      type: 'note',
      title: 'The nightly reconciliation job was not re-run against this change.',
      detail: 'It next runs at 02:00.',
      severity: 'warning',
    },
    {
      id: 'm20',
      at: '2026-09-23T08:48:00Z',
      type: 'tool_call',
      title: 'Searched the codebase for other callers of the legacy gateway client.',
      detail: 'Found none outside src/services/payments/.',
    },
  ],
  confidence: [
    {
      area: 'implementation',
      value: 0.81,
      basis:
        'Based on the six changed files and a search for other places that use the old gateway client.',
      rationale:
        "The refund flow, the reconciliation job and the dashboard label all now read from the new gateway's response.",
      unverified: ['Whether a scheduled job still uses the old client’s types.'],
    },
    {
      area: 'tests',
      value: 0.88,
      basis:
        "Based on 162 unit tests and 2 larger tests against the gateway's test system, all passing.",
      rationale:
        'Covers the new client, the updated refund and reconciliation paths, and a gateway timeout.',
      unverified: ['What happens if the gateway is down for longer than the retry time.'],
    },
    {
      area: 'side_effects',
      value: 0.52,
      basis:
        'Based only on two days of test-system logs. No duplicate refunds appeared there, but the test system has far less traffic than production.',
      rationale:
        'The change only moves where refunds are sent, but the new gateway answers in a different order than the old one.',
      unverified: [
        'Whether two refunds for the same order might clash under load.',
        'The effect on the 02:00 reconciliation job, which has not run against this change yet.',
      ],
    },
    // No entry for "security": the model reported no confidence value for this area at all.
  ],
  decision: {
    outcome: 'approved',
    by: 'Juhani Virtaleppäsoutu',
    at: decisionAt,
    // Required for this approval: two checks did not run (docs/DECISIONS.md, 0040).
    reason:
      'Licensing and accessibility do not apply here: no new dependencies were added, and the only screen change is one status label with the same wording as before.',
    acknowledgedItemIds: ['open-gates-unknown', 'open-confidence-side_effects', 'open-note-m19'],
    revision: 'e91a4c',
  },
  assignment: {
    context:
      'The shop is moving refunds from its old payment provider to a new one. The old provider will stop working at the end of the quarter.',
    by: 'Maarit Kasakallio',
    reason:
      'it is well defined and repeats the same work in many places, such as checking 180 merchant settings one by one.',
  },
  story: [
    {
      id: 'plan',
      label: 'Plan',
      text: 'The agent planned to send refunds for cancelled orders through the new payment gateway instead of the old client.',
      evidenceIds: ['m1'],
    },
    {
      id: 'reading',
      label: 'Reading the code',
      text: "It read the current refund call and the old gateway client, then called the gateway's test API to check the request format and what happens on a timeout.",
      evidenceIds: ['m2', 'm3', 'm4'],
      linkToSteps: true,
    },
    {
      id: 'files',
      label: '6 files changed',
      text: 'It added a new client for the refund endpoint, then moved the refund path, the reconciliation job, the order-event sender and the dashboard status label onto it. The refund.issued event stays the same.',
      evidenceIds: ['m5', 'm6', 'm7', 'm8', 'm9', 'm10'],
      confidenceAreas: ['implementation'],
    },
    {
      id: 'shards',
      label: 'Shard checks',
      text: 'This payments system is split per merchant, so the agent checked the gateway settings for all 180 parts, one by one. None of them disagreed.',
      evidenceIds: shardVerificationEvents.map((event) => event.id),
      linkToSteps: true,
    },
    {
      id: 'tests',
      label: 'Tests',
      text: "162 unit tests passed for the new client and the updated refund and reconciliation paths. Two larger tests ran against the gateway's test system: one full refund, and one refund repeated after a timeout.",
      evidenceIds: ['m11', 'm12'],
      confidenceAreas: ['tests'],
    },
    {
      id: 'checks',
      label: 'Policy checks',
      text: 'Four of six checks passed: security, data retention, test coverage, and the architecture review. Two checks gave no result at all.',
      evidenceIds: ['m13', 'm14', 'm15', 'm16', 'm17', 'm18'],
      gateIds: [
        'security',
        'data-retention',
        'architecture',
        'test-coverage',
        'licensing',
        'accessibility',
      ],
      confidenceAreas: ['security'],
    },
    {
      id: 'open',
      label: 'Open items',
      text: 'The nightly reconciliation job has not run against this change; it runs next at 02:00. A search found no other users of the old gateway client outside this service.',
      evidenceIds: ['m19', 'm20'],
      confidenceAreas: ['side_effects'],
    },
  ],
}

/**
 * The same run one moment before anyone decided — design 1a ("Before anyone decides"). Kept as
 * a separate fixture rather than replacing `runMessy`: the spec's fixture list asks for a messy
 * run with a decision already recorded (design 1b), and the pending state is the one the page
 * opens on by default.
 */
export const runMessyPending: Run = {
  ...runMessy,
  id: 'run-messy-pending',
  status: 'awaiting_review',
  decision: undefined,
}
