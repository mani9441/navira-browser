import { TabManager } from "../browser/TabManager";

import { eventBus, BrowserEventTypes } from "../browser/BrowserEvents";

import { ThemeDetector } from "./ThemeDetector";

import { CursorService } from "./CursorService";

import { useBrowserStore } from "../store/browserStore";

import { HistoryManager } from "../browser/HistoryManager";

export class WebviewService {
  static attach(view, tabId) {
    /* =========================================
       META
    ========================================= */

    const syncNavigationState = () => {
      TabManager.update(tabId, {
        title: view.getTitle() || "New Tab",

        url: view.getURL(),

        loading: view.isLoading(),
      });
    };

    /* =========================================
       THEME + CURSOR
    ========================================= */

    const applyTheme = async () => {
      const mode = await ThemeDetector.detect(view);

      useBrowserStore.getState().setThemeMode(mode);

      eventBus.emit(BrowserEventTypes.THEME_CHANGED, { mode });

      await CursorService.inject(view, mode);
    };

    /* =========================================
       FAVICON
    ========================================= */

    const handleFavicon = (e) => {
      TabManager.update(tabId, {
        favicon: e.favicons?.[0] || null,
      });
    };

    /* =========================================
       LOADING
    ========================================= */

    const handleLoadingStart = () => {
      TabManager.update(tabId, {
        loading: true,
      });

      eventBus.emit(BrowserEventTypes.PAGE_LOADING, { tabId });
    };

    const handleLoadingStop = async () => {
      TabManager.update(tabId, {
        loading: false,
      });

      await HistoryManager.add(view.getURL(), view.getTitle());

      eventBus.emit(BrowserEventTypes.PAGE_LOADED, {
        tabId,
        url: view.getURL(),
      });
    };

    /* =========================================
       NEW WINDOW
    ========================================= */

    const handleNewWindow = (e) => {
      TabManager.create(e.url);
    };

    /* =========================================
       EVENTS
    ========================================= */

    view.addEventListener("dom-ready", applyTheme);

    view.addEventListener("page-title-updated", syncNavigationState);

    view.addEventListener("did-navigate", syncNavigationState);

    view.addEventListener("did-navigate-in-page", syncNavigationState);

    view.addEventListener("did-start-loading", syncNavigationState);

    view.addEventListener("did-stop-loading", syncNavigationState);

    // view.addEventListener(
    //   "did-navigate",
    //   updateURL,
    // );

    view.addEventListener("page-favicon-updated", handleFavicon);

    view.addEventListener("did-start-loading", handleLoadingStart);

    view.addEventListener("did-stop-loading", handleLoadingStop);

    view.addEventListener("new-window", handleNewWindow);

    /* =========================================
       CLEANUP
    ========================================= */

    return () => {
      view.removeEventListener("dom-ready", applyTheme);

      view.removeEventListener("page-title-updated", syncNavigationState);

      view.removeEventListener("did-navigate", syncNavigationState);

      view.removeEventListener("did-navigate-in-page", syncNavigationState);

      view.removeEventListener("did-start-loading", syncNavigationState);

      view.removeEventListener("did-stop-loading", syncNavigationState);

      view.removeEventListener("page-favicon-updated", handleFavicon);

      view.removeEventListener("did-start-loading", handleLoadingStart);

      view.removeEventListener("did-stop-loading", handleLoadingStop);

      view.removeEventListener("new-window", handleNewWindow);
    };
  }
}
