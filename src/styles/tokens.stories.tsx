import type { Meta, StoryObj } from '@storybook/react-vite'

/*
 * Not a component — a live check on the tokens themselves. If a token's name
 * changes in tokens.css, this story is where that shows up, in both themes,
 * before it reaches a real screen. See src/styles/README.md.
 */

const statusTokens = [
  { name: 'pass', label: 'Pass' },
  { name: 'fail', label: 'Fail' },
  { name: 'waived', label: 'Waived' },
  { name: 'unknown', label: 'Unknown' },
  { name: 'running', label: 'Running' },
] as const

function Swatch({ label, style }: { label: string; style: React.CSSProperties }) {
  return (
    <div
      style={{
        ...style,
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        fontFamily: 'sans-serif',
        fontSize: '0.875rem',
        minWidth: '10rem',
      }}
    >
      {label}
    </div>
  )
}

function TokensShowcase() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem',
        background: 'var(--color-surface-base)',
        color: 'var(--color-text-primary)',
        fontFamily: 'sans-serif',
      }}
    >
      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Surfaces &amp; text</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Swatch
            label="surface-base"
            style={{
              background: 'var(--color-surface-base)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          />
          <Swatch
            label="surface-raised"
            style={{
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          />
          <Swatch
            label="text-secondary"
            style={{
              background: 'var(--color-surface-raised)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          />
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
          Gate &amp; run status — never colour alone
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {statusTokens.map(({ name, label }) => (
            <Swatch
              key={name}
              label={`● ${label}`}
              style={{
                background: `var(--color-status-${name}-bg)`,
                color: `var(--color-status-${name}-fg)`,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

const meta = {
  title: 'Design system/Tokens',
  component: TokensShowcase,
  parameters: {
    // The point of this story is comparing both themes; a fixed background
    // would defeat that, so the usual layout padding is skipped.
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TokensShowcase>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {
  globals: { theme: 'light' },
}

export const Dark: Story = {
  globals: { theme: 'dark' },
}
