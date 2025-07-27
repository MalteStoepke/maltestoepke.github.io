function initPaint() {
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) {
        console.error('Canvas with id "paint-canvas" not found.');
        alert('Error: Paint canvas not found.');
        return;
    }
    const ctx = canvas.getContext('2d');

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
    let fontFamily = '"MS Sans Serif"';
    let isSelecting = false;
    let selection = null;
    let selectionData = null;

    // Initialize canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();

    // Save canvas state for undo/redo (limited to 3 levels as in Win98)
    function saveState() {
        undoStack.push(canvas.toDataURL());
        if (undoStack.length > 3) undoStack.shift();
        redoStack = [];
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

    // Convert hex to RGB
    function hexToRgb(hex) {
        if (hex.startsWith('#')) hex = hex.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 255 };
    }

    // Get pixel color
    function getPixelColor(x, y) {
        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    }

    // Flood fill algorithm
    function floodFill(x, y, targetColor, replacementColor) {
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
    }

    // Airbrush pattern
    function drawAirbrush(x, y) {
        const density = airbrushPattern === 'small' ? 10 : airbrushPattern === 'medium' ? 20 : 30;
        const radius = brushSize * 2;
        ctx.fillStyle = currentColor;
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * radius;
            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);
            ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
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
            floodFill(startX, startY, ctx.getImageData(Math.floor(startX), Math.floor(startY), 1, 1).data, hexToRgb(currentColor));
            return;
        }

        if (currentTool === 'select' || currentTool === 'free-select') {
            isSelecting = true;
            selection = { startX, startY, endX: startX, endY: startY };
            if (currentTool === 'select') {
                selectionData = ctx.getImageData(startX, startY, 1, 1);
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

        if (currentTool === 'select' || currentTool === 'free-select') {
            isSelecting = false;
            selection.endX = endX;
            selection.endY = endY;
            if (currentTool === 'select') {
                selectionData = ctx.getImageData(Math.min(startX, endX), Math.min(startY, endY), Math.abs(endX - startX), Math.abs(endY - startY));
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
        ctx.beginPath();
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.moveTo(points[0].x, points[0].y);
        ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
        if (fillStyle === 'fill') ctx.fill();
        ctx.stroke();
    }

    function drawPolygon() {
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
        };
    }

    function promptForText() {
        const text = prompt('Enter text to add:');
        if (text && textInputActive) {
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = currentColor;
            ctx.fillText(text, textX, textY);
            textInputActive = false;
            saveState();
        }
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
        if (['pencil', 'brush', 'eraser', 'fill', 'pick', 'magnifier', 'text', 'line', 'curve', 'rectangle', 'ellipse', 'rounded-rectangle', 'polygon', 'select', 'free-select'].includes(tool)) {
            currentTool = tool;
            textInputActive = false;
            points = [];
            selection = null;
            document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
            const toolButton = document.getElementById(`${tool}-tool`);
            if (toolButton) {
                toolButton.classList.add('active');
            }
            playSound('click-sound');
        }
    };

    window.setColor = function(color) {
        currentColor = color.startsWith('rgb') ? color : color;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
        const colorOption = document.querySelector(`.color-option[style*="background: ${color}"]`) || 
                           document.querySelector(`.color-option[style*="background: ${color.toLowerCase()}"]`);
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

    window.setFillStyle = function(style) {
        fillStyle = style;
        playSound('click-sound');
    };

    window.setAirbrushPattern = function(pattern) {
        airbrushPattern = pattern;
        playSound('click-sound');
    };

    window.setFont = function(size, family) {
        fontSize = parseInt(size);
        fontFamily = family;
        playSound('click-sound');
    };

    window.clearCanvas = function() {
        if (confirm('Clear the canvas? This cannot be undone.')) {
            ctx.fillStyle = secondaryColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            zoomLevel = 1;
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

        if (window.addArtwork) {
            const artwork = {
                id: `artwork_${Date.now()}`,
                title: title,
                dataURL: dataURL
            };
            window.addArtwork(artwork);
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

    window.imageAttributes = function(width, height, skewX, skewY, flipH, flipV, rotate) {
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
            playSound('click-sound');
        };
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
