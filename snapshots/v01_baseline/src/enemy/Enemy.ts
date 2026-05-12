import * as THREE from 'three';
import type { RangedConfig, EnemyType } from './EnemyTypes.js';
import type { Arena } from '../scene/Arena.js';

const HIT_FLASH_DURATION = 0.22;
const SCALE_POP_DURATION = 0.18;
const SCALE_POP_AMOUNT = 0.22;
const KNOCKBACK_DISTANCE = 0.55;
const KNOCKBACK_DURATION = 0.18;

interface FlashTarget {
  mat: THREE.MeshStandardMaterial;
  originalEmissive: THREE.Color;
  originalEmissiveIntensity: number;
}

export class Enemy {
  alive = true;
  hp: number;
  readonly maxHp: number;
  readonly type: EnemyType;
  readonly radius: number;
  readonly root = new THREE.Group();
  readonly height: number;
  readonly ranged?: RangedConfig;
  private rangedCooldown = 0;

  private speed: number;
  private damage: number;
  private flashTimer = 0;
  private scaleTimer = 0;
  private knockback = new THREE.Vector3();
  private knockbackTimer = 0;
  private flashTargets: FlashTarget[] = [];
  private baseScale = 1;

  // Element effects
  private burnTimer = 0;
  private burnDps = 0;
  private slowTimer = 0;
  private slowMul = 1;

  constructor(
    model: THREE.Object3D,
    opts: {
      type: EnemyType;
      hp: number; speed: number; damage: number;
      radius: number; height: number; ranged?: RangedConfig;
    },
  ) {
    this.type = opts.type;
    this.hp = opts.hp;
    this.maxHp = opts.hp;
    this.speed = opts.speed;
    this.damage = opts.damage;
    this.radius = opts.radius;
    this.height = opts.height;
    this.ranged = opts.ranged;
    if (this.ranged) this.rangedCooldown = Math.random() * this.ranged.cooldown;

    this.root.add(model);
    this.baseScale = model.scale.x;

    model.traverse((n) => {
      const m = n as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!std.emissive) continue;
        this.flashTargets.push({
          mat: std,
          originalEmissive: std.emissive.clone(),
          originalEmissiveIntensity: std.emissiveIntensity ?? 1,
        });
      }
    });
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    onRangedFire?: (origin: THREE.Vector3, dir: THREE.Vector3) => void,
    arena?: Arena,
  ): void {
    if (!this.alive) return;

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.hp -= this.burnDps * dt;
      if (this.burnTimer <= 0) this.burnDps = 0;
      if (this.hp <= 0) { this.alive = false; return; }
    }
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowMul = 1;
    }

    if (this.knockbackTimer > 0) {
      const k = this.knockbackTimer / KNOCKBACK_DURATION;
      this.root.position.x += this.knockback.x * k * dt * (1 / KNOCKBACK_DURATION);
      this.root.position.z += this.knockback.z * k * dt * (1 / KNOCKBACK_DURATION);
      this.knockbackTimer = Math.max(0, this.knockbackTimer - dt);
    }

    const eSpeed = this.speed * (this.slowTimer > 0 ? this.slowMul : 1);
    const dx = playerPos.x - this.root.position.x;
    const dz = playerPos.z - this.root.position.z;
    const dist = Math.hypot(dx, dz);

    if (this.ranged) {
      // Maintain preferred distance: advance if too far, retreat if too close
      const keep = this.ranged.keepDistance;
      if (dist > keep * 1.3) {
        const step = eSpeed * dt;
        this.root.position.x += (dx / dist) * step;
        this.root.position.z += (dz / dist) * step;
      } else if (dist < keep * 0.75) {
        const step = eSpeed * 0.9 * dt;
        this.root.position.x -= (dx / dist) * step;
        this.root.position.z -= (dz / dist) * step;
      }
      if (dist > 0.001) this.root.rotation.y = Math.atan2(dx, dz);

      this.rangedCooldown -= dt;
      if (this.rangedCooldown <= 0 && dist < this.ranged.fireRange && onRangedFire) {
        this.rangedCooldown = this.ranged.cooldown;
        const origin = new THREE.Vector3(
          this.root.position.x,
          this.root.position.y + this.height * 0.6,
          this.root.position.z,
        );
        const aimY = playerPos.y - 0.2;
        const fireDir = new THREE.Vector3(
          playerPos.x - origin.x,
          aimY - origin.y,
          playerPos.z - origin.z,
        ).normalize();
        onRangedFire(origin, fireDir);
      }
    } else if (dist > 0.001) {
      const step = eSpeed * dt;
      this.root.position.x += (dx / dist) * step;
      this.root.position.z += (dz / dist) * step;
      this.root.rotation.y = Math.atan2(dx, dz);
    }

    if (arena) arena.resolveCircle(this.root.position, this.radius);

    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - dt);
      this.applyFlash(this.flashTimer / HIT_FLASH_DURATION);
    } else if (this.burnTimer > 0) {
      this.applyBurnTint();
    } else if (this.slowTimer > 0) {
      this.applySlowTint();
    } else {
      this.restoreEmissive();
    }

    const child = this.root.children[0];
    if (this.scaleTimer > 0) {
      this.scaleTimer = Math.max(0, this.scaleTimer - dt);
      const k = this.scaleTimer / SCALE_POP_DURATION;
      const factor = 1 + SCALE_POP_AMOUNT * k;
      if (child) child.scale.setScalar(this.baseScale * factor);
    } else if (child && child.scale.x !== this.baseScale) {
      child.scale.setScalar(this.baseScale);
    }
  }

  takeDamage(amount: number, hitDir?: THREE.Vector3): boolean {
    if (!this.alive) return false;
    this.hp -= amount;
    this.flashTimer = HIT_FLASH_DURATION;
    this.scaleTimer = SCALE_POP_DURATION;
    if (hitDir) {
      this.knockback.set(hitDir.x, 0, hitDir.z).normalize().multiplyScalar(KNOCKBACK_DISTANCE);
      this.knockbackTimer = KNOCKBACK_DURATION;
    }
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  applyBurn(dps: number, duration: number): void {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnTimer = Math.max(this.burnTimer, duration);
  }

  applySlow(mul: number, duration: number): void {
    this.slowMul = Math.min(this.slowMul, mul);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  getTouchDamage(): number { return this.damage; }

  private applyFlash(k: number): void {
    for (const t of this.flashTargets) {
      t.mat.emissive.copy(t.originalEmissive).lerp(new THREE.Color(1, 1, 1), k);
      t.mat.emissiveIntensity = t.originalEmissiveIntensity + 4.0 * k;
    }
  }

  private applyBurnTint(): void {
    for (const t of this.flashTargets) {
      t.mat.emissive.setRGB(0.9, 0.25, 0.05);
      t.mat.emissiveIntensity = 0.7;
    }
  }

  private applySlowTint(): void {
    for (const t of this.flashTargets) {
      t.mat.emissive.setRGB(0.25, 0.55, 1.0);
      t.mat.emissiveIntensity = 0.45;
    }
  }

  private restoreEmissive(): void {
    for (const t of this.flashTargets) {
      t.mat.emissive.copy(t.originalEmissive);
      t.mat.emissiveIntensity = t.originalEmissiveIntensity;
    }
  }
}
