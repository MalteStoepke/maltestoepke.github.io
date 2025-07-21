
function initPaint() {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let currentTool = 'brush';
    let currentColor = 'black';
    let currentLayer = 0;
    let layers = [{ canvas: canvas, ctx: ctx }]; // Initial layer
    let layerCanvases = [canvas]; // Store canvas elements for layers

    // Layer management
    const maxLayers = 5;
    let layerContainer = null;

    // Initialize canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create layer controls
    function createLayerControls() {
        const toolsDiv = document.querySelector('.paint-tools');
        layerContainer = document.createElement('div');
        layerContainer.className = 'layer-controls';
        layerContainer.style.marginLeft = '10px';
        layerContainer.innerHTML = `
            <select id="layer-select" onchange="switchLayer(this.value)">
                <option value="0">Layer 1</option>
            </select>
            <button onclick="addLayer()">Add Layer</button>
            <button onclick="deleteLayer()">Delete Layer</button>
            <button onclick="mergeLayers()">Merge Down</button>
        `;
        toolsDiv.appendChild(layerContainer);
    }

    function addLayer() {
        if (layers.length >= maxLayers) {
            alert('Maximum layer limit reached!');
            playSound('error-sound');
            return;
        }
        const newCanvas = document.createElement('canvas');
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCanvas.className = 'paint-canvas';
        newCanvas.style.position = 'absolute';
        newCanvas.style.left = canvas.offsetLeft + 'px';
        newCanvas.style.top = canvas.offsetTop + 'px';
        canvas.parentNode.appendChild(newCanvas);
        const newCtx = newCanvas.getContext('2d');
        newCtx.fillStyle = 'transparent';
        newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height);
        layers.push({ canvas: newCanvas, ctx: newCtx });
        layerCanvases.push(newCanvas);
        currentLayer = layers.length - 1;
        updateLayerSelect();
        setupCanvasListeners(newCanvas);
        switchLayer(currentLayer);
    }

    function deleteLayer() {
        if (layers.length <= 1) {
            alert('Cannot delete the last layer!');
            playSound('error-sound');
            return;
        }
        layers[currentLayer].canvas.remove();
        layers.splice(currentLayer, 1);
        layerCanvases.splice(currentLayer, 1);
        currentLayer = Math.min(currentLayer, layers.length - 1);
        updateLayerSelect();
        switchLayer(currentLayer);
    }

    function mergeLayers() {
        if (currentLayer === 0) {
            alert('Cannot merge the bottom layer!');
            playSound('error-sound');
            return;
        }
        const lowerCtx = layers[currentLayer - 1].ctx;
        lowerCtx.drawImage(layers[currentLayer].canvas, 0, 0);
        deleteLayer();
    }

    function updateLayerSelect() {
        const select = document.getElementById('layer-select');
        select.innerHTML = '';
        layers.forEach((_, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.text = `Layer ${i + 1}`;
            select.appendChild(option);
        });
        select.value = currentLayer;
    }

    function switchLayer(layerIndex) {
        currentLayer = parseInt(layerIndex);
        ctx = layers[currentLayer].ctx;
        canvas = layers[currentLayer].canvas;
        layerCanvases.forEach((c, i) => {
            c.style.zIndex = i === currentLayer ? 2 : 1;
            c.style.opacity = i === currentLayer ? 1 : 0.7;
        });
    }

    // Drawing logic with pressure sensitivity
    function startPosition(e) {
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure || 1; // Fallback to 1 if pressure not supported

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

    // Initialize listeners for the base canvas
    setupCanvasListeners(canvas);

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
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Save artwork to portfolio and download as PNG
    window.saveArtwork = function() {
        // Merge all layers into a single canvas for saving
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        layers.forEach(layer => {
            tempCtx.drawImage(layer.canvas, 0, 0);
        });

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

    // Initialize layer controls
    createLayerControls();
}
