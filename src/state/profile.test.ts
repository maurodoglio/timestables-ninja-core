import { describe, expect, it } from 'vitest'
import { DEFAULT_AVATAR_ID } from '../game/avatars'
import { createProfile, migrate, renameProfile } from './profile'

describe('createProfile', () => {
  it('sets updatedAt alongside createdAt', () => {
    const p = createProfile('Kai')
    expect(p.updatedAt).toBe(p.createdAt)
  })

  it('defaults to the catalog default avatar', () => {
    const p = createProfile('Kai')
    expect(p.avatarId).toBe(DEFAULT_AVATAR_ID)
  })
})

describe('renameProfile', () => {
  it('trims and updates the name', () => {
    const p = createProfile('Kai')
    const renamed = renameProfile(p, '  Miyagi  ')
    expect(renamed.name).toBe('Miyagi')
  })

  it('falls back to Young Ninja for an empty name', () => {
    const p = createProfile('Kai')
    const renamed = renameProfile(p, '   ')
    expect(renamed.name).toBe('Young Ninja')
  })

  it('bumps updatedAt without mutating the original profile', () => {
    const p = { ...createProfile('Kai'), updatedAt: 1 }
    const renamed = renameProfile(p, 'Miyagi')
    expect(renamed.updatedAt).toBeGreaterThan(p.updatedAt)
    expect(p.name).toBe('Kai')
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

  it('falls back to the default avatar when avatarId is missing', () => {
    const legacy = createProfile('Kai')
    const { avatarId: _drop, ...withoutAvatarId } = legacy
    const migrated = migrate({ version: 1, profile: withoutAvatarId as typeof legacy })
    expect(migrated.avatarId).toBe(DEFAULT_AVATAR_ID)
  })

  it('falls back to the default avatar when avatarId is invalid', () => {
    const legacy = { ...createProfile('Kai'), avatarId: 'bogus' as never }
    const migrated = migrate({ version: 1, profile: legacy })
    expect(migrated.avatarId).toBe(DEFAULT_AVATAR_ID)
  })
})
