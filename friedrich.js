function waitForGlobals(callback, maxAttempts = 20, interval = 100) {
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
            callback();
        } else if (attempts < maxAttempts) {
            attempts++;
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
    waitForGlobals(() => {
        // Remove existing window
        const existingWindow = document.getElementById('friedrich-window');
        if (existingWindow) {
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
                    .title-bar-text.y2k {
                        display: inline-block;
                        font-weight: bold;
                        text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040;
                        animation: y2kPulse 2s infinite ease-in-out;
                    }
                    @keyframes y2kPulse {
                        0% { transform: scale(1); color: #ffffff; text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040; }
                        50% { transform: scale(1.05); color: #40c0ff; text-shadow: 2px 2px 4px #000, 0 0 15px #40c0ff; }
                        100% { transform: scale(1); color: #ffffff; text-shadow: 2px 2px 4px #000, 0 0 10px #ff4040; }
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
                        color: #000080;
                        font-size: 36px;
                        text-align: center;
                        margin-bottom: 10px;
                        text-shadow: 1px 1px 2px #ffffff, 0 0 14px #ff4040;
                        animation: titleBounce 1.5s infinite ease-in-out;
                        font-family: "MS Sans Serif", Arial, sans-serif;
                        background: linear-gradient(to right, #000080, #1084d0);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    @keyframes titleBounce {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                        100% { transform: translateY(0); }
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
                    .clippy-bubble {
                        position: fixed;
                        background: #ffffe1;
                        border: 2px solid #000;
                        border-radius: 8px;
                        padding: 10px;
                        max-width: 300px;
                        z-index: 10002;
                        font-family: "MS Sans Serif", Arial, sans-serif;
                        font-size: 12px;
                        box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                    }
                    .clippy-bubble p {
                        margin: 0 0 10px 0;
                    }
                    .clippy-buttons {
                        display: flex;
                        gap: 8px;
                        justify-content: center;
                    }
                    .clippy-buttons button {
                        background: #c0c0c0;
                        border: 2px outset #ffffff;
                        padding: 4px 8px;
                        cursor: pointer;
                        font-size: 12px;
                    }
                    .clippy-buttons button:hover {
                        background: #e0e0e0;
                        border: 2px inset #c0c0c0;
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
                    <button onclick="triggerClippyEasterEgg()">Stop</button>
                    <button onclick="refreshFriedrich()">Refresh</button>
                    <button onclick="openInternetExplorer()">Home</button>
                </div>
                <div class="ie-address-bar">
                    <label>Address:</label>
                    <input type="text" id="friedrich-url" value="portfolio://friedrich" readonly>
                </div>
                <div class="ie-content y2k" id="friedrich-content">
                    <div class="content-card">
                        <h2>Friedrich</h2>
                        <div class="description" id="friedrich-description">
                            <p>Years on the streets have left their mark—his face weathered by the cold harbor wind, beard unkempt, eyes tired yet sharp. His posture is strong but weary, shaped by a life of labor and loss. St. Pauli’s raw, unfiltered energy defines him; he's a product of its harsh realities but also its deep camaraderie—a man still clinging to the salt and spirit of the sea.</p>
                            <p>This project began as an assignment for my Character Design class. I developed a complete concept for this character, starting with several iterations of 2D concept sketches before sculpting him in ZBrush. Later, I retopologized the character in Autodesk Maya, textured it using Substance 3D Painter, and created blendshapes to showcase various emotions. Additionally, I built an interactive scene in Unreal Engine 5.5, allowing viewers to switch between his emotions at the press of a button.</p>
                            <p>Overall, this was an incredibly exciting project through which I learned many new skills.</p>
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
            paragraphs.forEach(p => p.style.display = 'none'); // Hide initially
            let currentParaIndex = 0;
            let currentCharIndex = 0;
            let isTyping = false;

            function typeNextCharacter() {
                if (currentParaIndex >= paragraphs.length) {
                    // Remove cursor after typing is complete
                    const lastPara = paragraphs[paragraphs.length - 1];
                    if (lastPara) lastPara.classList.remove('typewriter-cursor');
                    return;
                }

                const currentPara = paragraphs[currentParaIndex];
                if (!currentPara.classList.contains('visible')) {
                    currentPara.style.display = 'block';
                    currentPara.classList.add('visible');
                }

                if (!isTyping) {
                    currentPara.classList.add('typewriter-cursor');
                    isTyping = true;
                }

                const fullText = currentPara.textContent;
                if (currentCharIndex < fullText.length) {
                    currentPara.textContent = fullText.slice(0, currentCharIndex + 1);
                    currentCharIndex++;
                    setTimeout(typeNextCharacter, 30);
                } else {
                    currentPara.classList.remove('typewriter-cursor');
                    currentPara.textContent = fullText;
                    currentParaIndex++;
                    currentCharIndex = 0;
                    isTyping = false;
                    setTimeout(typeNextCharacter, 500); // Pause before next paragraph
                }
            }

            // Start typing after a short delay
            setTimeout(typeNextCharacter, 1000);

            // Add images to gallery
            const gallery = document.getElementById('friedrich-gallery');
            const imageUrls = [
                'https://cdna.artstation.com/p/assets/images/images/085/985/342/large/malte-friedrich-artsy-frontal-neutral.jpg?1742133400',
                'https://cdna.artstation.com/p/assets/images/images/085/983/778/large/malte-friedrich-artsy-angry.jpg?1742129659',
                'https://cdnb.artstation.com/p/assets/images/images/085/983/811/large/malte-friedrich-artsy2-upset.jpg?1742129722',
                'https://cdnb.artstation.com/p/assets/images/images/085/985/349/large/malte-friedrich-artsy-smile.jpg?1742133269',
                'https://cdna.artstation.com/p/assets/images/images/085/985/346/large/malte-friedrich-artsy-huh.jpg?1742133262',
                'https://cdna.artstation.com/p/assets/images/images/085/973/620/large/malte-friedrich-frontal-sx.jpg?1742093456',
                'https://cdna.artstation.com/p/assets/images/images/085/974/116/large/malte-friedrich-frontal-whistle.jpg?1742095826',
                'https://cdnb.artstation.com/p/assets/images/images/085/987/115/large/malte-friedrich-notexture-frontal.jpg?1742137375',
                'https://cdna.artstation.com/p/assets/images/images/085/987/120/large/malte-friedrich-notexture-angry-side.jpg?1742137382',
                'https://cdnb.artstation.com/p/assets/images/images/085/992/475/large/malte-wireframe-frontal.jpg?1742147824',
                'https://cdna.artstation.com/p/assets/images/images/085/992/472/large/malte-wireframe-side.jpg?1742147816',
                'https://cdnb.artstation.com/p/assets/images/images/086/017/925/large/malte-uv-1.jpg?1742215120',
                'https://cdnb.artstation.com/p/assets/images/images/086/017/913/large/malte-uv-2.jpg?1742215103',
                'https://cdna.artstation.com/p/assets/images/images/085/973/646/large/malte-character-design-presentation-2.jpg?1742093660'
            ];

            imageUrls.forEach((url, index) => {
                const img = document.createElement('img');
                img.src = url;
                img.alt = `Friedrich artwork ${index + 1}`;
                img.className = 'artwork-image';
                img.style.setProperty('--index', index);
                img.onclick = () => {
                    window.playSound('click-sound');
                    const existingLargeView = document.getElementById('friedrich-large-view');
                    if (existingLargeView) {
                        existingLargeView.remove();
                    }

                    const largeView = document.createElement('div');
                    largeView.className = 'window';
                    largeView.id = 'friedrich-large-view';
                    largeView.style.width = '800px';
                    largeView.style.height = '600px';
                    largeView.style.top = '5%';
                    largeView.style.left = '5%';
                    largeView.innerHTML = `
                        <div class="title-bar">
                            <div class="title-bar-text y2k">Friedrich - Full View</div>
                            <div class="title-bar-controls">
                                <button aria-label="Minimize" onclick="minimizeWindow('friedrich-large-view')"></button>
                                <button aria-label="Maximize" onclick="maximizeWindow('friedrich-large-view')"></button>
                                <button aria-label="Close" onclick="closeWindow('friedrich-large-view')"></button>
                            </div>
                        </div>
                        <div class="window-body" style="text-align: center; padding: 0;">
                            <img src="${url}" style="max-width: 100%; max-height: calc(100% - 22px); display: block; margin: 0 auto;">
                        </div>
                    `;
                    document.body.appendChild(largeView);

                    const largeTitleBar = largeView.querySelector('.title-bar');
                    largeTitleBar.addEventListener('mousedown', (e) => {
                        if (!e.target.closest('.title-bar-controls')) {
                            window.startDrag(e, largeView);
                            window.bringToFront('friedrich-large-view');
                        }
                    });
                    largeView.addEventListener('mousedown', () => window.bringToFront('friedrich-large-view'));

                    window.openWindow('friedrich-large-view');
                };
                gallery.appendChild(img);
            });

            // Debug animation application
            console.log('Friedrich window created. Checking animations...');
            const contentTitle = windowDiv.querySelector('.content-card h2');
            if (contentTitle) {
                console.log('Content title found, applying titleBounce animation with font-size: 36px');
            } else {
                console.warn('Content title not found in .content-card');
            }

            window.openWindow('friedrich-window');
        } catch (error) {
            console.error('Error creating Friedrich window:', error);
            window.playSound && window.playSound('error-sound');
            alert('Failed to load Friedrich project. Please try again.');
        }
    });
}

function refreshFriedrich() {
    const content = document.getElementById('friedrich-content');
    if (content) {
        content.scrollTop = 0;
        window.playSound('click-sound');
    }
}

function triggerClippyEasterEgg() {
    window.playSound('window-open-sound');
    if (!window.clippyAgent) {
        console.warn('Clippy agent not loaded, showing fallback message.');
        alert('Hey! Don\'t stop now! This work of art means a lot to Malte. Have you admired it enough?');
        return;
    }

    const existingBubble = document.getElementById('clippy-bubble');
    if (existingBubble) {
        existingBubble.remove();
    }

    const bubble = document.createElement('div');
    bubble.id = 'clippy-bubble';
    bubble.className = 'clippy-bubble';
    bubble.style.position = 'fixed';
    bubble.style.bottom = '100px';
    bubble.style.right = '100px';
    bubble.innerHTML = `
        <p id="clippy-text"></p>
        <div class="clippy-buttons" id="clippy-buttons" style="display: none;">
            <button onclick="handleClippyResponse('yes')">Yes</button>
            <button onclick="handleClippyResponse('yes-ofc')">Yes ofc</button>
        </div>
    `;
    document.body.appendChild(bubble);

    const textElement = document.getElementById('clippy-text');
    const fullText = "Hey! Don't stop now! This work of art means a lot to Malte. Have you admired it enough?";
    let index = 0;

    function typeText() {
        if (index < fullText.length) {
            textElement.textContent += fullText[index];
            index++;
            setTimeout(typeText, 50);
        } else {
            document.getElementById('clippy-buttons').style.display = 'flex';
        }
    }

    window.clippyAgent.moveTo(window.innerWidth - 200, window.innerHeight - 150);
    window.clippyAgent.play('Alert');
    typeText();

    window.handleClippyResponse = function(response) {
        window.playSound('click-sound');
        textElement.textContent = response === 'yes' ? 
            "Good enough, I suppose. Keep exploring!" : 
            "That's the spirit! But I'm keeping you here a bit longer!";
        document.getElementById('clippy-buttons').style.display = 'none';
        window.clippyAgent.play('Congratulate');
        setTimeout(() => {
            bubble.remove();
            window.clippyAgent.moveTo(window.innerWidth - 100, window.innerHeight - 100);
        }, 2000);
    };
}
