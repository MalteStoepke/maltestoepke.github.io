function initPaint() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) {
        console.error('Canvas with id "paint-canvas" not found.');
        return;
    }
    const ctx = canvas.getContext('2d');

    // State variables
    let painting = false;
    let currentTool = 'pencil';
    let currentColor = 'black';
    let brushSize = 5;
    let startX, startY;
    let textInputActive = false;
    let textX, textY;
    let fillEnabled = false;
    let undoStack = [];
    let redoStack = [];

    // Initialize canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();

    // Save canvas state for undo/redo
    function saveState() {
        undoStack.push(canvas.toDataURL());
        if (undoStack.length > 50) undoStack.shift(); // Limit stack size
        redoStack = []; // Clear redo stack on new action
    }

    // Restore canvas state
    function restoreState(dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }

    // Drawing logic
    function startPosition(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;

        if (currentTool === 'text') {
            textX = startX;
            textY = startY;
            textInputActive = true;
            promptForText();
            return;
        }

        if (currentTool === 'fill') {
            floodFill(startX, startY, ctx.getImageData(startX, startY, 1, 1).data, hexToRgb(currentColor));
            saveState();
            return;
        }

        painting = true;
        if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'eraser') {
            draw(e);
        } else {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    }

    function endPosition(e) {
        if (!painting) return;
        painting = false;
        ctx.beginPath();

        const rect = canvas.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        if (currentTool === 'line') {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        } else if (currentTool === 'rectangle') {
            const width = endX - startX;
            const height = endY - startY;
            ctx.beginPath();
            if (fillEnabled) {
                ctx.fillStyle = currentColor;
                ctx.fillRect(startX, startY, width, height);
            }
            ctx.strokeStyle = currentColor;
            ctx.strokeRect(startX, startY, width, height);
        } else if (currentTool === 'ellipse') {
            const width = endX - startX;
            const height = endY - startY;
            ctx.beginPath();
            ctx.ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2), 0, 0, 2 * Math.PI);
            if (fillEnabled) {
                ctx.fillStyle = currentColor;
                ctx.fill();
            }
            ctx.strokeStyle = currentColor;
            ctx.stroke();
        }
        saveState();
    }

    function draw(e) {
        if (!painting || !['pencil', 'brush', 'eraser'].includes(currentTool)) return;

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentTool === 'eraser' ? 'white' : currentColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // Text input
    function promptForText() {
        const text = prompt('Enter text to add:');
        if (text && textInputActive) {
            ctx.font = '16px "MS Sans Serif", Arial, sans-serif';
            ctx.fillStyle = currentColor;
            ctx.fillText(text, textX, textY);
            textInputActive = false;
            saveState();
        }
    }

    // Flood fill algorithm
    function floodFill(x, y, targetColor, replacementColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const target = [targetColor[0], targetColor[1], targetColor[2], targetColor[3]];
        const stack = [[Math.floor(x), Math.floor(y)]];
        const width = canvas.width;

        function matchColor(pixelPos) {
            return pixels[pixelPos] === target[0] &&
                   pixels[pixelPos + 1] === target[1] &&
                   pixels[pixelPos + 2] === target[2] &&
                   pixels[pixelPos + 3] === target[3];
        }

        while (stack.length) {
            const [px, py] = stack.pop();
            const pos = (py * width + px) * 4;

            if (px < 0 || px >= canvas.width || py < 0 || py >= canvas.height || !matchColor(pos)) {
                continue;
            }

            pixels[pos] = replacementColor.r;
            pixels[pos + 1] = replacementColor.g;
            pixels[pos + 2] = replacementColor.b;
            pixels[pos + 3] = replacementColor.a;

            stack.push([px + 1, py]);
            stack.push([px - 1, py]);
            stack.push([px, py + 1]);
            stack.push([px, py - 1]);
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // Convert hex to RGB
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b, a: 255 };
    }

    // Clear existing listeners to prevent duplicates
    canvas.removeEventListener('mousedown', startPosition);
    canvas.removeEventListener('mouseup', endPosition);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseleave', endPosition);

    // Set up mouse event listeners
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endPosition);

    // Tool and color controls
    window.setTool = function(tool) {
        if (['pencil', 'brush', 'eraser', 'fill', 'line', 'rectangle', 'ellipse', 'text'].includes(tool)) {
            currentTool = tool;
            textInputActive = false;
            document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
            const toolButton = document.getElementById(`${tool}-tool`);
            if (toolButton) {
                toolButton.classList.add('active');
            }
            playSound('click-sound');
        }
    };

    window.setColor = function(color) {
        currentColor = color;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        const colorOption = document.querySelector(`.color-option[style*="background: ${color}"]`);
        if (colorOption) {
            colorOption.classList.add('selected');
        }
        playSound('click-sound');
    };

    window.setBrushSize = function(size) {
        brushSize = parseInt(size);
        ctx.lineWidth = brushSize;
        playSound('click-sound');
    };

    window.clearCanvas = function() {
        if (confirm('Clear the canvas? This cannot be undone.')) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
            playSound('click-sound');
        }
    };

    window.saveArtwork = function() {
        const title = prompt('Enter a title for your artwork:');
        if (!title) return;

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = dataURL;
        link.click();

        if (currentUser === correctUsername) {
            const artwork = {
                id: `artwork_${Date.now()}`,
                title: title,
                dataURL: dataURL
            };
            addArtwork(artwork);

            const icon = document.createElement('div');
            icon.className = 'icon';
            icon.dataset.id = artwork.id;
            icon.dataset.type = 'artwork';
            icon.style.left = '20px';
            icon.style.top = `${20 + Object.keys(openWindows).length * 80}px`;
            icon.innerHTML = `
                <img src="${dataURL}" alt="${title}">
                <p>${title}</p>
            `;
            icon.ondblclick = () => {
                const winId = `artwork-window-${artwork.id}`;
                if (!document.getElementById(winId)) {
                    const win = document.createElement('div');
                    win.className = 'window';
                    win.id = winId;
                    win.style.width = '400px';
                    win.style.height = '300px';
                    win.innerHTML = `
                        <div class="title-bar">
                            <div class="title-bar-text">${title} - Paint</div>
                            <div class="title-bar-controls">
                                <button aria-label="Minimize" onclick="minimizeWindow('${winId}')"></button>
                                <button aria-label="Maximize" onclick="maximizeWindow('${winId}')"></button>
                                <button aria-label="Close" onclick="closeWindow('${winId}')"></button>
                            </div>
                        </div>
                        <div class="window-body">
                            <img src="${dataURL}" style="max-width: 100%; max-height: 100%;">
                        </div>
                    `;
                    document.body.appendChild(win);
                }
                openWindow(winId);
            };
            desktop.appendChild(icon);
            setupIconInteraction();
        }
        playSound('click-sound');
    };

    window.undo = function() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            restoreState(undoStack[undoStack.length - 1]);
            playSound('click-sound');
        }
    };

    window.redo = function() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            undoStack.push(state);
            restoreState(state);
            playSound('click-sound');
        }
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            undo();
        } else if (e.ctrlKey && e.key === 'y') {
            redo();
        }
    });

    // Initialize tool state
    window.setTool('pencil');
    window.setColor('black');
}
