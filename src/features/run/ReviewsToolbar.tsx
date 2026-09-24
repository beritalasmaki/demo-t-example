import { ChevronDown, ChevronUp, Search, SlidersHorizontal, X } from 'lucide-react'
import { useId } from 'react'
import type { TimeRange } from '../../lib/reviews'
import { cn } from '../../lib/utils'

/**
 * Search, the Filters button and panel, and the "Showing N of M" line above a My reviews
 * table (docs/DECISIONS.md, 0060). The main list and the archive use it with their own
 * time options and run-type choices.
 */

export interface FilterState {
  query: string
  time: TimeRange
  from: string
  to: string
  requester: string
}

export interface ReviewsToolbarProps {
  searchLabel: string
  searchPlaceholder: string
  filters: FilterState
  onFilters: (next: Partial<FilterState>) => void
  open: boolean
  onToggleOpen: () => void
  timeLabel: string
  timeOptions: { value: TimeRange; label: string }[]
  type: {
    value: string
    options: { value: string; label: string }[]
    onChange: (v: string) => void
    counts: boolean
  }
  people: string[]
  resultLabel: string
  onClear?: () => void
}

const FIELD =
  'rounded-md border border-border bg-surface px-[var(--space-3)] py-[var(--space-2)] text-body font-medium font-body text-text-primary ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus-ring'
const FIELD_LABEL =
  'flex items-center gap-[var(--space-2)] text-meta font-medium font-body whitespace-nowrap text-text-secondary'

export function ReviewsToolbar({
  searchLabel,
  searchPlaceholder,
  filters,
  onFilters,
  open,
  onToggleOpen,
  timeLabel,
  timeOptions,
  type,
  people,
  resultLabel,
  onClear,
}: ReviewsToolbarProps) {
  const panelId = useId()
  const filterCount =
    (filters.time !== 'all' ? 1 : 0) +
    (filters.requester !== 'all' ? 1 : 0) +
    (type.counts && type.value !== 'all' ? 1 : 0)

  return (
    <>
      <div className="flex flex-wrap items-center gap-[var(--space-3)] border-b border-border-subtle p-[var(--space-5)]">
        <label className="relative flex w-full items-center sm:w-[21.25rem]">
          <span className="sr-only">{searchLabel}</span>
          <Search
            aria-hidden
            className="absolute left-[var(--space-3)] h-4 w-4 text-text-secondary"
          />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onFilters({ query: event.target.value })}
            placeholder={searchPlaceholder}
            className={cn(
              FIELD,
              'w-full py-[var(--space-3)] pl-[calc(var(--space-6)+var(--space-1))] font-normal',
            )}
          />
        </label>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            'inline-flex cursor-pointer items-center gap-[var(--space-2)] rounded-md border px-[var(--space-4)] py-[var(--space-3)]',
            'text-body leading-none font-semibold font-heading whitespace-nowrap',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
            open
              ? 'border-primary bg-primary-tint text-primary'
              : 'border-border bg-surface text-text-primary hover:border-text-secondary',
          )}
        >
          <SlidersHorizontal aria-hidden className="h-4 w-4" />
          Filters
          {filterCount > 0 && (
            <span className="rounded-full bg-primary px-[var(--space-2)] py-px text-caption font-semibold text-primary-foreground">
              {filterCount}
              <span className="sr-only"> on</span>
            </span>
          )}
          {open ? (
            <ChevronUp aria-hidden className="h-3 w-3" />
          ) : (
            <ChevronDown aria-hidden className="h-3 w-3" />
          )}
        </button>
        <div className="ml-auto flex items-center gap-[var(--space-4)]">
          <span className="text-meta whitespace-nowrap text-text-secondary">{resultLabel}</span>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex cursor-pointer items-center gap-[var(--space-1)] text-meta font-semibold font-heading whitespace-nowrap text-primary underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          id={panelId}
          className="flex flex-wrap items-center gap-[var(--space-5)] border-b border-border-subtle bg-bg px-[var(--space-5)] py-[var(--space-4)]"
        >
          <label className={FIELD_LABEL}>
            {timeLabel}
            <select
              value={filters.time}
              onChange={(event) => onFilters({ time: event.target.value as TimeRange })}
              className={cn(FIELD, 'cursor-pointer')}
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {filters.time === 'custom' && (
            <div className="flex items-center gap-[var(--space-2)] text-meta text-text-secondary">
              <input
                type="date"
                aria-label="From"
                value={filters.from}
                onChange={(event) => onFilters({ from: event.target.value })}
                className={cn(FIELD, 'text-meta')}
              />
              <span>to</span>
              <input
                type="date"
                aria-label="To"
                value={filters.to}
                onChange={(event) => onFilters({ to: event.target.value })}
                className={cn(FIELD, 'text-meta')}
              />
            </div>
          )}
          <label className={FIELD_LABEL}>
            Run type
            <select
              value={type.value}
              onChange={(event) => type.onChange(event.target.value)}
              className={cn(FIELD, 'cursor-pointer')}
            >
              {type.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={FIELD_LABEL}>
            Requester
            <select
              value={filters.requester}
              onChange={(event) => onFilters({ requester: event.target.value })}
              className={cn(FIELD, 'cursor-pointer')}
            >
              <option value="all">Everyone</option>
              {people.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </>
  )
}
