// 3D Model Showcase for AI Data Centers
const scene = new THREE.Scene();

// Create a simple rotating cube as the 3D model
const geometry = new THREE.BoxGeometry(4, 4, 4);
const material = new THREE.MeshStandardMaterial({ color: 0x00d4aa });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.getElementById('modelContainer').appendChild(renderer.domElement);

// Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

// Animation loop
let rotationSpeed = 0.01;

function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += rotationSpeed;
  cube.rotation.y += rotationSpeed;
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});