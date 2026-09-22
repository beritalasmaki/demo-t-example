import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { TimelineEvent } from '../../lib/types'
import { TimelineFilters } from './TimelineFilters'

const meta = {
  title: 'Features/Run/TimelineFilters',
  component: TimelineFilters,
  args: { hiddenTypes: new Set(), onHiddenTypesChange: () => {} },
} satisfies Meta<typeof TimelineFilters>

export default meta
type Story = StoryObj<typeof meta>

export const NoneHidden: Story = {}

export const SomeHidden: Story = {
  args: { hiddenTypes: new Set<TimelineEvent['type']>(['plan', 'file_change', 'gate_eval']) },
}

export const Interactive: Story = {
  render: function Render(args) {
    const [hiddenTypes, setHiddenTypes] = useState(args.hiddenTypes)
    return <TimelineFilters hiddenTypes={hiddenTypes} onHiddenTypesChange={setHiddenTypes} />
  },
}
