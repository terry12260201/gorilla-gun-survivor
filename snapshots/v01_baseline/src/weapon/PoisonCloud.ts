import * as THREE from 'three';
import type { Enemy } from '../enemy/Enemy.js';

interface Cloud {
  pos: THREE.Vector3;
  radius: number;
  dps: number;
  life: number;
  maxLife: number;
  tickTimer: number;
  mesh: THREE.Mesh;
}

const TICK_INTERVAL = 0.5;

export class PoisonCloudSystem {
  private clouds: Cloud[] = [];

  constructor(private scene: THREE.Scene) {}

  spawn(pos: THREE.Vector3, radius: number, dps: number, duration: number): void {
    const geom = new THREE.CylinderGeometry(radius, radius, 0.6, 20, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x66ff55,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, 0.3, pos.z);
    this.scene.add(mesh);

    this.clouds.push({
      pos: new THREE.Vector3(pos.x, 0.3, pos.z),
      radius, dps, life: duration, maxLife: duration, tickTimer: 0, mesh,
    });
  }

  update(dt: number, enemies: Enemy[]): void {
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.life -= dt;
      const k = Math.max(0, c.life / c.maxLife);
      const mat = c.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 * k + 0.05;
      // Gentle pulse scale
      const scale = 1 + Math.sin((1 - k) * 6) * 0.03;
      c.mesh.scale.set(scale, 1, scale);

      c.tickTimer -= dt;
      if (c.tickTimer <= 0) {
        c.tickTimer = TICK_INTERVAL;
        const r2 = c.radius * c.radius;
        const tickDmg = c.dps * TICK_INTERVAL;
        for (const e of enemies) {
          if (!e.alive) continue;
          const dx = e.root.position.x - c.pos.x;
          const dz = e.root.position.z - c.pos.z;
          if (dx * dx + dz * dz < r2) {
            e.takeDamage(tickDmg);
          }
        }
      }

      if (c.life <= 0) {
        this.scene.remove(c.mesh);
        this.clouds.splice(i, 1);
      }
    }
  }
}
