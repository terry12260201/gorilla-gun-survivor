import * as THREE from 'three';

export class SceneRoot {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;

  constructor(mount: HTMLElement) {
    // Background handled by Skybox; fog merges distant objects into it.
    this.scene.fog = new THREE.Fog(0x2b1f38, 32, 95);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 1.7, 6);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0xbfd1ff, 0x3a3240, 1.1);
    this.scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.6);
    dir.position.set(20, 40, 15);
    this.scene.add(dir);

    window.addEventListener('resize', () => this.onResize());
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
