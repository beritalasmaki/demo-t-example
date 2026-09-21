#!/usr/bin/env node
/*
 * Guards against src/lib/format.ts's locale-sensitive calls silently going back to the
 * runtime's default locale — the bug behind docs/DECISIONS.md's locale-format entry.
 * `Intl.RelativeTimeFormat(undefined, ...)`/`date.toLocaleTimeString(undefined, ...)`/etc.
 * all mean "use whatever locale this browser or OS happens to report," not this app's own
 * design — that's what produced "7 kuukautta sitten" instead of "7 months ago" on a
 * Finnish-locale machine. This is the second locale/format bug found this way (the first was
 * 12-hour vs. 24-hour clock time), so this is now a mechanical check, not something to
 * re-notice by eye a third time — same reasoning as scripts/check-theme-bridge.mjs
 * (docs/DECISIONS.md 0009) for the shadcn-bridge collision pattern.
 *
 * Deliberately narrow — a regex over one file's known call shapes, not a real TS/AST parser
 * or a check that every locale-sensitive API anywhere in the app is covered. It knows about
 * `Intl.<Constructor>(...)` and `.toLocale<Whatever>(...)` calls specifically, and only in
 * src/lib/format.ts. It would need updating if a locale-sensitive call were added somewhere
 * else, or written in a shape this regex doesn't recognize (e.g. via a variable holding the
 * options object across a line break in a way that hides the first argument).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const FORMAT_PATH = fileURLToPath(new URL('../src/lib/format.ts', import.meta.url))

function stripComments(ts) {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

/*
 * Matches `Intl.Something(` or `.toLocaleWhatever(` and captures the first argument up to
 * its own closing paren or a top-level comma — good enough for the flat, single-line call
 * shapes this file actually uses.
 */
const CALL_PATTERN = /\b(Intl\.[A-Za-z]+|\.toLocale[A-Za-z]*)\(\s*([^,)]*)/g

function findUndefinedLocaleCalls(source) {
  const offenders = []
  for (const match of stripComments(source).matchAll(CALL_PATTERN)) {
    const [, callee, firstArg] = match
    const arg = firstArg.trim()
    if (arg === '' || arg === 'undefined') {
      offenders.push({ callee, arg: arg === '' ? '(nothing)' : arg })
    }
  }
  return offenders
}

function main() {
  const source = readFileSync(FORMAT_PATH, 'utf8')
  const offenders = findUndefinedLocaleCalls(source)

  if (offenders.length > 0) {
    console.error(
      `check-format-locale: ${FORMAT_PATH} has a locale-sensitive call with no explicit ` +
        'locale — it will silently follow the runtime\'s default locale instead of this ' +
        'app\'s own English content. Pass the LOCALE constant instead of leaving the ' +
        'argument out or passing undefined.\n',
    )
    for (const { callee, arg } of offenders) {
      console.error(`  ${callee}(${arg}, ...)`)
    }
    process.exit(1)
  }

  console.log('check-format-locale: ok (no locale-sensitive call in format.ts defaults to the runtime locale).')
}

main()
