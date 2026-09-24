import { formatCalendarDate, formatClock } from '../../lib/format'
import type { ReportInclude } from '../../lib/reviews'
import { buildReportCsv, reportRecord } from '../../lib/reviews'
import type { Run } from '../../lib/types'

/**
 * Makes the report the reviewer asked for (docs/DECISIONS.md, 0060), from the runs' own data.
 * There is no server, so both formats are made in the browser: CSV as a download, and PDF as
 * a print-ready page the browser saves as a PDF — no PDF library needed.
 */

function fileName(name: string, extension: string): string {
  const safe = name.replace(/[^\p{L}\p{N} _.-]+/gu, '').trim() || 'Review report'
  return `${safe}.${extension}`
}

export function downloadCsvReport(name: string, runs: Run[], include: ReportInclude) {
  const blob = new Blob([buildReportCsv(runs, include)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName(name, 'csv')
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const escape = (text: string) =>
  text.replace(
    /[&<>"]/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!,
  )

/** The report as a standalone HTML page, plain and printable. Its few colours are written
 * out, not tokens: the page opens in a new tab, outside the app's stylesheet. */
export function reportHtml(
  name: string,
  runs: Run[],
  include: ReportInclude,
  now: Date = new Date(),
): string {
  const sections = runs.map((run) => {
    const r = reportRecord(run, include)
    const parts = [
      `<h2>${escape(r.title)}</h2>`,
      `<p class="meta">${escape(r.reference)} · ${escape(r.service)} · ${escape(r.environment)} · ${escape(r.status)} · requested by ${escape(r.requestedBy)}</p>`,
    ]
    if (r.decision) {
      parts.push(
        `<h3>Decision</h3><p>${escape(r.decision.outcome)} by ${escape(r.decision.by)}, ${escape(formatCalendarDate(r.decision.at))} at ${escape(formatClock(r.decision.at))}.</p>`,
        r.decision.reason ? `<blockquote>${escape(r.decision.reason)}</blockquote>` : '',
      )
    }
    if (r.openItems) {
      parts.push(
        '<h3>Open items</h3>',
        r.openItems.length
          ? `<ul>${r.openItems.map((i) => `<li>${escape(i.text)}${i.accepted ? ' <em>(accepted)</em>' : ''}</li>`).join('')}</ul>`
          : '<p>None.</p>',
      )
    }
    if (r.checks && r.confidence) {
      parts.push(
        `<h3>Checks</h3><ul>${r.checks.map((c) => `<li>${escape(c)}</li>`).join('')}</ul>`,
        `<h3>Confidence</h3><ul>${r.confidence.map((c) => `<li>${escape(c)}</li>`).join('')}</ul>`,
      )
    }
    if (r.steps) {
      parts.push(
        `<h3>Every agent step</h3><ol>${r.steps
          .map(
            (s) => `<li>${escape(formatClock(s.at))} · ${escape(s.type)} · ${escape(s.title)}</li>`,
          )
          .join('')}</ol>`,
      )
    }
    return `<section>${parts.join('')}</section>`
  })
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escape(name)}</title>
<style>
body{font:14px/1.5 system-ui,sans-serif;color:#222;margin:32px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:17px;margin:0 0 4px}h3{font-size:13px;margin:16px 0 4px;text-transform:uppercase;letter-spacing:.05em;color:#5c5c5c}
.meta{color:#5c5c5c;font-size:12px;margin:0}section{border-top:1px solid #ddd;padding-top:16px;margin-top:24px;break-inside:avoid-page}
blockquote{margin:4px 0;padding:4px 12px;border-left:3px solid #cacaca}
</style></head><body>
<h1>${escape(name)}</h1><p class="meta">${runs.length} run${runs.length === 1 ? '' : 's'} · made ${escape(formatCalendarDate(now.toISOString()))}</p>
${sections.join('\n')}
</body></html>`
}

/** Opens the report in a new tab and the print dialog, where "Save as PDF" makes the file.
 * Returns false if the browser blocked the new tab. */
export function openPdfReport(name: string, runs: Run[], include: ReportInclude): boolean {
  const page = window.open('', '_blank')
  if (!page) return false
  page.document.write(reportHtml(name, runs, include))
  page.document.close()
  page.focus()
  page.print()
  return true
}
