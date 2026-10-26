// 3D Model Showcase for AI Data Centers - With fallback
function init3DModel() {
  const container = document.getElementById('modelContainer');
  if (!container) {
    console.error('Model container not found');
    return;
  }
  
  try {
    // Check if THREE is available
    if (typeof THREE === 'undefined') {
      container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #00d4aa;"><p>Loading 3D Model...</p></div>';
      return;
    }
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a15);
    
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshStandardMaterial({ color: 0x00d4aa });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 8;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    let rotationSpeed = 0.01;
    
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += rotationSpeed;
      cube.rotation.y += rotationSpeed;
      renderer.render(scene, camera);
    }
    animate();
    
    window.addEventListener('resize', () => {
      if (container) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    });
    
  } catch (e) {
    console.error('3D model error:', e);
    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #ff6b6b;"><p>3D Model Error</p></div>';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init3DModel);
} else {
  init3DModel();
}