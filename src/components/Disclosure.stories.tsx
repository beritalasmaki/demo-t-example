import type { Meta, StoryObj } from '@storybook/react-vite'
import { Disclosure } from './Disclosure'

const meta = {
  title: 'Components/Disclosure',
  component: Disclosure,
} satisfies Meta<typeof Disclosure>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  args: {
    summary: 'Click, or press Enter/Space while focused, to open',
    children: 'The detail that was hidden — collapsed, never deleted.',
  },
}

export const Open: Story = {
  args: {
    summary: 'Already open by default',
    children: 'The detail is visible without any interaction.',
    defaultOpen: true,
  },
}
