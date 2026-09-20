#!/usr/bin/env node
/*
 * Guards against the shadcn bridge silently overriding a semantic token — the
 * bug class behind docs/DECISIONS.md 0007 (`--color-accent`) and 0008
 * (`--color-border`). Both happened the same way: `src/styles/index.css`'s
 * `@theme inline` block declared a custom property that shares its exact name
 * with one of our own tokens in `src/styles/tokens.css`'s `@theme` block, but
 * pointed it at a *different* value. Because the bridge is `@import`ed after
 * tokens.css, that later declaration wins the cascade for every consumer of
 * that name, everywhere in the app — not just inside shadcn components.
 *
 * The only safe way for a bridge declaration to share a token's name is to
 * mirror it exactly (`--color-x: var(--color-x);`), which just pulls the
 * token's own value through unchanged. Anything else under a colliding name —
 * a different var() target, a literal value — is exactly the mistake this
 * check exists to catch, whether or not anything currently uses that name.
 *
 * This is a static, text-level check (regex over the two `@theme` blocks),
 * not a real CSS parser: it is deliberately narrow, matching how the bridge
 * file is actually written (flat `--name: value;` lines, no nesting). If
 * either file's structure changes enough to break the regexes below, this
 * script should fail loudly (via the "no @theme block found" checks) rather
 * than silently stop checking anything.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TOKENS_PATH = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
const BRIDGE_PATH = fileURLToPath(new URL('../src/styles/index.css', import.meta.url))

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/** Finds `${atRule} {`, then walks braces to return the text between them. */
function extractBlock(css, atRule) {
  const withoutComments = stripComments(css)
  const start = withoutComments.indexOf(atRule)
  if (start === -1) return null

  const openBrace = withoutComments.indexOf('{', start)
  if (openBrace === -1) return null

  let depth = 0
  for (let i = openBrace; i < withoutComments.length; i++) {
    if (withoutComments[i] === '{') depth++
    else if (withoutComments[i] === '}') {
      depth--
      if (depth === 0) return withoutComments.slice(openBrace + 1, i)
    }
  }
  return null
}

/** Parses flat `--name: value;` declarations out of a block's text. */
function parseDeclarations(blockText) {
  const declarations = new Map()
  const pattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
  for (const match of blockText.matchAll(pattern)) {
    declarations.set(match[1], match[2].trim())
  }
  return declarations
}

function main() {
  const tokensCss = readFileSync(TOKENS_PATH, 'utf8')
  const bridgeCss = readFileSync(BRIDGE_PATH, 'utf8')

  const tokensBlock = extractBlock(tokensCss, '@theme')
  const bridgeBlock = extractBlock(bridgeCss, '@theme inline')

  if (!tokensBlock) {
    console.error(`check-theme-bridge: found no "@theme { ... }" block in ${TOKENS_PATH}.`)
    process.exit(1)
  }
  if (!bridgeBlock) {
    console.error(`check-theme-bridge: found no "@theme inline { ... }" block in ${BRIDGE_PATH}.`)
    process.exit(1)
  }

  const tokens = parseDeclarations(tokensBlock)
  const bridge = parseDeclarations(bridgeBlock)

  const mismatches = []
  for (const [name, bridgeValue] of bridge) {
    if (!tokens.has(name)) continue // a fresh shadcn-only slot: nothing to collide with

    const tokenValue = tokens.get(name)
    const mirrorsToken = bridgeValue === `var(--${name})`
    if (!mirrorsToken) {
      mismatches.push({ name, bridgeValue, tokenValue })
    }
  }

  if (mismatches.length > 0) {
    console.error(
      'check-theme-bridge: the shadcn bridge (src/styles/index.css) redeclares a semantic ' +
        "token's own name with a different value. This silently overrides that token for " +
        'every consumer of the name, everywhere in the app — see docs/DECISIONS.md 0007 and ' +
        '0008 for the two times this already happened.\n',
    )
    for (const { name, bridgeValue, tokenValue } of mismatches) {
      console.error(`  --${name}`)
      console.error(`    tokens.css:  ${tokenValue}`)
      console.error(`    bridge sets: ${bridgeValue}`)
      console.error(
        `    fix: either remove --${name} from the bridge's @theme inline block, or change ` +
          `it to "var(--${name});" to intentionally mirror the token.\n`,
      )
    }
    process.exit(1)
  }

  console.log(
    `check-theme-bridge: ok (${bridge.size} bridge variables checked, ` +
      `${[...bridge.keys()].filter((name) => tokens.has(name)).length} share a token name).`,
  )
}

main()
