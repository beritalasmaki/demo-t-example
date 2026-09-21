import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { NOT_FOUND_RUN_ID } from '../../lib/api'
import { runClean } from '../../fixtures'
import { useRun } from './useRun'

describe('useRun', () => {
  it('starts in the loading state', () => {
    const { result } = renderHook(() => useRun(runClean.id, { delayMs: 0 }))
    expect(result.current.state).toEqual({ status: 'loading' })
  })

  it('resolves to the run on success', async () => {
    const { result } = renderHook(() => useRun(runClean.id, { delayMs: 0 }))
    await waitFor(() => expect(result.current.state.status).toBe('success'))
    const state = result.current.state
    if (state.status !== 'success') throw new Error('expected success')
    expect(state.run.id).toBe(runClean.id)
  })

  it('reports not-found for an id with no matching run', async () => {
    const { result } = renderHook(() => useRun(NOT_FOUND_RUN_ID, { delayMs: 0 }))
    await waitFor(() => expect(result.current.state.status).toBe('not-found'))
  })

  it('reports error, per Content rules, when the load fails', async () => {
    const { result } = renderHook(() =>
      useRun(runClean.id, { delayMs: 0, simulateNetworkError: true }),
    )
    await waitFor(() => expect(result.current.state.status).toBe('error'))
    const state = result.current.state
    if (state.status !== 'error') throw new Error('expected error')
    expect(state.error.message).toBe('The connection timed out.')
  })

  it('retries the load when refetch is called', async () => {
    let shouldFail = true
    const { result } = renderHook(() =>
      useRun(runClean.id, { delayMs: 0, simulateNetworkError: shouldFail }),
    )
    await waitFor(() => expect(result.current.state.status).toBe('error'))

    shouldFail = false
    act(() => {
      result.current.refetch()
    })

    await waitFor(() => expect(result.current.state.status).toBe('loading'))
    await waitFor(() => expect(result.current.state.status).toBe('success'))
  })
})
