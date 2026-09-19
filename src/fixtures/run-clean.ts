import type { Run } from '../lib/types'

/**
 * Everything passed, awaiting review. See docs/spec-review-screen.md, "Fixtures to build"
 * (1. Clean) and Scenario S2 ("Routine run with all checks passed") — the highest-risk case
 * precisely because there is nothing here to catch a reviewer's attention.
 */
export const runClean: Run = {
  id: 'run-clean',
  initiative: 'Add a CSV export to the appointment history page',
  requestedBy: 'Sana Iqbal',
  target: { system: 'patient-portal', environment: 'staging' },
  agent: { name: 'Kestrel', version: '4.2.1', model: 'kestrel-code-12b' },
  startedAt: '2026-03-06T10:15:00Z',
  finishedAt: '2026-03-06T10:21:00Z',
  status: 'awaiting_review',
  summary: [
    {
      text: 'Added a CSV export to the appointment history page.',
      evidenceIds: ['c3', 'c4'],
    },
    {
      text: '3 files changed, 6 tests added, all passing.',
      evidenceIds: ['c3', 'c4', 'c5', 'c6'],
    },
    {
      text: 'All six policy checks passed.',
      evidenceIds: ['c7', 'c8', 'c9', 'c10', 'c11', 'c12'],
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
      evaluatedAt: '2026-03-06T10:20:00Z',
      evidenceIds: ['c3', 'c4', 'c7'],
    },
    {
      id: 'data-retention',
      name: 'Data retention',
      plainLanguage: 'Personal data must be deleted within 30 days.',
      result: 'pass',
      evaluatedBy: 'policy-engine v2.3',
      evaluatedAt: '2026-03-06T10:20:00Z',
      evidenceIds: ['c3', 'c8'],
    },
    {
      id: 'architecture',
      name: 'Architecture review',
      plainLanguage:
        "Changes that call another team's service directly must be reviewed by the platform team first.",
      result: 'pass',
      evaluatedBy: 'Dana Whitfield',
      evaluatedAt: '2026-03-06T10:20:00Z',
      evidenceIds: ['c3', 'c9'],
    },
    {
      id: 'licensing',
      name: 'Open-source licensing',
      plainLanguage:
        'New dependencies must use a license that allows commercial use without extra legal review.',
      result: 'pass',
      evaluatedBy: 'license-scanner v1.4',
      evaluatedAt: '2026-03-06T10:20:00Z',
      evidenceIds: ['c10'],
    },
    {
      id: 'test-coverage',
      name: 'Test coverage',
      plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
      result: 'pass',
      evaluatedBy: 'coverage-gate v3.1',
      evaluatedAt: '2026-03-06T10:21:00Z',
      evidenceIds: ['c5', 'c6', 'c11'],
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      plainLanguage:
        'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
      result: 'pass',
      evaluatedBy: 'a11y-scanner v2.0',
      evaluatedAt: '2026-03-06T10:21:00Z',
      evidenceIds: ['c3', 'c12'],
    },
  ],
  timeline: [
    {
      id: 'c1',
      at: '2026-03-06T10:15:00Z',
      type: 'plan',
      title:
        'Planned a CSV export button on the appointment history page, reusing the data already loaded there.',
    },
    {
      id: 'c2',
      at: '2026-03-06T10:16:00Z',
      type: 'tool_call',
      title:
        'Read src/features/appointments/appointment-history-page.tsx to find the existing appointment list data.',
    },
    {
      id: 'c3',
      at: '2026-03-06T10:17:00Z',
      type: 'file_change',
      title: 'Edited src/features/appointments/appointment-history-page.tsx',
      detail:
        "Adds an 'Export CSV' button that formats the already-loaded appointment list as CSV and downloads it.",
      artefactIds: ['src/features/appointments/appointment-history-page.tsx'],
    },
    {
      id: 'c4',
      at: '2026-03-06T10:18:00Z',
      type: 'file_change',
      title: 'Added src/features/appointments/format-appointments-csv.ts',
      detail: 'Formats a list of appointments as CSV, handling an empty list.',
      artefactIds: ['src/features/appointments/format-appointments-csv.ts'],
    },
    {
      id: 'c5',
      at: '2026-03-06T10:18:00Z',
      type: 'file_change',
      title: 'Added src/features/appointments/format-appointments-csv.test.ts',
      detail: 'Tests for zero, one, and many appointments.',
      artefactIds: ['src/features/appointments/format-appointments-csv.test.ts'],
    },
    {
      id: 'c6',
      at: '2026-03-06T10:19:00Z',
      type: 'test_run',
      title: 'Ran the appointments feature test suite.',
      detail: '6 new tests and 41 existing tests passing.',
    },
    {
      id: 'c7',
      at: '2026-03-06T10:20:00Z',
      type: 'gate_eval',
      title: 'Security review passed.',
    },
    {
      id: 'c8',
      at: '2026-03-06T10:20:00Z',
      type: 'gate_eval',
      title: 'Data retention passed.',
    },
    {
      id: 'c9',
      at: '2026-03-06T10:20:00Z',
      type: 'gate_eval',
      title: 'Architecture review passed.',
      detail: 'Reviewed by Dana Whitfield: no new service call was introduced.',
    },
    {
      id: 'c10',
      at: '2026-03-06T10:20:00Z',
      type: 'gate_eval',
      title: 'Open-source licensing passed.',
      detail: 'No new dependency was introduced.',
    },
    {
      id: 'c11',
      at: '2026-03-06T10:21:00Z',
      type: 'gate_eval',
      title: 'Test coverage passed.',
    },
    {
      id: 'c12',
      at: '2026-03-06T10:21:00Z',
      type: 'gate_eval',
      title: 'Accessibility check passed.',
      detail: 'The new button meets contrast and keyboard-navigation requirements.',
    },
  ],
  confidence: [
    {
      area: 'implementation',
      value: 0.94,
      basis: 'Based on the diff for the three changed files.',
      rationale:
        'Adds a CSV export button that calls the existing appointment-history endpoint and formats the response as CSV client-side; no server change.',
      unverified: [],
    },
    {
      area: 'tests',
      value: 0.91,
      basis: 'Based on 6 new tests, all passing.',
      rationale: 'Tests cover CSV formatting for zero, one, and many appointments.',
      unverified: [],
    },
    {
      area: 'security',
      value: 0.9,
      basis: "Based on the security gate's automated scan.",
      rationale: 'No new data leaves the browser; the export uses data already shown on screen.',
      unverified: [],
    },
    {
      area: 'side_effects',
      value: 0.88,
      basis: 'Based on the change being additive and client-side only.',
      rationale:
        'No existing behaviour is changed; the export is a new button with no default action.',
      unverified: [
        'Very large appointment histories were not tested for export performance in the browser.',
      ],
    },
  ],
}
