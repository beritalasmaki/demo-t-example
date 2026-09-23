import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const meta = {
  title: 'Components/StatusBadge',
  component: StatusBadge,
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: { tone: 'success', label: 'Passed' },
}

export const Danger: Story = {
  args: { tone: 'danger', label: 'Failed' },
}

export const Warning: Story = {
  args: { tone: 'warning', label: 'Exception by Kaisa Heinämäki' },
}

export const Neutral: Story = {
  args: { tone: 'neutral', label: 'Not applicable' },
}

export const Info: Story = {
  args: { tone: 'info', label: 'Not run' },
}

export const AllTones: Story = {
  args: { tone: 'success', label: 'Passed' },
  render: () => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <StatusBadge tone="success" label="Passed" />
      <StatusBadge tone="danger" label="Failed" />
      <StatusBadge tone="warning" label="Exception by Kaisa Heinämäki" />
      <StatusBadge tone="neutral" label="Not applicable" />
      <StatusBadge tone="info" label="Not run" />
    </div>
  ),
}
