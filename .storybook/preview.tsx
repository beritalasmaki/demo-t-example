import type { Decorator, Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import '../src/styles/index.css'

/*
 * Applies the `theme` global to <html data-theme>, the same attribute
 * tokens.css reads. Lets a story declare `globals: { theme: 'dark' }` and get
 * the real dark-theme tokens, not a simulation of them.
 */
const ThemeDecorator: Decorator = (Story, context) => {
  const theme = context.globals.theme as 'light' | 'dark' | undefined

  useEffect(() => {
    const root = document.documentElement
    if (theme) {
      root.setAttribute('data-theme', theme)
    } else {
      root.removeAttribute('data-theme')
    }
    return () => root.removeAttribute('data-theme')
  }, [theme])

  return <Story />
}

const preview: Preview = {
  decorators: [ThemeDecorator],
  globalTypes: {
    theme: {
      description: 'Theme, matching tokens.css (light is the default)',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // AGENTS.md: "Accessibility is part of done." Failing a story on an a11y
    // violation, rather than only flagging it, keeps that non-negotiable
    // mechanical instead of relying on someone remembering to check the panel.
    a11y: {
      test: 'error',
    },
  },
}

export default preview
