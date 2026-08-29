import { describe, expect, it } from 'vitest'
import { AVATARS, DEFAULT_AVATAR_ID, getAvatar, isAvatarId } from './avatars'

describe('avatars', () => {
  it('has a non-empty catalog with unique ids', () => {
    expect(AVATARS.length).toBeGreaterThanOrEqual(8)
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length)
  })

  it('every avatar has a label, color, and non-negative starCost', () => {
    for (const avatar of AVATARS) {
      expect(avatar.label.length).toBeGreaterThan(0)
      expect(avatar.color.length).toBeGreaterThan(0)
      expect(avatar.starCost).toBeGreaterThanOrEqual(0)
    }
  })

  it('the default avatar is free', () => {
    expect(getAvatar(DEFAULT_AVATAR_ID).starCost).toBe(0)
  })

  it('recognises only avatars in the catalog', () => {
    expect(isAvatarId(DEFAULT_AVATAR_ID)).toBe(true)
    expect(isAvatarId('not-a-real-avatar')).toBe(false)
    expect(isAvatarId(undefined)).toBe(false)
  })

  it('falls back to the default avatar for an unknown id', () => {
    expect(getAvatar('bogus' as never).id).toBe(DEFAULT_AVATAR_ID)
  })
})
