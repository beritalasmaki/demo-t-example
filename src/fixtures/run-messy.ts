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
  const at = new Date(Date.UTC(2026, 1, 11, 8, 58, 30 + index * 3))
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
  requestedBy: 'Leah Fontaine',
  target: { system: 'payments-service', environment: 'production' },
  agent: { name: 'Kestrel', version: '4.3.0', model: 'kestrel-code-14b' },
  startedAt: '2026-02-11T08:02:00Z',
  finishedAt: '2026-02-11T09:51:00Z',
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
      evaluatedAt: '2026-02-11T09:22:00Z',
      evidenceIds: ['m5', 'm6', 'm13'],
    },
    {
      id: 'data-retention',
      name: 'Data retention',
      plainLanguage: 'Personal data must be deleted within 30 days.',
      result: 'pass',
      evaluatedBy: 'policy-engine v2.3',
      evaluatedAt: '2026-02-11T09:24:00Z',
      evidenceIds: ['m5', 'm6', 'm14'],
    },
    {
      id: 'architecture',
      name: 'Architecture review',
      plainLanguage:
        "Changes that call another team's service directly must be reviewed by the platform team first.",
      result: 'pass',
      evaluatedBy: 'Dana Whitfield',
      evaluatedAt: '2026-02-11T09:26:00Z',
      evidenceIds: ['m5', 'm6', 'm7', 'm15'],
    },
    {
      id: 'licensing',
      name: 'Open-source licensing',
      plainLanguage:
        'New dependencies must use a license that allows commercial use without extra legal review.',
      result: 'unknown',
      evaluatedBy: 'license-scanner v1.4',
      evaluatedAt: '2026-02-11T09:30:00Z',
      evidenceIds: ['m5', 'm16'],
    },
    {
      id: 'test-coverage',
      name: 'Test coverage',
      plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
      result: 'pass',
      evaluatedBy: 'coverage-gate v3.1',
      evaluatedAt: '2026-02-11T09:33:00Z',
      evidenceIds: ['m10', 'm11', 'm17'],
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      plainLanguage:
        'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
      result: 'unknown',
      evaluatedBy: 'a11y-scanner v2.0',
      evaluatedAt: '2026-02-11T09:41:00Z',
      evidenceIds: ['m9', 'm18'],
    },
  ],
  timeline: [
    {
      id: 'm1',
      at: '2026-02-11T08:02:00Z',
      type: 'plan',
      title: "Planned moving refund processing to the new payment gateway's refund endpoint.",
    },
    {
      id: 'm2',
      at: '2026-02-11T08:05:00Z',
      type: 'tool_call',
      title: 'Read src/services/payments/refunds.ts to find the current refund call.',
    },
    {
      id: 'm3',
      at: '2026-02-11T08:07:00Z',
      type: 'tool_call',
      title: 'Read src/services/payments/gateway-legacy-client.ts for the existing gateway client.',
    },
    {
      id: 'm4',
      at: '2026-02-11T08:12:00Z',
      type: 'tool_call',
      title: "Called the new payment gateway's sandbox API.",
      detail: "Confirmed the refund endpoint's request shape and its timeout behaviour.",
    },
    {
      id: 'm5',
      at: '2026-02-11T08:24:00Z',
      type: 'file_change',
      title: 'Added src/services/payments/gateway-client.ts',
      detail: "New client for the payment gateway's refund endpoint.",
      artefactIds: ['src/services/payments/gateway-client.ts'],
    },
    {
      id: 'm6',
      at: '2026-02-11T08:31:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/refunds.ts',
      detail: 'Calls the new gateway client instead of the legacy one for cancelled-order refunds.',
      artefactIds: ['src/services/payments/refunds.ts'],
    },
    {
      id: 'm7',
      at: '2026-02-11T08:39:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/reconciliation.ts',
      detail: "Reads refund status from the new gateway's response shape.",
      artefactIds: ['src/services/payments/reconciliation.ts'],
    },
    {
      id: 'm8',
      at: '2026-02-11T08:44:00Z',
      type: 'file_change',
      title: 'Edited src/services/payments/order-events.ts',
      detail:
        "Emits the existing 'refund.issued' event unchanged, now sourced from the new gateway's callback.",
      artefactIds: ['src/services/payments/order-events.ts'],
    },
    {
      id: 'm9',
      at: '2026-02-11T08:50:00Z',
      type: 'file_change',
      title: 'Edited src/ops-dashboard/order-status-label.ts',
      detail:
        "Shows 'Refunded' once the new gateway confirms the refund, matching the previous wording.",
      artefactIds: ['src/ops-dashboard/order-status-label.ts'],
    },
    {
      id: 'm10',
      at: '2026-02-11T08:58:00Z',
      type: 'file_change',
      title: 'Added src/services/payments/gateway-client.test.ts',
      detail: 'Unit tests for the new client, including a timeout case.',
      artefactIds: ['src/services/payments/gateway-client.test.ts'],
    },
    ...shardVerificationEvents,
    {
      id: 'm11',
      at: '2026-02-11T09:10:00Z',
      type: 'test_run',
      title: 'Ran the payments service test suite.',
      detail:
        '162 passed, covering the new client and the updated refund and reconciliation paths.',
    },
    {
      id: 'm12',
      at: '2026-02-11T09:18:00Z',
      type: 'test_run',
      title: 'Ran the integration suite against the payment gateway sandbox.',
      detail: '2 passed: a full refund, and a refund retried after a simulated timeout.',
    },
    {
      id: 'm13',
      at: '2026-02-11T09:22:00Z',
      type: 'gate_eval',
      title: 'Security review passed.',
    },
    {
      id: 'm14',
      at: '2026-02-11T09:24:00Z',
      type: 'gate_eval',
      title: 'Data retention passed.',
    },
    {
      id: 'm15',
      at: '2026-02-11T09:26:00Z',
      type: 'gate_eval',
      title: 'Architecture review passed.',
      detail: 'Reviewed by Dana Whitfield: the new client is called only from this service.',
    },
    {
      id: 'm16',
      at: '2026-02-11T09:30:00Z',
      type: 'gate_eval',
      title: 'Licensing scan did not complete.',
      detail:
        'The dependency license scanner timed out after 10 minutes and was not retried before the deployment window closed.',
      severity: 'warning',
    },
    {
      id: 'm17',
      at: '2026-02-11T09:33:00Z',
      type: 'gate_eval',
      title: 'Test coverage passed.',
    },
    {
      id: 'm18',
      at: '2026-02-11T09:41:00Z',
      type: 'gate_eval',
      title: 'Accessibility check did not complete.',
      detail:
        'The accessibility scanner could not reach the staging environment before the deployment window closed.',
      severity: 'warning',
    },
    {
      id: 'm19',
      at: '2026-02-11T09:45:00Z',
      type: 'note',
      title: 'The nightly reconciliation job was not re-run against this change.',
      detail: 'It next runs at 02:00.',
      severity: 'warning',
    },
    {
      id: 'm20',
      at: '2026-02-11T09:48:00Z',
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
        'Based on the diff across six changed files and a search for other callers of the legacy client.',
      rationale:
        "The refund flow, the reconciliation job, and the ops dashboard label all now read from the new gateway's response shape.",
      unverified: [
        'Whether any scheduled batch job still imports the legacy client’s types directly.',
      ],
    },
    {
      area: 'tests',
      value: 0.88,
      basis: 'Based on 162 unit tests and 2 integration tests against the sandbox, all passing.',
      rationale:
        'Covers the new client, the updated refund and reconciliation paths, and a simulated gateway timeout.',
      unverified: ['Behaviour when the gateway is unreachable for longer than the retry window.'],
    },
    {
      area: 'side_effects',
      value: 0.52,
      basis: 'Based on log analysis from the staging rollout only.',
      rationale:
        'Staging traffic over 48 hours showed no duplicate refunds, but staging volume is a small fraction of production.',
      unverified: [
        'Whether concurrent refund requests for the same order can race under production load.',
        'Effect on the 02:00 reconciliation job, which has not run against this change yet.',
      ],
    },
    // No entry for "security": the model reported no confidence value for this area at all.
  ],
  decision: {
    outcome: 'approved',
    by: 'Marcus Webb',
    at: decisionAt,
    // Not required for an approval (Content rules, "Buttons"), and none was given.
    acknowledgedGateIds: [],
    revision: 'e91a4c',
  },
}
