export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  function notify() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  return {
    getState() {
      return state;
    },
    setState(patch) {
      state = { ...state, ...patch };
      notify();
    },
    update(fn) {
      state = fn(state);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => listeners.delete(listener);
    }
  };
}
