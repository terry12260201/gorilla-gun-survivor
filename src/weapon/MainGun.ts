import * as THREE from 'three';
import { loadGltf } from '../assets/AssetLoader.js';
import { ProjectilePool } from './Projectile.js';
import { MuzzleFlash } from './MuzzleFlash.js';
import type { Input } from '../core/Input.js';

const RECOIL_KICK = 0.06;        // meters backward
const RECOIL_RECOVER = 14;       // 1/s restoring speed
// Group is rotated Y=π/2, so group-local +X ends up as camera-forward (-Z).
const MUZZLE_OFFSET = new THREE.Vector3(0.22, 0, 0);

const REST_POS = new THREE.Vector3(0.32, -0.22, -0.55);
const REST_ROT = new THREE.Euler(0, Math.PI / 2, 0);

export class MainGun {
  fireRate = 6; // shots per second
  bulletsPerShot = 1;
  onFire: (() => void) | null = null;
  private group = new THREE.Group();
  private muzzle = new THREE.Object3D();
  private flash: MuzzleFlash;
  private cooldown = 0;
  private recoil = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    private pool: ProjectilePool,
    private input: Input,
    gunUrl: string,
  ) {
    this.group.position.copy(REST_POS);
    this.group.rotation.copy(REST_ROT);
    camera.add(this.group);

    this.muzzle.position.copy(MUZZLE_OFFSET);
    this.group.add(this.muzzle);
    this.flash = new MuzzleFlash(this.muzzle);

    void this.loadModel(gunUrl);
  }

  private async loadModel(url: string): Promise<void> {
    const obj = await loadGltf(url);
    this.normalizeModel(obj, 0.35);
    this.group.add(obj);
  }

  private normalizeModel(obj: THREE.Object3D, targetSize: number): void {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    box.getSize(size);
    const max = Math.max(size.x, size.y, size.z) || 1;
    obj.scale.setScalar(targetSize / max);
    const center = box.getCenter(new THREE.Vector3()).multiplyScalar(targetSize / max);
    obj.position.sub(center);
  }

  update(dt: number, camera: THREE.PerspectiveCamera): void {
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.input.started && this.input.mouseDown.has(0) && this.cooldown === 0) {
      this.fire(camera);
      this.cooldown = 1 / this.fireRate;
    }

    this.recoil = Math.max(0, this.recoil - this.recoil * RECOIL_RECOVER * dt - dt * 0.01);
    this.group.position.z = REST_POS.z + this.recoil;

    this.flash.update(dt);
  }

  private fire(camera: THREE.PerspectiveCamera): void {
    const muzzleWorld = new THREE.Vector3();
    this.muzzle.getWorldPosition(muzzleWorld);

    const forward = new THREE.Vector3(0, 0, -1)
      .applyQuaternion(camera.quaternion)
      .normalize();
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const rightAxis = new THREE.Vector3().crossVectors(forward, up).normalize();

    const n = Math.max(1, this.bulletsPerShot);
    const totalSpread = 0.05 * (n - 1); // radians, ~3° per extra bullet
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0 : (i / (n - 1)) - 0.5;
      const angle = t * totalSpread;
      const dir = forward.clone().applyAxisAngle(up, angle).normalize();
      this.pool.spawn(muzzleWorld, dir);
    }
    // silence unused
    void rightAxis;

    this.flash.fire();
    this.recoil = RECOIL_KICK;
    this.onFire?.();
  }
}
