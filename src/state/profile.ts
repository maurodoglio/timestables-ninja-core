import { detectLanguage } from '../i18n'
import { isBeltId } from '../game/belts'
import type { Profile, Settings } from '../game/types'

/** Bumped when the persisted shape of a profile changes incompatibly. */
export const SCHEMA_VERSION = 1

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
  return {
    id: `ninja-${Date.now().toString(36)}`,
    name: name.trim() || 'Young Ninja',
    belt: 'white',
    xp: 0,
    streakDays: 0,
    lastTrainedOn: null,
    facts: {},
    achievements: [],
    history: [],
    sparringBest: 0,
    settings: { ...DEFAULT_SETTINGS, language: detectLanguage() },
    createdAt: Date.now(),
  }
}

/** Bring an older stored profile up to the current schema. */
export function migrate(envelope: Envelope): Profile {
  const profile = envelope.profile
  return {
    ...createProfile(profile.name ?? 'Young Ninja'),
    ...profile,
    belt: isBeltId(profile.belt) ? profile.belt : 'white',
    settings: { ...DEFAULT_SETTINGS, ...(profile.settings ?? {}) },
    facts: profile.facts ?? {},
    achievements: profile.achievements ?? [],
    history: profile.history ?? [],
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
