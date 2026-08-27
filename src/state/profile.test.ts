import { describe, expect, it } from 'vitest'
import { createProfile, migrate } from './profile'

describe('createProfile', () => {
  it('sets updatedAt alongside createdAt', () => {
    const p = createProfile('Kai')
    expect(p.updatedAt).toBe(p.createdAt)
  })
})

describe('migrate', () => {
  it('falls back to createdAt when updatedAt is missing (pre-sync profiles)', () => {
    const legacy = createProfile('Kai')
    // Simulate a profile persisted before `updatedAt` existed.
    const { updatedAt: _drop, ...withoutUpdatedAt } = legacy
    const migrated = migrate({ version: 1, profile: withoutUpdatedAt as typeof legacy })
    expect(migrated.updatedAt).toBe(legacy.createdAt)
  })

  it('preserves an existing updatedAt', () => {
    const p = { ...createProfile('Kai'), updatedAt: 123 }
    const migrated = migrate({ version: 1, profile: p })
    expect(migrated.updatedAt).toBe(123)
  })
})
