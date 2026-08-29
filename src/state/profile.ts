import { detectLanguage } from '../i18n'
import { isBeltId } from '../game/belts'
import { DEFAULT_AVATAR_ID, isAvatarId } from '../game/avatars'
import type { Profile, Settings } from '../game/types'

/** Bumped when the persisted shape of a profile changes incompatibly. */
export const SCHEMA_VERSION = 2

export interface Envelope {
  version: number
  profile: Profile
}

export const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  showTimer: true,
  sound: true,
  reducedMotion: false,
  readableFont: false,
}

export function createProfile(name: string): Profile {
  const now = Date.now()
  return {
    id: `ninja-${now.toString(36)}`,
    name: name.trim() || 'Young Ninja',
    belt: 'white',
    avatarId: DEFAULT_AVATAR_ID,
    xp: 0,
    streakDays: 0,
    lastTrainedOn: null,
    facts: {},
    achievements: [],
    history: [],
    sparringBest: 0,
    settings: { ...DEFAULT_SETTINGS, language: detectLanguage() },
    createdAt: now,
    updatedAt: now,
  }
}

/** Bring an older stored profile up to the current schema. */
export function migrate(envelope: Envelope): Profile {
  const profile = envelope.profile
  const now = Date.now()
  return {
    ...createProfile(profile.name ?? 'Young Ninja'),
    ...profile,
    belt: isBeltId(profile.belt) ? profile.belt : 'white',
    avatarId: isAvatarId(profile.avatarId) ? profile.avatarId : DEFAULT_AVATAR_ID,
    settings: { ...DEFAULT_SETTINGS, ...(profile.settings ?? {}) },
    facts: profile.facts ?? {},
    achievements: profile.achievements ?? [],
    history: profile.history ?? [],
    // Profiles persisted before this field existed fall back to createdAt
    // (or now, if that's missing too) rather than 0, so they don't always
    // lose a last-write-wins comparison against a freshly created profile.
    updatedAt: profile.updatedAt ?? profile.createdAt ?? now,
  }
}

/**
 * Update a profile's display name. Trims the input and falls back to
 * 'Young Ninja' if empty, mirroring `createProfile`'s name handling.
 */
export function renameProfile(profile: Profile, name: string): Profile {
  return {
    ...profile,
    name: name.trim() || 'Young Ninja',
    updatedAt: Date.now(),
  }
}

export function exportProfile(profile: Profile): string {
  return JSON.stringify({ version: SCHEMA_VERSION, profile }, null, 2)
}

export function importProfile(json: string): Profile {
  const parsed = JSON.parse(json) as Envelope
  if (!parsed?.profile?.id) throw new Error('NOT_A_PROFILE')
  return migrate(parsed)
}
