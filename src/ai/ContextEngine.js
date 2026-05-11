import { browser } from "../browser/BrowserAPI";

import { HistoryManager } from "../browser/HistoryManager";

import { useAIStore } from "../store/aiStore";

export class ContextEngine {
  static async build() {
    const activeTab = browser.state.getActiveTab();

    const tabs = browser.state.getTabs();

    const history = await HistoryManager.getAll();

    const context = {
      timestamp: Date.now(),

      activeTab: activeTab
        ? {
            id: activeTab.id,

            title: activeTab.title,

            url: activeTab.url,

            extraction: activeTab.extraction || null,

            classification: activeTab.classification || null,
          }
        : null,

      openTabs: tabs.map((tab) => ({
        id: tab.id,

        title: tab.title,

        url: tab.url,

        extraction: tab.extraction || null,

        classification: tab.classification || null,
      })),

      recentHistory: history?.slice(0, 20)?.map((h) => ({
        title: h.title,
        url: h.url,
      })),

      currentTask: null,
    };

    useAIStore.getState().setContext(context);

    return context;
  }
}
