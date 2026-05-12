import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const textureCache = new Map<string, Promise<THREE.Texture>>();

/** Prefix absolute asset paths with Vite's BASE_URL so the game works under a sub-path
 *  (e.g. GitHub Pages at https://user.github.io/<repo>/). No-op in dev (BASE_URL = '/'). */
function resolveAssetUrl(url: string): string {
  if (!url.startsWith('/')) return url;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return base + url;
}

function loadTexture(url: string): Promise<THREE.Texture> {
  let p = textureCache.get(url);
  if (!p) {
    p = textureLoader.loadAsync(resolveAssetUrl(url)).then((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.flipY = false; // glTF convention
      return tex;
    });
    textureCache.set(url, p);
  }
  return p;
}

function deriveTextureUrl(glbUrl: string): string {
  return glbUrl.replace(/\.glb$/i, '.png');
}

// FBX2glTF --khr-materials-unlit produces MeshBasicMaterial (no lighting, no emissive).
// Upgrade to MeshStandardMaterial so we can use emissive flashes and keep scene lighting.
function upgradeToStandard(root: THREE.Object3D): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const upgraded = mats.map((m) => {
      if ((m as THREE.MeshStandardMaterial).isMeshStandardMaterial) return m;
      const basic = m as THREE.MeshBasicMaterial;
      return new THREE.MeshStandardMaterial({
        map: basic.map,
        color: basic.color,
        transparent: basic.transparent,
        opacity: basic.opacity,
        side: basic.side,
        alphaTest: basic.alphaTest,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
        metalness: 0.0,
        roughness: 0.85,
      });
    });
    mesh.material = Array.isArray(mesh.material) ? upgraded : upgraded[0];
  });
}

function applyTexture(root: THREE.Object3D, tex: THREE.Texture): void {
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const mat = m as THREE.MeshStandardMaterial;
      mat.map = tex;
      mat.needsUpdate = true;
    }
  });
}

export async function loadGltf(url: string, opts?: { texture?: string | null }): Promise<THREE.Group> {
  const gltf = await gltfLoader.loadAsync(resolveAssetUrl(url));
  const scene = gltf.scene;
  upgradeToStandard(scene);

  const texUrl = opts?.texture === null ? null : (opts?.texture ?? deriveTextureUrl(url));
  if (texUrl) {
    try {
      const tex = await loadTexture(texUrl);
      applyTexture(scene, tex);
    } catch (e) {
      console.warn(`[asset] texture missing for ${url}: ${texUrl}`, e);
    }
  }
  return scene;
}
