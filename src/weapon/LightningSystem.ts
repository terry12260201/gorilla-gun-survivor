import * as THREE from 'three';
import type { Enemy } from '../enemy/Enemy.js';

interface Strike {
  pos: THREE.Vector3;
  delay: number;     // seconds before firing
  fired: boolean;
  lifeAfterFire: number;
  mesh?: THREE.Mesh;
  light?: THREE.PointLight;
  radius: number;
  damage: number;
}

const FLASH_DURATION = 0.28;
const COLUMN_HEIGHT = 20;
const COLUMN_RADIUS = 0.18;

const CHAIN_FLASH_DURATION = 0.32;

interface ChainArc {
  lifeAfterFire: number;
  line: THREE.Line;
  light: THREE.PointLight;
}

export class LightningSystem {
  private strikes: Strike[] = [];
  private arcs: ChainArc[] = [];

  constructor(private scene: THREE.Scene) {}

  /** Draw a chain lightning arc through a sequence of positions, damage each enemy in the chain. */
  chain(startPos: THREE.Vector3, targets: Enemy[], damage = 15): void {
    if (targets.length === 0) return;
    const points: THREE.Vector3[] = [startPos.clone().setY(1.1)];
    for (const e of targets) {
      points.push(e.root.position.clone().setY(1.2));
      // Apply damage
      const knock = new THREE.Vector3(
        e.root.position.x - startPos.x, 0, e.root.position.z - startPos.z,
      );
      e.takeDamage(damage, knock);
    }
    // Jitter midpoints slightly for a "zap" look
    const jittered: THREE.Vector3[] = [];
    for (let i = 0; i < points.length; i++) {
      jittered.push(points[i]);
      if (i < points.length - 1) {
        const mid = points[i].clone().add(points[i + 1]).multiplyScalar(0.5);
        mid.x += (Math.random() - 0.5) * 0.6;
        mid.y += (Math.random() - 0.5) * 0.5;
        mid.z += (Math.random() - 0.5) * 0.6;
        jittered.push(mid);
      }
    }
    const geom = new THREE.BufferGeometry().setFromPoints(jittered);
    const mat = new THREE.LineBasicMaterial({
      color: 0xbfe8ff, transparent: true, opacity: 1, toneMapped: false,
    });
    const line = new THREE.Line(geom, mat);
    this.scene.add(line);

    const midIdx = Math.floor(jittered.length / 2);
    const light = new THREE.PointLight(0xbfe8ff, 6, 14, 2);
    light.position.copy(jittered[midIdx]);
    this.scene.add(light);

    this.arcs.push({ lifeAfterFire: CHAIN_FLASH_DURATION, line, light });
  }

  /** Single strike at position after optional delay. */
  strike(pos: THREE.Vector3, delay = 0, radius = 3, damage = 20): void {
    this.strikes.push({
      pos: pos.clone(),
      delay,
      fired: false,
      lifeAfterFire: FLASH_DURATION,
      radius,
      damage,
    });
  }

  /** 5-strike staggered storm near a position, each offset slightly. */
  storm(pos: THREE.Vector3, strikes = 5, stagger = 0.7, radius = 3.2, damage = 22): void {
    for (let i = 0; i < strikes; i++) {
      const jitter = new THREE.Vector3(
        (Math.random() - 0.5) * 2.4,
        0,
        (Math.random() - 0.5) * 2.4,
      );
      this.strike(pos.clone().add(jitter), i * stagger, radius, damage);
    }
  }

  update(dt: number, enemies: Enemy[]): void {
    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const s = this.strikes[i];

      if (!s.fired) {
        s.delay -= dt;
        if (s.delay <= 0) {
          this.spawnVisual(s);
          this.applyDamage(s, enemies);
          s.fired = true;
        }
        continue;
      }

      s.lifeAfterFire -= dt;
      const k = Math.max(0, s.lifeAfterFire / FLASH_DURATION);
      if (s.mesh) {
        (s.mesh.material as THREE.MeshBasicMaterial).opacity = k;
        s.mesh.scale.x = 1 + (1 - k) * 0.8;
        s.mesh.scale.z = 1 + (1 - k) * 0.8;
      }
      if (s.light) s.light.intensity = 6 * k;

      if (s.lifeAfterFire <= 0) {
        if (s.mesh) this.scene.remove(s.mesh);
        if (s.light) this.scene.remove(s.light);
        this.strikes.splice(i, 1);
      }
    }

    for (let i = this.arcs.length - 1; i >= 0; i--) {
      const a = this.arcs[i];
      a.lifeAfterFire -= dt;
      const k = Math.max(0, a.lifeAfterFire / CHAIN_FLASH_DURATION);
      (a.line.material as THREE.LineBasicMaterial).opacity = k;
      a.light.intensity = 6 * k;
      if (a.lifeAfterFire <= 0) {
        this.scene.remove(a.line);
        this.scene.remove(a.light);
        this.arcs.splice(i, 1);
      }
    }
  }

  private spawnVisual(s: Strike): void {
    const geom = new THREE.CylinderGeometry(COLUMN_RADIUS, COLUMN_RADIUS * 2, COLUMN_HEIGHT, 10, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xbfe8ff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(s.pos);
    mesh.position.y = COLUMN_HEIGHT / 2;
    this.scene.add(mesh);
    s.mesh = mesh;

    const light = new THREE.PointLight(0xbfe8ff, 8, 12, 2);
    light.position.copy(s.pos);
    light.position.y = 1.2;
    this.scene.add(light);
    s.light = light;
  }

  private applyDamage(s: Strike, enemies: Enemy[]): void {
    const r2 = s.radius * s.radius;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.root.position.x - s.pos.x;
      const dz = e.root.position.z - s.pos.z;
      if (dx * dx + dz * dz < r2) {
        const knock = new THREE.Vector3(dx, 0, dz);
        e.takeDamage(s.damage, knock);
      }
    }
  }
}
