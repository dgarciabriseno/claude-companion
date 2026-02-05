/**
 * Blobby - Virtual Pet Game
 * A cute virtual pet with feeding, petting, and dress-up features
 */

// ===== Game Configuration =====
const CONFIG = {
    STORAGE_KEY: 'blobby_pet_data',
    DECAY_INTERVAL: 30000, // Stats decay every 30 seconds
    DECAY_AMOUNT: 2,
    FEED_AMOUNT: 15,
    PET_AMOUNT: 10,
    MAX_STAT: 100,
    MIN_STAT: 0,
    COOLDOWN_FEED: 500,
    COOLDOWN_PET: 300,
};

// ===== Wardrobe Items =====
const WARDROBE = {
    hats: [
        { id: 'none', emoji: '✕', name: 'None' },
        { id: 'bow', emoji: '🎀', name: 'Bow', svg: `<g class="accessory hat-bow"><circle cx="130" cy="55" r="12" fill="#FF69B4"/><circle cx="150" cy="55" r="12" fill="#FF69B4"/><circle cx="140" cy="55" r="6" fill="#FF1493"/></g>` },
        { id: 'crown', emoji: '👑', name: 'Crown', svg: `<g class="accessory hat-crown"><path d="M75 55 L85 35 L100 50 L115 35 L125 55 Z" fill="#FFD700" stroke="#FFA500" stroke-width="2"/><circle cx="85" cy="40" r="4" fill="#FF69B4"/><circle cx="100" cy="45" r="4" fill="#87CEEB"/><circle cx="115" cy="40" r="4" fill="#FF69B4"/></g>` },
        { id: 'cap', emoji: '🧢', name: 'Cap', svg: `<g class="accessory hat-cap"><ellipse cx="100" cy="60" rx="45" ry="15" fill="#4169E1"/><path d="M55 60 Q55 40 100 40 Q145 40 145 60" fill="#4169E1"/><ellipse cx="55" cy="62" rx="20" ry="8" fill="#4169E1"/></g>` },
        { id: 'flower', emoji: '🌸', name: 'Flower', svg: `<g class="accessory hat-flower"><circle cx="135" cy="60" r="8" fill="#FFB6C1"/><circle cx="145" cy="68" r="8" fill="#FFB6C1"/><circle cx="145" cy="52" r="8" fill="#FFB6C1"/><circle cx="155" cy="60" r="8" fill="#FFB6C1"/><circle cx="145" cy="60" r="5" fill="#FFD700"/></g>` },
        { id: 'party', emoji: '🎉', name: 'Party Hat', svg: `<g class="accessory hat-party"><path d="M100 25 L80 70 L120 70 Z" fill="#FF69B4"/><circle cx="100" cy="25" r="6" fill="#FFD700"/><circle cx="90" cy="50" r="3" fill="#87CEEB"/><circle cx="105" cy="45" r="3" fill="#98FB98"/><circle cx="95" cy="60" r="3" fill="#FFD700"/></g>` },
    ],
    accessories: [
        { id: 'none', emoji: '✕', name: 'None' },
        { id: 'glasses', emoji: '🕶️', name: 'Glasses', svg: `<g class="accessory glasses"><ellipse cx="75" cy="100" rx="18" ry="14" fill="none" stroke="#333" stroke-width="3"/><ellipse cx="125" cy="100" rx="18" ry="14" fill="none" stroke="#333" stroke-width="3"/><path d="M93 100 L107 100" stroke="#333" stroke-width="3"/></g>` },
        { id: 'bowtie', emoji: '🎀', name: 'Bowtie', svg: `<g class="accessory bowtie"><path d="M80 155 L100 165 L80 175 Z" fill="#FF69B4"/><path d="M120 155 L100 165 L120 175 Z" fill="#FF69B4"/><circle cx="100" cy="165" r="5" fill="#FF1493"/></g>` },
        { id: 'scarf', emoji: '🧣', name: 'Scarf', svg: `<g class="accessory scarf"><path d="M50 140 Q100 155 150 140" stroke="#E74C3C" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M50 140 Q100 155 150 140" stroke="#C0392B" stroke-width="4" stroke-dasharray="8 8" fill="none"/></g>` },
        { id: 'necklace', emoji: '📿', name: 'Necklace', svg: `<g class="accessory necklace"><path d="M60 130 Q100 160 140 130" stroke="#FFD700" stroke-width="3" fill="none"/><circle cx="100" cy="155" r="8" fill="#E74C3C"/></g>` },
        { id: 'star', emoji: '⭐', name: 'Star Badge', svg: `<g class="accessory star"><polygon points="165,115 168,125 178,125 170,132 173,142 165,136 157,142 160,132 152,125 162,125" fill="#FFD700"/></g>` },
    ],
    colors: [
        { id: 'pink', emoji: '', name: 'Pink', color: '#FFB6C1', blush: '#FF8FAB' },
        { id: 'blue', emoji: '', name: 'Blue', color: '#87CEEB', blush: '#5DADE2' },
        { id: 'purple', emoji: '', name: 'Purple', color: '#DDA0DD', blush: '#BA68C8' },
        { id: 'mint', emoji: '', name: 'Mint', color: '#98FB98', blush: '#66BB6A' },
        { id: 'peach', emoji: '', name: 'Peach', color: '#FFDAB9', blush: '#FFAB91' },
        { id: 'lavender', emoji: '', name: 'Lavender', color: '#E6E6FA', blush: '#B39DDB' },
        { id: 'yellow', emoji: '', name: 'Yellow', color: '#FFFACD', blush: '#FFE082' },
        { id: 'coral', emoji: '', name: 'Coral', color: '#F08080', blush: '#E57373' },
    ],
};

// ===== Game State =====
let gameState = {
    happiness: 80,
    hunger: 70,
    outfit: {
        hat: 'none',
        accessory: 'none',
        color: 'pink',
    },
    lastUpdate: Date.now(),
};

// ===== DOM Elements =====
const elements = {
    pet: document.getElementById('pet'),
    petContainer: document.getElementById('petContainer'),
    happinessBar: document.getElementById('happinessBar'),
    hungerBar: document.getElementById('hungerBar'),
    feedBtn: document.getElementById('feedBtn'),
    petBtn: document.getElementById('petBtn'),
    dressBtn: document.getElementById('dressBtn'),
    dressModal: document.getElementById('dressModal'),
    closeModal: document.getElementById('closeModal'),
    floatingItems: document.getElementById('floatingItems'),
    reactionBubble: document.getElementById('reactionBubble'),
    accessories: document.getElementById('accessories'),
    hatsGrid: document.getElementById('hatsGrid'),
    accessoriesGrid: document.getElementById('accessoriesGrid'),
    colorsGrid: document.getElementById('colorsGrid'),
};

// ===== Cooldown State =====
let cooldowns = {
    feed: false,
    pet: false,
};

// ===== Initialize Game =====
function init() {
    loadGameState();
    calculateDecay();
    updateUI();
    setupEventListeners();
    renderWardrobe();
    applyOutfit();
    startDecayTimer();

    // Start idle animation
    elements.pet.classList.add('idle');
}

// ===== Local Storage =====
function loadGameState() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            gameState = {
                ...gameState,
                ...parsed,
                outfit: {
                    ...gameState.outfit,
                    ...parsed.outfit,
                },
            };
        }
    } catch (e) {
        console.warn('Failed to load saved game state:', e);
    }
}

function saveGameState() {
    try {
        gameState.lastUpdate = Date.now();
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.warn('Failed to save game state:', e);
    }
}

// ===== Stat Decay =====
function calculateDecay() {
    const now = Date.now();
    const elapsed = now - gameState.lastUpdate;
    const decayTicks = Math.floor(elapsed / CONFIG.DECAY_INTERVAL);

    if (decayTicks > 0) {
        const totalDecay = decayTicks * CONFIG.DECAY_AMOUNT;
        gameState.happiness = Math.max(CONFIG.MIN_STAT, gameState.happiness - totalDecay);
        gameState.hunger = Math.max(CONFIG.MIN_STAT, gameState.hunger - totalDecay);
        gameState.lastUpdate = now;
        saveGameState();
    }
}

function startDecayTimer() {
    setInterval(() => {
        gameState.happiness = Math.max(CONFIG.MIN_STAT, gameState.happiness - CONFIG.DECAY_AMOUNT);
        gameState.hunger = Math.max(CONFIG.MIN_STAT, gameState.hunger - CONFIG.DECAY_AMOUNT);
        updateUI();
        saveGameState();

        // Pet gets sad when stats are low
        if (gameState.happiness < 30 || gameState.hunger < 30) {
            showReaction('😢');
        }
    }, CONFIG.DECAY_INTERVAL);
}

// ===== UI Updates =====
function updateUI() {
    elements.happinessBar.style.width = `${gameState.happiness}%`;
    elements.hungerBar.style.width = `${gameState.hunger}%`;
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Feed button
    elements.feedBtn.addEventListener('click', feedPet);

    // Pet button
    elements.petBtn.addEventListener('click', petThePet);

    // Also allow clicking/tapping on pet directly to pet it
    elements.pet.addEventListener('click', petThePet);

    // Dress button
    elements.dressBtn.addEventListener('click', openDressModal);

    // Close modal
    elements.closeModal.addEventListener('click', closeDressModal);
    elements.dressModal.addEventListener('click', (e) => {
        if (e.target === elements.dressModal) {
            closeDressModal();
        }
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.dressModal.classList.contains('show')) {
            closeDressModal();
        }
    });
}

// ===== Actions =====
function feedPet() {
    if (cooldowns.feed) return;

    cooldowns.feed = true;
    elements.feedBtn.disabled = true;

    // Increase hunger (fullness)
    gameState.hunger = Math.min(CONFIG.MAX_STAT, gameState.hunger + CONFIG.FEED_AMOUNT);
    // Feeding also makes pet a little happy
    gameState.happiness = Math.min(CONFIG.MAX_STAT, gameState.happiness + 5);

    updateUI();
    saveGameState();

    // Animation
    playAnimation('eating');
    showFloatingItem('🍎', 'food');
    showReaction('😋');

    // Cooldown
    setTimeout(() => {
        cooldowns.feed = false;
        elements.feedBtn.disabled = false;
    }, CONFIG.COOLDOWN_FEED);
}

function petThePet() {
    if (cooldowns.pet) return;

    cooldowns.pet = true;
    elements.petBtn.disabled = true;

    // Increase happiness
    gameState.happiness = Math.min(CONFIG.MAX_STAT, gameState.happiness + CONFIG.PET_AMOUNT);

    updateUI();
    saveGameState();

    // Animation
    playAnimation('happy');
    showFloatingItem('💕', 'heart');
    showReaction(getHappyReaction());

    // Switch to happy eyes temporarily
    showHappyEyes();

    // Cooldown
    setTimeout(() => {
        cooldowns.pet = false;
        elements.petBtn.disabled = false;
    }, CONFIG.COOLDOWN_PET);
}

function getHappyReaction() {
    const reactions = ['💖', '😊', '🥰', '✨', '💕'];
    return reactions[Math.floor(Math.random() * reactions.length)];
}

// ===== Animations =====
function playAnimation(type) {
    elements.pet.classList.remove('idle', 'happy', 'eating');

    // Force reflow to restart animation
    void elements.pet.offsetWidth;

    elements.pet.classList.add(type);

    if (type === 'eating') {
        showEatingMouth();
    }

    setTimeout(() => {
        elements.pet.classList.remove(type);
        elements.pet.classList.add('idle');
        hideEatingMouth();
    }, 500);
}

function showHappyEyes() {
    const normalEyes = elements.pet.querySelector('.eyes');
    const happyEyes = elements.pet.querySelector('.happy-eyes');

    normalEyes.style.display = 'none';
    happyEyes.style.display = 'block';

    setTimeout(() => {
        normalEyes.style.display = 'block';
        happyEyes.style.display = 'none';
    }, 600);
}

function showEatingMouth() {
    const normalMouth = elements.pet.querySelector('.mouth');
    const eatingMouth = elements.pet.querySelector('.eating-mouth');

    normalMouth.style.display = 'none';
    eatingMouth.style.display = 'block';
}

function hideEatingMouth() {
    const normalMouth = elements.pet.querySelector('.mouth');
    const eatingMouth = elements.pet.querySelector('.eating-mouth');

    normalMouth.style.display = 'block';
    eatingMouth.style.display = 'none';
}

function showFloatingItem(emoji, type) {
    const item = document.createElement('div');
    item.className = `floating-item ${type === 'food' ? 'food-item' : ''}`;
    item.textContent = emoji;

    // Random position around the pet
    const offsetX = Math.random() * 100 - 50;
    const offsetY = type === 'food' ? 0 : Math.random() * 50;

    item.style.left = `calc(50% + ${offsetX}px)`;
    item.style.top = `calc(50% + ${offsetY}px)`;

    elements.floatingItems.appendChild(item);

    // Remove after animation
    setTimeout(() => {
        item.remove();
    }, 1000);
}

function showReaction(emoji) {
    elements.reactionBubble.textContent = emoji;
    elements.reactionBubble.classList.add('show');

    setTimeout(() => {
        elements.reactionBubble.classList.remove('show');
    }, 1500);
}

// ===== Dress Up Modal =====
function openDressModal() {
    elements.dressModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeDressModal() {
    elements.dressModal.classList.remove('show');
    document.body.style.overflow = '';
}

function renderWardrobe() {
    // Render hats
    WARDROBE.hats.forEach(item => {
        const btn = createWardrobeItem(item, 'hat');
        elements.hatsGrid.appendChild(btn);
    });

    // Render accessories
    WARDROBE.accessories.forEach(item => {
        const btn = createWardrobeItem(item, 'accessory');
        elements.accessoriesGrid.appendChild(btn);
    });

    // Render colors
    WARDROBE.colors.forEach(item => {
        const btn = createColorItem(item);
        elements.colorsGrid.appendChild(btn);
    });
}

function createWardrobeItem(item, type) {
    const btn = document.createElement('button');
    btn.className = 'wardrobe-item';
    btn.dataset.id = item.id;
    btn.dataset.type = type;
    btn.textContent = item.emoji;
    btn.setAttribute('aria-label', item.name);

    if (item.id === 'none') {
        btn.classList.add('none');
    }

    if (gameState.outfit[type] === item.id) {
        btn.classList.add('selected');
    }

    btn.addEventListener('click', () => selectWardrobeItem(item, type, btn));

    return btn;
}

function createColorItem(item) {
    const btn = document.createElement('button');
    btn.className = 'wardrobe-item color-item';
    btn.dataset.id = item.id;
    btn.dataset.type = 'color';
    btn.style.background = item.color;
    btn.setAttribute('aria-label', item.name);

    if (gameState.outfit.color === item.id) {
        btn.classList.add('selected');
    }

    btn.addEventListener('click', () => selectColorItem(item, btn));

    return btn;
}

function selectWardrobeItem(item, type, btn) {
    // Update state
    gameState.outfit[type] = item.id;
    saveGameState();

    // Update UI
    const grid = type === 'hat' ? elements.hatsGrid : elements.accessoriesGrid;
    grid.querySelectorAll('.wardrobe-item').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Apply to pet
    applyOutfit();

    // Happy reaction
    if (item.id !== 'none') {
        playAnimation('happy');
        showReaction('✨');
    }
}

function selectColorItem(item, btn) {
    // Update state
    gameState.outfit.color = item.id;
    saveGameState();

    // Update UI
    elements.colorsGrid.querySelectorAll('.wardrobe-item').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Apply to pet
    applyPetColor(item);

    // Happy reaction
    playAnimation('happy');
    showReaction('🌈');
}

function applyOutfit() {
    // Clear existing accessories
    elements.accessories.innerHTML = '';

    // Apply hat
    const hat = WARDROBE.hats.find(h => h.id === gameState.outfit.hat);
    if (hat && hat.svg) {
        elements.accessories.innerHTML += hat.svg;
    }

    // Apply accessory
    const accessory = WARDROBE.accessories.find(a => a.id === gameState.outfit.accessory);
    if (accessory && accessory.svg) {
        elements.accessories.innerHTML += accessory.svg;
    }

    // Apply color
    const color = WARDROBE.colors.find(c => c.id === gameState.outfit.color);
    if (color) {
        applyPetColor(color);
    }
}

function applyPetColor(colorItem) {
    const petBody = elements.pet.querySelector('.pet-body');
    const ears = elements.pet.querySelectorAll('.ear:not(.ear-inner)');
    const arms = elements.pet.querySelectorAll('.arm');
    const feet = elements.pet.querySelectorAll('.foot');
    const blushes = elements.pet.querySelectorAll('.blush');
    const earInners = elements.pet.querySelectorAll('.ear-inner');

    // Apply main color
    petBody.setAttribute('fill', colorItem.color);
    ears.forEach(ear => ear.setAttribute('fill', colorItem.color));
    arms.forEach(arm => arm.setAttribute('fill', colorItem.color));
    feet.forEach(foot => foot.setAttribute('fill', colorItem.color));

    // Apply blush color
    blushes.forEach(blush => blush.setAttribute('fill', colorItem.blush));
    earInners.forEach(inner => inner.setAttribute('fill', colorItem.blush));
}

// ===== Start the game =====
document.addEventListener('DOMContentLoaded', init);
