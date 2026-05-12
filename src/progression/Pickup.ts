import * as THREE from 'three';

export type PickupKind = 'heart' | 'chest';

interface PickupItem {
  alive: boolean;
  kind: PickupKind;
  bornAt: number;
  mesh: THREE.Mesh;
  baseY: number;
  phase: number;
}

const HEART_PICKUP_RANGE = 1.0;
const CHEST_PICKUP_RANGE = 1.2;
const HEART_LIFETIME = 30;
const PICKUP_GRACE = 0.35;
const BOB_AMP = 0.15;
const BOB_FREQ_HZ = 1.2;
const CHEST_ROT_SPEED = 1.2;

/**
 * Unified pickup system for Heart (heal) and Chest (upgrade trigger).
 * Not instanced — counts are small and per-mesh materials let the chest glow independently.
 */
export class PickupSystem {
  private items: PickupItem[] = [];
  private time = 0;
  private heartGeom: THREE.BufferGeometry;
  private chestGeom: THREE.BufferGeometry;
  private heartMat: THREE.MeshStandardMaterial;
  private chestMat: THREE.MeshStandardMaterial;

  constructor(private scene: THREE.Scene) {
    this.heartGeom = new THREE.SphereGeometry(0.22, 14, 10);
    this.heartMat = new THREE.MeshStandardMaterial({
      color: 0xff2233,
      emissive: 0xff2233,
      emissiveIntensity: 0.9,
      roughness: 0.45,
      metalness: 0.1,
    });
    this.chestGeom = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    this.chestMat = new THREE.MeshStandardMaterial({
      color: 0xffaa22,
      emissive: 0xffaa22,
      emissiveIntensity: 0.75,
      roughness: 0.4,
      metalness: 0.6,
    });
  }

  spawn(kind: PickupKind, pos: THREE.Vector3): void {
    const baseY = kind === 'heart' ? 0.6 : 0.55;
    const mesh = new THREE.Mesh(
      kind === 'heart' ? this.heartGeom : this.chestGeom,
      kind === 'heart' ? this.heartMat : this.chestMat,
    );
    mesh.position.set(pos.x, baseY, pos.z);
    this.scene.add(mesh);
    this.items.push({
      alive: true,
      kind,
      bornAt: this.time,
      mesh,
      baseY,
      phase: Math.random() * Math.PI * 2,
    });
  }

  update(dt: number, playerPos: THREE.Vector3, onCollect: (kind: PickupKind) => void): void {
    this.time += dt;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      if (!it.alive) continue;
      const bornDt = this.time - it.bornAt;

      it.mesh.position.y = it.baseY + Math.sin(this.time * BOB_FREQ_HZ * Math.PI * 2 + it.phase) * BOB_AMP;
      if (it.kind === 'chest') {
        it.mesh.rotation.y += CHEST_ROT_SPEED * dt;
      }

      if (it.kind === 'heart' && bornDt > HEART_LIFETIME) {
        this.removeAt(i);
        continue;
      }

      if (bornDt > PICKUP_GRACE) {
        const dx = playerPos.x - it.mesh.position.x;
        const dz = playerPos.z - it.mesh.position.z;
        const range = it.kind === 'heart' ? HEART_PICKUP_RANGE : CHEST_PICKUP_RANGE;
        if (dx * dx + dz * dz < range * range) {
          onCollect(it.kind);
          this.removeAt(i);
        }
      }
    }
  }

  private removeAt(i: number): void {
    const it = this.items[i];
    this.scene.remove(it.mesh);
    it.alive = false;
    this.items.splice(i, 1);
  }
}
