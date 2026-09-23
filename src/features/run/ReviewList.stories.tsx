import type { Meta, StoryObj } from '@storybook/react-vite'
import { ReviewList } from './ReviewList'

const meta = {
  title: 'Features/Run/ReviewList',
  component: ReviewList,
  parameters: { layout: 'fullscreen' },
  args: { runHref: (id: string) => `?run=${id}`, options: { delayMs: 0 } },
} satisfies Meta<typeof ReviewList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Loading: Story = { args: { options: { delayMs: 1_000_000 } } }

export const LoadFailed: Story = { args: { options: { delayMs: 0, simulateNetworkError: true } } }
