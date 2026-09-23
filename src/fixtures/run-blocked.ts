import type { Run } from '../lib/types'

/**
 * One failed check, one waived, low confidence on side effects, and an error followed by its
 * retry in the timeline. See docs/spec-review-screen.md, "Fixtures to build" (2. Blocked) and
 * Scenario S1 ("Failed check under time pressure") — this is the run S1 describes.
 *
 * Status is `awaiting_review`, not `blocked`: S1 opens with "a reviewer opens a run that is
 * awaiting review" — the failed gate here is something a reviewer needs to decide about, not
 * something stopping the run from reaching them.
 */
export const runBlocked: Run = {
  id: 'run-blocked',
  initiative: 'Add rate limiting to the public booking API',
  requestedBy: 'Tuomas Rantanen',
  revision: '7d4e1b',
  target: { system: 'booking-service', environment: 'staging' },
  agent: { name: 'Kestrel', version: '4.2.1', model: 'kestrel-code-12b' },
  startedAt: '2026-03-04T14:02:00Z',
  finishedAt: '2026-03-04T14:14:00Z',
  status: 'awaiting_review',
  summary: [
    {
      text: 'Added a rate limit to the public booking API.',
      evidenceIds: ['t4', 't5'],
    },
    {
      text: '2 files changed, 14 tests added, all passing.',
      evidenceIds: ['t4', 't5', 't7'],
    },
    {
      text: 'One policy gate failed: data retention.',
      evidenceIds: ['t9'],
    },
    {
      text: 'One check has an exception: licensing, approved by Kaisa Heinämäki.',
      evidenceIds: ['t11'],
    },
    {
      text: 'One check does not apply: accessibility, because no screen changed.',
      evidenceIds: ['t13'],
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
      evaluatedAt: '2026-03-04T14:10:00Z',
      evidenceIds: ['t4', 't5', 't8'],
    },
    {
      id: 'data-retention',
      name: 'Data retention',
      plainLanguage: 'Personal data must be deleted within 30 days.',
      result: 'fail',
      evaluatedBy: 'policy-engine v2.3',
      evaluatedAt: '2026-03-04T14:11:00Z',
      evidenceIds: ['t4', 't9'],
    },
    {
      id: 'architecture',
      name: 'Architecture review',
      plainLanguage:
        "Changes that call another team's service directly must be reviewed by the platform team first.",
      result: 'pass',
      evaluatedBy: 'Aino Lehtomäki',
      evaluatedAt: '2026-03-04T14:11:00Z',
      evidenceIds: ['t5', 't10'],
    },
    {
      id: 'licensing',
      name: 'Open-source licensing',
      plainLanguage:
        'New dependencies must use a license that allows commercial use without extra legal review.',
      result: 'waived',
      evaluatedBy: 'license-scanner v1.4',
      evaluatedAt: '2026-03-04T14:12:00Z',
      evidenceIds: ['t4', 't11'],
      waiver: {
        by: 'Kaisa Heinämäki',
        reason:
          'Already reviewed and cleared under legal ticket LGL-4471 for the same package; no need to re-review.',
        at: '2026-03-04T15:40:00Z',
      },
    },
    {
      id: 'test-coverage',
      name: 'Test coverage',
      plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
      result: 'pass',
      evaluatedBy: 'coverage-gate v3.1',
      evaluatedAt: '2026-03-04T14:13:00Z',
      evidenceIds: ['t7', 't12'],
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      plainLanguage:
        'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
      result: 'not_applicable',
      evaluatedBy: 'a11y-scanner v2.0',
      evaluatedAt: '2026-03-04T14:14:00Z',
      evidenceIds: ['t13'],
    },
  ],
  timeline: [
    {
      id: 't1',
      at: '2026-03-04T14:02:00Z',
      type: 'plan',
      title: 'Planned a token-bucket rate limiter for the public booking API.',
    },
    {
      id: 't2',
      at: '2026-03-04T14:03:00Z',
      type: 'tool_call',
      title: 'Read src/services/booking/router.ts to find the request path for POST /bookings.',
    },
    {
      id: 't3',
      at: '2026-03-04T14:04:00Z',
      type: 'tool_call',
      title: 'Read src/services/booking/config.ts for existing service-level settings.',
    },
    {
      id: 't4',
      at: '2026-03-04T14:06:00Z',
      type: 'file_change',
      title: 'Added src/services/booking/rate-limiter.ts',
      detail:
        'New token-bucket limiter, 60 requests per minute per API key. Logs the API key and requester email on each throttled request, for abuse review, with no expiry.',
      artefactIds: ['src/services/booking/rate-limiter.ts'],
    },
    {
      id: 't5',
      at: '2026-03-04T14:07:00Z',
      type: 'file_change',
      title: 'Edited src/services/booking/router.ts',
      detail: 'Applies the rate limiter to POST /bookings before the existing handler.',
      artefactIds: ['src/services/booking/router.ts'],
    },
    {
      id: 't6',
      at: '2026-03-04T14:08:00Z',
      type: 'error',
      title: 'Test run failed to start.',
      detail:
        'Could not reach the Redis instance used for rate-limiter state in tests (connection refused).',
      severity: 'error',
    },
    {
      id: 't7',
      at: '2026-03-04T14:09:00Z',
      type: 'test_run',
      title: 'Retried the test suite.',
      detail: 'Redis connection succeeded on retry. 14 new and 96 existing tests passing.',
    },
    {
      id: 't8',
      at: '2026-03-04T14:10:00Z',
      type: 'gate_eval',
      title: 'Security review passed.',
    },
    {
      id: 't9',
      at: '2026-03-04T14:11:00Z',
      type: 'gate_eval',
      title: 'Data retention failed.',
      detail:
        "The rate limiter's abuse log stores the requester's email address alongside their API key with no expiry.",
      severity: 'error',
    },
    {
      id: 't10',
      at: '2026-03-04T14:11:00Z',
      type: 'gate_eval',
      title: 'Architecture review passed.',
      detail:
        'Reviewed by Aino Lehtomäki: the limiter runs inside booking-service, calling nothing new.',
    },
    {
      id: 't11',
      at: '2026-03-04T14:12:00Z',
      type: 'gate_eval',
      title: 'Licensing check waived.',
      detail: 'Kaisa Heinämäki granted an exception; see the gate for the reason.',
    },
    {
      id: 't12',
      at: '2026-03-04T14:13:00Z',
      type: 'gate_eval',
      title: 'Test coverage passed.',
    },
    {
      id: 't13',
      at: '2026-03-04T14:14:00Z',
      type: 'gate_eval',
      title: 'Accessibility check does not apply.',
      detail: 'No UI changes were detected in this revision.',
    },
  ],
  confidence: [
    {
      area: 'implementation',
      value: 0.9,
      basis: 'Based on the diff for the two changed files.',
      rationale:
        'Adds a token-bucket rate limiter in front of the existing booking endpoint; the request path for an allowed request is unchanged.',
      unverified: ["Behaviour when the limiter's own in-memory counter resets during a deploy."],
    },
    {
      area: 'tests',
      value: 0.93,
      basis: 'Based on 14 new tests, all passing.',
      rationale: "Tests cover the limiter's allow/deny boundary and its reset window.",
      unverified: ['Load behaviour above the tested request rate.'],
    },
    {
      area: 'security',
      value: 0.85,
      basis: "Based on the security gate's automated scan.",
      rationale:
        'The rate limiter does not read or store any new personal data beyond the abuse log.',
      unverified: [],
    },
    {
      area: 'side_effects',
      value: 0.38,
      basis: 'Based on a review of the two changed files only; no traffic replay was run.',
      rationale: 'Existing callers of the booking API were not re-tested against the new limiter.',
      unverified: [
        'Whether any internal service already calls this endpoint fast enough to be rate-limited by mistake.',
        'Effect on the nightly batch job that re-syncs booking data.',
      ],
    },
  ],
  assignment: {
    context:
      'A partner sent thousands of booking requests a minute last week and slowed the booking page down for everyone.',
    by: 'Tuomas Rantanen',
    reason: 'rate limiting is a common, well-understood pattern with a clear rule to follow.',
  },
  story: [
    {
      id: 'plan',
      label: 'Plan',
      text: 'The agent planned a limit of 60 booking requests a minute for each API key.',
      evidenceIds: ['t1'],
    },
    {
      id: 'reading',
      label: 'Reading the code',
      text: 'It read the booking router and the service settings to find where requests come in.',
      evidenceIds: ['t2', 't3'],
      linkToSteps: true,
    },
    {
      id: 'files',
      label: '2 files changed',
      text: 'It added the rate limiter and put it in front of the booking endpoint. Every blocked request is written to a log with the API key and the email address of the person who sent it.',
      evidenceIds: ['t4', 't5'],
      confidenceAreas: ['implementation'],
    },
    {
      id: 'tests',
      label: 'Tests',
      text: 'The first test run could not start because the test database was not reachable. The agent tried again, and 14 new and 96 existing tests passed.',
      evidenceIds: ['t6', 't7'],
      confidenceAreas: ['tests'],
      linkToSteps: true,
    },
    {
      id: 'checks',
      label: 'Policy checks',
      text: 'Three checks passed. Data retention failed, licensing has an exception, and accessibility does not apply because no screen changed.',
      evidenceIds: ['t8', 't9', 't10', 't11', 't12', 't13'],
      gateIds: [
        'security',
        'data-retention',
        'architecture',
        'licensing',
        'test-coverage',
        'accessibility',
      ],
      confidenceAreas: ['security', 'side_effects'],
    },
  ],
}
