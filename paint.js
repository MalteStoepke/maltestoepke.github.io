function initPaint() {
    console.log('Initializing Paint application...');
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) {
        console.error('Canvas with id "paint-canvas" not found.');
        alert('Error: Paint canvas not found. Please try reopening Paint.');
        return false;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context for canvas.');
        alert('Error: Unable to initialize canvas context.');
        return false;
    }

    // State variables
    let painting = false;
    let currentTool = 'pencil';
    let currentColor = 'black';
    let secondaryColor = 'white';
    let brushSize = 5;
    let startX, startY;
    let textInputActive = false;
    let textX, textY;
    let fillStyle = 'outline'; // outline or fill
    let points = []; // For polygon and curve tools
    let undoStack = [];
    let redoStack = [];
    let zoomLevel = 1;
    let airbrushPattern = 'medium';
    let fontSize = 16;
    let fontFamily = '"MS Sans Serif", Arial, sans-serif';
    let isSelecting = false;
    let selection = null;
    let selectionData = null;

    // Initialize canvas
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
    console.log('Canvas initialized with white background.');

    // Helper to safely play sound
    function safePlaySound(id) {
        if (typeof window.playSound === 'function') {
            window.playSound(id);
        } else {
            console.warn(`playSound function not found, skipping sound: ${id}`);
        }
    }

    // Save canvas state for undo/redo (limited to 3 levels as in Win98)
    function saveState() {
        undoStack.push(canvas.toDataURL());
        if (undoStack.length > 3) undoStack.shift();
        redoStack = [];
        console.log('Canvas state saved. Undo stack size:', undoStack.length);
    }

    // Restore canvas state
    function restoreState(dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            console.log('Canvas state restored.');
        };
        img.onerror = () => {
            console.error('Failed to restore canvas state from data URL.');
        };
    }

    // Convert hex or named color to RGB
    function colorToRgb(color) {
        if (color.startsWith('rgb')) {
            const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (matches) {
                return { r: parseInt(matches[1]), g: parseInt(matches[2]), b: parseInt(matches[3]), a: 255 };
            }
        }
        const ctxTemp = document.createElement('canvas').getContext('2d');
        ctxTemp.fillStyle = color;
        ctxTemp.fillRect(0, 0, 1, 1);
        const pixel = ctxTemp.getImageData(0, 0, 1, 1).data;
        return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3] };
    }

    // Get pixel color
    function getPixelColor(x, y) {
        try {
            const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        } catch (e) {
            console.error('Error getting pixel color:', e);
            return currentColor;
        }
    }

    // Flood fill algorithm
    function floodFill(x, y, targetColor, replacementColor) {
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            const target = [targetColor[0], targetColor[1], targetColor[2], targetColor[3]];
            const replacement = [replacementColor.r, replacementColor.g, replacementColor.b, replacementColor.a];
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

                pixels[pos] = replacement[0];
                pixels[pos + 1] = replacement[1];
                pixels[pos + 2] = replacement[2];
                pixels[pos + 3] = replacement[3];

                stack.push([px + 1, py]);
                stack.push([px - 1, py]);
                stack.push([px, py + 1]);
                stack.push([px, py - 1]);
            }

            ctx.putImageData(imageData, 0, 0);
            saveState();
            console.log('Flood fill applied at:', x, y);
        } catch (e) {
            console.error('Error in floodFill:', e);
        }
    }

    // Airbrush pattern
    function drawAirbrush(x, y) {
        const density = airbrushPattern === 'small' ? 10 : airbrushPattern === 'medium' ? 20 : 30;
        const radius = brushSize * 2;
        ctx.fillStyle = currentColor;
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * radius;
            const px = Math.floor(x + r * Math.cos(angle));
            const py = Math.floor(y + r * Math.sin(angle));
            if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
                ctx.fillRect(px, py, 1, 1);
            }
        }
    }

    // Draw preview for vector shapes
    function drawPreview() {
        if (!painting || !['line', 'rectangle', 'ellipse', 'rounded-rectangle'].includes(currentTool)) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        restoreState(undoStack[undoStack.length - 1]);
        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = brushSize;

        const width = selection.endX - startX;
        const height = selection.endY - startY;

        if (currentTool === 'line') {
            ctx.moveTo(startX, startY);
            ctx.lineTo(selection.endX, selection.endY);
            ctx.stroke();
        } else if (currentTool === 'rectangle') {
            if (fillStyle === 'fill') {
                ctx.fillRect(startX, startY, width, height);
            }
            ctx.strokeRect(startX, startY, width, height);
        } else if (currentTool === 'ellipse') {
            ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
            if (fillStyle === 'fill') ctx.fill();
            ctx.stroke();
        } else if (currentTool === 'rounded-rectangle') {
            const radius = Math.min(Math.abs(width), Math.abs(height)) / 4;
            ctx.beginPath();
            ctx.moveTo(startX + radius, startY);
            ctx.lineTo(startX + width - radius, startY);
            ctx.quadraticCurveTo(startX + width, startY, startX + width, startY + radius);
            ctx.lineTo(startX + width, startY + height - radius);
            ctx.quadraticCurveTo(startX + width, startY + height, startX + width - radius, startY + height);
            ctx.lineTo(startX + radius, startY + height);
            ctx.quadraticCurveTo(startX, startY + height, startX, startY + height - radius);
            ctx.lineTo(startX, startY + radius);
            ctx.quadraticCurveTo(startX, startY, startX + radius, startY);
            ctx.closePath();
            if (fillStyle === 'fill') ctx.fill();
            ctx.stroke();
        }
        ctx.beginPath();
    }

    // Drawing logic
    function startPosition(e) {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        startX = (e.clientX - rect.left) / zoomLevel;
        startY = (e.clientY - rect.top) / zoomLevel;
        console.log('Mouse down at:', startX, startY, 'Tool:', currentTool);

        if (currentTool === 'magnifier') {
            zoomCanvas(startX, startY);
            return;
        }

        if (currentTool === 'pick') {
            currentColor = getPixelColor(startX, startY);
            setColor(currentColor);
            return;
        }

        if (currentTool === 'text') {
            textX = startX;
            textY = startY;
            textInputActive = true;
            promptForText();
            return;
        }

        if (currentTool === 'fill') {
            floodFill(startX, startY, ctx.getImageData(Math.floor(startX), Math.floor(startY), 1, 1).data, colorToRgb(currentColor));
            return;
        }

        if (currentTool === 'select' || currentTool === 'free-select') {
            isSelecting = true;
            selection = { startX, startY, endX: startX, endY: startY };
            if (currentTool === 'select') {
                selectionData = null;
            }
            return;
        }

        if (currentTool === 'curve' || currentTool === 'polygon') {
            points.push({ x: startX, y: startY });
            if (currentTool === 'curve' && points.length === 3) {
                drawCurve();
                points = [];
                saveState();
            } else if (currentTool === 'polygon' && points.length > 2 && Math.abs(startX - points[0].x) < 5 && Math.abs(startY - points[0].y) < 5) {
                drawPolygon();
                points = [];
                saveState();
            } else {
                ctx.beginPath();
                ctx.arc(startX, startY, 2, 0, 2 * Math.PI);
                ctx.fillStyle = currentColor;
                ctx.fill();
            }
            return;
        }

        painting = true;
        saveState();
        if (['pencil', 'brush', 'eraser', 'airbrush'].includes(currentTool)) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            draw(e);
        } else {
            selection = { startX, startY, endX: startX, endY: startY };
        }
    }

    function endPosition(e) {
        if (!painting && !isSelecting) return;
        painting = false;
        const rect = canvas.getBoundingClientRect();
        const endX = (e.clientX - rect.left) / zoomLevel;
        const endY = (e.clientY - rect.top) / zoomLevel;
        console.log('Mouse up at:', endX, endY);

        if (currentTool === 'select' || currentTool === 'free-select') {
            isSelecting = false;
            selection.endX = endX;
            selection.endY = endY;
            if (currentTool === 'select') {
                try {
                    selectionData = ctx.getImageData(Math.min(startX, endX), Math.min(startY, endY), Math.abs(endX - startX), Math.abs(endY - startY));
                    console.log('Selection captured:', selection);
                } catch (e) {
                    console.error('Error capturing selection:', e);
                }
            }
            return;
        }

        if (['line', 'rectangle', 'ellipse', 'rounded-rectangle'].includes(currentTool)) {
            ctx.beginPath();
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.lineWidth = brushSize;

            const width = endX - startX;
            const height = endY - startY;

            if (currentTool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
            } else if (currentTool === 'rectangle') {
                if (fillStyle === 'fill') {
                    ctx.fillRect(startX, startY, width, height);
                }
                ctx.strokeRect(startX, startY, width, height);
            } else if (currentTool === 'ellipse') {
                ctx.ellipse(startX + width / 2, startY + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, 2 * Math.PI);
                if (fillStyle === 'fill') ctx.fill();
                ctx.stroke();
            } else if (currentTool === 'rounded-rectangle') {
                const radius = Math.min(Math.abs(width), Math.abs(height)) / 4;
                ctx.beginPath();
                ctx.moveTo(startX + radius, startY);
                ctx.lineTo(startX + width - radius, startY);
                ctx.quadraticCurveTo(startX + width, startY, startX + width, startY + radius);
                ctx.lineTo(startX + width, startY + height - radius);
                ctx.quadraticCurveTo(startX + width, startY + height, startX + width - radius, startY + height);
                ctx.lineTo(startX + radius, startY + height);
                ctx.quadraticCurveTo(startX, startY + height, startX, startY + height - radius);
                ctx.lineTo(startX, startY + radius);
                ctx.quadraticCurveTo(startX, startY, startX + radius, startY);
                ctx.closePath();
                if (fillStyle === 'fill') ctx.fill();
                ctx.stroke();
            }
            saveState();
        }
        ctx.beginPath();
        selection = null;
    }

    function draw(e) {
        if (!painting || !['pencil', 'brush', 'eraser', 'airbrush'].includes(currentTool)) {
            if (isSelecting && (currentTool === 'select' || currentTool === 'free-select')) {
                const rect = canvas.getBoundingClientRect();
                selection.endX = (e.clientX - rect.left) / zoomLevel;
                selection.endY = (e.clientY - rect.top) / zoomLevel;
                drawPreview();
            }
            return;
        }

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel;
        const y = (e.clientY - rect.top) / zoomLevel;

        ctx.lineCap = currentTool === 'pencil' ? 'square' : 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentTool === 'eraser' ? secondaryColor : currentColor;

        if (currentTool === 'airbrush') {
            drawAirbrush(x, y);
        } else {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    }

    function drawCurve() {
        try {
            ctx.beginPath();
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.moveTo(points[0].x, points[0].y);
            ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
            if (fillStyle === 'fill') ctx.fill();
            ctx.stroke();
            console.log('Curve drawn with points:', points);
        } catch (e) {
            console.error('Error drawing curve:', e);
        }
    }

    function drawPolygon() {
        try {
            ctx.beginPath();
            ctx.strokeStyle = currentColor;
            ctx.fillStyle = currentColor;
            ctx.lineWidth = brushSize;
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.closePath();
            if (fillStyle === 'fill') ctx.fill();
            ctx.stroke();
            console.log('Polygon drawn with points:', points);
        } catch (e) {
            console.error('Error drawing polygon:', e);
        }
    }

    function zoomCanvas(x, y) {
        const zoomLevels = [1, 2, 4, 8];
        const currentIndex = zoomLevels.indexOf(zoomLevel);
        zoomLevel = zoomLevels[(currentIndex + 1) % zoomLevels.length];
        const img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(zoomLevel, zoomLevel);
            ctx.drawImage(img, x - (x / zoomLevel), y - (y / zoomLevel));
            ctx.restore();
            saveState();
            console.log('Zoom level changed to:', zoomLevel);
        };
        img.onerror = () => {
            console.error('Error zooming canvas.');
        };
    }

    function promptForText() {
        const text = prompt('Enter text to add:');
        if (text && textInputActive) {
            try {
                ctx.font = `${fontSize}px ${fontFamily}`;
                ctx.fillStyle = currentColor;
                ctx.fillText(text, textX, textY);
                textInputActive = false;
                saveState();
                console.log('Text added:', text, 'at:', textX, textY);
            } catch (e) {
                console.error('Error adding text:', e);
            }
        }
        textInputActive = false;
    }

    // Clear existing listeners
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
        if (!['pencil', 'brush', 'eraser', 'fill', 'pick', 'magnifier', 'text', 'line', 'curve', 'rectangle', 'ellipse', 'rounded-rectangle', 'polygon', 'select', 'free-select'].includes(tool)) {
            console.warn('Invalid tool selected:', tool);
            return;
        }
        currentTool = tool;
        textInputActive = false;
        points = [];
        selection = null;
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        const toolButton = document.getElementById(`${tool}-tool`);
        if (toolButton) {
            toolButton.classList.add('active');
            console.log('Tool set to:', tool);
        } else {
            console.warn(`Tool button not found: ${tool}-tool`);
        }
        safePlaySound('click-sound');
    };

    window.setColor = function(color) {
        currentColor = color.startsWith('rgb') ? color : color;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        const colorOption = document.querySelector(`.color-option[style*="background: ${color}"], .color-option[style*="background: ${color.toLowerCase()}"]`);
        if (colorOption) {
            colorOption.classList.add('selected');
            console.log('Color set to:', color);
        } else {
            console.warn(`Color option not found for: ${color}`);
        }
        safePlaySound('click-sound');
    };

    window.setBrushSize = function(size) {
        brushSize = parseInt(size) || 5;
        ctx.lineWidth = brushSize;
        console.log('Brush size set to:', brushSize);
        safePlaySound('click-sound');
    };

    window.setFillStyle = function(style) {
        if (['outline', 'fill'].includes(style)) {
            fillStyle = style;
            console.log('Fill style set to:', style);
            safePlaySound('click-sound');
        }
    };

    window.setAirbrushPattern = function(pattern) {
        if (['small', 'medium', 'large'].includes(pattern)) {
            airbrushPattern = pattern;
            console.log('Airbrush pattern set to:', pattern);
            safePlaySound('click-sound');
        }
    };

    window.setFont = function(size, family) {
        fontSize = parseInt(size) || 16;
        fontFamily = family || '"MS Sans Serif", Arial, sans-serif';
        console.log('Font set to:', fontSize, fontFamily);
        safePlaySound('click-sound');
    };

    window.clearCanvas = function() {
        if (confirm('Clear the canvas? This cannot be undone.')) {
            ctx.fillStyle = secondaryColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            zoomLevel = 1;
            saveState();
            console.log('Canvas cleared.');
            safePlaySound('click-sound');
        }
    };

    window.saveArtwork = function() {
        const title = prompt('Enter a title for your artwork:');
        if (!title) {
            console.log('Save cancelled: No title provided.');
            return;
        }

        try {
            const dataURL = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `${title}.png`;
            link.href = dataURL;
            link.click();

            if (typeof window.addArtwork === 'function') {
                const artwork = {
                    id: `artwork_${Date.now()}`,
                    title: title,
                    dataURL: dataURL
                };
                window.addArtwork(artwork);
                console.log('Artwork saved:', title);
            } else {
                console.warn('addArtwork function not found; artwork saved locally only.');
            }
            safePlaySound('click-sound');
        } catch (e) {
            console.error('Error saving artwork:', e);
            alert('Error saving artwork.');
        }
    };

    window.undo = function() {
        if (undoStack.length > 1) {
            redoStack.push(undoStack.pop());
            restoreState(undoStack[undoStack.length - 1]);
            console.log('Undo performed. Undo stack size:', undoStack.length);
            safePlaySound('click-sound');
        }
    };

    window.redo = function() {
        if (redoStack.length > 0) {
            const state = redoStack.pop();
            undoStack.push(state);
            restoreState(state);
            console.log('Redo performed. Redo stack size:', redoStack.length);
            safePlaySound('click-sound');
        }
    };

    window.imageAttributes = function(width, height, skewX, skewY, flipH, flipV, rotate) {
        try {
            const img = new Image();
            img.src = canvas.toDataURL();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                if (flipH) ctx.scale(-1, 1);
                if (flipV) ctx.scale(1, -1);
                if (rotate) {
                    ctx.translate(canvas.width / 2, canvas.height / 2);
                    ctx.rotate(rotate * Math.PI / 180);
                    ctx.translate(-canvas.width / 2, -canvas.height / 2);
                }
                if (skewX || skewY) {
                    ctx.transform(1, skewY / 100, skewX / 100, 1, 0, 0);
                }
                ctx.drawImage(img, 0, 0, width || canvas.width, height || canvas.height);
                ctx.restore();
                saveState();
                console.log('Image attributes applied:', { width, height, skewX, skewY, flipH, flipV, rotate });
                safePlaySound('click-sound');
            };
            img.onerror = () => {
                console.error('Error applying image attributes.');
            };
        } catch (e) {
            console.error('Error in imageAttributes:', e);
        }
    };

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            window.undo();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            window.redo();
        }
    });

    // Initialize tool state
    window.setTool('pencil');
    window.setColor('black');
    console.log('Paint application initialized successfully.');
    return true;
}
