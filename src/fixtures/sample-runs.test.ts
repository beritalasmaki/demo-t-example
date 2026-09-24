import { describe, expect, it } from 'vitest'
import { buildOpenItems } from '../lib/openItems'
import { archiveState, isInProgress, reviewStage, reviewStatus } from '../lib/reviews'
import { resolveEvidenceIds } from '../lib/timeline'
import { sampleRuns } from './sample-runs'

describe('sample runs', () => {
  it('have unique ids', () => {
    const ids = sampleRuns.map((run) => run.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('approve exactly the open items their own data produces', () => {
    for (const run of sampleRuns.filter((r) => r.status === 'approved')) {
      expect(run.decision?.acknowledgedItemIds.sort(), run.id).toEqual(
        buildOpenItems(run)
          .map((item) => item.id)
          .sort(),
      )
    }
  })

  it('source every story step from their own steps', () => {
    for (const run of sampleRuns) {
      for (const step of run.story) {
        expect(
          resolveEvidenceIds(step.evidenceIds, run.timeline),
          `${run.id} ${step.id}`,
        ).toHaveLength(step.evidenceIds.length)
      }
    }
  })

  it('include work still in progress in Pending and in Requested for change', () => {
    const inProgress = sampleRuns.filter(isInProgress)
    expect(inProgress.filter((run) => reviewStage(run) === 'agent')).toHaveLength(2)
    expect(inProgress.filter((run) => reviewStage(run) === 'checks')).toHaveLength(2)
    expect(inProgress.filter((run) => reviewStatus(run) === 'requested')).toHaveLength(3)
  })

  it('fill the archive with locked runs and one that can still be restored', () => {
    const archived = sampleRuns
      .map((run) => archiveState(run, {}))
      .filter((state) => state.archived)
    expect(archived).toHaveLength(4)
    expect(archived.filter((state) => state.canRestore)).toHaveLength(1)
  })
})
