const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Sample project data (replace with your actual project details)
const projects = [
    {
        id: "1NWEre",
        title: "ArtStation Project",
        description: "A 3D artwork project from ArtStation.",
        image: "https://via.placeholder.com/400x300?text=ArtStation+Project",
        date: new Date().toISOString()
    }
];

// API endpoint to serve projects
app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
