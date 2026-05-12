import * as THREE from 'three';

export type XpTier = 1 | 2 | 3;

interface OrbState {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  bornAt: number;
  tier: XpTier;
}

const MAX = 256;
const ORB_RADIUS = 0.18;
const PICKUP_RANGE = 1.0;
const MAX_PULL_SPEED = 18;
const PULL_ACCEL = 45;
const BOB_AMP = 0.08;

// Tier config: [XP value, scale multiplier, RGB color]
const TIER: Record<XpTier, { value: number; scale: number; rgb: [number, number, number] }> = {
  1: { value: 1,  scale: 1.00, rgb: [0.40, 1.00, 0.60] },  // mint green
  2: { value: 5,  scale: 1.40, rgb: [0.30, 0.72, 1.00] },  // cyan blue
  3: { value: 15, scale: 1.80, rgb: [0.78, 0.49, 1.00] },  // violet
};

export class XpOrbPool {
  readonly mesh: THREE.InstancedMesh;
  magnetRange = 6;
  private states: OrbState[] = [];
  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();
  private time = 0;

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(ORB_RADIUS, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.mesh = new THREE.InstancedMesh(geom, mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    scene.add(this.mesh);

    for (let i = 0; i < MAX; i++) {
      this.states.push({ alive: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), bornAt: 0, tier: 1 });
    }
  }

  spawn(pos: THREE.Vector3, tier: XpTier = 1): void {
    for (const s of this.states) {
      if (s.alive) continue;
      s.alive = true;
      s.pos.set(pos.x, 0.6, pos.z);
      s.vel.set((Math.random() - 0.5) * 3, 3.5 + Math.random() * 1.5, (Math.random() - 0.5) * 3);
      s.bornAt = this.time;
      s.tier = tier;
      return;
    }
  }

  update(dt: number, playerPos: THREE.Vector3, onCollect: (value: number) => void): void {
    this.time += dt;
    let visible = 0;
    for (const s of this.states) {
      if (!s.alive) continue;

      const dx = playerPos.x - s.pos.x;
      const dz = playerPos.z - s.pos.z;
      const distXZ = Math.hypot(dx, dz);
      const bornDt = this.time - s.bornAt;

      // Initial popup arc, then gravity drag
      s.vel.y -= 9 * dt;
      if (s.pos.y <= 0.25 && s.vel.y < 0) {
        s.pos.y = 0.25;
        s.vel.y = 0;
        s.vel.x *= 0.6;
        s.vel.z *= 0.6;
      }

      // Magnetic pull after 0.35s grace
      if (bornDt > 0.35 && distXZ < this.magnetRange) {
        const pull = PULL_ACCEL * dt;
        const nx = dx / (distXZ || 1);
        const nz = dz / (distXZ || 1);
        s.vel.x += nx * pull;
        s.vel.z += nz * pull;
        const horizSpeed = Math.hypot(s.vel.x, s.vel.z);
        if (horizSpeed > MAX_PULL_SPEED) {
          s.vel.x *= MAX_PULL_SPEED / horizSpeed;
          s.vel.z *= MAX_PULL_SPEED / horizSpeed;
        }
      }

      s.pos.x += s.vel.x * dt;
      s.pos.y += s.vel.y * dt;
      s.pos.z += s.vel.z * dt;

      const dy = playerPos.y - s.pos.y;
      const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      // Pickup only after 0.35s so the orb always visually pops before auto-collect
      if (bornDt > 0.35 && dist3d < PICKUP_RANGE) {
        s.alive = false;
        onCollect(TIER[s.tier].value);
        continue;
      }

      const cfg = TIER[s.tier];
      this.dummy.position.copy(s.pos);
      this.dummy.position.y += Math.sin((this.time + s.bornAt) * 4) * BOB_AMP;
      this.dummy.scale.setScalar(cfg.scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(visible, this.dummy.matrix);
      this.mesh.setColorAt(visible, this.tmpColor.setRGB(cfg.rgb[0], cfg.rgb[1], cfg.rgb[2]));
      visible++;
    }
    this.mesh.count = visible;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
