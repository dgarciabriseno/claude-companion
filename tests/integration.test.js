import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Three.js before importing main
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    add: vi.fn(),
    background: null,
  })),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn() },
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
  })),
  AmbientLight: vi.fn(() => ({})),
  DirectionalLight: vi.fn(() => ({
    position: { set: vi.fn() },
  })),
  Clock: vi.fn(() => ({
    getDelta: vi.fn(() => 0.016),
  })),
  Group: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  })),
  Mesh: vi.fn(() => ({
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
    material: { color: { set: vi.fn(), getHex: vi.fn(() => 0xFFB6C1) }, clone: vi.fn(function() { return this; }) },
    clone: vi.fn(function() { return this; }),
  })),
  SphereGeometry: vi.fn(),
  CylinderGeometry: vi.fn(),
  ConeGeometry: vi.fn(),
  TorusGeometry: vi.fn(),
  MeshToonMaterial: vi.fn(() => ({
    color: { set: vi.fn(), getHex: vi.fn(() => 0xFFB6C1) },
    clone: vi.fn(function() { return this; }),
  })),
  Color: vi.fn(),
}));

describe('Integration: Game State Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save state to localStorage', async () => {
    const { saveState, createGameState, CONFIG } = await import('../src/gameState.js');
    const state = createGameState();
    saveState(state);

    const saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY));
    expect(saved).toBeDefined();
    expect(saved.coins).toBe(10);
  });

  it('should load state from localStorage', async () => {
    const { saveState, loadState, createGameState, addCoins, CONFIG } = await import('../src/gameState.js');

    let state = createGameState();
    state = addCoins(state, 50);
    saveState(state);

    const loaded = loadState();
    expect(loaded.coins).toBe(60);
  });

  it('should persist equipped items', async () => {
    const { saveState, loadState, createGameState, equipItem, purchaseItem, CONFIG } = await import('../src/gameState.js');

    let state = createGameState();
    // First purchase the items
    state = purchaseItem(state, 'colors', 'blue', 0); // add blue to owned
    state = purchaseItem(state, 'hats', 'crown', 0); // add crown to owned
    // Then equip
    state = equipItem(state, 'color', 'blue');
    state = equipItem(state, 'hat', 'crown');
    saveState(state);

    const loaded = loadState();
    expect(loaded.outfit.color).toBe('blue');
    expect(loaded.outfit.hat).toBe('crown');
  });
});

describe('Integration: Feeding Mechanic', () => {
  it('should require coins to feed', async () => {
    const { createGameState, feedPet, canAfford, CONFIG } = await import('../src/gameState.js');

    let state = createGameState();
    expect(canAfford(state, CONFIG.FOOD_COST)).toBe(true);

    // Spend all coins
    state = { ...state, coins: 0 };
    expect(canAfford(state, CONFIG.FOOD_COST)).toBe(false);
  });

  it('should increase hunger when fed', async () => {
    const { createGameState, feedPet } = await import('../src/gameState.js');

    let state = createGameState();
    state = { ...state, hunger: 50 };
    state = feedPet(state);

    expect(state.hunger).toBeGreaterThan(50);
  });

  it('should decrease coins when fed', async () => {
    const { createGameState, feedPet } = await import('../src/gameState.js');

    let state = createGameState();
    const initialCoins = state.coins;
    state = feedPet(state);

    expect(state.coins).toBeLessThan(initialCoins);
  });
});

describe('Integration: Minigame Rewards', () => {
  it('memory game should give coins for 4+ pairs', async () => {
    const { MemoryGame, GAME_CONFIG } = await import('../src/minigames.js');

    const game = new MemoryGame();
    game.start();
    game.matchedPairs = 4;

    const reward = game.calculateReward();
    expect(reward).toBeGreaterThan(0);
    expect(reward).toBeLessThanOrEqual(GAME_CONFIG.memory.maxReward);
  });

  it('sequence game should give coins for level 4+', async () => {
    const { SequenceGame, GAME_CONFIG } = await import('../src/minigames.js');

    const game = new SequenceGame();
    game.start();
    game.level = 4;

    const reward = game.calculateReward();
    expect(reward).toBeGreaterThan(0);
    expect(reward).toBeLessThanOrEqual(GAME_CONFIG.sequence.maxReward);
  });

  it('reaction game should give coins for 5+ catches', async () => {
    const { ReactionGame, GAME_CONFIG } = await import('../src/minigames.js');

    const game = new ReactionGame();
    game.start();
    game.catches = 5;

    const reward = game.calculateReward();
    expect(reward).toBeGreaterThan(0);
    expect(reward).toBeLessThanOrEqual(GAME_CONFIG.reaction.maxReward);
  });

  it('games should give no coins for poor performance', async () => {
    const { MemoryGame, SequenceGame, ReactionGame } = await import('../src/minigames.js');

    const memory = new MemoryGame();
    memory.start();
    memory.matchedPairs = 2;
    expect(memory.calculateReward()).toBe(0);

    const sequence = new SequenceGame();
    sequence.start();
    sequence.level = 2;
    expect(sequence.calculateReward()).toBe(0);

    const reaction = new ReactionGame();
    reaction.start();
    reaction.catches = 3;
    expect(reaction.calculateReward()).toBe(0);
  });
});

describe('Integration: Shop System', () => {
  it('should require coins to buy items', async () => {
    const { createGameState, purchaseItem, canAfford } = await import('../src/gameState.js');
    const { ACCESSORIES } = await import('../src/pet3d.js');

    let state = createGameState();
    const crownPrice = ACCESSORIES.hats.crown.price;

    // Not enough coins
    state = { ...state, coins: 10 };
    expect(canAfford(state, crownPrice)).toBe(false);

    // Enough coins
    state = { ...state, coins: 100 };
    expect(canAfford(state, crownPrice)).toBe(true);
  });

  it('should add item to owned after purchase', async () => {
    const { createGameState, purchaseItem } = await import('../src/gameState.js');

    let state = createGameState();
    state = { ...state, coins: 100 };
    state = purchaseItem(state, 'hats', 'crown', 50);

    expect(state.owned.hats).toContain('crown');
    expect(state.coins).toBe(50);
  });

  it('should equip items correctly', async () => {
    const { createGameState, equipItem, purchaseItem } = await import('../src/gameState.js');

    let state = createGameState();
    // First add items to owned
    state = purchaseItem(state, 'colors', 'blue', 0);
    state = purchaseItem(state, 'hats', 'crown', 0);
    state = purchaseItem(state, 'accessories', 'glasses', 0);
    // Then equip
    state = equipItem(state, 'color', 'blue');
    state = equipItem(state, 'hat', 'crown');
    state = equipItem(state, 'accessory', 'glasses');

    expect(state.outfit.color).toBe('blue');
    expect(state.outfit.hat).toBe('crown');
    expect(state.outfit.accessory).toBe('glasses');
  });
});

describe('Integration: Pet Mood', () => {
  it('should reflect low stats with sad animation', async () => {
    const { Pet3D } = await import('../src/pet3d.js');

    const pet = new Pet3D();
    pet.updateMood(20, 20);

    expect(pet.animationState).toBe('sad');
  });

  it('should not be sad with good stats', async () => {
    const { Pet3D } = await import('../src/pet3d.js');

    const pet = new Pet3D();
    pet.updateMood(80, 80);

    expect(pet.animationState).not.toBe('sad');
  });
});

describe('Integration: Stats Decay', () => {
  it('should decrease stats over time', async () => {
    const { createGameState, calculateDecay, CONFIG } = await import('../src/gameState.js');

    let state = createGameState();
    // Set lastUpdate to be old enough to trigger decay
    state = { ...state, lastUpdate: Date.now() - CONFIG.DECAY_INTERVAL - 1000 };
    const initialHappiness = state.happiness;
    const initialHunger = state.hunger;

    state = calculateDecay(state);

    expect(state.happiness).toBeLessThan(initialHappiness);
    expect(state.hunger).toBeLessThan(initialHunger);
  });

  it('should not go below 0', async () => {
    const { createGameState, calculateDecay, CONFIG } = await import('../src/gameState.js');

    let state = createGameState();
    state = { ...state, happiness: 1, hunger: 1, lastUpdate: Date.now() - CONFIG.DECAY_INTERVAL * 10 };
    state = calculateDecay(state);

    expect(state.happiness).toBeGreaterThanOrEqual(0);
    expect(state.hunger).toBeGreaterThanOrEqual(0);
  });
});

describe('Integration: Game Flow', () => {
  it('memory game flow: start -> play -> complete', async () => {
    const { MemoryGame } = await import('../src/minigames.js');

    const game = new MemoryGame();
    game.start();

    expect(game.isRunning).toBe(true);
    expect(game.cards.length).toBe(12);

    // Simulate playing
    const symbol = game.cards[0].symbol;
    const matchIndex = game.cards.findIndex((c, i) => i !== 0 && c.symbol === symbol);

    game.selectCard(0);
    game.selectCard(matchIndex);

    expect(game.matchedPairs).toBe(1);
  });

  it('sequence game flow: start -> add sequence -> player turn', async () => {
    const { SequenceGame } = await import('../src/minigames.js');

    const game = new SequenceGame();
    game.start();

    expect(game.isRunning).toBe(true);
    expect(game.level).toBe(1);

    game.addToSequence();
    expect(game.sequence.length).toBe(1);

    game.startPlayerTurn();
    expect(game.isPlayerTurn).toBe(true);
  });

  it('reaction game flow: start -> spawn -> catch', async () => {
    const { ReactionGame } = await import('../src/minigames.js');

    const game = new ReactionGame();
    game.start();

    expect(game.isRunning).toBe(true);

    const target = game.spawnTarget();
    expect(game.targets.length).toBe(1);

    // Move catcher to target
    game.moveCatcher(target.x);
    target.y = 90; // In catch zone

    const caught = game.checkCatch(target);
    expect(caught).toBe(true);
    expect(game.catches).toBe(1);
  });
});

describe('Integration: Pet Customization', () => {
  it('should change pet color', async () => {
    const { Pet3D, COLORS } = await import('../src/pet3d.js');

    const pet = new Pet3D();
    expect(pet.currentColor).toBe('pink');

    pet.setColor('blue');
    expect(pet.currentColor).toBe('blue');
  });

  it('should equip accessories', async () => {
    const { Pet3D } = await import('../src/pet3d.js');

    const pet = new Pet3D();

    pet.setHat('crown');
    expect(pet.currentHat).toBe('crown');

    pet.setAccessory('glasses');
    expect(pet.currentAccessory).toBe('glasses');
  });

  it('should remove accessories when set to none', async () => {
    const { Pet3D } = await import('../src/pet3d.js');

    const pet = new Pet3D();

    pet.setHat('crown');
    pet.setHat('none');
    expect(pet.currentHat).toBe('none');
  });
});
