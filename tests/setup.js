import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  store: {},
  getItem: function(key) {
    return this.store[key] || null;
  },
  setItem: function(key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function(key) {
    delete this.store[key];
  },
  clear: function() {
    this.store = {};
  }
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock
});

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
