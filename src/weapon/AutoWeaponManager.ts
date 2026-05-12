import * as THREE from 'three';
import { AutoWeapon } from './AutoWeapon.js';
import type { EnemyManager } from '../enemy/EnemyManager.js';
import type { ProjectilePool } from './Projectile.js';
import type { WeaponSpec } from './AutoWeaponSpec.js';

const MAX_WEAPONS = 6;
const ORBIT_RADIUS = 1.35;
const ORBIT_SPEED = 0.8;      // radians / sec (was 0.5 — more visible rotation)
const ORBIT_Y_OFFSET = -0.25;

export class AutoWeaponManager {
  readonly weapons: AutoWeapon[] = [];
  onWeaponAdded: ((w: AutoWeapon) => void) | null = null;
  private orbitAngle = 0;

  constructor(private scene: THREE.Scene) {}

  get isFull(): boolean { return this.weapons.length >= MAX_WEAPONS; }
  get count(): number { return this.weapons.length; }
  get max(): number { return MAX_WEAPONS; }

  addWeapon(spec: WeaponSpec): boolean {
    if (this.isFull) return false;
    const w = new AutoWeapon(spec);
    this.weapons.push(w);
    this.scene.add(w.group);
    this.onWeaponAdded?.(w);
    return true;
  }

  hasWeapon(id: string): boolean {
    return this.weapons.some((w) => w.spec.id === id);
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    playerYaw: number,
    enemies: EnemyManager,
    pool: ProjectilePool,
  ): void {
    this.orbitAngle += ORBIT_SPEED * dt;
    const n = this.weapons.length;
    if (n === 0) return;

    const centerY = playerPos.y + ORBIT_Y_OFFSET;
    const step = (Math.PI * 2) / n;
    const orbitPos = new THREE.Vector3();
    for (let i = 0; i < n; i++) {
      const a = this.orbitAngle + i * step;
      orbitPos.set(
        playerPos.x + Math.cos(a) * ORBIT_RADIUS,
        centerY,
        playerPos.z + Math.sin(a) * ORBIT_RADIUS,
      );
      this.weapons[i].update(dt, playerPos, orbitPos, playerYaw, enemies.enemies, pool);
    }
  }
}
