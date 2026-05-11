import { useEffect, useRef } from "react";

import { useBrowserStore } from "../store/browserStore";

import { WebviewService } from "../services/WebviewService";

export default function WebviewContainer() {
  const tabs = useBrowserStore((s) => s.tabs);

  const activeTabId = useBrowserStore((s) => s.activeTabId);

  const webviewsRef = useRef({});

  const initializedRef = useRef(new Set());

  useEffect(() => {
    Object.keys(webviewsRef.current).forEach((id) => {
      const exists = tabs.find((t) => t.id === Number(id));

      if (!exists) {
        delete webviewsRef.current[id];

        initializedRef.current.delete(Number(id));
      }
    });
    tabs.forEach((tab) => {
      const view = webviewsRef.current[tab.id];

      if (!view) return;

      if (initializedRef.current.has(tab.id)) {
        return;
      }

      initializedRef.current.add(tab.id);

      WebviewService.attach(view, tab.id);
    });
  }, [tabs.length]);

  return (
    <div className="content-viewport">
      {tabs.map((tab) => (
        <webview
          key={tab.id}
          ref={(el) => {
            if (!el) return;

            webviewsRef.current[tab.id] = el;
          }}
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
