import { useBrowserStore } from "../store/browserStore";

import {
  eventBus,
  BrowserEventTypes,
} from "./BrowserEvents";

import { StorageService } from "../services/StorageService";

export class TabManager {
  static async create(
    url = "https://www.google.com",
  ) {
    const state = useBrowserStore.getState();

    const profile =
      state.activeProfile ||
      {
        id: 1,
        name: "Personal",
        partition: "persist:personal",
      };

    const id = Date.now();

    const tab = {
      id,
      profileId: profile.id,

      partition: profile.partition,

      url,
      title: "New Tab",
      favicon: null,

      loading: false,

      createdAt: Date.now(),
    };

    state.addTab(tab);

    state.setActiveTab(id);

    await StorageService.saveTabs(
      useBrowserStore.getState().tabs,
      id,
    );

    eventBus.emit(
      BrowserEventTypes.TAB_CREATED,
      tab,
    );

    return tab;
  }

  static async close(id) {
    const state = useBrowserStore.getState();

    const filtered = state.tabs.filter(
      (t) => t.id !== id,
    );

    if (filtered.length === 0) {
      return this.create();
    }

    state.removeTab(id);

    if (state.activeTabId === id) {
      const next =
        filtered[filtered.length - 1];

      state.setActiveTab(next.id);
    }

    await StorageService.saveTabs(
      useBrowserStore.getState().tabs,
      useBrowserStore.getState()
        .activeTabId,
    );

    eventBus.emit(
      BrowserEventTypes.TAB_CLOSED,
      { id },
    );
  }

  static async switch(id) {
    useBrowserStore.getState().setActiveTab(
      id,
    );

    await StorageService.saveTabs(
      useBrowserStore.getState().tabs,
      id,
    );

    eventBus.emit(
      BrowserEventTypes.TAB_SWITCHED,
      { id },
    );
  }

  static async update(id, updates) {
    useBrowserStore.getState().updateTab(
      id,
      updates,
    );

    await StorageService.saveTabs(
      useBrowserStore.getState().tabs,
      useBrowserStore.getState()
        .activeTabId,
    );
  }

  static async navigate(id, url) {
    this.update(id, {
      url,
      loading: true,
    });

    eventBus.emit(
      BrowserEventTypes.PAGE_NAVIGATED,
      {
        id,
        url,
      },
    );
  }
}