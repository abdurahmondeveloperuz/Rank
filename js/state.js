class StateManager {
  constructor() {
    this.listeners = new Set();
    this.state = {
      classData: null,
      loading: false,
      error: null
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const stateManager = new StateManager();