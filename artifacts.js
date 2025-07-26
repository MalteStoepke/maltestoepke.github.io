const artifacts = [
    {
        name: "Friedrich",
        firstImage: "https://cdna.artstation.com/p/assets/images/images/085/985/342/large/malte-friedrich-artsy-frontal-neutral.jpg?1742133400",
        openFunction: "openFriedrich"
    }
    // Add more artifacts here in the same format
];

function showArtifactMenu(x, y) {
    // Remove existing menu if present
    const existingMenu = document.getElementById('artifact-menu');
    if (existingMenu) {
        existingMenu.remove();
    }

    // Create menu
    const menu = document.createElement('div');
    menu.id = 'artifact-menu';
    menu.className = 'context-menu';
    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
    menu.style.zIndex = 10001; // Above other elements
    menu.innerHTML = `
        <ul>
            ${artifacts.map(artifact => `
                <li onclick="${artifact.openFunction}(); document.getElementById('artifact-menu').remove(); playSound('click-sound')">
                    <img src="https://win98icons.alexmeub.com/icons/png/directory_closed-4.png" style="width: 16px; height: 16px; margin-right: 8px;">
                    ${artifact.name}
                </li>
            `).join('')}
        </ul>
    `;
    document.body.appendChild(menu);
    window.playSound('click-sound');
}

// Close menu when clicking elsewhere
document.addEventListener('click', (e) => {
    const menu = document.getElementById('artifact-menu');
    if (menu && !menu.contains(e.target)) {
        menu.remove();
    }
});
