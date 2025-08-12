// Cops & Robbers UI JavaScript
let currentRole = null;
let selectedCharacter = null;
let selectedVehicle = null;

// Initialize the UI
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cops & Robbers UI Loaded');
    
    // Add event listeners for buttons
    document.getElementById('closeResults').addEventListener('click', function() {
        closeUI();
    });
    
    // Listen for NUI messages
    window.addEventListener('message', function(event) {
        const data = event.data;
        
        switch(data.type) {
            case 'show':
                showUI();
                break;
            case 'hide':
                hideUI();
                break;
            case 'showCharacterSelection':
                showCharacterSelection(data.characters, data.role);
                break;
            case 'showVehicleSelection':
                showVehicleSelection(data.vehicles, data.role);
                break;
            case 'showResults':
                showGameResults(data.results, data.winMessage);
                break;
            default:
                break;
        }
    });
    
    // ESC key to close UI
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeUI();
        }
    });
});

// UI Control Functions
function showUI() {
    document.getElementById('app').classList.remove('hidden');
}

function hideUI() {
    document.getElementById('app').classList.add('hidden');
    hideAllScreens();
}

function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
}

function closeUI() {
    // Send close message to FiveM
    fetch(`https://${GetParentResourceName()}/closeUI`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    });
    hideUI();
}

// Character Selection
function showCharacterSelection(characters, role) {
    currentRole = role;
    hideAllScreens();
    
    const screen = document.getElementById('characterSelection');
    const roleText = document.getElementById('roleText');
    const characterGrid = document.getElementById('characterGrid');
    
    // Update role text
    roleText.textContent = `Role: ${role === 'cop' ? 'Police Officer' : 'Robber'}`;
    roleText.style.color = role === 'cop' ? '#4ecdc4' : '#ff6b6b';
    
    // Clear existing characters
    characterGrid.innerHTML = '';
    
    // Add characters
    characters.forEach((character, index) => {
        const characterElement = createCharacterElement(character, index);
        characterGrid.appendChild(characterElement);
    });
    
    screen.classList.remove('hidden');
}

function createCharacterElement(character, index) {
    const div = document.createElement('div');
    div.className = 'character-item';
    div.dataset.model = character.model;
    
    div.innerHTML = `
        <div class="character-name">${character.label}</div>
        <div class="character-description">Model: ${character.model}</div>
    `;
    
    div.addEventListener('click', function() {
        selectCharacter(character.model, div);
    });
    
    return div;
}

function selectCharacter(model, element) {
    selectedCharacter = model;
    
    // Remove selection from all characters
    document.querySelectorAll('.character-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked character
    element.classList.add('selected');
    
    // Send selection to FiveM after a short delay
    setTimeout(() => {
        fetch(`https://${GetParentResourceName()}/selectCharacter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model
            })
        });
    }, 500);
}

// Vehicle Selection
function showVehicleSelection(vehicles, role) {
    hideAllScreens();
    
    const screen = document.getElementById('vehicleSelection');
    const roleText = document.getElementById('vehicleRoleText');
    const vehicleGrid = document.getElementById('vehicleGrid');
    
    // Update role text
    roleText.textContent = `Role: ${role === 'cop' ? 'Police Officer' : 'Robber'}`;
    roleText.style.color = role === 'cop' ? '#4ecdc4' : '#ff6b6b';
    
    // Clear existing vehicles
    vehicleGrid.innerHTML = '';
    
    // Add vehicles
    vehicles.forEach((vehicle, index) => {
        const vehicleElement = createVehicleElement(vehicle, index);
        vehicleGrid.appendChild(vehicleElement);
    });
    
    screen.classList.remove('hidden');
}

function createVehicleElement(vehicle, index) {
    const div = document.createElement('div');
    div.className = 'vehicle-item';
    div.dataset.model = vehicle.model;
    
    div.innerHTML = `
        <div class="vehicle-name">${vehicle.label}</div>
        <div class="vehicle-description">Model: ${vehicle.model}</div>
    `;
    
    div.addEventListener('click', function() {
        selectVehicle(vehicle.model, div);
    });
    
    return div;
}

function selectVehicle(model, element) {
    selectedVehicle = model;
    
    // Remove selection from all vehicles
    document.querySelectorAll('.vehicle-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Add selection to clicked vehicle
    element.classList.add('selected');
    
    // Send selection to FiveM after a short delay
    setTimeout(() => {
        fetch(`https://${GetParentResourceName()}/selectVehicle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model
            })
        });
    }, 500);
}

// Game Results
function showGameResults(results, winMessage) {
    hideAllScreens();
    
    const screen = document.getElementById('gameResults');
    const winTitle = document.getElementById('winTitle');
    const winMessageElement = document.getElementById('winMessage');
    const winMessageContainer = winMessageElement.parentElement;
    
    // Update win message
    winTitle.textContent = 'Game Results';
    winMessageElement.textContent = winMessage;
    
    // Style based on winner
    if (results.winners === 'cops') {
        winMessageContainer.className = 'win-message cops';
        winMessageElement.style.color = '#4ecdc4';
    } else if (results.winners === 'robbers') {
        winMessageContainer.className = 'win-message robbers';
        winMessageElement.style.color = '#ff6b6b';
    } else {
        winMessageContainer.className = 'win-message';
        winMessageElement.style.color = '#ffffff';
    }
    
    // Update statistics
    updateGameStats(results);
    
    screen.classList.remove('hidden');
}

function updateGameStats(results) {
    const gameDuration = formatTime(results.gameTime);
    const totalPlayers = results.totalPlayers;
    const policeCount = results.copsCount;
    const robbersCount = results.robbersCount;
    const arrestsCount = results.arrestedCount;
    
    document.getElementById('gameDuration').textContent = gameDuration;
    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('policeCount').textContent = policeCount;
    document.getElementById('robbersCount').textContent = robbersCount;
    document.getElementById('arrestsCount').textContent = arrestsCount;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Loading Screen
function showLoading(text = 'Loading...') {
    hideAllScreens();
    
    const screen = document.getElementById('loadingScreen');
    const loadingText = document.getElementById('loadingText');
    
    loadingText.textContent = text;
    screen.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingScreen').classList.add('hidden');
}

// Utility Functions
function GetParentResourceName() {
    return window.location.hostname;
}

// Add some visual effects
function addVisualEffects() {
    // Add floating particles effect
    const particlesContainer = document.createElement('div');
    particlesContainer.style.position = 'fixed';
    particlesContainer.style.top = '0';
    particlesContainer.style.left = '0';
    particlesContainer.style.width = '100%';
    particlesContainer.style.height = '100%';
    particlesContainer.style.pointerEvents = 'none';
    particlesContainer.style.zIndex = '999';
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = 'rgba(78, 205, 196, 0.6)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s ease-in-out infinite`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        particlesContainer.appendChild(particle);
    }
    
    document.body.appendChild(particlesContainer);
}

// CSS for floating animation
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.7;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize visual effects when page loads
window.addEventListener('load', function() {
    addVisualEffects();
});