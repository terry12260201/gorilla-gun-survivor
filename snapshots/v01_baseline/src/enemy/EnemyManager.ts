import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadGltf } from '../assets/AssetLoader.js';
import { Enemy } from './Enemy.js';
import type { ProjectilePool, ElementPayload } from '../weapon/Projectile.js';
import { ENEMY_TYPES, pickSpawnType, type EnemyTypeData, type EnemyType } from './EnemyTypes.js';
import { enemyHpMul, enemyDamageMul, enemySpeedMul, spawnIntervalSec, maxEnemiesAt, xpOrbTimeBonus } from './Difficulty.js';
import type { Arena } from '../scene/Arena.js';

const INITIAL_SPAWN_DELAY = 3.0;
const SPAWN_DISTANCE = 24;

const PLAYER_RADIUS = 0.6;
const TOUCH_COOLDOWN = 1.0;

interface Template {
  obj: THREE.Object3D;
  data: EnemyTypeData;
}

export class EnemyManager {
  readonly enemies: Enemy[] = [];
  private templates = new Map<EnemyType, Template | Promise<Template>>();
  private spawnCooldown = INITIAL_SPAWN_DELAY;
  private touchCooldown = 0;
  elapsed = 0;

  kills = 0;

  /** Fired once per ranged enemy shot, so Game can spawn the enemy projectile. */
  onRangedFire: ((data: EnemyTypeData, origin: THREE.Vector3, dir: THREE.Vector3) => void) | null = null;

  constructor(private scene: THREE.Scene, private arenaSize: number, private arena?: Arena) {}

  private async ensureTemplate(data: EnemyTypeData): Promise<Template> {
    const cached = this.templates.get(data.type);
    if (cached && !(cached instanceof Promise)) return cached;
    if (cached instanceof Promise) return cached;
    const p = loadGltf(data.url).then((obj) => {
      this.normalizeHeight(obj, data.height);
      const t: Template = { obj, data };
      this.templates.set(data.type, t);
      return t;
    });
    this.templates.set(data.type, p);
    return p;
  }

  private normalizeHeight(obj: THREE.Object3D, target: number): void {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const h = size.y || 1;
    const scale = target / h;
    obj.scale.setScalar(scale);
    const min = box.min.clone().multiplyScalar(scale);
    obj.position.y -= min.y;
  }

  private async trySpawn(playerPos: THREE.Vector3): Promise<void> {
    if (this.enemies.length >= maxEnemiesAt(this.elapsed)) return;
    const data = pickSpawnType(this.elapsed);
    const tpl = await this.ensureTemplate(data);

    const angle = Math.random() * Math.PI * 2;
    const px = playerPos.x + Math.cos(angle) * SPAWN_DISTANCE;
    const pz = playerPos.z + Math.sin(angle) * SPAWN_DISTANCE;
    const half = this.arenaSize / 2 - 1;
    if (Math.abs(px) > half || Math.abs(pz) > half) return;

    const instance = SkeletonUtils.clone(tpl.obj);
    instance.traverse((n: THREE.Object3D) => {
      const m = n as THREE.Mesh;
      if (!m.isMesh) return;
      m.material = Array.isArray(m.material)
        ? m.material.map((x) => x.clone())
        : m.material.clone();
    });

    const hpMul = enemyHpMul(this.elapsed);
    const dmgMul = enemyDamageMul(this.elapsed);
    const spdMul = enemySpeedMul(this.elapsed);
    const enemy = new Enemy(instance, {
      type: data.type,
      hp: data.hp * hpMul,
      speed: data.speed * spdMul,
      damage: data.touchDamage * dmgMul,
      radius: data.radius, height: data.height,
      ranged: data.ranged,
    });
    enemy.root.position.set(px, 0, pz);
    this.scene.add(enemy.root);
    this.enemies.push(enemy);
  }

  /** XP orbs to drop for a given enemy type at current time. */
  xpOrbsFor(type: EnemyType): number {
    return ENEMY_TYPES[type].xpOrbs + xpOrbTimeBonus(this.elapsed);
  }

  /** Current ranged damage multiplier — used by Game when spawning enemy projectiles. */
  get rangedDamageMul(): number {
    return enemyDamageMul(this.elapsed);
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    projectiles: ProjectilePool,
    onPlayerHit: (damage: number) => void,
    onEnemyDeath?: (pos: THREE.Vector3, type: EnemyType) => void,
    onBulletHit?: (pos: THREE.Vector3) => void,
    onElementHit?: (elements: ElementPayload[], enemy: Enemy, hitPos: THREE.Vector3) => void,
  ): void {
    this.elapsed += dt;
    this.spawnCooldown -= dt;
    if (this.spawnCooldown <= 0) {
      this.spawnCooldown = spawnIntervalSec(this.elapsed);
      void this.trySpawn(playerPos);
    }

    this.touchCooldown = Math.max(0, this.touchCooldown - dt);

    const aliveBefore: boolean[] = this.enemies.map((e) => e.alive);
    for (const e of this.enemies) {
      e.update(dt, playerPos, (origin, dir) => {
        if (this.onRangedFire) {
          const data = ENEMY_TYPES[e.type];
          this.onRangedFire(data, origin, dir);
        }
      }, this.arena);
    }
    for (let i = 0; i < this.enemies.length; i++) {
      if (aliveBefore[i] && !this.enemies[i].alive) {
        this.kills++;
        onEnemyDeath?.(this.enemies[i].root.position, this.enemies[i].type);
      }
    }

    this.checkBulletHits(projectiles, onEnemyDeath, onBulletHit, onElementHit);
    this.checkPlayerTouch(playerPos, onPlayerHit);
    this.cleanup();
  }

  private checkBulletHits(
    projectiles: ProjectilePool,
    onEnemyDeath?: (pos: THREE.Vector3, type: EnemyType) => void,
    onBulletHit?: (pos: THREE.Vector3) => void,
    onElementHit?: (elements: ElementPayload[], enemy: Enemy, hitPos: THREE.Vector3) => void,
  ): void {
    const states = projectiles.states;
    const baseR = projectiles.baseHitRadius();
    for (const s of states) {
      if (!s.alive) continue;
      const bulletHitR = baseR * s.sizeMul;
      let hitEnemyIdx = -1;
      let hitEnemy = null;
      for (let i = 0; i < this.enemies.length; i++) {
        const e = this.enemies[i];
        if (!e.alive) continue;
        if (s.hitIds.has(i)) continue;
        const dx = s.pos.x - e.root.position.x;
        const dy = s.pos.y - (e.root.position.y + e.height / 2);
        const dz = s.pos.z - e.root.position.z;
        const r = e.radius + bulletHitR;
        if (dx * dx + dy * dy + dz * dz < r * r) {
          hitEnemyIdx = i;
          hitEnemy = e;
          break;
        }
      }
      if (!hitEnemy || hitEnemyIdx < 0) continue;

      const died = hitEnemy.takeDamage(s.damage, s.vel);
      s.hitIds.add(hitEnemyIdx);
      onBulletHit?.(hitEnemy.root.position);
      if (s.elements.length > 0 && onElementHit) {
        onElementHit(s.elements, hitEnemy, hitEnemy.root.position.clone());
      }
      if (died) {
        this.kills++;
        onEnemyDeath?.(hitEnemy.root.position, hitEnemy.type);
      }

      if (s.bouncesLeft > 0) {
        s.bouncesLeft -= 1;
        const next = this.findNearestEnemy(s.pos, s.hitIds);
        if (next) {
          const speed = s.vel.length();
          const nx = next.root.position.x - s.pos.x;
          const ny = (next.root.position.y + next.height / 2) - s.pos.y;
          const nz = next.root.position.z - s.pos.z;
          s.vel.set(nx, ny, nz).normalize().multiplyScalar(speed);
        } else {
          s.alive = false;
        }
      } else {
        s.alive = false;
      }
    }
  }

  findChainTargets(start: THREE.Vector3, count: number, reach: number): Enemy[] {
    const chain: Enemy[] = [];
    const used = new Set<number>();
    let cursor = start;
    const reach2 = reach * reach;
    for (let step = 0; step < count; step++) {
      let bestIdx = -1;
      let bestD2 = Infinity;
      for (let i = 0; i < this.enemies.length; i++) {
        if (used.has(i)) continue;
        const e = this.enemies[i];
        if (!e.alive) continue;
        const dx = e.root.position.x - cursor.x;
        const dz = e.root.position.z - cursor.z;
        const d2 = dx * dx + dz * dz;
        if (d2 < reach2 && d2 < bestD2) { bestD2 = d2; bestIdx = i; }
      }
      if (bestIdx < 0) break;
      used.add(bestIdx);
      chain.push(this.enemies[bestIdx]);
      cursor = this.enemies[bestIdx].root.position;
    }
    return chain;
  }

  findNearestEnemy(pos: THREE.Vector3, exclude?: Set<number>): Enemy | null {
    let best: Enemy | null = null;
    let bestD2 = Infinity;
    for (let i = 0; i < this.enemies.length; i++) {
      if (exclude?.has(i)) continue;
      const e = this.enemies[i];
      if (!e.alive) continue;
      const dx = e.root.position.x - pos.x;
      const dz = e.root.position.z - pos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 < bestD2) { bestD2 = d2; best = e; }
    }
    return best;
  }

  private checkPlayerTouch(playerPos: THREE.Vector3, onPlayerHit: (d: number) => void): void {
    if (this.touchCooldown > 0) return;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.getTouchDamage() <= 0) continue; // pure ranged enemies don't melee
      const dx = playerPos.x - e.root.position.x;
      const dz = playerPos.z - e.root.position.z;
      const r = e.radius + PLAYER_RADIUS;
      if (dx * dx + dz * dz < r * r) {
        onPlayerHit(e.getTouchDamage());
        this.touchCooldown = TOUCH_COOLDOWN;
        return;
      }
    }
  }

  private cleanup(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      if (!e.alive) {
        this.scene.remove(e.root);
        this.enemies.splice(i, 1);
      }
    }
  }

  get count(): number { return this.enemies.length; }
}
