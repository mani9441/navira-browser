import { TabManager } from "../browser/TabManager";

import {
  eventBus,
  BrowserEventTypes,
} from "../browser/BrowserEvents";

import { ThemeDetector } from "./ThemeDetector";
import { CursorService } from "./CursorService";

import { useBrowserStore } from "../store/browserStore";

import { HistoryManager } from "../browser/HistoryManager";

export class WebviewService {
  static attach(view, tabId) {
    const updateMetadata = () => {
      TabManager.update(tabId, {
        title:
          view.getTitle() || "New Tab",

        url: view.getURL(),
      });
    };

    const handleDomReady = async () => {
      const mode =
        await ThemeDetector.detect(view);

      useBrowserStore
        .getState()
        .setThemeMode(mode);

      eventBus.emit(
        BrowserEventTypes.THEME_CHANGED,
        { mode },
      );

      await CursorService.inject(
        view,
        mode,
      );
    };

    const handleFavicon = (e) => {
      TabManager.update(tabId, {
        favicon:
          e.favicons?.[0] || null,
      });
    };

    const handleLoadingStart = () => {
      TabManager.update(tabId, {
        loading: true,
      });

      eventBus.emit(
        BrowserEventTypes.PAGE_LOADING,
        { tabId },
      );
    };

    const handleLoadingStop =
      async () => {
        const url = view.getURL();

        const title =
          view.getTitle();

        TabManager.update(tabId, {
          loading: false,
        });

        updateMetadata();

        HistoryManager.add(
          url,
          title,
        );

        const mode =
          await ThemeDetector.detect(
            view,
          );

        useBrowserStore
          .getState()
          .setThemeMode(mode);

        await CursorService.inject(
          view,
          mode,
        );

        eventBus.emit(
          BrowserEventTypes.PAGE_LOADED,
          {
            tabId,
            url,
          },
        );
      };

    const handleNewWindow = (e) => {
      TabManager.create(e.url);
    };

    view.addEventListener(
      "dom-ready",
      handleDomReady,
    );

    view.addEventListener(
      "page-title-updated",
      updateMetadata,
    );

    view.addEventListener(
      "did-navigate",
      updateMetadata,
    );

    view.addEventListener(
      "did-navigate-in-page",
      updateMetadata,
    );

    view.addEventListener(
      "page-favicon-updated",
      handleFavicon,
    );

    view.addEventListener(
      "did-start-loading",
      handleLoadingStart,
    );

    view.addEventListener(
      "did-stop-loading",
      handleLoadingStop,
    );

    view.addEventListener(
      "new-window",
      handleNewWindow,
    );

    return () => {
      view.removeEventListener(
        "dom-ready",
        handleDomReady,
      );

      view.removeEventListener(
        "page-title-updated",
        updateMetadata,
      );

      view.removeEventListener(
        "did-navigate",
        updateMetadata,
      );

      view.removeEventListener(
        "did-navigate-in-page",
        updateMetadata,
      );

      view.removeEventListener(
        "page-favicon-updated",
        handleFavicon,
      );

      view.removeEventListener(
        "did-start-loading",
        handleLoadingStart,
      );

      view.removeEventListener(
        "did-stop-loading",
        handleLoadingStop,
      );

      view.removeEventListener(
        "new-window",
        handleNewWindow,
      );
    };
  }
}