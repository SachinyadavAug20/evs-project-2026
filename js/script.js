// 3D Model Showcase for AI Data Centers - Enhanced Visualization
const scene = new THREE.Scene();

// Create a more meaningful scene with multiple elements
// Ground plane
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Skybox-like background
const skyColor = 0x0a0a15;
scene.background = new THREE.Color(0x0a0a15);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(10, 8, 12);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.getElementById('modelContainer').appendChild(renderer.domElement);

// Lights
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(10, 10, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
fillLight.position.set(-10, -10, -10);
scene.add(fillLight);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Create server racks with immersion cooling visualization
// Server rack 1
const rack1Geometry = new THREE.BoxGeometry(3, 6, 2);
const rack1Material = new THREE.MeshStandardMaterial({ color: 0x151520 });
const rack1 = new THREE.Mesh(rack1Geometry, rack1Material);
rack1.position.set(-7, 0, 0);
scene.add(rack1);

// Server rack 2 (with immersion cooling depiction)
const rack2Geometry = new THREE.BoxGeometry(3, 6, 2);
const rack2Material = new THREE.MeshStandardMaterial({ color: 0x1a1a2e });
const rack2 = new THREE.Mesh(rack2Geometry, rack2Material);
rack2.position.set(7, 0, 0);
scene.add(rack2);

// Immersion cooling fluid representation - semi-transparent spheres
const fluidCount = 8;
for (let i = 0; i < fluidCount; i++) {
  const angle = (i / fluidCount) * Math.PI * 2;
  const radius = 1.5 + Math.random() * 1;
  const fluidSphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x00d4aa, transparent: true, opacity: 0.4 })
  );
  fluidSphere.position.set(
    Math.cos(angle) * 5,
    3 + Math.random() * 2,
    Math.sin(angle) * 5
  );
  scene.add(fluidSphere);
}

// GPU accelerators (representing the high-density compute)
const gpuCount = 12;
for (let i = 0; i < gpuCount; i++) {
  const gpu = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xff6b6b })
  );
  const idx = i % 4;
  const posX = (idx - 1.5) * 1.5;
  const posY = 2 + (Math.floor(i / 4) * 1.2);
  const posZ = (i > 7 ? Math.random() * 3 : 0);
  gpu.position.set(posX, posY, posZ);
  gpu.rotation.z = Math.random() * Math.PI;
  scene.add(gpu);
}

// Add some decorative cubes to represent data flow
for (let i = 0; i < 20; i++) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.2 + Math.random() * 0.4, 0.2 + Math.random() * 0.4, 0.2 + Math.random() * 0.4),
    new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.5, 0.5) })
  );
  cube.position.set(
    (Math.random() - 0.5) * 12,
    1 + Math.random() * 4,
    (Math.random() - 0.5) * 12
  );
  cube.scale.y = 0.5;
  scene.add(cube);
}

// Animation
const cubes = scene.children.filter(c => c.isMesh && c !== ground && c !== rack1 && c !== rack2);

function animate() {
  requestAnimationFrame(animate);

  // Rotate the entire scene slowly
  scene.rotation.y += 0.001;
  
  // Rotate racks in opposite directions
  rack1.rotation.y += 0.005;
  rack2.rotation.y -= 0.005;
  
  // Float the fluid spheres
  cubes.forEach((cube, i) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.position.y += Math.sin(i * 0.5 + animationFrame) * 0.001;
  });

  let animationFrame = (animationFrame || 0) + 0.01;
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});