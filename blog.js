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
            if (currentUser === 'Malte Stoepke') {
                postDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e.clientX, e.clientY, `blog-post-${post.id}`);
                });
            }
            postsDiv.appendChild(postDiv);
        });
    };

    request.onerror = (e) => console.error('Error loading blog posts:', e);
}

function toggleBlogForm() {
    const form = document.getElementById('blog-form');
    form.classList.toggle('active');
    playSound('click-sound');
}

function saveBlogPost() {
    const title = document.getElementById('blog-title').value;
    const image = document.getElementById('blog-image').value;
    const content = document.getElementById('blog-content').value;
    const date = new Date().toISOString().split('T')[0];

    if (!title || !content) {
        playSound('error-sound');
        alert('Title and content are required!');
        return;
    }

    const post = { title, date, image: image || 'https://via.placeholder.com/300x200?text=Blog+Post', content };
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
    };
    transaction.onerror = (e) => console.error('Error adding blog post:', e);
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
        };
    };

    transaction.onerror = (e) => console.error('Error updating blog post:', e);
}

function deleteBlogPost(id) {
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    store.delete(id);

    transaction.oncomplete = () => {
        playSound('click-sound');
        alert('Blog post deleted!');
        loadBlogPosts(db, currentUser);
    };
    transaction.onerror = (e) => console.error('Error deleting blog post:', e);
}
