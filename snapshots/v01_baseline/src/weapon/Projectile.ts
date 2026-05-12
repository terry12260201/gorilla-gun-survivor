import * as THREE from 'three';
import type { Element } from './Elements.js';

export interface ElementPayload { element: Element; tier: number }

export interface ProjectileState {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  bouncesLeft: number;
  hitIds: Set<number>;
  damage: number;
  sizeMul: number;
  color: THREE.Color;
  elements: ElementPayload[];
}

const MAX = 512;
const BASE_SPEED = 60;
const LIFETIME = 1.6;
const BASE_RADIUS = 0.08;

export interface SpawnOptions {
  damage?: number;
  sizeMul?: number;
  color?: [number, number, number];
  elements?: ElementPayload[];
}

export class ProjectilePool {
  readonly mesh: THREE.InstancedMesh;
  readonly states: ProjectileState[] = [];
  damage = 30;
  speedMultiplier = 1;
  bulletScale = 1;
  homing = false;
  homingStrength = 0;
  bouncesOnHit = 0;

  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();
  private tmpQuat = new THREE.Quaternion();
  private tmpVec = new THREE.Vector3();
  private zAxis = new THREE.Vector3(0, 0, 1);

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(BASE_RADIUS, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.mesh = new THREE.InstancedMesh(geom, mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    // Enable per-instance color
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    scene.add(this.mesh);

    for (let i = 0; i < MAX; i++) {
      this.states.push({
        alive: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        bouncesLeft: 0,
        hitIds: new Set(),
        damage: 0,
        sizeMul: 1,
        color: new THREE.Color(1, 0.8, 0.27),
        elements: [],
      });
    }
  }

  spawn(origin: THREE.Vector3, dir: THREE.Vector3, options?: SpawnOptions): void {
    for (const s of this.states) {
      if (s.alive) continue;
      s.alive = true;
      s.pos.copy(origin);
      s.vel.copy(dir).normalize().multiplyScalar(BASE_SPEED * this.speedMultiplier);
      s.life = LIFETIME;
      s.bouncesLeft = this.bouncesOnHit;
      s.hitIds.clear();
      s.damage = options?.damage ?? this.damage;
      s.sizeMul = options?.sizeMul ?? 1;
      if (options?.color) s.color.setRGB(options.color[0], options.color[1], options.color[2]);
      else s.color.setRGB(1, 0.8, 0.27);
      s.elements = options?.elements ?? [];
      return;
    }
  }

  update(dt: number, seekTarget?: (pos: THREE.Vector3) => THREE.Vector3 | null): void {
    let visible = 0;
    for (const s of this.states) {
      if (!s.alive) continue;
      s.life -= dt;
      if (s.life <= 0) { s.alive = false; continue; }

      if (this.homing && seekTarget) {
        const target = seekTarget(s.pos);
        if (target) {
          const dx = target.x - s.pos.x;
          const dy = (target.y + 0.7) - s.pos.y;
          const dz = target.z - s.pos.z;
          const dl = Math.hypot(dx, dy, dz) || 1;
          const tx = dx / dl, ty = dy / dl, tz = dz / dl;
          const speed = s.vel.length();
          const vx = s.vel.x / speed, vy = s.vel.y / speed, vz = s.vel.z / speed;
          const a = Math.min(1, this.homingStrength * dt);
          const nx = vx + (tx - vx) * a;
          const ny = vy + (ty - vy) * a;
          const nz = vz + (tz - vz) * a;
          const nl = Math.hypot(nx, ny, nz) || 1;
          s.vel.set(nx / nl * speed, ny / nl * speed, nz / nl * speed);
        }
      }

      s.pos.addScaledVector(s.vel, dt);

      this.dummy.position.copy(s.pos);
      // Trail: elongate along velocity direction (stretches sphere into bolt)
      const size = this.bulletScale * s.sizeMul;
      this.dummy.scale.set(size, size, size * 3.5);
      const vlen = s.vel.length();
      if (vlen > 0.001) {
        this.tmpVec.copy(s.vel).multiplyScalar(1 / vlen);
        this.tmpQuat.setFromUnitVectors(this.zAxis, this.tmpVec);
        this.dummy.quaternion.copy(this.tmpQuat);
      }
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(visible, this.dummy.matrix);
      this.mesh.setColorAt(visible, this.tmpColor.copy(s.color));
      visible++;
    }
    this.mesh.count = visible;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  /** Returns base hit radius; per-bullet scale applied at hit check time. */
  baseHitRadius(): number {
    return BASE_RADIUS * this.bulletScale + 0.04;
  }
}
