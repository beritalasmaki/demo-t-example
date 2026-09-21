import type { ComponentType } from 'react'
import {
  ClipboardList,
  FilePen,
  FlaskConical,
  OctagonAlert,
  ShieldCheck,
  StickyNote,
  Terminal,
} from 'lucide-react'
import { Disclosure } from '../../components/Disclosure'
import { IconText } from '../../components/IconText'
import { formatDateTime, formatRelativeTime } from '../../lib/format'
import { isError } from '../../lib/timeline'
import type { TimelineEvent } from '../../lib/types'

/**
 * One audit-log entry. See docs/spec-review-screen.md, Region 4 and "Hierarchy and
 * disclosure": title and time are always visible; detail and artefacts are hidden until
 * opened, never deleted from the screen.
 *
 * Named `TimelineEventRow`, not `TimelineEvent` as `features/run/README.md` lists it — that
 * name is already `lib/types.ts`'s `TimelineEvent`, and this file needs both in scope.
 */
const ICON_BY_TYPE: Record<TimelineEvent['type'], ComponentType<{ className?: string }>> = {
  plan: ClipboardList,
  tool_call: Terminal,
  file_change: FilePen,
  test_run: FlaskConical,
  gate_eval: ShieldCheck,
  error: OctagonAlert,
  note: StickyNote,
}

/** The card look shared by an expandable and a plain row, so a 200-event list reads as one
 * consistent sequence regardless of which rows happen to have detail. */
const ROW_CLASSNAME = 'rounded-md border border-border-subtle bg-surface px-4 py-3'

export interface TimelineEventRowProps {
  event: TimelineEvent
  /** True if this event would have been excluded by the active type filters, and is only
   * showing because it's an error or a retry (docs/spec-review-screen.md, Acceptance
   * criteria: "Errors and retries are visible with all filters on"). */
  forcedVisible?: boolean
  defaultOpen?: boolean
}

export function TimelineEventRow({
  event,
  forcedVisible = false,
  defaultOpen = false,
}: TimelineEventRowProps) {
  const Icon = ICON_BY_TYPE[event.type]
  const iconClassName = isError(event)
    ? 'text-status-fail'
    : event.severity === 'warning'
      ? 'text-status-waived'
      : 'text-text-secondary'

  const summary = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <IconText icon={Icon} iconClassName={iconClassName}>
        <span className="text-text-primary">{event.title}</span>
      </IconText>
      <span className="text-sm text-text-secondary">
        {formatDateTime(event.at)} ({formatRelativeTime(event.at)})
      </span>
      {forcedVisible && (
        <span className="text-xs text-text-secondary">Shown despite the active filters</span>
      )}
    </div>
  )

  const hasDetail = Boolean(event.detail) || Boolean(event.artefactIds?.length)
  // A stable anchor target, so anything that cites this event as evidence (e.g. RunSummary)
  // can link straight to it instead of just naming it.
  const anchorId = `timeline-event-${event.id}`

  if (!hasDetail) {
    return (
      <li id={anchorId} className={ROW_CLASSNAME}>
        {summary}
      </li>
    )
  }

  return (
    <li id={anchorId}>
      {/* No className passed — Disclosure's own default (rounded-md border border-border-subtle
       * bg-surface) is exactly ROW_CLASSNAME; passing it again would just be redundant. */}
      <Disclosure defaultOpen={defaultOpen} summary={summary}>
        <div className="flex flex-col gap-2 text-sm">
          {event.detail && <p className="text-text-primary">{event.detail}</p>}
          {event.artefactIds && event.artefactIds.length > 0 && (
            <div>
              <p className="font-medium text-text-primary">Artefacts</p>
              <ul className="mt-1 list-disc pl-5 text-text-secondary">
                {event.artefactIds.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Disclosure>
    </li>
  )
}
