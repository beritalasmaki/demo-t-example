import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FileText, ShieldCheck } from 'lucide-react'
import { AnchorNav } from './AnchorNav'

const items = [
  { id: 'summary-heading', label: 'Summary', icon: FileText },
  { id: 'policy-gates-heading', label: 'Policy gates', icon: ShieldCheck },
]

describe('AnchorNav', () => {
  it('renders a link per item, pointing at its section id', () => {
    render(<AnchorNav items={items} label="Jump to a section" />)
    expect(screen.getByRole('link', { name: 'Summary' })).toHaveAttribute(
      'href',
      '#summary-heading',
    )
    expect(screen.getByRole('link', { name: 'Policy gates' })).toHaveAttribute(
      'href',
      '#policy-gates-heading',
    )
  })

  it('is a named navigation landmark', () => {
    render(<AnchorNav items={items} label="Jump to a section" />)
    expect(screen.getByRole('navigation', { name: 'Jump to a section' })).toBeInTheDocument()
  })

  it('every link is reachable by keyboard alone', () => {
    render(<AnchorNav items={items} label="Jump to a section" />)
    const links = screen.getAllByRole('link')
    for (const link of links) {
      link.focus()
      expect(link).toHaveFocus()
    }
  })
})
