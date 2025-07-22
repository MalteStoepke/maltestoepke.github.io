function initPaint() {
    // Get canvas and context
    const canvas = document.getElementById('paint-canvas');
    if (!canvas) {
        console.error('Canvas with id "paint-canvas" not found.');
        return;
    }
    const ctx = canvas.getContext('2d');

    // State variables
    let painting = false;
    let currentTool = 'brush';
    let currentColor = 'black';
    let textInputActive = false;
    let textX, textY;

    // Initialize canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing logic
    function startPosition(e) {
        e.preventDefault();
        if (currentTool === 'text') {
            const rect = canvas.getBoundingClientRect();
            textX = e.clientX - rect.left;
            textY = e.clientY - rect.top;
            textInputActive = true;
            promptForText();
            return;
        }
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
    }

    function draw(e) {
        if (!painting || currentTool === 'text') return;

        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
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
        }
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
        if (['brush', 'eraser', 'text'].includes(tool)) {
            currentTool = tool;
            textInputActive = false;
            document.querySelectorAll('.tool-button').forEach(btn => {
                btn.classList.remove('active');
            });
            const toolButton = document.getElementById(`${tool}-tool`);
            if (toolButton) {
                toolButton.classList.add('active');
            }
        }
    };

    window.setColor = function(color) {
        currentColor = color;
        ctx.strokeStyle = color; // Update stroke for brush/eraser
        ctx.fillStyle = color;   // Update fill for text
    };

    window.clearCanvas = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    window.saveArtwork = function() {
        const title = prompt('Enter a title for your artwork:');
        if (!title) return;

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = dataURL;
        link.click();
    };

    // Initialize tool state
    window.setTool('brush'); // Set brush as default
}
