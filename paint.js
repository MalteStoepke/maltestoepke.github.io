function initPaint() {
    const canvas = document.getElementById('paint-canvas');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let currentColor = 'black';

    // Initialize canvas with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing logic
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

        // Prevent default to avoid issues with touch/pointer events
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor; // Ensure currentColor is used
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // Remove any existing listeners to prevent duplicates
    canvas.removeEventListener('mousedown', startPosition);
    canvas.removeEventListener('mouseup', endPosition);
    canvas.removeEventListener('mousemove', draw);
    canvas.removeEventListener('mouseleave', endPosition);

    // Set up mouse event listeners
    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endPosition);

    // Color selection
    window.setColor = function(color) {
        currentColor = color;
        ctx.strokeStyle = color; // Update context immediately
    };

    // Save as PNG
    window.saveArtwork = function() {
        const title = prompt('Enter a title for your artwork:');
        if (!title) return;

        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = dataURL;
        link.click();
    };
}
