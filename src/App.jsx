import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Plus,
  X,
  ShieldCheck,
  Star,
  MoreVertical,
} from "lucide-react";

const App = () => {
  // --- STATE ---
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const [themeMode, setThemeMode] = useState("dark");

  // --- INITIAL LOAD ---
  useEffect(() => {
    const initStore = async () => {
      const savedTabs = await window.electronAPI.getData("tabs");
      const savedActiveId = await window.electronAPI.getData("activeTabId");

      if (savedTabs && savedTabs.length > 0) {
        setTabs(savedTabs);
        setActiveTabId(savedActiveId || savedTabs[0].id);
        const active = savedTabs.find(
          (t) => t.id === (savedActiveId || savedTabs[0].id),
        );
        setUrlInput(active?.url || "https://www.google.com");
      } else {
        const initialTab = {
          id: Date.now(),
          url: "https://www.google.com",
          title: "Google",
          favicon: null,
          loading: false,
        };
        setTabs([initialTab]);
        setActiveTabId(initialTab.id);
        setUrlInput("https://www.google.com");
      }
      setIsLoaded(true);
    };
    initStore();
  }, []);

  // --- AUTO-SAVE ON CHANGE ---
  useEffect(() => {
    if (isLoaded) {
      const dataToSave = tabs.map(({ id, url, title }) => ({ id, url, title }));
      window.electronAPI.saveData("tabs", dataToSave);
      window.electronAPI.saveData("activeTabId", activeTabId);
    }
  }, [tabs, activeTabId, isLoaded]);

  // --- TAB LOGIC ---
  const addTab = (url = "https://www.google.com") => {
    const id = Date.now();
    setTabs([
      ...tabs,
      { id, url, title: "New Tab", favicon: null, loading: false },
    ]);
    setActiveTabId(id);
    setUrlInput(url);
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    const filtered = tabs.filter((t) => t.id !== id);
    if (filtered.length === 0) return addTab();
    setTabs(filtered);
    if (activeTabId === id) setActiveTabId(filtered[filtered.length - 1].id);
  };

  // --- NAVIGATION ---
  const handleNavigate = (e) => {
    if (e.key === "Enter") {
      let val = urlInput.trim();
      if (!val.includes(".") || val.includes(" ")) {
        val = `https://www.google.com/search?q=${encodeURIComponent(val)}`;
      } else if (!val.startsWith("http")) {
        val = `https://${val}`;
      }
      setTabs(tabs.map((t) => (t.id === activeTabId ? { ...t, url: val } : t)));
    }
  };

  // --- WEBVIEW EVENT LISTENERS ---
  useEffect(() => {
    if (!isLoaded) return;

    const views = document.querySelectorAll("webview");

    const cleanups = [];

    views.forEach((view) => {
      const viewId = parseInt(view.getAttribute("data-id"));

      /* =====================================================
       CUSTOM CURSOR INJECTION
    ===================================================== */

      const injectCursorCSS = async (mode) => {
        try {
          const cursorSVG =
            mode === "light"
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
        <path d="M6 4 Q4 4 4 7 L9 27 Q9.5 29 11 29 Q12.5 29 13 27 L18 17 L27 13 Q29 12.5 29 11 Q29 9.5 27 9 L7 4 Q6.5 4 6 4 Z" fill="black"/>
       </svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
        <path d="M6 4 Q4 4 4 7 L9 27 Q9.5 29 11 29 Q12.5 29 13 27 L18 17 L27 13 Q29 12.5 29 11 Q29 9.5 27 9 L7 4 Q6.5 4 6 4 Z" fill="white"/>
       </svg>`;

          const encodedSVG = encodeURIComponent(cursorSVG);

          // FORCE UNIQUE CURSOR URL
          const uniqueCursor = `data:image/svg+xml;utf8,${encodedSVG}#${Date.now()}`;

          await view.executeJavaScript(`
      (() => {
        const existing = document.getElementById("__custom_cursor_style");

        if (existing) existing.remove();

        const style = document.createElement("style");

        style.id = "__custom_cursor_style";

        style.textContent = \`
          * {
            cursor: url("${uniqueCursor}") 2 2, auto !important;
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

          console.log("Injected cursor:", mode);
        } catch (err) {
          console.log("Cursor injection failed:", err);
        }
      };

      /* =====================================================
       PAGE THEME DETECTION
    ===================================================== */

      const detectPageTheme = async () => {
        try {
          const brightness = await view.executeJavaScript(`
      (() => {
        function getBrightness(rgbString) {
          const rgb = rgbString.match(/\\d+/g);

          if (!rgb) return 0;

          const [r, g, b] = rgb.map(Number);

          return (r * 299 + g * 587 + b * 114) / 1000;
        }

        const bodyBg =
          getComputedStyle(document.body).backgroundColor;

        const htmlBg =
          getComputedStyle(document.documentElement).backgroundColor;

        const bodyBrightness = getBrightness(bodyBg);
        const htmlBrightness = getBrightness(htmlBg);

        return Math.max(bodyBrightness, htmlBrightness);
      })();
    `);

          return brightness > 150 ? "light" : "dark";
        } catch (err) {
          console.log(err);
          return "dark";
        }
      };
      /* =====================================================
       UPDATE TAB METADATA
    ===================================================== */

      const updateMetadata = () => {
        setTabs((prev) =>
          prev.map((t) => {
            if (t.id === viewId) {
              return {
                ...t,
                title: view.getTitle() || "New Tab",
                url: view.getURL() || t.url,
              };
            }

            return t;
          }),
        );

        if (activeTabId === viewId) {
          setUrlInput(view.getURL());
        }
      };

      /* =====================================================
       DOM READY
    ===================================================== */

      const handleDomReady = async () => {
        const mode = await detectPageTheme();

        setThemeMode(mode);

        injectCursorCSS(mode);
      };

      view.addEventListener("dom-ready", handleDomReady);

      /* =====================================================
       TITLE UPDATE
    ===================================================== */

      view.addEventListener("page-title-updated", updateMetadata);

      /* =====================================================
       URL UPDATE
    ===================================================== */

      view.addEventListener("did-navigate", updateMetadata);

      view.addEventListener("did-navigate-in-page", updateMetadata);

      /* =====================================================
       FAVICON
    ===================================================== */

      const handleFavicon = (e) => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === viewId
              ? {
                  ...t,
                  favicon: e.favicons?.[0] || null,
                }
              : t,
          ),
        );
      };

      view.addEventListener("page-favicon-updated", handleFavicon);

      /* =====================================================
       LOADING START
    ===================================================== */

      const handleStartLoading = () => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === viewId
              ? {
                  ...t,
                  loading: true,
                }
              : t,
          ),
        );
      };

      view.addEventListener("did-start-loading", handleStartLoading);

      /* =====================================================
       LOADING STOP
    ===================================================== */

      const handleStopLoading = async () => {
        setTabs((prev) =>
          prev.map((t) =>
            t.id === viewId
              ? {
                  ...t,
                  loading: false,
                }
              : t,
          ),
        );

        updateMetadata();

        const mode = await detectPageTheme();

        setThemeMode(mode);

        injectCursorCSS(mode);
      };

      view.addEventListener("did-stop-loading", handleStopLoading);

      /* =====================================================
       NEW WINDOW / TARGET=_BLANK
    ===================================================== */

      const handleNewWindow = (e) => {
        addTab(e.url);
      };

      view.addEventListener("new-window", handleNewWindow);

      /* =====================================================
       CLEANUP
    ===================================================== */

      cleanups.push(() => {
        view.removeEventListener("dom-ready", handleDomReady);

        view.removeEventListener("page-title-updated", updateMetadata);

        view.removeEventListener("did-navigate", updateMetadata);

        view.removeEventListener("did-navigate-in-page", updateMetadata);

        view.removeEventListener("page-favicon-updated", handleFavicon);

        view.removeEventListener("did-start-loading", handleStartLoading);

        view.removeEventListener("did-stop-loading", handleStopLoading);

        view.removeEventListener("new-window", handleNewWindow);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [tabs.length, activeTabId, isLoaded]);

  if (!isLoaded) return <div className="loading-screen" />;

  return (
    <div className="window-shell">
      <div
        className={`main-wrapper ${
          themeMode === "light" ? "theme-light" : "theme-dark"
        }`}
      >
        <div className="tab-island">
          {/* TABS SECTION */}
          <div className="tabs-wrapper">
            <div className="tabs-scroll">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`modern-tab ${
                    tab.id === activeTabId ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setUrlInput(tab.url);
                  }}
                >
                  {tab.favicon ? (
                    <img src={tab.favicon} className="tab-icon" />
                  ) : (
                    <div className="tab-icon-placeholder" />
                  )}

                  <span className="tab-text">{tab.title}</span>

                  <X
                    size={14}
                    className="close-icon"
                    onClick={(e) => closeTab(tab.id, e)}
                  />
                </div>
              ))}

              <button className="add-tab-pill" onClick={() => addTab()}>
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE EMPTY DRAG AREA */}
          <div className="topbar-drag" />

          {/* RIGHT ALIGNED TRAFFIC LIGHTS */}
          <div className="window-controls">
            <button
              onClick={() => window.electronAPI.minimize()}
              className="ctrl-btn min-btn"
            />

            <button
              onClick={() => window.electronAPI.maximize()}
              className="ctrl-btn max-btn"
            />

            <button
              onClick={() => window.electronAPI.close()}
              className="ctrl-btn close-btn"
            />
          </div>
        </div>

        <div className="control-island">
          <div className="nav-group">
            <button
              className="nav-btn"
              onClick={() => document.querySelector(".active-view")?.goBack()}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              className="nav-btn"
              onClick={() => document.querySelector(".active-view")?.reload()}
            >
              <RotateCw size={18} />
            </button>
          </div>
          <div className="search-bar-glass">
            <ShieldCheck size={16} color="var(--text-dim)" />
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={handleNavigate}
              placeholder="Search or enter URL"
            />
            <Star size={16} color="var(--text-dim)" />
          </div>
          <button className="nav-btn">
            <MoreVertical size={20} />
          </button>
          {activeTab?.loading && <div className="loading-bar" />}
        </div>

        <div className="content-viewport">
          {/* ONLY render webviews once isLoaded is true */}
          {isLoaded &&
            tabs.map((tab) => (
              <webview
                key={tab.id}
                data-id={tab.id}
                src={tab.url}
                className={tab.id === activeTabId ? "active-view" : ""}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  visibility: tab.id === activeTabId ? "visible" : "hidden",
                  background: "#fff",
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;
