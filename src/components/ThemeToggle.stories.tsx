import type { Meta, StoryObj } from '@storybook/react-vite'
import { ThemeToggle } from './ThemeToggle'

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ThemeToggle>

export default meta
type Story = StoryObj<typeof meta>

/** Switches the whole Storybook page, as it does the app. */
export const Default: Story = {}
