import { MULTIPLIERS } from './belts'
import type { Fact, FactStat, MasteryLevel, Question, QuestionKind } from './types'
import { factKey } from './types'

/** All multiplication facts for the given tables, against multipliers 1..12. */
export function factsForTables(tables: number[]): Fact[] {
  const facts: Fact[] = []
  for (const a of tables) {
    for (const b of MULTIPLIERS) {
      facts.push({ a, b })
    }
  }
  return facts
}

export function makeQuestion(fact: Fact, kind: QuestionKind): Question {
  const product = fact.a * fact.b
  if (kind === 'divide') {
    return {
      id: `${factKey('divide', fact.a, fact.b)}#${product}`,
      kind,
      fact,
      left: product,
      right: fact.b,
      answer: fact.a,
    }
  }
  return {
    id: factKey('multiply', fact.a, fact.b),
    kind,
    fact,
    left: fact.a,
    right: fact.b,
    answer: product,
  }
}

export function masteryLevel(stat: FactStat | undefined): MasteryLevel {
  if (!stat || stat.attempts === 0) return 'unseen'
  const accuracy = stat.correct / stat.attempts
  if (stat.attempts < 3 || accuracy < 0.6) return 'learning'
  if (accuracy >= 0.9 && stat.streak >= 3 && stat.avgMs <= 5000) return 'mastered'
  return 'solid'
}

const LEVEL_WEIGHT: Record<MasteryLevel, number> = {
  unseen: 6,
  learning: 10,
  solid: 3,
  mastered: 1,
}

/**
 * Multipliers that make a fact trivially easy regardless of mastery
 * (anything times 1, and the "add a zero" ×10 facts). Without this, a fact
 * like 7×10 looks identical to 7×7 or 7×8 once both are "mastered", so it
 * keeps resurfacing in later belt tests just as often as genuinely hard
 * facts. Down-weighting these operands keeps practice time (and grading
 * questions) focused on the facts that are actually still being learned.
 */
const TRIVIAL_MULTIPLIERS = new Set([1, 10])
/** Comparatively easy, but not as trivial as ×1/×10. */
const EASY_MULTIPLIERS = new Set([2, 5])

function operandDifficulty(n: number): number {
  if (TRIVIAL_MULTIPLIERS.has(n)) return 0.2
  if (EASY_MULTIPLIERS.has(n)) return 0.6
  return 1
}

/**
 * Intrinsic difficulty of a fact based on its operands alone, independent of
 * how the student has performed on it. 1 for a fact with no easy operand,
 * scaling down towards 0 for facts built entirely from trivial multipliers
 * (e.g. 1×10).
 */
export function factDifficulty(fact: Fact): number {
  return operandDifficulty(fact.a) * operandDifficulty(fact.b)
}

/**
 * How urgently a fact should be practised. Struggling and slow facts score
 * higher; facts not seen for a long time get a gentle boost so mastery is
 * refreshed rather than assumed. The result is then scaled by the fact's
 * intrinsic difficulty so trivial facts (×1, ×10) never dominate a session
 * just because they happen to be unseen or rusty.
 */
export function factWeight(
  stat: FactStat | undefined,
  now: number = Date.now(),
  fact?: Fact,
): number {
  const level = masteryLevel(stat)
  let weight = LEVEL_WEIGHT[level]
  if (stat && stat.attempts > 0) {
    const accuracy = stat.correct / stat.attempts
    weight += (1 - accuracy) * 6
    if (stat.avgMs > 6000) weight += 2
    const days = (now - stat.lastSeen) / 86_400_000
    if (days > 3) weight += Math.min(days - 3, 5)
  }
  const difficulty = fact ? factDifficulty(fact) : 1
  return Math.max(weight * difficulty, 0.5 * difficulty)
}

export type Rng = () => number

function weightedPick(pool: Fact[], weights: number[], rng: Rng): number {
  const total = weights.reduce((s, w) => s + w, 0)
  let roll = rng() * total
  for (let i = 0; i < pool.length; i += 1) {
    if (weights[i] <= 0) continue
    roll -= weights[i]
    if (roll <= 0) return i
  }
  // Rounding can exhaust the roll early; fall back to the last eligible fact.
  for (let i = pool.length - 1; i >= 0; i -= 1) {
    if (weights[i] > 0) return i
  }
  return pool.length - 1
}

export interface SelectOptions {
  tables: number[]
  count: number
  stats: Record<string, FactStat>
  includeDivision?: boolean
  now?: number
  rng?: Rng
}

/**
 * Pick a practice set, weighted towards facts the student finds hard while
 * avoiding asking the same fact twice in a row.
 */
export function selectQuestions({
  tables,
  count,
  stats,
  includeDivision = false,
  now = Date.now(),
  rng = Math.random,
}: SelectOptions): Question[] {
  const pool = factsForTables(tables)
  if (pool.length === 0 || count <= 0) return []

  const questions: Question[] = []
  let lastId = ''
  for (let i = 0; i < count; i += 1) {
    const kind: QuestionKind =
      includeDivision && rng() < 0.3 ? 'divide' : 'multiply'
    const weights = pool.map((f) =>
      factWeight(stats[factKey(kind, f.a, f.b)], now, f),
    )
    const repeatIndices = pool
      .map((f, idx) => (makeQuestion(f, kind).id === lastId ? idx : -1))
      .filter((idx) => idx >= 0)
    // Exclude the previously asked question, unless it is the only distinct
    // question available (e.g. a single-fact pool), in which case a repeat
    // is unavoidable and the original weights are kept.
    if (repeatIndices.length < pool.length) {
      for (const idx of repeatIndices) weights[idx] = 0
    }
    const q = makeQuestion(pool[weightedPick(pool, weights, rng)], kind)
    lastId = q.id
    questions.push(q)
  }
  return questions
}

/** The facts a student is weakest at, hardest first. */
export function weakestFacts(
  tables: number[],
  stats: Record<string, FactStat>,
  limit: number,
  now: number = Date.now(),
): Fact[] {
  return factsForTables(tables)
    .map((fact) => ({
      fact,
      weight: factWeight(stats[factKey('multiply', fact.a, fact.b)], now, fact),
      seen: stats[factKey('multiply', fact.a, fact.b)]?.attempts ?? 0,
    }))
    .filter((entry) => entry.seen > 0)
    .sort((x, y) => y.weight - x.weight)
    .slice(0, limit)
    .map((entry) => entry.fact)
}
