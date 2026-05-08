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

      /* =========================================
       THEME DETECTION
    ========================================= */

      const detectTheme = async () => {
        try {
          const brightness = await view.executeJavaScript(`
          (() => {
            function getBrightness(color) {
              const rgb = color.match(/\\d+/g);

              if (!rgb) return 0;

              const [r, g, b] = rgb.map(Number);

              return (r * 299 + g * 587 + b * 114) / 1000;
            }

            const bodyBg =
              getComputedStyle(document.body).backgroundColor;

            const htmlBg =
              getComputedStyle(document.documentElement).backgroundColor;

            return Math.max(
              getBrightness(bodyBg),
              getBrightness(htmlBg)
            );
          })();
        `);

          return brightness > 150 ? "light" : "dark";
        } catch {
          return "dark";
        }
      };

      /* =========================================
       CURSOR INJECTION
    ========================================= */

      const injectCursor = async (mode) => {
        try {
          const fill = mode === "light" ? "black" : "white";

          const cursorSVG = `
          <svg xmlns="http://www.w3.org/2000/svg"
               width="20"
               height="20"
               viewBox="0 0 32 32">
            <path
              d="M6 4 Q4 4 4 7 L9 27 Q9.5 29 11 29 Q12.5 29 13 27 L18 17 L27 13 Q29 12.5 29 11 Q29 9.5 27 9 L7 4 Q6.5 4 6 4 Z"
              fill="${fill}"
            />
          </svg>
        `;

          const encoded = encodeURIComponent(cursorSVG);

          const cursorURL = `data:image/svg+xml;utf8,${encoded}#${Date.now()}`;

          await view.executeJavaScript(`
          (() => {
            const old =
              document.getElementById("__navira_cursor");

            if (old) old.remove();

            const style = document.createElement("style");

            style.id = "__navira_cursor";

            style.textContent = \`
              * {
                cursor:
                  url("${cursorURL}") 2 2,
                  auto !important;
              }

              input,
              textarea {
                cursor: text !important;
              }

              button,
              a,
              [role="button"] {
                cursor: pointer !important;
              }
            \`;

            document.head.appendChild(style);
          })();
        `);

          console.log("cursor injected:", mode);
        } catch (err) {
          console.log("cursor injection failed:", err);
        }
      };

      /* =========================================
       APPLY CURSOR
    ========================================= */

      const applyCursorTheme = async () => {
        const mode = await detectTheme();

        injectCursor(mode);
      };

      /* =========================================
       EVENTS
    ========================================= */

      view.addEventListener("dom-ready", applyCursorTheme);

      view.addEventListener("did-stop-loading", applyCursorTheme);

      /* =========================================
       TAB META
    ========================================= */

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

      /* =========================================
       CLEANUP
    ========================================= */

      cleanups.push(() => {
        view.removeEventListener("dom-ready", applyCursorTheme);

        view.removeEventListener("did-stop-loading", applyCursorTheme);

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
