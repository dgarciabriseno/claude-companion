import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createGameState,
  feedPet,
  petPet,
  addCoins,
  spendCoins,
  canAfford,
  purchaseItem,
  equipItem,
  calculateDecay,
  saveState,
  loadState,
  INITIAL_STATE,
  CONFIG
} from '../src/gameState.js';

describe('Game State Management', () => {
  let state;

  beforeEach(() => {
    state = createGameState();
  });

  describe('createGameState', () => {
    it('should create initial state with default values', () => {
      expect(state.coins).toBe(CONFIG.STARTING_COINS);
      expect(state.happiness).toBe(INITIAL_STATE.happiness);
      expect(state.hunger).toBe(INITIAL_STATE.hunger);
      expect(state.owned.hats).toContain('none');
      expect(state.owned.accessories).toContain('none');
      expect(state.owned.colors).toContain('pink');
    });

    it('should have outfit defaults', () => {
      expect(state.outfit.hat).toBe('none');
      expect(state.outfit.accessory).toBe('none');
      expect(state.outfit.color).toBe('pink');
    });
  });

  describe('Coin Management', () => {
    it('should add coins correctly', () => {
      const newState = addCoins(state, 10);
      expect(newState.coins).toBe(state.coins + 10);
    });

    it('should not allow negative coin additions', () => {
      const newState = addCoins(state, -5);
      expect(newState.coins).toBe(state.coins);
    });

    it('should spend coins correctly', () => {
      state.coins = 20;
      const newState = spendCoins(state, 5);
      expect(newState.coins).toBe(15);
    });

    it('should not spend more coins than available', () => {
      state.coins = 5;
      const newState = spendCoins(state, 10);
      expect(newState.coins).toBe(5); // unchanged
    });

    it('should correctly check affordability', () => {
      state.coins = 10;
      expect(canAfford(state, 5)).toBe(true);
      expect(canAfford(state, 10)).toBe(true);
      expect(canAfford(state, 15)).toBe(false);
    });
  });

  describe('Feeding', () => {
    it('should increase hunger when fed with enough coins', () => {
      state.coins = 20;
      state.hunger = 50;
      const newState = feedPet(state);
      expect(newState.hunger).toBeGreaterThan(50);
      expect(newState.coins).toBeLessThan(20);
    });

    it('should not exceed max hunger', () => {
      state.coins = 20;
      state.hunger = 95;
      const newState = feedPet(state);
      expect(newState.hunger).toBe(CONFIG.MAX_STAT);
    });

    it('should not feed without enough coins', () => {
      state.coins = 0;
      state.hunger = 50;
      const newState = feedPet(state);
      expect(newState.hunger).toBe(50);
      expect(newState.coins).toBe(0);
    });

    it('should slightly increase happiness when fed', () => {
      state.coins = 20;
      state.happiness = 50;
      const newState = feedPet(state);
      expect(newState.happiness).toBeGreaterThan(50);
    });
  });

  describe('Petting', () => {
    it('should increase happiness when petted (free action)', () => {
      state.happiness = 50;
      const newState = petPet(state);
      expect(newState.happiness).toBeGreaterThan(50);
    });

    it('should not exceed max happiness', () => {
      state.happiness = 98;
      const newState = petPet(state);
      expect(newState.happiness).toBe(CONFIG.MAX_STAT);
    });

    it('should not cost coins', () => {
      state.coins = 10;
      const newState = petPet(state);
      expect(newState.coins).toBe(10);
    });
  });

  describe('Purchasing Items', () => {
    it('should purchase item if can afford', () => {
      state.coins = 50;
      const newState = purchaseItem(state, 'hats', 'crown', 30);
      expect(newState.coins).toBe(20);
      expect(newState.owned.hats).toContain('crown');
    });

    it('should not purchase if cannot afford', () => {
      state.coins = 10;
      const newState = purchaseItem(state, 'hats', 'crown', 30);
      expect(newState.coins).toBe(10);
      expect(newState.owned.hats).not.toContain('crown');
    });

    it('should not purchase already owned item', () => {
      state.coins = 50;
      state.owned.hats = ['none', 'crown'];
      const newState = purchaseItem(state, 'hats', 'crown', 30);
      expect(newState.coins).toBe(50); // unchanged
    });
  });

  describe('Equipping Items', () => {
    it('should equip owned hat', () => {
      state.owned.hats = ['none', 'crown'];
      const newState = equipItem(state, 'hat', 'crown');
      expect(newState.outfit.hat).toBe('crown');
    });

    it('should not equip unowned item', () => {
      state.owned.hats = ['none'];
      const newState = equipItem(state, 'hat', 'crown');
      expect(newState.outfit.hat).toBe('none');
    });

    it('should equip color', () => {
      state.owned.colors = ['pink', 'blue'];
      const newState = equipItem(state, 'color', 'blue');
      expect(newState.outfit.color).toBe('blue');
    });
  });

  describe('Stat Decay', () => {
    it('should decay stats over time', () => {
      state.happiness = 50;
      state.hunger = 50;
      state.lastUpdate = Date.now() - (CONFIG.DECAY_INTERVAL * 3);

      const newState = calculateDecay(state);
      expect(newState.happiness).toBeLessThan(50);
      expect(newState.hunger).toBeLessThan(50);
    });

    it('should not decay below minimum', () => {
      state.happiness = 5;
      state.hunger = 5;
      state.lastUpdate = Date.now() - (CONFIG.DECAY_INTERVAL * 10);

      const newState = calculateDecay(state);
      expect(newState.happiness).toBe(CONFIG.MIN_STAT);
      expect(newState.hunger).toBe(CONFIG.MIN_STAT);
    });

    it('should update lastUpdate timestamp', () => {
      const oldTime = Date.now() - CONFIG.DECAY_INTERVAL * 2;
      state.lastUpdate = oldTime;

      const newState = calculateDecay(state);
      expect(newState.lastUpdate).toBeGreaterThan(oldTime);
    });
  });

  describe('Persistence', () => {
    it('should save state to localStorage', () => {
      state.coins = 100;
      saveState(state);

      const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved);
      expect(parsed.coins).toBe(100);
    });

    it('should load state from localStorage', () => {
      const savedState = { ...state, coins: 200 };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(savedState));

      const loaded = loadState();
      expect(loaded.coins).toBe(200);
    });

    it('should return default state if no saved state', () => {
      localStorage.clear();
      const loaded = loadState();
      expect(loaded.coins).toBe(CONFIG.STARTING_COINS);
    });
  });
});

describe('CONFIG values', () => {
  it('should have required config values', () => {
    expect(CONFIG.STARTING_COINS).toBeDefined();
    expect(CONFIG.FOOD_COST).toBeDefined();
    expect(CONFIG.FEED_AMOUNT).toBeDefined();
    expect(CONFIG.PET_AMOUNT).toBeDefined();
    expect(CONFIG.MAX_STAT).toBe(100);
    expect(CONFIG.MIN_STAT).toBe(0);
    expect(CONFIG.DECAY_INTERVAL).toBeGreaterThan(0);
    expect(CONFIG.DECAY_AMOUNT).toBeGreaterThan(0);
  });

  it('should make games challenging (low starting coins)', () => {
    // Starting coins should only allow a few feedings
    const possibleFeedings = Math.floor(CONFIG.STARTING_COINS / CONFIG.FOOD_COST);
    expect(possibleFeedings).toBeLessThanOrEqual(3);
  });
});
