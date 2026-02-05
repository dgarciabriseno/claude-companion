/**
 * Blobby - Virtual Pet Game
 * A cute virtual pet with feeding, petting, dress-up, and minigames
 * Features a coin economy that creates anxious attachment
 */

// ===== Game Configuration =====
const CONFIG = {
    STORAGE_KEY: 'blobby_pet_data',
    DECAY_INTERVAL: 20000, // Stats decay every 20 seconds (faster = more anxiety)
    DECAY_AMOUNT: 3, // Higher decay for more urgency
    FEED_AMOUNT: 12,
    PET_AMOUNT: 8,
    MAX_STAT: 100,
    MIN_STAT: 0,
    COOLDOWN_FEED: 500,
    COOLDOWN_PET: 300,
    FOOD_COST: 5, // Cost to feed pet
    STARTING_COINS: 10, // Just enough for 2 feedings to start
};

// ===== Shop Prices =====
const PRICES = {
    hats: {
        none: 0,
        bow: 25,
        crown: 50,
        cap: 30,
        flower: 20,
        party: 35,
    },
    accessories: {
        none: 0,
        glasses: 20,
        bowtie: 25,
        scarf: 35,
        necklace: 40,
        star: 30,
    },
    colors: {
        pink: 0, // Default color is free
        blue: 15,
        purple: 20,
        mint: 15,
        peach: 20,
        lavender: 25,
        yellow: 15,
        coral: 20,
    },
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
    coins: CONFIG.STARTING_COINS,
    happiness: 60,
    hunger: 50,
    outfit: {
        hat: 'none',
        accessory: 'none',
        color: 'pink',
    },
    owned: {
        hats: ['none'],
        accessories: ['none'],
        colors: ['pink'],
    },
    lastUpdate: Date.now(),
};

// ===== DOM Elements =====
const elements = {
    pet: document.getElementById('pet'),
    petContainer: document.getElementById('petContainer'),
    happinessBar: document.getElementById('happinessBar'),
    hungerBar: document.getElementById('hungerBar'),
    coinAmount: document.getElementById('coinAmount'),
    feedBtn: document.getElementById('feedBtn'),
    petBtn: document.getElementById('petBtn'),
    dressBtn: document.getElementById('dressBtn'),
    gamesBtn: document.getElementById('gamesBtn'),
    dressModal: document.getElementById('dressModal'),
    gamesModal: document.getElementById('gamesModal'),
    closeModal: document.getElementById('closeModal'),
    closeGamesModal: document.getElementById('closeGamesModal'),
    floatingItems: document.getElementById('floatingItems'),
    reactionBubble: document.getElementById('reactionBubble'),
    accessories: document.getElementById('accessories'),
    hatsGrid: document.getElementById('hatsGrid'),
    accessoriesGrid: document.getElementById('accessoriesGrid'),
    colorsGrid: document.getElementById('colorsGrid'),
    modalCoins: document.getElementById('modalCoins'),
    gamesModalCoins: document.getElementById('gamesModalCoins'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    // Game elements
    gamesList: document.querySelector('.games-list'),
    memoryGame: document.getElementById('memoryGame'),
    reactionGame: document.getElementById('reactionGame'),
    sequenceGame: document.getElementById('sequenceGame'),
    gameResult: document.getElementById('gameResult'),
    playMemory: document.getElementById('playMemory'),
    playReaction: document.getElementById('playReaction'),
    playSequence: document.getElementById('playSequence'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToGamesBtn: document.getElementById('backToGamesBtn'),
};

// ===== Cooldown State =====
let cooldowns = {
    feed: false,
    pet: false,
};

// ===== Current Game State =====
let currentGame = null;
let gameTimers = [];

// ===== Initialize Game =====
function init() {
    loadGameState();
    calculateDecay();
    updateUI();
    setupEventListeners();
    renderWardrobe();
    applyOutfit();
    startDecayTimer();
    updatePetMood();

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
                outfit: { ...gameState.outfit, ...parsed.outfit },
                owned: {
                    hats: parsed.owned?.hats || ['none'],
                    accessories: parsed.owned?.accessories || ['none'],
                    colors: parsed.owned?.colors || ['pink'],
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
        updatePetMood();
        saveGameState();

        // Pet shows distress when stats are low
        if (gameState.hunger < 20) {
            showReaction('😭');
        } else if (gameState.happiness < 30 || gameState.hunger < 30) {
            showReaction('😢');
        }
    }, CONFIG.DECAY_INTERVAL);
}

// ===== Pet Mood =====
function updatePetMood() {
    elements.pet.classList.remove('sad');
    if (gameState.hunger < 25 || gameState.happiness < 25) {
        elements.pet.classList.add('sad');
    }
}

// ===== UI Updates =====
function updateUI() {
    elements.happinessBar.style.width = `${gameState.happiness}%`;
    elements.hungerBar.style.width = `${gameState.hunger}%`;
    elements.coinAmount.textContent = gameState.coins;

    if (elements.modalCoins) elements.modalCoins.textContent = gameState.coins;
    if (elements.gamesModalCoins) elements.gamesModalCoins.textContent = gameState.coins;

    // Update feed button affordability
    if (gameState.coins < CONFIG.FOOD_COST) {
        elements.feedBtn.classList.add('cant-afford');
    } else {
        elements.feedBtn.classList.remove('cant-afford');
    }
}

// ===== Toast Notifications =====
function showToast(message, icon = '😰') {
    elements.toastMessage.textContent = message;
    elements.toast.querySelector('.toast-icon').textContent = icon;
    elements.toast.classList.add('show');

    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 2500);
}

// ===== Event Listeners =====
function setupEventListeners() {
    elements.feedBtn.addEventListener('click', feedPet);
    elements.petBtn.addEventListener('click', petThePet);
    elements.pet.addEventListener('click', petThePet);
    elements.dressBtn.addEventListener('click', openDressModal);
    elements.gamesBtn.addEventListener('click', openGamesModal);

    elements.closeModal.addEventListener('click', closeDressModal);
    elements.dressModal.addEventListener('click', (e) => {
        if (e.target === elements.dressModal) closeDressModal();
    });

    elements.closeGamesModal.addEventListener('click', closeGamesModal);
    elements.gamesModal.addEventListener('click', (e) => {
        if (e.target === elements.gamesModal) closeGamesModal();
    });

    // Game selection
    elements.playMemory.addEventListener('click', startMemoryGame);
    elements.playReaction.addEventListener('click', startReactionGame);
    elements.playSequence.addEventListener('click', startSequenceGame);

    elements.playAgainBtn.addEventListener('click', () => {
        if (currentGame) {
            elements.gameResult.style.display = 'none';
            if (currentGame === 'memory') startMemoryGame();
            else if (currentGame === 'reaction') startReactionGame();
            else if (currentGame === 'sequence') startSequenceGame();
        }
    });

    elements.backToGamesBtn.addEventListener('click', backToGamesList);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.dressModal.classList.contains('show')) closeDressModal();
            if (elements.gamesModal.classList.contains('show')) closeGamesModal();
        }
    });
}

// ===== Actions =====
function feedPet() {
    if (cooldowns.feed) return;

    // Check if can afford
    if (gameState.coins < CONFIG.FOOD_COST) {
        showToast("Not enough coins to feed...", '😰');
        showReaction('😢');
        return;
    }

    cooldowns.feed = true;
    elements.feedBtn.disabled = true;

    // Deduct coins
    gameState.coins -= CONFIG.FOOD_COST;

    // Increase hunger (fullness)
    gameState.hunger = Math.min(CONFIG.MAX_STAT, gameState.hunger + CONFIG.FEED_AMOUNT);
    gameState.happiness = Math.min(CONFIG.MAX_STAT, gameState.happiness + 3);

    updateUI();
    updatePetMood();
    saveGameState();

    playAnimation('eating');
    showFloatingItem('🍎', 'food');
    showReaction('😋');

    setTimeout(() => {
        cooldowns.feed = false;
        elements.feedBtn.disabled = false;
    }, CONFIG.COOLDOWN_FEED);
}

function petThePet() {
    if (cooldowns.pet) return;

    cooldowns.pet = true;
    elements.petBtn.disabled = true;

    gameState.happiness = Math.min(CONFIG.MAX_STAT, gameState.happiness + CONFIG.PET_AMOUNT);

    updateUI();
    updatePetMood();
    saveGameState();

    playAnimation('happy');
    showFloatingItem('💕', 'heart');
    showReaction(getHappyReaction());
    showHappyEyes();

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
    elements.pet.classList.remove('idle', 'happy', 'eating', 'sad');

    void elements.pet.offsetWidth;
    elements.pet.classList.add(type);

    if (type === 'eating') showEatingMouth();

    setTimeout(() => {
        elements.pet.classList.remove(type);
        elements.pet.classList.add('idle');
        hideEatingMouth();
        updatePetMood();
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
    elements.pet.querySelector('.mouth').style.display = 'none';
    elements.pet.querySelector('.eating-mouth').style.display = 'block';
}

function hideEatingMouth() {
    elements.pet.querySelector('.mouth').style.display = 'block';
    elements.pet.querySelector('.eating-mouth').style.display = 'none';
}

function showFloatingItem(emoji, type) {
    const item = document.createElement('div');
    item.className = `floating-item ${type === 'food' ? 'food-item' : ''}`;
    item.textContent = emoji;

    const offsetX = Math.random() * 100 - 50;
    const offsetY = type === 'food' ? 0 : Math.random() * 50;

    item.style.left = `calc(50% + ${offsetX}px)`;
    item.style.top = `calc(50% + ${offsetY}px)`;

    elements.floatingItems.appendChild(item);
    setTimeout(() => item.remove(), 1000);
}

function showReaction(emoji) {
    elements.reactionBubble.textContent = emoji;
    elements.reactionBubble.classList.add('show');
    setTimeout(() => elements.reactionBubble.classList.remove('show'), 1500);
}

// ===== Shop Modal =====
function openDressModal() {
    elements.dressModal.classList.add('show');
    elements.modalCoins.textContent = gameState.coins;
    document.body.style.overflow = 'hidden';
    updateShopItems();
}

function closeDressModal() {
    elements.dressModal.classList.remove('show');
    document.body.style.overflow = '';
}

function renderWardrobe() {
    WARDROBE.hats.forEach(item => {
        const btn = createShopItem(item, 'hats');
        elements.hatsGrid.appendChild(btn);
    });

    WARDROBE.accessories.forEach(item => {
        const btn = createShopItem(item, 'accessories');
        elements.accessoriesGrid.appendChild(btn);
    });

    WARDROBE.colors.forEach(item => {
        const btn = createColorShopItem(item);
        elements.colorsGrid.appendChild(btn);
    });
}

function createShopItem(item, category) {
    const btn = document.createElement('button');
    btn.className = 'wardrobe-item';
    btn.dataset.id = item.id;
    btn.dataset.category = category;
    btn.innerHTML = item.emoji;
    btn.setAttribute('aria-label', item.name);

    if (item.id === 'none') {
        btn.classList.add('none');
    } else {
        const price = PRICES[category][item.id];
        const priceTag = document.createElement('span');
        priceTag.className = 'item-price';
        priceTag.textContent = `🪙${price}`;
        btn.appendChild(priceTag);
    }

    btn.addEventListener('click', () => handleShopItemClick(item, category, btn));
    return btn;
}

function createColorShopItem(item) {
    const btn = document.createElement('button');
    btn.className = 'wardrobe-item color-item';
    btn.dataset.id = item.id;
    btn.dataset.category = 'colors';
    btn.style.background = item.color;
    btn.setAttribute('aria-label', item.name);

    const price = PRICES.colors[item.id];
    if (price > 0) {
        const priceTag = document.createElement('span');
        priceTag.className = 'item-price';
        priceTag.textContent = `🪙${price}`;
        priceTag.style.background = 'rgba(255,255,255,0.9)';
        btn.appendChild(priceTag);
    }

    btn.addEventListener('click', () => handleColorClick(item, btn));
    return btn;
}

function handleShopItemClick(item, category, btn) {
    const type = category === 'hats' ? 'hat' : 'accessory';
    const isOwned = gameState.owned[category].includes(item.id);

    if (isOwned || item.id === 'none') {
        // Equip item
        gameState.outfit[type] = item.id;
        saveGameState();
        updateShopItems();
        applyOutfit();

        if (item.id !== 'none') {
            playAnimation('happy');
            showReaction('✨');
        }
    } else {
        // Try to buy
        const price = PRICES[category][item.id];
        if (gameState.coins >= price) {
            gameState.coins -= price;
            gameState.owned[category].push(item.id);
            gameState.outfit[type] = item.id;
            saveGameState();
            updateUI();
            updateShopItems();
            applyOutfit();
            showToast(`Bought ${item.name}!`, '🎉');
            playAnimation('happy');
        } else {
            showToast(`Need ${price - gameState.coins} more coins...`, '😢');
        }
    }
}

function handleColorClick(item, btn) {
    const isOwned = gameState.owned.colors.includes(item.id);

    if (isOwned) {
        gameState.outfit.color = item.id;
        saveGameState();
        updateShopItems();
        applyPetColor(item);
        playAnimation('happy');
        showReaction('🌈');
    } else {
        const price = PRICES.colors[item.id];
        if (gameState.coins >= price) {
            gameState.coins -= price;
            gameState.owned.colors.push(item.id);
            gameState.outfit.color = item.id;
            saveGameState();
            updateUI();
            updateShopItems();
            applyPetColor(item);
            showToast(`New color unlocked!`, '🎨');
            playAnimation('happy');
        } else {
            showToast(`Need ${price - gameState.coins} more coins...`, '😢');
        }
    }
}

function updateShopItems() {
    // Update hats
    elements.hatsGrid.querySelectorAll('.wardrobe-item').forEach(btn => {
        const id = btn.dataset.id;
        const isOwned = gameState.owned.hats.includes(id);
        const isEquipped = gameState.outfit.hat === id;

        btn.classList.toggle('owned', isOwned && id !== 'none');
        btn.classList.toggle('equipped', isEquipped);
        btn.classList.toggle('locked', !isOwned && id !== 'none');
    });

    // Update accessories
    elements.accessoriesGrid.querySelectorAll('.wardrobe-item').forEach(btn => {
        const id = btn.dataset.id;
        const isOwned = gameState.owned.accessories.includes(id);
        const isEquipped = gameState.outfit.accessory === id;

        btn.classList.toggle('owned', isOwned && id !== 'none');
        btn.classList.toggle('equipped', isEquipped);
        btn.classList.toggle('locked', !isOwned && id !== 'none');
    });

    // Update colors
    elements.colorsGrid.querySelectorAll('.wardrobe-item').forEach(btn => {
        const id = btn.dataset.id;
        const isOwned = gameState.owned.colors.includes(id);
        const isEquipped = gameState.outfit.color === id;

        btn.classList.toggle('owned', isOwned);
        btn.classList.toggle('equipped', isEquipped);
        btn.classList.toggle('locked', !isOwned);
    });

    elements.modalCoins.textContent = gameState.coins;
}

function applyOutfit() {
    elements.accessories.innerHTML = '';

    const hat = WARDROBE.hats.find(h => h.id === gameState.outfit.hat);
    if (hat?.svg) elements.accessories.innerHTML += hat.svg;

    const accessory = WARDROBE.accessories.find(a => a.id === gameState.outfit.accessory);
    if (accessory?.svg) elements.accessories.innerHTML += accessory.svg;

    const color = WARDROBE.colors.find(c => c.id === gameState.outfit.color);
    if (color) applyPetColor(color);
}

function applyPetColor(colorItem) {
    const petBody = elements.pet.querySelector('.pet-body');
    const ears = elements.pet.querySelectorAll('.ear:not(.ear-inner)');
    const arms = elements.pet.querySelectorAll('.arm');
    const feet = elements.pet.querySelectorAll('.foot');
    const blushes = elements.pet.querySelectorAll('.blush');
    const earInners = elements.pet.querySelectorAll('.ear-inner');

    petBody.setAttribute('fill', colorItem.color);
    ears.forEach(ear => ear.setAttribute('fill', colorItem.color));
    arms.forEach(arm => arm.setAttribute('fill', colorItem.color));
    feet.forEach(foot => foot.setAttribute('fill', colorItem.color));
    blushes.forEach(blush => blush.setAttribute('fill', colorItem.blush));
    earInners.forEach(inner => inner.setAttribute('fill', colorItem.blush));
}

// ===== Games Modal =====
function openGamesModal() {
    elements.gamesModal.classList.add('show');
    elements.gamesModalCoins.textContent = gameState.coins;
    document.body.style.overflow = 'hidden';
    backToGamesList();
}

function closeGamesModal() {
    clearAllGameTimers();
    elements.gamesModal.classList.remove('show');
    document.body.style.overflow = '';
    currentGame = null;
}

function backToGamesList() {
    clearAllGameTimers();
    elements.gamesList.style.display = 'flex';
    elements.memoryGame.style.display = 'none';
    elements.reactionGame.style.display = 'none';
    elements.sequenceGame.style.display = 'none';
    elements.gameResult.style.display = 'none';
    currentGame = null;
}

function clearAllGameTimers() {
    gameTimers.forEach(t => clearInterval(t));
    gameTimers.forEach(t => clearTimeout(t));
    gameTimers = [];
}

function showGameResult(coins, success) {
    clearAllGameTimers();

    elements.memoryGame.style.display = 'none';
    elements.reactionGame.style.display = 'none';
    elements.sequenceGame.style.display = 'none';
    elements.gameResult.style.display = 'block';

    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultCoins = document.getElementById('resultCoins');

    if (coins > 0) {
        gameState.coins += coins;
        saveGameState();
        updateUI();
        elements.gamesModalCoins.textContent = gameState.coins;

        resultIcon.textContent = success ? '🎉' : '😅';
        resultText.textContent = success ? 'Great work!' : 'Not bad...';
        resultCoins.textContent = `+${coins} 🪙`;
    } else {
        resultIcon.textContent = '😢';
        resultText.textContent = 'You earned nothing...';
        resultCoins.textContent = 'Better luck next time';
    }
}

// ===== Memory Game =====
function startMemoryGame() {
    currentGame = 'memory';
    elements.gamesList.style.display = 'none';
    elements.gameResult.style.display = 'none';
    elements.memoryGame.style.display = 'block';

    const emojis = ['🍎', '🍕', '🍩', '🧁', '🍪', '🍰'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('memoryGrid');
    grid.innerHTML = '';

    let flipped = [];
    let matched = 0;
    let timeLeft = 18; // Short timer for difficulty
    let canFlip = true;

    const timerEl = document.getElementById('memoryTimer');
    const scoreEl = document.getElementById('memoryScore');

    timerEl.textContent = `⏱️ ${timeLeft}s`;
    timerEl.classList.remove('warning');
    scoreEl.textContent = `Pairs: 0/6`;

    cards.forEach((emoji, i) => {
        const card = document.createElement('button');
        card.className = 'memory-card';
        card.dataset.index = i;
        card.dataset.emoji = emoji;

        card.addEventListener('click', () => {
            if (!canFlip || card.classList.contains('flipped') || card.classList.contains('matched')) return;

            card.classList.add('flipped');
            card.textContent = emoji;
            flipped.push(card);

            if (flipped.length === 2) {
                canFlip = false;
                const [a, b] = flipped;

                if (a.dataset.emoji === b.dataset.emoji) {
                    a.classList.add('matched');
                    b.classList.add('matched');
                    matched++;
                    scoreEl.textContent = `Pairs: ${matched}/6`;
                    flipped = [];
                    canFlip = true;

                    if (matched === 6) {
                        clearInterval(timer);
                        const bonus = Math.floor(timeLeft / 3);
                        showGameResult(5 + bonus, true);
                    }
                } else {
                    const timeout = setTimeout(() => {
                        a.classList.remove('flipped');
                        b.classList.remove('flipped');
                        a.textContent = '';
                        b.textContent = '';
                        flipped = [];
                        canFlip = true;
                    }, 600);
                    gameTimers.push(timeout);
                }
            }
        });

        grid.appendChild(card);
    });

    const timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱️ ${timeLeft}s`;

        if (timeLeft <= 5) timerEl.classList.add('warning');

        if (timeLeft <= 0) {
            clearInterval(timer);
            const reward = matched >= 4 ? matched - 1 : 0;
            showGameResult(reward, false);
        }
    }, 1000);

    gameTimers.push(timer);
}

// ===== Reaction Game =====
function startReactionGame() {
    currentGame = 'reaction';
    elements.gamesList.style.display = 'none';
    elements.gameResult.style.display = 'none';
    elements.reactionGame.style.display = 'block';

    const zone = document.getElementById('reactionZone');
    const catcher = document.getElementById('catcher');
    const timerEl = document.getElementById('reactionTimer');
    const scoreEl = document.getElementById('reactionScore');

    let timeLeft = 12;
    let caught = 0;
    let missed = 0;
    let catcherX = 50;

    timerEl.textContent = `⏱️ ${timeLeft}s`;
    timerEl.classList.remove('warning');
    scoreEl.textContent = `Caught: 0`;
    catcher.style.left = '50%';

    // Clear existing targets
    zone.querySelectorAll('.catch-target').forEach(t => t.remove());

    // Touch/mouse controls
    const moveHandler = (e) => {
        const rect = zone.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        catcherX = ((clientX - rect.left) / rect.width) * 100;
        catcherX = Math.max(10, Math.min(90, catcherX));
        catcher.style.left = `${catcherX}%`;
    };

    zone.addEventListener('mousemove', moveHandler);
    zone.addEventListener('touchmove', moveHandler);

    // Spawn treats
    const treats = ['🍎', '🍕', '🍩', '🧁', '💎', '⭐'];

    function spawnTreat() {
        if (timeLeft <= 0) return;

        const target = document.createElement('div');
        target.className = 'catch-target';
        target.textContent = treats[Math.floor(Math.random() * treats.length)];

        const x = 10 + Math.random() * 80;
        target.style.left = `${x}%`;

        // Faster fall speed for difficulty
        const fallDuration = 1.2 + Math.random() * 0.5;
        target.style.animation = `fall ${fallDuration}s linear forwards`;

        zone.appendChild(target);

        // Check for catch
        const checkInterval = setInterval(() => {
            const targetRect = target.getBoundingClientRect();
            const catcherRect = catcher.getBoundingClientRect();

            const targetCenterX = targetRect.left + targetRect.width / 2;
            const catcherCenterX = catcherRect.left + catcherRect.width / 2;

            // Check if target is at catcher height and close enough
            if (targetRect.bottom >= catcherRect.top && targetRect.top <= catcherRect.bottom) {
                if (Math.abs(targetCenterX - catcherCenterX) < 40) {
                    caught++;
                    scoreEl.textContent = `Caught: ${caught}`;
                    target.remove();
                    clearInterval(checkInterval);
                    return;
                }
            }

            // Missed
            if (targetRect.top > zone.getBoundingClientRect().bottom) {
                missed++;
                target.remove();
                clearInterval(checkInterval);
            }
        }, 50);

        gameTimers.push(checkInterval);

        // Remove after animation
        const removeTimeout = setTimeout(() => target.remove(), fallDuration * 1000 + 100);
        gameTimers.push(removeTimeout);
    }

    // Spawn treats at irregular intervals (harder to predict)
    function scheduleSpawn() {
        if (timeLeft <= 0) return;
        const delay = 400 + Math.random() * 600;
        const timeout = setTimeout(() => {
            spawnTreat();
            scheduleSpawn();
        }, delay);
        gameTimers.push(timeout);
    }

    scheduleSpawn();

    const timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `⏱️ ${timeLeft}s`;

        if (timeLeft <= 3) timerEl.classList.add('warning');

        if (timeLeft <= 0) {
            clearInterval(timer);
            zone.removeEventListener('mousemove', moveHandler);
            zone.removeEventListener('touchmove', moveHandler);

            // Harsh scoring - need at least 5 to get anything
            const reward = caught >= 8 ? 6 : caught >= 6 ? 4 : caught >= 5 ? 2 : 0;
            showGameResult(reward, caught >= 6);
        }
    }, 1000);

    gameTimers.push(timer);
}

// ===== Sequence Game (Simon Says) =====
function startSequenceGame() {
    currentGame = 'sequence';
    elements.gamesList.style.display = 'none';
    elements.gameResult.style.display = 'none';
    elements.sequenceGame.style.display = 'block';

    const buttons = document.querySelectorAll('.sequence-btn');
    const levelEl = document.getElementById('sequenceLevel');
    const statusEl = document.getElementById('sequenceStatus');

    let sequence = [];
    let playerSequence = [];
    let level = 1;
    let canInput = false;

    buttons.forEach(btn => btn.disabled = true);

    function addToSequence() {
        sequence.push(Math.floor(Math.random() * 4));
        levelEl.textContent = `Level: ${level}`;
        statusEl.textContent = 'Watch...';
        playSequence();
    }

    function playSequence() {
        canInput = false;
        let i = 0;

        // Faster playback at higher levels
        const speed = Math.max(300, 500 - level * 30);

        function playNext() {
            if (i >= sequence.length) {
                canInput = true;
                buttons.forEach(btn => btn.disabled = false);
                statusEl.textContent = 'Your turn!';
                return;
            }

            const btn = buttons[sequence[i]];
            btn.classList.add('active');

            const timeout1 = setTimeout(() => {
                btn.classList.remove('active');
                i++;
                const timeout2 = setTimeout(playNext, speed / 2);
                gameTimers.push(timeout2);
            }, speed);

            gameTimers.push(timeout1);
        }

        const startDelay = setTimeout(playNext, 500);
        gameTimers.push(startDelay);
    }

    function handleButtonClick(index) {
        if (!canInput) return;

        const btn = buttons[index];
        btn.classList.add('active');
        setTimeout(() => btn.classList.remove('active'), 150);

        playerSequence.push(index);

        const currentIndex = playerSequence.length - 1;

        if (playerSequence[currentIndex] !== sequence[currentIndex]) {
            // Wrong - game over
            buttons.forEach(btn => btn.disabled = true);
            statusEl.textContent = 'Wrong!';

            // Harsh scoring - need level 4+ for any reward
            const reward = level >= 6 ? 12 : level >= 5 ? 8 : level >= 4 ? 4 : 0;
            const timeout = setTimeout(() => showGameResult(reward, level >= 5), 500);
            gameTimers.push(timeout);
            return;
        }

        if (playerSequence.length === sequence.length) {
            // Completed level
            level++;
            playerSequence = [];
            canInput = false;
            buttons.forEach(btn => btn.disabled = true);
            statusEl.textContent = 'Good!';

            // Max level 8
            if (level > 8) {
                const timeout = setTimeout(() => showGameResult(12, true), 500);
                gameTimers.push(timeout);
                return;
            }

            const timeout = setTimeout(addToSequence, 1000);
            gameTimers.push(timeout);
        }
    }

    buttons.forEach((btn, i) => {
        btn.onclick = () => handleButtonClick(i);
    });

    addToSequence();
}

// ===== Start the game =====
document.addEventListener('DOMContentLoaded', init);
