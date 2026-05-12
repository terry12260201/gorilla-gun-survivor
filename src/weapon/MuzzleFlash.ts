import * as THREE from 'three';

const FLASH_DURATION = 0.06;

export class MuzzleFlash {
  readonly light = new THREE.PointLight(0xffc866, 0, 6, 2);
  readonly sprite: THREE.Sprite;
  private timer = 0;

  constructor(parent: THREE.Object3D) {
    const mat = new THREE.SpriteMaterial({
      color: 0xfff0a0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    this.sprite = new THREE.Sprite(mat);
    this.sprite.scale.setScalar(0.4);
    parent.add(this.light);
    parent.add(this.sprite);
  }

  fire(): void {
    this.timer = FLASH_DURATION;
  }

  update(dt: number): void {
    const mat = this.sprite.material as THREE.SpriteMaterial;
    if (this.timer > 0) {
      this.timer = Math.max(0, this.timer - dt);
      const k = this.timer / FLASH_DURATION;
      this.light.intensity = 3 * k;
      mat.opacity = k;
      mat.rotation = Math.random() * Math.PI;
    } else {
      this.light.intensity = 0;
      mat.opacity = 0;
    }
  }
}
