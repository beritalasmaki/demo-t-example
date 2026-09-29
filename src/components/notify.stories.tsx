import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './ui/button'
import { Toaster } from './ui/sonner'
import { notify } from './notify'

/** The confirmation toast: shadcn's Sonner, in our inverse colours (docs/DECISIONS.md, 0070). */
function ToastDemo({ message }: { message: string }) {
  return (
    <div className="p-[var(--space-6)]">
      <Button onClick={() => notify(message)}>Show the toast</Button>
      <Toaster />
    </div>
  )
}

const meta = {
  title: 'Components/Toast',
  component: ToastDemo,
  parameters: { layout: 'fullscreen' },
  args: {
    message: 'Request sent to Maarit Kasakallio. You will get a message when they answer.',
  },
} satisfies Meta<typeof ToastDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
