function initInternetExplorer() {
    try {
        const contentDiv = document.getElementById('browser-content');
        const urlInput = document.getElementById('browser-url');
        const windowBody = document.querySelector('#ie-window .window-body');

        // Set fixed URL and disable input
        if (urlInput) {
            urlInput.value = 'http://malte-stoepke-blog.com';
            urlInput.disabled = true;
        }

        // Disable navigation buttons
        const buttons = [
            { fn: 'goBack', label: 'Back' },
            { fn: 'goForward', label: 'Forward' },
            { fn: 'stopLoading', label: 'Stop' },
            { fn: 'refreshBrowser', label: 'Refresh' },
            { fn: 'loadUrl', label: 'Go' }
        ];
        buttons.forEach(({ fn, label }) => {
            const btn = document.querySelector(`#ie-window button[onclick="${fn}()"]`);
            if (btn) {
                btn.onclick = () => {
                    playSound('error-sound');
                    if (window.clippyAgent) {
                        window.clippyAgent.speak(`No ${label.toLowerCase()} allowed, just enjoy my blog!`);
                    }
                };
            }
        });

        // Set home button to reload blog
        const homeBtn = document.querySelector('#ie-window button[onclick="showHome()"]');
        if (homeBtn) {
            homeBtn.onclick = () => loadBlog();
        }

        // Load blog content
        loadBlog();

        // Clippy welcome message
        if (window.clippyAgent) {
            window.clippyAgent.speak('Yo, welcome to my radical Y2K blog! Check out my 3D art posts and vibe with the animations!');
        }
    } catch (e) {
        console.error('Error in initInternetExplorer:', e);
        playSound('error-sound');
        alert('Failed to load Malte\'s Blog. Please try again.');
    }
}

function loadBlog() {
    const contentDiv = document.getElementById('browser-content');
    if (contentDiv) {
        contentDiv.innerHTML = `
            <style>
                .blog-container {
                    background: url('https://www.gifcities.org/images/backgrounds/tilez3.gif') repeat;
                    color: #00FF00;
                    font-family: 'Comic Sans MS', 'Arial', sans-serif;
                    padding: 20px;
                    height: 100%;
                    overflow: auto;
                    text-align: center;
                }
                .blog-header {
                    background: #FF00FF;
                    color: #FFFF00;
                    padding: 10px;
                    border: 2px outset #FFFFFF;
                    margin-bottom: 20px;
                    animation: blink 0.5s step-end infinite;
                }
                .blog-header img {
                    width: 50px;
                    height: 50px;
                    vertical-align: middle;
                    animation: spin 1.5s linear infinite;
                }
                .blog-post {
                    background: #0000FF;
                    color: #FFFFFF;
                    border: 2px inset #FFFFFF;
                    margin: 15px auto;
                    padding: 15px;
                    max-width: 80%;
                    box-shadow: 5px 5px 10px rgba(0,0,0,0.5);
                }
                .blog-post h3 {
                    color: #FFFF00;
                    font-size: 18px;
                    text-decoration: underline;
                    animation: pulse 2s infinite;
                }
                .blog-post img {
                    max-width: 200px;
                    border: 2px outset #FFFFFF;
                    margin: 10px;
                    cursor: pointer;
                }
                .blog-post img:hover {
                    transform: scale(1.1);
                    transition: transform 0.3s;
                }
                marquee {
                    color: #FF0000;
                    font-size: 16px;
                    margin: 10px 0;
                    font-weight: bold;
                }
                .visitor-counter {
                    background: #000000;
                    color: #00FF00;
                    padding: 5px;
                    border: 2px outset #FFFFFF;
                    display: inline-block;
                    font-family: 'Courier New', monospace;
                }
                .guestbook-link {
                    color: #FFFF00;
                    text-decoration: underline;
                    cursor: pointer;
                }
                .guestbook-link:hover {
                    color: #FF00FF;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            </style>
            <div class="blog-container">
                <div class="blog-header">
                    <img src="https://www.gifcities.org/images/animated/spinnyglobe.gif" alt="Spinning Globe">
                    <h1>Malte's 3D Art Blog - Totally Radical!</h1>
                    <img src="https://www.gifcities.org/images/animated/under_construction2.gif" alt="Under Construction">
                </div>
                <marquee behavior="scroll" direction="left">🌟 Yo, welcome to my Y2K blog! Check out my 3D art posts! 🌟</marquee>
                <div class="blog-post">
                    <h3>Post #1: Dropping Friedrich in ZBrush</h3>
                    <p>Yo, what's good? Just finished sculpting Friedrich, this grizzled sailor dude from St. Pauli. His beard took FOREVER to get right, but the vibes are immaculate. Used ZBrush for the sculpt, Maya for retopo, and Unreal Engine 5.5 for an interactive scene. Click the pic to feel the salt!</p>
                    <img src="https://via.placeholder.com/200x150?text=Friedrich+Sculpt" alt="Friedrich Sculpt" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Yo, that beard is straight fire!');">
                    <p><i>Posted: July 31, 2025</i></p>
                </div>
                <div class="blog-post">
                    <h3>Post #2: Maya Madness Unleashed</h3>
                    <p>Back at it with Autodesk Maya, grinding through some retopology for a sci-fi character. The wireframes are looking clean, but it’s a total slog. Thinking about a cyberpunk vibe next—neon lights and all. Check the screenshot and lmk your thoughts!</p>
                    <img src="https://via.placeholder.com/200x150?text=Maya+Wireframe" alt="Maya Wireframe" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Wireframes? So retro, so cool!');">
                    <p><i>Posted: July 20, 2025</i></p>
                </div>
                <div class="blog-post">
                    <h3>Post #3: Substance Painter Glow-Up</h3>
                    <p>Just painted some SICK textures in Substance 3D Painter for a cyberpunk armor set. The normal maps are popping, and it’s got that gritty shine. Check the render below. Next step: animating this in UE5. Stay tuned, fam!</p>
                    <img src="https://via.placeholder.com/200x150?text=Cyberpunk+Armor" alt="Cyberpunk Armor" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Those textures are totally tubular!');">
                    <p><i>Posted: July 10, 2025</i></p>
                </div>
                <div class="blog-post">
                    <h3>Post #4: Sketching New Concepts</h3>
                    <p>Been doodling some 2D concepts for a new project—maybe a fantasy creature? Started with pencils, then moved to digital in Procreate. The vibes are mythical yet techy. Check the sketch and hit up my guestbook with ideas!</p>
                    <img src="https://via.placeholder.com/200x150?text=Fantasy+Sketch" alt="Fantasy Sketch" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent
