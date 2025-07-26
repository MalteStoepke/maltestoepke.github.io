function openFriedrich() {
    // Check if required global functions exist
    if (!window.openWindow || !window.minimizeWindow || !window.maximizeWindow || !window.closeWindow || !window.startDrag || !window.bringToFront || !window.playSound) {
        console.error('Required global functions are missing. Ensure index.html is loaded correctly.');
        alert('Error: Portfolio OS not fully loaded. Please refresh the page.');
        return;
    }

    // Remove existing window if it exists to prevent duplicates
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
            <div class="title-bar">
                <div class="title-bar-text">Friedrich - Internet Explorer</div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize" onclick="minimizeWindow('friedrich-window')"></button>
                    <button aria-label="Maximize" onclick="maximizeWindow('friedrich-window')"></button>
                    <button aria-label="Close" onclick="closeWindow('friedrich-window')"></button>
                </div>
            </div>
            <div class="ie-toolbar">
                <button disabled>Back</button>
                <button disabled>Forward</button>
                <button disabled>Stop</button>
                <button onclick="refreshFriedrich()">Refresh</button>
                <button onclick="openInternetExplorer()">Home</button>
            </div>
            <div class="ie-address-bar">
                <label>Address:</label>
                <input type="text" id="friedrich-url" value="portfolio://friedrich" readonly>
            </div>
            <div class="ie-content" id="friedrich-content" style="background: white; padding: 8px;">
                <h2>Friedrich</h2>
                <p>Years on the streets have left their mark—his face weathered by the cold harbor wind, beard unkempt, eyes tired yet sharp. His posture is strong but weary, shaped by a life of labor and loss. St. Pauli’s raw, unfiltered energy defines him; he's a product of its harsh realities but also its deep camaraderie—a man still clinging to the salt and spirit of the sea.</p>
                <p>This project began as an assignment for my Character Design class. I developed a complete concept for this character, starting with several iterations of 2D concept sketches before sculpting him in ZBrush. Later, I retopologized the character in Autodesk Maya, textured it using Substance 3D Painter, and created blendshapes to showcase various emotions. Additionally, I built an interactive scene in Unreal Engine 5.5, allowing viewers to switch between his emotions at the press of a button.</p>
                <p>Overall, this was an incredibly exciting project through which I learned many new skills.</p>
                <div class="artwork-gallery" id="friedrich-gallery"></div>
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
            'https://cdnb.artstation.com/p/assets/images/images/085/992/472/large/malte-wireframe-side.jpg?1742147816',
            'https://cdnb.artstation.com/p/assets/images/images/086/017/925/large/malte-uv-1.jpg?1742215120',
            'https://cdnb.artstation.com/p/assets/images/images/086/017/913/large/malte-uv-2.jpg?1742215103',
            'https://cdna.artstation.com/p/assets/images/images/085/973/646/large/malte-character-design-presentation-2.jpg?1742093660'
        ];

        imageUrls.forEach((url, index) => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = `Friedrich artwork ${index + 1}`;
            img.className = 'artwork-image';
            img.style.cursor = 'pointer';
            img.onclick = () => {
                // Remove existing large view if present
                const existingLargeView = document.getElementById('friedrich-large-view');
                if (existingLargeView) {
                    existingLargeView.remove();
                }

                // Create large view window
                const largeView = document.createElement('div');
                largeView.className = 'window';
                largeView.id = 'friedrich-large-view';
                largeView.style.width = '800px';
                largeView.style.height = '600px';
                largeView.style.top = '5%';
                largeView.style.left = '5%';
                largeView.innerHTML = `
                    <div class="title-bar">
                        <div class="title-bar-text">Friedrich - Full View</div>
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

                // Add dragging for large view
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

        window.openWindow('friedrich-window');
    } catch (error) {
        console.error('Error creating Friedrich window:', error);
        window.playSound('error-sound');
        alert('Failed to load Friedrich project. Please try again.');
    }
}

function refreshFriedrich() {
    const content = document.getElementById('friedrich-content');
    if (content) {
        content.scrollTop = 0;
        window.playSound('click-sound');
    }
}
