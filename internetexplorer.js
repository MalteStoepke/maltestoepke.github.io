let historyStack = [];
let currentHistoryIndex = -1;

function initInternetExplorer() {
    showHome();

    const iframe = document.querySelector('#ie-window iframe');
    if (iframe) {
        // Handle iframe load errors
        iframe.addEventListener('load', () => {
            try {
                if (!iframe.contentDocument || iframe.contentDocument.body.innerHTML === '') {
                    handleLoadFailure(iframe.src);
                } else {
                    document.querySelector('#ie-window .window-body').classList.remove('error');
                }
            } catch (e) {
                handleLoadFailure(iframe.src);
            }
        });
    }

    // Handle Enter key in URL bar
    const urlInput = document.getElementById('browser-url');
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadUrl();
        }
    });
}

function showHome() {
    const contentDiv = document.getElementById('browser-content');
    contentDiv.innerHTML = `
        <h2>Welcome to ArtStation Browser</h2>
        <p>Enter a URL in the address bar above to browse the web.</p>
        <p>Tip: Some websites may not load due to security restrictions. Click the link in the error message to open them in a new tab.</p>
    `;
    document.getElementById('browser-url').value = '';
    document.querySelector('#ie-window .window-body').classList.remove('error');
    historyStack = [];
    currentHistoryIndex = -1;
}

function loadUrl(url) {
    if (!url) {
        url = document.getElementById('browser-url').value.trim();
        if (!url) {
            playSound('error-sound');
            alert('Please enter a valid URL.');
            return;
        }
    }

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        playSound('error-sound');
        alert('Invalid URL format. Please enter a valid URL (e.g., https://example.com).');
        return;
    }

    const contentDiv = document.getElementById('browser-content');
    contentDiv.innerHTML = `
        <iframe src="${url}" sandbox="allow-same-origin allow-scripts allow-popups allow-forms"></iframe>
        <div class="error-content"></div>
    `;
    document.getElementById('browser-url').value = url;
    document.querySelector('#ie-window .window-body').classList.remove('error');

    // Update history
    if (currentHistoryIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, currentHistoryIndex + 1);
    }
    historyStack.push(url);
    currentHistoryIndex++;
    playSound('click-sound');
}

function handleLoadFailure(url) {
    const contentDiv = document.getElementById('browser-content').querySelector('.error-content');
    document.querySelector('#ie-window .window-body').classList.add('error');
    contentDiv.innerHTML = `
        <h3>Unable to Load Page</h3>
        <p>The webpage at <strong>${url}</strong> could not be loaded due to security restrictions (e.g., CORS or X-Frame-Options).</p>
        <p><a href="${url}" target="_blank">Open in a new tab</a></p>
    `;
    if (window.clippyAgent) {
        window.clippyAgent.speak('This webpage cannot be loaded in the browser. Click the link to open it in a new tab.');
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
        document.querySelector('#ie-window .window-body').classList.add('error');
        handleLoadFailure(document.getElementById('browser-url').value);
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
