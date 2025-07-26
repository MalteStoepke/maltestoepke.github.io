function openFriedrich() {
    if (!document.getElementById('friedrich-window')) {
        // Create the window
        const windowDiv = document.createElement('div');
        windowDiv.className = 'window';
        windowDiv.id = 'friedrich-window';
        windowDiv.style.width = '700px';
        windowDiv.style.height = '500px';
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
                <button onclick="alert('Back navigation not implemented for this project.')">Back</button>
                <button onclick="alert('Forward navigation not implemented for this project.')">Forward</button>
                <button onclick="alert('Stop not implemented for this project.')">Stop</button>
                <button onclick="refreshFriedrich()">Refresh</button>
                <button onclick="openInternetExplorer()">Home</button>
            </div>
            <div class="ie-address-bar">
                <label>Address:</label>
                <input type="text" id="friedrich-url" value="portfolio://friedrich" readonly>
            </div>
            <div class="ie-content" id="friedrich-content">
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
            if (e.target.closest('.title-bar-controls')) return;
            startDrag(e, windowDiv);
            bringToFront('friedrich-window');
        });
        windowDiv.addEventListener('mousedown', () => bringToFront('friedrich-window'));

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

        imageUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Friedrich artwork';
            img.className = 'artwork-image';
            img.onclick = () => {
                // Open larger view in new window
                const largeView = document.createElement('div');
                largeView.className = 'window';
                largeView.id = 'friedrich-large-view';
                largeView.style.width = '800px';
                largeView.style.height = '600px';
                largeView.innerHTML = `
                    <div class="title-bar">
                        <div class="title-bar-text">Friedrich - Full View</div>
                        <div class="title-bar-controls">
                            <button aria-label="Close" onclick="closeWindow('friedrich-large-view')"></button>
                        </div>
                    </div>
                    <div class="window-body">
                        <img src="${url}" style="max-width: 100%; max-height: 100%; display: block; margin: 0 auto;">
                    </div>
                `;
                document.body.appendChild(largeView);
                // Add dragging for large view
                const largeTitleBar = largeView.querySelector('.title-bar');
                largeTitleBar.addEventListener('mousedown', (e) => {
                    if (e.target.closest('.title-bar-controls')) return;
                    startDrag(e, largeView);
                    bringToFront('friedrich-large-view');
                });
                largeView.addEventListener('mousedown', () => bringToFront('friedrich-large-view'));
                openWindow('friedrich-large-view');
            };
            gallery.appendChild(img);
        });
    }

    openWindow('friedrich-window');
}

function refreshFriedrich() {
    const content = document.getElementById('friedrich-content');
    if (content) {
        content.scrollTop = 0;
        playSound('click-sound');
    }
}
