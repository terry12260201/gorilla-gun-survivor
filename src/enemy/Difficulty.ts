/** Time-based difficulty scaling. elapsed = gameplay seconds since run start. */

export function enemyHpMul(elapsed: number): number {
  // +18% HP every 30s, uncapped
  return Math.pow(1.18, elapsed / 30);
}

export function enemyDamageMul(elapsed: number): number {
  // +10% touch/ranged damage every 45s
  return Math.pow(1.10, elapsed / 45);
}

export function enemySpeedMul(elapsed: number): number {
  // Linear ramp: +50% over 180s, hard cap 1.5
  return Math.min(1.5, 1 + (elapsed / 180) * 0.5);
}

export function spawnIntervalSec(elapsed: number): number {
  // Base 1.8s → every 30s *0.9, floor 0.4s
  return Math.max(0.4, 1.8 * Math.pow(0.9, elapsed / 30));
}

export function maxEnemiesAt(elapsed: number): number {
  return Math.min(80, 35 + Math.floor(elapsed / 60) * 5);
}

export function enemyXpTierBonus(elapsed: number): number {
  // Bumps base xp tier: 0-59s +0, 60-119s +1, 120s+ +2 (capped at T3 by consumer)
  return Math.min(2, Math.floor(elapsed / 60));
}
