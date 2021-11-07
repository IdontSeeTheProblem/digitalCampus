// Allows creation of cube objects with set params
import * as THREE from './three.module.js';

export default function createBldg({ l, w, h, color, opacity, x, y, z, rotation}) {
  const geometry = new THREE.BoxGeometry(l, w, h);
  const material = new THREE.MeshBasicMaterial({ color, opacity, transparent: true });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(x, y, z)
  cube.rotation.y = rotation

  return cube;
}