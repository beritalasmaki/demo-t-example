import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FilePen } from 'lucide-react'
import { IconText } from './IconText'

describe('IconText', () => {
  it('renders the label as visible text', () => {
    render(<IconText icon={FilePen}>File change</IconText>)
    expect(screen.getByText('File change')).toBeVisible()
  })

  it('hides the icon from assistive tech', () => {
    const { container } = render(<IconText icon={FilePen}>File change</IconText>)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
