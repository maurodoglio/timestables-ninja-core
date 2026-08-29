import type { Avatar, AvatarId } from './types'

interface AvatarSeed {
  id: AvatarId
  label: string
  color: string
  starCost: number
}

const SEEDS: AvatarSeed[] = [
  { id: 'white-mask', label: '🥷', color: '#f4f4f2', starCost: 0 },
  { id: 'yellow-mask', label: '🐯', color: '#ffd83d', starCost: 20 },
  { id: 'orange-mask', label: '🦊', color: '#ff9636', starCost: 20 },
  { id: 'green-mask', label: '🐢', color: '#3fbf6f', starCost: 30 },
  { id: 'blue-mask', label: '🐬', color: '#3d8bff', starCost: 30 },
  { id: 'purple-mask', label: '🦉', color: '#8d5cf6', starCost: 40 },
  { id: 'brown-mask', label: '🐻', color: '#8a5a33', starCost: 40 },
  { id: 'red-mask', label: '🐉', color: '#e2453c', starCost: 50 },
  { id: 'black-mask', label: '🐺', color: '#20242f', starCost: 60 },
  { id: 'master-mask', label: '🐲', color: '#d4af37', starCost: 100 },
]

export const AVATARS: Avatar[] = SEEDS.map((seed) => ({ ...seed }))

/** The avatar every new profile starts with, before any Ninja Stars are spent. */
export const DEFAULT_AVATAR_ID: AvatarId = AVATARS[0].id

/** Whether a stored value names an avatar in the catalog. */
export function isAvatarId(value: unknown): value is AvatarId {
  return typeof value === 'string' && AVATARS.some((a) => a.id === value)
}

export function getAvatar(id: AvatarId): Avatar {
  return AVATARS.find((a) => a.id === id) ?? getAvatar(DEFAULT_AVATAR_ID)
}
