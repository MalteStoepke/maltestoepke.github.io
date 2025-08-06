function initBlog(db, currentUser) {
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    const request = store.getAll();
    request.onsuccess = () => {
        if (request.result.length === 0) {
            const testPosts = [
                {
                    title: "Retro Spaceship Model Completed",
                    date: "2025-01-01",
                    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23",
                    content: "Finally finished my retro spaceship model! Inspired by 80s sci-fi, this model features sleek curves and a vibrant neon glow. Spent hours perfecting the thrusters and cockpit details. The UV mapping was challenging but the final texture bake looks stunning under dynamic lighting."
                },
                {
                    title: "Cyberpunk Cityscape WIP",
                    date: "2025-02-15",
                    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
                    content: "Working on a cyberpunk cityscape scene. The neon signs and reflective surfaces are coming together nicely. Experimenting with metallic shaders and volumetric fog to capture that dystopian vibe. Still need to optimize the geometry for better performance."
                },
                {
                    title: "Character Animation Breakthrough",
                    date: "2025-03-30",
                    image: "https://images.unsplash.com/photo-1618477461853-e627b530133e",
                    content: "Made a breakthrough in character animation today! Got the keyframe timing perfect for a looping walk cycle. The rig is super responsive, and the subtle head bobs add so much personality. Next up: adding facial expressions."
                },
                {
                    title: "Low-Poly Forest Scene",
                    date: "2025-04-10",
                    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
                    content: "Started a low-poly forest scene for a game project. Using a limited color palette to keep the aesthetic clean. The stylized trees and animals are super fun to model, and the baked lighting gives it a cozy feel. Planning to add some particle effects next."
                },
                {
                    title: "Sci-Fi Weapon Design",
                    date: "2025-05-05",
                    image: "https://images.unsplash.com/photo-1563089145-5999971573b6",
                    content: "Designed a sci-fi plasma rifle this week. Focused on intricate details like cooling vents and glowing energy cells. The texturing process was intense, but the normal maps really make the details pop. Thinking about animating the reload sequence next."
                },
                {
                    title: "VR Environment Experiment",
                    date: "2025-06-20",
                    image: "https://images.unsplash.com/photo-1516321310767-0a198e8a07e0",
                    content: "Diving into VR environment creation! Built a futuristic space station with interactive panels. Optimizing for VR is tricky—had to reduce poly count significantly. The immersive feel when walking through the station is unreal!"
                },
                {
                    title: "Retro Game Character Model",
                    date: "2025-07-01",
                    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc",
                    content: "Modeled a retro-inspired game character with a pixelated texture style. Kept the poly count low for that authentic 90s vibe. Rigging was a bit of a pain, but the character is now ready for some basic animations."
                },
                {
                    title: "Water Shader Experiment",
                    date: "2025-08-15",
                    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                    content: "Experimented with a custom water shader today. Got realistic ripples and reflections working! The foam edges need some tweaking, but the overall effect is mesmerizing. Planning to integrate it into a beach scene."
                },
                {
                    title: "Steampunk Vehicle Concept",
                    date: "2025-09-10",
                    image: "https://images.unsplash.com/photo-1509043759401-136742328bb8",
                    content: "Concepting a steampunk airship model. The brass textures and gear details are so satisfying to create. Spent a lot of time on the rigging for the moving parts. Excited to animate the propellers spinning!"
                },
                {
                    title: "Fantasy Creature Sculpt",
                    date: "2025-10-01",
                    image: "https://images.unsplash.com/photo-1519098901909-b1223b390710",
                    content: "Sculpted a fantasy dragon creature in ZBrush. The scales and wings took forever, but the detail is worth it. Currently working on the texture painting to give it a fiery, molten look. Can't wait to see it animated!"
                }
            ];
            testPosts.forEach(post => store.add(post));
        }
    };
    request.onerror = (e) => console.error('Error checking blog posts:', e);
    transaction.oncomplete = () => {
        updateBlogUI(currentUser);
        loadBlogPosts(db, currentUser);
    };
}

function updateBlogUI(currentUser) {
    const blogControls = document.getElementById('blog-controls');
    if (blogControls) {
        blogControls.style.display = currentUser === 'Malte Stoepke' ? 'block' : 'none';
    }
}

function loadBlogPosts(db, currentUser, isRefresh = false) {
    const blogWindow = document.getElementById('blog-window');
    const postsDiv = blogWindow.querySelector('#blog-posts');
    const blogControls = blogWindow.querySelector('#blog-controls');
    const blogForm = blogWindow.querySelector('#blog-form');
    
    postsDiv.innerHTML = '<div class="loading-bar"><div class="loading-progress" id="loading-progress"></div></div>';
    document.querySelector('.blog-status-bar').textContent = isRefresh ? 'Refreshing...' : 'Loading...';
    
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            const transaction = db.transaction(['blogPosts'], 'readonly');
            const store = transaction.objectStore('blogPosts');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const posts = request.result;
                posts.sort((a, b) => new Date(b.date) - new Date(a.date));
                postsDiv.innerHTML = '';
                postsDiv.className = 'blog-posts-grid';
                posts.forEach(post => {
                    const postDiv = document.createElement('div');
                    postDiv.className = 'blog-post';
                    postDiv.dataset.id = `blog-post-${post.id}`;
                    postDiv.innerHTML = `
                        <h3 class="editable-field" contenteditable="${currentUser === 'Malte Stoepke'}">${post.title}</h3>
                        <div class="date">${post.date}</div>
                        <img src="${post.image}" alt="${post.title}">
                        <p class="editable-field" contenteditable="${currentUser === 'Malte Stoepke'}">${post.content.substring(0, 100)}...</p>
                        ${currentUser === 'Malte Stoepke' ? `<button class="blog-button" onclick="saveBlogPostEdit(${post.id})">Save Edit</button>` : ''}
                    `;
                    postDiv.addEventListener('click', (e) => {
                        if (!e.target.closest('button') && !e.target.closest('.editable-field')) {
                            showPostInWindow(post, blogWindow);
                        }
                    });
                    if (currentUser === 'Malte Stoepke') {
                        postDiv.addEventListener('contextmenu', (e) => {
                            e.preventDefault();
                            showContextMenu(e.clientX, e.clientY, `blog-post-${post.id}`);
                        });
                    }
                    postsDiv.appendChild(postDiv);
                });
                blogControls.style.display = currentUser === 'Malte Stoepke' ? 'block' : 'none';
                blogForm.style.display = 'none';
                document.querySelector('.blog-status-bar').textContent = `Loaded ${posts.length} posts`;
                window.blogHistory = window.blogHistory || [];
                window.blogHistoryIndex = -1;
            };
            request.onerror = (e) => {
                console.error('Error loading blog posts:', e);
                document.querySelector('.blog-status-bar').textContent = 'Error loading posts';
            };
        }
    }, 200);
    
    playSound('click-sound');
}

function showPostInWindow(post, blogWindow) {
    const postsDiv = blogWindow.querySelector('#blog-posts');
    const blogControls = blogWindow.querySelector('#blog-controls');
    const blogForm = blogWindow.querySelector('#blog-form');
    
    postsDiv.innerHTML = '<div class="loading-bar"><div class="loading-progress" id="loading-progress"></div></div>';
    document.querySelector('.blog-status-bar').textContent = 'Loading post...';
    
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            postsDiv.innerHTML = `
                <div class="blog-post single-post">
                    <h3>${post.title}</h3>
                    <div class="date">${post.date}</div>
                    <img src="${post.image}" alt="${post.title}">
                    <p>${post.content}</p>
                </div>
            `;
            blogControls.style.display = 'none';
            blogForm.style.display = 'none';
            document.querySelector('.blog-status-bar').textContent = 'Viewing post';
            window.blogHistory = window.blogHistory || [];
            window.blogHistory.push(post.id);
            window.blogHistoryIndex = window.blogHistory.length - 1;
        }
    }, 200);
    
    playSound('click-sound');
}

function toggleBlogForm() {
    const form = document.getElementById('blog-form');
    const postsDiv = document.getElementById('blog-posts');
    const blogControls = document.getElementById('blog-controls');
    
    form.classList.toggle('active');
    if (form.classList.contains('active')) {
        postsDiv.style.display = 'none';
        blogControls.style.display = 'none';
        document.querySelector('.blog-status-bar').textContent = 'Adding new post...';
    } else {
        postsDiv.style.display = 'block';
        blogControls.style.display = currentUser === 'Malte Stoepke' ? 'block' : 'none';
        document.querySelector('.blog-status-bar').textContent = 'Ready';
    }
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
        document.querySelector('.blog-status-bar').textContent = 'Error: Title and content required';
        return;
    }
    
    const post = { 
        title, 
        date, 
        image: image || 'https://images.unsplash.com/photo-1516321310767-0a198e8a07e0', 
        content 
    };
    
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    const request = store.add(post);
    
    request.onsuccess = () => {
        playSound('click-sound');
        alert('Blog post added!');
        document.getElementById('blog-title').value = '';
        document.getElementById('blog-image').value = '';
        document.getElementById('blog-content').value = '';
        toggleBlogForm();
        loadBlogPosts(db, currentUser);
        document.querySelector('.blog-status-bar').textContent = 'Post saved successfully';
    };
    
    request.onerror = (e) => {
        console.error('Error saving blog post:', e);
        playSound('error-sound');
        alert('Error saving blog post.');
        document.querySelector('.blog-status-bar').textContent = 'Error saving post';
    };
}

function saveBlogPostEdit(postId) {
    const postDiv = document.querySelector(`.blog-post[data-id="blog-post-${postId}"]`);
    const title = postDiv.querySelector('h3').textContent;
    const content = postDiv.querySelector('p').textContent;
    
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    const request = store.get(postId);
    
    request.onsuccess = () => {
        const post = request.result;
        post.title = title;
        post.content = content;
        const updateRequest = store.put(post);
        
        updateRequest.onsuccess = () => {
            playSound('click-sound');
            alert('Blog post updated!');
            document.querySelector('.blog-status-bar').textContent = 'Post updated successfully';
        };
        
        updateRequest.onerror = (e) => {
            console.error('Error updating blog post:', e);
            playSound('error-sound');
            alert('Error updating blog post.');
            document.querySelector('.blog-status-bar').textContent = 'Error updating post';
        };
    };
    
    request.onerror = (e) => {
        console.error('Error fetching blog post:', e);
        playSound('error-sound');
        alert('Error fetching blog post.');
        document.querySelector('.blog-status-bar').textContent = 'Error fetching post';
    };
}

function deleteBlogPost(postId) {
    const transaction = db.transaction(['blogPosts'], 'readwrite');
    const store = transaction.objectStore('blogPosts');
    const request = store.delete(postId);
    
    request.onsuccess = () => {
        playSound('click-sound');
        alert('Blog post deleted!');
        loadBlogPosts(db, currentUser);
        document.querySelector('.blog-status-bar').textContent = 'Post deleted successfully';
    };
    
    request.onerror = (e) => {
        console.error('Error deleting blog post:', e);
        playSound('error-sound');
        alert('Error deleting blog post.');
        document.querySelector('.blog-status-bar').textContent = 'Error deleting post';
    };
}

function goBack() {
    if (!window.blogHistory || window.blogHistoryIndex <= -1) {
        playSound('error-sound');
        document.querySelector('.blog-status-bar').textContent = 'No previous page';
        return;
    }
    
    const blogWindow = document.getElementById('blog-window');
    const postsDiv = blogWindow.querySelector('#blog-posts');
    postsDiv.innerHTML = '<div class="loading-bar"><div class="loading-progress" id="loading-progress"></div></div>';
    document.querySelector('.blog-status-bar').textContent = 'Navigating back...';
    
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            if (window.blogHistoryIndex === 0) {
                loadBlogPosts(db, currentUser);
            } else {
                window.blogHistoryIndex--;
                const postId = window.blogHistory[window.blogHistoryIndex];
                const transaction = db.transaction(['blogPosts'], 'readonly');
                const store = transaction.objectStore('blogPosts');
                const request = store.get(postId);
                
                request.onsuccess = () => {
                    const post = request.result;
                    showPostInWindow(post, blogWindow);
                    document.querySelector('.blog-status-bar').textContent = 'Navigated back';
                };
                
                request.onerror = (e) => {
                    console.error('Error navigating back:', e);
                    document.querySelector('.blog-status-bar').textContent = 'Error navigating back';
                };
            }
        }
    }, 200);
    
    playSound('click-sound');
}

function goForward() {
    if (!window.blogHistory || window.blogHistoryIndex >= window.blogHistory.length - 1) {
        playSound('error-sound');
        document.querySelector('.blog-status-bar').textContent = 'No next page';
        return;
    }
    
    const blogWindow = document.getElementById('blog-window');
    const postsDiv = blogWindow.querySelector('#blog-posts');
    postsDiv.innerHTML = '<div class="loading-bar"><div class="loading-progress" id="loading-progress"></div></div>';
    document.querySelector('.blog-status-bar').textContent = 'Navigating forward...';
    
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            window.blogHistoryIndex++;
            const postId = window.blogHistory[window.blogHistoryIndex];
            const transaction = db.transaction(['blogPosts'], 'readonly');
            const store = transaction.objectStore('blogPosts');
            const request = store.get(postId);
            
            request.onsuccess = () => {
                const post = request.result;
                showPostInWindow(post, blogWindow);
                document.querySelector('.blog-status-bar').textContent = 'Navigated forward';
            };
            
            request.onerror = (e) => {
                console.error('Error navigating forward:', e);
                document.querySelector('.blog-status-bar').textContent = 'Error navigating forward';
            };
        }
    }, 200);
    
    playSound('click-sound');
}

function refreshBlog() {
    loadBlogPosts(db, currentUser, true);
}

function goHome() {
    const blogWindow = document.getElementById('blog-window');
    const postsDiv = blogWindow.querySelector('#blog-posts');
    postsDiv.innerHTML = '<div class="loading-bar"><div class="loading-progress" id="loading-progress"></div></div>';
    document.querySelector('.blog-status-bar').textContent = 'Loading home...';
    
    let progress = 0;
    const progressBar = document.getElementById('loading-progress');
    const interval = setInterval(() => {
        progress += 20;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);
            loadBlogPosts(db, currentUser);
            window.blogHistory = [];
            window.blogHistoryIndex = -1;
        }
    }, 200);
    
    playSound('click-sound');
}
