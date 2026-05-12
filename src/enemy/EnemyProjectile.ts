import * as THREE from 'three';

interface EnemyProjectileState {
  alive: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  damage: number;
  sizeMul: number;
  color: THREE.Color;
}

const MAX = 128;
const BASE_RADIUS = 0.22;
const LIFETIME = 4.0;
const PLAYER_HIT_RADIUS = 0.6;

export class EnemyProjectilePool {
  readonly mesh: THREE.InstancedMesh;
  private states: EnemyProjectileState[] = [];
  private dummy = new THREE.Object3D();
  private tmpColor = new THREE.Color();

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(BASE_RADIUS, 10, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.mesh = new THREE.InstancedMesh(geom, mat, MAX);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX * 3), 3);
    scene.add(this.mesh);
    for (let i = 0; i < MAX; i++) {
      this.states.push({
        alive: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        damage: 10,
        sizeMul: 1,
        color: new THREE.Color(1, 0.3, 1),
      });
    }
  }

  spawn(
    origin: THREE.Vector3,
    dir: THREE.Vector3,
    speed: number,
    damage: number,
    color: [number, number, number],
    sizeMul = 1,
  ): void {
    for (const s of this.states) {
      if (s.alive) continue;
      s.alive = true;
      s.pos.copy(origin);
      s.vel.copy(dir).normalize().multiplyScalar(speed);
      s.life = LIFETIME;
      s.damage = damage;
      s.sizeMul = sizeMul;
      s.color.setRGB(color[0], color[1], color[2]);
      return;
    }
  }

  update(dt: number, playerPos: THREE.Vector3, onPlayerHit: (dmg: number) => void): void {
    let visible = 0;
    for (const s of this.states) {
      if (!s.alive) continue;
      s.life -= dt;
      if (s.life <= 0) { s.alive = false; continue; }
      s.pos.addScaledVector(s.vel, dt);

      const dx = s.pos.x - playerPos.x;
      const dy = s.pos.y - playerPos.y;
      const dz = s.pos.z - playerPos.z;
      const hitR = PLAYER_HIT_RADIUS + BASE_RADIUS * s.sizeMul;
      if (dx * dx + dy * dy + dz * dz < hitR * hitR) {
        s.alive = false;
        onPlayerHit(s.damage);
        continue;
      }

      this.dummy.position.copy(s.pos);
      this.dummy.scale.setScalar(s.sizeMul);
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
