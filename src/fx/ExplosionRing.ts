import * as THREE from 'three';

interface Ring {
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  maxRadius: number;
  life: number;
  maxLife: number;
}

export class ExplosionRingSystem {
  private rings: Ring[] = [];

  constructor(private scene: THREE.Scene) {}

  spawn(pos: THREE.Vector3, radius: number, color = 0xff7722): void {
    const geom = new THREE.RingGeometry(0.9, 1.0, 48);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos.x, 0.05, pos.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.setScalar(0.001);
    this.scene.add(mesh);
    this.rings.push({ mesh, mat, maxRadius: radius, life: 0.5, maxLife: 0.5 });
  }

  update(dt: number): void {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      r.life -= dt;
      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        r.mesh.geometry.dispose();
        r.mat.dispose();
        this.rings.splice(i, 1);
        continue;
      }
      const k = 1 - r.life / r.maxLife;
      r.mesh.scale.setScalar(r.maxRadius * (0.1 + 0.95 * k));
      r.mat.opacity = 0.9 * (r.life / r.maxLife);
    }
  }
}
