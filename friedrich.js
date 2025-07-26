function waitForGlobals(callback, maxAttempts = 30, interval = 100) {
    let attempts = 0;
    function checkGlobals() {
        if (
            window.openWindow &&
            window.minimizeWindow &&
            window.maximizeWindow &&
            window.closeWindow &&
            window.startDrag &&
            window.bringToFront &&
            window.playSound
        ) {
            console.log('All required global functions loaded.');
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
            console.log(`Waiting for global functions, attempt ${attempts}/${maxAttempts}`);
            setTimeout(checkGlobals, interval);
        } else {
            console.error('Required global functions not loaded after max attempts.');
            window.playSound && window.playSound('error-sound');
            alert('Error: Portfolio OS not fully loaded. Please refresh the page.');
        }
    }
    checkGlobals();
}

function openFriedrich() {
    console.log('Attempting to open Friedrich window...');
    waitForGlobals(() => {
        // Remove existing window
        const existingWindow = document.getElementById('friedrich-window');
        if (existingWindow) {
            console.log('Removing existing Friedrich window.');
            existingWindow.remove();
        }

        try {
            // Create the window
            const windowDiv = document.createElement('div');
            windowDiv.className = 'window';
            windowDiv.id = 'friedrich-window';
            windowDiv.style.width = '700px';
            windowDiv.style.height = '500px';
            windowDiv.style.top = '10%';
            windowDiv.style.left = '10%';
            windowDiv.innerHTML = `
                <style>
                    .title-bar-text.y2k, .content-title.y2k {
                        display: inline-block;
                        font-weight: bold;
                        text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040;
                        animation: y2kPulse 2s infinite ease-in-out, neonFlicker 0.1s infinite;
                    }
                    @keyframes y2kPulse {
                        0% { transform: scale(1); color: #ffffff; text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040; }
                        50% { transform: scale(1.05); color: #40c0ff; text-shadow: 2px 2px 4px #000, 0 0 15px #40c0ff; }
                        100% { transform: scale(1); color: #ffffff; text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040; }
                    }
                    @keyframes neonFlicker {
                        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
                        20%, 24%, 55% { opacity: 0.8; }
                    }
                    .ie-toolbar button:hover {
                        background: #e0e0e0;
                        border: 1px inset #c0c0c0;
                    }
                    .ie-content.y2k {
                        background: linear-gradient(135deg, #e0e0e0, #ffffff);
                        border: 2px inset #ffffff;
                        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                        padding: 10px;
                        overflow-y: auto;
                        height: calc(100% - 60px);
                    }
                    .content-card {
                        background: #f0f0f0;
                        border: 2px outset #c0c0c0;
                        padding: 10px;
                        margin-bottom: 10px;
                        border-radius: 4px;
                        animation: fadeIn 1s ease-out;
                    }
                    .content-card h2 {
                        font-size: 72px;
                        text-align: center;
                        margin: 0 auto 15px auto;
                        font-family: "MS Sans Serif", Arial, sans-serif;
                        width: fit-content;
                    }
                    .content-card .description p {
                        font-size: 12px;
                        line-height: 1.6;
                        color: #000;
                        font-family: "MS Sans Serif", Arial, sans-serif;
                        background: linear-gradient(to right, black, #444);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 5px 0;
                        white-space: pre-wrap;
                        display: none;
                    }
                    .content-card .description p.visible {
                        display: block;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .artwork-gallery.y2k {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                        gap: 10px;
                        margin-top: 10px;
                    }
                    .artwork-gallery img {
                        width: 100%;
                        height: 150px;
                        object-fit: cover;
                        border: 2px outset #c0c0c0;
                        cursor: pointer;
                        animation: imageFadeIn 1s ease-out;
                        animation-delay: calc(var(--index) * 0.2s);
                        position: relative;
                    }
                    .artwork-gallery img:hover {
                        transform: scale(1.05);
                        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                        transition: transform 0.2s, box-shadow 0.2s;
                    }
                    .artwork-gallery img::after {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(rgba(255,255,255,0.1) 50%, transparent 50%) 0 0 / 100% 2px;
                        opacity: 0.3;
                        pointer-events: none;
                    }
                    @keyframes imageFadeIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .typewriter-cursor::after {
                        content: '|';
                        animation: blink 0.75s step-end infinite;
                        margin-left: 2px;
                    }
                    @keyframes blink {
                        50% { opacity: 0; }
                    }
                </style>
                <div class="title-bar">
                    <div class="title-bar-text y2k">Friedrich - Internet Explorer</div>
                    <div class="title-bar-controls">
                        <button aria-label="Minimize" onclick="minimizeWindow('friedrich-window')"></button>
                        <button aria-label="Maximize" onclick="maximizeWindow('friedrich-window')"></button>
                        <button aria-label="Close" onclick="closeWindow('friedrich-window')"></button>
                    </div>
                </div>
                <div class="ie-toolbar">
                    <button onclick="showArtifactMenu(this.getBoundingClientRect().left, this.getBoundingClientRect().bottom)">Back</button>
                    <button disabled>Forward</button>
                    <button onclick="showClippyOverlay()">Stop</button>
                    <button onclick="refreshFriedrich()">Refresh</button>
                    <button onclick="openInternetExplorer()">Home</button>
                </div>
                <div class="ie-address-bar">
                    <label>Address:</label>
                    <input type="text" id="friedrich-url" value="portfolio://friedrich" readonly>
                </div>
                <div class="ie-content y2k" id="friedrich-content">
                    <div class="content-card">
                        <h2 class="content-title y2k">Friedrich</h2>
                        <div class="description" id="friedrich-description">
                            <p id="para-0"></p>
                            <p id="para-1"></p>
                            <p id="para-2"></p>
                        </div>
                    </div>
                    <div class="artwork-gallery y2k" id="friedrich-gallery"></div>
                </div>
            `;
            document.body.appendChild(windowDiv);

            // Add dragging functionality
            const titleBar = windowDiv.querySelector('.title-bar');
            titleBar.addEventListener('mousedown', (e) => {
                if (!e.target.closest('.title-bar-controls')) {
                    window.startDrag(e, windowDiv);
                    window.bringToFront('friedrich-window');
                }
            });
            windowDiv.addEventListener('mousedown', () => window.bringToFront('friedrich-window'));

            // Typewriter animation for description
            const descriptionDiv = document.getElementById('friedrich-description');
            const paragraphs = descriptionDiv.querySelectorAll('p');
            const fullText = [
                "Years on the streets have left their mark—his face weathered by the cold harbor wind, beard unkempt, eyes tired yet sharp. His posture is strong but weary, shaped by a life of labor and loss. St. Pauli’s raw, unfiltered energy defines him; he's a product of its harsh realities but also its deep camaraderie—a man still clinging to the salt and spirit of the sea.",
                "This project began as an assignment for my Character Design class. I developed a complete concept for this character, starting with several iterations of 2D concept sketches before sculpting him in ZBrush. Later, I retopologized the character in Autodesk Maya, textured it using Substance 3D Painter, and created blendshapes to showcase various emotions. Additionally, I built an interactive scene in Unreal Engine 5.5, allowing viewers to switch between his emotions at the press of a button.",
                "Overall, this was an incredibly exciting project through which I learned many new skills."
            ];

            paragraphs.forEach(p => p.style.display = 'none');
            let currentParaIndex = 0;
            let currentCharIndex = 0;

            function typeNextCharacter() {
                if (currentParaIndex >= paragraphs.length) {
                    const lastPara = paragraphs[paragraphs.length - 1];
                    if (lastPara) lastPara.classList.remove('typewriter-cursor');
                    console.log('Typewriter animation completed');
                    return;
                }

                const currentPara = paragraphs[currentParaIndex];
                if (!currentPara.classList.contains('visible')) {
                    currentPara.style.display = 'block';
                    currentPara.classList.add('visible', 'typewriter-cursor');
                }

                const text = fullText[currentParaIndex];
                if (currentCharIndex < text.length) {
                    currentPara.textContent = text.slice(0, currentCharIndex + 1);
                    currentCharIndex++;
                    setTimeout(typeNextCharacter, window.innerWidth < 600 ?
