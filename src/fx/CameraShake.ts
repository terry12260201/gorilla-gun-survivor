import * as THREE from 'three';

/** Lightweight camera shake: offsets camera.position each frame, decays to 0. */
export class CameraShake {
  private timer = 0;
  private duration = 0;
  private amplitude = 0;

  trigger(duration: number, amplitude: number): void {
    if (amplitude >= this.amplitude || this.timer <= 0) {
      this.timer = duration;
      this.duration = duration;
      this.amplitude = amplitude;
    }
  }

  /** Call after all position writes, before render. */
  apply(dt: number, camera: THREE.Camera): void {
    if (this.timer <= 0) return;
    this.timer = Math.max(0, this.timer - dt);
    const k = this.timer / this.duration;
    const amp = this.amplitude * k;
    camera.position.x += (Math.random() - 0.5) * 2 * amp;
    camera.position.y += (Math.random() - 0.5) * 2 * amp;
    camera.position.z += (Math.random() - 0.5) * 2 * amp;
  }
}
