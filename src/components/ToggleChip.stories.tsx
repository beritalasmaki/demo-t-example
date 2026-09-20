import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ToggleChip } from './ToggleChip'

const meta = {
  title: 'Components/ToggleChip',
  component: ToggleChip,
} satisfies Meta<typeof ToggleChip>

export default meta
type Story = StoryObj<typeof meta>

export const Pressed: Story = {
  args: { pressed: true, onPressedChange: () => {}, children: 'Errors' },
}

export const NotPressed: Story = {
  args: { pressed: false, onPressedChange: () => {}, children: 'Errors' },
}

export const Interactive: Story = {
  args: { pressed: false, onPressedChange: () => {}, children: 'Click me' },
  render: function Render(args) {
    const [pressed, setPressed] = useState(args.pressed)
    return <ToggleChip {...args} pressed={pressed} onPressedChange={setPressed} />
  },
}
