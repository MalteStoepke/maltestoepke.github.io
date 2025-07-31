function initInternetExplorer() {
    const contentDiv = document.getElementById('browser-content');
    const urlInput = document.getElementById('browser-url');
    const windowBody = document.querySelector('#ie-window .window-body');

    // Set fixed URL and disable input
    if (urlInput) {
        urlInput.value = 'http://malte-stoepke-blog.com';
        urlInput.disabled = true;
    }

    // Disable navigation buttons by overriding their onclick handlers
    const buttons = ['goBack', 'goForward', 'stopLoading', 'refreshBrowser'];
    buttons.forEach(fn => {
        const btn = document.querySelector(`#ie-window .ie-toolbar button[onclick="${fn}()"]`);
        if (btn) {
            btn.onclick = () => {
                playSound('error-sound');
                if (window.clippyAgent) {
                    window.clippyAgent.speak('This is my blog, no need to navigate elsewhere!');
                }
            };
        }
    });

    // Set home button to reload blog
    const homeBtn = document.querySelector('#ie-window .ie-toolbar button[onclick="showHome()"]');
    if (homeBtn) {
        homeBtn.onclick = () => loadBlog();
    }

    // Load blog content
    loadBlog();

    // Clippy welcome message
    if (window.clippyAgent) {
        window.clippyAgent.speak('Welcome to my totally rad blog! Check out my 3D art posts and enjoy the 2000s vibes!');
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
                    animation: blink 1s step-end infinite;
                }
                .blog-header img {
                    width: 50px;
                    height: 50px;
                    vertical-align: middle;
                    animation: spin 2s linear infinite;
                }
                .blog-post {
                    background: #0000FF;
                    color: #FFFFFF;
                    border: 2px inset #FFFFFF;
                    margin: 10px auto;
                    padding: 15px;
                    max-width: 80%;
                    box-shadow: 5px 5px 10px rgba(0,0,0,0.5);
                }
                .blog-post h3 {
                    color: #FFFF00;
                    font-size: 18px;
                    text-decoration: underline;
                }
                .blog-post img {
                    max-width: 200px;
                    border: 2px outset #FFFFFF;
                    margin: 10px;
                    cursor: pointer;
                }
                .blog-post img:hover {
                    transform: scale(1.1);
                }
                marquee {
                    color: #FF0000;
                    font-size: 16px;
                    margin: 10px 0;
                }
                .visitor-counter {
                    background: #000000;
                    color: #00FF00;
                    padding: 5px;
                    border: 2px outset #FFFFFF;
                    display: inline-block;
                    font-family: 'Courier New', monospace;
                }
                @keyframes blink {
                    50% { opacity: 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            </style>
            <div class="blog-container">
                <div class="blog-header">
                    <img src="https://www.gifcities.org/images/animated/spinnyglobe.gif" alt="Spinning Globe">
                    <h1>Malte's 3D Art Blog - Totally Tubular!</h1>
                    <img src="https://www.gifcities.org/images/animated/under_construction2.gif" alt="Under Construction">
                </div>
                <marquee>🌟 Welcome to my wicked cool blog! Check out my 3D art adventures! 🌟</marquee>
                <div class="blog-post">
                    <h3>Post #1: Sculpting Friedrich in ZBrush</h3>
                    <p>Yo, what's good? Just dropped a new character, Friedrich, in ZBrush. This dude's got a grizzled vibe, like he’s been chilling in St. Pauli forever. Spent hours on his beard texture—check it! Used blendshapes for emotions, and it’s now live in Unreal Engine 5.5. Click the pic for a closer look!</p>
                    <img src="https://via.placeholder.com/200x150?text=Friedrich+Sculpt" alt="Friedrich Sculpt" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Rad sculpt, right?');">
                    <p><i>Posted: July 31, 2025</i></p>
                </div>
                <div class="blog-post">
                    <h3>Post #2: Maya Madness</h3>
                    <p>Okay, so I’m deep into Autodesk Maya, tweaking some models for my next project. Retopology is a pain, but the results are 🔥. Added some wireframe shots below. Thinking about a sci-fi character next—what do you think? Hit me up in the guestbook!</p>
                    <img src="https://via.placeholder.com/200x150?text=Maya+Wireframe" alt="Maya Wireframe" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Wireframes are so 2000s!');">
                    <p><i>Posted: July 20, 2025</i></p>
                </div>
                <div class="blog-post">
                    <h3>Post #3: Substance Painter Vibes</h3>
                    <p>Just painted some sick textures in Substance 3D Painter. Got this cyberpunk armor set looking shiny and gritty. The normal maps are popping off! Check the screenshot below. Next up: animating this bad boy in UE5. Stay tuned!</p>
                    <img src="https://via.placeholder.com/200x150?text=Cyberpunk+Armor" alt="Cyberpunk Armor" onclick="playSound('click-sound'); if(window.clippyAgent) window.clippyAgent.speak('Those textures are gnarly!');">
                    <p><i>Posted: July 10, 2025</i></p>
                </div>
                <div class="visitor-counter">
                    Visitor Count: <span id="visitor-count">1337</span>
                </div>
                <marquee>💾 Sign my guestbook! Email me at malte@retroblog.com! 💾</marquee>
            </div>
        `;
        document.querySelector('#ie-window .window-body').classList.remove('error');
    }
}
