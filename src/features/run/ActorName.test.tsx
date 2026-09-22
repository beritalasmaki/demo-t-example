import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ActorName } from './ActorName'

describe('ActorName', () => {
  it('renders a person inside a pill', () => {
    render(<ActorName name="Marcus Webb" />)
    const pill = screen.getByText('Marcus Webb').closest('span')!
    expect(pill.className).toMatch(/rounded-full/)
    expect(pill.className).toMatch(/border/)
  })

  it('renders a system name-and-version as plain text, no pill', () => {
    render(<ActorName name="policy-engine v2.3" />)
    const wrapper = screen.getByText('policy-engine v2.3').closest('span')!
    expect(wrapper.className).not.toMatch(/rounded-full/)
  })
})
