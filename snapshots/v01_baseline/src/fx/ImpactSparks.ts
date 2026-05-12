import * as THREE from 'three';

interface Spark {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

const MAX = 400;
const BASE_COUNT = 6;
const GRAVITY = 4;

export class ImpactSparksSystem {
  readonly mesh: THREE.InstancedMesh;
  private sparks: Spark[] = [];
  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(0.08, 5, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.mesh = new THREE.InstancedMesh(geom, mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    scene.add(this.mesh);
  }

  /** Quick small spark burst at hit point. Color tinted per element / default yellow. */
  burst(pos: THREE.Vector3, color: [number, number, number] = [1.0, 0.85, 0.4], count = BASE_COUNT): void {
    for (let i = 0; i < count; i++) {
      if (this.sparks.length >= MAX) break;
      const a = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const speed = 2.5 + Math.random() * 3.5;
      const life = 0.18 + Math.random() * 0.2;
      this.sparks.push({
        pos: new THREE.Vector3(pos.x, pos.y + 0.5, pos.z),
        vel: new THREE.Vector3(
          Math.sin(p) * Math.cos(a) * speed,
          Math.cos(p) * speed * 0.9,
          Math.sin(p) * Math.sin(a) * speed,
        ),
        life,
        maxLife: life,
        color: new THREE.Color(color[0], color[1], color[2]),
      });
    }
  }

  update(dt: number): void {
    let visible = 0;
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.life -= dt;
      if (s.life <= 0) { this.sparks.splice(i, 1); continue; }
      s.vel.y -= GRAVITY * dt;
      s.pos.addScaledVector(s.vel, dt);
      this.dummy.position.copy(s.pos);
      const k = s.life / s.maxLife;
      this.dummy.scale.setScalar(0.25 + 0.9 * k);
      this.dummy.quaternion.identity();
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(visible, this.dummy.matrix);
      this.mesh.setColorAt(visible, this.tmpColor.copy(s.color));
      visible++;
    }
    this.mesh.count = visible;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
