import * as THREE from 'three';

const VERTEX = /* glsl */`
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const FRAGMENT = /* glsl */`
  varying vec3 vWorldPos;
  uniform vec3 topColor;
  uniform vec3 midColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;
  void main() {
    float h = normalize(vWorldPos + vec3(0.0, offset, 0.0)).y;
    float t = clamp(h, 0.0, 1.0);
    vec3 col;
    if (t < 0.5) {
      col = mix(bottomColor, midColor, pow(t * 2.0, exponent));
    } else {
      col = mix(midColor, topColor, pow((t - 0.5) * 2.0, exponent));
    }
    gl_FragColor = vec4(col, 1.0);
  }
`;

export class Skybox {
  readonly mesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    const geom = new THREE.SphereGeometry(400, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor:    { value: new THREE.Color(0x0a1020) },
        midColor:    { value: new THREE.Color(0x2b1f38) },
        bottomColor: { value: new THREE.Color(0x4c3a45) },
        offset:      { value: 12 },
        exponent:    { value: 0.7 },
      },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.renderOrder = -1;
    scene.add(this.mesh);
  }
}
