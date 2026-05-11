import { TabManager } from "./TabManager";
import { useBrowserStore } from "../store/browserStore";

export const browser = {
  tabs: {
    create: async (url) => await TabManager.create(url),

    close: async (id) => await TabManager.close(id),

    switch: async (id) => await TabManager.switch(id),

    update: async (id, updates) => await TabManager.update(id, updates),
  },

  page: {
    navigate: (id, url) => TabManager.navigate(id, url),

    reload: () => {
      const view = document.querySelector(".active-view");

      if (!view) return;

      view.reload();
    },

    back: () => {
      const view = document.querySelector(".active-view");

      if (!view) return;

      if (view.canGoBack()) {
        view.goBack();
      }
    },

    forward: () => {
      const view = document.querySelector(".active-view");

      if (!view) return;

      if (view.canGoForward()) {
        view.goForward();
      }
    },
  },

  state: {
    getTabs: () => useBrowserStore.getState().tabs,

    getActiveTab: () => useBrowserStore.getState().getActiveTab(),

    getActiveTabId: () => useBrowserStore.getState().activeTabId,
  },
};
