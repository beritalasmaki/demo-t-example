import type {
  ConfidenceArea,
  GateResult,
  PolicyGate,
  Run,
  StoryStep,
  TimelineEvent,
} from '../lib/types'

/**
 * More sample runs for "My reviews" (docs/DECISIONS.md, 0061): enough to fill every tab, the
 * runs still in progress, and an archive with locked runs and one that can still be restored.
 *
 * Each one is a complete `Run`, not a list row: its checks, scores, open items and decision are
 * real data, so every number in the list comes from the run, and every row opens a real review.
 * They are built from a short description by `sampleRun`, and are shorter and plainer than the
 * three hand-written runs, which stay the ones the design work is done against.
 *
 * Dates are counted back from when the app loads, like `run-messy.ts`, so "3 days ago" and
 * "archived 3 days ago" stay true whenever the demo is opened. All of it is fictional.
 */

const REVIEWER = 'Juhani Virtaleppäsoutu'
const DAY = 86_400_000
const HOUR = 3_600_000
const NOW = Date.now()

type Stage = 'agent' | 'checks' | 'review' | 'requested' | 'approved' | 'declined'

interface SampleSpec {
  id: string
  initiative: string
  requestedBy: string
  system: string
  environment: 'staging' | 'production'
  stage: Stage
  /** When the run finished (or, still running, when it started), in days before now. */
  daysAgo: number
  /** Checks that did not pass, by gate id. Everything else passed. */
  gates?: Partial<Record<GateId, Extract<GateResult, 'fail' | 'unknown'>>>
  /** A confidence area that scored low. */
  lowArea?: ConfidenceArea['area']
  /** A caveat the agent left open. */
  note?: string
  /** The reviewer's reason, for a decided run. */
  reason?: string
  /** Hours between the end of the run and the decision. */
  decidedAfterHours?: number
}

type GateId = 'security' | 'data-retention' | 'licensing' | 'accessibility' | 'test-coverage'

const GATES: Record<
  GateId,
  Omit<PolicyGate, 'result' | 'evaluatedAt' | 'evidenceIds'> & { failed: string; notRun: string }
> = {
  security: {
    id: 'security',
    name: 'Security review',
    plainLanguage:
      'Changes must not create a new way for someone outside the company to read or change data they should not have access to.',
    evaluatedBy: 'policy-engine v2.3',
    failed: 'The change logs a full card number in a place support staff can read.',
    notRun: 'The security scanner timed out before it finished.',
  },
  'data-retention': {
    id: 'data-retention',
    name: 'Data retention',
    plainLanguage: 'Personal data must be deleted within 30 days.',
    evaluatedBy: 'policy-engine v2.3',
    failed: 'A new table keeps customer addresses with no deletion date.',
    notRun: 'The data map for this service was not available when the check ran.',
  },
  licensing: {
    id: 'licensing',
    name: 'Open-source licensing',
    plainLanguage:
      'New dependencies must use a license that allows commercial use without extra legal review.',
    evaluatedBy: 'license-scanner v1.4',
    failed: 'One new dependency uses a license that needs legal review.',
    notRun: 'The license scanner could not reach the package registry.',
  },
  accessibility: {
    id: 'accessibility',
    name: 'Accessibility',
    plainLanguage:
      'New or changed screens must meet WCAG 2.1 AA contrast and keyboard-navigation requirements.',
    evaluatedBy: 'a11y-checker v2.0',
    failed: 'Two new buttons cannot be reached with the keyboard.',
    notRun: 'The checker could not reach the staging environment.',
  },
  'test-coverage': {
    id: 'test-coverage',
    name: 'Test coverage',
    plainLanguage: 'Changed code must be covered by automated tests before it can be released.',
    evaluatedBy: 'coverage-gate v3.1',
    failed: 'Coverage of the changed files dropped from 84% to 61%.',
    notRun: 'The test run had not finished when the check started.',
  },
}

const AREA_TEXT: Record<
  ConfidenceArea['area'],
  { basis: string; rationale: string; unverified: string }
> = {
  implementation: {
    basis: 'Based on the changed files and a search for other places that use the same code.',
    rationale: 'The change is small and follows the pattern already used in this service.',
    unverified: 'Whether another service calls the changed code directly.',
  },
  tests: {
    basis: 'Based on the unit tests that ran and the files they cover.',
    rationale: 'New tests cover the changed paths and all of them pass.',
    unverified: 'What happens under real production load.',
  },
  security: {
    basis: 'Based on the security scanner and a review of what data the change touches.',
    rationale: 'The change reads no new kinds of personal data.',
    unverified: 'Whether older logs already contain the data in question.',
  },
  side_effects: {
    basis: 'Based on the services that read the same data, found by searching the code.',
    rationale: 'Two other jobs read the changed data; the agent checked one of them.',
    unverified: 'Whether the second job behaves the same way after this change.',
  },
}

const REASONS = {
  approved:
    'All checks passed and the change is small. It behaved as expected in staging for two days.',
  declined: 'The agent changed more files than the request asked for.',
  requested: 'Please add a test for the failure case before this goes live.',
}

const iso = (ms: number) => new Date(ms).toISOString()
const revisionOf = (id: string) =>
  [...id]
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7)
    .toString(16)
    .slice(0, 6)
    .padEnd(6, '0')

/** One complete, fictional run from a short description. */
export function sampleRun(spec: SampleSpec): Run {
  const running = spec.stage === 'agent'
  const end = NOW - spec.daysAgo * DAY
  const start = running ? end : end - 40 * 60_000
  const at = (minutes: number) => iso(start + minutes * 60_000)
  const fileA = `src/${spec.system}/${spec.id.replace(/^run-/, '')}.ts`
  const fileB = `src/${spec.system}/${spec.id.replace(/^run-/, '')}.test.ts`

  const timeline: TimelineEvent[] = [
    { id: 's1', at: at(0), type: 'plan', title: `Planned: ${spec.initiative.toLowerCase()}.` },
    { id: 's2', at: at(8), type: 'file_change', title: `Edited ${fileA}`, artefactIds: [fileA] },
  ]
  if (!running) {
    timeline.push(
      { id: 's3', at: at(15), type: 'file_change', title: `Added ${fileB}`, artefactIds: [fileB] },
      { id: 's4', at: at(24), type: 'test_run', title: 'Ran the unit tests', detail: '24 passed' },
    )
  }

  const gateIds = Object.keys(GATES) as GateId[]
  const checksDone = spec.stage !== 'agent' && spec.stage !== 'checks'
  const gates: PolicyGate[] = gateIds.map((gateId, index) => {
    const { failed, notRun, ...gate } = GATES[gateId]
    const result: GateResult = checksDone ? (spec.gates?.[gateId] ?? 'pass') : 'unknown'
    const eventId = `g${index + 1}`
    if (checksDone) {
      timeline.push({
        id: eventId,
        at: at(30 + index),
        type: 'gate_eval',
        title: `${gate.name}: ${result === 'pass' ? 'passed' : result === 'fail' ? 'failed' : 'did not run'}`,
        detail: result === 'fail' ? failed : result === 'unknown' ? notRun : undefined,
        severity: result === 'fail' ? 'error' : result === 'unknown' ? 'warning' : undefined,
      })
    }
    return {
      ...gate,
      result,
      evaluatedAt: checksDone ? at(30 + index) : at(0),
      evidenceIds: checksDone ? [eventId] : [],
    }
  })
  if (spec.note && !running) {
    timeline.push({ id: 'n1', at: at(38), type: 'note', title: spec.note, severity: 'warning' })
  }

  const confidence: ConfidenceArea[] = running
    ? []
    : (Object.keys(AREA_TEXT) as ConfidenceArea['area'][]).map((area, index) => ({
        area,
        value: area === spec.lowArea ? 0.46 : [0.9, 0.87, 0.92, 0.81][index],
        basis: AREA_TEXT[area].basis,
        rationale: AREA_TEXT[area].rationale,
        unverified: area === spec.lowArea ? [AREA_TEXT[area].unverified] : [],
      }))

  const story: StoryStep[] = [
    {
      id: 'plan',
      label: 'Plan',
      text: `The agent planned the change: ${spec.initiative.charAt(0).toLowerCase()}${spec.initiative.slice(1)}.`,
      evidenceIds: ['s1'],
    },
    {
      id: 'change',
      label: running ? 'Working' : '2 files changed',
      text: running
        ? 'It is changing the code now. The rest of the story appears when it finishes.'
        : 'It changed the code and added tests for it.',
      evidenceIds: running ? ['s2'] : ['s2', 's3', 's4'],
      confidenceAreas: running ? undefined : ['implementation', 'tests'],
    },
  ]
  if (checksDone) {
    story.push({
      id: 'checks',
      label: 'Policy checks',
      text: 'The policy checks ran against the change.',
      evidenceIds: gates.flatMap((gate) => gate.evidenceIds),
      gateIds: gateIds,
      confidenceAreas: ['security', 'side_effects'],
    })
  }
  if (spec.note && !running) {
    story.push({ id: 'open', label: 'Open items', text: spec.note, evidenceIds: ['n1'] })
  }

  const run: Run = {
    id: spec.id,
    initiative: spec.initiative,
    requestedBy: spec.requestedBy,
    revision: revisionOf(spec.id),
    target: { system: spec.system, environment: spec.environment },
    agent: { name: 'Kestrel', version: '4.3.0', model: 'kestrel-code-14b' },
    startedAt: iso(start),
    finishedAt: running ? undefined : iso(end),
    status:
      spec.stage === 'agent'
        ? 'running'
        : spec.stage === 'checks'
          ? 'checks_running'
          : spec.stage === 'review'
            ? 'awaiting_review'
            : spec.stage === 'approved'
              ? 'approved'
              : spec.stage === 'declined'
                ? 'rejected'
                : 'changes_requested',
    summary: [{ text: `The agent worked on: ${spec.initiative}.`, evidenceIds: ['s1', 's2'] }],
    gates,
    timeline,
    confidence,
    assignment: {
      context: `The ${spec.system} team keeps a list of small, well-described changes.`,
      by: spec.requestedBy,
      reason: 'it is a small change with a clear rule for what done means.',
    },
    story,
  }

  if (spec.stage === 'approved' || spec.stage === 'declined' || spec.stage === 'requested') {
    const outcome =
      spec.stage === 'approved'
        ? 'approved'
        : spec.stage === 'declined'
          ? 'rejected'
          : 'changes_requested'
    run.decision = {
      outcome,
      by: REVIEWER,
      at: iso(end + (spec.decidedAfterHours ?? 3) * HOUR),
      reason: spec.reason ?? REASONS[spec.stage],
      acknowledgedItemIds: outcome === 'approved' ? openItemIds(run) : [],
      revision: run.revision,
    }
  }
  return run
}

/** The ids `lib/openItems.ts` gives this run's open items — what an approval accepts. */
function openItemIds(run: Run): string[] {
  const ids: string[] = []
  if (run.gates.some((gate) => gate.result === 'fail')) ids.push('open-gates-fail')
  if (run.gates.some((gate) => gate.result === 'unknown')) ids.push('open-gates-unknown')
  for (const area of run.confidence) if (area.value < 0.6) ids.push(`open-confidence-${area.area}`)
  for (const event of run.timeline) {
    if (event.type === 'note' && event.severity === 'warning') ids.push(`open-note-${event.id}`)
  }
  return ids
}

// Six months back from now, in days, as the archive rule counts it (lib/reviews.ts).
const SIX_MONTHS_AGO = (() => {
  const date = new Date(NOW)
  date.setMonth(date.getMonth() - 6)
  return Math.round((NOW - date.getTime()) / DAY)
})()

const SPECS: SampleSpec[] = [
  // Pending, ready for review.
  {
    id: 'run-vat-estonia',
    initiative: 'Update VAT rates for Estonia',
    requestedBy: 'Liisa Hakkarainen',
    system: 'ledger-sync',
    environment: 'production',
    stage: 'review',
    daysAgo: 1,
    gates: { 'test-coverage': 'unknown' },
  },
  {
    id: 'run-mask-card-logs',
    initiative: 'Mask card numbers in support tool logs',
    requestedBy: 'Aino Lehtomäki',
    system: 'admin-tool',
    environment: 'production',
    stage: 'review',
    daysAgo: 2,
    lowArea: 'side_effects',
    note: 'Older log files were not rewritten; only new entries are masked.',
  },
  {
    id: 'run-session-timeout',
    initiative: 'Change session timeout from 30 to 15 minutes',
    requestedBy: 'Eero Salminen',
    system: 'auth-service',
    environment: 'staging',
    stage: 'review',
    daysAgo: 3,
  },
  {
    id: 'run-pagination-refunds',
    initiative: 'Add pagination to the refunds admin list',
    requestedBy: 'Saara Järvinen',
    system: 'admin-tool',
    environment: 'staging',
    stage: 'review',
    daysAgo: 4,
    gates: { accessibility: 'fail' },
  },
  // Pending, not ready yet.
  {
    id: 'run-sms-provider',
    initiative: 'Replace the SMS provider client',
    requestedBy: 'Tuomas Nieminen',
    system: 'notifications',
    environment: 'production',
    stage: 'agent',
    daysAgo: 0,
  },
  {
    id: 'run-address-lookup',
    initiative: 'Update the address lookup for Finnish postcodes',
    requestedBy: 'Maarit Kasakallio',
    system: 'customer-portal',
    environment: 'staging',
    stage: 'agent',
    daysAgo: 0,
  },
  {
    id: 'run-webhook-retries',
    initiative: 'Store failed webhook calls so they can be sent again later',
    requestedBy: 'Eero Salminen',
    system: 'orders-api',
    environment: 'production',
    stage: 'checks',
    daysAgo: 0,
  },
  {
    id: 'run-pdf-library',
    initiative: 'Upgrade the PDF library in the receipts service',
    requestedBy: 'Liisa Hakkarainen',
    system: 'orders-api',
    environment: 'staging',
    stage: 'checks',
    daysAgo: 1,
  },
  // Requested for change: the agent is making the changes.
  {
    id: 'run-refund-reason-column',
    initiative: 'Add a column for refund reason in reports',
    requestedBy: 'Aino Lehtomäki',
    system: 'ledger-sync',
    environment: 'staging',
    stage: 'requested',
    daysAgo: 2,
    gates: { 'test-coverage': 'fail' },
  },
  {
    id: 'run-duplicate-emails',
    initiative: 'Fix duplicate emails after password reset',
    requestedBy: 'Saara Järvinen',
    system: 'notifications',
    environment: 'production',
    stage: 'requested',
    daysAgo: 5,
    reason: 'The licensing check did not run. Run it again, then send the run back.',
    gates: { licensing: 'unknown' },
  },
  {
    id: 'run-split-address-form',
    initiative: 'Split the address form into smaller parts',
    requestedBy: 'Tuomas Nieminen',
    system: 'customer-portal',
    environment: 'staging',
    stage: 'requested',
    daysAgo: 9,
    reason: 'Split this into two runs: one for the form and one for the emails.',
  },
  // Declined.
  {
    id: 'run-legacy-login',
    initiative: 'Remove the legacy login page',
    requestedBy: 'Eero Salminen',
    system: 'auth-service',
    environment: 'production',
    stage: 'declined',
    daysAgo: 6,
    gates: { security: 'fail' },
    reason: 'The change removes a page that partner shops still link to.',
  },
  {
    id: 'run-consent-audit',
    initiative: 'Add audit fields to the customer consent table',
    requestedBy: 'Liisa Hakkarainen',
    system: 'customer-portal',
    environment: 'production',
    stage: 'declined',
    daysAgo: 21,
    gates: { 'data-retention': 'fail' },
    reason: 'The change touches customer data, but the data retention check failed.',
  },
  // Approved, still in My reviews.
  {
    id: 'run-currency-rounding',
    initiative: 'Update currency rounding for Swedish krona',
    requestedBy: 'Maarit Kasakallio',
    system: 'payments-service',
    environment: 'production',
    stage: 'approved',
    daysAgo: 3,
    lowArea: 'tests',
    reason:
      'I accepted the low test score: the rounding rule is covered by the existing end-to-end tests.',
  },
  {
    id: 'run-help-links',
    initiative: 'Fix broken links in the help centre',
    requestedBy: 'Saara Järvinen',
    system: 'customer-portal',
    environment: 'staging',
    stage: 'approved',
    daysAgo: 12,
  },
  {
    id: 'run-health-check',
    initiative: 'Add a health check to the notifications worker',
    requestedBy: 'Tuomas Nieminen',
    system: 'notifications',
    environment: 'production',
    stage: 'approved',
    daysAgo: 40,
    gates: { accessibility: 'unknown' },
    reason: 'The missing check does not apply, because no screens were changed.',
  },
  {
    id: 'run-noisy-logs',
    initiative: 'Lower log level for noisy payment events',
    requestedBy: 'Aino Lehtomäki',
    system: 'payments-service',
    environment: 'production',
    stage: 'approved',
    daysAgo: SIX_MONTHS_AGO - 12,
  },
  // Archived automatically: one still restorable, the rest locked.
  {
    id: 'run-klarna-option',
    initiative: 'Add Klarna as a payment option',
    requestedBy: 'Eero Salminen',
    system: 'payments-service',
    environment: 'production',
    stage: 'approved',
    daysAgo: SIX_MONTHS_AGO + 3,
    decidedAfterHours: 0,
  },
  {
    id: 'run-mobile-api-v1',
    initiative: 'Remove the old mobile API version',
    requestedBy: 'Liisa Hakkarainen',
    system: 'orders-api',
    environment: 'production',
    stage: 'approved',
    daysAgo: SIX_MONTHS_AGO + 30,
  },
  {
    id: 'run-gift-card-receipt',
    initiative: 'Fix the missing receipt for gift cards',
    requestedBy: 'Maarit Kasakallio',
    system: 'orders-api',
    environment: 'staging',
    stage: 'declined',
    daysAgo: SIX_MONTHS_AGO + 75,
    reason: 'The side-effect score was 34%, and the change would go to production.',
    lowArea: 'side_effects',
  },
  {
    id: 'run-terms-page',
    initiative: 'Update the terms page for the new year',
    requestedBy: 'Saara Järvinen',
    system: 'customer-portal',
    environment: 'staging',
    stage: 'approved',
    daysAgo: SIX_MONTHS_AGO + 120,
  },
]

export const sampleRuns: Run[] = SPECS.map(sampleRun)
