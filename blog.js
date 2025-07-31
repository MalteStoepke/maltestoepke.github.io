function initBlog(db, currentUser) {
    updateBlogUI(currentUser);
    loadBlogPosts(db, currentUser);
}

function updateBlogUI(currentUser) {
    const blogControls = document.getElementById('blog-controls');
    if (blogControls) {
        blogControls.style.display = currentUser === 'Malte Stoepke' ? 'block' : 'none';
    }
}

function loadBlogPosts(db, currentUser) {
    const postsDiv = document.getElementById('blog-posts');
    postsDiv.innerHTML = '';
    const transaction = db.transaction(['blogPosts'], 'readonly');
    const store = transaction.objectStore('blogPosts');
    const request = store.getAll();

    request.onsuccess = () => {
        const posts = request.result;
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'blog-post';
            postDiv.dataset.id = `blog-post-${post.id}`;
            postDiv.innerHTML = `
                <h3 class="editable-field" contenteditable="${currentUser === 'Malte Stoepke'}">${post.title}</h3>
                <div class="date">${post.date}</div>
                <img src="${post.image}" alt="${post.title}">
                <p class="editable-field" contenteditable="${currentUser === 'Malte Stoepke'}">${post.content}</p>
                ${currentUser === 'Malte Stoepke' ? `<button onclick="saveBlogPostEdit(${post.id})">Save Edit</button>` : ''}
            `;
            postDiv.addEventListener('click', () => openPostWindow(post));
            if (currentUser === 'Malte Stoepke') {
                postDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e.clientX, e.clientY, `blog-post-${post.id}`);
                });
            }
            postsDiv.appendChild(postDiv);
        });
        document.querySelector('.blog-status-bar').textContent = `Loaded ${posts.length} posts`;
    };

    request.onerror = (e) => {
        console.error('Error loading blog posts:', e);
        document.querySelector('.blog-status-bar').textContent = 'Error loading posts';
    };
}

function openPostWindow(post) {
    const winId = `blog-post-window-${post.id}`;
    let win = document.getElementById(winId);
    if (!win) {
        win = document.createElement('div');
        win.className = 'window blog-window';
        win.id = winId;
        win.style.width = '500px';
        win.style.height = '400px';
        win.style.top = '15%';
        win.style.left = '15%';
        win.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">${post.title} - Internet Explorer</div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize" onclick="minimizeWindow('${winId}')"></button>
                    <button aria-label="Maximize" onclick="maximizeWindow('${winId}')"></button>
                    <button aria-label="Close" onclick="closeWindow('${winId}')"></button>
                </div>
            </div>
            <div class="blog-toolbar">
                <button onclick="goBack()"><i class="fas fa-arrow-left"></i> Back</button>
                <button onclick="goForward()"><i class="fas fa-arrow-right"></i> Forward</button>
                <button onclick="refreshBlog()"><i class="fas fa-sync"></i> Refresh</button>
                <button onclick="openWindow('blog-window')"><i class="fas fa-home"></i> Home</button>
            </div>
            <div class="window-body">
                <div class="blog-post">
                    <h3>${post.title}</h3>
                    <div class="date">${post.date}</div>
                    <img src="${post.image}" alt="${post.title}">
                    <p>${post.content}</p>
                </div>
            </div>
            <div class="blog-status-bar">Ready</div>
        `;
        document.body.appendChild(win);
        const titleBar = win.querySelector('.title-bar');
        if (titleBar) {
            titleBar.addEventListener('mousedown', (e) => {
                if (e.target.closest('.title-bar-controls')) return;
                startDrag(e, win);
                bringToFront(winId);
            });
        }
        win.addEventListener('mousedown', () => bringToFront(winId));
    }
    openWindow(winId);
    playSound('window-open-sound');
}

function toggleBlogForm() {
    const form = document.getElementById('blog-form');
    form.classList.toggle('active');
    playSound('click-sound');
    document.querySelector('.blog-status-bar').textContent = form.classList.contains('active') ? 'Adding new post...' : 'Ready';
}

function saveBlogPost() {
    const title = document.getElementById('blog-title').value;
    const image = document.getElementById('blog-image').value;
    const content = document.getElementById('blog-content').value;
    const date = new Date().toISOString().split('T')[0];

    if (!title || !content) {
        playSound('error-sound');
        alert('Title and content are required!');
        document.querySelector('.blog-status-bar').textContent = 'Error: Title and content required';
        return;
    }

    const post = { title, date, image: image || 'https://images.unsplash.com/photo-1516321310767-0a198e8a07e0', content };
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    store.add(post);

    transaction.oncomplete = () => {
        playSound('click-sound');
        alert('Blog post added!');
        document.getElementById('blog-title').value = '';
        document.getElementById('blog-image').value = '';
        document.getElementById('blog-content').value = '';
        document.getElementById('blog-form').classList.remove('active');
        loadBlogPosts(db, currentUser);
        document.querySelector('.blog-status-bar').textContent = 'Post saved';
    };
    transaction.onerror = (e) => {
        console.error('Error adding blog post:', e);
        document.querySelector('.blog-status-bar').textContent = 'Error saving post';
    };
}

function saveBlogPostEdit(id) {
    const postDiv = document.querySelector(`.blog-post[data-id="blog-post-${id}"]`);
    const title = postDiv.querySelector('h3').textContent;
    const content = postDiv.querySelector('p').textContent;

    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    const request = store.get(id);

    request.onsuccess = () => {
        const post = request.result;
        post.title = title;
        post.content = content;
        store.put(post);

        transaction.oncomplete = () => {
            playSound('click-sound');
            alert('Blog post updated!');
            loadBlogPosts(db, currentUser);
            document.querySelector('.blog-status-bar').textContent = 'Post updated';
        };
    };

    request.onerror = (e) => {
        console.error('Error updating blog post:', e);
        document.querySelector('.blog-status-bar').textContent = 'Error updating post';
    };
}

function deleteBlogPost(id) {
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    store.delete(id);

    transaction.oncomplete = () => {
        playSound('click-sound');
        alert('Blog post
