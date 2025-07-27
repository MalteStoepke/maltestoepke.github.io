function initMaya() {
    console.log('Initializing Maya 1.0 3D Application with Classic Maya UI');

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

    // Add UI controls for rendering modes, rotation, and scale
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'maya-controls';
    controlsDiv.style.marginBottom = '8px';
    controlsDiv.style.fontSize = '12px';
    controlsDiv.style.fontFamily = '"Arial", sans-serif';
    controlsDiv.style.background = '#333333'; // Classic Maya dark gray
    controlsDiv.style.padding = '4px';
    controlsDiv.style.border = '2px outset #808080';
    controlsDiv.innerHTML = `
        <div style="margin-bottom: 4px; color: #cccccc; font-weight: bold;">
            View Mode:
        </div>
        <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <button id="modeWireframe" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff; font-size: 12px;">
                Wireframe
            </button>
            <button id="modeFlat" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff; font-size: 12px;">
                Flat Shaded
            </button>
            <button id="modeShaded" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff; font-size: 12px;">
                Shaded
            </button>
        </div>
        <div style="margin-bottom: 4px; color: #cccccc; font-weight: bold;">
            Rotate Cube (degrees):
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                X: <input type="range" id="rotateX" min="-180" max="180" value="0" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                Y: <input type="range" id="rotateY" min="-180" max="180" value="0" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                Z: <input type="range" id="rotateZ" min="-180" max="180" value="0" style="width: 100px;">
            </label>
        </div>
        <div style="margin-bottom: 4px; color: #cccccc; font-weight: bold;">
            Scale Cube:
        </div>
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                X: <input type="range" id="scaleX" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                Y: <input type="range" id="scaleY" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
            <label style="display: flex; align-items: center; gap: 4px; color: #cccccc;">
                Z: <input type="range" id="scaleZ" min="0.1" max="2" step="0.1" value="1" style="width: 100px;">
            </label>
        </div>
        <div style="margin-top: 8px;">
            <button id="resetCube" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff; font-size: 12px;">
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

    // Gradient background (mimicking classic Maya)
    const gradientTexture = new THREE.CanvasTexture(generateGradientCanvas());
    scene.background = gradientTexture;

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
    const materialPhong = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Shaded mode
    const materialFlat = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Flat shaded mode
    const materialWireframe = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Wireframe mode
    const edges = new THREE.EdgesGeometry(geometry);
    const wireframe = new THREE.LineSegments(edges, materialWireframe);
    const cube = new THREE.Mesh(geometry, materialPhong);
    scene.add(cube);

    // Grid (mimicking Maya perspective grid)
    const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    grid.position.y = -1;
    scene.add(grid);

    // Axis indicator
    const axes = new THREE.AxesHelper(1);
    axes.position.set(-2, 1, -2); // Position in corner
    scene.add(axes);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // OrbitControls for Maya-like navigation
    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.enableZoom = true;
    controls.zoomSpeed = 1.0;
    controls.enablePan = true;
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

    // UI event listeners
    const rotateX = document.getElementById('rotateX');
    const rotateY = document.getElementById('rotateY');
    const rotateZ = document.getElementById('rotateZ');
    const scaleX = document.getElementById('scaleX');
    const scaleY = document.getElementById('scaleY');
    const scaleZ = document.getElementById('scaleZ');
    const modeWireframe = document.getElementById('modeWireframe');
    const modeFlat = document.getElementById('modeFlat');
    const modeShaded = document.getElementById('modeShaded');

    function updateCubeTransform() {
        cube.rotation.x = THREE.MathUtils.degToRad(parseFloat(rotateX.value));
        cube.rotation.y = THREE.MathUtils.degToRad(parseFloat(rotateY.value));
        cube.rotation.z = THREE.MathUtils.degToRad(parseFloat(rotateZ.value));
        cube.scale.set(
            parseFloat(scaleX.value),
            parseFloat(scaleY.value),
            parseFloat(scaleZ.value)
        );
        wireframe.rotation.copy(cube.rotation);
        wireframe.scale.copy(cube.scale);
    }

    function setRenderMode(mode) {
        console.log(`Switching to ${mode} mode`);
        scene.remove(cube);
        scene.remove(wireframe);
        if (mode === 'wireframe') {
            scene.add(wireframe);
        } else {
            scene.add(cube);
            cube.material = mode === 'flat' ? materialFlat : materialPhong;
        }
        updateCubeTransform();
    }

    rotateX.addEventListener('input', updateCubeTransform);
    rotateY.addEventListener('input', updateCubeTransform);
    rotateZ.addEventListener('input', updateCubeTransform);
    scaleX.addEventListener('input', updateCubeTransform);
    scaleY.addEventListener('input', updateCubeTransform);
    scaleZ.addEventListener('input', updateCubeTransform);

    modeWireframe.addEventListener('click', () => setRenderMode('wireframe'));
    modeFlat.addEventListener('click', () => setRenderMode('flat'));
    modeShaded.addEventListener('click', () => setRenderMode('shaded'));

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
        setRenderMode('shaded'); // Default to shaded mode
    };
    document.getElementById('resetCube').addEventListener('click', window.resetCube);

    // Gradient background function
    function generateGradientCanvas() {
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = 256;
        gradCanvas.height = 256;
        const ctx = gradCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#333333'); // Dark gray (Maya-like)
        gradient.addColorStop(1, '#000000'); // Black
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        return gradCanvas;
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    // Start animation and default mode
    animate();
    setRenderMode('shaded');

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
}
