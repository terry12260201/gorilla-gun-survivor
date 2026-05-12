import * as THREE from 'three';

function makeGroundTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#3a322a';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.2 + 0.4;
    const roll = Math.random();
    ctx.fillStyle = roll < 0.25 ? '#28211a'
                   : roll < 0.55 ? '#45382d'
                   : roll < 0.82 ? '#574436'
                   : '#6b5740';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(14,9,6,0.6)';
  for (let i = 0; i < 22; i++) {
    ctx.lineWidth = 0.6 + Math.random() * 1.2;
    ctx.beginPath();
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 80;
      y += (Math.random() - 0.5) * 80;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface Obstacle { x: number; z: number; radius: number; }

export class Arena {
  readonly size: number;
  readonly group = new THREE.Group();
  readonly obstacles: Obstacle[] = [];

  /** Pushes the given position out of any obstacle it overlaps. Mutates in place. */
  resolveCircle(pos: THREE.Vector3, radius: number): void {
    for (const o of this.obstacles) {
      const dx = pos.x - o.x;
      const dz = pos.z - o.z;
      const d2 = dx * dx + dz * dz;
      const minD = radius + o.radius;
      if (d2 < minD * minD && d2 > 0.0001) {
        const d = Math.sqrt(d2);
        const push = minD - d;
        pos.x += (dx / d) * push;
        pos.z += (dz / d) * push;
      }
    }
  }

  constructor(size = 80) {
    this.size = size;

    const groundMat = new THREE.MeshStandardMaterial({
      map: makeGroundTexture(),
      roughness: 0.95,
      metalness: 0.0,
      color: 0x8a7a68,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size, 1, 1), groundMat);
    ground.rotation.x = -Math.PI / 2;
    this.group.add(ground);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x3f3742, roughness: 0.9, metalness: 0.1,
    });
    const ringR = size / 2 - 2;
    const ringCount = 14;
    for (let i = 0; i < ringCount; i++) {
      const a = (i / ringCount) * Math.PI * 2;
      const h = 5 + Math.random() * 2.2;
      const rTop = 0.55 + Math.random() * 0.3;
      const rBot = 0.75 + Math.random() * 0.3;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBot, h, 8),
        pillarMat,
      );
      pillar.position.set(Math.cos(a) * ringR, h / 2, Math.sin(a) * ringR);
      pillar.rotation.y = Math.random() * 0.3;
      this.group.add(pillar);
      this.obstacles.push({ x: pillar.position.x, z: pillar.position.z, radius: rBot + 0.1 });
    }

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x524638, roughness: 0.92, metalness: 0.0,
    });
    for (let i = 0; i < 24; i++) {
      const size2 = 0.4 + Math.random() * 0.9;
      const rock = new THREE.Mesh(
        new THREE.IcosahedronGeometry(size2, 0),
        rockMat,
      );
      let rx = 0, rz = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        rx = (Math.random() - 0.5) * size * 0.82;
        rz = (Math.random() - 0.5) * size * 0.82;
        if (Math.hypot(rx, rz) > 4) break; // keep center clear of spawn
      }
      rock.position.set(rx, size2 * 0.45, rz);
      rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      rock.scale.y = 0.6 + Math.random() * 0.4;
      this.group.add(rock);
      if (size2 > 0.7) {
        this.obstacles.push({ x: rx, z: rz, radius: size2 * 0.9 });
      }
    }
  }
}
