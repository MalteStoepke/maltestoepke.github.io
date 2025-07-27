function initMaya() {
    console.log('Initializing Maya 1.0 3D Program');

    // Check if canvas exists
    const canvas = document.getElementById('maya-canvas');
    if (!canvas) {
        console.error('Maya canvas not found');
        return;
    }

    // Load Three.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => {
        console.log('Three.js loaded successfully');
        setup3DScene(canvas);
    };
    script.onerror = () => {
        console.error('Failed to load Three.js');
        alert('Failed to load 3D rendering library.');
    };
    document.body.appendChild(script);
}

function setup3DScene(canvas) {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75, // Field of view
        canvas.width / canvas.height, // Aspect ratio
        0.1, // Near plane
        1000 // Far plane
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(canvas.width, canvas.height);

    // Cube setup
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Green cube
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    // Start animation
    animate();
}
