export type BeltId =
  | 'white'
  | 'yellow'
  | 'orange'
  | 'green'
  | 'blue'
  | 'purple'
  | 'brown'
  | 'red'
  | 'black'
  | 'master'

export interface Belt {
  id: BeltId
  /** Tables introduced at this belt. */
  newTables: number[]
  /** Every table a student knows once this belt is earned. */
  cumulativeTables: number[]
  color: string
  /** Text colour that reads well on `color`. */
  ink: string
  /** Seconds allowed per question during this belt's grading. */
  secondsPerQuestion: number
  /** Average seconds per answer that must not be exceeded to pass. */
  targetAverageSeconds: number
  /** Whether the grading also asks division facts. */
  includeDivision: boolean
}

export type AvatarId =
  | 'white-mask'
  | 'yellow-mask'
  | 'orange-mask'
  | 'green-mask'
  | 'blue-mask'
  | 'purple-mask'
  | 'brown-mask'
  | 'red-mask'
  | 'black-mask'
  | 'master-mask'

export interface Avatar {
  id: AvatarId
  /** Emoji or short label representing this avatar. */
  label: string
  /** Colour associated with this avatar, for visual consistency with belts. */
  color: string
  /** Ninja Stars cost to unlock this avatar; 0 for free/default avatars. */
  starCost: number
}

export interface Fact {
  a: number
  b: number
}

export type QuestionKind = 'multiply' | 'divide'

export interface Question {
  id: string
  kind: QuestionKind
  fact: Fact
  /** Prompt operands as shown, e.g. 12 / 3 for a division question. */
  left: number
  right: number
  answer: number
}

export interface FactStat {
  attempts: number
  correct: number
  /** Rolling average response time in milliseconds. */
  avgMs: number
  lastSeen: number
  /** Consecutive correct answers. */
  streak: number
}

export type MasteryLevel = 'unseen' | 'learning' | 'solid' | 'mastered'

export type SessionMode = 'training' | 'grading' | 'sparring' | 'weak'

export interface SessionResult {
  mode: SessionMode
  belt: BeltId | null
  total: number
  correct: number
  averageMs: number
  /** Ninja Stars earned during this session. */
  xpEarned: number
  passed?: boolean
  at: number
}

export type Language = 'en' | 'it'

export interface Settings {
  language: Language
  showTimer: boolean
  sound: boolean
  reducedMotion: boolean
  readableFont: boolean
}

export interface Profile {
  id: string
  name: string
  belt: BeltId
  /** Ninja Stars earned so far. */
  xp: number
  avatarId: AvatarId
  streakDays: number
  lastTrainedOn: string | null
  facts: Record<string, FactStat>
  achievements: string[]
  history: SessionResult[]
  sparringBest: number
  settings: Settings
  createdAt: number
  /**
   * Last time this profile changed, in any way (session recorded, settings
   * changed, etc). Used for last-write-wins conflict resolution when a
   * profile syncs across devices via a remote store; purely local to a
   * single device otherwise.
   */
  updatedAt: number
}

export const factKey = (kind: QuestionKind, a: number, b: number): string =>
  `${kind}:${a}x${b}`
