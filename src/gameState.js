/**
 * Game State Management Module
 * Pure functions for managing virtual pet state
 */

export const CONFIG = {
  STORAGE_KEY: 'blobby_pet_3d',
  STARTING_COINS: 10,
  FOOD_COST: 5,
  FEED_AMOUNT: 15,
  PET_AMOUNT: 10,
  HAPPINESS_BONUS_FEED: 3,
  MAX_STAT: 100,
  MIN_STAT: 0,
  DECAY_INTERVAL: 20000, // 20 seconds
  DECAY_AMOUNT: 3,
};

export const INITIAL_STATE = {
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

/**
 * Creates a new game state with default values
 */
export function createGameState() {
  return JSON.parse(JSON.stringify(INITIAL_STATE));
}

/**
 * Adds coins to the state (immutably)
 */
export function addCoins(state, amount) {
  if (amount < 0) return state;
  return {
    ...state,
    coins: state.coins + amount,
  };
}

/**
 * Spends coins from the state (immutably)
 */
export function spendCoins(state, amount) {
  if (amount > state.coins) return state;
  return {
    ...state,
    coins: state.coins - amount,
  };
}

/**
 * Checks if player can afford a cost
 */
export function canAfford(state, cost) {
  return state.coins >= cost;
}

/**
 * Feeds the pet (costs coins, increases hunger)
 */
export function feedPet(state) {
  if (!canAfford(state, CONFIG.FOOD_COST)) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - CONFIG.FOOD_COST,
    hunger: Math.min(CONFIG.MAX_STAT, state.hunger + CONFIG.FEED_AMOUNT),
    happiness: Math.min(CONFIG.MAX_STAT, state.happiness + CONFIG.HAPPINESS_BONUS_FEED),
  };
}

/**
 * Pets the pet (free, increases happiness)
 */
export function petPet(state) {
  return {
    ...state,
    happiness: Math.min(CONFIG.MAX_STAT, state.happiness + CONFIG.PET_AMOUNT),
  };
}

/**
 * Purchases an item
 */
export function purchaseItem(state, category, itemId, price) {
  // Check if already owned
  if (state.owned[category]?.includes(itemId)) {
    return state;
  }

  // Check if can afford
  if (!canAfford(state, price)) {
    return state;
  }

  return {
    ...state,
    coins: state.coins - price,
    owned: {
      ...state.owned,
      [category]: [...state.owned[category], itemId],
    },
  };
}

/**
 * Equips an item (hat, accessory, or color)
 */
export function equipItem(state, type, itemId) {
  // Map type to owned category
  const categoryMap = {
    hat: 'hats',
    accessory: 'accessories',
    color: 'colors',
  };

  const category = categoryMap[type];
  if (!category) return state;

  // Check if owned
  if (!state.owned[category]?.includes(itemId)) {
    return state;
  }

  return {
    ...state,
    outfit: {
      ...state.outfit,
      [type]: itemId,
    },
  };
}

/**
 * Calculates stat decay based on time elapsed
 */
export function calculateDecay(state) {
  const now = Date.now();
  const elapsed = now - state.lastUpdate;
  const decayTicks = Math.floor(elapsed / CONFIG.DECAY_INTERVAL);

  if (decayTicks <= 0) {
    return state;
  }

  const totalDecay = decayTicks * CONFIG.DECAY_AMOUNT;

  return {
    ...state,
    happiness: Math.max(CONFIG.MIN_STAT, state.happiness - totalDecay),
    hunger: Math.max(CONFIG.MIN_STAT, state.hunger - totalDecay),
    lastUpdate: now,
  };
}

/**
 * Saves state to localStorage
 */
export function saveState(state) {
  try {
    const stateToSave = {
      ...state,
      lastUpdate: Date.now(),
    };
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(stateToSave));
    return true;
  } catch (e) {
    console.warn('Failed to save state:', e);
    return false;
  }
}

/**
 * Loads state from localStorage
 */
export function loadState() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with initial state to ensure all fields exist
      return {
        ...createGameState(),
        ...parsed,
        outfit: {
          ...INITIAL_STATE.outfit,
          ...parsed.outfit,
        },
        owned: {
          ...INITIAL_STATE.owned,
          ...parsed.owned,
        },
      };
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return createGameState();
}
