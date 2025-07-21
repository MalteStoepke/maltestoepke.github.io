function initPaint() {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let currentTool = 'brush';
    let currentColor = 'black';
    let currentLayer = 0; // 0 = background, 1 = foreground
    const layers = [
        { canvas: canvas, ctx: ctx }, // Background layer
        { canvas: document.createElement('canvas'), ctx: null } // Foreground layer
    ];

    // Initialize canvases
    layers[1].canvas.width = canvas.width;
    layers[1].canvas.height = canvas.height;
    layers[1].canvas.className = 'paint-canvas';
    layers[1].canvas.style.position = 'absolute';
    layers[1].canvas.style.left = canvas.offsetLeft + 'px';
    layers[1].canvas.style.top = canvas.offsetTop + 'px';
    canvas.parentNode.appendChild(layers[1].canvas);
    layers[1].ctx = layers[1].canvas.getContext('2d');
    layers[1].ctx.fillStyle = 'transparent';
    layers[1].ctx.fillRect(0, 0, layers[1].canvas.width, layers[1].canvas.height);

    // Clear background canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create simple layer toggle
    function createLayerToggle() {
        const toolsDiv = document.querySelector('.paint-tools');
        const toggle = document.createElement('select');
        toggle.id = 'layer-toggle';
        toggle.innerHTML = `
            <option value="0">Background Layer</option>
            <option value="1">Foreground Layer</option>
        `;
        toggle.onchange = () => switchLayer(toggle.value);
        toggle.style.marginLeft = '10px';
        toggle.style.padding = '2px';
        toggle.style.fontSize = '12px';
        toolsDiv.appendChild(toggle);
    }

    function switchLayer(layerIndex) {
        currentLayer = parseInt(layerIndex);
        layers[0].canvas.style.zIndex = currentLayer === 0 ? 2 : 1;
        layers[1].canvas.style.zIndex = currentLayer === 1 ? 2 : 1;
        layers[0].canvas.style.opacity = currentLayer === 0 ? 1 : 0.8;
        layers[1].canvas.style.opacity = currentLayer === 1 ? 1 : 0.8;
    }

    // Drawing logic with pressure sensitivity
    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        layers[currentLayer].ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        const rect = layers[currentLayer].canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure || 1; // Fallback to 1 if pressure not supported

        const ctx = layers[currentLayer].ctx;
        ctx.lineCap = 'round';
        ctx.lineWidth = 5 * pressure; // Adjust line width based on pressure

        if (currentTool === 'brush') {
            ctx.strokeStyle = currentColor;
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (currentTool === 'eraser') {
            ctx.strokeStyle = 'white';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    function setupCanvasListeners(targetCanvas) {
        targetCanvas.addEventListener('pointerdown', startPosition);
        targetCanvas.addEventListener('pointerup', endPosition);
        targetCanvas.addEventListener('pointermove', draw);
        targetCanvas.addEventListener('pointerleave', endPosition);
    }

    // Initialize listeners for both canvases
    setupCanvasListeners(layers[0].canvas);
    setupCanvasListeners(layers[1].canvas);

    // Tool and color controls
    window.setTool = function(tool) {
        currentTool = tool;
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${tool}-tool`).classList.add('active');
    };

    window.setColor = function(color) {
        currentColor = color;
    };

    window.clearCanvas = function() {
        const ctx = layers[currentLayer].ctx;
        ctx.fillStyle = currentLayer === 0 ? 'white' : 'transparent';
        ctx.fillRect(0, 0, layers[currentLayer].canvas.width, layers[currentLayer].canvas.height);
    };

    // Save artwork to portfolio and download as PNG
    window.saveArtwork = function() {
        // Merge layers into a temporary canvas
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(layers[0].canvas, 0, 0);
        tempCtx.drawImage(layers[1].canvas, 0, 0);

        // Save to portfolio
        const title = prompt('Enter a title for your artwork:');
        if (!title) return;

        const dataURL = tempCanvas.toDataURL('image/png');
        const artwork = { 
            title, 
            description: 'Created with Portfolio OS Paint', 
            image: dataURL, 
            date: new Date() 
        };
        
        const transaction = db.transaction(['artworks'], 'readwrite');
        const store = transaction.objectStore('artworks');
        store.add(artwork);

        transaction.oncomplete = () => {
            playSound('click-sound');
            alert('Artwork saved to your portfolio!');
            loadArtworks();
        };

        // Download as PNG
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = dataURL;
        link.click();
    };

    // Initialize layer toggle
    createLayerToggle();
}
