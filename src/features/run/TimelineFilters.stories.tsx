import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import type { TimelineEvent } from '../../lib/types'
import { TimelineFilters } from './TimelineFilters'

const ALL_TYPES: TimelineEvent['type'][] = [
  'plan',
  'tool_call',
  'file_change',
  'test_run',
  'gate_eval',
  'error',
  'note',
]

const meta = {
  title: 'Features/Run/TimelineFilters',
  component: TimelineFilters,
  args: { activeTypes: new Set(ALL_TYPES), onActiveTypesChange: () => {} },
} satisfies Meta<typeof TimelineFilters>

export default meta
type Story = StoryObj<typeof meta>

export const AllActive: Story = {}

export const SomeInactive: Story = {
  args: { activeTypes: new Set<TimelineEvent['type']>(['plan', 'file_change', 'gate_eval']) },
}

export const Interactive: Story = {
  render: function Render(args) {
    const [activeTypes, setActiveTypes] = useState(args.activeTypes)
    return <TimelineFilters activeTypes={activeTypes} onActiveTypesChange={setActiveTypes} />
  },
}
