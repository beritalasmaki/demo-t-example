import type { Meta, StoryObj } from '@storybook/react-vite'
import { RegionCard } from './RegionCard'

const meta = {
  title: 'Components/RegionCard',
  component: RegionCard,
} satisfies Meta<typeof RegionCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <h2 className="text-section-heading font-semibold text-text-primary">A region</h2>
        <p className="text-body mt-[var(--space-3)] text-text-secondary">Its content.</p>
      </>
    ),
  },
}

export const AsHeader: Story = {
  args: {
    as: 'header',
    children: (
      <h2 className="text-section-heading font-semibold text-text-primary">
        Rendered as a &lt;header&gt;
      </h2>
    ),
  },
}

export const LongContent: Story = {
  args: {
    children: (
      <>
        <h2 className="text-section-heading font-semibold text-text-primary">
          A region with a lot inside it
        </h2>
        <ul className="mt-[var(--space-3)] flex flex-col gap-[var(--space-3)]">
          {Array.from({ length: 6 }, (_, i) => (
            <li
              key={i}
              className="rounded-md border border-border-subtle bg-surface px-[var(--space-4)] py-[var(--space-3)] text-text-primary"
            >
              Row {i + 1} — confirms nested cards (e.g. a policy gate, a timeline event) still
              read correctly inside the region's own container.
            </li>
          ))}
        </ul>
      </>
    ),
  },
}
