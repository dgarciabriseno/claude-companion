/**
 * Main Application Module
 * Ties together 3D pet, game state, minigames, and UI
 */
import * as THREE from 'three';
import { Pet3D, COLORS, ACCESSORIES } from './pet3d.js';
import {
  createGameState,
  loadState,
  saveState,
  feedPet,
  petPet,
  addCoins,
  spendCoins,
  canAfford,
  purchaseItem,
  equipItem,
  calculateDecay,
  CONFIG
} from './gameState.js';
import { MemoryGame, SequenceGame, ReactionGame, GAME_CONFIG } from './minigames.js';

// DOM Elements
let elements = {};

// Application State
let gameState = null;
let pet3d = null;
let scene = null;
let camera = null;
let renderer = null;
let clock = null;

// Game instances
let currentGame = null;
let gameTimer = null;
let spawnTimer = null;

/**
 * Initialize the application
 */
export function init() {
  // Get DOM elements
  elements = {
    canvas: document.getElementById('petCanvas'),
    coinAmount: document.getElementById('coinAmount'),
    happinessBar: document.getElementById('happinessBar'),
    hungerBar: document.getElementById('hungerBar'),
    reactionBubble: document.getElementById('reactionBubble'),
    feedBtn: document.getElementById('feedBtn'),
    petBtn: document.getElementById('petBtn'),
    shopBtn: document.getElementById('shopBtn'),
    workBtn: document.getElementById('workBtn'),
    shopModal: document.getElementById('shopModal'),
    shopContent: document.getElementById('shopContent'),
    shopCoins: document.getElementById('shopCoins'),
    closeShop: document.getElementById('closeShop'),
    gamesModal: document.getElementById('gamesModal'),
    gamesContent: document.getElementById('gamesContent'),
    gamesCoins: document.getElementById('gamesCoins'),
    closeGames: document.getElementById('closeGames'),
    gamesList: document.getElementById('gamesList'),
    memoryGameArea: document.getElementById('memoryGameArea'),
    memoryGrid: document.getElementById('memoryGrid'),
    memoryTimer: document.getElementById('memoryTimer'),
    memoryScore: document.getElementById('memoryScore'),
    sequenceGameArea: document.getElementById('sequenceGameArea'),
    sequenceGrid: document.getElementById('sequenceGrid'),
    sequenceLevel: document.getElementById('sequenceLevel'),
    sequenceStatus: document.getElementById('sequenceStatus'),
    reactionGameArea: document.getElementById('reactionGameArea'),
    reactionZone: document.getElementById('reactionZone'),
    reactionTimer: document.getElementById('reactionTimer'),
    reactionScore: document.getElementById('reactionScore'),
    catcher: document.getElementById('catcher'),
    gameResult: document.getElementById('gameResult'),
    resultIcon: document.getElementById('resultIcon'),
    resultText: document.getElementById('resultText'),
    resultCoins: document.getElementById('resultCoins'),
    playAgainBtn: document.getElementById('playAgainBtn'),
    backToGamesBtn: document.getElementById('backToGamesBtn'),
    toast: document.getElementById('toast'),
    toastIcon: document.getElementById('toastIcon'),
    toastMessage: document.getElementById('toastMessage'),
  };

  // Load or create game state
  gameState = loadState() || createGameState();
  saveState(gameState);

  // Setup 3D scene
  setupScene();

  // Setup UI
  updateUI();
  setupEventListeners();

  // Start decay timer
  startDecayTimer();

  // Start animation loop
  clock = new THREE.Clock();
  animate();
}

/**
 * Setup Three.js scene
 */
function setupScene() {
  // Scene
  scene = new THREE.Scene();
  scene.background = null; // Transparent to show CSS gradient

  // Camera
  const aspect = elements.canvas.clientWidth / elements.canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: elements.canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(elements.canvas.clientWidth, elements.canvas.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(2, 3, 4);
  scene.add(directionalLight);

  // Create pet
  pet3d = new Pet3D();
  scene.add(pet3d.group);

  // Apply saved customizations
  if (gameState.outfit.color) {
    pet3d.setColor(gameState.outfit.color);
  }
  if (gameState.outfit.hat && gameState.outfit.hat !== 'none') {
    pet3d.setHat(gameState.outfit.hat);
  }
  if (gameState.outfit.accessory && gameState.outfit.accessory !== 'none') {
    pet3d.setAccessory(gameState.outfit.accessory);
  }

  // Handle resize
  window.addEventListener('resize', onResize);
}

/**
 * Handle window resize
 */
function onResize() {
  if (!elements.canvas || !camera || !renderer) return;

  const width = elements.canvas.clientWidth;
  const height = elements.canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

/**
 * Animation loop
 */
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  // Update pet animations
  if (pet3d) {
    pet3d.updateMood(gameState.happiness, gameState.hunger);
    pet3d.update(deltaTime);
  }

  // Render
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

/**
 * Update UI to match game state
 */
function updateUI() {
  elements.coinAmount.textContent = gameState.coins;
  elements.happinessBar.style.width = `${gameState.happiness}%`;
  elements.hungerBar.style.width = `${gameState.hunger}%`;

  // Update shop coins display
  elements.shopCoins.textContent = gameState.coins;
  elements.gamesCoins.textContent = gameState.coins;

  // Update feed button affordability
  if (canAfford(gameState, CONFIG.FOOD_COST)) {
    elements.feedBtn.classList.remove('cant-afford');
  } else {
    elements.feedBtn.classList.add('cant-afford');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Feed button
  elements.feedBtn.addEventListener('click', handleFeed);

  // Pet button
  elements.petBtn.addEventListener('click', handlePet);

  // Shop button
  elements.shopBtn.addEventListener('click', () => openShop());

  // Work button
  elements.workBtn.addEventListener('click', () => openGames());

  // Close modals
  elements.closeShop.addEventListener('click', closeShop);
  elements.closeGames.addEventListener('click', closeGames);

  // Close modals on backdrop click
  elements.shopModal.addEventListener('click', (e) => {
    if (e.target === elements.shopModal) closeShop();
  });
  elements.gamesModal.addEventListener('click', (e) => {
    if (e.target === elements.gamesModal) closeGames();
  });

  // Game selection
  elements.gamesList.querySelectorAll('.game-select-btn').forEach(btn => {
    btn.addEventListener('click', () => startGame(btn.dataset.game));
  });

  // Game result buttons
  elements.playAgainBtn.addEventListener('click', () => {
    if (currentGame) {
      const gameType = currentGame instanceof MemoryGame ? 'memory'
        : currentGame instanceof SequenceGame ? 'sequence'
        : 'reaction';
      startGame(gameType);
    }
  });

  elements.backToGamesBtn.addEventListener('click', showGamesList);

  // Sequence buttons
  elements.sequenceGrid.querySelectorAll('.sequence-btn').forEach(btn => {
    btn.addEventListener('click', () => handleSequenceInput(parseInt(btn.dataset.index)));
  });

  // Reaction zone touch/mouse
  setupReactionControls();

  // Canvas click for petting
  elements.canvas.addEventListener('click', handlePet);
}

/**
 * Handle feeding the pet
 */
function handleFeed() {
  if (!canAfford(gameState, CONFIG.FOOD_COST)) {
    showToast('😰', 'Not enough coins!');
    return;
  }

  gameState = feedPet(gameState);
  saveState(gameState);
  updateUI();

  pet3d.playAnimation('eating');
  showReaction('🍎');
  showToast('😋', 'Yummy!');
}

/**
 * Handle petting the pet
 */
function handlePet() {
  gameState = petPet(gameState);
  saveState(gameState);
  updateUI();

  pet3d.playAnimation('happy');
  showReaction('💕');
}

/**
 * Show reaction bubble
 */
function showReaction(emoji) {
  elements.reactionBubble.textContent = emoji;
  elements.reactionBubble.classList.add('show');

  setTimeout(() => {
    elements.reactionBubble.classList.remove('show');
  }, 1500);
}

/**
 * Show toast notification
 */
function showToast(icon, message) {
  elements.toastIcon.textContent = icon;
  elements.toastMessage.textContent = message;
  elements.toast.classList.add('show');

  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2500);
}

/**
 * Open shop modal
 */
function openShop() {
  renderShop();
  elements.shopModal.classList.add('show');
}

/**
 * Close shop modal
 */
function closeShop() {
  elements.shopModal.classList.remove('show');
}

/**
 * Render shop content
 */
function renderShop() {
  const categories = [
    { key: 'colors', title: 'Colors', items: ACCESSORIES.colors },
    { key: 'hats', title: 'Hats', items: ACCESSORIES.hats },
    { key: 'accessories', title: 'Accessories', items: ACCESSORIES.accessories },
  ];

  let html = '';

  categories.forEach(category => {
    html += `<div class="shop-category"><h3>${category.title}</h3><div class="shop-grid">`;

    Object.entries(category.items).forEach(([id, item]) => {
      const ownedCategory = category.key;
      const owned = gameState.owned[ownedCategory]?.includes(id) || item.price === 0;
      const equipped = (category.key === 'colors' && gameState.outfit.color === id)
        || (category.key === 'hats' && gameState.outfit.hat === id)
        || (category.key === 'accessories' && gameState.outfit.accessory === id);

      const icon = getShopIcon(category.key, id);
      const colorStyle = category.key === 'colors' ? `background-color: #${COLORS[id]?.body.toString(16).padStart(6, '0') || 'ccc'};` : '';

      const classes = ['shop-item'];
      if (owned) classes.push('owned');
      if (equipped) classes.push('equipped');
      if (!owned && !canAfford(gameState, item.price)) classes.push('locked');
      if (category.key === 'colors') classes.push('color-item');

      html += `
        <button class="${classes.join(' ')}"
                data-category="${category.key}"
                data-id="${id}"
                style="${colorStyle}">
          ${category.key !== 'colors' ? icon : ''}
          ${!owned ? `<span class="item-price">🪙${item.price}</span>` : ''}
        </button>
      `;
    });

    html += '</div></div>';
  });

  elements.shopContent.innerHTML = html;

  // Add click handlers
  elements.shopContent.querySelectorAll('.shop-item').forEach(item => {
    item.addEventListener('click', () => handleShopItem(item.dataset.category, item.dataset.id));
  });
}

/**
 * Get icon for shop item
 */
function getShopIcon(category, id) {
  const icons = {
    hats: { none: '', bow: '🎀', crown: '👑', cap: '🧢', flower: '🌸', party: '🎉' },
    accessories: { none: '', glasses: '👓', bowtie: '🎀', scarf: '🧣', necklace: '📿' },
  };
  return icons[category]?.[id] || '';
}

/**
 * Handle shop item click
 */
function handleShopItem(category, id) {
  const item = category === 'colors' ? ACCESSORIES.colors[id]
    : category === 'hats' ? ACCESSORIES.hats[id]
    : ACCESSORIES.accessories[id];

  const owned = gameState.owned[category]?.includes(id) || item.price === 0;

  if (!owned) {
    // Try to purchase
    if (!canAfford(gameState, item.price)) {
      showToast('😰', 'Not enough coins!');
      return;
    }

    gameState = purchaseItem(gameState, category, id, item.price);
    showToast('🎉', `Bought ${item.name}!`);
  }

  // Equip the item
  const equipCategory = category === 'colors' ? 'color'
    : category === 'hats' ? 'hat'
    : 'accessory';

  gameState = equipItem(gameState, equipCategory, id);
  saveState(gameState);

  // Update 3D pet
  if (category === 'colors') {
    pet3d.setColor(id);
  } else if (category === 'hats') {
    pet3d.setHat(id);
  } else {
    pet3d.setAccessory(id);
  }

  updateUI();
  renderShop();
}

/**
 * Open games modal
 */
function openGames() {
  showGamesList();
  elements.gamesModal.classList.add('show');
}

/**
 * Close games modal
 */
function closeGames() {
  stopCurrentGame();
  elements.gamesModal.classList.remove('show');
}

/**
 * Show games list
 */
function showGamesList() {
  stopCurrentGame();
  elements.gamesList.style.display = 'flex';
  elements.memoryGameArea.style.display = 'none';
  elements.sequenceGameArea.style.display = 'none';
  elements.reactionGameArea.style.display = 'none';
  elements.gameResult.style.display = 'none';
}

/**
 * Stop current game
 */
function stopCurrentGame() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
  if (spawnTimer) {
    clearInterval(spawnTimer);
    spawnTimer = null;
  }
  currentGame = null;
}

/**
 * Start a game
 */
function startGame(type) {
  stopCurrentGame();
  elements.gamesList.style.display = 'none';
  elements.gameResult.style.display = 'none';

  switch (type) {
    case 'memory':
      startMemoryGame();
      break;
    case 'sequence':
      startSequenceGame();
      break;
    case 'reaction':
      startReactionGame();
      break;
  }
}

// =====================
// Memory Game
// =====================

function startMemoryGame() {
  currentGame = new MemoryGame();
  currentGame.start();

  elements.memoryGameArea.style.display = 'block';
  renderMemoryGrid();
  updateMemoryUI();

  // Start timer
  gameTimer = setInterval(() => {
    currentGame.tick();
    updateMemoryUI();

    if (currentGame.isComplete()) {
      endGame(currentGame.calculateReward());
    }
  }, 1000);
}

function renderMemoryGrid() {
  let html = '';
  currentGame.cards.forEach((card, index) => {
    html += `<button class="memory-card" data-index="${index}">?</button>`;
  });
  elements.memoryGrid.innerHTML = html;

  elements.memoryGrid.querySelectorAll('.memory-card').forEach(card => {
    card.addEventListener('click', () => handleMemoryCard(parseInt(card.dataset.index)));
  });
}

function handleMemoryCard(index) {
  const result = currentGame.selectCard(index);

  updateMemoryCardDisplay();

  if (result.cards) {
    // Two cards flipped
    setTimeout(() => {
      currentGame.resetFlipped();
      updateMemoryCardDisplay();

      if (currentGame.isComplete()) {
        endGame(currentGame.calculateReward());
      }
    }, 800);
  }

  updateMemoryUI();
}

function updateMemoryCardDisplay() {
  const cards = elements.memoryGrid.querySelectorAll('.memory-card');
  currentGame.cards.forEach((card, index) => {
    const el = cards[index];
    if (card.matched) {
      el.classList.add('matched');
      el.textContent = card.symbol;
    } else if (card.flipped) {
      el.classList.add('flipped');
      el.textContent = card.symbol;
    } else {
      el.classList.remove('flipped');
      el.textContent = '?';
    }
  });
}

function updateMemoryUI() {
  elements.memoryTimer.textContent = `⏱️ ${currentGame.timeRemaining}s`;
  elements.memoryScore.textContent = `Pairs: ${currentGame.matchedPairs}/6`;

  if (currentGame.timeRemaining <= 5) {
    elements.memoryTimer.classList.add('warning');
  } else {
    elements.memoryTimer.classList.remove('warning');
  }
}

// =====================
// Sequence Game
// =====================

function startSequenceGame() {
  currentGame = new SequenceGame();
  currentGame.start();

  elements.sequenceGameArea.style.display = 'block';
  updateSequenceUI();

  // Start first round
  nextSequenceRound();
}

function nextSequenceRound() {
  if (currentGame.isMaxLevel()) {
    endGame(currentGame.calculateReward());
    return;
  }

  currentGame.addToSequence();
  updateSequenceUI();
  elements.sequenceStatus.textContent = 'Watch...';

  // Disable buttons during playback
  setSequenceButtonsEnabled(false);

  // Play sequence
  playSequence();
}

function playSequence() {
  const speed = currentGame.getPlaybackSpeed();
  let i = 0;

  const playNext = () => {
    if (i > 0) {
      highlightSequenceButton(currentGame.sequence[i - 1], false);
    }

    if (i < currentGame.sequence.length) {
      highlightSequenceButton(currentGame.sequence[i], true);
      i++;
      setTimeout(playNext, speed);
    } else {
      // Playback complete
      setTimeout(() => {
        if (i > 0) {
          highlightSequenceButton(currentGame.sequence[i - 1], false);
        }
        currentGame.startPlayerTurn();
        elements.sequenceStatus.textContent = 'Your turn!';
        setSequenceButtonsEnabled(true);
      }, speed / 2);
    }
  };

  setTimeout(playNext, 500);
}

function highlightSequenceButton(index, active) {
  const btn = elements.sequenceGrid.querySelector(`[data-index="${index}"]`);
  if (btn) {
    if (active) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}

function setSequenceButtonsEnabled(enabled) {
  elements.sequenceGrid.querySelectorAll('.sequence-btn').forEach(btn => {
    btn.disabled = !enabled;
  });
}

function handleSequenceInput(index) {
  if (!currentGame || !currentGame.isPlayerTurn) return;

  highlightSequenceButton(index, true);
  setTimeout(() => highlightSequenceButton(index, false), 200);

  const result = currentGame.checkInput(index);

  if (!result.correct) {
    // Game over
    endGame(currentGame.calculateReward());
  } else if (result.complete) {
    // Level complete
    updateSequenceUI();
    setTimeout(nextSequenceRound, 500);
  }
}

function updateSequenceUI() {
  elements.sequenceLevel.textContent = `Level: ${currentGame.level}`;
}

// =====================
// Reaction Game
// =====================

function startReactionGame() {
  currentGame = new ReactionGame();
  currentGame.start();

  elements.reactionGameArea.style.display = 'block';
  elements.reactionZone.innerHTML = '<div class="catcher" id="catcher">🧺</div>';
  elements.catcher = document.getElementById('catcher');

  updateReactionUI();

  // Start timer
  gameTimer = setInterval(() => {
    currentGame.tick();
    updateReactionUI();

    if (currentGame.isComplete()) {
      endGame(currentGame.calculateReward());
    }
  }, 1000);

  // Start spawning
  spawnTimer = setInterval(() => {
    if (currentGame.isRunning) {
      const target = currentGame.spawnTarget();
      renderTarget(target);
    }
  }, GAME_CONFIG.reaction.spawnInterval);

  // Start update loop for falling
  requestAnimationFrame(updateReactionTargets);
}

function renderTarget(target) {
  const el = document.createElement('div');
  el.className = 'catch-target';
  el.id = `target-${target.id}`;
  el.textContent = target.symbol;
  el.style.left = `${target.x}%`;
  el.style.top = `${target.y}%`;
  elements.reactionZone.appendChild(el);
}

function updateReactionTargets() {
  if (!currentGame || !currentGame.isRunning) return;

  const deltaTime = 1 / 60;
  const removed = currentGame.updateTargets(deltaTime);

  // Update target positions
  currentGame.targets.forEach(target => {
    const el = document.getElementById(`target-${target.id}`);
    if (el) {
      el.style.top = `${target.y}%`;
    }
  });

  // Remove caught/missed targets
  removed.forEach(id => {
    const el = document.getElementById(`target-${id}`);
    if (el) el.remove();
  });

  updateReactionUI();
  requestAnimationFrame(updateReactionTargets);
}

function setupReactionControls() {
  // Mouse move
  elements.reactionZone.addEventListener('mousemove', (e) => {
    if (!currentGame || !(currentGame instanceof ReactionGame)) return;
    const rect = elements.reactionZone.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    currentGame.moveCatcher(x);
    elements.catcher.style.left = `${currentGame.catcherPosition}%`;
  });

  // Touch move
  elements.reactionZone.addEventListener('touchmove', (e) => {
    if (!currentGame || !(currentGame instanceof ReactionGame)) return;
    e.preventDefault();
    const rect = elements.reactionZone.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    currentGame.moveCatcher(x);
    elements.catcher.style.left = `${currentGame.catcherPosition}%`;
  }, { passive: false });
}

function updateReactionUI() {
  elements.reactionTimer.textContent = `⏱️ ${currentGame.timeRemaining}s`;
  elements.reactionScore.textContent = `Caught: ${currentGame.catches}`;

  if (currentGame.timeRemaining <= 5) {
    elements.reactionTimer.classList.add('warning');
  } else {
    elements.reactionTimer.classList.remove('warning');
  }
}

// =====================
// Game End
// =====================

function endGame(reward) {
  stopCurrentGame();

  elements.memoryGameArea.style.display = 'none';
  elements.sequenceGameArea.style.display = 'none';
  elements.reactionGameArea.style.display = 'none';
  elements.gameResult.style.display = 'block';

  if (reward > 0) {
    elements.resultIcon.textContent = '🎉';
    elements.resultText.textContent = 'Great job!';
    elements.resultCoins.textContent = `+${reward} coins`;

    gameState = addCoins(gameState, reward);
    saveState(gameState);
    updateUI();
  } else {
    elements.resultIcon.textContent = '😢';
    elements.resultText.textContent = 'Not enough to earn coins...';
    elements.resultCoins.textContent = 'Try harder next time!';
  }
}

/**
 * Start decay timer
 */
function startDecayTimer() {
  setInterval(() => {
    gameState = calculateDecay(gameState);
    saveState(gameState);
    updateUI();
    pet3d.updateMood(gameState.happiness, gameState.hunger);
  }, CONFIG.DECAY_INTERVAL);
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// Export for testing
export { gameState, pet3d, elements };
