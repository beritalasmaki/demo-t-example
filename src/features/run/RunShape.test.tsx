import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { runMessy } from '../../fixtures'
import { RunShape } from './RunShape'

describe('RunShape', () => {
  it('counts the run from its timeline', () => {
    render(<RunShape run={runMessy} />)
    const value = (label: string) => screen.getByText(label).nextElementSibling
    expect(value('Steps')).toHaveTextContent('200')
    expect(value('Errors')).toHaveTextContent('0')
    expect(value('Files changed')).toHaveTextContent('6')
    expect(value('Tests passing')).toHaveTextContent('164')
  })

  it('says "unknown" when no test run states a count', () => {
    render(<RunShape run={{ ...runMessy, timeline: [] }} />)
    expect(screen.getByText('Tests passing').nextElementSibling).toHaveTextContent('unknown')
  })
})
