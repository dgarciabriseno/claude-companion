import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  MemoryGame,
  SequenceGame,
  ReactionGame,
  calculateReward,
  GAME_CONFIG
} from '../src/minigames.js';

describe('Game Configuration', () => {
  it('should have challenging reward thresholds', () => {
    // Memory game: need most pairs for good reward
    expect(GAME_CONFIG.memory.minPairsForReward).toBeGreaterThanOrEqual(4);

    // Sequence game: need several levels for reward
    expect(GAME_CONFIG.sequence.minLevelForReward).toBeGreaterThanOrEqual(3);

    // Reaction game: need several catches for reward
    expect(GAME_CONFIG.reaction.minCatchesForReward).toBeGreaterThanOrEqual(5);
  });

  it('should have short time limits for difficulty', () => {
    expect(GAME_CONFIG.memory.timeLimit).toBeLessThanOrEqual(20);
    expect(GAME_CONFIG.reaction.timeLimit).toBeLessThanOrEqual(15);
  });
});

describe('MemoryGame', () => {
  let game;

  beforeEach(() => {
    game = new MemoryGame();
  });

  describe('initialization', () => {
    it('should create shuffled pairs of cards', () => {
      game.start();
      expect(game.cards.length).toBe(12); // 6 pairs

      // Check each symbol appears exactly twice
      const counts = {};
      game.cards.forEach(card => {
        counts[card.symbol] = (counts[card.symbol] || 0) + 1;
      });

      Object.values(counts).forEach(count => {
        expect(count).toBe(2);
      });
    });

    it('should start with zero matched pairs', () => {
      game.start();
      expect(game.matchedPairs).toBe(0);
    });

    it('should set time remaining', () => {
      game.start();
      expect(game.timeRemaining).toBe(GAME_CONFIG.memory.timeLimit);
    });
  });

  describe('card flipping', () => {
    beforeEach(() => {
      game.start();
    });

    it('should flip card on selection', () => {
      game.selectCard(0);
      expect(game.cards[0].flipped).toBe(true);
    });

    it('should not flip already matched card', () => {
      game.cards[0].matched = true;
      game.selectCard(0);
      expect(game.flippedCards.length).toBe(0);
    });

    it('should match two cards with same symbol', () => {
      // Find two cards with same symbol
      const symbol = game.cards[0].symbol;
      const secondIndex = game.cards.findIndex((c, i) => i !== 0 && c.symbol === symbol);

      game.selectCard(0);
      const result = game.selectCard(secondIndex);

      expect(result.matched).toBe(true);
      expect(game.matchedPairs).toBe(1);
    });

    it('should not match cards with different symbols', () => {
      // Find two cards with different symbols
      const firstSymbol = game.cards[0].symbol;
      const secondIndex = game.cards.findIndex(c => c.symbol !== firstSymbol);

      game.selectCard(0);
      const result = game.selectCard(secondIndex);

      expect(result.matched).toBe(false);
    });
  });

  describe('game completion', () => {
    it('should be complete when all pairs matched', () => {
      game.start();
      game.matchedPairs = 6;
      expect(game.isComplete()).toBe(true);
    });

    it('should be complete when time runs out', () => {
      game.start();
      game.timeRemaining = 0;
      expect(game.isComplete()).toBe(true);
    });
  });

  describe('reward calculation', () => {
    it('should give no reward for few matches', () => {
      game.start();
      game.matchedPairs = 2;
      game.timeRemaining = 0;
      expect(game.calculateReward()).toBe(0);
    });

    it('should give reward for meeting threshold', () => {
      game.start();
      game.matchedPairs = GAME_CONFIG.memory.minPairsForReward;
      expect(game.calculateReward()).toBeGreaterThan(0);
    });

    it('should give bonus for time remaining', () => {
      game.start();
      game.matchedPairs = 6;
      game.timeRemaining = 10;
      const rewardWithTime = game.calculateReward();

      game.timeRemaining = 0;
      const rewardWithoutTime = game.calculateReward();

      expect(rewardWithTime).toBeGreaterThan(rewardWithoutTime);
    });
  });
});

describe('SequenceGame', () => {
  let game;

  beforeEach(() => {
    game = new SequenceGame();
  });

  describe('initialization', () => {
    it('should start at level 1', () => {
      game.start();
      expect(game.level).toBe(1);
    });

    it('should have empty sequence initially', () => {
      game.start();
      expect(game.sequence.length).toBe(0);
    });

    it('should have 4 buttons', () => {
      expect(GAME_CONFIG.sequence.buttonCount).toBe(4);
    });
  });

  describe('sequence generation', () => {
    it('should add one element to sequence per level', () => {
      game.start();
      game.addToSequence();
      expect(game.sequence.length).toBe(1);

      game.addToSequence();
      expect(game.sequence.length).toBe(2);
    });

    it('should generate valid button indices', () => {
      game.start();
      for (let i = 0; i < 10; i++) {
        game.addToSequence();
      }

      game.sequence.forEach(index => {
        expect(index).toBeGreaterThanOrEqual(0);
        expect(index).toBeLessThan(GAME_CONFIG.sequence.buttonCount);
      });
    });
  });

  describe('player input', () => {
    beforeEach(() => {
      game.start();
      game.sequence = [0, 1, 2]; // Fixed sequence for testing
      game.startPlayerTurn();
    });

    it('should accept correct input', () => {
      expect(game.checkInput(0)).toEqual({ correct: true, complete: false });
    });

    it('should reject incorrect input', () => {
      expect(game.checkInput(3)).toEqual({ correct: false, complete: false });
    });

    it('should complete level when sequence matched', () => {
      game.checkInput(0);
      game.checkInput(1);
      const result = game.checkInput(2);
      expect(result.complete).toBe(true);
    });
  });

  describe('reward calculation', () => {
    it('should give no reward for early failure', () => {
      game.start();
      game.level = 2;
      expect(game.calculateReward()).toBe(0);
    });

    it('should give reward for reaching threshold', () => {
      game.start();
      game.level = GAME_CONFIG.sequence.minLevelForReward;
      expect(game.calculateReward()).toBeGreaterThan(0);
    });

    it('should give more reward for higher levels', () => {
      game.start();
      game.level = 5;
      const reward5 = game.calculateReward();

      game.level = 7;
      const reward7 = game.calculateReward();

      expect(reward7).toBeGreaterThan(reward5);
    });
  });
});

describe('ReactionGame', () => {
  let game;

  beforeEach(() => {
    game = new ReactionGame();
  });

  describe('initialization', () => {
    it('should start with zero catches', () => {
      game.start();
      expect(game.catches).toBe(0);
    });

    it('should set time limit', () => {
      game.start();
      expect(game.timeRemaining).toBe(GAME_CONFIG.reaction.timeLimit);
    });

    it('should set catcher position to center', () => {
      game.start();
      expect(game.catcherPosition).toBe(50);
    });
  });

  describe('target spawning', () => {
    it('should spawn targets with random positions', () => {
      game.start();
      const target1 = game.spawnTarget();
      const target2 = game.spawnTarget();

      expect(target1.x).toBeGreaterThanOrEqual(10);
      expect(target1.x).toBeLessThanOrEqual(90);
      // Positions should usually be different (random)
    });

    it('should spawn targets with fall speed', () => {
      game.start();
      const target = game.spawnTarget();
      expect(target.fallSpeed).toBeGreaterThan(0);
    });
  });

  describe('catching', () => {
    beforeEach(() => {
      game.start();
    });

    it('should catch target when catcher is close enough', () => {
      game.catcherPosition = 50;
      const caught = game.checkCatch({ x: 52, y: 90 }); // Close to catcher
      expect(caught).toBe(true);
    });

    it('should miss target when catcher is too far', () => {
      game.catcherPosition = 20;
      const caught = game.checkCatch({ x: 80, y: 90 }); // Far from catcher
      expect(caught).toBe(false);
    });

    it('should increment catches on successful catch', () => {
      game.catcherPosition = 50;
      game.checkCatch({ x: 50, y: 90 });
      expect(game.catches).toBe(1);
    });
  });

  describe('catcher movement', () => {
    it('should move catcher within bounds', () => {
      game.start();
      game.moveCatcher(100);
      expect(game.catcherPosition).toBeLessThanOrEqual(90);

      game.moveCatcher(0);
      expect(game.catcherPosition).toBeGreaterThanOrEqual(10);
    });
  });

  describe('reward calculation', () => {
    it('should give no reward for few catches', () => {
      game.start();
      game.catches = 3;
      expect(game.calculateReward()).toBe(0);
    });

    it('should give reward for meeting threshold', () => {
      game.start();
      game.catches = GAME_CONFIG.reaction.minCatchesForReward;
      expect(game.calculateReward()).toBeGreaterThan(0);
    });
  });
});

describe('calculateReward utility', () => {
  it('should return 0 for performance below threshold', () => {
    expect(calculateReward(2, 5, 3, 10)).toBe(0);
  });

  it('should scale reward based on performance', () => {
    const lowReward = calculateReward(5, 5, 2, 10);
    const highReward = calculateReward(8, 5, 2, 10);
    expect(highReward).toBeGreaterThan(lowReward);
  });
});
