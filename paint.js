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
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 255 };
    }

    // Get pixel color
    function getPixelColor(x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
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
            ctx.fillRect(px, py, 1, 1);
        }
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
            floodFill(startX, startY, ctx.getImageData(startX, startY, 1, 1).data, hexToRgb(currentColor));
            saveState();
            return;
        }

        if (currentTool === 'select' || currentTool === 'free-select') {
            isSelecting = true;
            selection = { startX, startY, endX: startX, endY: startY };
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
            }
            return;
        }

        painting = true;
        if (['pencil', 'brush', 'eraser', 'airbrush'].includes(currentTool)) {
            draw(e);
        } else {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    }

    function endPosition(e) {
        if (!painting && !isSelecting) return;
        painting = false;
        isSelecting = false;
        const rect = canvas.getBoundingClientRect();
        const endX = (e.clientX - rect.left) / zoomLevel;
        const endY = (e.clientY - rect.top) / zoomLevel;

        if (currentTool === 'select' || currentTool === 'free-select') {
            selection.endX = endX;
            selection.endY = endY;
            saveState();
            return;
        }

        if (['line', 'rectangle', 'ellipse', 'rounded-rectangle'].includes(currentTool)) {
            ctx.beginPath();
            if (currentTool === 'line') {
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
            } else if (currentTool === 'rectangle') {
                const width = endX - startX;
                const height = endY - startY;
                if (fillStyle === 'fill') {
                    ctx.fillStyle = currentColor;
                    ctx.fillRect(startX, startY, width, height);
                }
                ctx.strokeStyle = currentColor;
                ctx.strokeRect(startX, startY, width, height);
            } else if (currentTool === 'ellipse') {
                const width = endX - startX;
                const height = endY - startY;
                ctx.ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2), 0, 0, 2 * Math.PI);
                if (fillStyle === 'fill') {
                    ctx.fillStyle = currentColor;
                    ctx.fill();
                }
                ctx.strokeStyle = currentColor;
                ctx.stroke();
            } else if (currentTool === 'rounded-rectangle') {
                const width = endX - startX;
                const height = endY - startY;
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
                if (fillStyle === 'fill') {
                    ctx.fillStyle = currentColor;
                    ctx.fill();
                }
                ctx.strokeStyle = currentColor;
                ctx.stroke();
            }
            saveState();
        }
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting || !['pencil', 'brush', 'eraser', 'airbrush'].includes(currentTool)) return;

        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoomLevel;
        const y = (e.clientY - rect.top) / zoomLevel;

        ctx.lineCap = currentTool === 'pencil' ? 'square' : 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = currentTool === 'eraser' ? 'white' : currentColor;

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
        ctx.moveTo(points[0].x, points[0].y);
        ctx.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
        if (fillStyle === 'fill') {
            ctx.fillStyle = currentColor;
            ctx.fill();
        }
        ctx.stroke
