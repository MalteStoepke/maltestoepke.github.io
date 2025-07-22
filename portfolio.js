async function fetchPortfolioProjects() {
    // Mock data as a fallback
    const mockData = [{
        id: "1NWEre",
        title: "Sample Project",
        description: "A sample 3D artwork project from ArtStation.",
        image: "https://via.placeholder.com/400x300?text=Sample+Project",
        date: new Date().toISOString(),
        source: "server"
    }];

    try {
        // Replace with your Render server URL after deployment
        const serverUrl = 'https://your-portfolio-server.onrender.com/api/projects';
        const response = await fetch(serverUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const projects = await response.json();

        // Validate response data
        if (!Array.isArray(projects) || projects.length === 0) {
            throw new Error('Invalid server response: Expected an array of projects');
        }

        const transaction = db.transaction(['artworks'], 'readwrite');
        const store = transaction.objectStore('artworks');
        
        // Clear existing server-sourced artworks to avoid duplicates
        const existingArtworks = await store.getAll();
        existingArtworks.onsuccess = async () => {
            const artworks = existingArtworks.target.result;
            for (let art of artworks) {
                if (art.source === 'server') {
                    await store.delete(art.id);
                }
            }
            
            // Add server projects
            projects.forEach(project => {
                if (project.title && project.image) {
                    const artwork = {
                        id: project.id,
                        title: project.title,
                        description: project.description || 'No description available.',
                        image: project.image,
                        date: new Date(project.date || Date.now()),
                        source: 'server'
                    };
                    store.add(artwork);
                }
            });
            
            transaction.oncomplete = () => {
                console.log('Server projects added to database.');
                loadArtworks();
                if (window.clippyAgent) {
                    window.clippyAgent.speak('Successfully loaded portfolio projects from server!');
                }
            };
        };
        
    } catch (error) {
        console.error('Error fetching server projects:', error.message);
        playSound('error-sound');
        if (window.clippyAgent) {
            window.clippyAgent.speak('Failed to load projects from server. Using sample data instead.');
        }

        // Fallback to mock data
        const transaction = db.transaction(['artworks'], 'readwrite');
        const store = transaction.objectStore('artworks');
        
        const existingArtworks = await store.getAll();
        existingArtworks.onsuccess = async () => {
            const artworks = existingArtworks.target.result;
            for (let art of artworks) {
                if (art.source === 'server') {
                    await store.delete(art.id);
                }
            }
            
            mockData.forEach(project => {
                const artwork = {
                    id: project.id,
                    title: project.title,
                    description: project.description,
                    image: project.image,
                    date: new Date(project.date),
                    source: 'server'
                };
                store.add(artwork);
            });
            
            transaction.oncomplete = () => {
                console.log('Mock server projects added to database.');
                loadArtworks();
            };
        };
    }
}
