function initMaya() {
    console.log('Initializing Maya 1.0 3D Application');

    // Check if canvas exists
    const canvas = document.getElementById('maya-canvas');
    if (!canvas) {
        console.error('Maya canvas not found');
        return;
    }

    // Get the window body to add UI controls
    const windowBody = canvas.parentElement;
    if (!windowBody) {
        console.error('Window body not found');
        return;
    }

    // Add UI controls for rotation and scale
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'maya-controls';
    controlsDiv.style.marginBottom = '8px';
    controlsDiv.style.fontSize = '12px';
    controlsDiv.style.fontFamily = '"MS Sans Serif", Tahoma, Arial, sans-serif';
    controlsDiv.innerHTML = `
        <div style="margin-bottom: 4px; color: #000080; font-weight: bold;">
            Rotate Cube (degrees):
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 4px;">
                X: <input type="range" id="rotateX" min="-180" max="180" value="0" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px;">
                Y: <input type="range" id="rotateY" min="-180" max="180" value="0" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px;">
                Z: <input type="range" id="rotateZ" min="-180" max="180" value="0" style="width: 100px;">
            </label>
        </div>
        <div style="margin-bottom: 4px; color: #000080; font-weight: bold;">
            Scale Cube:
        </div>
        <div style="display: flex; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 4px;">
                X: <input type="range" id="scaleX" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px;">
                Y: <input type="range" id="scaleY" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px;">
                Z: <input type="range" id="scaleZ" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
        </div>
        <div style="margin-top: 8px;">
            <button onclick="resetCube()" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff; font-size: 12px;">
                Reset Cube
            </button>
        </div>
    `;
    windowBody.insertBefore(controlsDiv, canvas);

    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = () => {
        console.log('Three.js loaded successfully');
        // Load OrbitControls
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        controlsScript.onload = () => {
            console.log('OrbitControls loaded successfully');
            setup3DScene(canvas);
        };
        controlsScript.onerror = () => {
            console.error('Failed to load OrbitControls');
            alert('Failed to load camera controls library.');
        };
        document.body.appendChild(controlsScript);
    };
    threeScript.onerror = () => {
        console.error('Failed to load Three.js');
        alert('Failed to load 3D rendering library.');
    };
    document.body.appendChild(threeScript);
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
    camera.position.set(0, 0, 5);

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

    // Ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // OrbitControls for Maya-like navigation
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true; // Smooth orbiting
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true; // Allow panning in screen space (Maya-like)
    controls.enableZoom = true; // Enable zoom with RMB or mouse wheel
    controls.zoomSpeed = 1.0;
    controls.enablePan = true; // Enable panning with MMB
    controls.panSpeed = 0.8;
    controls.rotateSpeed = 0.8;
    controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE, // Alt + LMB for orbit
        MIDDLE: THREE.MOUSE.PAN, // Alt + MMB for pan
        RIGHT: THREE.MOUSE.DOLLY // Alt + RMB for zoom
    };
    controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    };

    // UI event listeners for cube rotation and scale
    const rotateX = document.getElementById('rotateX');
    const rotateY = document.getElementById('rotateY');
    const rotateZ = document.getElementById('rotateZ');
    const scaleX = document.getElementById('scaleX');
    const scaleY = document.getElementById('scaleY');
    const scaleZ = document.getElementById('scaleZ');

    function updateCubeTransform() {
        cube.rotation.x = THREE.MathUtils.degToRad(parseFloat(rotateX.value));
        cube.rotation.y = THREE.MathUtils.degToRad(parseFloat(rotateY.value));
        cube.rotation.z = THREE.MathUtils.degToRad(parseFloat(rotateZ.value));
        cube.scale.set(
            parseFloat(scaleX.value),
            parseFloat(scaleY.value),
            parseFloat(scaleZ.value)
        );
    }

    rotateX.addEventListener('input', updateCubeTransform);
    rotateY.addEventListener('input', updateCubeTransform);
    rotateZ.addEventListener('input', updateCubeTransform);
    scaleX.addEventListener('input', updateCubeTransform);
    scaleY.addEventListener('input', updateCubeTransform);
    scaleZ.addEventListener('input', updateCubeTransform);

    // Reset cube transformation
    window.resetCube = function() {
        rotateX.value = 0;
        rotateY.value = 0;
        rotateZ.value = 0;
        scaleX.value = 1;
        scaleY.value = 1;
        scaleZ.value = 1;
        updateCubeTransform();
        camera.position.set(0, 0, 5);
        controls.reset();
    };

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update(); // Update camera controls
        renderer.render(scene, camera);
    }

    // Start animation
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
}
