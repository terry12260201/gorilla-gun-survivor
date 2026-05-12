import * as THREE from 'three';
import type { Input } from '../core/Input.js';
import type { Arena } from '../scene/Arena.js';

const MOUSE_SENS_LOCKED = 0.0022;
const MOUSE_SENS_DRAG = 0.004;
const EYE_HEIGHT = 1.0; // gorilla crawling height
const PITCH_LIMIT = Math.PI / 2 - 0.05;
const GRAVITY = 18;
const JUMP_VELOCITY = 9.5; // ~2.5m apex (3x previous)

export class PlayerController {
  readonly position = new THREE.Vector3(0, EYE_HEIGHT, 6);
  moveSpeed = 6;
  yaw = 0;
  private pitch = 0;
  private vy = 0;
  private grounded = true;
  private forward = new THREE.Vector3();
  private right = new THREE.Vector3();

  constructor(private camera: THREE.PerspectiveCamera, private input: Input) {
    this.applyToCamera();
  }

  update(dt: number, arenaSize: number, arena?: Arena): void {
    const sens = this.input.locked ? MOUSE_SENS_LOCKED : MOUSE_SENS_DRAG;
    const { dx, dy } = this.input.consumeMouse();
    this.yaw -= dx * sens;
    this.pitch -= dy * sens;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));

    this.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const k = this.input.keys;
    let mx = 0, mz = 0;
    if (k.has('KeyW')) mz += 1;
    if (k.has('KeyS')) mz -= 1;
    if (k.has('KeyD')) mx += 1;
    if (k.has('KeyA')) mx -= 1;

    if (mx !== 0 || mz !== 0) {
      const len = Math.hypot(mx, mz);
      mx /= len; mz /= len;
      this.position.addScaledVector(this.forward, mz * this.moveSpeed * dt);
      this.position.addScaledVector(this.right, mx * this.moveSpeed * dt);
    }

    if (this.grounded && k.has('Space')) {
      this.vy = JUMP_VELOCITY;
      this.grounded = false;
    }

    this.vy -= GRAVITY * dt;
    this.position.y += this.vy * dt;
    if (this.position.y <= EYE_HEIGHT) {
      this.position.y = EYE_HEIGHT;
      this.vy = 0;
      this.grounded = true;
    }

    if (arena) arena.resolveCircle(this.position, 0.5);
    const half = arenaSize / 2 - 1;
    this.position.x = Math.max(-half, Math.min(half, this.position.x));
    this.position.z = Math.max(-half, Math.min(half, this.position.z));

    this.applyToCamera();
  }

  private applyToCamera(): void {
    this.camera.position.copy(this.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
