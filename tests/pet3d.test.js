import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  Pet3D,
  COLORS,
  ACCESSORIES,
  createPetGeometry,
  createAccessoryGeometry
} from '../src/pet3d.js';

// Mock Three.js objects
const createMockMaterial = () => ({
  color: { set: vi.fn(), getHex: vi.fn(() => 0xFFB6C1) },
  clone: vi.fn(function() { return createMockMaterial(); }),
});

const createMockMesh = () => ({
  position: { set: vi.fn(), x: 0, y: 0, z: 0 },
  rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
  scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  material: createMockMaterial(),
  clone: vi.fn(function() { return createMockMesh(); }),
});

vi.mock('three', () => ({
  Group: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: [],
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    rotation: { set: vi.fn(), x: 0, y: 0, z: 0 },
    scale: { set: vi.fn(), x: 1, y: 1, z: 1 },
  })),
  Mesh: vi.fn(() => createMockMesh()),
  SphereGeometry: vi.fn(),
  CylinderGeometry: vi.fn(),
  ConeGeometry: vi.fn(),
  TorusGeometry: vi.fn(),
  MeshToonMaterial: vi.fn(() => createMockMaterial()),
  Color: vi.fn((hex) => ({ hex })),
}));

describe('Pet Colors', () => {
  it('should have default pink color', () => {
    expect(COLORS.pink).toBeDefined();
  });

  it('should have multiple color options', () => {
    expect(Object.keys(COLORS).length).toBeGreaterThanOrEqual(6);
  });

  it('should have both body and blush colors', () => {
    Object.values(COLORS).forEach(color => {
      expect(color.body).toBeDefined();
      expect(color.blush).toBeDefined();
    });
  });
});

describe('Accessories', () => {
  it('should have hat options', () => {
    expect(ACCESSORIES.hats).toBeDefined();
    expect(ACCESSORIES.hats.none).toBeDefined();
  });

  it('should have accessory options', () => {
    expect(ACCESSORIES.accessories).toBeDefined();
  });

  it('should have prices for items', () => {
    Object.entries(ACCESSORIES.hats).forEach(([id, hat]) => {
      if (id !== 'none') {
        expect(hat.price).toBeGreaterThan(0);
      }
    });
  });
});

describe('Pet3D', () => {
  let pet;

  beforeEach(() => {
    pet = new Pet3D();
  });

  describe('initialization', () => {
    it('should create a 3D group', () => {
      expect(pet.group).toBeDefined();
    });

    it('should have default color', () => {
      expect(pet.currentColor).toBe('pink');
    });

    it('should have no accessories by default', () => {
      expect(pet.currentHat).toBe('none');
      expect(pet.currentAccessory).toBe('none');
    });
  });

  describe('color changes', () => {
    it('should change body color', () => {
      pet.setColor('blue');
      expect(pet.currentColor).toBe('blue');
    });

    it('should not change to invalid color', () => {
      pet.setColor('nonexistent');
      expect(pet.currentColor).toBe('pink');
    });
  });

  describe('accessories', () => {
    it('should equip hat', () => {
      pet.setHat('crown');
      expect(pet.currentHat).toBe('crown');
    });

    it('should equip accessory', () => {
      pet.setAccessory('glasses');
      expect(pet.currentAccessory).toBe('glasses');
    });

    it('should remove hat when set to none', () => {
      pet.setHat('crown');
      pet.setHat('none');
      expect(pet.currentHat).toBe('none');
    });
  });

  describe('animations', () => {
    it('should have idle animation state', () => {
      expect(pet.animationState).toBe('idle');
    });

    it('should change to happy animation', () => {
      pet.playAnimation('happy');
      expect(pet.animationState).toBe('happy');
    });

    it('should change to eating animation', () => {
      pet.playAnimation('eating');
      expect(pet.animationState).toBe('eating');
    });

    it('should change to sad animation', () => {
      pet.playAnimation('sad');
      expect(pet.animationState).toBe('sad');
    });

    it('should return to idle after animation', () => {
      vi.useFakeTimers();
      pet.playAnimation('happy');
      vi.advanceTimersByTime(1000);
      expect(pet.animationState).toBe('idle');
      vi.useRealTimers();
    });
  });

  describe('mood', () => {
    it('should update based on stats', () => {
      pet.updateMood(20, 20); // Low stats
      expect(pet.animationState).toBe('sad');
    });

    it('should be happy with good stats', () => {
      pet.updateMood(80, 80);
      expect(pet.animationState).not.toBe('sad');
    });
  });

  describe('update loop', () => {
    it('should have update method', () => {
      expect(typeof pet.update).toBe('function');
    });

    it('should update animations on tick', () => {
      const initialTime = pet.animationTime;
      pet.update(0.016); // ~60fps
      expect(pet.animationTime).not.toBe(initialTime);
    });
  });
});

describe('Geometry Creators', () => {
  it('should create pet geometry', () => {
    const geometry = createPetGeometry();
    expect(geometry).toBeDefined();
  });

  it('should create accessory geometry for crown', () => {
    const geometry = createAccessoryGeometry('crown');
    expect(geometry).toBeDefined();
  });

  it('should return null for none accessory', () => {
    const geometry = createAccessoryGeometry('none');
    expect(geometry).toBeNull();
  });
});
