class BrowserEvents {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback,
    );
  }

  emit(event, payload) {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((callback) => {
      callback(payload);
    });
  }
}

export const eventBus = new BrowserEvents();

export const BrowserEventTypes = {
  TAB_CREATED: "TAB_CREATED",
  TAB_CLOSED: "TAB_CLOSED",
  TAB_SWITCHED: "TAB_SWITCHED",

  PAGE_NAVIGATED: "PAGE_NAVIGATED",
  PAGE_LOADED: "PAGE_LOADED",
  PAGE_FAILED: "PAGE_FAILED",

  PAGE_LOADING: "PAGE_LOADING",
  PAGE_STOPPED: "PAGE_STOPPED",

  THEME_CHANGED: "THEME_CHANGED",
};