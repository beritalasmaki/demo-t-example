import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Modal } from './Modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

/*
 * `Modal` opens by mounting, not via an `open` prop, so a story needs somewhere to unmount it
 * to — a small wrapper with a button that re-opens it after Cancel closes it.
 */
function Reopenable() {
  const [open, setOpen] = useState(true)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="underline">
        Reopen
      </button>
    )
  }

  return (
    <Modal title="Example dialog" onClose={() => setOpen(false)}>
      <p className="text-sm text-text-secondary">
        Body content goes here. Escape or Cancel closes it.
      </p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text-primary"
        >
          Cancel
        </button>
      </div>
    </Modal>
  )
}

export const Default: Story = {
  args: { title: 'Example dialog', onClose: () => {}, children: null },
  render: () => <Reopenable />,
}
