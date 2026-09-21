import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckSquare, FileText, Gauge, History, ShieldCheck, Target } from 'lucide-react'
import { AnchorNav } from './AnchorNav'

const meta = {
  title: 'Components/AnchorNav',
  component: AnchorNav,
} satisfies Meta<typeof AnchorNav>

export default meta
type Story = StoryObj<typeof meta>

const items = [
  { id: 'run-header-heading', label: 'Run header', icon: Target },
  { id: 'summary-heading', label: 'Summary', icon: FileText },
  { id: 'policy-gates-heading', label: 'Policy gates', icon: ShieldCheck },
  { id: 'audit-log-heading', label: 'Audit log', icon: History },
  { id: 'confidence-heading', label: 'Confidence', icon: Gauge },
  { id: 'decision-heading', label: 'Decision', icon: CheckSquare },
]

export const Default: Story = {
  args: { items, label: 'Jump to a section' },
}
