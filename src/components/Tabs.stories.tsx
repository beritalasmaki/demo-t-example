import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

function Interactive({ initialValue }: { initialValue: string }) {
  const [value, setValue] = useState(initialValue)
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="attention">Needs attention (2)</TabsTrigger>
        <TabsTrigger value="passed">Passed checks (5)</TabsTrigger>
      </TabsList>
      <TabsContent value="attention" className="pt-[var(--space-3)] text-body text-text-primary">
        Data retention, Licensing review.
      </TabsContent>
      <TabsContent value="passed" className="pt-[var(--space-3)] text-body text-text-primary">
        Security review, Accessibility, Performance budget, Code coverage, Changelog entry.
      </TabsContent>
    </Tabs>
  )
}

export const AttentionActive: Story = {
  args: { value: 'attention', onValueChange: () => {}, children: null },
  render: () => <Interactive initialValue="attention" />,
}

export const PassedActive: Story = {
  args: { value: 'passed', onValueChange: () => {}, children: null },
  render: () => <Interactive initialValue="passed" />,
}

function PillInteractive() {
  const [value, setValue] = useState('story')
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList variant="pill" label="Views">
        <TabsTrigger variant="pill" value="story">
          Story
        </TabsTrigger>
        <TabsTrigger variant="pill" value="evidence">
          Evidence
        </TabsTrigger>
        <TabsTrigger variant="pill" value="steps">
          All 200 steps
        </TabsTrigger>
      </TabsList>
      <TabsContent value="story" className="pt-[var(--space-3)] text-body text-text-primary">
        The story view.
      </TabsContent>
      <TabsContent value="evidence" className="pt-[var(--space-3)] text-body text-text-primary">
        The evidence view.
      </TabsContent>
      <TabsContent value="steps" className="pt-[var(--space-3)] text-body text-text-primary">
        The step list.
      </TabsContent>
    </Tabs>
  )
}

/** The compact toolbar variant. Arrow keys move between tabs, as in the segmented bar. */
export const Pill: Story = {
  args: { value: 'story', onValueChange: () => {}, children: null },
  render: () => <PillInteractive />,
}
