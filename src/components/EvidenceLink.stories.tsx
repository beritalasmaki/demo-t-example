import type { Meta, StoryObj } from '@storybook/react-vite'
import { EvidenceLink } from './EvidenceLink'

const meta = {
  title: 'Components/EvidenceLink',
  component: EvidenceLink,
} satisfies Meta<typeof EvidenceLink>

export default meta
type Story = StoryObj<typeof meta>

export const SingleEvent: Story = {
  args: { href: '#example', label: 'Evidence', count: 1 },
}

export const SeveralEvents: Story = {
  args: { href: '#example', label: 'Evidence', count: 4 },
}
