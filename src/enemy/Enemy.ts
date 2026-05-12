import * as THREE from 'three';
import type { RangedConfig, RusherConfig, BomberConfig, EnemyType } from './EnemyTypes.js';

export interface ExplosionPayload {
  pos: THREE.Vector3;
  radius: number;
  damage: number;
}
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
  readonly rusher?: RusherConfig;
  private rushTriggered = false;
  private beepTimer = 0;
  readonly bomber?: BomberConfig;
  private fuseActive = false;
  private fuseTimer = 0;
  pendingExplosion: ExplosionPayload | null = null;

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
      rusher?: RusherConfig;
      bomber?: BomberConfig;
      boss?: boolean;
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
    this.rusher = opts.rusher;
    this.bomber = opts.bomber;

    this.root.add(model);
    this.baseScale = model.scale.x;

    model.traverse((n) => {
      const m = n as THREE.Mesh;
      if (!m.isMesh) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!std.emissive) continue;
        const ft: FlashTarget = {
          mat: std,
          originalEmissive: std.emissive.clone(),
          originalEmissiveIntensity: std.emissiveIntensity ?? 1,
        };
        if (opts.boss) {
          ft.originalEmissive.setRGB(0.85, 0.12, 0.04);
          ft.originalEmissiveIntensity = 0.9;
          std.emissive.copy(ft.originalEmissive);
          std.emissiveIntensity = ft.originalEmissiveIntensity;
        }
        this.flashTargets.push(ft);
      }
    });
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    onRangedFire?: (origin: THREE.Vector3, dir: THREE.Vector3) => void,
    arena?: Arena,
    onRusherBeep?: (urgencyK: number) => void,
  ): void {
    if (!this.alive) return;

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      this.hp -= this.burnDps * dt;
      if (this.burnTimer <= 0) this.burnDps = 0;
      if (this.hp <= 0) { this.alive = false; this.triggerBomberExplosion(); return; }
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
    } else if (this.rusher) {
      if (!this.rushTriggered && dist <= this.rusher.detectRange) {
        this.rushTriggered = true;
      }
      const base = this.rushTriggered ? this.rusher.rushSpeed : this.speed;
      const moveSpeed = base * (this.slowTimer > 0 ? this.slowMul : 1);
      if (dist > 0.001) {
        const step = moveSpeed * dt;
        this.root.position.x += (dx / dist) * step;
        this.root.position.z += (dz / dist) * step;
        this.root.rotation.y = Math.atan2(dx, dz);
      }
      if (this.rushTriggered && onRusherBeep) {
        this.beepTimer -= dt;
        if (this.beepTimer <= 0) {
          const t = Math.min(1, dist / this.rusher.detectRange);
          this.beepTimer = 0.1 + 0.3 * t;
          onRusherBeep(1 - t);
        }
      }
    } else if (this.bomber) {
      if (!this.fuseActive && dist <= this.bomber.fuseRange) {
        this.fuseActive = true;
        this.fuseTimer = this.bomber.fuseTime;
        this.beepTimer = 0;
      } else if (this.fuseActive && dist > this.bomber.fuseRange * 1.5) {
        this.fuseActive = false;
        this.fuseTimer = 0;
      }
      if (this.fuseActive) {
        this.fuseTimer -= dt;
        const base = this.speed * this.bomber.moveDuringFuse;
        const moveSpeed = base * (this.slowTimer > 0 ? this.slowMul : 1);
        if (moveSpeed > 0 && dist > 0.001) {
          const step = moveSpeed * dt;
          this.root.position.x += (dx / dist) * step;
          this.root.position.z += (dz / dist) * step;
        }
        if (onRusherBeep) {
          this.beepTimer -= dt;
          if (this.beepTimer <= 0) {
            const k = 1 - this.fuseTimer / this.bomber.fuseTime;
            this.beepTimer = 0.35 - 0.22 * k;
            onRusherBeep(0.5 + 0.5 * k);
          }
        }
        if (this.fuseTimer <= 0) {
          this.alive = false;
          this.triggerBomberExplosion();
          return;
        }
      } else if (dist > 0.001) {
        const step = eSpeed * dt;
        this.root.position.x += (dx / dist) * step;
        this.root.position.z += (dz / dist) * step;
      }
      if (dist > 0.001) this.root.rotation.y = Math.atan2(dx, dz);
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
    } else if (this.fuseActive && this.bomber) {
      this.applyFuseTint();
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
    } else if (this.fuseActive && this.bomber && child) {
      const k = 1 - this.fuseTimer / this.bomber.fuseTime;
      const freq = 6 + 14 * k;
      const pulse = 1 + 0.14 * Math.sin(performance.now() * 0.001 * freq * Math.PI * 2);
      child.scale.setScalar(this.baseScale * pulse);
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
      this.triggerBomberExplosion();
      return true;
    }
    return false;
  }

  private triggerBomberExplosion(): void {
    if (!this.bomber || this.pendingExplosion) return;
    this.pendingExplosion = {
      pos: this.root.position.clone(),
      radius: this.bomber.aoeRadius,
      damage: this.bomber.aoeDamage,
    };
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

  private applyFuseTint(): void {
    const fuseTime = this.bomber?.fuseTime ?? 1;
    const k = Math.max(0, Math.min(1, 1 - this.fuseTimer / fuseTime));
    const freq = 6 + 14 * k;
    const phase = performance.now() * 0.001 * freq * Math.PI * 2;
    const intensity = 0.6 + 0.9 * (0.5 + 0.5 * Math.sin(phase));
    for (const t of this.flashTargets) {
      t.mat.emissive.setRGB(1.0, 0.15, 0.05);
      t.mat.emissiveIntensity = intensity;
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
