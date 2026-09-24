import { defineConfig, devices } from '@playwright/test'

/**
 * The end-to-end specs in `e2e/` (docs/DECISIONS.md, 0059). They run against the Vite dev
 * server, started here, in Chromium only: the one browser `npm run check` already installs.
 * `PLAYWRIGHT_CHROMIUM_EXECUTABLE` points at a preinstalled Chromium when there is one, the
 * same variable scripts/check-theme-bridge.mjs reads.
 */
const PORT = 5188
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: executablePath ? { executablePath } : {},
      },
    },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
})
