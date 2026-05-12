import * as THREE from 'three';

interface Particle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
}

const MAX = 400;
const PARTICLES_PER_BURST = 12;
const GRAVITY = 7;

export class DeathBurstSystem {
  readonly mesh: THREE.InstancedMesh;
  private particles: Particle[] = [];
  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(0.14, 6, 5);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.mesh = new THREE.InstancedMesh(geom, mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    scene.add(this.mesh);
  }

  burst(pos: THREE.Vector3, color: [number, number, number] = [1.0, 0.75, 0.25]): void {
    for (let i = 0; i < PARTICLES_PER_BURST; i++) {
      if (this.particles.length >= MAX) break;
      const a = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const speed = 3.5 + Math.random() * 4.5;
      const life = 0.45 + Math.random() * 0.35;
      this.particles.push({
        pos: new THREE.Vector3(pos.x, pos.y + 0.6, pos.z),
        vel: new THREE.Vector3(
          Math.sin(p) * Math.cos(a) * speed,
          Math.abs(Math.cos(p)) * speed * 0.7 + 1.5,
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
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vel.y -= GRAVITY * dt;
      p.pos.addScaledVector(p.vel, dt);
      this.dummy.position.copy(p.pos);
      const k = p.life / p.maxLife;
      const scale = 0.35 + 0.85 * k;
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(visible, this.dummy.matrix);
      this.mesh.setColorAt(visible, this.tmpColor.copy(p.color));
      visible++;
    }
    this.mesh.count = visible;
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
