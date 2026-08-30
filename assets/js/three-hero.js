import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const stage = document.getElementById("heroStage");
const canvas = document.getElementById("heroCanvas");

if (stage && canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 7.2;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const network = new THREE.Group();
  scene.add(network);

  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0x315a56
  });

  const accentMaterial = new THREE.MeshBasicMaterial({
    color: 0xb96f57
  });

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x6f9287,
    transparent: true,
    opacity: 0.38
  });

  const points = [];
  const nodes = [];
  const count = 30;

  for (let i = 0; i < count; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const radius = 2.25;

    const position = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    points.push(position);

    const geometry = new THREE.SphereGeometry(
      i % 6 === 0 ? 0.08 : 0.045,
      12,
      12
    );

    const node = new THREE.Mesh(
      geometry,
      i % 6 === 0 ? accentMaterial : nodeMaterial
    );

    node.position.copy(position);
    network.add(node);
    nodes.push(node);
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (points[i].distanceTo(points[j]) < 1.25) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          points[i],
          points[j]
        ]);

        network.add(new THREE.Line(geometry, lineMaterial));
      }
    }
  }

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xb96f57,
    transparent: true,
    opacity: 0.22,
    wireframe: true
  });

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.65, 0.012, 8, 180),
    ringMaterial
  );

  ring.rotation.x = Math.PI * 0.42;
  network.add(ring);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  stage.addEventListener("pointermove", event => {
    const rect = stage.getBoundingClientRect();

    target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  stage.addEventListener("pointerleave", () => {
    target.x = 0;
    target.y = 0;
  });

  const resize = () => {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", resize);
  resize();

  let time = 0;

  const animate = () => {
    time += 0.004;

    pointer.x += (target.x - pointer.x) * 0.035;
    pointer.y += (target.y - pointer.y) * 0.035;

    network.rotation.y = time * 0.7 + pointer.x * 0.18;
    network.rotation.x = Math.sin(time * 0.8) * 0.06 + pointer.y * 0.12;

    ring.rotation.z = time * 0.4;

    nodes.forEach((node, index) => {
      const pulse = 1 + Math.sin(time * 2 + index * 0.45) * 0.12;
      node.scale.setScalar(pulse);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
