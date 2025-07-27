function initMaya() {
    console.log('Initializing Maya 1.0 3D Application with Enhanced UI');

    // Check if canvas exists
    const canvas = document.getElementById('maya-canvas');
    if (!canvas) {
        console.error('Maya canvas not found');
        return;
    }

    // Get the window body and clear existing content
    const windowBody = canvas.parentElement;
    if (!windowBody) {
        console.error('Window body not found');
        return;
    }
    windowBody.innerHTML = ''; // Clear existing content (e.g., <p> tag)
    windowBody.appendChild(canvas); // Re-append canvas

    // Add UI controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'maya-controls';
    controlsDiv.style.marginBottom = '4px';
    controlsDiv.style.padding = '4px';
    controlsDiv.style.background = '#333333'; // Maya dark gray
    controlsDiv.style.border = '2px outset #808080';
    controlsDiv.style.fontSize = '11px';
    controlsDiv.style.fontFamily = '"Arial", sans-serif';
    controlsDiv.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
            <div style="color: #cccccc; font-weight: bold;">View Mode:</div>
            <button id="modeWireframe" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Wireframe</button>
            <button id="modeFlat" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Flat Shaded</button>
            <button id="modeShaded" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Shaded</button>
            <div style="color: #cccccc; font-weight: bold;">Add Object:</div>
            <button id="addCube" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Cube</button>
            <button id="addSphere" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Sphere</button>
            <div style="color: #cccccc; font-weight: bold;">Manipulate:</div>
            <button id="modeMove" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Move (W)</button>
            <button id="modeRotate" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Rotate (E)</button>
            <button id="modeScale" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Scale (R)</button>
            <button id="resetScene" style="padding: 2px 6px; background: #c0c0c0; border: 2px outset #ffffff;">Reset Scene</button>
        </div>
        <div style="margin-top: 4px; color: #cccccc; font-weight: bold;">Rotate (degrees):</div>
        <div style="display: flex; gap: 8px; margin-top: 2px;">
            <label style="color: #cccccc;">X: <input type="range" id="rotateX" min="-180" max="180" value="0" style="width: 80px;"></label>
            <label style="color: #cccccc;">Y: <input type="range" id="rotateY" min="-180" max="180" value="0" style="width: 80px;"></label>
            <label style="color: #cccccc;">Z: <input type="range" id="rotateZ" min="-180" max="180" value="0" style="width: 80px;"></label>
        </div>
        <div style="margin-top: 4px; color: #cccccc; font-weight: bold;">Scale:</div>
        <div style="display: flex; gap: 8px; margin-top: 2px;">
            <label style="color: #cccccc;">X: <input type="range" id="scaleX" min="0.1" max="2" step="0.1" value="1" style="width: 80px;"></label>
            <label style="color: #cccccc;">Y: <input type="range" id="scaleY" min="0.1" max="2" step="0.1" value="1" style="width: 80px;"></label>
            <label style="color: #cccccc;">Z: <input type="range" id="scaleZ" min="0.1" max="2" step="0.1" value="1" style="width: 80px;"></label>
        </div>
    `;
    windowBody.insertBefore(controlsDiv, canvas);

    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = () => {
        console.log('Three.js loaded successfully');
        // Load TransformControls
        const transformScript = document.createElement('script');
        transformScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/TransformControls.js';
        transformScript.onload = () => {
            console.log('TransformControls loaded successfully');
            // Load OrbitControls
            const orbitScript = document.createElement('script');
            orbitScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
            orbitScript.onload = () => {
                console.log('OrbitControls loaded successfully');
                setup3DScene(canvas);
            };
            orbitScript.onerror = () => {
                console.error('Failed to load OrbitControls');
                alert('Failed to load camera controls library.');
            };
            document.body.appendChild(orbitScript);
        };
        transformScript.onerror = () => {
            console.error('Failed to load TransformControls');
            alert('Failed to load manipulator controls library.');
        };
        document.body.appendChild(transformScript);
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

    // Gradient background
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

    // Materials
    const materialPhong = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    const materialFlat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const materialWireframe = new THREE.LineBasicMaterial({ color: 0x00ff00 });

    // Objects array
    const objects = [];
    let selectedObject = null;

    // Add initial cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(cubeGeometry, materialPhong);
    cube.userData = { geometry: cubeGeometry, wireframe: new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), materialWireframe) };
    scene.add(cube);
    objects.push(cube);

    // Grid
    const grid = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    grid.position.y = -1;
    scene.add(grid);

    // Axis indicator
    const axes = new THREE.AxesHelper(1);
    axes.position.set(-2, 1, -2);
    scene.add(axes);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // OrbitControls
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
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.PAN,
        RIGHT: THREE.MOUSE.DOLLY
    };
    controls.keys = {
        LEFT: 'ArrowLeft',
        UP: 'ArrowUp',
        RIGHT: 'ArrowRight',
        BOTTOM: 'ArrowDown'
    };

    // TransformControls
    const transformControls = new THREE.TransformControls(camera, canvas);
    transformControls.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value; // Disable orbit during manipulation
    });
    scene.add(transformControls);

    // UI elements
    const rotateX = document.getElementById('rotateX');
    const rotateY = document.getElementById('rotateY');
    const rotateZ = document.getElementById('rotateZ');
    const scaleX = document.getElementById('scaleX');
    const scaleY = document.getElementById('scaleY');
    const scaleZ = document.getElementById('scaleZ');
    const modeWireframe = document.getElementById('modeWireframe');
    const modeFlat = document.getElementById('modeFlat');
    const modeShaded = document.getElementById('modeShaded');
    const modeMove = document.getElementById('modeMove');
    const modeRotate = document.getElementById('modeRotate');
    const modeScale = document.getElementById('modeScale');
    const addCube = document.getElementById('addCube');
    const addSphere = document.getElementById('addSphere');
    const resetScene = document.getElementById('resetScene');

    function updateSliders() {
        if (selectedObject) {
            rotateX.value = THREE.MathUtils.radToDeg(selectedObject.rotation.x);
            rotateY.value = THREE.MathUtils.radToDeg(selectedObject.rotation.y);
            rotateZ.value = THREE.MathUtils.radToDeg(selectedObject.rotation.z);
            scaleX.value = selectedObject.scale.x;
            scaleY.value = selectedObject.scale.y;
            scaleZ.value = selectedObject.scale.z;
        } else {
            rotateX.value = 0;
            rotateY.value = 0;
            rotateZ.value = 0;
            scaleX.value = 1;
            scaleY.value = 1;
            scaleZ.value = 1;
        }
    }

    function updateTransformControls() {
        if (selectedObject) {
            transformControls.attach(selectedObject);
        } else {
            transformControls.detach();
        }
    }

    function setRenderMode(mode) {
        console.log(`Switching to ${mode} mode`);
        objects.forEach(obj => {
            scene.remove(obj);
            scene.remove(obj.userData.wireframe);
            if (mode === 'wireframe') {
                scene.add(obj.userData.wireframe);
            } else {
                scene.add(obj);
                obj.material = mode === 'flat' ? materialFlat : materialPhong;
            }
        });
    }

    function selectObject(obj) {
        selectedObject = obj;
        updateSliders();
        updateTransformControls();
    }

    // Click to select objects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    canvas.addEventListener('click', (event) => {
        if (transformControls.dragging) return;
        mouse.x = ((event.clientX - canvas.getBoundingClientRect().left) / canvas.width) * 2 - 1;
        mouse.y = -((event.clientY - canvas.getBoundingClientRect().top) / canvas.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);
        if (intersects.length > 0) {
            selectObject(intersects[0].object);
        } else {
            selectObject(null);
        }
    });

    // UI event listeners
    rotateX.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.rotation.x = THREE.MathUtils.degToRad(parseFloat(rotateX.value));
            selectedObject.userData.wireframe.rotation.copy(selectedObject.rotation);
        }
    });
    rotateY.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.rotation.y = THREE.MathUtils.degToRad(parseFloat(rotateY.value));
            selectedObject.userData.wireframe.rotation.copy(selectedObject.rotation);
        }
    });
    rotateZ.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.rotation.z = THREE.MathUtils.degToRad(parseFloat(rotateZ.value));
            selectedObject.userData.wireframe.rotation.copy(selectedObject.rotation);
        }
    });
    scaleX.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.scale.x = parseFloat(scaleX.value);
            selectedObject.userData.wireframe.scale.copy(selectedObject.scale);
        }
    });
    scaleY.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.scale.y = parseFloat(scaleY.value);
            selectedObject.userData.wireframe.scale.copy(selectedObject.scale);
        }
    });
    scaleZ.addEventListener('input', () => {
        if (selectedObject) {
            selectedObject.scale.z = parseFloat(scaleZ.value);
            selectedObject.userData.wireframe.scale.copy(selectedObject.scale);
        }
    });

    modeWireframe.addEventListener('click', () => setRenderMode('wireframe'));
    modeFlat.addEventListener('click', () => setRenderMode('flat'));
    modeShaded.addEventListener('click', () => setRenderMode('shaded'));

    modeMove.addEventListener('click', () => transformControls.setMode('translate'));
    modeRotate.addEventListener('click', () => transformControls.setMode('rotate'));
    modeScale.addEventListener('click', () => transformControls.setMode('scale'));

    addCube.addEventListener('click', () => {
        const newCube = new THREE.Mesh(cubeGeometry, materialPhong);
        newCube.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        newCube.userData = { geometry: cubeGeometry, wireframe: new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), materialWireframe) };
        scene.add(newCube);
        objects.push(newCube);
        selectObject(newCube);
        setRenderMode(document.querySelector('.maya-controls button:active')?.id === 'modeWireframe' ? 'wireframe' : 
                     document.querySelector('.maya-controls button:active')?.id === 'modeFlat' ? 'flat' : 'shaded');
    });

    addSphere.addEventListener('click', () => {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const newSphere = new THREE.Mesh(sphereGeometry, materialPhong);
        newSphere.position.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
        newSphere.userData = { geometry: sphereGeometry, wireframe: new THREE.LineSegments(new THREE.EdgesGeometry(sphereGeometry), materialWireframe) };
        scene.add(newSphere);
        objects.push(newSphere);
        selectObject(newSphere);
        setRenderMode(document.querySelector('.maya-controls button:active')?.id === 'modeWireframe' ? 'wireframe' : 
                     document.querySelector('.maya-controls button:active')?.id === 'modeFlat' ? 'flat' : 'shaded');
    });

    resetScene.addEventListener('click', () => {
        objects.forEach(obj => {
            scene.remove(obj);
            scene.remove(obj.userData.wireframe);
        });
        objects.length = 0;
        const newCube = new THREE.Mesh(cubeGeometry, materialPhong);
        newCube.userData = { geometry: cubeGeometry, wireframe: new THREE.LineSegments(new THREE.EdgesGeometry(cubeGeometry), materialWireframe) };
        scene.add(newCube);
        objects.push(newCube);
        selectObject(newCube);
        setRenderMode('shaded');
        camera.position.set(0, 0, 5);
        controls.reset();
        updateSliders();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'w' || event.key === 'W') {
            transformControls.setMode('translate');
            modeMove.focus();
        } else if (event.key === 'e' || event.key === 'E') {
            transformControls.setMode('rotate');
            modeRotate.focus();
        } else if (event.key === 'r' || event.key === 'R') {
            transformControls.setMode('scale');
            modeScale.focus();
        }
    });

    // Gradient background
    function generateGradientCanvas() {
        const gradCanvas = document.createElement('canvas');
        gradCanvas.width = 256;
        gradCanvas.height = 256;
        const ctx = gradCanvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#333333');
        gradient.addColorStop(1, '#000000');
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
    selectObject(cube);

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = canvas.clientWidth;
        const newHeight = canvas.clientHeight;
        renderer.setSize(newWidth, newHeight);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
    });
}
