let historyStack = [];
let currentHistoryIndex = -1;

const initialProjects = [
    {
        id: "1NWEre",
        title: "Friedrich",
        url: "https://malte_stoepke.artstation.com/projects/1NWEre",
        description: "Years on the streets have left their mark—his face weathered by the cold harbor wind, beard unkempt, eyes tired yet sharp. His posture is strong but weary, shaped by a life of labor and loss. St. Pauli’s raw, unfiltered energy defines him; he's a product of its harsh realities but also its deep camaraderie—a man still clinging to the salt and spirit of the sea. This project began as an assignment for my Character Design class. I developed a complete concept for this character, starting with several iterations of 2D concept sketches before sculpting him in ZBrush. Later, I retopologized the character in Autodesk Maya, textured it using Substance 3D Painter, and created blendshapes to showcase various emotions. Additionally, I built an interactive scene in Unreal Engine 5.5, allowing viewers to switch between his emotions at the press of a button.",
        images: [
            "https://via.placeholder.com/400x300?text=Friedrich+Neutral",
            "https://via.placeholder.com/400x300?text=Friedrich+Angry",
            "https://via.placeholder.com/400x300?text=Friedrich+Upset",
            "https://via.placeholder.com/400x300?text=Friedrich+Happy",
            "https://via.placeholder.com/400x300?text=Friedrich+Questioning",
            "https://via.placeholder.com/400x300?text=Friedrich+Sad+and+Tired",
            "https://via.placeholder.com/400x300?text=Friedrich+Whistling+Astonished",
            "https://via.placeholder.com/400x300?text=Friedrich+Wireframe+1",
            "https://via.placeholder.com/400x300?text=Friedrich+Wireframe+2",
            "https://via.placeholder.com/400x300?text=Friedrich+UV+1",
            "https://via.placeholder.com/400x300?text=Friedrich+UV+2",
            "https://via.placeholder.com/400x300?text=Friedrich+Concept+and+Iteration"
        ]
    },
    {
        id: "kNorkn",
        title: "Second Project",
        url: "https://malte_stoepke.artstation.com/projects/kNorkn",
        description: "A 3D art project showcasing my skills in character design and modeling. Created using ZBrush, Autodesk Maya, and Substance 3D Painter, with an interactive scene in Unreal Engine.",
        images: [
            "https://via.placeholder.com/400x300?text=Second+Project+Image+1",
            "https://via.placeholder.com/400x300?text=Second+Project+Image+2",
            "https://via.placeholder.com/400x300?text=Second+Project+Image+3"
        ]
    }
];

function initInternetExplorer() {
    showHome();

    const iframe = document.querySelector('#ie-window iframe');
    if (iframe) {
        // Handle iframe load errors
        iframe.addDocumentListener('error', () => {
            handleIframeError(iframe);
        });

        // Handle successful load, but check for empty or blocked content
        iframe.addEventListener('load', () => {
            try {
                if (!iframe.contentDocument || iframe.contentDocument.body.innerHTML === '') {
                    handleIframeError(iframe);
                } else {
                    document.querySelector('#ie-window .window-body').classList.remove('fallback');
                }
            } catch (e) {
                handleIframeError(iframe);
            }
        });
    }
}

function handleIframeError(iframe) {
    const url = iframe.src;
    const windowBody = document.querySelector('#ie-window .window-body');
    windowBody.classList.add('fallback');
    showFallbackContent(url);
    if (window.clippyAgent) {
        window.clippyAgent.speak('This webpage cannot be loaded due to security restrictions. Showing fallback content or opening in a new tab.');
    }
}

function showHome() {
    const contentDiv = document.getElementById('browser-content');
    contentDiv.innerHTML = `
        <h2>My ArtStation Projects</h2>
        <div class="artwork-gallery">
            ${initialProjects.map(project => `
                <div class="artwork-item" onclick="loadUrl('${project.url}')">
                    <img src="${project.images[0]}" alt="${project.title}">
                    <p>${project.title}</p>
                </div>
            `).join('')}
        </div>
    `;
    document.getElementById('browser-url').value = '';
    document.querySelector('#ie-window .window-body').classList.remove('fallback');
    historyStack = [];
    currentHistoryIndex = -1;
}

function loadUrl(url) {
    if (!url) {
        url = document.getElementById('browser-url').value.trim();
        if (!url) {
            playSound('error-sound');
            alert('Please enter a URL.');
            return;
        }
    }

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Check if URL is one of the portfolio projects
    const project = initialProjects.find(p => p.url === url);
    const contentDiv = document.getElementById('browser-content');
    
    if (project) {
        // For portfolio projects, attempt to load in iframe with fallback
        contentDiv.innerHTML = `
            <iframe src="${url}" sandbox="allow-same-origin allow-scripts"></iframe>
            <div class="fallback-content"></div>
        `;
        document.getElementById('browser-url').value = url;
    } else {
        // For external URLs, open in new tab and show a message
        contentDiv.innerHTML = `
            <div class="fallback-content">
                <p>Opening external website in a new tab due to security restrictions...</p>
                <p><a href="${url}" target="_blank">Click here if the page does not open automatically.</a></p>
            </div>
        `;
        document.getElementById('browser-url').value = url;
        document.querySelector('#ie-window .window-body').classList.add('fallback');
        window.open(url, '_blank');
        if (window.clippyAgent) {
            window.clippyAgent.speak('External websites are opened in a new tab due to browser security restrictions.');
        }
    }

    // Update history
    if (currentHistoryIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, currentHistoryIndex + 1);
    }
    historyStack.push(url);
    currentHistoryIndex++;
    playSound('click-sound');
}

function showFallbackContent(url) {
    const project = initialProjects.find(p => p.url === url);
    const contentDiv = document.getElementById('browser-content').querySelector('.fallback-content');
    if (project) {
        contentDiv.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="artwork-gallery">
                ${project.images.map(img => `<img src="${img}" class="artwork-image" alt="${project.title}">`).join('')}
            </div>
            <p><a href="${project.url}" target="_blank">View full project on ArtStation</a></p>
        `;
    } else {
        contentDiv.innerHTML = `
            <p>Sorry, this webpage could not be loaded due to security restrictions.</p>
            <p><a href="${url}" target="_blank">Open in a new tab</a></p>
        `;
    }
}

function goBack() {
    if (currentHistoryIndex > 0) {
        currentHistoryIndex--;
        loadUrl(historyStack[currentHistoryIndex]);
    } else {
        playSound('error-sound');
    }
}

function goForward() {
    if (currentHistoryIndex < historyStack.length - 1) {
        currentHistoryIndex++;
        loadUrl(historyStack[currentHistoryIndex]);
    } else {
        playSound('error-sound');
    }
}

function stopLoading() {
    const iframe = document.querySelector('#ie-window iframe');
    if (iframe) {
        iframe.src = 'about:blank';
        document.querySelector('#ie-window .window-body').classList.add('fallback');
        showFallbackContent(document.getElementById('browser-url').value);
        playSound('error-sound');
    }
}

function refreshBrowser() {
    const url = document.getElementById('browser-url').value;
    if (url) {
        loadUrl(url);
    } else {
        showHome();
    }
}
