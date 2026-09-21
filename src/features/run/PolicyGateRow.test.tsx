import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { PolicyGate, TimelineEvent } from '../../lib/types'
import { PolicyGateRow } from './PolicyGateRow'

const timeline: TimelineEvent[] = [
  { id: 't1', at: '2026-01-01T00:00:00Z', type: 'file_change', title: 'Changed a file' },
  {
    id: 't2',
    at: '2026-01-01T00:01:00Z',
    type: 'gate_eval',
    title: 'Evaluated',
    detail: 'Email addresses are written to the booking log with no expiry.',
  },
]

function renderRow(
  gate: PolicyGate,
  options: { timeline?: TimelineEvent[]; defaultOpen?: boolean } = {},
) {
  return render(
    <ul>
      <PolicyGateRow
        gate={gate}
        timeline={options.timeline ?? timeline}
        defaultOpen={options.defaultOpen ?? true}
      />
    </ul>,
  )
}

const baseGate: Omit<PolicyGate, 'result'> = {
  id: 'data-retention',
  name: 'Data retention',
  plainLanguage: 'Personal data must be deleted within 30 days.',
  evaluatedBy: 'policy-engine v2.3',
  evaluatedAt: '2026-01-01T00:00:00Z',
  evidenceIds: ['t2'],
}

describe('PolicyGateRow', () => {
  it('always shows the rule name and its plain-language description', () => {
    renderRow({ ...baseGate, result: 'pass' })
    expect(screen.getByText('Data retention')).toBeVisible()
    expect(screen.getByText('Personal data must be deleted within 30 days.')).toBeVisible()
  })

  it('shows the exact Content rules label for each result', () => {
    renderRow({ ...baseGate, result: 'fail' })
    expect(screen.getByText('Failed')).toBeVisible()
  })

  it('shows what broke the rule for a failed gate', () => {
    renderRow({ ...baseGate, result: 'fail' })
    expect(
      screen.getByText('Email addresses are written to the booking log with no expiry.'),
    ).toBeVisible()
  })

  it('shows an exception as a decision someone made: who, when, and their reason', () => {
    renderRow({
      ...baseGate,
      result: 'waived',
      waiver: {
        by: 'Owen Baptiste',
        reason: 'Already cleared under ticket LGL-4471.',
        at: '2026-01-02T00:00:00Z',
      },
    })

    expect(screen.getByText('Exception by Owen Baptiste')).toBeVisible()
    // The name sits next to a person/system icon (lib/actors.ts), so it's its own element —
    // check the surrounding sentence and the name each separately, not as one text node.
    const waiverParagraph = screen.getByText(/Exception granted by/).closest('p')!
    expect(waiverParagraph).toHaveTextContent('Exception granted by Owen Baptiste on')
    expect(screen.getByText('"Already cleared under ticket LGL-4471."')).toBeVisible()
  })

  it('shows the reason a check did not run, not just the bare label', () => {
    renderRow({
      ...baseGate,
      result: 'unknown',
      evidenceIds: ['t2'],
    })
    expect(screen.getByText('Not run')).toBeVisible()
    expect(
      screen.getByText('Email addresses are written to the booking log with no expiry.'),
    ).toBeVisible()
  })

  it('says "No evidence available" rather than showing nothing, when there is none', () => {
    renderRow({ ...baseGate, result: 'pass', evidenceIds: [] }, { timeline: [] })
    expect(screen.getByText('No evidence available.')).toBeVisible()
  })

  it('lists resolved evidence by its timeline title', () => {
    renderRow({ ...baseGate, result: 'pass', evidenceIds: ['t1', 't2'] })
    expect(screen.getByText('Changed a file')).toBeVisible()
    expect(screen.getByText('Evaluated')).toBeVisible()
  })

  it('shows a person icon for a person evaluatedBy and a system icon for a system one', () => {
    const { container: personContainer } = renderRow({
      ...baseGate,
      result: 'pass',
      evaluatedBy: 'Dana Whitfield',
    })
    expect(personContainer.querySelector('.lucide-user')).not.toBeNull()
    expect(personContainer.querySelector('.lucide-bot')).toBeNull()

    const { container: systemContainer } = renderRow({
      ...baseGate,
      result: 'pass',
      evaluatedBy: 'policy-engine v2.3',
    })
    expect(systemContainer.querySelector('.lucide-bot')).not.toBeNull()
    expect(systemContainer.querySelector('.lucide-user')).toBeNull()
  })

  it('opens and closes by keyboard-reachable click, and keeps focus on the toggle', async () => {
    const user = userEvent.setup()
    renderRow({ ...baseGate, result: 'pass' }, { defaultOpen: false })

    const toggle = screen.getByText('Data retention').closest('summary')!
    expect(toggle.closest('details')).not.toHaveAttribute('open')

    await user.click(toggle)
    expect(toggle.closest('details')).toHaveAttribute('open')
    expect(toggle).toHaveFocus()
  })
})
