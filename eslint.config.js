// @ts-check
import js from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import storybook from 'eslint-plugin-storybook'
import tseslint from 'typescript-eslint'
import globals from 'globals'

/*
 * Dependency direction, enforced.
 *
 * AGENTS.md: "Dependencies point one way: fixtures -> lib -> components ->
 * features -> app. Never the other way." import/no-restricted-paths is the
 * mechanical version of that sentence: each zone below lists the zones it may
 * not import from. A violation is a lint error, not a style preference.
 *
 * components/ and styles/ are the design system (AGENTS.md, DECISIONS 0002):
 * they must not import from features/ or fixtures/, and components/ must not
 * reach into lib/api (data access is a product concern, not a design-system one).
 */
const dependencyDirectionRules = {
  rules: {
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/lib',
            from: ['./src/components', './src/features', './src/app'],
            message: 'lib/ must not depend on the interface. See AGENTS.md.',
          },
          {
            target: './src/fixtures',
            from: ['./src/components', './src/features', './src/app'],
            message: 'fixtures/ must not depend on the interface. See AGENTS.md.',
          },
          {
            target: './src/components',
            from: ['./src/features', './src/app', './src/fixtures'],
            message:
              'components/ is the design system: it must not import from features/, ' +
              'app/ or fixtures/. See AGENTS.md and DECISIONS.md 0002.',
          },
          {
            target: './src/components',
            from: ['./src/lib/api.ts'],
            message:
              'components/ is presentational only: no lib/api imports. Data arrives as ' +
              'props. See src/components/README.md.',
          },
          {
            target: './src/styles',
            from: ['./src/features', './src/app', './src/fixtures'],
            message:
              'styles/ is the design system: it must not import from features/, app/ or ' +
              'fixtures/. See AGENTS.md and DECISIONS.md 0002.',
          },
          {
            target: './src/features',
            from: ['./src/app'],
            message: 'features/ must not depend on app/. See AGENTS.md.',
          },
        ],
      },
    ],
  },
}

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'coverage', 'playwright-report'] },
  {
    // Applies to every linted file (no `files` filter), because
    // import/no-restricted-paths and import/no-unresolved below are global too.
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.app.json', './tsconfig.node.json', './tsconfig.storybook.json'],
          noWarnOnMultipleProjects: true,
        },
        node: true,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    // eslint.config.js and the check scripts are plain JS/ESM with no tsconfig
    // of their own, so they cannot carry type-aware rules; they still get the
    // non-type-aware ones above.
    files: ['eslint.config.js', 'scripts/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    // check-theme-bridge.mjs's page.evaluate() callbacks run inside a real browser
    // (Playwright), not Node — same reasoning as the browser+node combination test
    // files get below.
    files: ['scripts/check-theme-bridge.mjs'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'eslint.config.js',
            'scripts/check-theme-bridge.mjs',
            'scripts/check-format-locale.mjs',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    ...importPlugin.flatConfigs.recommended,
    ...dependencyDirectionRules,
    rules: {
      ...importPlugin.flatConfigs.recommended.rules,
      ...dependencyDirectionRules.rules,
    },
  },
  {
    files: ['**/*.config.{js,ts}', '.storybook/**/*.{ts,tsx}', '**/*.stories.tsx'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // These are Storybook/build config, not app code being fast-refreshed.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Test files are exempt from the strict type-checked ruleset's stricter
    // assertions (e.g. no-non-null-assertion shows up a lot in test setup).
    files: ['**/*.test.{ts,tsx}', 'vitest.setup.ts'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  storybook.configs['flat/recommended'],
)
