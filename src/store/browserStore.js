import { create } from "zustand";

export const useBrowserStore = create((set, get) => ({
  tabs: [],
  activeTabId: null,

  profiles: [],
  activeProfile: null,

  downloads: [],
  history: [],
  permissions: [],

  isLoaded: false,
  themeMode: "dark",

  setLoaded: (value) =>
    set({
      isLoaded: value,
    }),

  setThemeMode: (mode) =>
    set({
      themeMode: mode,
    }),

  setProfiles: (profiles) =>
    set({
      profiles,
    }),

  setActiveProfile: (profile) =>
    set({
      activeProfile: profile,
    }),

  setTabs: (tabs) =>
    set({
      tabs,
    }),

  setDownloads: (downloads) =>
    set({
      downloads,
    }),

  setHistory: (history) =>
    set({
      history,
    }),

  setPermissions: (permissions) =>
    set({
      permissions,
    }),

  setActiveTab: (id) =>
    set({
      activeTabId: id,
    }),

  addTab: (tab) =>
    set((state) => ({
      tabs: [...state.tabs, tab],
    })),

  removeTab: (id) =>
    set((state) => ({
      tabs: state.tabs.filter(
        (t) => t.id !== id,
      ),
    })),

  updateTab: (id, updates) =>
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
            }
          : t,
      ),
    })),

  getActiveTab: () => {
    const state = get();

    return state.tabs.find(
      (t) => t.id === state.activeTabId,
    );
  },
}));