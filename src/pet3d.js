/**
 * 3D Pet Module using Three.js
 */
import * as THREE from 'three';

export const COLORS = {
  pink: { body: 0xFFB6C1, blush: 0xFF8FAB },
  blue: { body: 0x87CEEB, blush: 0x5DADE2 },
  purple: { body: 0xDDA0DD, blush: 0xBA68C8 },
  mint: { body: 0x98FB98, blush: 0x66BB6A },
  peach: { body: 0xFFDAB9, blush: 0xFFAB91 },
  lavender: { body: 0xE6E6FA, blush: 0xB39DDB },
  yellow: { body: 0xFFFACD, blush: 0xFFE082 },
  coral: { body: 0xF08080, blush: 0xE57373 },
};

export const ACCESSORIES = {
  hats: {
    none: { name: 'None', price: 0 },
    bow: { name: 'Bow', price: 25 },
    crown: { name: 'Crown', price: 50 },
    cap: { name: 'Cap', price: 30 },
    flower: { name: 'Flower', price: 20 },
    party: { name: 'Party Hat', price: 35 },
  },
  accessories: {
    none: { name: 'None', price: 0 },
    glasses: { name: 'Glasses', price: 20 },
    bowtie: { name: 'Bowtie', price: 25 },
    scarf: { name: 'Scarf', price: 35 },
    necklace: { name: 'Necklace', price: 40 },
  },
  colors: {
    pink: { name: 'Pink', price: 0 },
    blue: { name: 'Blue', price: 15 },
    purple: { name: 'Purple', price: 20 },
    mint: { name: 'Mint', price: 15 },
    peach: { name: 'Peach', price: 20 },
    lavender: { name: 'Lavender', price: 25 },
    yellow: { name: 'Yellow', price: 15 },
    coral: { name: 'Coral', price: 20 },
  },
};

/**
 * Creates the pet body geometry parts
 */
export function createPetGeometry() {
  return {
    body: new THREE.SphereGeometry(1, 32, 32),
    ear: new THREE.SphereGeometry(0.3, 16, 16),
    eye: new THREE.SphereGeometry(0.15, 16, 16),
    eyeShine: new THREE.SphereGeometry(0.05, 8, 8),
    blush: new THREE.SphereGeometry(0.12, 16, 16),
    arm: new THREE.SphereGeometry(0.2, 16, 16),
    foot: new THREE.SphereGeometry(0.25, 16, 16),
  };
}

/**
 * Creates accessory geometry
 */
export function createAccessoryGeometry(type) {
  if (type === 'none') return null;

  switch (type) {
    case 'crown':
      return new THREE.ConeGeometry(0.4, 0.5, 5);
    case 'bow':
      return new THREE.SphereGeometry(0.2, 16, 16);
    case 'cap':
      return new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    case 'party':
      return new THREE.ConeGeometry(0.3, 0.6, 16);
    case 'flower':
      return new THREE.SphereGeometry(0.15, 16, 16);
    case 'glasses':
      return new THREE.TorusGeometry(0.15, 0.02, 8, 16);
    case 'bowtie':
      return new THREE.ConeGeometry(0.15, 0.2, 4);
    default:
      return new THREE.SphereGeometry(0.1, 8, 8);
  }
}

/**
 * 3D Pet Class
 */
export class Pet3D {
  constructor() {
    this.group = new THREE.Group();
    this.currentColor = 'pink';
    this.currentHat = 'none';
    this.currentAccessory = 'none';
    this.animationState = 'idle';
    this.animationTime = 0;
    this.animationDuration = 0;

    this.bodyMesh = null;
    this.blushMeshes = [];
    this.hatGroup = null;
    this.accessoryGroup = null;

    this.buildPet();
  }

  buildPet() {
    const geometry = createPetGeometry();
    const colors = COLORS[this.currentColor];

    // Body material
    const bodyMaterial = new THREE.MeshToonMaterial({
      color: colors.body,
    });

    // Create body
    this.bodyMesh = new THREE.Mesh(geometry.body, bodyMaterial);
    this.bodyMesh.scale.set(1, 0.85, 0.9);
    this.group.add(this.bodyMesh);

    // Create ears
    const earMaterial = new THREE.MeshToonMaterial({ color: colors.body });
    const leftEar = new THREE.Mesh(geometry.ear, earMaterial);
    leftEar.position.set(-0.6, 0.7, 0);
    leftEar.scale.set(1, 1.3, 0.8);
    this.group.add(leftEar);

    const rightEar = new THREE.Mesh(geometry.ear, earMaterial.clone());
    rightEar.position.set(0.6, 0.7, 0);
    rightEar.scale.set(1, 1.3, 0.8);
    this.group.add(rightEar);

    // Create eyes
    const eyeMaterial = new THREE.MeshToonMaterial({ color: 0x333333 });
    const leftEye = new THREE.Mesh(geometry.eye, eyeMaterial);
    leftEye.position.set(-0.3, 0.15, 0.8);
    this.group.add(leftEye);

    const rightEye = new THREE.Mesh(geometry.eye, eyeMaterial.clone());
    rightEye.position.set(0.3, 0.15, 0.8);
    this.group.add(rightEye);

    // Eye shine
    const shineMaterial = new THREE.MeshToonMaterial({ color: 0xffffff });
    const leftShine = new THREE.Mesh(geometry.eyeShine, shineMaterial);
    leftShine.position.set(-0.25, 0.2, 0.9);
    this.group.add(leftShine);

    const rightShine = new THREE.Mesh(geometry.eyeShine, shineMaterial.clone());
    rightShine.position.set(0.35, 0.2, 0.9);
    this.group.add(rightShine);

    // Create blush
    const blushMaterial = new THREE.MeshToonMaterial({
      color: colors.blush,
      transparent: true,
      opacity: 0.6,
    });

    const leftBlush = new THREE.Mesh(geometry.blush, blushMaterial);
    leftBlush.position.set(-0.5, -0.05, 0.75);
    leftBlush.scale.set(1.5, 1, 0.5);
    this.blushMeshes.push(leftBlush);
    this.group.add(leftBlush);

    const rightBlush = new THREE.Mesh(geometry.blush, blushMaterial.clone());
    rightBlush.position.set(0.5, -0.05, 0.75);
    rightBlush.scale.set(1.5, 1, 0.5);
    this.blushMeshes.push(rightBlush);
    this.group.add(rightBlush);

    // Create arms
    const armMaterial = new THREE.MeshToonMaterial({ color: colors.body });
    const leftArm = new THREE.Mesh(geometry.arm, armMaterial);
    leftArm.position.set(-0.9, -0.2, 0.3);
    this.group.add(leftArm);

    const rightArm = new THREE.Mesh(geometry.arm, armMaterial.clone());
    rightArm.position.set(0.9, -0.2, 0.3);
    this.group.add(rightArm);

    // Create feet
    const footMaterial = new THREE.MeshToonMaterial({ color: colors.body });
    const leftFoot = new THREE.Mesh(geometry.foot, footMaterial);
    leftFoot.position.set(-0.4, -0.8, 0.3);
    leftFoot.scale.set(1, 0.6, 1.2);
    this.group.add(leftFoot);

    const rightFoot = new THREE.Mesh(geometry.foot, footMaterial.clone());
    rightFoot.position.set(0.4, -0.8, 0.3);
    rightFoot.scale.set(1, 0.6, 1.2);
    this.group.add(rightFoot);

    // Accessory groups
    this.hatGroup = new THREE.Group();
    this.hatGroup.position.set(0, 1, 0);
    this.group.add(this.hatGroup);

    this.accessoryGroup = new THREE.Group();
    this.group.add(this.accessoryGroup);
  }

  setColor(colorName) {
    if (!COLORS[colorName]) return;

    this.currentColor = colorName;
    const colors = COLORS[colorName];

    // Update all body-colored meshes
    this.group.children.forEach(child => {
      if (child.material && child !== this.hatGroup && child !== this.accessoryGroup) {
        if (this.blushMeshes.includes(child)) {
          child.material.color.set(colors.blush);
        } else if (child.material.color) {
          const colorHex = child.material.color.getHex();
          // Only update body-colored parts
          if (colorHex !== 0x333333 && colorHex !== 0xffffff) {
            child.material.color.set(colors.body);
          }
        }
      }
    });
  }

  setHat(hatName) {
    // Clear existing hat
    while (this.hatGroup.children.length > 0) {
      this.hatGroup.remove(this.hatGroup.children[0]);
    }

    this.currentHat = hatName;

    if (hatName === 'none') return;

    const geometry = createAccessoryGeometry(hatName);
    if (!geometry) return;

    const colors = {
      crown: 0xFFD700,
      bow: 0xFF69B4,
      cap: 0x4169E1,
      party: 0xFF69B4,
      flower: 0xFFB6C1,
    };

    const material = new THREE.MeshToonMaterial({
      color: colors[hatName] || 0xFFFFFF,
    });

    const hatMesh = new THREE.Mesh(geometry, material);

    // Position based on hat type
    switch (hatName) {
      case 'crown':
        hatMesh.rotation.x = Math.PI;
        hatMesh.position.y = 0.3;
        break;
      case 'party':
        hatMesh.position.y = 0.3;
        break;
      case 'cap':
        hatMesh.rotation.x = 0.2;
        hatMesh.position.z = 0.2;
        break;
      case 'flower':
        hatMesh.position.set(-0.5, -0.2, 0.2);
        break;
      case 'bow':
        hatMesh.position.y = 0.1;
        break;
    }

    this.hatGroup.add(hatMesh);
  }

  setAccessory(accessoryName) {
    // Clear existing accessory
    while (this.accessoryGroup.children.length > 0) {
      this.accessoryGroup.remove(this.accessoryGroup.children[0]);
    }

    this.currentAccessory = accessoryName;

    if (accessoryName === 'none') return;

    const geometry = createAccessoryGeometry(accessoryName);
    if (!geometry) return;

    const colors = {
      glasses: 0x333333,
      bowtie: 0xFF69B4,
      scarf: 0xE74C3C,
      necklace: 0xFFD700,
    };

    const material = new THREE.MeshToonMaterial({
      color: colors[accessoryName] || 0xFFFFFF,
    });

    const mesh = new THREE.Mesh(geometry, material);

    // Position based on accessory type
    switch (accessoryName) {
      case 'glasses':
        const leftLens = mesh.clone();
        leftLens.position.set(-0.3, 0.15, 0.85);
        this.accessoryGroup.add(leftLens);

        const rightLens = new THREE.Mesh(geometry, material);
        rightLens.position.set(0.3, 0.15, 0.85);
        this.accessoryGroup.add(rightLens);
        return;
      case 'bowtie':
        mesh.position.set(0, -0.5, 0.8);
        mesh.rotation.z = Math.PI / 2;
        break;
      case 'scarf':
        mesh.position.set(0, -0.4, 0.5);
        mesh.scale.set(3, 1, 1);
        break;
      case 'necklace':
        mesh.position.set(0, -0.3, 0.7);
        break;
    }

    this.accessoryGroup.add(mesh);
  }

  playAnimation(state) {
    this.animationState = state;
    this.animationTime = 0;

    if (state !== 'idle' && state !== 'sad') {
      this.animationDuration = 500;
      setTimeout(() => {
        if (this.animationState === state) {
          this.animationState = 'idle';
        }
      }, this.animationDuration);
    }
  }

  updateMood(happiness, hunger) {
    if (happiness < 25 || hunger < 25) {
      this.animationState = 'sad';
    } else if (this.animationState === 'sad') {
      this.animationState = 'idle';
    }
  }

  update(deltaTime) {
    this.animationTime += deltaTime;

    const t = this.animationTime;

    switch (this.animationState) {
      case 'idle':
        // Gentle bobbing
        this.group.position.y = Math.sin(t * 2) * 0.05;
        this.group.rotation.z = Math.sin(t * 1.5) * 0.02;
        break;

      case 'happy':
        // Excited bouncing and wiggling
        this.group.position.y = Math.abs(Math.sin(t * 8)) * 0.15;
        this.group.rotation.z = Math.sin(t * 10) * 0.1;
        this.group.scale.set(
          1 + Math.sin(t * 8) * 0.05,
          1 - Math.sin(t * 8) * 0.05,
          1
        );
        break;

      case 'eating':
        // Chomping motion
        this.group.scale.set(
          1 + Math.sin(t * 12) * 0.08,
          1 - Math.sin(t * 12) * 0.08,
          1
        );
        this.group.position.y = Math.sin(t * 6) * 0.03;
        break;

      case 'sad':
        // Droopy, slow movement
        this.group.position.y = Math.sin(t * 0.5) * 0.02 - 0.05;
        this.group.rotation.z = Math.sin(t * 0.5) * 0.03 - 0.05;
        break;

      default:
        break;
    }
  }
}
