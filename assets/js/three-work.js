import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const stage = document.getElementById("workStage");
const canvas = document.getElementById("workCanvas");

if (stage && canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(3.4, 2.4, 5.4);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const group = new THREE.Group();
  scene.add(group);

  const inkEdges = 0x173c39;
  const terracotta = 0xb96f57;
  const gold = 0xd6ad57;
  const sage = 0x8fa68e;

  const blockMaterial = (color, opacity) => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity
  });

  const edgeMaterial = new THREE.LineBasicMaterial({
    color: inkEdges,
    transparent: true,
    opacity: 0.4
  });

  // three clustered "building block" groups, echoing Business Analysis / Marketing / Certifications
  const blockDefs = [
    { pos: [-1.15, -0.5, 0], size: [1, 1, 1], color: sage, opacity: 0.5 },
    { pos: [-1.15, 0.55, 0], size: [1, 0.9, 1], color: sage, opacity: 0.32 },
    { pos: [0.15, -0.15, 0.2], size: [1.2, 1.2, 1.2], color: terracotta, opacity: 0.5 },
    { pos: [1.55, -0.55, -0.15], size: [0.85, 0.85, 0.85], color: gold, opacity: 0.5 },
    { pos: [1.55, 0.4, -0.15], size: [0.85, 0.75, 0.85], color: gold, opacity: 0.32 }
  ];

  const blocks = [];

  blockDefs.forEach(def => {
    const geometry = new THREE.BoxGeometry(...def.size);
    const mesh = new THREE.Mesh(geometry, blockMaterial(def.color, def.opacity));
    mesh.position.set(...def.pos);
    group.add(mesh);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      edgeMaterial
    );
    edges.position.copy(mesh.position);
    group.add(edges);

    blocks.push({ mesh, edges, base: mesh.position.clone(), offset: Math.random() * Math.PI * 2 });
  });

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
    time += 0.006;

    pointer.x += (target.x - pointer.x) * 0.04;
    pointer.y += (target.y - pointer.y) * 0.04;

    group.rotation.y = Math.sin(time * 0.35) * 0.35 + pointer.x * 0.25;
    group.rotation.x = Math.cos(time * 0.3) * 0.08 + pointer.y * 0.12;

    blocks.forEach(block => {
      const float = Math.sin(time * 1.4 + block.offset) * 0.08;
      block.mesh.position.y = block.base.y + float;
      block.edges.position.y = block.base.y + float;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
}
