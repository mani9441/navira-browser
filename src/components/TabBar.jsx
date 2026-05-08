import { Plus, X } from "lucide-react";

import { useBrowserStore } from "../store/browserStore";
import { browser } from "../browser/BrowserAPI";

export default function TabBar() {
  const tabs = useBrowserStore((s) => s.tabs);
  const activeTabId = useBrowserStore((s) => s.activeTabId);

  return (
    <div className="tab-island">
      <div className="tabs-wrapper">
        <div className="tabs-scroll">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`modern-tab ${tab.id === activeTabId ? "active" : ""}`}
              onClick={() => browser.tabs.switch(tab.id)}
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
                onClick={(e) => {
                  e.stopPropagation();

                  browser.tabs.close(tab.id);
                }}
              />
            </div>
          ))}

          <button
            className="add-tab-pill"
            onClick={() => browser.tabs.create()}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="topbar-drag-space" />

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
  );
}
