function showClippyOverlay() {
    // Remove existing overlay
    const existingOverlay = document.getElementById('clippy-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }

    try {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'clippy-overlay';
        overlay.style.position = 'fixed';
        overlay.style.bottom = '100px';
        overlay.style.right = '100px';
        overlay.style.zIndex = '10002';
        overlay.innerHTML = `
            <style>
                .clippy-container {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }
                .clippy-speech-bubble {
                    background: #ffffe1;
                    border: 2px solid #000;
                    border-radius: 8px;
                    padding: 10px;
                    max-width: 300px;
                    font-family: "MS Sans Serif", Arial, sans-serif;
                    font-size: 12px;
                    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
                    margin-bottom: 10px;
                    position: relative;
                }
                .clippy-speech-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    right: 20px;
                    border: 10px solid transparent;
                    border-top-color: #ffffe1;
                    border-bottom: 0;
                }
                .clippy-speech-bubble p {
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
                    font-family: "MS Sans Serif", Arial, sans-serif;
                }
                .clippy-buttons button:hover {
                    background: #e0e0e0;
                    border: 2px inset #c0c0c0;
                }
                .clippy-graphic {
                    width: 100px;
                    height: 100px;
                    background-image: url('https://raw.githubusercontent.com/pi0/clippyjs/master/assets/agents/Clippy/Clippy.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                }
                .clippy-graphic.fallback {
                    background-image: url('https://www.clippit.org/clippy.png');
                }
            </style>
            <div class="clippy-container">
                <div class="clippy-speech-bubble">
                    <p id="clippy-text"></p>
                    <div class="clippy-buttons" id="clippy-buttons" style="display: none;">
                        <button onclick="window.handleClippyResponse('yes')">Yes</button>
                        <button onclick="window.handleClippyResponse('yes-ofc')">Yes ofc</button>
                    </div>
                </div>
                <div class="clippy-graphic" id="clippy-graphic"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Play sound
        window.playSound && window.playSound('window-open-sound');

        // Initialize Clippy with clippyjs
        if (window.clippy && window.clippy.load) {
            window.clippy.load('Clippy', function(agent) {
                window.clippyAgent = agent;
                const graphic = document.getElementById('clippy-graphic');
                graphic.style.display = 'none'; // Hide static graphic
                agent.show();
                agent.moveTo(window.innerWidth - 200, window.innerHeight - 150);
                agent.play('Alert');
                startTypewriter();
            }, function() {
                console.warn('Clippy.js failed to load, using fallback graphic.');
                document.getElementById('clippy-graphic').classList.add('fallback');
                startTypewriter();
            }, 'https://raw.githubusercontent.com/pi0/clippyjs/master/assets/agents/');
        } else {
            console.warn('Clippy.js not loaded, using fallback graphic.');
            document.getElementById('clippy-graphic').classList.add('fallback');
            startTypewriter();
        }

        // Typewriter effect for speech bubble
        function startTypewriter() {
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

            typeText();
        }

        // Handle button responses
        window.handleClippyResponse = function(response) {
            window.playSound && window.playSound('click-sound');
            const textElement = document.getElementById('clippy-text');
            textElement.textContent = response === 'yes' ? 
                "Good enough, I suppose. Keep exploring!" : 
                "That's the spirit! But I'm keeping you here a bit longer!";
            document.getElementById('clippy-buttons').style.display = 'none';
            if (window.clippyAgent) {
                window.clippyAgent.play('Congratulate');
                setTimeout(() => {
                    window.clippyAgent.hide();
                    overlay.remove();
                }, 2000);
            } else {
                setTimeout(() => {
                    overlay.remove();
                }, 2000);
            }
        };

        // Close overlay on click outside
        document.addEventListener('click', (e) => {
            if (!overlay.contains(e.target) && e.target !== document.querySelector('.ie-toolbar button[onclick="showClippyOverlay()"]')) {
                if (window.clippyAgent) {
                    window.clippyAgent.hide();
                }
                overlay.remove();
            }
        }, { once: true });
    } catch (error) {
        console.error('Error showing Clippy overlay:', error);
        window.playSound && window.playSound('error-sound');
        alert('Failed to load Clippy easter egg. Please try again.');
    }
}
