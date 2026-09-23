import type { Meta, StoryObj } from '@storybook/react-vite'
import { runBlocked, runMessy } from '../../fixtures'
import { RunShape } from './RunShape'

const meta = {
  title: 'Features/Run/RunShape',
  component: RunShape,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '21.25rem' }}>
        <Story />
      </div>
    ),
  ],
  args: { run: runMessy },
} satisfies Meta<typeof RunShape>

export default meta
type Story = StoryObj<typeof meta>

export const LongRun: Story = {}

export const ErrorAndRetry: Story = { args: { run: runBlocked } }

export const NoTestCount: Story = { args: { run: { ...runMessy, timeline: [] } } }
