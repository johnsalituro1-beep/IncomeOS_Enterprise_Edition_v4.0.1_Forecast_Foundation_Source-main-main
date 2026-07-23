import type { OperationRun } from './dataOperationsEngine'

const STORAGE_KEY = 'incomeos:data-operations:v2.2'

export function loadOperationRuns(): OperationRun[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as OperationRun[] } catch { return [] }
}

export function saveOperationRuns(runs: OperationRun[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, 100)))
}

export function appendOperationRun(run: OperationRun) {
  const runs = [run, ...loadOperationRuns().filter(item => item.id !== run.id)].slice(0, 100)
  saveOperationRuns(runs)
  return runs
}
