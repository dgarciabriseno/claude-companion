/**
 * Minigames Module
 * Challenging games to earn coins
 */

export const GAME_CONFIG = {
  memory: {
    pairs: 6,
    timeLimit: 18,
    minPairsForReward: 4,
    baseReward: 3,
    maxReward: 8,
    symbols: ['🍎', '🍕', '🍩', '🧁', '🍪', '🍰'],
  },
  sequence: {
    buttonCount: 4,
    minLevelForReward: 4,
    baseReward: 4,
    rewardPerLevel: 2,
    maxLevel: 8,
    maxReward: 12,
    playbackSpeed: 500,
    speedIncrement: 30,
  },
  reaction: {
    timeLimit: 12,
    minCatchesForReward: 5,
    baseReward: 2,
    maxReward: 6,
    catchRadius: 15,
    spawnInterval: 500,
  },
};

/**
 * Utility function to calculate rewards
 */
export function calculateReward(score, threshold, baseReward, maxReward) {
  if (score < threshold) return 0;
  const bonus = Math.floor((score - threshold) * 0.5);
  return Math.min(maxReward, baseReward + bonus);
}

/**
 * Memory Match Game
 */
export class MemoryGame {
  constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.timeRemaining = 0;
    this.isRunning = false;
  }

  start() {
    this.cards = this.createCards();
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.timeRemaining = GAME_CONFIG.memory.timeLimit;
    this.isRunning = true;
    return this;
  }

  createCards() {
    const symbols = GAME_CONFIG.memory.symbols.slice(0, GAME_CONFIG.memory.pairs);
    const cards = [];

    symbols.forEach((symbol, index) => {
      cards.push({ id: index * 2, symbol, flipped: false, matched: false });
      cards.push({ id: index * 2 + 1, symbol, flipped: false, matched: false });
    });

    // Shuffle using Fisher-Yates
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
  }

  selectCard(index) {
    const card = this.cards[index];

    // Can't select matched or already flipped cards
    if (card.matched || card.flipped || this.flippedCards.length >= 2) {
      return { matched: false, card: null };
    }

    card.flipped = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      return this.checkMatch();
    }

    return { matched: false, card, waiting: true };
  }

  checkMatch() {
    const [card1, card2] = this.flippedCards;
    const matched = card1.symbol === card2.symbol;

    if (matched) {
      card1.matched = true;
      card2.matched = true;
      this.matchedPairs++;
    }

    return { matched, cards: [card1, card2] };
  }

  resetFlipped() {
    this.flippedCards.forEach(card => {
      if (!card.matched) {
        card.flipped = false;
      }
    });
    this.flippedCards = [];
  }

  tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
    }
    return this.timeRemaining;
  }

  isComplete() {
    return this.matchedPairs >= GAME_CONFIG.memory.pairs || this.timeRemaining <= 0;
  }

  calculateReward() {
    const { minPairsForReward, baseReward, maxReward } = GAME_CONFIG.memory;

    if (this.matchedPairs < minPairsForReward) {
      return 0;
    }

    const pairBonus = (this.matchedPairs - minPairsForReward) * 1;
    const timeBonus = Math.floor(this.timeRemaining / 3);

    return Math.min(maxReward, baseReward + pairBonus + timeBonus);
  }
}

/**
 * Simon Says Sequence Game
 */
export class SequenceGame {
  constructor() {
    this.sequence = [];
    this.playerIndex = 0;
    this.level = 1;
    this.isRunning = false;
    this.isPlayerTurn = false;
  }

  start() {
    this.sequence = [];
    this.playerIndex = 0;
    this.level = 1;
    this.isRunning = true;
    this.isPlayerTurn = false;
    return this;
  }

  addToSequence() {
    const buttonIndex = Math.floor(Math.random() * GAME_CONFIG.sequence.buttonCount);
    this.sequence.push(buttonIndex);
    return buttonIndex;
  }

  getPlaybackSpeed() {
    const { playbackSpeed, speedIncrement } = GAME_CONFIG.sequence;
    return Math.max(200, playbackSpeed - (this.level - 1) * speedIncrement);
  }

  startPlayerTurn() {
    this.playerIndex = 0;
    this.isPlayerTurn = true;
  }

  checkInput(buttonIndex) {
    if (!this.isPlayerTurn) {
      return { correct: false, complete: false };
    }

    const expected = this.sequence[this.playerIndex];
    const correct = buttonIndex === expected;

    if (!correct) {
      this.isRunning = false;
      return { correct: false, complete: false };
    }

    this.playerIndex++;

    if (this.playerIndex >= this.sequence.length) {
      this.level++;
      this.isPlayerTurn = false;
      return { correct: true, complete: true };
    }

    return { correct: true, complete: false };
  }

  isMaxLevel() {
    return this.level > GAME_CONFIG.sequence.maxLevel;
  }

  calculateReward() {
    const { minLevelForReward, baseReward, rewardPerLevel, maxReward } = GAME_CONFIG.sequence;

    if (this.level < minLevelForReward) {
      return 0;
    }

    const levelBonus = (this.level - minLevelForReward) * rewardPerLevel;
    return Math.min(maxReward, baseReward + levelBonus);
  }
}

/**
 * Reaction / Catch Game
 */
export class ReactionGame {
  constructor() {
    this.catches = 0;
    this.misses = 0;
    this.timeRemaining = 0;
    this.catcherPosition = 50;
    this.targets = [];
    this.isRunning = false;
  }

  start() {
    this.catches = 0;
    this.misses = 0;
    this.timeRemaining = GAME_CONFIG.reaction.timeLimit;
    this.catcherPosition = 50;
    this.targets = [];
    this.isRunning = true;
    return this;
  }

  spawnTarget() {
    const symbols = ['🍎', '🍕', '🍩', '🧁', '💎', '⭐'];
    const target = {
      id: Date.now() + Math.random(),
      x: 10 + Math.random() * 80,
      y: 0,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      fallSpeed: 1.5 + Math.random() * 1,
    };
    this.targets.push(target);
    return target;
  }

  moveCatcher(position) {
    this.catcherPosition = Math.max(10, Math.min(90, position));
  }

  checkCatch(target) {
    const distance = Math.abs(target.x - this.catcherPosition);
    const inCatchZone = target.y >= 85 && target.y <= 100;

    if (inCatchZone && distance <= GAME_CONFIG.reaction.catchRadius) {
      this.catches++;
      return true;
    }

    return false;
  }

  updateTargets(deltaTime) {
    const toRemove = [];

    this.targets.forEach(target => {
      target.y += target.fallSpeed * deltaTime * 60;

      // Check if caught
      if (target.y >= 85 && target.y <= 100) {
        if (this.checkCatch(target)) {
          toRemove.push(target.id);
        }
      }

      // Check if missed
      if (target.y > 100) {
        this.misses++;
        toRemove.push(target.id);
      }
    });

    this.targets = this.targets.filter(t => !toRemove.includes(t.id));
    return toRemove;
  }

  tick() {
    if (this.timeRemaining > 0) {
      this.timeRemaining--;
    }
    return this.timeRemaining;
  }

  isComplete() {
    return this.timeRemaining <= 0;
  }

  calculateReward() {
    const { minCatchesForReward, baseReward, maxReward } = GAME_CONFIG.reaction;

    if (this.catches < minCatchesForReward) {
      return 0;
    }

    const catchBonus = Math.floor((this.catches - minCatchesForReward) * 0.8);
    return Math.min(maxReward, baseReward + catchBonus);
  }
}
