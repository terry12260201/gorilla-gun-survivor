import * as THREE from 'three';
import { loadGltf } from '../assets/AssetLoader.js';
import type { ProjectilePool, ElementPayload } from './Projectile.js';
import type { Enemy } from '../enemy/Enemy.js';
import type { WeaponSpec } from './AutoWeaponSpec.js';
import type { Element } from './Elements.js';
import { ELEMENT_DATA } from './Elements.js';

const WEAPON_TARGET_SIZE = 0.55;
const CONE_HALF_ANGLE = Math.PI / 8; // ±22.5° → total 45°
const MUZZLE_OFFSET_X = 0.28;
const AIM_TARGET_HEIGHT = 0.7;

export class AutoWeapon {
  readonly group = new THREE.Group();
  readonly attributes = new Map<Element, number>(); // element -> tier (1..3)
  onFire: (() => void) | null = null;
  private modelGroup = new THREE.Group();
  private muzzle = new THREE.Object3D();
  private fireCooldown = 0;
  private hasModel = false;

  constructor(readonly spec: WeaponSpec) {
    this.group.add(this.modelGroup);
    this.muzzle.position.set(MUZZLE_OFFSET_X, 0, 0);
    this.modelGroup.add(this.muzzle);
    void this.loadModel();
  }

  private async loadModel(): Promise<void> {
    const obj = await loadGltf(this.spec.url);
    this.normalize(obj);
    this.modelGroup.add(obj);
    this.hasModel = true;
  }

  private normalize(obj: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const max = Math.max(size.x, size.y, size.z) || 1;
    const scale = WEAPON_TARGET_SIZE / max;
    obj.scale.setScalar(scale);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(scale);
    obj.position.sub(center);
  }

  update(
    dt: number,
    playerPos: THREE.Vector3,
    orbitPos: THREE.Vector3,
    forwardYaw: number,
    enemies: Enemy[],
    pool: ProjectilePool,
  ): void {
    this.group.position.copy(orbitPos);
    this.fireCooldown = Math.max(0, this.fireCooldown - dt);

    const target = this.findTarget(playerPos, forwardYaw, enemies);

    if (target) {
      const dx = target.root.position.x - this.group.position.x;
      const dz = target.root.position.z - this.group.position.z;
      this.modelGroup.rotation.y = Math.atan2(-dz, dx);
      if (this.hasModel && this.fireCooldown === 0) {
        this.fire(pool, target);
        this.fireCooldown = 1 / this.spec.fireRate;
      }
    } else {
      const fx = -Math.sin(forwardYaw);
      const fz = -Math.cos(forwardYaw);
      this.modelGroup.rotation.y = Math.atan2(-fz, fx);
    }
  }

  private findTarget(playerPos: THREE.Vector3, forwardYaw: number, enemies: Enemy[]): Enemy | null {
    const fx = -Math.sin(forwardYaw);
    const fz = -Math.cos(forwardYaw);
    const coneDot = Math.cos(CONE_HALF_ANGLE);
    const rangeSq = this.spec.range * this.spec.range;
    let best: Enemy | null = null;
    let bestD2 = rangeSq;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.root.position.x - playerPos.x;
      const dz = e.root.position.z - playerPos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > bestD2) continue;
      const dl = Math.sqrt(d2) || 1;
      const dot = (dx / dl) * fx + (dz / dl) * fz;
      if (dot < coneDot) continue;
      bestD2 = d2;
      best = e;
    }
    return best;
  }

  private fire(pool: ProjectilePool, target: Enemy): void {
    const muzzleWorld = new THREE.Vector3();
    this.muzzle.getWorldPosition(muzzleWorld);
    const dir = new THREE.Vector3(
      target.root.position.x - muzzleWorld.x,
      (target.root.position.y + AIM_TARGET_HEIGHT) - muzzleWorld.y,
      target.root.position.z - muzzleWorld.z,
    ).normalize();

    const elements: ElementPayload[] = [];
    let color: [number, number, number] = this.spec.bulletColor;
    if (this.attributes.size > 0) {
      const sum: [number, number, number] = [0, 0, 0];
      for (const [el, tier] of this.attributes) {
        elements.push({ element: el, tier });
        const c = ELEMENT_DATA[el].color;
        sum[0] += c[0]; sum[1] += c[1]; sum[2] += c[2];
      }
      const n = this.attributes.size;
      const avg: [number, number, number] = [sum[0] / n, sum[1] / n, sum[2] / n];
      // Blend weapon color with averaged element color
      color = [
        this.spec.bulletColor[0] * 0.35 + avg[0] * 0.65,
        this.spec.bulletColor[1] * 0.35 + avg[1] * 0.65,
        this.spec.bulletColor[2] * 0.35 + avg[2] * 0.65,
      ];
    }

    pool.spawn(muzzleWorld, dir, {
      damage: pool.damage * this.spec.damageMul,
      color,
      sizeMul: this.spec.bulletSize,
      elements,
    });
    this.onFire?.();
  }
}
