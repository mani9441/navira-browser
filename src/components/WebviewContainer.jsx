import { useEffect } from "react";

import { useBrowserStore } from "../store/browserStore";

import { WebviewService } from "../services/WebviewService";

export default function WebviewContainer() {
  const tabs = useBrowserStore((s) => s.tabs);

  const activeTabId = useBrowserStore((s) => s.activeTabId);

  useEffect(() => {
    const views = document.querySelectorAll("webview");

    const cleanups = [];

    views.forEach((view) => {
      const viewId = Number(view.dataset.id);

      const updateTabMeta = () => {
        useBrowserStore.setState((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === viewId
              ? {
                  ...tab,
                  title: view.getTitle() || "New Tab",
                  url: view.getURL() || tab.url,
                }
              : tab,
          ),
        }));
      };

      const handleFavicon = (e) => {
        useBrowserStore.setState((state) => ({
          tabs: state.tabs.map((tab) =>
            tab.id === viewId
              ? {
                  ...tab,
                  favicon: e.favicons?.[0] || null,
                }
              : tab,
          ),
        }));
      };

      view.addEventListener("page-title-updated", updateTabMeta);

      view.addEventListener("did-navigate", updateTabMeta);

      view.addEventListener("did-navigate-in-page", updateTabMeta);

      view.addEventListener("page-favicon-updated", handleFavicon);

      cleanups.push(() => {
        view.removeEventListener("page-title-updated", updateTabMeta);

        view.removeEventListener("did-navigate", updateTabMeta);

        view.removeEventListener("did-navigate-in-page", updateTabMeta);

        view.removeEventListener("page-favicon-updated", handleFavicon);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [tabs.length]);

  console.log({
    tabs,
    activeTabId,
  });

  return (
    <div className="content-viewport">
      {tabs.map((tab) => (
        <webview
          key={tab.id}
          data-id={tab.id}
          partition={tab.partition}
          src={tab.url}
          className={tab.id === activeTabId ? "active-view" : ""}
          style={{
            position: "absolute",
            inset: 0,

            width: "100%",
            height: "100%",

            opacity: tab.id === activeTabId ? 1 : 0,

            pointerEvents: tab.id === activeTabId ? "auto" : "none",

            zIndex: tab.id === activeTabId ? 2 : 1,

            background: "#fff",
          }}
        />
      ))}
    </div>
  );
}
