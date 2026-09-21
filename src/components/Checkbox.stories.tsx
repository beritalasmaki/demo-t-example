import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

function Interactive({ initialChecked }: { initialChecked: boolean }) {
  const [checked, setChecked] = useState(initialChecked)
  return (
    <Checkbox checked={checked} onCheckedChange={setChecked}>
      I have seen 1 failed check and 1 exception.
    </Checkbox>
  )
}

export const Unchecked: Story = {
  args: { checked: false, onCheckedChange: () => {}, children: null },
  render: () => <Interactive initialChecked={false} />,
}

export const Checked: Story = {
  args: { checked: true, onCheckedChange: () => {}, children: null },
  render: () => <Interactive initialChecked={true} />,
}
